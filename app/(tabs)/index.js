import { useEffect, useState } from "react";
import { Button, Text, View, StyleSheet } from "react-native";
import { setAValue, setNValue, start, stop } from '../../utils/morse';
import { requestPermission, averageSpeed$ } from '../../utils/geolocation';
import { map } from "rxjs";

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  minute: '2-digit',
  second: '2-digit',
  hour12: false     // setting 24 hour format 
});
const formatTime = (minutes, seconds) => {
  const date = new Date('2020-01-01T00:00:00Z');
  date.setMinutes(minutes);
  date.setSeconds(seconds);
  return timeFormatter.format(date);
};

const mphFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
  style: 'unit',
  unit: 'mile-per-hour',
});
const formatMph = (value) => mphFormatter.format(value)

const formatMinutesPerMile = (value) => {
  if (value === 0) {
    return '00:00';
  }
  const minutesPerMile = (60 / value);
  const minutes = Math.floor(minutesPerMile);
  const decimal = minutesPerMile - minutes;
  const seconds = decimal * 60;
  return formatTime(minutes, seconds);
}

const TARGET_SPEED = 8;

const SPEED_RANGE = 3; // 3 above, 3 below

const styles = StyleSheet.create({
  speed: {
    fontFamily: 'Menlo',
    fontSize: 82,
    color: 'white',
    textShadowColor: 'rgb(40, 67, 130)',
    textShadowOffset: { width: 4, height: 3 },
    textShadowRadius: 1,
  },
  targetSpeed: {
    fontFamily: 'Menlo',
    fontSize: 42,
    color: 'white',
    textShadowColor: 'rgb(40, 67, 130)',
    textShadowOffset: { width: 4, height: 3 },
    textShadowRadius: 1,
  },
});


const clamp = (start, end, value) => {
  const range = [start, end];
  const spread = range[1] - range[0];
  const normalizedDifference = Math.min(Math.max(range[0], value), range[1]) / spread;
  return normalizedDifference;
}

const toStatusColor = (normalizedValue) => {
  if (normalizedValue > 1.05) {
      return 'blue';
  }

  if (normalizedValue > .95) {
      return 'green';
  }

  if (normalizedValue > .75) {
      return 'yellow';
  }

  return 'red';
}

export default function Index() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(0);
  const [targetSpeed, setTargetSpeed] = useState(TARGET_SPEED);
  const [backgroundColor, setBackgroundColor] = useState(toStatusColor(TARGET_SPEED));

  useEffect(() => {
    requestPermission();

    start();

    return () => {
      stop();
    }
  }, []);

  useEffect(() => {
    console.log('NEW COLOR SETTER');
    const subscription = averageSpeed$.pipe(
        map(speed => targetSpeed - speed),
        map(value => clamp(0, 3, value)),
        map(value => 1 - value),
        map(value => toStatusColor(value)),
    ).subscribe(color => {
        console.log('SET COLOR', color);
        setBackgroundColor(color);
    });

    return () => subscription.unsubscribe();
  }, [targetSpeed, speed]);

  useEffect(() => {
    const subscriptions = [
      averageSpeed$.subscribe(s => setSpeed(s)),

      averageSpeed$.pipe(
        map((speed) => speed - targetSpeed),
        map(difference => difference / SPEED_RANGE),
        map(ratio => Math.max(-1, Math.min(ratio, 1))),
        map(clamped => .5 + clamped * .5),
      ).subscribe((normalizedValue) => {
        const aValue = normalizedValue;
        const nValue = 1 - normalizedValue;

        setAValue(aValue);
        setNValue(nValue);
      }),
    ];

    return () => subscriptions.forEach(s => s.unsubscribe());
  },[targetSpeed]);

  const onPressMinus = () => {
    setTargetSpeed(value => value - .1);
  };
  const onPressPlus = () => {
    setTargetSpeed(value => value + .1);
  };
  const onPressPause = () => {
    setIsPlaying(value => {
      const newValue = !value;

      if (newValue) {
        start();
      } else {
        stop();
      }

      return newValue;
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor,
      }}
    >
      <Text style={styles.speed}>{formatMph(speed.toFixed(1))}</Text>
      <Text style={styles.speed}>{formatMinutesPerMile(speed)}</Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Button
          onPress={onPressMinus}
          title="Run Slower"
          color="#000000"
          accessibilityLabel="Decrease by one"
        />
        <Text style={styles.targetSpeed}>{targetSpeed}mph</Text>
        <Button
          onPress={onPressPlus}
          title="Run Faster"
          color="#000000"
          accessibilityLabel="Increase by one"
        />
      </View>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Button
          onPress={onPressPause}
          title={isPlaying ? "Pause audio" : "Play audio"}
          color="#000000"
          accessibilityLabel="Toggle audio"
        />
      </View>
    </View>
  );
}
