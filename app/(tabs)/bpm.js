import { useRef, useState } from "react";
import { Text, View } from "react-native";

// const beatElement = document.getElementById('beat');

// let values = [];
// const MAX_AVERAGE = 5;
// function computeAverage(nextValue) {
//     values.unshift(nextValue);
//     if (values.length > MAX_AVERAGE) {
//         values.pop();
//     }

//     const average = values.reduce((acc, d) => acc + d) / values.length;
//     return Math.round(average);
// }

// let previousClick = null;
// beatElement.addEventListener('click', () => {
//     if (!previousClick) {
//         previousClick = new Date();
//         beatElement.innerText = 'Tap again';
//         return;
//     }

//     const secondsElapsed = (new Date() - previousClick) / 1000;
//     const beatsPerSecond = 1 / secondsElapsed;
//     const beatsPerMinute = Math.round(beatsPerSecond * 60);

//     const averageBpm = computeAverage(beatsPerMinute)

//     beatElement.innerText = `${averageBpm} bpm`;

//     previousClick = new Date();
// });


function computeAverage(values) {
    const average = values.reduce((acc, d) => acc + d, 0) / values.length;
    return Math.round(average);
}

export default function Bpm() {
    const [values, setValues] = useState([0]);
    const previousClickRef = useRef();

    const onClick = () => {
        if (!previousClickRef.current) {
            previousClickRef.current = new Date();
            return;
        }
        const secondsElapsed = (new Date() - previousClickRef.current) / 1000;
        const beatsPerSecond = 1 / secondsElapsed;
        const beatsPerMinute = Math.round(beatsPerSecond * 60);

        previousClickRef.current = new Date();
        setValues(v => [...v.slice(-4), beatsPerMinute]);
    }

    const average = computeAverage(values);

    return <View style={{flex: 1, background: 'blue', justifyContent: 'center', alignItems: 'center'}} onTouchStart={onClick}><Text>{average}</Text></View>;
};