export interface JuzInfo {
  juzNo: number;
  name: string;
  startSurah: number;
  startAyah: number;
  surahs: number[];
}

export const JUZ_DATA: JuzInfo[] = [
  { juzNo: 1,  name: "Alif Lam Mim",    startSurah: 1,  startAyah: 1,   surahs: [1, 2] },
  { juzNo: 2,  name: "Sayaqul",          startSurah: 2,  startAyah: 142, surahs: [2] },
  { juzNo: 3,  name: "Tilkar-rusul",     startSurah: 2,  startAyah: 253, surahs: [2, 3] },
  { juzNo: 4,  name: "Lanthalu",         startSurah: 3,  startAyah: 93,  surahs: [3, 4] },
  { juzNo: 5,  name: "Wal-muhsanatu",    startSurah: 4,  startAyah: 24,  surahs: [4] },
  { juzNo: 6,  name: "La yuhibbu-llah",  startSurah: 4,  startAyah: 148, surahs: [4, 5] },
  { juzNo: 7,  name: "Wa idha samiu",    startSurah: 5,  startAyah: 82,  surahs: [5, 6] },
  { juzNo: 8,  name: "Wa lau annana",    startSurah: 6,  startAyah: 111, surahs: [6, 7] },
  { juzNo: 9,  name: "Qala-l-mala'u",   startSurah: 7,  startAyah: 88,  surahs: [7, 8] },
  { juzNo: 10, name: "Wa'lamu",          startSurah: 8,  startAyah: 41,  surahs: [8, 9] },
  { juzNo: 11, name: "Ya'tarizuna",      startSurah: 9,  startAyah: 93,  surahs: [9, 10, 11] },
  { juzNo: 12, name: "Wa maa min dabb",  startSurah: 11, startAyah: 6,   surahs: [11, 12] },
  { juzNo: 13, name: "Wa maa ubarri'u",  startSurah: 12, startAyah: 53,  surahs: [12, 13, 14] },
  { juzNo: 14, name: "Rubama",           startSurah: 15, startAyah: 1,   surahs: [15, 16] },
  { juzNo: 15, name: "Subhana-llazi",    startSurah: 17, startAyah: 1,   surahs: [17, 18] },
  { juzNo: 16, name: "Qala alam",        startSurah: 18, startAyah: 75,  surahs: [18, 19, 20] },
  { juzNo: 17, name: "Iqtaraba",         startSurah: 21, startAyah: 1,   surahs: [21, 22] },
  { juzNo: 18, name: "Qad aflaha",       startSurah: 23, startAyah: 1,   surahs: [23, 24, 25] },
  { juzNo: 19, name: "Wa qala-llazina",  startSurah: 25, startAyah: 21,  surahs: [25, 26, 27] },
  { juzNo: 20, name: "Amman khalaq",     startSurah: 27, startAyah: 56,  surahs: [27, 28, 29] },
  { juzNo: 21, name: "Utlu ma uhiya",    startSurah: 29, startAyah: 46,  surahs: [29, 30, 31, 32, 33] },
  { juzNo: 22, name: "Wa man yaqnut",    startSurah: 33, startAyah: 31,  surahs: [33, 34, 35, 36] },
  { juzNo: 23, name: "Wa mali",          startSurah: 36, startAyah: 28,  surahs: [36, 37, 38, 39] },
  { juzNo: 24, name: "Fa man azlam",     startSurah: 39, startAyah: 32,  surahs: [39, 40, 41] },
  { juzNo: 25, name: "Ilayhi yuraddu",   startSurah: 41, startAyah: 47,  surahs: [41, 42, 43, 44, 45] },
  { juzNo: 26, name: "Ha Mim",           startSurah: 46, startAyah: 1,   surahs: [46, 47, 48, 49, 50, 51] },
  { juzNo: 27, name: "Qala fa maa",      startSurah: 51, startAyah: 31,  surahs: [51, 52, 53, 54, 55, 56, 57] },
  { juzNo: 28, name: "Qad sami'alloh",   startSurah: 58, startAyah: 1,   surahs: [58, 59, 60, 61, 62, 63, 64, 65, 66] },
  { juzNo: 29, name: "Tabaraka-llazi",   startSurah: 67, startAyah: 1,   surahs: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77] },
  { juzNo: 30, name: "Amma",             startSurah: 78, startAyah: 1,   surahs: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114] },
];

export function getJuzNavAyah(juzNo: number, surahNo: number): number {
  const juz = JUZ_DATA[juzNo - 1];
  if (juz && juz.startSurah === surahNo && juz.startAyah > 1) {
    return juz.startAyah;
  }
  return 1;
}

export function getJuzSurahRange(juzNo: number): { startSurah: number; endSurah: number } {
  const juz = JUZ_DATA[juzNo - 1];
  if (!juz) return { startSurah: 1, endSurah: 114 };
  const surahList = juz.surahs;
  return {
    startSurah: surahList[0] ?? juz.startSurah,
    endSurah: surahList[surahList.length - 1] ?? 114,
  };
}
