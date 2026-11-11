/** React 端訂閱朗讀狀態（正在朗讀、可能被擋下、最後一次結果），見 lib/speech.ts */
import { useSyncExternalStore } from 'react';
import { getSpeechState, subscribeSpeech } from './speech';

export const useSpeechState = () => useSyncExternalStore(subscribeSpeech, getSpeechState, getSpeechState);
