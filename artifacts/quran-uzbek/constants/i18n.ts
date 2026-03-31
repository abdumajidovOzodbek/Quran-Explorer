import { AppLanguage } from "@/types/quran";

export interface I18nStrings {
  tabQuran: string;
  tabSearch: string;
  tabBookmarks: string;
  tabPrayer: string;
  tabTasbih: string;
  tabSettings: string;
  greeting: string;
  readingProgress: string;
  verseOfDay: string;
  continueReading: string;
  library: string;
  duas: string;
  allSurahs: string;
  byJuz: string;
  allFilter: string;
  makkah: string;
  madinah: string;
  surahs: string;
  juzs: string;
  verse: string;
  surah: string;
  juz: string;
  searchPlaceholder: string;
  networkError: string;
  retry: string;
  khatmah: string;
  searchTitle: string;
  searchInputPlaceholder: string;
  popularSurahs: string;
  notFound: string;
  notFoundDesc: (q: string) => string;
  bookmarksTitle: string;
  savedVerses: (n: number) => string;
  noBookmarks: string;
  noBookmarksDesc: string;
  prayerTitle: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextPrayer: string;
  prayerPast: string;
  notPrayerTime: string;
  prayerError: string;
  enableNotif: string;
  hijri: string;
  hours: string;
  minutes: string;
  remaining: string;
  tasbih: string;
  qibla: string;
  tap: string;
  resetCounter: string;
  resetConfirm: string;
  cancel: string;
  confirmReset: string;
  times: string;
  target: string;
  custom: string;
  completed: string;
  qiblaDirection: string;
  qiblaPermission: string;
  dhikrSubhanallah: string;
  dhikrAlhamdulillah: string;
  dhikrAllahuAkbar: string;
  dhikrLaIlaha: string;
  dhikrAstaghfirullah: string;
  settingsTitle: string;
  surahsRead: (n: number) => string;
  readingMode: string;
  readingModeBoth: string;
  readingModeArabicOnly: string;
  readingModeTranslationOnly: string;
  recitationSettings: string;
  transliteration: string;
  transliterationDesc: string;
  wordByWord: string;
  wordByWordDesc: string;
  arabicFontSize: string;
  translationFontSize: string;
  language: string;
  reciterTitle: string;
  offlineCache: string;
  offlineReady: string;
  offlineReadyDesc: string;
  downloading: string;
  downloadingDesc: (n: number) => string;
  waitingNetwork: string;
  waitingNetworkDesc: string;
  dataSource: string;
  loading: string;
  markComplete: string;
  markCompleted: string;
  khatmahTitle: string;
  khatmahMessage: string;
  close: string;
  newKhatmah: string;
  refresh: string;
  methodNote: string;
  tasbihRepeated: (completed: number, target: number) => string;
  enterNumber: string;
  other: string;
  compassN: string;
  compassE: string;
  compassS: string;
  compassW: string;
  lastReadBadge: string;
}

const uz_cyrillic: I18nStrings = {
  tabQuran: "Қуръон",
  tabSearch: "Қидириш",
  tabBookmarks: "Хатчўп",
  tabPrayer: "Намоз",
  tabTasbih: "Тасбеҳ",
  tabSettings: "Созламалар",
  greeting: "Ассалому алайкум",
  readingProgress: "Ўқиш тараққиёти",
  verseOfDay: "Кунлик оят",
  continueReading: "Давом этиш",
  library: "КУТУБХОНА",
  duas: "Дуолар",
  allSurahs: "БАРЧА СУРАЛАР",
  byJuz: "ЖУЗЛАР БЎЙИЧА",
  allFilter: "Барчаси",
  makkah: "Макка",
  madinah: "Мадина",
  surahs: "Суралар",
  juzs: "Жузлар",
  verse: "оят",
  surah: "сура",
  juz: "жуз",
  searchPlaceholder: "Сура номи ёки рақами...",
  networkError: "Интернетга уланишда хатолик",
  retry: "Қайта уриниш",
  khatmah: "хатм",
  searchTitle: "Қидириш",
  searchInputPlaceholder: "Сура номи, рақами ёки арабча...",
  popularSurahs: "Машҳур Суралар",
  notFound: "Топилмади",
  notFoundDesc: (q) => `"${q}" сўзи бўйича ҳеч нарса топилмади`,
  bookmarksTitle: "Хатчўплар",
  savedVerses: (n) => `${n} та сақланган оят`,
  noBookmarks: "Хатчўп йўқ",
  noBookmarksDesc: "Сура ўқиётганда оятларни хатчўп қилиб сақлашингиз мумкин",
  prayerTitle: "Намоз вақтлари",
  fajr: "Бомдод",
  sunrise: "Қуёш",
  dhuhr: "Пешин",
  asr: "Аср",
  maghrib: "Шом",
  isha: "Хуфтон",
  nextPrayer: "Кейинги намоз",
  prayerPast: "Ўтди",
  notPrayerTime: "Намоз вақти эмас",
  prayerError: "Намоз вақтларини юклашда хатолик юз берди.",
  enableNotif: "Қўнғироқ белгисини босиб билдиришномани ёқинг",
  hijri: "Ҳижрий",
  hours: "соат",
  minutes: "дақиқа",
  remaining: "қолди",
  tasbih: "Тасбеҳ",
  qibla: "Қибла",
  tap: "босинг",
  resetCounter: "Ҳисобни нолга қайтариш",
  resetConfirm: "Жорий ҳисобни нолга қайтарасизми?",
  cancel: "Бекор қилиш",
  confirmReset: "Ҳа, нолга қайтариш",
  times: "марта",
  target: "Мақсад",
  custom: "Ўзгача",
  completed: "Бажарилди",
  qiblaDirection: "Қибла йўналиши",
  qiblaPermission: "Жойлашувга рухсат беринг",
  dhikrSubhanallah: "Аллоҳ покдир",
  dhikrAlhamdulillah: "Аллоҳга ҳамд",
  dhikrAllahuAkbar: "Аллоҳ улуғдир",
  dhikrLaIlaha: "Аллоҳдан ўзга илоҳ йўқ",
  dhikrAstaghfirullah: "Аллоҳдан мағфират",
  settingsTitle: "Созламалар",
  surahsRead: (n) => `${n}/114 сура ўқилди`,
  readingMode: "ЎҚИШ РЕЖИМИ",
  readingModeBoth: "Арабча + Таржима",
  readingModeArabicOnly: "Фақат Арабча",
  readingModeTranslationOnly: "Фақат Таржима",
  recitationSettings: "ҚИРОАТ СОЗЛАМАЛАРИ",
  transliteration: "Транслитерация",
  transliterationDesc: "Арабча сўзларнинг лотин талаффузи",
  wordByWord: "Сўз бўйича таржима",
  wordByWordDesc: "Ҳар бир сўзга босинг (Инглизча)",
  arabicFontSize: "АРАБЧА ШРИФТ ЎЛЧАМИ",
  translationFontSize: "ТАРЖИМА ШРИФТ ЎЛЧАМИ",
  language: "ТИЛ",
  reciterTitle: "ҚОРИ ТАНЛАШ",
  offlineCache: "ОФФЛАЙН КЕШ",
  offlineReady: "Офлайн тайёр",
  offlineReadyDesc: "Барча 114 сура қурилмада сақланган",
  downloading: "Юкланмоқда...",
  downloadingDesc: (n) => `${n}/114 сура сақланди`,
  waitingNetwork: "Интернет кутилмоқда",
  waitingNetworkDesc: "Тармоққа уланганингизда юкланади",
  dataSource: "Маълумотлар quranapi.pages.dev дан олинади",
  loading: "Юкланмоқда...",
  markComplete: "Тугатдим",
  markCompleted: "Ўқилди",
  khatmahTitle: "Муборак бўлсин!",
  khatmahMessage: "Сиз бутун Қуръонни хатм қилдингиз.",
  close: "Ёпиш",
  newKhatmah: "Янги хатм бошлаш",
  refresh: "Янгилаш",
  methodNote: "Ҳисоб усули: Ҳанафий (method 4) • Манба: aladhan.com",
  tasbihRepeated: (c, t) => `${c} × ${t} = ${c * t} марта такрорланди`,
  enterNumber: "Рақам киритинг",
  other: "Бошқа",
  compassN: "Ш",
  compassE: "Ш\u0440",
  compassS: "Ж",
  compassW: "Ғ",
  lastReadBadge: "Сўнгги",
};

const uz_latin: I18nStrings = {
  tabQuran: "Qur'on",
  tabSearch: "Qidirish",
  tabBookmarks: "Xatcho'p",
  tabPrayer: "Namoz",
  tabTasbih: "Tasbih",
  tabSettings: "Sozlamalar",
  greeting: "Assalomu alaykum",
  readingProgress: "O'qish taraqqiyoti",
  verseOfDay: "Kunning oyati",
  continueReading: "Davom etish",
  library: "KUTUBXONA",
  duas: "Duolar",
  allSurahs: "BARCHA SURALAR",
  byJuz: "JUZLAR BO'YICHA",
  allFilter: "Barchasi",
  makkah: "Makka",
  madinah: "Madina",
  surahs: "Suralar",
  juzs: "Juzlar",
  verse: "oyat",
  surah: "sura",
  juz: "juz",
  searchPlaceholder: "Sura nomi yoki raqami...",
  networkError: "Internetga ulanishda xatolik",
  retry: "Qayta urinish",
  khatmah: "xatm",
  searchTitle: "Qidirish",
  searchInputPlaceholder: "Sura nomi, raqami yoki arabcha...",
  popularSurahs: "Mashhur Suralar",
  notFound: "Topilmadi",
  notFoundDesc: (q) => `"${q}" so'zi bo'yicha hech narsa topilmadi`,
  bookmarksTitle: "Xatcho'plar",
  savedVerses: (n) => `${n} ta saqlangan oyat`,
  noBookmarks: "Xatcho'p yo'q",
  noBookmarksDesc: "Sura o'qiyotganda oyatlarni xatcho'p qilib saqlashingiz mumkin",
  prayerTitle: "Namoz vaqtlari",
  fajr: "Bomdod",
  sunrise: "Quyosh",
  dhuhr: "Peshin",
  asr: "Asr",
  maghrib: "Shom",
  isha: "Xufton",
  nextPrayer: "Keyingi namoz",
  prayerPast: "O'tdi",
  notPrayerTime: "Namoz vaqti emas",
  prayerError: "Namoz vaqtlarini yuklashda xatolik yuz berdi.",
  enableNotif: "Qo'ng'iroq belgisini bosib bildirishnomani yoqing",
  hijri: "Hijriy",
  hours: "soat",
  minutes: "daqiqa",
  remaining: "qoldi",
  tasbih: "Tasbih",
  qibla: "Qibla",
  tap: "bosing",
  resetCounter: "Hisoblagichni nolga qaytarish",
  resetConfirm: "Joriy hisobni nolga qaytarasizmi?",
  cancel: "Bekor qilish",
  confirmReset: "Ha, nolga qaytarish",
  times: "marta",
  target: "Maqsad",
  custom: "O'zgacha",
  completed: "Bajarildi",
  qiblaDirection: "Qibla yo'nalishi",
  qiblaPermission: "Joylashuvga ruxsat bering",
  dhikrSubhanallah: "Alloh pokdir",
  dhikrAlhamdulillah: "Allohga hamd",
  dhikrAllahuAkbar: "Alloh ulug'dir",
  dhikrLaIlaha: "Allohdan o'zga iloh yo'q",
  dhikrAstaghfirullah: "Allohdan mag'firat",
  settingsTitle: "Sozlamalar",
  surahsRead: (n) => `${n}/114 sura o'qildi`,
  readingMode: "O'QISH REJIMI",
  readingModeBoth: "Arabcha + Tarjima",
  readingModeArabicOnly: "Faqat Arabcha",
  readingModeTranslationOnly: "Faqat Tarjima",
  recitationSettings: "QIROAT SOZLAMALARI",
  transliteration: "Transliteratsiya",
  transliterationDesc: "Arabcha so'zlarning lotin talaffuzi",
  wordByWord: "So'z bo'yicha tarjima",
  wordByWordDesc: "Har bir so'zga bosing (Inglizcha)",
  arabicFontSize: "ARABCHA SHRIFT O'LCHAMI",
  translationFontSize: "TARJIMA SHRIFT O'LCHAMI",
  language: "TIL",
  reciterTitle: "QORI TANLASH",
  offlineCache: "OFFLINE KESH",
  offlineReady: "Offline tayyor",
  offlineReadyDesc: "Barcha 114 sura qurilmada saqlangan",
  downloading: "Yuklanmoqda...",
  downloadingDesc: (n) => `${n}/114 sura saqlandi`,
  waitingNetwork: "Internet kutilmoqda",
  waitingNetworkDesc: "Tarmoqqa ulanganingizda yuklanadi",
  dataSource: "Ma'lumotlar quranapi.pages.dev dan olinadi",
  loading: "Yuklanmoqda...",
  markComplete: "Tugatdim",
  markCompleted: "O'qildi",
  khatmahTitle: "Muborak bo'lsin!",
  khatmahMessage: "Siz butun Qur'onni xatm qildingiz.",
  close: "Yopish",
  newKhatmah: "Yangi xatm boshlash",
  refresh: "Yangilash",
  methodNote: "Hisob usuli: Hanafiy (method 4) • Manba: aladhan.com",
  tasbihRepeated: (c, t) => `${c} × ${t} = ${c * t} marta takrorlandi`,
  enterNumber: "Raqam kiriting",
  other: "Boshqa",
  compassN: "Sh",
  compassE: "Sr",
  compassS: "J",
  compassW: "G",
  lastReadBadge: "So'nggi",
};

const ru: I18nStrings = {
  tabQuran: "Коран",
  tabSearch: "Поиск",
  tabBookmarks: "Закладки",
  tabPrayer: "Намаз",
  tabTasbih: "Тасбих",
  tabSettings: "Настройки",
  greeting: "Ас-саляму алейкум",
  readingProgress: "Прогресс чтения",
  verseOfDay: "Аят дня",
  continueReading: "Продолжить",
  library: "БИБЛИОТЕКА",
  duas: "Дуа",
  allSurahs: "ВСЕ СУРЫ",
  byJuz: "ПО ДЖУЗАМ",
  allFilter: "Все",
  makkah: "Мекка",
  madinah: "Медина",
  surahs: "Суры",
  juzs: "Джузы",
  verse: "аят",
  surah: "сура",
  juz: "джуз",
  searchPlaceholder: "Название или номер суры...",
  networkError: "Ошибка подключения к интернету",
  retry: "Повторить",
  khatmah: "хатм",
  searchTitle: "Поиск",
  searchInputPlaceholder: "Название суры, номер или арабский...",
  popularSurahs: "Популярные суры",
  notFound: "Не найдено",
  notFoundDesc: (q) => `По запросу "${q}" ничего не найдено`,
  bookmarksTitle: "Закладки",
  savedVerses: (n) => `${n} сохранённых аятов`,
  noBookmarks: "Нет закладок",
  noBookmarksDesc: "При чтении суры можно сохранять аяты в закладки",
  prayerTitle: "Время намаза",
  fajr: "Фаджр",
  sunrise: "Восход",
  dhuhr: "Зухр",
  asr: "Аср",
  maghrib: "Магриб",
  isha: "Иша",
  nextPrayer: "Следующий намаз",
  prayerPast: "Прошёл",
  notPrayerTime: "Не время намаза",
  prayerError: "Ошибка загрузки времени намаза.",
  enableNotif: "Нажмите на колокольчик для уведомлений",
  hijri: "Хиджра",
  hours: "ч",
  minutes: "мин",
  remaining: "осталось",
  tasbih: "Тасбих",
  qibla: "Кибла",
  tap: "нажмите",
  resetCounter: "Сбросить счётчик",
  resetConfirm: "Сбросить текущий счёт?",
  cancel: "Отмена",
  confirmReset: "Да, сбросить",
  times: "раз",
  target: "Цель",
  custom: "Своё",
  completed: "Выполнено",
  qiblaDirection: "Направление Киблы",
  qiblaPermission: "Разрешите доступ к геолокации",
  dhikrSubhanallah: "Аллах пречист",
  dhikrAlhamdulillah: "Хвала Аллаху",
  dhikrAllahuAkbar: "Аллах велик",
  dhikrLaIlaha: "Нет бога, кроме Аллаха",
  dhikrAstaghfirullah: "Прошу прощения у Аллаха",
  settingsTitle: "Настройки",
  surahsRead: (n) => `${n}/114 сур прочитано`,
  readingMode: "РЕЖИМ ЧТЕНИЯ",
  readingModeBoth: "Арабский + Перевод",
  readingModeArabicOnly: "Только арабский",
  readingModeTranslationOnly: "Только перевод",
  recitationSettings: "НАСТРОЙКИ ЧТЕНИЯ",
  transliteration: "Транслитерация",
  transliterationDesc: "Латинское произношение арабских слов",
  wordByWord: "Перевод по словам",
  wordByWordDesc: "Нажмите на каждое слово (Английский)",
  arabicFontSize: "РАЗМЕР АРАБСКОГО ШРИФТА",
  translationFontSize: "РАЗМЕР ШРИФТА ПЕРЕВОДА",
  language: "ЯЗЫК",
  reciterTitle: "ВЫБОР ЧТЕЦА",
  offlineCache: "ОФФЛАЙН КЭШ",
  offlineReady: "Готово к работе офлайн",
  offlineReadyDesc: "Все 114 сур сохранены на устройстве",
  downloading: "Загрузка...",
  downloadingDesc: (n) => `${n}/114 сур сохранено`,
  waitingNetwork: "Ожидание интернета",
  waitingNetworkDesc: "Загрузится при подключении к сети",
  dataSource: "Данные загружаются с quranapi.pages.dev",
  loading: "Загрузка...",
  markComplete: "Завершить",
  markCompleted: "Прочитано",
  khatmahTitle: "Поздравляем!",
  khatmahMessage: "Вы завершили чтение всего Корана.",
  close: "Закрыть",
  newKhatmah: "Начать новый хатм",
  refresh: "Обновить",
  methodNote: "Метод расчёта: Ханафи (method 4) • Источник: aladhan.com",
  tasbihRepeated: (c, t) => `${c} × ${t} = ${c * t} раз повторено`,
  enterNumber: "Введите число",
  other: "Другое",
  compassN: "С",
  compassE: "В",
  compassS: "Ю",
  compassW: "З",
  lastReadBadge: "Последняя",
};

const en: I18nStrings = {
  tabQuran: "Quran",
  tabSearch: "Search",
  tabBookmarks: "Bookmarks",
  tabPrayer: "Prayer",
  tabTasbih: "Tasbih",
  tabSettings: "Settings",
  greeting: "As-salamu alaykum",
  readingProgress: "Reading Progress",
  verseOfDay: "Verse of the Day",
  continueReading: "Continue",
  library: "LIBRARY",
  duas: "Du'as",
  allSurahs: "ALL SURAHS",
  byJuz: "BY JUZ",
  allFilter: "All",
  makkah: "Makkah",
  madinah: "Madinah",
  surahs: "Surahs",
  juzs: "Juzs",
  verse: "verse",
  surah: "surah",
  juz: "juz",
  searchPlaceholder: "Surah name or number...",
  networkError: "Network connection error",
  retry: "Retry",
  khatmah: "khatmah",
  searchTitle: "Search",
  searchInputPlaceholder: "Surah name, number or Arabic...",
  popularSurahs: "Popular Surahs",
  notFound: "Not found",
  notFoundDesc: (q) => `No results found for "${q}"`,
  bookmarksTitle: "Bookmarks",
  savedVerses: (n) => `${n} saved verse${n !== 1 ? "s" : ""}`,
  noBookmarks: "No bookmarks",
  noBookmarksDesc: "You can bookmark verses while reading a surah",
  prayerTitle: "Prayer Times",
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
  nextPrayer: "Next prayer",
  prayerPast: "Passed",
  notPrayerTime: "Not prayer time",
  prayerError: "Failed to load prayer times.",
  enableNotif: "Tap the bell icon to enable notifications",
  hijri: "Hijri",
  hours: "h",
  minutes: "min",
  remaining: "remaining",
  tasbih: "Tasbih",
  qibla: "Qibla",
  tap: "tap",
  resetCounter: "Reset Counter",
  resetConfirm: "Reset the current count?",
  cancel: "Cancel",
  confirmReset: "Yes, reset",
  times: "times",
  target: "Target",
  custom: "Custom",
  completed: "Done",
  qiblaDirection: "Qibla Direction",
  qiblaPermission: "Allow location access",
  dhikrSubhanallah: "Allah is perfect",
  dhikrAlhamdulillah: "Praise be to Allah",
  dhikrAllahuAkbar: "Allah is the greatest",
  dhikrLaIlaha: "There is no god but Allah",
  dhikrAstaghfirullah: "I seek Allah's forgiveness",
  settingsTitle: "Settings",
  surahsRead: (n) => `${n}/114 surahs read`,
  readingMode: "READING MODE",
  readingModeBoth: "Arabic + Translation",
  readingModeArabicOnly: "Arabic only",
  readingModeTranslationOnly: "Translation only",
  recitationSettings: "RECITATION SETTINGS",
  transliteration: "Transliteration",
  transliterationDesc: "Latin pronunciation of Arabic words",
  wordByWord: "Word-by-word translation",
  wordByWordDesc: "Tap each word (English)",
  arabicFontSize: "ARABIC FONT SIZE",
  translationFontSize: "TRANSLATION FONT SIZE",
  language: "LANGUAGE",
  reciterTitle: "SELECT RECITER",
  offlineCache: "OFFLINE CACHE",
  offlineReady: "Ready for offline",
  offlineReadyDesc: "All 114 surahs saved on device",
  downloading: "Downloading...",
  downloadingDesc: (n) => `${n}/114 surahs saved`,
  waitingNetwork: "Waiting for network",
  waitingNetworkDesc: "Will download when connected",
  dataSource: "Data sourced from quranapi.pages.dev",
  loading: "Loading...",
  markComplete: "Finished",
  markCompleted: "Read",
  khatmahTitle: "Congratulations!",
  khatmahMessage: "You have completed the entire Quran.",
  close: "Close",
  newKhatmah: "Start new khatmah",
  refresh: "Refresh",
  methodNote: "Calculation method: Hanafi (method 4) • Source: aladhan.com",
  tasbihRepeated: (c, t) => `${c} × ${t} = ${c * t} times repeated`,
  enterNumber: "Enter a number",
  other: "Other",
  compassN: "N",
  compassE: "E",
  compassS: "S",
  compassW: "W",
  lastReadBadge: "Last read",
};

const translations: Record<AppLanguage, I18nStrings> = {
  uz_cyrillic,
  uz_latin,
  ru,
  en,
};

export function getStrings(lang: AppLanguage): I18nStrings {
  return translations[lang] ?? uz_latin;
}

export default translations;
