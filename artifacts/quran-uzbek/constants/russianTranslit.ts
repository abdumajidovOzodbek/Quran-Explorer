export function latinToRussianTranslit(text: string): string {
  if (!text) return text;

  let result = text;

  // Unicode Arabic transliteration diacritics
  result = result.replace(/Ā/g, "Аа").replace(/ā/g, "аа");
  result = result.replace(/Ī/g, "Ии").replace(/ī/g, "ии");
  result = result.replace(/Ū/g, "Уу").replace(/ū/g, "уу");
  result = result.replace(/Ḥ/g, "Х").replace(/ḥ/g, "х");
  result = result.replace(/Ṣ/g, "С").replace(/ṣ/g, "с");
  result = result.replace(/Ḍ/g, "Д").replace(/ḍ/g, "д");
  result = result.replace(/Ṭ/g, "Т").replace(/ṭ/g, "т");
  result = result.replace(/Ẓ/g, "З").replace(/ẓ/g, "з");
  result = result.replace(/Ṯ/g, "С").replace(/ṯ/g, "с");
  result = result.replace(/Ḏ/g, "З").replace(/ḏ/g, "з");
  result = result.replace(/Ġ/g, "Г").replace(/ġ/g, "г");
  result = result.replace(/Ḫ/g, "Х").replace(/ḫ/g, "х");
  result = result.replace(/Š/g, "Ш").replace(/š/g, "ш");
  result = result.replace(/[ʿʾʻ''`ʼ]/g, "ъ");

  // Multi-character ASCII sequences (must come before single-char replacements)
  result = result.replace(/SH/g, "Ш").replace(/Sh/g, "Ш").replace(/sh/g, "ш");
  result = result.replace(/KH/g, "Х").replace(/Kh/g, "Х").replace(/kh/g, "х");
  result = result.replace(/GH/g, "Г").replace(/Gh/g, "Г").replace(/gh/g, "г");
  result = result.replace(/TH/g, "С").replace(/Th/g, "С").replace(/th/g, "с");
  result = result.replace(/DH/g, "З").replace(/Dh/g, "З").replace(/dh/g, "з");
  result = result.replace(/ZH/g, "Ж").replace(/Zh/g, "Ж").replace(/zh/g, "ж");

  // Double vowels (ASCII doubled-vowel transliteration)
  result = result.replace(/AA/g, "АА").replace(/Aa/g, "Аа").replace(/aa/g, "аа");
  result = result.replace(/II/g, "ИИ").replace(/Ii/g, "Ии").replace(/ii/g, "ии");
  result = result.replace(/UU/g, "УУ").replace(/Uu/g, "Уу").replace(/uu/g, "уу");

  // Single consonants
  result = result.replace(/B/g, "Б").replace(/b/g, "б");
  result = result.replace(/T/g, "Т").replace(/t/g, "т");
  result = result.replace(/J/g, "Дж").replace(/j/g, "дж");
  result = result.replace(/H/g, "Х").replace(/h/g, "х");
  result = result.replace(/D/g, "Д").replace(/d/g, "д");
  result = result.replace(/R/g, "Р").replace(/r/g, "р");
  result = result.replace(/Z/g, "З").replace(/z/g, "з");
  result = result.replace(/S/g, "С").replace(/s/g, "с");
  result = result.replace(/F/g, "Ф").replace(/f/g, "ф");
  result = result.replace(/Q/g, "К").replace(/q/g, "к");
  result = result.replace(/K/g, "К").replace(/k/g, "к");
  result = result.replace(/L/g, "Л").replace(/l/g, "л");
  result = result.replace(/M/g, "М").replace(/m/g, "м");
  result = result.replace(/N/g, "Н").replace(/n/g, "н");
  result = result.replace(/W/g, "В").replace(/w/g, "в");
  result = result.replace(/Y/g, "Й").replace(/y/g, "й");
  result = result.replace(/P/g, "П").replace(/p/g, "п");
  result = result.replace(/V/g, "В").replace(/v/g, "в");
  result = result.replace(/G/g, "Г").replace(/g/g, "г");
  result = result.replace(/C/g, "К").replace(/c/g, "к");

  // Vowels
  result = result.replace(/A/g, "А").replace(/a/g, "а");
  result = result.replace(/I/g, "И").replace(/i/g, "и");
  result = result.replace(/U/g, "У").replace(/u/g, "у");
  result = result.replace(/E/g, "Е").replace(/e/g, "е");
  result = result.replace(/O/g, "О").replace(/o/g, "о");

  return result;
}
