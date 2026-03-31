import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { fetchSurahList, fetchVerseOfDay, SurahListItem, VerseOfDay } from "@/constants/api";
import { UZBEK_NAMES } from "@/constants/uzbekNames";
import { RUSSIAN_NAMES } from "@/constants/russianNames";
import { JUZ_DATA, getJuzNavAyah } from "@/constants/juz";
import { DUAS } from "@/constants/duas";
import { SurahCard } from "@/components/SurahCard";
import { SurahListSkeleton } from "@/components/ShimmerSkeleton";
import { useQuran } from "@/context/QuranContext";
import { cyrillicToLatin } from "@/constants/latinScript";
import { getStrings } from "@/constants/i18n";
import { AppLanguage } from "@/types/quran";

type ViewMode = "surah" | "juz";

interface JuzHeaderRow {
  type: "juz-header";
  juzNo: number;
  juzName: string;
  surahs: Array<{ surah: SurahListItem; navAyah: number }>;
  isExpanded: boolean;
}
interface JuzSurahRow {
  type: "surah";
  surah: SurahListItem;
  navAyah: number;
  juzNo: number;
}
type JuzRow = JuzHeaderRow | JuzSurahRow;

function buildFlatJuzData(surahs: SurahListItem[], expandedJuz: Set<number>): JuzRow[] {
  const rows: JuzRow[] = [];
  for (const juzInfo of JUZ_DATA) {
    const { juzNo, name } = juzInfo;
    const juzSurahSet = new Set(juzInfo.surahs);
    const juzSurahs = surahs
      .filter((s) => juzSurahSet.has(s.surahNo ?? 0))
      .map((s) => ({ surah: s, navAyah: getJuzNavAyah(juzNo, s.surahNo ?? 0) }));
    if (juzSurahs.length === 0) continue;
    const isExpanded = expandedJuz.has(juzNo);
    rows.push({ type: "juz-header", juzNo, juzName: name, surahs: juzSurahs, isExpanded });
    if (isExpanded) {
      for (const item of juzSurahs) {
        rows.push({ type: "surah", surah: item.surah, navAyah: item.navAyah, juzNo });
      }
    }
  }
  return rows;
}

function getLocalSurahName(surahNo: number, surahName: string, language: AppLanguage): string {
  if (language === "uz_latin") return cyrillicToLatin(UZBEK_NAMES[surahNo] || "") || surahName;
  if (language === "uz_cyrillic" || language === "ru") return RUSSIAN_NAMES[surahNo] || surahName;
  return surahName;
}

function getVodTranslation(vod: VerseOfDay, language: AppLanguage): string {
  if (language === "uz_cyrillic") return vod.uzbek || vod.english;
  if (language === "uz_latin") return cyrillicToLatin(vod.uzbek) || vod.english;
  if (language === "ru") return vod.russian || vod.english;
  return vod.english;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "makka" | "madina">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("surah");
  const [expandedJuz, setExpandedJuz] = useState<Set<number>>(new Set());

  const {
    lastRead,
    completedSurahs,
    isSurahComplete,
    khatmahCount,
    showKhatmahModal,
    dismissKhatmahModal,
    resetKhatmah,
    settings,
  } = useQuran();

  const t = getStrings(settings.language);
  const language = settings.language;

  const { data: surahs, isLoading, isError, refetch } = useQuery<SurahListItem[]>({
    queryKey: ["surahList"],
    queryFn: fetchSurahList,
  });

  const { data: verseOfDay } = useQuery<VerseOfDay>({
    queryKey: ["verseOfDay", new Date().toDateString()],
    queryFn: fetchVerseOfDay,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const filtered = surahs?.filter((s) => {
    const no = s.surahNo ?? 0;
    const uzbekName = UZBEK_NAMES[no] || "";
    const russianName = RUSSIAN_NAMES[no] || "";
    const matchesSearch =
      !search ||
      uzbekName.toLowerCase().includes(search.toLowerCase()) ||
      russianName.toLowerCase().includes(search.toLowerCase()) ||
      s.surahNameArabic.includes(search) ||
      s.surahNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
      String(s.surahNo).includes(search);
    const place = s.revelationPlace?.toLowerCase() ?? "";
    const matchesFilter =
      filter === "all" ||
      (filter === "makka" && (place === "mecca" || place === "makkah")) ||
      (filter === "madina" && (place === "madina" || place === "madinah" || place === "medina"));
    return matchesSearch && matchesFilter;
  });

  const flatJuzData = surahs ? buildFlatJuzData(surahs, expandedJuz) : [];

  const toggleJuz = useCallback((juzNo: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedJuz((prev) => {
      const next = new Set(prev);
      if (next.has(juzNo)) next.delete(juzNo);
      else next.add(juzNo);
      return next;
    });
  }, []);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const progressPercent = (completedSurahs.length / 114) * 100;

  const ListHeader = (
    <View style={styles.listHeaderContainer}>
      <View style={[styles.progressContainer, { backgroundColor: "#101828", borderColor: c.border }]}>
        <View style={styles.progressRow}>
          <Ionicons name="trending-up-outline" size={14} color={c.tint} />
          <Text style={[styles.progressLabel, { color: c.textSecondary }]}>{t.readingProgress}</Text>
          <View style={styles.progressRight}>
            <Text style={[styles.progressValue, { color: c.tint }]}>{completedSurahs.length}/114</Text>
            {khatmahCount > 0 && (
              <View style={[styles.khatmahBadge, { backgroundColor: c.tint + "20", borderColor: c.tint + "40" }]}>
                <Ionicons name="checkmark-circle" size={11} color={c.tint} />
                <Text style={[styles.khatmahBadgeText, { color: c.tint }]}>{khatmahCount} {t.khatmah}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: c.background }]}>
          <LinearGradient
            colors={[c.tint, c.tint + "aa"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${Math.max(progressPercent, 2)}%` as any }]}
          />
        </View>
      </View>

      {verseOfDay && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/surah/${verseOfDay.surahNo}?ayah=${verseOfDay.ayahNo}`);
          }}
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
        >
          <LinearGradient
            colors={["#1a2a4a", "#0d1f3c"]}
            style={[styles.verseOfDayCard, { borderColor: c.tint + "30" }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.vodHeader}>
              <View style={[styles.vodBadge, { backgroundColor: c.tint + "20", borderColor: c.tint + "40" }]}>
                <Ionicons name="sunny-outline" size={11} color={c.tint} />
                <Text style={[styles.vodBadgeText, { color: c.tint }]}>{t.verseOfDay}</Text>
              </View>
              <Text style={[styles.vodRef, { color: c.textMuted }]}>
                {getLocalSurahName(verseOfDay.surahNo, verseOfDay.surahName, language)} • {verseOfDay.ayahNo} {t.verse}
              </Text>
            </View>
            <Text style={[styles.vodArabic, { color: "#e8d5a3" }]} numberOfLines={2}>
              {verseOfDay.arabic}
            </Text>
            <Text style={[styles.vodTranslation, { color: c.textSecondary }]} numberOfLines={2}>
              {getVodTranslation(verseOfDay, language)}
            </Text>
          </LinearGradient>
        </Pressable>
      )}

      {lastRead && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push(`/surah/${lastRead.surahNo}?ayah=${lastRead.ayahNo}`);
          }}
          style={({ pressed }) => [
            styles.continueCard,
            { backgroundColor: c.tint + "15", borderColor: c.tint + "50" },
            pressed && { opacity: 0.8 },
          ]}
        >
          <View style={[styles.continueIconBox, { backgroundColor: c.tint + "25" }]}>
            <Ionicons name="book" size={18} color={c.tint} />
          </View>
          <View style={styles.continueInfo}>
            <Text style={[styles.continueLabel, { color: c.tint + "99" }]}>{t.continueReading}</Text>
            <Text style={[styles.continueSurah, { color: c.tint }]}>
              {getLocalSurahName(lastRead.surahNo, lastRead.surahName, language)}
            </Text>
          </View>
          <Text style={[styles.continueVerse, { color: c.textSecondary }]}>{lastRead.ayahNo} {t.verse}</Text>
          <Ionicons name="chevron-forward" size={18} color={c.tint} />
        </Pressable>
      )}

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/duas");
        }}
        style={({ pressed }) => [
          styles.duaCard,
          { backgroundColor: "#1a2a1a", borderColor: "#2d4a2d" },
          pressed && { opacity: 0.8 },
        ]}
      >
        <View style={[styles.duaIconBox, { backgroundColor: "#2d4a2d" }]}>
          <Ionicons name="hand-left-outline" size={18} color="#4caf76" />
        </View>
        <View style={styles.continueInfo}>
          <Text style={[styles.continueLabel, { color: "#4caf7699" }]}>{t.library.toUpperCase()}</Text>
          <Text style={[styles.continueSurah, { color: "#4caf76" }]}>{t.duas}</Text>
        </View>
        <Text style={[styles.duaCount, { color: "#4caf7680" }]}>{DUAS.length}</Text>
        <Ionicons name="chevron-forward" size={18} color="#4caf76" />
      </Pressable>

      <View style={[styles.sectionLabel, { borderBottomColor: c.border }]}>
        <View style={styles.sectionLabelLeft}>
          <View style={[styles.sectionDot, { backgroundColor: c.tint }]} />
          <Text style={[styles.sectionLabelText, { color: c.textSecondary }]}>
            {viewMode === "surah" ? t.allSurahs : t.byJuz}
          </Text>
        </View>
        <Text style={[styles.sectionCount, { color: c.textMuted }]}>
          {viewMode === "surah" ? `${filtered?.length ?? 0} / 114` : `30 ${t.juzs}`}
        </Text>
      </View>
    </View>
  );

  const renderJuzRow = ({ item }: { item: JuzRow }) => {
    if (item.type === "juz-header") {
      const completedInJuz = item.surahs.filter((s) => isSurahComplete(s.surah.surahNo ?? 0)).length;
      const firstSurah = item.surahs[0]?.surah;
      const lastSurah = item.surahs[item.surahs.length - 1]?.surah;
      return (
        <Pressable
          onPress={() => toggleJuz(item.juzNo)}
          style={[
            styles.juzHeader,
            {
              backgroundColor: item.isExpanded ? "#101828" : c.card,
              borderColor: item.isExpanded ? c.tint + "50" : c.border,
            },
          ]}
        >
          <View style={[styles.juzNumber, { backgroundColor: item.isExpanded ? c.tint : c.border }]}>
            <Text style={[styles.juzNumberText, { color: item.isExpanded ? "#000" : c.textMuted }]}>
              {item.juzNo}
            </Text>
          </View>
          <View style={styles.juzInfo}>
            <Text style={[styles.juzName, { color: c.text }]}>
              {item.juzNo} {t.juz} • {item.juzName}
            </Text>
            <Text style={[styles.juzRange, { color: c.textMuted }]} numberOfLines={1}>
              {getLocalSurahName(firstSurah?.surahNo ?? 1, firstSurah?.surahName ?? "", language)}
              {lastSurah && lastSurah.surahNo !== firstSurah?.surahNo
                ? ` — ${getLocalSurahName(lastSurah.surahNo ?? 0, lastSurah.surahName ?? "", language)}`
                : ""}
              {" "}• {item.surahs.length} {t.surahs}
            </Text>
          </View>
          <View style={styles.juzRight}>
            {completedInJuz > 0 && (
              <View style={[styles.juzProgress, { backgroundColor: c.tint + "20" }]}>
                <Text style={[styles.juzProgressText, { color: c.tint }]}>
                  {completedInJuz}/{item.surahs.length}
                </Text>
              </View>
            )}
            <Ionicons name={item.isExpanded ? "chevron-up" : "chevron-down"} size={16} color={c.textMuted} />
          </View>
        </Pressable>
      );
    }
    return (
      <View style={styles.juzSurahCard}>
        <SurahCard
          surah={item.surah}
          isLastRead={lastRead?.surahNo === item.surah.surahNo}
          isCompleted={isSurahComplete(item.surah.surahNo ?? 0)}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const surahNo = item.surah.surahNo ?? 1;
            router.push(item.navAyah > 1 ? `/surah/${surahNo}?ayah=${item.navAyah}` : `/surah/${surahNo}`);
          }}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <LinearGradient
        colors={["#0d1829", "#0A0F1E"]}
        style={[styles.stickyHeader, { paddingTop: topPadding + 12 }]}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.greeting, { color: c.textSecondary }]}>{t.greeting}</Text>
            <Text style={[styles.title, { color: c.tint }]}>القرآن الكريم</Text>
          </View>
          <View style={[styles.quranBadge, { backgroundColor: c.tint + "18", borderColor: c.tint + "35" }]}>
            <Text style={[styles.quranBadgeNum, { color: c.tint }]}>{completedSurahs.length}</Text>
            <Text style={[styles.quranBadgeOf, { color: c.tint + "99" }]}>/114</Text>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: "#1A2236", borderColor: c.border }]}>
          <Ionicons name="search" size={17} color={c.tint} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={c.textMuted}
            style={[styles.searchInput, { color: c.text }]}
            returnKeyType="search"
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={17} color={c.textMuted} />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setViewMode((m) => (m === "surah" ? "juz" : "surah")); }}
            style={[
              styles.filterChip,
              {
                backgroundColor: viewMode === "juz" ? "#2a3a5a" : "#1A2236",
                borderColor: viewMode === "juz" ? "#4a6fa5" : c.border,
                flexDirection: "row",
                gap: 4,
                alignItems: "center",
              },
            ]}
          >
            <Ionicons name="layers-outline" size={13} color={viewMode === "juz" ? "#7ab0e0" : c.textSecondary} />
            <Text style={[styles.filterText, { color: viewMode === "juz" ? "#7ab0e0" : c.textSecondary }]}>
              {viewMode === "juz" ? t.byJuz : t.allSurahs}
            </Text>
          </Pressable>
          {viewMode === "surah" && (["all", "makka", "madina"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f ? c.tint : "#1A2236",
                  borderColor: filter === f ? c.tint : c.border,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === f ? "#000" : c.textSecondary }]}>
                {f === "all" ? t.allFilter : f === "makka" ? t.makkah : t.madinah}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      {isLoading ? (
        <SurahListSkeleton />
      ) : isError ? (
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="wifi-outline" size={36} color={c.textMuted} />
          </View>
          <Text style={[styles.errorText, { color: c.textSecondary }]}>{t.networkError}</Text>
          <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: c.tint }]}>
            <Text style={styles.retryText}>{t.retry}</Text>
          </Pressable>
        </View>
      ) : viewMode === "surah" ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.surahNo ?? 0)}
          renderItem={({ item }) => (
            <SurahCard
              surah={item}
              isLastRead={lastRead?.surahNo === item.surahNo}
              isCompleted={isSurahComplete(item.surahNo ?? 0)}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/surah/${item.surahNo ?? 1}`);
              }}
            />
          )}
          ListHeaderComponent={ListHeader}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.listContent, Platform.OS === "web" && { paddingBottom: 34 + 84 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={c.tint} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={c.textMuted} />
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>{t.notFound}</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={flatJuzData}
          keyExtractor={(item) =>
            item.type === "juz-header" ? `juz-${item.juzNo}` : `surah-${item.surah.surahNo}-juz-${item.juzNo}`
          }
          renderItem={renderJuzRow}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[styles.listContent, Platform.OS === "web" && { paddingBottom: 34 + 84 }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showKhatmahModal} transparent animationType="fade" onRequestClose={dismissKhatmahModal}>
        <Pressable style={styles.modalOverlay} onPress={dismissKhatmahModal}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: c.card, borderColor: c.tint + "40" }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.khatmahEmoji}>🎉</Text>
            <Text style={[styles.khatmahTitle, { color: c.tint }]}>{t.khatmahTitle}</Text>
            <Text style={[styles.khatmahDesc, { color: c.textSecondary }]}>
              {t.khatmahMessage}{"\n"}
              <Text style={[styles.khatmahCount, { color: c.tint }]}>{khatmahCount} {t.khatmah}</Text>
            </Text>
            <Text style={[styles.khatmahArabic, { color: "#e8d5a3" }]}>
              خَتَمَ اللَّهُ لَنَا وَلَكُمْ بِالْخَيْرِ
            </Text>
            <View style={styles.modalButtons}>
              <Pressable onPress={dismissKhatmahModal} style={[styles.modalBtn, { backgroundColor: c.border }]}>
                <Text style={[styles.modalBtnText, { color: c.textSecondary }]}>{t.close}</Text>
              </Pressable>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); resetKhatmah(); }}
                style={[styles.modalBtn, { backgroundColor: c.tint }]}
              >
                <Text style={[styles.modalBtnText, { color: "#000" }]}>{t.newKhatmah}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stickyHeader: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  title: {
    fontSize: 30,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
  },
  quranBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 2,
  },
  quranBadgeNum: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  quranBadgeOf: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  progressContainer: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  progressRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  khatmahBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  khatmahBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  verseOfDayCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  vodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  vodBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  vodRef: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  vodArabic: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
    textAlign: "right",
    lineHeight: 38,
  },
  vodTranslation: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  continueIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueInfo: { flex: 1 },
  continueLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  continueSurah: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  continueVerse: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  duaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  duaIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  duaCount: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginTop: 4,
  },
  sectionLabelLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  sectionLabelText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  listContent: {
    paddingBottom: 120,
  },
  juzHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  juzNumber: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  juzNumberText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  juzInfo: { flex: 1, gap: 3 },
  juzName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  juzRange: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  juzRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  juzProgress: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  juzProgressText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  juzSurahCard: { marginLeft: 12 },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  errorIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    color: "#000",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    gap: 12,
  },
  khatmahEmoji: { fontSize: 48 },
  khatmahTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  khatmahDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  khatmahCount: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  khatmahArabic: {
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
    textAlign: "center",
    marginVertical: 8,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 4,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
