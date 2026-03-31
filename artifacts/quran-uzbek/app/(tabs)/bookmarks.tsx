import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <Text style={[styles.title, { color: c.text }]}>{t.bookmarksTitle}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {t.savedVerses(bookmarks.length)}
        </Text>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={56} color={c.textMuted} />
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
              style={({ pressed }) => [
                styles.bookmarkCard,
                { backgroundColor: c.card, borderColor: c.border },
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.surahBadge, { backgroundColor: c.tint + "22", borderColor: c.tint + "44" }]}>
                  <Text style={[styles.surahBadgeText, { color: c.tint }]}>
                    {getBookmarkSurahName(item.surahNo, item.surahName)} • {item.ayahNo}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDelete(item)}
                  style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.5 }]}
                >
                  <Ionicons name="trash-outline" size={18} color={c.textMuted} />
                </Pressable>
              </View>

              <Text
                style={[styles.arabicText, { color: c.arabicText }]}
                numberOfLines={3}
              >
                {item.arabic}
              </Text>

              {item.uzbek && (
                <Text
                  style={[styles.uzbekText, { color: c.uzbekText }]}
                  numberOfLines={2}
                >
                  {language === "uz_latin" ? cyrillicToLatin(item.uzbek) : item.uzbek}
                </Text>
              )}

              <Text style={[styles.dateText, { color: c.textMuted }]}>
                {formatDate(item.createdAt)}
              </Text>
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
    paddingBottom: 12,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 10,
  },
  bookmarkCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  surahBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  surahBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  deleteBtn: {
    padding: 6,
  },
  arabicText: {
    fontSize: 22,
    textAlign: "right",
    lineHeight: 44,
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
  },
  uzbekText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingTop: 10,
  },
  dateText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
