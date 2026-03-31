import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useQuran } from "@/context/QuranContext";
import { RECITERS, TOTAL_SURAHS } from "@/constants/api";
import { ReadingMode, AppLanguage } from "@/types/quran";
import { getStrings } from "@/constants/i18n";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const { settings, updateSettings, completedSurahs, cacheProgress, isCacheDownloading, isCacheDone } = useQuran();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const t = getStrings(settings.language);

  const readingModes: { value: ReadingMode; label: string }[] = [
    { value: "both", label: t.readingModeBoth },
    { value: "arabic-only", label: t.readingModeArabicOnly },
    { value: "translation", label: t.readingModeTranslationOnly },
  ];

  const languages: { value: AppLanguage; label: string; sub: string }[] = [
    { value: "uz_cyrillic", label: "Кирилл", sub: "Ўзбек кириллча" },
    { value: "uz_latin", label: "Lotin", sub: "O\u02bbzbek lotincha" },
    { value: "ru", label: "Русский", sub: "Russian" },
    { value: "en", label: "English", sub: "English" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.content,
        Platform.OS === "web" && { paddingBottom: 34 + 84 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPadding + 12, paddingHorizontal: 16, marginBottom: 24 }}>
        <Text style={[styles.title, { color: c.text }]}>{t.settingsTitle}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {t.surahsRead(completedSurahs.length)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{t.language}</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {languages.map((lang, idx) => (
            <Pressable
              key={lang.value}
              onPress={() => {
                Haptics.selectionAsync();
                updateSettings({ language: lang.value });
              }}
              style={[
                styles.option,
                idx < languages.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
              ]}
            >
              <View>
                <Text style={[styles.optionText, { color: c.text }]}>{lang.label}</Text>
                <Text style={[styles.optionSub, { color: c.textSecondary }]}>{lang.sub}</Text>
              </View>
              {settings.language === lang.value && (
                <Ionicons name="checkmark-circle" size={22} color={c.tint} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{t.readingMode}</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {readingModes.map((mode, idx) => (
            <Pressable
              key={mode.value}
              onPress={() => {
                Haptics.selectionAsync();
                updateSettings({ readingMode: mode.value });
              }}
              style={[
                styles.option,
                idx < readingModes.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
              ]}
            >
              <Text style={[styles.optionText, { color: c.text }]}>{mode.label}</Text>
              {settings.readingMode === mode.value && (
                <Ionicons name="checkmark-circle" size={22} color={c.tint} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{t.recitationSettings}</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: c.border }]}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.optionText, { color: c.text }]}>{t.transliteration}</Text>
              <Text style={[styles.optionSub, { color: c.textSecondary }]}>{t.transliterationDesc}</Text>
            </View>
            <Switch
              value={settings.showTransliteration}
              onValueChange={(v) => { Haptics.selectionAsync(); updateSettings({ showTransliteration: v }); }}
              trackColor={{ true: c.tint, false: c.border }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.optionText, { color: c.text }]}>{t.wordByWord}</Text>
              <Text style={[styles.optionSub, { color: c.textSecondary }]}>{t.wordByWordDesc}</Text>
            </View>
            <Switch
              value={settings.showWordByWord}
              onValueChange={(v) => { Haptics.selectionAsync(); updateSettings({ showWordByWord: v }); }}
              trackColor={{ true: c.tint, false: c.border }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{t.arabicFontSize}</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.sliderRow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateSettings({ arabicFontSize: Math.max(20, settings.arabicFontSize - 2) });
              }}
              style={[styles.sizeBtn, { backgroundColor: c.background, borderColor: c.border }]}
            >
              <Ionicons name="remove" size={20} color={c.text} />
            </Pressable>
            <Text style={[styles.arabicPreview, { color: c.arabicText, fontSize: settings.arabicFontSize }]}>
              بِسْمِ اللَّهِ
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateSettings({ arabicFontSize: Math.min(48, settings.arabicFontSize + 2) });
              }}
              style={[styles.sizeBtn, { backgroundColor: c.background, borderColor: c.border }]}
            >
              <Ionicons name="add" size={20} color={c.text} />
            </Pressable>
          </View>
          <Text style={[styles.sizeLabel, { color: c.textMuted }]}>{settings.arabicFontSize}pt</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{t.translationFontSize}</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.sliderRow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateSettings({ translationFontSize: Math.max(12, settings.translationFontSize - 1) });
              }}
              style={[styles.sizeBtn, { backgroundColor: c.background, borderColor: c.border }]}
            >
              <Ionicons name="remove" size={20} color={c.text} />
            </Pressable>
            <Text style={[styles.translationPreview, { color: c.uzbekText, fontSize: settings.translationFontSize }]}>
              {t.translationPreviewText}
            </Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                updateSettings({ translationFontSize: Math.min(22, settings.translationFontSize + 1) });
              }}
              style={[styles.sizeBtn, { backgroundColor: c.background, borderColor: c.border }]}
            >
              <Ionicons name="add" size={20} color={c.text} />
            </Pressable>
          </View>
          <Text style={[styles.sizeLabel, { color: c.textMuted }]}>{settings.translationFontSize}pt</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{t.reciterTitle}</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {RECITERS.map((reciter, idx) => (
            <Pressable
              key={reciter.id}
              onPress={() => {
                Haptics.selectionAsync();
                updateSettings({ reciterId: reciter.id });
              }}
              style={[
                styles.option,
                idx < RECITERS.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
              ]}
            >
              <View>
                <Text style={[styles.optionText, { color: c.text }]}>{reciter.name}</Text>
                <Text style={[styles.optionSub, { color: c.textSecondary }]}>{t.reciterStyle}</Text>
              </View>
              {settings.reciterId === reciter.id && (
                <Ionicons name="checkmark-circle" size={22} color={c.tint} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{t.offlineCache}</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {isCacheDone ? (
            <View style={styles.cacheRow}>
              <View style={[styles.cacheIconBox, { backgroundColor: "#22c55e18" }]}>
                <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
              </View>
              <View style={styles.cacheInfo}>
                <Text style={[styles.optionText, { color: c.text }]}>{t.offlineReady}</Text>
                <Text style={[styles.optionSub, { color: c.textSecondary }]}>
                  {t.offlineReadyDesc}
                </Text>
              </View>
            </View>
          ) : isCacheDownloading ? (
            <View style={styles.cacheRow}>
              <View style={[styles.cacheIconBox, { backgroundColor: c.tint + "18" }]}>
                <Ionicons name="cloud-download-outline" size={22} color={c.tint} />
              </View>
              <View style={styles.cacheInfo}>
                <View style={styles.cacheProgressHeader}>
                  <Text style={[styles.optionText, { color: c.text }]}>{t.downloading}</Text>
                  <Text style={[styles.cachePercent, { color: c.tint }]}>{cacheProgress}%</Text>
                </View>
                <Text style={[styles.optionSub, { color: c.textSecondary }]}>
                  {t.downloadingDesc(Math.round((cacheProgress / 100) * TOTAL_SURAHS))}
                </Text>
                <View style={[styles.cacheTrack, { backgroundColor: c.background }]}>
                  <View
                    style={[
                      styles.cacheFill,
                      { width: `${Math.max(cacheProgress, 2)}%` as any, backgroundColor: c.tint },
                    ]}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.cacheRow}>
              <View style={[styles.cacheIconBox, { backgroundColor: c.textMuted + "20" }]}>
                <Ionicons name="cloud-outline" size={22} color={c.textMuted} />
              </View>
              <View style={styles.cacheInfo}>
                <Text style={[styles.optionText, { color: c.text }]}>{t.waitingNetwork}</Text>
                <Text style={[styles.optionSub, { color: c.textSecondary }]}>
                  {t.waitingNetworkDesc}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={18} color={c.textSecondary} />
            <Text style={[styles.infoText, { color: c.textSecondary }]}>
              {t.dataSource}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 120 },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
    gap: 2,
  },
  optionText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  optionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  sizeBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  arabicPreview: {
    flex: 1,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
  },
  translationPreview: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  sizeLabel: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    paddingBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  cacheRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cacheIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cacheInfo: {
    flex: 1,
    gap: 4,
  },
  cacheProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cachePercent: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  cacheTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 4,
  },
  cacheFill: {
    height: 5,
    borderRadius: 3,
  },
});
