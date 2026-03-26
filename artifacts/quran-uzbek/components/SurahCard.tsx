import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { SurahListItem } from "@/constants/api";

const UZBEK_NAMES: Record<number, string> = {
  1: "Fotiha", 2: "Baqara", 3: "Ol Imron", 4: "Niso", 5: "Moida", 6: "Anam",
  7: "Arof", 8: "Anfol", 9: "Tavba", 10: "Yunus", 11: "Hud", 12: "Yusuf",
  13: "Rad", 14: "Ibrohim", 15: "Hijr", 16: "Nahl", 17: "Isro", 18: "Kahf",
  19: "Maryam", 20: "Toha", 21: "Anbiyo", 22: "Haj", 23: "Muminun",
  24: "Nur", 25: "Furqon", 26: "Shuaro", 27: "Naml", 28: "Qasas",
  29: "Ankabut", 30: "Rum", 31: "Luqmon", 32: "Sajda", 33: "Ahzob",
  34: "Sabo", 35: "Fotir", 36: "Yosin", 37: "Soffot", 38: "Sod",
  39: "Zumar", 40: "Gofir", 41: "Fussilat", 42: "Shuro", 43: "Zuxruf",
  44: "Duxon", 45: "Josiya", 46: "Ahqof", 47: "Muhammad", 48: "Fath",
  49: "Hujurot", 50: "Qof", 51: "Zoriyot", 52: "Tur", 53: "Najm",
  54: "Qamar", 55: "Rahman", 56: "Voqea", 57: "Hadid", 58: "Mujodala",
  59: "Hashr", 60: "Mumtahana", 61: "Saf", 62: "Juma", 63: "Munofiqun",
  64: "Tagobun", 65: "Taloq", 66: "Tahrim", 67: "Mulk", 68: "Qalam",
  69: "Hoqqa", 70: "Maarij", 71: "Nuh", 72: "Jin", 73: "Muzzammil",
  74: "Muddassir", 75: "Qiyoma", 76: "Inson", 77: "Mursalot", 78: "Naba",
  79: "Noziot", 80: "Abasa", 81: "Takwir", 82: "Infitor", 83: "Mutaffifin",
  84: "Inshiqoq", 85: "Buruj", 86: "Toriq", 87: "Alo", 88: "Goshiya",
  89: "Fajr", 90: "Balad", 91: "Shams", 92: "Layl", 93: "Zuho",
  94: "Sharh", 95: "Tin", 96: "Alaq", 97: "Qadr", 98: "Bayyina",
  99: "Zilzol", 100: "Odiyot", 101: "Qoria", 102: "Takosur", 103: "Asr",
  104: "Humaza", 105: "Fil", 106: "Quraysh", 107: "Mooun", 108: "Kavsar",
  109: "Kofirun", 110: "Nasr", 111: "Masad", 112: "Ixlos", 113: "Falaq",
  114: "Nos",
};

interface SurahCardProps {
  surah: SurahListItem;
  onPress: () => void;
  isLastRead?: boolean;
}

export function SurahCard({ surah, onPress, isLastRead }: SurahCardProps) {
  const c = Colors.dark;
  const uzbekName = UZBEK_NAMES[surah.surahNo] || surah.surahNameTranslation;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: c.card, borderColor: c.border },
        pressed && { opacity: 0.75, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={[styles.numberBadge, { backgroundColor: c.background, borderColor: c.border }]}>
        <Text style={[styles.numberText, { color: c.tint }]}>{surah.surahNo}</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.surahName, { color: c.text }]}>
            {uzbekName}
          </Text>
          {isLastRead && (
            <View style={[styles.badge, { backgroundColor: c.tint + "33" }]}>
              <Text style={[styles.badgeText, { color: c.tint }]}>Oxirgi</Text>
            </View>
          )}
        </View>
        <Text style={[styles.translationText, { color: c.textSecondary }]}>
          {(surah.revelationPlace === "Makkah" || surah.revelationPlace === "Mecca") ? "Makka" : "Madina"} • {surah.totalAyah} oyat
        </Text>
      </View>

      <View style={styles.arabicContainer}>
        <Text style={[styles.arabicName, { color: c.tint }]}>{surah.surahNameArabic}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 14,
  },
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  numberText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  info: {
    flex: 1,
    gap: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  surahName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  translationText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  arabicContainer: {
    alignItems: "flex-end",
  },
  arabicName: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
});
