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
import { JUZ_DATA, getJuzNavAyah } from "@/constants/juz";
import { DUAS } from "@/constants/duas";
import { SurahCard } from "@/components/SurahCard";
import { SurahListSkeleton } from "@/components/ShimmerSkeleton";
import { useQuran } from "@/context/QuranContext";
import { applyScript } from "@/constants/latinScript";

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

function buildFlatJuzData(
  surahs: SurahListItem[],
  expandedJuz: Set<number>
): JuzRow[] {
  const rows: JuzRow[] = [];

  for (const juzInfo of JUZ_DATA) {
    const { juzNo, name } = juzInfo;
    const juzSurahSet = new Set(juzInfo.surahs);
    const juzSurahs = surahs
      .filter((s) => juzSurahSet.has(s.surahNo ?? 0))
      .map((s) => ({
        surah: s,
        navAyah: getJuzNavAyah(juzNo, s.surahNo ?? 0),
      }));

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

  const scriptMode = settings.scriptMode ?? "cyrillic";

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
    const uzbekName = UZBEK_NAMES[s.surahNo ?? 0] || "";
    const matchesSearch =
      !search ||
      uzbekName.toLowerCase().includes(search.toLowerCase()) ||
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
      <View style={[styles.progressContainer, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.progressRow}>
          <Ionicons name="trending-up-outline" size={14} color={c.tint} />
          <Text style={[styles.progressLabel, { color: c.textSecondary }]}>O'qish taraqqiyoti</Text>
          <View style={styles.progressRight}>
            <Text style={[styles.progressValue, { color: c.tint }]}>
              {completedSurahs.length}/114
            </Text>
            {khatmahCount > 0 && (
              <View style={[styles.khatmahBadge, { backgroundColor: c.tint + "20", borderColor: c.tint + "40" }]}>
                <Ionicons name="checkmark-circle" size={11} color={c.tint} />
                <Text style={[styles.khatmahBadgeText, { color: c.tint }]}>
                  {khatmahCount} xatm
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: c.background }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(progressPercent, 2)}%` as any, backgroundColor: c.tint },
            ]}
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
                <Text style={[styles.vodBadgeText, { color: c.tint }]}>Kunning oyati</Text>
              </View>
              <Text style={[styles.vodRef, { color: c.textMuted }]}>
                {UZBEK_NAMES[verseOfDay.surahNo] || verseOfDay.surahName} • {verseOfDay.ayahNo}-oyat
              </Text>
            </View>
            <Text style={[styles.vodArabic, { color: "#e8d5a3" }]} numberOfLines={2}>
              {verseOfDay.arabic}
            </Text>
            <Text style={[styles.vodTranslation, { color: c.textSecondary }]} numberOfLines={2}>
              {applyScript(verseOfDay.uzbek, scriptMode)}
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
            <Text style={[styles.continueLabel, { color: c.tint + "99" }]}>Davom etish</Text>
            <Text style={[styles.continueSurah, { color: c.tint }]}>
              {UZBEK_NAMES[lastRead.surahNo] || lastRead.surahName}
            </Text>
          </View>
          <Text style={[styles.continueVerse, { color: c.textSecondary }]}>
            {lastRead.ayahNo}-oyat
          </Text>
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
          <Text style={[styles.continueLabel, { color: "#4caf7699" }]}>KUTUBXONA</Text>
          <Text style={[styles.continueSurah, { color: "#4caf76" }]}>Duolar</Text>
        </View>
        <Text style={[styles.duaCount, { color: "#4caf7680" }]}>{DUAS.length} ta</Text>
        <Ionicons name="chevron-forward" size={18} color="#4caf76" />
      </Pressable>

      <View style={[styles.sectionLabel, { borderBottomColor: c.border }]}>
        <Text style={[styles.sectionLabelText, { color: c.textSecondary }]}>
          {viewMode === "surah" ? "BARCHA SURALAR" : "JUZLAR BO'YICHA"}
        </Text>
        <Text style={[styles.sectionCount, { color: c.textMuted }]}>
          {viewMode === "surah" ? `${filtered?.length ?? 0} / 114` : "30 juz"}
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
              backgroundColor: item.isExpanded ? c.tint + "15" : c.card,
              borderColor: item.isExpanded ? c.tint + "40" : c.border,
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
              {item.juzNo}-juz • {item.juzName}
            </Text>
            <Text style={[styles.juzRange, { color: c.textMuted }]} numberOfLines={1}>
              {UZBEK_NAMES[firstSurah?.surahNo ?? 1] ?? firstSurah?.surahName ?? ""}
              {lastSurah && lastSurah.surahNo !== firstSurah?.surahNo
                ? ` — ${UZBEK_NAMES[lastSurah.surahNo ?? 0] ?? lastSurah.surahName}`
                : ""}
              {" "}• {item.surahs.length} sura
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
            <Ionicons
              name={item.isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={c.textMuted}
            />
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
            router.push(
              item.navAyah > 1
                ? `/surah/${surahNo}?ayah=${item.navAyah}`
                : `/surah/${surahNo}`
            );
          }}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.stickyHeader, { paddingTop: topPadding + 8, backgroundColor: c.background }]}>
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.greeting, { color: c.textSecondary }]}>Assalomu alaykum</Text>
            <Text style={[styles.title, { color: c.tint }]}>القرآن الكريم</Text>
          </View>
          <View style={[styles.quranBadge, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.quranBadgeNum, { color: c.text }]}>{completedSurahs.length}</Text>
            <Text style={[styles.quranBadgeOf, { color: c.textMuted }]}>/114</Text>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="search" size={17} color={c.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Sura nomi yoki raqami..."
            placeholderTextColor={c.textMuted}
            style={[styles.searchInput, { color: c.text }]}
            returnKeyType="search"
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={17} color={c.textMuted} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setViewMode((m) => (m === "surah" ? "juz" : "surah"));
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor: viewMode === "juz" ? "#2a3a5a" : c.card,
                borderColor: viewMode === "juz" ? "#4a6fa5" : c.border,
                flexDirection: "row",
                gap: 4,
                alignItems: "center",
              },
            ]}
          >
            <Ionicons
              name="layers-outline"
              size={13}
              color={viewMode === "juz" ? "#7ab0e0" : c.textSecondary}
            />
            <Text style={[styles.filterText, { color: viewMode === "juz" ? "#7ab0e0" : c.textSecondary }]}>
              {viewMode === "juz" ? "Juzlar" : "Suralar"}
            </Text>
          </Pressable>

          {viewMode === "surah" && (["all", "makka", "madina"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f ? c.tint : c.card,
                  borderColor: filter === f ? c.tint : c.border,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === f ? "#000" : c.textSecondary }]}>
                {f === "all" ? "Barchasi" : f === "makka" ? "Makka" : "Madina"}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <SurahListSkeleton />
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="wifi-outline" size={48} color={c.textMuted} />
          <Text style={[styles.errorText, { color: c.textSecondary }]}>Internetga ulanishda xatolik</Text>
          <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: c.tint }]}>
            <Text style={styles.retryText}>Qayta urinish</Text>
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
          contentContainerStyle={[
            styles.listContent,
            Platform.OS === "web" && { paddingBottom: 34 + 84 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={c.tint}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={c.textMuted} />
              <Text style={[styles.emptyText, { color: c.textSecondary }]}>Hech narsa topilmadi</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={flatJuzData}
          keyExtractor={(item) =>
            item.type === "juz-header"
              ? `juz-${item.juzNo}`
              : `surah-${item.surah.surahNo}-juz-${item.juzNo}`
          }
          renderItem={renderJuzRow}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[
            styles.listContent,
            Platform.OS === "web" && { paddingBottom: 34 + 84 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={showKhatmahModal}
        transparent
        animationType="fade"
        onRequestClose={dismissKhatmahModal}
      >
        <Pressable style={styles.modalOverlay} onPress={dismissKhatmahModal}>
          <Pressable
            style={[styles.modalCard, { backgroundColor: c.card, borderColor: c.tint + "40" }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.khatmahEmoji}>🎉</Text>
            <Text style={[styles.khatmahTitle, { color: c.tint }]}>Muborak bo'lsin!</Text>
            <Text style={[styles.khatmahDesc, { color: c.textSecondary }]}>
              Siz butun Qur'onni xatm qildingiz.{"\n"}
              <Text style={[styles.khatmahCount, { color: c.tint }]}>{khatmahCount}-xatm</Text> mubоrak bo'lsin!
            </Text>
            <Text style={[styles.khatmahArabic, { color: "#e8d5a3" }]}>
              خَتَمَ اللَّهُ لَنَا وَلَكُمْ بِالْخَيْرِ
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={dismissKhatmahModal}
                style={[styles.modalBtn, { backgroundColor: c.border }]}
              >
                <Text style={[styles.modalBtnText, { color: c.textSecondary }]}>Yopish</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  resetKhatmah();
                }}
                style={[styles.modalBtn, { backgroundColor: c.tint }]}
              >
                <Text style={[styles.modalBtnText, { color: "#000" }]}>Yangi xatm boshlash</Text>
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
    paddingBottom: 10,
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
    marginBottom: 1,
  },
  title: {
    fontSize: 28,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
  },
  quranBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    gap: 2,
  },
  quranBadgeNum: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  quranBadgeOf: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
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
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  progressContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  progressRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressValue: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  khatmahBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  khatmahBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  verseOfDayCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  vodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  vodBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
  },
  vodBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  vodRef: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },
  vodArabic: {
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
    textAlign: "right",
    lineHeight: 34,
    letterSpacing: 0.5,
  },
  vodTranslation: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 8,
  },
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  continueIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  continueInfo: {
    flex: 1,
    gap: 1,
  },
  continueLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  continueSurah: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  continueVerse: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  duaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  duaIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  duaCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginTop: 2,
  },
  sectionLabelText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  sectionCount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  juzHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
  },
  juzNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  juzNumberText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  juzInfo: {
    flex: 1,
    gap: 2,
  },
  juzName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  juzRange: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  juzRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  juzProgress: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  juzProgressText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  juzSurahCard: {
    marginLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255,255,255,0.06)",
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 120,
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
  emptyContainer: {
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
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  khatmahEmoji: {
    fontSize: 48,
  },
  khatmahTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  khatmahDesc: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  khatmahCount: {
    fontFamily: "Inter_700Bold",
  },
  khatmahArabic: {
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
    textAlign: "center",
    lineHeight: 30,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
});
