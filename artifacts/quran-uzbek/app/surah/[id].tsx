import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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
import { fetchSurah, RECITERS, SurahApiData } from "@/constants/api";
import { VerseCard } from "@/components/VerseCard";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useQuran } from "@/context/QuranContext";

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

interface VerseItem {
  ayahNo: number;
  arabic: string;
  arabic2?: string;
  english: string;
}

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahNo = parseInt(id || "1", 10);
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const { isBookmarked, addBookmark, removeBookmark, saveLastRead, settings } = useQuran();

  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

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
      }))
    : [];

  const reciter = RECITERS.find((r) => r.id === settings.reciterId) || RECITERS[0];

  const handlePlay = useCallback((ayahNo: number) => {
    if (playingAyah === ayahNo) {
      setPlayingAyah(null);
      setAudioUrl(null);
      return;
    }
    setPlayingAyah(ayahNo);
    const paddedSurah = String(surahNo).padStart(3, "0");
    const paddedVerse = String(ayahNo).padStart(3, "0");
    const url = `https://cdn.islamicnetwork.com/quran.com/ar.alafasy/${paddedSurah}${paddedVerse}.mp3`;
    setAudioUrl(url);
    saveLastRead({
      surahNo,
      surahName: UZBEK_NAMES[surahNo] || data?.surahName || "",
      ayahNo,
    });
  }, [playingAyah, surahNo, data?.surahName, saveLastRead]);

  const handleNext = useCallback(() => {
    if (playingAyah && playingAyah < verses.length) {
      handlePlay(playingAyah + 1);
    }
  }, [playingAyah, verses.length, handlePlay]);

  const handlePrev = useCallback(() => {
    if (playingAyah && playingAyah > 1) {
      handlePlay(playingAyah - 1);
    }
  }, [playingAyah, handlePlay]);

  const handleBookmark = useCallback((verse: VerseItem) => {
    if (isBookmarked(surahNo, verse.ayahNo)) {
      removeBookmark(surahNo, verse.ayahNo);
    } else {
      addBookmark({
        surahNo,
        surahName: UZBEK_NAMES[surahNo] || data?.surahName || "",
        ayahNo: verse.ayahNo,
        arabic: verse.arabic,
        uzbek: verse.english,
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
          data={verses}
          keyExtractor={(item) => `${surahNo}-${item.ayahNo}`}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: audioUrl
                ? bottomPadding + 160
                : bottomPadding + 30,
            },
            Platform.OS === "web" && {
              paddingBottom: audioUrl ? 34 + 220 : 34 + 60,
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
              uzbek={item.english}
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

      {audioUrl && (
        <View
          style={[
            styles.audioPlayerContainer,
            { bottom: bottomPadding + 8, backgroundColor: c.background },
          ]}
        >
          <AudioPlayer
            url={audioUrl}
            surahName={surahName}
            reciterName={reciter.name}
            currentVerse={playingAyah ?? undefined}
            totalVerses={verses.length}
            onClose={() => {
              setPlayingAyah(null);
              setAudioUrl(null);
            }}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </View>
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
  audioPlayerContainer: {
    position: "absolute",
    left: 12,
    right: 12,
  },
});
