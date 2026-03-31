import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getVerseAudioUrl } from "@/constants/api";

export interface AudioState {
  surahNo: number;
  ayahNo: number;
  surahName: string;
  totalVerses: number;
  reciterId: string;
  reciterName: string;
  audioUrl: string;
}

export type SleepTimerMinutes = 15 | 30 | 60;
const SLEEP_OPTIONS: Array<SleepTimerMinutes | null> = [null, 15, 30, 60];

function useAudioState() {
  const [audio, setAudio] = useState<AudioState | null>(null);
  const [sleepMinutes, setSleepMinutes] = useState<SleepTimerMinutes | null>(null);
  const [sleepEndTime, setSleepEndTime] = useState<number | null>(null);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (sleepEndTime === null) {
      setSleepSecondsLeft(null);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.round((sleepEndTime - Date.now()) / 1000));
      setSleepSecondsLeft(remaining);
      if (remaining === 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        setTimeout(() => {
          setSleepMinutes(null);
          setSleepEndTime(null);
          setSleepSecondsLeft(null);
          setAudio(null);
        }, 100);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sleepEndTime]);

  useEffect(() => {
    if (audio === null && sleepEndTime !== null) {
      setSleepMinutes(null);
      setSleepEndTime(null);
      setSleepSecondsLeft(null);
    }
  }, [audio]);

  const cycleSleepTimer = useCallback(() => {
    setSleepMinutes((prev) => {
      const idx = SLEEP_OPTIONS.indexOf(prev);
      const next = SLEEP_OPTIONS[(idx + 1) % SLEEP_OPTIONS.length] ?? null;
      if (next === null) {
        setSleepEndTime(null);
        setSleepSecondsLeft(null);
      } else {
        setSleepEndTime(Date.now() + next * 60 * 1000);
      }
      return next;
    });
  }, []);

  const cancelSleepTimer = useCallback(() => {
    setSleepMinutes(null);
    setSleepEndTime(null);
    setSleepSecondsLeft(null);
  }, []);

  const playVerse = useCallback((params: AudioState) => {
    setAudio(params);
  }, []);

  const stopAudio = useCallback(() => {
    setAudio(null);
    setSleepMinutes(null);
    setSleepEndTime(null);
    setSleepSecondsLeft(null);
  }, []);

  const playNext = useCallback(() => {
    setAudio((prev) => {
      if (!prev || prev.ayahNo >= prev.totalVerses) return null;
      const nextAyah = prev.ayahNo + 1;
      return {
        ...prev,
        ayahNo: nextAyah,
        audioUrl: getVerseAudioUrl(prev.surahNo, nextAyah, prev.reciterId),
      };
    });
  }, []);

  const playPrev = useCallback(() => {
    setAudio((prev) => {
      if (!prev || prev.ayahNo <= 1) return prev;
      const prevAyah = prev.ayahNo - 1;
      return {
        ...prev,
        ayahNo: prevAyah,
        audioUrl: getVerseAudioUrl(prev.surahNo, prevAyah, prev.reciterId),
      };
    });
  }, []);

  return {
    audio,
    sleepMinutes,
    sleepSecondsLeft,
    cycleSleepTimer,
    cancelSleepTimer,
    playVerse,
    stopAudio,
    playNext,
    playPrev,
  };
}

export const [AudioProvider, useAudio] = createContextHook(useAudioState, "AudioContext");
