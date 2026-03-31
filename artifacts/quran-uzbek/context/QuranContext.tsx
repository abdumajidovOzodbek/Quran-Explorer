import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, ReadingMode, DisplayLanguage } from "@/types/quran";
import { cacheAllSurahsInBackground, isCacheComplete, TOTAL_SURAHS } from "@/constants/api";

const BOOKMARKS_KEY = "@quran_bookmarks";
const LAST_READ_KEY = "@quran_last_read";
const SETTINGS_KEY = "@quran_settings";
const COMPLETED_KEY = "@quran_completed_surahs";

interface LastRead {
  surahNo: number;
  surahName: string;
  ayahNo: number;
}

interface Settings {
  readingMode: ReadingMode;
  displayLanguage: DisplayLanguage;
  arabicFontSize: number;
  translationFontSize: number;
  reciterId: string;
  showTransliteration: boolean;
  showWordByWord: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  readingMode: "both",
  displayLanguage: "uzbek",
  arabicFontSize: 28,
  translationFontSize: 15,
  reciterId: "1",
  showTransliteration: false,
  showWordByWord: false,
};

function useQuranState() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [completedSurahs, setCompletedSurahs] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cacheProgress, setCacheProgress] = useState(0);
  const [isCacheDownloading, setIsCacheDownloading] = useState(false);
  const [isCacheDone, setIsCacheDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    startBackgroundCache();
  }, [isLoaded]);

  const startBackgroundCache = async () => {
    const complete = await isCacheComplete();
    if (complete) {
      setIsCacheDone(true);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setIsCacheDownloading(true);
    setCacheProgress(0);
    try {
      await cacheAllSurahsInBackground((cached, total) => {
        setCacheProgress(Math.round((cached / total) * 100));
      }, controller.signal);
      if (!controller.signal.aborted) {
        setIsCacheDone(true);
      }
    } finally {
      setIsCacheDownloading(false);
    }
  };

  const loadData = async () => {
    try {
      const [bkData, lrData, settingsData, completedData] = await Promise.all([
        AsyncStorage.getItem(BOOKMARKS_KEY),
        AsyncStorage.getItem(LAST_READ_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
        AsyncStorage.getItem(COMPLETED_KEY),
      ]);
      if (bkData) setBookmarks(JSON.parse(bkData));
      if (lrData) setLastRead(JSON.parse(lrData));
      if (settingsData) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) });
      if (completedData) setCompletedSurahs(JSON.parse(completedData));
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoaded(true);
    }
  };

  const addBookmark = useCallback(async (bookmark: Omit<Bookmark, "id" | "createdAt">) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    setBookmarks((prev) => {
      const updated = [newBookmark, ...prev.filter(
        (b) => !(b.surahNo === bookmark.surahNo && b.ayahNo === bookmark.ayahNo)
      )];
      AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeBookmark = useCallback(async (surahNo: number, ayahNo: number) => {
    setBookmarks((prev) => {
      const updated = prev.filter(
        (b) => !(b.surahNo === surahNo && b.ayahNo === ayahNo)
      );
      AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isBookmarked = useCallback((surahNo: number, ayahNo: number) => {
    return bookmarks.some((b) => b.surahNo === surahNo && b.ayahNo === ayahNo);
  }, [bookmarks]);

  const saveLastRead = useCallback(async (lr: LastRead) => {
    setLastRead(lr);
    await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(lr));
  }, []);

  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markSurahComplete = useCallback((surahNo: number) => {
    setCompletedSurahs((prev) => {
      if (prev.includes(surahNo)) return prev;
      const updated = [...prev, surahNo];
      AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unmarkSurahComplete = useCallback((surahNo: number) => {
    setCompletedSurahs((prev) => {
      const updated = prev.filter((n) => n !== surahNo);
      AsyncStorage.setItem(COMPLETED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isSurahComplete = useCallback((surahNo: number) => {
    return completedSurahs.includes(surahNo);
  }, [completedSurahs]);

  return {
    bookmarks,
    lastRead,
    settings,
    completedSurahs,
    isLoaded,
    cacheProgress,
    isCacheDownloading,
    isCacheDone,
    addBookmark,
    removeBookmark,
    isBookmarked,
    saveLastRead,
    updateSettings,
    markSurahComplete,
    unmarkSurahComplete,
    isSurahComplete,
  };
}

export const [QuranProvider, useQuran] = createContextHook(useQuranState, "QuranContext");
