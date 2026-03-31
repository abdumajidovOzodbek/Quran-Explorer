import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { SurahListItem } from "@/constants/api";
import { UZBEK_NAMES, JUZ_START } from "@/constants/uzbekNames";
import { RUSSIAN_NAMES } from "@/constants/russianNames";
import { cyrillicToLatin } from "@/constants/latinScript";
import { useQuran } from "@/context/QuranContext";
import { getStrings } from "@/constants/i18n";

interface SurahCardProps {
  surah: SurahListItem;
  onPress: () => void;
  isLastRead?: boolean;
  isCompleted?: boolean;
}

export function SurahCard({ surah, onPress, isLastRead, isCompleted }: SurahCardProps) {
  const c = Colors.dark;
  const { settings } = useQuran();
  const t = getStrings(settings.language);
  const language = settings.language;
  const rawName = UZBEK_NAMES[surah.surahNo] || surah.surahNameTranslation;
  const uzbekName =
    language === "uz_latin" ? cyrillicToLatin(rawName) :
    language === "uz_cyrillic" ? rawName :
    language === "ru" ? (RUSSIAN_NAMES[surah.surahNo] || surah.surahNameTranslation) :
    surah.surahNameTranslation;
  const juz = JUZ_START[surah.surahNo];
  const isMecca = surah.revelationPlace === "Makkah" || surah.revelationPlace === "Mecca";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: c.card, borderColor: isCompleted ? c.tint + "40" : c.border },
        pressed && { opacity: 0.75, transform: [{ scale: 0.99 }] },
      ]}
    >
      <View style={styles.numberBadgeWrap}>
        <View style={[styles.numberBadge, { backgroundColor: c.background, borderColor: isCompleted ? "#22c55e60" : c.border }]}>
          <Text style={[styles.numberText, { color: isCompleted ? "#22c55e" : c.tint }]}>{surah.surahNo}</Text>
        </View>
        {isCompleted && (
          <View style={[styles.checkDot, { backgroundColor: c.card }]}>
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.surahName, { color: c.text }]}>{uzbekName}</Text>
          {isLastRead && (
            <View style={[styles.badge, { backgroundColor: c.tint + "33" }]}>
              <Text style={[styles.badgeText, { color: c.tint }]}>{t.lastReadBadge}</Text>
            </View>
          )}
          {isCompleted && (
            <View style={[styles.badge, { backgroundColor: "#22c55e22" }]}>
              <Text style={[styles.badgeText, { color: "#22c55e" }]}>{t.markCompleted}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.translationText, { color: c.textSecondary }]}>
          {isMecca ? t.makkah : t.madinah} • {surah.totalAyah} {t.verse} • {juz} {t.juz}
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
  numberBadgeWrap: {
    position: "relative",
  },
  numberBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkDot: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#0d1b2a",
    borderRadius: 8,
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
    fontSize: 12,
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
