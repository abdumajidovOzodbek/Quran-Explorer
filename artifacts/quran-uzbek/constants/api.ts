import AsyncStorage from "@react-native-async-storage/async-storage";

// All 114 surahs are bundled directly into the APK — no network or caching needed.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const QURAN_BUNDLE = require("../assets/data/quran_all.json") as {
  surahList: SurahListItem[];
  surahs: Record<string, SurahApiData>;
};

export const QURAN_API_BASE = "https://quranapi.pages.dev/api";
export const ALQURAN_CLOUD_BASE = "https://api.alquran.cloud/v1";

export const RECITERS = [
  {
    id: "1",
    name: "Mishary Rashid Al Afasy",
    nameRu: "Мишари Рашид аль-Афаси",
    nameUz: "Мишарий Рашид ал-Афасий",
    everyayahPath: "Alafasy_128kbps",
  },
  {
    id: "2",
    name: "Abu Bakr Al Shatri",
    nameRu: "Абу Бакр аш-Шатри",
    nameUz: "Абу Бакр аш-Шатрий",
    everyayahPath: "Abu_Bakr_Ash-Shaatree_128kbps",
  },
  {
    id: "3",
    name: "Nasser Al Qatami",
    nameRu: "Насер аль-Катами",
    nameUz: "Носир ал-Қатамий",
    everyayahPath: "Nasser_Alqatami_128kbps",
  },
  {
    id: "4",
    name: "Yasser Al Dosari",
    nameRu: "Ясер аль-Досари",
    nameUz: "Ёсир ад-Дўсарий",
    everyayahPath: "Yasser_Ad-Dussary_128kbps",
  },
  {
    id: "5",
    name: "Hani Ar Rifai",
    nameRu: "Хани ар-Рифаи",
    nameUz: "Ҳоний ар-Рифоий",
    everyayahPath: "Hani_Rifai_192kbps",
  },
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
  russian?: string[];
  transliteration?: string[];
  wordByWord?: string[];
  arabic1: string[];
  arabic2?: string[];
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
  russian?: string;
  english: string;
  surahName: string;
}

export const TOTAL_SURAHS = 114;

// ─── Bundled data access ────────────────────────────────────────────────────

/** All surah data is bundled — always complete, always instant. */
export function isCacheComplete(): Promise<boolean> {
  return Promise.resolve(true);
}

/** No-op: data is already bundled inside the APK. */
export async function cacheAllSurahsInBackground(
  onProgress: (downloaded: number, total: number) => void,
): Promise<void> {
  onProgress(TOTAL_SURAHS, TOTAL_SURAHS);
}

export async function fetchSurahList(): Promise<SurahListItem[]> {
  return QURAN_BUNDLE.surahList;
}

export async function fetchSurah(surahNumber: number): Promise<SurahApiData> {
  const data = QURAN_BUNDLE.surahs[String(surahNumber)];
  if (!data) throw new Error(`Surah ${surahNumber} not found in bundle`);
  return data;
}

// ─── Word-by-word (not bundled — fetched on demand) ─────────────────────────

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

// ─── Verse of the Day (uses bundled surah data) ──────────────────────────────

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
    uzbek: data.uzbek?.[verseIdx] ?? "",
    russian: data.russian?.[verseIdx],
    english: data.english[verseIdx] ?? "",
    surahName: data.surahName,
  };
}

// ─── Audio URL helper ────────────────────────────────────────────────────────

export function getVerseAudioUrl(
  surahNumber: number,
  verseNumber: number,
  reciterId: string = "1"
): string {
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  const paddedSurah = String(surahNumber).padStart(3, "0");
  const paddedVerse = String(verseNumber).padStart(3, "0");
  return `https://everyayah.com/data/${reciter!.everyayahPath}/${paddedSurah}${paddedVerse}.mp3`;
}

// ─── Prayer times (requires network, cached locally) ─────────────────────────

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

const PRAYER_CACHE_KEY = "@prayer_times_cache_v2";

export async function getCachedPrayerTimes(): Promise<PrayerTimes | null> {
  try {
    const stored = await AsyncStorage.getItem(PRAYER_CACHE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as PrayerTimes;
  } catch {
    return null;
  }
}

async function savePrayerTimesCache(data: PrayerTimes): Promise<void> {
  try {
    await AsyncStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(data));
  } catch {}
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

  const result: PrayerTimes = {
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

  await savePrayerTimesCache(result);
  return result;
}

// Legacy export — kept so existing import sites compile without changes
export const CACHE_COMPLETE_KEY = "@quran_cache_complete_v6";
