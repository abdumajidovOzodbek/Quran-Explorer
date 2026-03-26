import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
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
import { fetchSurahList, SurahListItem } from "@/constants/api";
import { SurahCard } from "@/components/SurahCard";
import { SurahListSkeleton } from "@/components/ShimmerSkeleton";
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "makka" | "madina">("all");
  const { lastRead } = useQuran();

  const { data: surahs, isLoading, isError, refetch } = useQuery<SurahListItem[]>({
    queryKey: ["surahList"],
    queryFn: fetchSurahList,
  });

  const filtered = surahs?.filter((s) => {
    const uzbekName = UZBEK_NAMES[s.surahNo] || "";
    const matchesSearch =
      !search ||
      uzbekName.toLowerCase().includes(search.toLowerCase()) ||
      s.surahNameArabic.includes(search) ||
      s.surahNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
      String(s.surahNo).includes(search);

    const matchesFilter =
      filter === "all" ||
      (filter === "makka" && (s.revelationPlace === "Makkah" || s.revelationPlace === "Mecca")) ||
      (filter === "madina" && (s.revelationPlace === "Madinah" || s.revelationPlace === "Medina"));

    return matchesSearch && matchesFilter;
  });

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: c.textSecondary }]}>Assalomu alaykum</Text>
            <Text style={[styles.title, { color: c.tint }]}>القرآن الكريم</Text>
          </View>
          <View style={[styles.quranBadge, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.quranBadgeText, { color: c.text }]}>114</Text>
            <Text style={[styles.quranBadgeLabel, { color: c.textSecondary }]}>Sura</Text>
          </View>
        </View>

        {lastRead && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/surah/${lastRead.surahNo}`);
            }}
            style={({ pressed }) => [
              styles.lastReadBanner,
              { backgroundColor: c.tint + "18", borderColor: c.tint + "40" },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="bookmark" size={16} color={c.tint} />
            <Text style={[styles.lastReadText, { color: c.tint }]}>
              Davom etish: {UZBEK_NAMES[lastRead.surahNo] || lastRead.surahName} — {lastRead.ayahNo}-oyat
            </Text>
            <Ionicons name="chevron-forward" size={14} color={c.tint} />
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
  container: {
    flex: 1,
  },
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
  },
  quranBadgeText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  quranBadgeLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  lastReadBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  lastReadText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
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
