export const QURAN_API_BASE = "https://quranapi.pages.dev/api";
export const ALQURAN_CLOUD_BASE = "https://api.alquran.cloud/v1";

export const RECITERS = [
  { id: "1", name: "Mishary Rashid Al Afasy", style: "Muratal", everyayahPath: "Alafasy_128kbps" },
  { id: "2", name: "Abu Bakr Al Shatri", style: "Muratal", everyayahPath: "Abu_Bakr_Ash-Shaatree_128kbps" },
  { id: "3", name: "Nasser Al Qatami", style: "Muratal", everyayahPath: "Nasser_Alqatami_128kbps" },
  { id: "4", name: "Yasser Al Dosari", style: "Muratal", everyayahPath: "Yasser_Ad-Dussary_128kbps" },
  { id: "5", name: "Hani Ar Rifai", style: "Muratal", everyayahPath: "Hani_Rifai_192kbps" },
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
  uzbek?: string[];
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
  const [mainRes, uzbekRes] = await Promise.all([
    fetch(`${QURAN_API_BASE}/${surahNumber}.json`),
    fetch(`${ALQURAN_CLOUD_BASE}/surah/${surahNumber}/uz.sodik`),
  ]);

  if (!mainRes.ok) throw new Error(`Failed to fetch surah ${surahNumber}`);
  const data = await mainRes.json();

  let uzbek: string[] | undefined;
  if (uzbekRes.ok) {
    const uzbekData = await uzbekRes.json();
    const ayahs: Array<{ text: string }> = uzbekData?.data?.ayahs ?? [];
    uzbek = ayahs.map((a) => a.text);
  }

  return { ...data, surahNo: surahNumber, uzbek };
}

export function getVerseAudioUrl(
  surahNumber: number,
  verseNumber: number,
  reciterId: string = "1"
): string {
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const paddedSurah = String(surahNumber).padStart(3, "0");
  const paddedVerse = String(verseNumber).padStart(3, "0");
  return `https://everyayah.com/data/${reciter.everyayahPath}/${paddedSurah}${paddedVerse}.mp3`;
}
