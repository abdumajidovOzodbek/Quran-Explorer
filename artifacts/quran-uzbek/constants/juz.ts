export interface JuzInfo {
  juzNo: number;
  name: string;
  startSurah: number;
  startAyah: number;
}

export const JUZ_DATA: JuzInfo[] = [
  { juzNo: 1,  name: "Alif Lam Mim",    startSurah: 1,  startAyah: 1 },
  { juzNo: 2,  name: "Sayaqul",          startSurah: 2,  startAyah: 142 },
  { juzNo: 3,  name: "Tilkar-rusul",     startSurah: 2,  startAyah: 253 },
  { juzNo: 4,  name: "Lanthalu",         startSurah: 3,  startAyah: 93 },
  { juzNo: 5,  name: "Wal-muhsanatu",    startSurah: 4,  startAyah: 24 },
  { juzNo: 6,  name: "La yuhibbu-llah",  startSurah: 4,  startAyah: 148 },
  { juzNo: 7,  name: "Wa idha samiu",    startSurah: 5,  startAyah: 82 },
  { juzNo: 8,  name: "Wa lau annana",    startSurah: 6,  startAyah: 111 },
  { juzNo: 9,  name: "Qala-l-mala'u",   startSurah: 7,  startAyah: 88 },
  { juzNo: 10, name: "Wa'lamu",          startSurah: 8,  startAyah: 41 },
  { juzNo: 11, name: "Ya'tarizuna",      startSurah: 9,  startAyah: 93 },
  { juzNo: 12, name: "Wa maa min dabb",  startSurah: 11, startAyah: 6 },
  { juzNo: 13, name: "Wa maa ubarri'u",  startSurah: 12, startAyah: 53 },
  { juzNo: 14, name: "Rubama",           startSurah: 15, startAyah: 1 },
  { juzNo: 15, name: "Subhana-llazi",    startSurah: 17, startAyah: 1 },
  { juzNo: 16, name: "Qala alam",        startSurah: 18, startAyah: 75 },
  { juzNo: 17, name: "Iqtaraba",         startSurah: 21, startAyah: 1 },
  { juzNo: 18, name: "Qad aflaha",       startSurah: 23, startAyah: 1 },
  { juzNo: 19, name: "Wa qala-llazina",  startSurah: 25, startAyah: 21 },
  { juzNo: 20, name: "Amman khalaq",     startSurah: 27, startAyah: 56 },
  { juzNo: 21, name: "Utlu ma uhiya",    startSurah: 29, startAyah: 46 },
  { juzNo: 22, name: "Wa man yaqnut",    startSurah: 33, startAyah: 31 },
  { juzNo: 23, name: "Wa mali",          startSurah: 36, startAyah: 28 },
  { juzNo: 24, name: "Fa man azlam",     startSurah: 39, startAyah: 32 },
  { juzNo: 25, name: "Ilayhi yuraddu",   startSurah: 41, startAyah: 47 },
  { juzNo: 26, name: "Ha Mim",           startSurah: 46, startAyah: 1 },
  { juzNo: 27, name: "Qala fa maa",      startSurah: 51, startAyah: 31 },
  { juzNo: 28, name: "Qad sami'alloh",   startSurah: 58, startAyah: 1 },
  { juzNo: 29, name: "Tabaraka-llazi",   startSurah: 67, startAyah: 1 },
  { juzNo: 30, name: "Amma",             startSurah: 78, startAyah: 1 },
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
  const nextJuz = JUZ_DATA[juzNo];
  let endSurah: number;
  if (!nextJuz) {
    endSurah = 114;
  } else if (nextJuz.startAyah > 1) {
    endSurah = nextJuz.startSurah;
  } else {
    endSurah = nextJuz.startSurah - 1;
  }
  return {
    startSurah: juz?.startSurah ?? 1,
    endSurah,
  };
}
