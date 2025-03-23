import { BehaviorSubject, bufferCount, filter, map, share } from 'rxjs';
import { defineTask } from 'expo-task-manager';
import {
    requestBackgroundPermissionsAsync,
    requestForegroundPermissionsAsync,
    startLocationUpdatesAsync,
    stopLocationUpdatesAsync,
    Accuracy,
} from 'expo-location';

const TASK_NAME = 'pacer.location';

const locationSubject$ = new BehaviorSubject();

defineTask(TASK_NAME, ({ data: { locations }, error }) => {
    if (error) {
        locationSubject$.error(e.message)
        return;
    }

    const mostRecentLocation = locations[0];

    const { timestamp, coords } = mostRecentLocation;

    locationSubject$.next({
        timestamp,
        accuracy: coords.accuracy,
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        speed: coords.speed,
    });
});

export const requestPermission = async () => {
    const { status: foregroundStatus } = await requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
        console.error('Foreground status not granted');
        return;
    }

    const { status: backgroundStatus } = await requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
        console.error('Background status not granted');
        return;
    }

    await startLocationUpdatesAsync(TASK_NAME, {
        accuracy: Accuracy.Highest,
        timeInterval: 5000,
        distanceInterval: 0,
    });
};

export const stopGeolocation = () => stopLocationUpdatesAsync(TASK_NAME);

export const location$ = locationSubject$.asObservable();

const average = values => values.reduce((acc, d) => acc + d) / values.length;
const metersPerSecondToMilesPerHour = speed => speed * 2.23694;

export const averageSpeed$ = location$.pipe(
    filter(Boolean),
    map(({ speed }) => speed),
    filter(speed => speed !== null),
    bufferCount(3, 1),
    map(average),
    map(metersPerSecondToMilesPerHour),
    share(),
);
