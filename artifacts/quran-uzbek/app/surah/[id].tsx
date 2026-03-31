import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { fetchSurah, fetchWordByWord, getVerseAudioUrl, RECITERS, SurahApiData } from "@/constants/api";
import { UZBEK_NAMES } from "@/constants/uzbekNames";
import { RUSSIAN_NAMES } from "@/constants/russianNames";
import { cyrillicToLatin } from "@/constants/latinScript";
import { VerseCard } from "@/components/VerseCard";
import { useQuran } from "@/context/QuranContext";
import { useAudio } from "@/context/AudioContext";
import { getStrings } from "@/constants/i18n";

interface VerseItem {
  ayahNo: number;
  arabic: string;
  arabic2?: string;
  english: string;
  uzbek?: string;
  russian?: string;
  transliteration?: string;
}

export default function SurahScreen() {
  const { id, ayah } = useLocalSearchParams<{ id: string; ayah?: string }>();
  const surahNo = parseInt(id || "1", 10);
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const {
    isBookmarked,
    addBookmark,
    removeBookmark,
    saveLastRead,
    settings,
    isSurahComplete,
    markSurahComplete,
    unmarkSurahComplete,
  } = useQuran();
  const { audio, playVerse, stopAudio } = useAudio();
  const t = getStrings(settings.language);

  const playingAyah = audio?.surahNo === surahNo ? audio.ayahNo : null;
  const listRef = useRef<FlatList>(null);
  const isComplete = isSurahComplete(surahNo);

  const { data, isLoading, isError, refetch } = useQuery<SurahApiData>({
    queryKey: ["surah", surahNo],
    queryFn: () => fetchSurah(surahNo),
  });

  const { data: wordByWordData } = useQuery<string[]>({
    queryKey: ["wordByWord", surahNo],
    queryFn: () => fetchWordByWord(surahNo),
    enabled: settings.showWordByWord,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const verses: VerseItem[] = data?.english
    ? data.english.map((english, idx) => ({
        ayahNo: idx + 1,
        arabic: data.arabic1?.[idx] || "",
        arabic2: data.arabic2?.[idx] || "",
        english,
        uzbek: data.uzbek?.[idx],
        russian: data.russian?.[idx],
        transliteration: data.transliteration?.[idx],
      }))
    : [];

  const reciter = RECITERS.find((r) => r.id === settings.reciterId) || RECITERS[0];

  const getSurahDisplayName = () => {
    const lang = settings.language;
    if (lang === "uz_cyrillic") return UZBEK_NAMES[surahNo] || data?.surahName || `Sura ${surahNo}`;
    if (lang === "uz_latin") return cyrillicToLatin(UZBEK_NAMES[surahNo] || "") || data?.surahName || `Surah ${surahNo}`;
    if (lang === "ru") return RUSSIAN_NAMES[surahNo] || data?.surahName || `Sura ${surahNo}`;
    return data?.surahName || `Surah ${surahNo}`;
  };

  const surahName = getSurahDisplayName();

  const handlePlay = useCallback((ayahNo: number) => {
    if (playingAyah === ayahNo) {
      stopAudio();
      return;
    }
    const sName = UZBEK_NAMES[surahNo] || data?.surahName || "";
    playVerse({
      surahNo,
      ayahNo,
      surahName: sName,
      totalVerses: verses.length,
      reciterId: settings.reciterId,
      reciterName: reciter.name,
      audioUrl: getVerseAudioUrl(surahNo, ayahNo, settings.reciterId),
    });
    saveLastRead({ surahNo, surahName: sName, ayahNo });
  }, [playingAyah, surahNo, settings.reciterId, data?.surahName, verses.length, reciter.name, playVerse, stopAudio, saveLastRead]);

  useEffect(() => {
    if (playingAyah && verses.length > 0) {
      const index = playingAyah - 1;
      try {
        listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
      } catch {
      }
    }
  }, [playingAyah]);

  useEffect(() => {
    const targetAyah = ayah ? parseInt(ayah, 10) : null;
    if (targetAyah && verses.length > 0) {
      setTimeout(() => {
        try {
          listRef.current?.scrollToIndex({
            index: targetAyah - 1,
            animated: true,
            viewPosition: 0.15,
          });
        } catch {
        }
      }, 300);
    }
  }, [data, ayah]);

  const handleBookmark = useCallback((verse: VerseItem) => {
    if (isBookmarked(surahNo, verse.ayahNo)) {
      removeBookmark(surahNo, verse.ayahNo);
    } else {
      addBookmark({
        surahNo,
        surahName: UZBEK_NAMES[surahNo] || data?.surahName || "",
        ayahNo: verse.ayahNo,
        arabic: verse.arabic,
        uzbek: verse.uzbek || verse.english,
      });
    }
  }, [surahNo, isBookmarked, addBookmark, removeBookmark, data?.surahName]);

  const revelationLabel = () => {
    const rp = data?.revelationPlace ?? "";
    if (rp === "Mecca" || rp === "Makkah") return t.makkah;
    if (rp === "Medina" || rp === "Madinah") return t.madinah;
    return rp;
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 8, borderBottomColor: c.border }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: c.card, borderColor: c.border },
            pressed && { opacity: 0.6 },
          ]}
        >
          <Ionicons name="chevron-back" size={22} color={c.text} />
        </Pressable>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: c.text }]}>{surahName}</Text>
          <Text style={[styles.headerSub, { color: c.textSecondary }]}>
            {revelationLabel()} • {data?.totalAyah ?? verses.length} {t.verse}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (isComplete) {
              unmarkSurahComplete(surahNo);
            } else {
              markSurahComplete(surahNo);
            }
          }}
          style={({ pressed }) => [
            styles.headerCompleteBtn,
            {
              backgroundColor: isComplete ? "#22c55e22" : c.tint + "18",
              borderColor: isComplete ? "#22c55e60" : c.tint + "50",
            },
            pressed && { opacity: 0.65 },
          ]}
        >
          <Ionicons
            name={isComplete ? "checkmark-circle" : "checkmark-circle-outline"}
            size={16}
            color={isComplete ? "#22c55e" : c.tint}
          />
          <Text style={[styles.headerCompleteBtnText, { color: isComplete ? "#22c55e" : c.tint }]}>
            {isComplete ? t.markCompleted : t.markComplete}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={[styles.loadingText, { color: c.textSecondary }]}>{t.loading}</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="wifi-outline" size={48} color={c.textMuted} />
          <Text style={[styles.errorText, { color: c.textSecondary }]}>{t.networkError}</Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryBtn, { backgroundColor: c.tint }]}
          >
            <Text style={styles.retryText}>{t.retry}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={verses}
          keyExtractor={(item) => `${surahNo}-${item.ayahNo}`}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
            }, 500);
          }}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: audio
                ? bottomPadding + 160
                : bottomPadding + 30,
            },
            Platform.OS === "web" && {
              paddingBottom: audio ? 34 + 220 : 34 + 60,
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={verses.length > 0}
          ListHeaderComponent={
            surahNo !== 9 ? (
              <View
                style={[
                  styles.bismillah,
                  {
                    borderColor: c.tint + "30",
                    backgroundColor: c.card,
                  },
                ]}
              >
                <Text style={[styles.bismillahText, { color: c.tint }]}>
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </Text>
                <Text style={[styles.bismillahTranslit, { color: c.textSecondary }]}>
                  Bismillahir Rohmanir Rohiym
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={<View style={{ height: 16 }} />}
          renderItem={({ item }) => (
            <VerseCard
              surahNo={surahNo}
              ayahNo={item.ayahNo}
              arabic={item.arabic}
              english={item.english}
              uzbek={item.uzbek}
              russian={item.russian}
              transliteration={item.transliteration}
              wordByWord={wordByWordData?.[item.ayahNo - 1]}
              surahName={surahName}
              isBookmarked={isBookmarked(surahNo, item.ayahNo)}
              isPlaying={playingAyah === item.ayahNo}
              isActive={playingAyah === item.ayahNo}
              readingMode={settings.readingMode}
              arabicFontSize={settings.arabicFontSize}
              translationFontSize={settings.translationFontSize}
              showTransliteration={settings.showTransliteration}
              showWordByWord={settings.showWordByWord}
              onBookmark={() => handleBookmark(item)}
              onPlay={() => handlePlay(item.ayahNo)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  headerCompleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  headerCompleteBtnText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  errorText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#000",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  listContent: {
    paddingTop: 8,
  },
  bismillah: {
    alignItems: "center",
    paddingVertical: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  bismillahText: {
    fontSize: 26,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
    letterSpacing: 1,
  },
  bismillahTranslit: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
});
