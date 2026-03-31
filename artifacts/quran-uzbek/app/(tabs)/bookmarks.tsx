import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useQuran } from "@/context/QuranContext";
import { Bookmark } from "@/types/quran";
import { UZBEK_NAMES } from "@/constants/uzbekNames";
import { RUSSIAN_NAMES } from "@/constants/russianNames";
import { cyrillicToLatin } from "@/constants/latinScript";
import { getStrings } from "@/constants/i18n";

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const { bookmarks, removeBookmark, settings } = useQuran();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const t = getStrings(settings.language);
  const language = settings.language;

  const getBookmarkSurahName = (surahNo: number, surahName: string) => {
    if (language === "uz_latin") return cyrillicToLatin(UZBEK_NAMES[surahNo] || "") || surahName;
    if (language === "uz_cyrillic" || language === "ru") return RUSSIAN_NAMES[surahNo] || surahName;
    return surahName;
  };

  const handleDelete = (bk: Bookmark) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    removeBookmark(bk.surahNo, bk.ayahNo);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <LinearGradient
        colors={["#0d1829", "#0A0F1E"]}
        style={[styles.header, { paddingTop: topPadding + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: c.text }]}>{t.bookmarksTitle}</Text>
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>
              {t.savedVerses(bookmarks.length)}
            </Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: c.tint + "20", borderColor: c.tint + "40" }]}>
            <Ionicons name="bookmark" size={14} color={c.tint} />
            <Text style={[styles.countBadgeText, { color: c.tint }]}>{bookmarks.length}</Text>
          </View>
        </View>
      </LinearGradient>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="bookmark-outline" size={36} color={c.textMuted} />
          </View>
          <Text style={[styles.emptyTitle, { color: c.text }]}>{t.noBookmarks}</Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            {t.noBookmarksDesc}
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            Platform.OS === "web" && { paddingBottom: 34 + 84 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/surah/${item.surahNo}?ayah=${item.ayahNo}`);
              }}
              style={({ pressed }) => [pressed && { opacity: 0.85 }]}
            >
              <View style={[styles.bookmarkCard, { backgroundColor: "#101828", borderColor: c.border }]}>
                <View style={[styles.accentBar, { backgroundColor: c.tint }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardMeta}>
                      <Text style={[styles.surahLabel, { color: c.tint }]}>
                        {getBookmarkSurahName(item.surahNo, item.surahName)}
                      </Text>
                      <View style={[styles.ayahBadge, { backgroundColor: c.tint + "18" }]}>
                        <Text style={[styles.ayahBadgeText, { color: c.tint }]}>{item.ayahNo}</Text>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => handleDelete(item)}
                      style={({ pressed }) => [
                        styles.deleteBtn,
                        { backgroundColor: pressed ? "#ff444418" : "transparent" },
                      ]}
                      hitSlop={6}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ff4444" />
                    </Pressable>
                  </View>

                  <Text
                    style={[styles.arabicText, { color: c.arabicText }]}
                    numberOfLines={3}
                  >
                    {item.arabic}
                  </Text>

                  {item.uzbek && (
                    <View style={[styles.translationBox, { backgroundColor: c.background + "80", borderColor: c.border }]}>
                      <Text
                        style={[styles.uzbekText, { color: c.uzbekText }]}
                        numberOfLines={2}
                      >
                        {language === "uz_latin" ? cyrillicToLatin(item.uzbek) : item.uzbek}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <Ionicons name="calendar-outline" size={11} color={c.textMuted} />
                    <Text style={[styles.dateText, { color: c.textMuted }]}>{formatDate(item.createdAt)}</Text>
                    <View style={styles.footerSpacer} />
                    <Ionicons name="chevron-forward" size={13} color={c.textMuted} />
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 12,
  },
  bookmarkCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    borderRadius: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  surahLabel: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  ayahBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  ayahBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  arabicText: {
    fontSize: 24,
    textAlign: "right",
    lineHeight: 44,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
  },
  translationBox: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  uzbekText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  footerSpacer: { flex: 1 },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
