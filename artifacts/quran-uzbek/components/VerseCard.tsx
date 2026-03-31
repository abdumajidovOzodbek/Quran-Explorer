import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, Pressable, Share, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { ReadingMode } from "@/types/quran";
import { parseWordByWord } from "@/constants/api";

interface VerseCardProps {
  surahNo: number;
  ayahNo: number;
  arabic: string;
  english: string;
  uzbek?: string;
  transliteration?: string;
  wordByWord?: string;
  surahName?: string;
  sajda?: boolean;
  isBookmarked: boolean;
  isPlaying?: boolean;
  isActive?: boolean;
  readingMode: ReadingMode;
  arabicFontSize: number;
  translationFontSize: number;
  showTransliteration?: boolean;
  showWordByWord?: boolean;
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
  transliteration,
  wordByWord,
  surahName,
  sajda,
  isBookmarked,
  isPlaying,
  isActive,
  readingMode,
  arabicFontSize,
  translationFontSize,
  showTransliteration,
  showWordByWord,
  onBookmark,
  onPlay,
  onPress,
}: VerseCardProps) {
  const c = Colors.dark;
  const displayText = uzbek || english;
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);

  const words = showWordByWord && wordByWord ? parseWordByWord(wordByWord) : [];

  const handleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBookmark();
  };

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPlay();
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const label = surahName ? `Qur'on, ${surahName} surasi, ${ayahNo}-oyat` : `Qur'on ${surahNo}:${ayahNo}`;
      await Share.share({
        message: `${arabic}\n\n${displayText}\n\n— ${label}`,
      });
    } catch {
    }
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
          <Pressable onPress={handleShare} style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.6 }]}>
            <Ionicons name="share-outline" size={20} color={c.textSecondary} />
          </Pressable>
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
        showWordByWord && words.length > 0 ? (
          <View style={styles.wordByWordContainer}>
            {words.map((word, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedWordIdx(selectedWordIdx === i ? null : i);
                }}
                style={[
                  styles.wordChip,
                  {
                    backgroundColor: selectedWordIdx === i ? c.tint + "22" : c.card,
                    borderColor: selectedWordIdx === i ? c.tint + "80" : c.border,
                  },
                ]}
              >
                <Text style={[styles.wordArabic, { fontSize: arabicFontSize * 0.7, color: c.arabicText }]}>
                  {word.arabic}
                </Text>
                {selectedWordIdx === i && (
                  <Text style={[styles.wordMeaning, { color: c.tint }]}>{word.english}</Text>
                )}
              </Pressable>
            ))}
          </View>
        ) : (
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
        )
      )}

      {showTransliteration && transliteration && (
        <Text style={[styles.transliteration, { color: c.textSecondary, fontSize: translationFontSize - 1 }]}>
          {transliteration}
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
    gap: 4,
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
  wordByWordContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 6,
    marginBottom: 14,
  },
  wordChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    gap: 2,
  },
  wordArabic: {
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
    textAlign: "center",
  },
  wordMeaning: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  transliteration: {
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  translation: {
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 12,
  },
});
