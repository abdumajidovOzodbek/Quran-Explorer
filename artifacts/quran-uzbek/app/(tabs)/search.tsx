import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { fetchSurahList, SurahListItem } from "@/constants/api";

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

const POPULAR_SURAHS = [1, 2, 18, 36, 55, 67, 112, 113, 114];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const [search, setSearch] = useState("");

  const { data: surahs } = useQuery<SurahListItem[]>({
    queryKey: ["surahList"],
    queryFn: fetchSurahList,
  });

  const results = useMemo(() => {
    if (!search.trim() || !surahs) return [];
    const q = search.trim().toLowerCase();
    return surahs.filter((s) => {
      const uzbekName = UZBEK_NAMES[s.surahNo] || "";
      return (
        uzbekName.toLowerCase().includes(q) ||
        s.surahNameArabic.includes(search) ||
        s.surahNameTranslation.toLowerCase().includes(q) ||
        String(s.surahNo) === q.trim()
      );
    });
  }, [search, surahs]);

  const popularSurahs = surahs?.filter((s) => POPULAR_SURAHS.includes(s.surahNo ?? 0)) || [];
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const renderSurah = (s: SurahListItem) => (
    <Pressable
      key={s.surahNo}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/surah/${s.surahNo}`);
      }}
      style={({ pressed }) => [
        styles.resultItem,
        { backgroundColor: c.card, borderColor: c.border },
        pressed && { opacity: 0.75 },
      ]}
    >
      <View style={[styles.numBadge, { backgroundColor: c.background, borderColor: c.border }]}>
        <Text style={[styles.numText, { color: c.tint }]}>{s.surahNo}</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultName, { color: c.text }]}>{UZBEK_NAMES[s.surahNo] || s.surahName}</Text>
        <Text style={[styles.resultSub, { color: c.textSecondary }]}>
          {s.revelationPlace === "Makkah" ? "Makka" : "Madina"} • {s.totalAyah} oyat
        </Text>
      </View>
      <Text style={[styles.resultArabic, { color: c.tint }]}>{s.surahNameArabic}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.title, { color: c.text }]}>Qidirish</Text>
        <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="search" size={18} color={c.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Sura nomi, raqami yoki arabcha..."
            placeholderTextColor={c.textMuted}
            style={[styles.searchInput, { color: c.text }]}
            autoFocus
            returnKeyType="search"
          />
          {!!search && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={c.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {!search ? (
        <View style={styles.popularContainer}>
          <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>Mashhur Suralar</Text>
          {popularSurahs.map(renderSurah)}
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={c.textMuted} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>Topilmadi</Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            "{search}" so'zi bo'yicha hech narsa topilmadi
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.surahNo)}
          renderItem={({ item }) => renderSurah(item)}
          contentContainerStyle={[
            styles.listContent,
            Platform.OS === "web" && { paddingBottom: 34 + 84 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
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
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
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
  popularContainer: {
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  numBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  numText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  resultSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  resultArabic: {
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
