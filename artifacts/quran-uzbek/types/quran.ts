export interface SurahInfo {
  surahNo: number;
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  uzbekName?: string;
}

export interface Verse {
  surahNo: number;
  ayahNo: number;
  arabic1: string;
  arabic2?: string;
  english: string;
  uzbek?: string;
  sajda?: boolean;
}

export interface SurahData {
  surahNo: number;
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  verses?: {
    [key: string]: {
      arabic1: string;
      arabic2?: string;
      english: string;
      sajda?: boolean;
    };
  };
}

export interface Bookmark {
  id: string;
  surahNo: number;
  surahName: string;
  ayahNo: number;
  arabic: string;
  uzbek?: string;
  createdAt: number;
}

export type ReadingMode = "arabic-only" | "translation" | "both";
export type DisplayLanguage = "uzbek" | "english";
