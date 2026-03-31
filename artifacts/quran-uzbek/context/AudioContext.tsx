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
const FADE_DURATION_MS = 5000;

function useAudioState() {
  const [audio, setAudio] = useState<AudioState | null>(null);
  const [sleepMinutes, setSleepMinutes] = useState<SleepTimerMinutes | null>(null);
  const [sleepEndTime, setSleepEndTime] = useState<number | null>(null);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);
  const [isFading, setIsFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopAudioRef = useRef<() => void>(() => {});

  const stopAudio = useCallback(() => {
    if (fadeStopRef.current) clearTimeout(fadeStopRef.current);
    setAudio(null);
    setSleepMinutes(null);
    setSleepEndTime(null);
    setSleepSecondsLeft(null);
    setIsFading(false);
  }, []);

  stopAudioRef.current = stopAudio;

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
        setIsFading(true);
        setSleepMinutes(null);
        setSleepEndTime(null);
        setSleepSecondsLeft(null);
        fadeStopRef.current = setTimeout(() => {
          stopAudioRef.current();
        }, FADE_DURATION_MS + 200);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sleepEndTime]);

  useEffect(() => {
    if (audio === null) {
      setSleepMinutes(null);
      setSleepEndTime(null);
      setSleepSecondsLeft(null);
      setIsFading(false);
      if (fadeStopRef.current) clearTimeout(fadeStopRef.current);
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
    setIsFading(false);
    if (fadeStopRef.current) clearTimeout(fadeStopRef.current);
  }, []);

  const playVerse = useCallback((params: AudioState) => {
    setAudio(params);
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
    isFading,
    cycleSleepTimer,
    cancelSleepTimer,
    stopAudio,
    playVerse,
    playNext,
    playPrev,
  };
}

export const [AudioProvider, useAudio] = createContextHook(useAudioState, "AudioContext");
