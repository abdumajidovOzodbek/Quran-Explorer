import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import { Bookmark, ReadingMode, DisplayLanguage } from "@/types/quran";

const BOOKMARKS_KEY = "@quran_bookmarks";
const LAST_READ_KEY = "@quran_last_read";
const SETTINGS_KEY = "@quran_settings";

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
}

const DEFAULT_SETTINGS: Settings = {
  readingMode: "both",
  displayLanguage: "uzbek",
  arabicFontSize: 28,
  translationFontSize: 15,
  reciterId: "1",
};

function useQuranState() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bkData, lrData, settingsData] = await Promise.all([
        AsyncStorage.getItem(BOOKMARKS_KEY),
        AsyncStorage.getItem(LAST_READ_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
      ]);
      if (bkData) setBookmarks(JSON.parse(bkData));
      if (lrData) setLastRead(JSON.parse(lrData));
      if (settingsData) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) });
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

  return {
    bookmarks,
    lastRead,
    settings,
    isLoaded,
    addBookmark,
    removeBookmark,
    isBookmarked,
    saveLastRead,
    updateSettings,
  };
}

export const [QuranProvider, useQuran] = createContextHook(useQuranState, "QuranContext");
