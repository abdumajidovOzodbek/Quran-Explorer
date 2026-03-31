import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { DUAS, DUA_CATEGORIES, DuaCategory, Dua } from "@/constants/duas";
import { cyrillicToLatin } from "@/constants/latinScript";
import { latinToRussianTranslit } from "@/constants/russianTranslit";
import { useQuran } from "@/context/QuranContext";
import { getStrings, I18nStrings } from "@/constants/i18n";

const DUA_CAT_KEY: Record<DuaCategory, keyof I18nStrings> = {
  umumiy: "duaUmumiy",
  ertalab: "duaErtalab",
  kechqurun: "duaKechqurun",
  ovqat: "duaOvqat",
  uyqu: "duaUyqu",
  safar: "duaSafar",
};

export default function DuasScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const { settings } = useQuran();
  const t = getStrings(settings.language);
  const language = settings.language;
  const [activeCategory, setActiveCategory] = useState<DuaCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeCategory === "all"
    ? DUAS
    : DUAS.filter((d) => d.category === activeCategory);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const toggleExpanded = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getDuaTitle = (item: Dua) =>
    language === "uz_cyrillic" ? item.titleUz :
    language === "ru" ? item.titleRu :
    language === "en" ? item.titleEn :
    item.title;

  const renderDua = ({ item }: { item: Dua }) => {
    const isExpanded = expandedId === item.id;
    const duaTitle = getDuaTitle(item);
    const catLabel = t[DUA_CAT_KEY[item.category]] as string;

    return (
      <Pressable onPress={() => toggleExpanded(item.id)}>
        <View style={[
          styles.duaCard,
          { backgroundColor: "#101828", borderColor: isExpanded ? c.tint + "50" : c.border },
          isExpanded && { borderWidth: 1.5 },
        ]}>
          {isExpanded && <View style={[styles.accentBar, { backgroundColor: c.tint }]} />}

          <View style={styles.cardInner}>
            <View style={styles.duaHeader}>
              <View style={[styles.catBadge, { backgroundColor: c.tint + "18", borderColor: c.tint + "30" }]}>
                <Text style={[styles.catLabel, { color: c.tint }]}>{catLabel}</Text>
              </View>
              <Text style={[styles.duaTitle, { color: isExpanded ? c.text : c.textSecondary }]} numberOfLines={1}>
                {duaTitle}
              </Text>
              <View style={[styles.chevronBox, { backgroundColor: isExpanded ? c.tint + "20" : "transparent" }]}>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={isExpanded ? c.tint : c.textMuted}
                />
              </View>
            </View>

            <Text
              style={[styles.duaArabic, { color: c.arabicText }]}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {item.arabic}
            </Text>

            {isExpanded && (
              <>
                <View style={[styles.divider, { backgroundColor: c.border }]} />

                <View style={[styles.translitBox, { backgroundColor: "#0a1020", borderColor: c.border }]}>
                  <View style={styles.translitHeader}>
                    <View style={[styles.translitDot, { backgroundColor: c.textMuted }]} />
                    <Text style={[styles.translitLabel, { color: c.textMuted }]}>Transliteration</Text>
                  </View>
                  <Text style={[styles.translitText, { color: c.textSecondary }]}>
                    {(language === "ru" || language === "uz_cyrillic")
                      ? latinToRussianTranslit(item.transliteration)
                      : item.transliteration}
                  </Text>
                </View>

                <View style={[styles.meaningBox, { backgroundColor: c.tint + "08", borderColor: c.tint + "20" }]}>
                  <Text style={[styles.duaMeaning, { color: c.textSecondary }]}>
                    {language === "ru" ? item.russian :
                     language === "en" ? item.english :
                     language === "uz_latin" ? cyrillicToLatin(item.uzbek) :
                     item.uzbek}
                  </Text>
                </View>

                <View style={styles.sourceRow}>
                  <Ionicons name="book-outline" size={12} color={c.textMuted} />
                  <Text style={[styles.sourceText, { color: c.textMuted }]}>{item.source}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <LinearGradient
        colors={["#0d1829", "#0A0F1E"]}
        style={[styles.header, { paddingTop: topPadding + 8 }]}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backBtn, { backgroundColor: "#1A2236", borderColor: c.border }]}
            hitSlop={8}
          >
            <Ionicons name="arrow-back" size={18} color={c.text} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text style={[styles.title, { color: c.text }]}>{t.duas}</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: c.tint + "18", borderColor: c.tint + "30" }]}>
            <Text style={[styles.countBadgeText, { color: c.tint }]}>{filtered.length}</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setActiveCategory("all"); }}
            style={[
              styles.chip,
              activeCategory === "all"
                ? { backgroundColor: c.tint, borderColor: c.tint }
                : { backgroundColor: "#1A2236", borderColor: c.border },
            ]}
          >
            <Text style={[styles.chipText, { color: activeCategory === "all" ? "#000" : c.textSecondary }]}>
              {t.allFilter}
            </Text>
          </Pressable>
          {DUA_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat.key); }}
              style={[
                styles.chip,
                activeCategory === cat.key
                  ? { backgroundColor: c.tint, borderColor: c.tint }
                  : { backgroundColor: "#1A2236", borderColor: c.border },
              ]}
            >
              <Text style={[styles.chipText, { color: activeCategory === cat.key ? "#000" : c.textSecondary }]}>
                {t[DUA_CAT_KEY[cat.key]] as string}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </LinearGradient>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderDua}
        contentContainerStyle={[styles.listContent, Platform.OS === "web" && { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>{t.notFound}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { flex: 1 },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 10,
  },
  duaCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
  },
  cardInner: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  duaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  catLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  duaTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  chevronBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  duaArabic: {
    fontSize: 24,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
    textAlign: "right",
    lineHeight: 44,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  translitBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  translitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  translitDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  translitLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  translitText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    fontStyle: "italic",
  },
  meaningBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  duaMeaning: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sourceText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
});
