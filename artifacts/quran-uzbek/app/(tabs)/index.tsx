import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
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
import { UZBEK_NAMES, JUZ_START } from "@/constants/uzbekNames";
import { SurahCard } from "@/components/SurahCard";
import { SurahListSkeleton } from "@/components/ShimmerSkeleton";
import { useQuran } from "@/context/QuranContext";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "makka" | "madina">("all");
  const { lastRead, completedSurahs, isSurahComplete } = useQuran();

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
    const uzbekName = UZBEK_NAMES[s.surahNo] || "";
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

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const progressPercent = (completedSurahs.length / 114) * 100;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: c.textSecondary }]}>Assalomu alaykum</Text>
            <Text style={[styles.title, { color: c.tint }]}>القرآن الكريم</Text>
          </View>
          <View style={[styles.quranBadge, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.quranBadgeText, { color: c.text }]}>{completedSurahs.length}</Text>
            <Text style={[styles.quranBadgeLabel, { color: c.textSecondary }]}>/ 114</Text>
          </View>
        </View>

        <View style={[styles.progressContainer, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.progressRow}>
            <Ionicons name="trending-up-outline" size={15} color={c.tint} />
            <Text style={[styles.progressLabel, { color: c.textSecondary }]}>
              O'qish taraqqiyoti
            </Text>
            <Text style={[styles.progressValue, { color: c.tint }]}>
              {completedSurahs.length}/114 sura
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: c.background }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` as any, backgroundColor: c.tint },
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
                  <Ionicons name="sunny-outline" size={12} color={c.tint} />
                  <Text style={[styles.vodBadgeText, { color: c.tint }]}>Kunning oyati</Text>
                </View>
                <Text style={[styles.vodRef, { color: c.textMuted }]}>
                  {UZBEK_NAMES[verseOfDay.surahNo] || verseOfDay.surahName} • {verseOfDay.ayahNo}-oyat
                </Text>
              </View>
              <Text style={[styles.vodArabic, { color: "#e8d5a3" }]} numberOfLines={3}>
                {verseOfDay.arabic}
              </Text>
              <Text style={[styles.vodTranslation, { color: c.textSecondary }]} numberOfLines={3}>
                {verseOfDay.uzbek}
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
              <Ionicons name="book" size={20} color={c.tint} />
            </View>
            <View style={styles.continueInfo}>
              <Text style={[styles.continueLabel, { color: c.tint + "99" }]}>Davom etish</Text>
              <Text style={[styles.continueSurah, { color: c.tint }]}>
                {UZBEK_NAMES[lastRead.surahNo] || lastRead.surahName}
              </Text>
              <Text style={[styles.continueVerse, { color: c.textSecondary }]}>
                {lastRead.ayahNo}-oyat • {JUZ_START[lastRead.surahNo]}-juz
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={c.tint} />
          </Pressable>
        )}

        <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="search" size={18} color={c.textMuted} />
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
              <Ionicons name="close-circle" size={18} color={c.textMuted} />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(["all", "makka", "madina"] as const).map((f) => (
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
          <View style={styles.filterCount}>
            <Text style={[styles.filterCountText, { color: c.textMuted }]}>
              {filtered?.length || 0} sura
            </Text>
          </View>
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
      ) : (
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
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.listContent,
            Platform.OS === "web" && { paddingBottom: 34 + 84 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!filtered?.length}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 2,
  },
  title: {
    fontSize: 32,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
  },
  quranBadge: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 2,
  },
  quranBadgeText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  quranBadgeLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  progressContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
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
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  progressValue: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    minWidth: 6,
  },
  verseOfDayCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
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
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  vodBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  vodRef: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  vodArabic: {
    fontSize: 22,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
    textAlign: "right",
    lineHeight: 38,
    letterSpacing: 0.5,
  },
  vodTranslation: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 10,
  },
  continueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  continueIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  continueInfo: {
    flex: 1,
    gap: 2,
  },
  continueLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  continueSurah: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  continueVerse: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    paddingBottom: 4,
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
  filterCount: {
    paddingLeft: 4,
  },
  filterCountText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  listContent: {
    paddingTop: 8,
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
});
