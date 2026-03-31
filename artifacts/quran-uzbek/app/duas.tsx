import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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

export default function DuasScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
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

  const renderDua = ({ item }: { item: Dua }) => {
    const isExpanded = expandedId === item.id;
    return (
      <Pressable
        onPress={() => toggleExpanded(item.id)}
        style={[styles.duaCard, { backgroundColor: c.card, borderColor: isExpanded ? c.tint + "60" : c.border }]}
      >
        <View style={styles.duaHeader}>
          <View style={[styles.duaCategoryDot, { backgroundColor: c.tint + "30", borderColor: c.tint + "50" }]}>
            <Text style={[styles.duaCategoryLabel, { color: c.tint }]}>
              {DUA_CATEGORIES.find((cat) => cat.key === item.category)?.label ?? item.category}
            </Text>
          </View>
          <Text style={[styles.duaTitle, { color: c.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={c.textMuted}
          />
        </View>

        <Text style={[styles.duaArabic, { color: c.text }]} numberOfLines={isExpanded ? undefined : 2}>
          {item.arabic}
        </Text>

        {isExpanded && (
          <>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <View style={[styles.translitBox, { backgroundColor: c.background }]}>
              <Text style={[styles.translitLabel, { color: c.textMuted }]}>Translit</Text>
              <Text style={[styles.translitText, { color: c.textSecondary }]}>
                {item.transliteration}
              </Text>
            </View>
            <Text style={[styles.duaUzbek, { color: c.textSecondary }]}>
              {item.uzbek}
            </Text>
          </>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 8, backgroundColor: c.background }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={c.text} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text style={[styles.title, { color: c.text }]}>Duolar</Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]}>{filtered.length} ta dua</Text>
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
              {
                backgroundColor: activeCategory === "all" ? c.tint : c.card,
                borderColor: activeCategory === "all" ? c.tint : c.border,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: activeCategory === "all" ? "#000" : c.textSecondary }]}>
              Barchasi
            </Text>
          </Pressable>
          {DUA_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.key}
              onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat.key); }}
              style={[
                styles.chip,
                {
                  backgroundColor: activeCategory === cat.key ? c.tint : c.card,
                  borderColor: activeCategory === cat.key ? c.tint : c.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: activeCategory === cat.key ? "#000" : c.textSecondary }]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderDua}
        contentContainerStyle={[styles.listContent, Platform.OS === "web" && { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="book-outline" size={48} color={c.textMuted} />
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>Hech narsa topilmadi</Text>
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
    paddingBottom: 10,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 10,
  },
  duaCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    marginBottom: 10,
  },
  duaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  duaCategoryDot: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  duaCategoryLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  duaTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  duaArabic: {
    fontSize: 20,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
    textAlign: "right",
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  translitBox: {
    borderRadius: 8,
    padding: 10,
    gap: 3,
  },
  translitLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  translitText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    fontStyle: "italic",
  },
  duaUzbek: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
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
