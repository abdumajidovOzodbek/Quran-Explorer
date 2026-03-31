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
import { UZBEK_NAMES } from "@/constants/uzbekNames";
import { RUSSIAN_NAMES } from "@/constants/russianNames";
import { cyrillicToLatin } from "@/constants/latinScript";
import { useQuran } from "@/context/QuranContext";
import { getStrings } from "@/constants/i18n";
import { AppLanguage } from "@/types/quran";

function getSurahDisplayName(s: SurahListItem, language: AppLanguage): string {
  const no = s.surahNo ?? 0;
  const raw = UZBEK_NAMES[no] || "";
  if (language === "uz_latin") return cyrillicToLatin(raw) || s.surahName;
  if (language === "uz_cyrillic" || language === "ru") return RUSSIAN_NAMES[no] || s.surahName;
  return s.surahNameTranslation || s.surahName;
}

const POPULAR_SURAHS = [1, 2, 18, 36, 55, 67, 112, 113, 114];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const [search, setSearch] = useState("");
  const { settings } = useQuran();
  const t = getStrings(settings.language);
  const language = settings.language;

  const { data: surahs } = useQuery<SurahListItem[]>({
    queryKey: ["surahList"],
    queryFn: fetchSurahList,
  });

  const results = useMemo(() => {
    if (!search.trim() || !surahs) return [];
    const q = search.trim().toLowerCase();
    return surahs.filter((s) => {
      const no = s.surahNo ?? 0;
      const uzbekName = UZBEK_NAMES[no] || "";
      const russianName = RUSSIAN_NAMES[no] || "";
      return (
        uzbekName.toLowerCase().includes(q) ||
        russianName.toLowerCase().includes(q) ||
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
        <Text style={[styles.resultName, { color: c.text }]}>{getSurahDisplayName(s, language)}</Text>
        <Text style={[styles.resultSub, { color: c.textSecondary }]}>
          {(s.revelationPlace === "Makkah" || s.revelationPlace === "Mecca") ? t.makkah : t.madinah} • {s.totalAyah} {t.verse}
        </Text>
      </View>
      <Text style={[styles.resultArabic, { color: c.tint }]}>{s.surahNameArabic}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.title, { color: c.text }]}>{t.searchTitle}</Text>
        <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="search" size={18} color={c.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t.searchInputPlaceholder}
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
          <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{t.popularSurahs}</Text>
          {popularSurahs.map(renderSurah)}
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={c.textMuted} />
          <Text style={[styles.emptyTitle, { color: c.text }]}>{t.notFound}</Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            {t.notFoundDesc(search)}
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
