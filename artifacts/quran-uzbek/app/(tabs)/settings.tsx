import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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

type SectionIconName = React.ComponentProps<typeof Ionicons>["name"];

function SectionHeader({ icon, label, color }: { icon: SectionIconName; label: string; color: string }) {
  return (
    <View style={sectionHeaderStyles.row}>
      <View style={[sectionHeaderStyles.iconBox, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <Text style={[sectionHeaderStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

const sectionHeaderStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

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
      contentContainerStyle={[styles.content, Platform.OS === "web" && { paddingBottom: 34 + 84 }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={["#0d1829", "#0A0F1E"]}
        style={[styles.pageHeader, { paddingTop: topPadding + 16 }]}
      >
        <Text style={[styles.title, { color: c.text }]}>{t.settingsTitle}</Text>
        <View style={[styles.statsBadge, { backgroundColor: c.tint + "15", borderColor: c.tint + "30" }]}>
          <Ionicons name="book-outline" size={13} color={c.tint} />
          <Text style={[styles.statsText, { color: c.tint }]}>
            {t.surahsRead(completedSurahs.length)}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.sections}>
        <View style={styles.section}>
          <SectionHeader icon="language-outline" label={t.language} color="#7ab0e0" />
          <View style={[styles.card, { backgroundColor: "#101828", borderColor: c.border }]}>
            {languages.map((lang, idx) => (
              <Pressable
                key={lang.value}
                onPress={() => { Haptics.selectionAsync(); updateSettings({ language: lang.value }); }}
                style={[
                  styles.option,
                  idx < languages.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
                  settings.language === lang.value && { backgroundColor: c.tint + "08" },
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
          <SectionHeader icon="book-outline" label={t.readingMode} color="#9b8fea" />
          <View style={[styles.card, { backgroundColor: "#101828", borderColor: c.border }]}>
            {readingModes.map((mode, idx) => (
              <Pressable
                key={mode.value}
                onPress={() => { Haptics.selectionAsync(); updateSettings({ readingMode: mode.value }); }}
                style={[
                  styles.option,
                  idx < readingModes.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
                  settings.readingMode === mode.value && { backgroundColor: c.tint + "08" },
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
          <SectionHeader icon="settings-outline" label={t.recitationSettings} color="#4caf76" />
          <View style={[styles.card, { backgroundColor: "#101828", borderColor: c.border }]}>
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
          <SectionHeader icon="text-outline" label={t.arabicFontSize} color={c.tint} />
          <View style={[styles.card, { backgroundColor: "#101828", borderColor: c.border }]}>
            <View style={styles.fontSizeRow}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateSettings({ arabicFontSize: Math.max(20, settings.arabicFontSize - 2) }); }}
                style={[styles.sizeBtn, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <Ionicons name="remove" size={22} color={c.text} />
              </Pressable>
              <View style={styles.previewCenter}>
                <Text style={[styles.arabicPreview, { color: c.arabicText, fontSize: settings.arabicFontSize }]}>
                  بِسْمِ اللَّهِ
                </Text>
                <Text style={[styles.sizeLabel, { color: c.textMuted }]}>{settings.arabicFontSize}pt</Text>
              </View>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateSettings({ arabicFontSize: Math.min(48, settings.arabicFontSize + 2) }); }}
                style={[styles.sizeBtn, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <Ionicons name="add" size={22} color={c.text} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader icon="text-outline" label={t.translationFontSize} color="#8b9dc3" />
          <View style={[styles.card, { backgroundColor: "#101828", borderColor: c.border }]}>
            <View style={styles.fontSizeRow}>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateSettings({ translationFontSize: Math.max(12, settings.translationFontSize - 1) }); }}
                style={[styles.sizeBtn, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <Ionicons name="remove" size={22} color={c.text} />
              </Pressable>
              <View style={styles.previewCenter}>
                <Text style={[styles.translationPreview, { color: c.uzbekText, fontSize: settings.translationFontSize }]}>
                  {t.translationPreviewText}
                </Text>
                <Text style={[styles.sizeLabel, { color: c.textMuted }]}>{settings.translationFontSize}pt</Text>
              </View>
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); updateSettings({ translationFontSize: Math.min(22, settings.translationFontSize + 1) }); }}
                style={[styles.sizeBtn, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <Ionicons name="add" size={22} color={c.text} />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader icon="headset-outline" label={t.reciterTitle} color="#d4956a" />
          <View style={[styles.card, { backgroundColor: "#101828", borderColor: c.border }]}>
            {RECITERS.map((reciter, idx) => (
              <Pressable
                key={reciter.id}
                onPress={() => { Haptics.selectionAsync(); updateSettings({ reciterId: reciter.id }); }}
                style={[
                  styles.option,
                  idx < RECITERS.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
                  settings.reciterId === reciter.id && { backgroundColor: c.tint + "08" },
                ]}
              >
                <View style={styles.reciterLeft}>
                  <View style={[styles.reciterAvatar, { backgroundColor: settings.reciterId === reciter.id ? c.tint + "20" : c.border + "60" }]}>
                    <Ionicons name="person" size={16} color={settings.reciterId === reciter.id ? c.tint : c.textMuted} />
                  </View>
                  <View>
                    <Text style={[styles.optionText, { color: c.text }]}>
                      {settings.language === "ru" ? reciter.nameRu :
                       settings.language === "uz_cyrillic" ? reciter.nameUz :
                       reciter.name}
                    </Text>
                    <Text style={[styles.optionSub, { color: c.textSecondary }]}>{t.reciterStyle}</Text>
                  </View>
                </View>
                {settings.reciterId === reciter.id && (
                  <Ionicons name="checkmark-circle" size={22} color={c.tint} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader icon="cloud-download-outline" label={t.offlineCache} color="#4caf76" />
          <View style={[styles.card, { backgroundColor: "#101828", borderColor: c.border }]}>
            {isCacheDone ? (
              <View style={styles.cacheRow}>
                <View style={[styles.cacheIconBox, { backgroundColor: "#22c55e18", borderColor: "#22c55e30" }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                </View>
                <View style={styles.cacheInfo}>
                  <Text style={[styles.optionText, { color: c.text }]}>{t.offlineReady}</Text>
                  <Text style={[styles.optionSub, { color: c.textSecondary }]}>{t.offlineReadyDesc}</Text>
                </View>
              </View>
            ) : isCacheDownloading ? (
              <View style={styles.cacheRow}>
                <View style={[styles.cacheIconBox, { backgroundColor: c.tint + "18", borderColor: c.tint + "30" }]}>
                  <Ionicons name="cloud-download-outline" size={24} color={c.tint} />
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
                      style={[styles.cacheFill, { width: `${Math.max(cacheProgress, 2)}%` as any, backgroundColor: c.tint }]}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.cacheRow}>
                <View style={[styles.cacheIconBox, { backgroundColor: c.textMuted + "20", borderColor: c.border }]}>
                  <Ionicons name="cloud-outline" size={24} color={c.textMuted} />
                </View>
                <View style={styles.cacheInfo}>
                  <Text style={[styles.optionText, { color: c.text }]}>{t.waitingNetwork}</Text>
                  <Text style={[styles.optionSub, { color: c.textSecondary }]}>{t.waitingNetworkDesc}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: "#101828", borderColor: c.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={c.textMuted} />
            <Text style={[styles.infoText, { color: c.textMuted }]}>{t.dataSource}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 120 },
  pageHeader: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  statsText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  sections: {
    paddingTop: 20,
    paddingHorizontal: 16,
    gap: 20,
  },
  section: { gap: 0 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  toggleInfo: { flex: 1, gap: 3 },
  optionText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  optionSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  fontSizeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  sizeBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  previewCenter: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  arabicPreview: {
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Arial" : "serif",
  },
  translationPreview: {
    flex: 0,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  sizeLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reciterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reciterAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cacheRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  cacheIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cacheInfo: { flex: 1, gap: 4 },
  cacheProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cachePercent: { fontSize: 13, fontFamily: "Inter_700Bold" },
  cacheTrack: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 4,
  },
  cacheFill: { height: 5, borderRadius: 3 },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
});
