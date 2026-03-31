import AsyncStorage from "@react-native-async-storage/async-storage";

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
  transliteration?: string[];
  wordByWord?: string[];
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

export interface VerseOfDay {
  surahNo: number;
  ayahNo: number;
  arabic: string;
  uzbek: string;
  surahName: string;
}

const SURAH_LIST_CACHE = "@surah_list_v2";
const surahCacheKey = (n: number) => `@surah_v2_${n}`;

export async function fetchSurahList(): Promise<SurahListItem[]> {
  try {
    const response = await fetch(`${QURAN_API_BASE}/surah.json`);
    if (!response.ok) throw new Error("Failed to fetch surah list");
    const data: SurahListItem[] = await response.json();
    const result = data.map((s, idx) => ({ ...s, surahNo: idx + 1 }));
    AsyncStorage.setItem(SURAH_LIST_CACHE, JSON.stringify(result)).catch(() => {});
    return result;
  } catch (err) {
    const cached = await AsyncStorage.getItem(SURAH_LIST_CACHE).catch(() => null);
    if (cached) return JSON.parse(cached);
    throw err;
  }
}

export async function fetchSurah(surahNumber: number): Promise<SurahApiData> {
  try {
    const [mainRes, uzbekRes, translitRes] = await Promise.all([
      fetch(`${QURAN_API_BASE}/${surahNumber}.json`),
      fetch(`${ALQURAN_CLOUD_BASE}/surah/${surahNumber}/uz.sodik`),
      fetch(`${ALQURAN_CLOUD_BASE}/surah/${surahNumber}/en.transliteration`),
    ]);

    if (!mainRes.ok) throw new Error(`Failed to fetch surah ${surahNumber}`);
    const data = await mainRes.json();

    let uzbek: string[] | undefined;
    if (uzbekRes.ok) {
      const uzbekData = await uzbekRes.json();
      const ayahs: Array<{ text: string }> = uzbekData?.data?.ayahs ?? [];
      uzbek = ayahs.map((a) => a.text);
    }

    let transliteration: string[] | undefined;
    if (translitRes.ok) {
      const translitData = await translitRes.json();
      const ayahs: Array<{ text: string }> = translitData?.data?.ayahs ?? [];
      transliteration = ayahs.map((a) => a.text);
    }

    const result: SurahApiData = { ...data, surahNo: surahNumber, uzbek, transliteration };
    AsyncStorage.setItem(surahCacheKey(surahNumber), JSON.stringify(result)).catch(() => {});
    return result;
  } catch (err) {
    const cached = await AsyncStorage.getItem(surahCacheKey(surahNumber)).catch(() => null);
    if (cached) return JSON.parse(cached);
    throw err;
  }
}

export async function fetchWordByWord(surahNumber: number): Promise<string[]> {
  try {
    const res = await fetch(`${ALQURAN_CLOUD_BASE}/surah/${surahNumber}/quran-wordbyword`);
    if (!res.ok) return [];
    const data = await res.json();
    const ayahs: Array<{ text: string }> = data?.data?.ayahs ?? [];
    return ayahs.map((a) => a.text);
  } catch {
    return [];
  }
}

export function parseWordByWord(text: string): { arabic: string; english: string }[] {
  if (!text) return [];
  return text
    .split("$")
    .map((s) => {
      const parts = s.split("|");
      return { arabic: parts[0] ?? "", english: parts[1] ?? "" };
    })
    .filter((w) => w.arabic.trim());
}

const DAILY_VERSES: [number, number][] = [
  [2, 255], [36, 1], [67, 1], [112, 1], [55, 13], [2, 286], [3, 26],
  [93, 1], [94, 1], [1, 1], [2, 2], [3, 185], [4, 1], [6, 162],
  [7, 156], [9, 128], [10, 62], [13, 28], [14, 7], [17, 44],
  [18, 10], [20, 14], [23, 1], [24, 35], [25, 74], [26, 89],
  [27, 62], [28, 88], [29, 45], [31, 17], [33, 56], [39, 53],
  [41, 30], [42, 11], [45, 12], [48, 29], [49, 13], [57, 4],
  [59, 22], [62, 1], [65, 3], [73, 1], [96, 1], [108, 1], [110, 1],
];

export async function fetchVerseOfDay(): Promise<VerseOfDay> {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const idx = dayOfYear % DAILY_VERSES.length;
  const [surahNo, ayahNo] = DAILY_VERSES[idx];

  const data = await fetchSurah(surahNo);
  const verseIdx = ayahNo - 1;
  return {
    surahNo,
    ayahNo,
    arabic: data.arabic1[verseIdx] ?? "",
    uzbek: data.uzbek?.[verseIdx] ?? data.english[verseIdx] ?? "",
    surahName: data.surahName,
  };
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  date: string;
  hijriDate: string;
  city: string;
}

export async function fetchPrayerTimes(lat: number, lon: number, city?: string): Promise<PrayerTimes> {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const url = `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lon}&method=4`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let res: Response;
  try {
    res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
  if (!res!.ok) throw new Error("Prayer times fetch failed");
  const json = await res.json();
  const timings = json?.data?.timings;
  const hijri = json?.data?.date?.hijri;

  return {
    Fajr: timings.Fajr,
    Sunrise: timings.Sunrise,
    Dhuhr: timings.Dhuhr,
    Asr: timings.Asr,
    Maghrib: timings.Maghrib,
    Isha: timings.Isha,
    date: `${day}/${month}/${year}`,
    hijriDate: hijri ? `${hijri.day} ${hijri.month.en} ${hijri.year}` : "",
    city: city ?? "Toshkent",
  };
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
