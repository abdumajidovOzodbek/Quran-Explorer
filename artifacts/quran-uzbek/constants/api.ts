export const QURAN_API_BASE = "https://quranapi.pages.dev/api";

export const RECITERS = [
  { id: "1", name: "Mishary Rashid Al Afasy", style: "Muratal" },
  { id: "2", name: "Abu Bakr Al Shatri", style: "Muratal" },
  { id: "3", name: "Nasser Al Qatami", style: "Muratal" },
  { id: "4", name: "Yasser Al Dosari", style: "Muratal" },
  { id: "5", name: "Hani Ar Rifai", style: "Muratal" },
];

export const DEFAULT_RECITER = RECITERS[0];

export interface SurahApiData {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo?: number;
  english: string[];
  arabic1: string[];
  arabic2?: string[];
  audio: Record<string, { reciter: string; url: string; originalUrl: string }>;
}

export interface SurahListItem {
  surahName: string;
  surahNameArabic: string;
  surahNameArabicLong: string;
  surahNameTranslation: string;
  revelationPlace: string;
  totalAyah: number;
  surahNo?: number;
}

export async function fetchSurahList(): Promise<SurahListItem[]> {
  const response = await fetch(`${QURAN_API_BASE}/surah.json`);
  if (!response.ok) throw new Error("Failed to fetch surah list");
  const data: SurahListItem[] = await response.json();
  return data.map((s, idx) => ({ ...s, surahNo: idx + 1 }));
}

export async function fetchSurah(surahNumber: number): Promise<SurahApiData> {
  const response = await fetch(`${QURAN_API_BASE}/${surahNumber}.json`);
  if (!response.ok) throw new Error(`Failed to fetch surah ${surahNumber}`);
  const data = await response.json();
  return { ...data, surahNo: surahNumber };
}

export function getSurahAudioUrl(surahNumber: number, reciterId: string = "1"): string {
  const paddedSurah = String(surahNumber).padStart(3, "0");
  return `https://github.com/The-Quran-Project/Quran-Audio-Chapters/raw/refs/heads/main/Data/${reciterId}/${surahNumber}.mp3`;
}

export function getVerseAudioUrl(surahNumber: number, verseNumber: number, reciterId: string = "1"): string {
  const paddedSurah = String(surahNumber).padStart(3, "0");
  const paddedVerse = String(verseNumber).padStart(3, "0");
  return `https://cdn.islamicnetwork.com/quran.com/ar.alafasy/${paddedSurah}${paddedVerse}.mp3`;
}
