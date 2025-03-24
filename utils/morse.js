import { AudioContext } from "react-native-audio-api";
import { from, last, map, scan, zip } from "rxjs";

const fromArray = (arr) => from(arr);

const BEAT_TIME_SECONDS = .35294 / 2; // 170bpm * 2

const REPEAT_COUNT = 1000; // gives 1 hour playtime

const a$ = fromArray('X XX  X XX  X XX  '.repeat(REPEAT_COUNT).split(''));
const n$ = fromArray(' X  XX X  XX X  XX'.repeat(REPEAT_COUNT).split(''));

const isWhitespace = value => !/\w/.test(value); // \s doesn't match empty string

const aGain$ = a$.pipe(
    map(char => isWhitespace(char) ? 0 : 1),
);

const nGain$ = n$.pipe(
    map(char => isWhitespace(char) ? 0 : 1),
);

const aTime$ = a$.pipe(
    map(() => BEAT_TIME_SECONDS),
    scan((acc, d) => (acc * 10 + d * 10) / 10, 0), // floating point math https://www.codemag.com/article/1811041/JavaScript-Corner-Math-and-the-Pitfalls-of-Floating-Point-Numbers
);

const nTime$ = n$.pipe(
    map(() => BEAT_TIME_SECONDS),
    scan((acc, d) => (acc * 10 + d * 10) / 10), // floating point math https://www.codemag.com/article/1811041/JavaScript-Corner-Math-and-the-Pitfalls-of-Floating-Point-Numbers
);

const aNodeValue$ = zip(aGain$, aTime$);
const nNodeValue$ = zip(nGain$, nTime$);
const last$ = aTime$.pipe(last());


let context = null;
let aNode = null;
let bNode = null;

export const start = () => {
    context = new AudioContext();
    
    const initialTime = context.currentTime;
    
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 440; // or 600
    
    const oscillator2 = context.createOscillator();
    oscillator2.type = "sine";
    oscillator2.frequency.value = 440; // or 600
    
    const volumeGainNodeA = context.createGain();
    volumeGainNodeA.gain.setValueAtTime(1, initialTime);
    
    const codeGainNodeA = context.createGain();
    aNodeValue$.subscribe(([value, time]) => {
        codeGainNodeA.gain.setValueAtTime(value, initialTime + time);
    });
    
    const volumeGainNodeN = context.createGain();
    volumeGainNodeN.gain.setValueAtTime(.5, initialTime);
    
    const codeGainNodeN = context.createGain();
    nNodeValue$.subscribe(([value, time]) => {
        codeGainNodeN.gain.setValueAtTime(value, initialTime + time);
    });

    oscillator.connect(codeGainNodeA)
    codeGainNodeA.connect(volumeGainNodeA);
    volumeGainNodeA.connect(context.destination);
    
    oscillator2.connect(codeGainNodeN);
    codeGainNodeN.connect(volumeGainNodeN);
    volumeGainNodeN.connect(context.destination);
    
    oscillator.start(0);
    oscillator2.start(0);

    last$.subscribe(lastTimeSeconds => {
        oscillator.stop(initialTime + lastTimeSeconds);
        oscillator2.stop(initialTime + lastTimeSeconds);
    });

    aNode = volumeGainNodeA;
    nNode = volumeGainNodeN;
};

export const stop = () => context.close();

export const setAValue = (value) => aNode.gain.setValueAtTime(value, context.currentTime);
export const setNValue = (value) => nNode.gain.setValueAtTime(value, context.currentTime);