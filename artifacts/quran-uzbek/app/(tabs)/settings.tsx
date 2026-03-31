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
import { RECITERS } from "@/constants/api";
import { ReadingMode } from "@/types/quran";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const { settings, updateSettings, completedSurahs } = useQuran();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const readingModes: { value: ReadingMode; label: string }[] = [
    { value: "both", label: "Arabcha + Tarjima" },
    { value: "arabic-only", label: "Faqat Arabcha" },
    { value: "translation", label: "Faqat Tarjima" },
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
        <Text style={[styles.title, { color: c.text }]}>Sozlamalar</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {completedSurahs.length}/114 sura o'qildi
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>O'QISH REJIMI</Text>
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
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>QIROAT SOZLAMALARI</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.toggleRow, { borderBottomWidth: 1, borderBottomColor: c.border }]}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.optionText, { color: c.text }]}>Transliteratsiya</Text>
              <Text style={[styles.optionSub, { color: c.textSecondary }]}>Arabcha so'zlarning lotin talaffuzi</Text>
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
              <Text style={[styles.optionText, { color: c.text }]}>So'z bo'yicha tarjima</Text>
              <Text style={[styles.optionSub, { color: c.textSecondary }]}>Har bir so'zga bosing (Inglizcha)</Text>
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
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>ARABCHA SHRIFT O'LCHAMI</Text>
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
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>TARJIMA SHRIFT O'LCHAMI</Text>
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
              Bismillahir Rohmanir Rohiym
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
        <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>QORI TANLASH</Text>
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
                <Text style={[styles.optionSub, { color: c.textSecondary }]}>{reciter.style}</Text>
              </View>
              {settings.reciterId === reciter.id && (
                <Ionicons name="checkmark-circle" size={22} color={c.tint} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={18} color={c.textSecondary} />
            <Text style={[styles.infoText, { color: c.textSecondary }]}>
              Ma'lumotlar quranapi.pages.dev dan olinadi
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
});
