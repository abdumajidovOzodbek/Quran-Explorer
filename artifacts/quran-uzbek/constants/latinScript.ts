const CYR_TO_LAT: [string, string][] = [
  ["Ё", "Yo"],
  ["ё", "yo"],
  ["Ю", "Yu"],
  ["ю", "yu"],
  ["Я", "Ya"],
  ["я", "ya"],
  ["Ж", "J"],
  ["ж", "j"],
  ["Ц", "Ts"],
  ["ц", "ts"],
  ["Ч", "Ch"],
  ["ч", "ch"],
  ["Ш", "Sh"],
  ["ш", "sh"],
  ["Щ", "Sh"],
  ["щ", "sh"],
  ["Ъ", "\u02bc"],
  ["ъ", "\u02bc"],
  ["Ь", ""],
  ["ь", ""],
  ["Ы", "I"],
  ["ы", "i"],
  ["Э", "E"],
  ["э", "e"],
  ["Қ", "Q"],
  ["қ", "q"],
  ["Ғ", "G\u02bb"],
  ["ғ", "g\u02bb"],
  ["Ҳ", "H"],
  ["ҳ", "h"],
  ["Ў", "O\u02bb"],
  ["ў", "o\u02bb"],
  ["Ң", "Ng"],
  ["ң", "ng"],
  ["А", "A"],
  ["а", "a"],
  ["Б", "B"],
  ["б", "b"],
  ["В", "V"],
  ["в", "v"],
  ["Г", "G"],
  ["г", "g"],
  ["Д", "D"],
  ["д", "d"],
  ["Е", "E"],
  ["е", "e"],
  ["З", "Z"],
  ["з", "z"],
  ["И", "I"],
  ["и", "i"],
  ["Й", "Y"],
  ["й", "y"],
  ["К", "K"],
  ["к", "k"],
  ["Л", "L"],
  ["л", "l"],
  ["М", "M"],
  ["м", "m"],
  ["Н", "N"],
  ["н", "n"],
  ["О", "O"],
  ["о", "o"],
  ["П", "P"],
  ["п", "p"],
  ["Р", "R"],
  ["р", "r"],
  ["С", "S"],
  ["с", "s"],
  ["Т", "T"],
  ["т", "t"],
  ["У", "U"],
  ["у", "u"],
  ["Ф", "F"],
  ["ф", "f"],
  ["Х", "X"],
  ["х", "x"],
];

export function cyrillicToLatin(text: string): string {
  let result = "";
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const [cyr, lat] of CYR_TO_LAT) {
      if (text.startsWith(cyr, i)) {
        result += lat;
        i += cyr.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += text[i];
      i++;
    }
  }
  return result;
}

export type ScriptMode = "cyrillic" | "latin";

export function applyScript(text: string | undefined, mode: ScriptMode): string {
  if (!text) return "";
  if (mode === "latin") return cyrillicToLatin(text);
  return text;
}
