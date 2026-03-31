import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useState } from "react";
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

function useAudioState() {
  const [audio, setAudio] = useState<AudioState | null>(null);

  const playVerse = useCallback((params: AudioState) => {
    setAudio(params);
  }, []);

  const stopAudio = useCallback(() => {
    setAudio(null);
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

  return { audio, playVerse, stopAudio, playNext, playPrev };
}

export const [AudioProvider, useAudio] = createContextHook(useAudioState, "AudioContext");
