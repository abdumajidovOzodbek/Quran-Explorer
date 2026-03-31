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
import { fetchSurah, getVerseAudioUrl, RECITERS, SurahApiData } from "@/constants/api";
import { UZBEK_NAMES } from "@/constants/uzbekNames";
import { VerseCard } from "@/components/VerseCard";
import { useQuran } from "@/context/QuranContext";
import { useAudio } from "@/context/AudioContext";

interface VerseItem {
  ayahNo: number;
  arabic: string;
  arabic2?: string;
  english: string;
  uzbek?: string;
}

export default function SurahScreen() {
  const { id, ayah } = useLocalSearchParams<{ id: string; ayah?: string }>();
  const surahNo = parseInt(id || "1", 10);
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const { isBookmarked, addBookmark, removeBookmark, saveLastRead, settings } = useQuran();
  const { audio, playVerse, stopAudio } = useAudio();

  const playingAyah = audio?.surahNo === surahNo ? audio.ayahNo : null;
  const listRef = useRef<FlatList>(null);

  const { data, isLoading, isError, refetch } = useQuery<SurahApiData>({
    queryKey: ["surah", surahNo],
    queryFn: () => fetchSurah(surahNo),
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
      }))
    : [];

  const reciter = RECITERS.find((r) => r.id === settings.reciterId) || RECITERS[0];

  const handlePlay = useCallback((ayahNo: number) => {
    if (playingAyah === ayahNo) {
      stopAudio();
      return;
    }
    const surahName = UZBEK_NAMES[surahNo] || data?.surahName || "";
    playVerse({
      surahNo,
      ayahNo,
      surahName,
      totalVerses: verses.length,
      reciterId: settings.reciterId,
      reciterName: reciter.name,
      audioUrl: getVerseAudioUrl(surahNo, ayahNo, settings.reciterId),
    });
    saveLastRead({ surahNo, surahName, ayahNo });
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

  const surahName = UZBEK_NAMES[surahNo] || data?.surahName || `Sura ${surahNo}`;

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
            {data?.revelationPlace === "Mecca" ? "Makka" : data?.revelationPlace === "Medina" ? "Madina" : data?.revelationPlace ?? ""}
            {" "}• {data?.totalAyah ?? verses.length} oyat
          </Text>
        </View>

        <Text style={[styles.headerArabic, { color: c.tint }]}>
          {data?.surahNameArabic || ""}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={[styles.loadingText, { color: c.textSecondary }]}>Yuklanmoqda...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="wifi-outline" size={48} color={c.textMuted} />
          <Text style={[styles.errorText, { color: c.textSecondary }]}>
            Internetga ulanishda xatolik
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryBtn, { backgroundColor: c.tint }]}
          >
            <Text style={styles.retryText}>Qayta urinish</Text>
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
          renderItem={({ item }) => (
            <VerseCard
              surahNo={surahNo}
              ayahNo={item.ayahNo}
              arabic={item.arabic}
              english={item.english}
              uzbek={item.uzbek}
              surahName={surahName}
              isBookmarked={isBookmarked(surahNo, item.ayahNo)}
              isPlaying={playingAyah === item.ayahNo}
              isActive={playingAyah === item.ayahNo}
              readingMode={settings.readingMode}
              arabicFontSize={settings.arabicFontSize}
              translationFontSize={settings.translationFontSize}
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
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  headerSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  headerArabic: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
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
