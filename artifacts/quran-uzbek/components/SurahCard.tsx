import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { SurahListItem } from "@/constants/api";
import { UZBEK_NAMES, JUZ_START } from "@/constants/uzbekNames";

interface SurahCardProps {
  surah: SurahListItem;
  onPress: () => void;
  isLastRead?: boolean;
}

export function SurahCard({ surah, onPress, isLastRead }: SurahCardProps) {
  const c = Colors.dark;
  const uzbekName = UZBEK_NAMES[surah.surahNo] || surah.surahNameTranslation;
  const juz = JUZ_START[surah.surahNo];
  const isMecca = surah.revelationPlace === "Makkah" || surah.revelationPlace === "Mecca";

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
          <Text style={[styles.surahName, { color: c.text }]}>{uzbekName}</Text>
          {isLastRead && (
            <View style={[styles.badge, { backgroundColor: c.tint + "33" }]}>
              <Text style={[styles.badgeText, { color: c.tint }]}>Oxirgi</Text>
            </View>
          )}
        </View>
        <Text style={[styles.translationText, { color: c.textSecondary }]}>
          {isMecca ? "Makka" : "Madina"} • {surah.totalAyah} oyat • {juz}-juz
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
