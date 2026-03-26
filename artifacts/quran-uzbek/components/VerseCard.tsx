import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { ReadingMode } from "@/types/quran";

interface VerseCardProps {
  surahNo: number;
  ayahNo: number;
  arabic: string;
  english: string;
  uzbek?: string;
  sajda?: boolean;
  isBookmarked: boolean;
  isPlaying?: boolean;
  isActive?: boolean;
  readingMode: ReadingMode;
  arabicFontSize: number;
  translationFontSize: number;
  onBookmark: () => void;
  onPlay: () => void;
  onPress?: () => void;
}

export function VerseCard({
  surahNo,
  ayahNo,
  arabic,
  english,
  uzbek,
  sajda,
  isBookmarked,
  isPlaying,
  isActive,
  readingMode,
  arabicFontSize,
  translationFontSize,
  onBookmark,
  onPlay,
  onPress,
}: VerseCardProps) {
  const c = Colors.dark;
  const displayText = uzbek || english;

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBookmark();
  };

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPlay();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isActive ? c.card : "transparent",
          borderColor: isActive ? c.tint + "40" : c.border,
          borderWidth: isActive ? 1 : 0,
        },
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.verseNumber, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.verseNumberText, { color: c.tint }]}>{ayahNo}</Text>
        </View>

        {sajda && (
          <View style={[styles.sajdaBadge, { backgroundColor: c.sajdaColor + "22" }]}>
            <Text style={[styles.sajdaText, { color: c.sajdaColor }]}>Sajda</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Pressable onPress={handlePlay} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle-outline"}
              size={26}
              color={isPlaying ? c.audioActive : c.textSecondary}
            />
          </Pressable>
          <Pressable onPress={handleBookmark} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}>
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isBookmarked ? c.bookmarkActive : c.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {(readingMode === "arabic-only" || readingMode === "both") && (
        <Text
          style={[
            styles.arabic,
            {
              color: c.arabicText,
              fontSize: arabicFontSize,
              lineHeight: arabicFontSize * 2,
            },
          ]}
        >
          {arabic}
        </Text>
      )}

      {(readingMode === "translation" || readingMode === "both") && (
        <Text
          style={[
            styles.translation,
            {
              color: c.uzbekText,
              fontSize: translationFontSize,
              lineHeight: translationFontSize * 1.7,
            },
          ]}
        >
          {displayText}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  verseNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  verseNumberText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sajdaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sajdaText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  arabic: {
    textAlign: "right",
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  translation: {
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
});
