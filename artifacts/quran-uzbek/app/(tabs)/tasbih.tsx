import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Circle, Defs, G, LinearGradient as SvgGradient, Stop } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useQuran } from "@/context/QuranContext";
import { getStrings } from "@/constants/i18n";
import { latinToRussianTranslit } from "@/constants/russianTranslit";

const MECCA_LAT = 21.4225;
const MECCA_LON = 39.8262;
const TASHKENT_LAT = 41.2995;
const TASHKENT_LON = 69.2401;

const DHIKR_LIST = [
  { arabic: "سُبْحَانَ اللّٰهِ", name: "Subhanalloh", key: "dhikrSubhanallah" as const },
  { arabic: "الْحَمْدُ لِلّٰهِ", name: "Alhamdulilloh", key: "dhikrAlhamdulillah" as const },
  { arabic: "اللّٰهُ أَكْبَرُ", name: "Allohu akbar", key: "dhikrAllahuAkbar" as const },
  { arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ", name: "La ilaha illalloh", key: "dhikrLaIlaha" as const },
  { arabic: "أَسْتَغْفِرُ اللّٰهَ", name: "Astaghfirulloh", key: "dhikrAstaghfirullah" as const },
];

type TabType = "tasbih" | "qibla";

function calcBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

function ProgressRing({
  count,
  target,
  size = 280,
  strokeWidth = 18,
}: {
  count: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}) {
  const c = Colors.dark;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(count / target, 1);
  const dashOffset = circumference * (1 - progress);
  const cx = size / 2;
  const cy = size / 2;
  const isComplete = progress >= 1;

  return (
    <Svg width={size} height={size} style={{ position: "absolute" }}>
      <Defs>
        <SvgGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={isComplete ? "#1DB954" : "#D4AF37"} stopOpacity="1" />
          <Stop offset="100%" stopColor={isComplete ? "#16a34a" : "#b8952a"} stopOpacity="1" />
        </SvgGradient>
      </Defs>
      <G transform={`rotate(-90, ${cx}, ${cy})`}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

function TasbihView({ bottomInset }: { bottomInset: number }) {
  const c = Colors.dark;
  const { settings } = useQuran();
  const t = getStrings(settings.language);
  const [selectedDhikr, setSelectedDhikr] = useState(0);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [customTarget, setCustomTarget] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [completed, setCompleted] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const celebAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handleTap = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.93, duration: 70, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setCount((prev) => {
      const next = prev + 1;
      if (next >= target) {
        setCompleted((c) => c + 1);
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        Animated.sequence([
          Animated.timing(celebAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.delay(1200),
          Animated.timing(celebAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
        return 0;
      }
      return next;
    });
  }, [target, scaleAnim, celebAnim, glowAnim]);

  const handleLongPress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    Alert.alert(
      t.resetCounter,
      t.resetConfirm,
      [
        { text: t.cancel, style: "cancel" },
        {
          text: t.confirmReset,
          style: "destructive",
          onPress: () => {
            setCount(0);
            setCompleted(0);
          },
        },
      ]
    );
  }, [t]);

  const setTargetOption = useCallback((val: number) => {
    setTarget(val);
    setCount(0);
    setShowCustom(false);
  }, []);

  const applyCustomTarget = useCallback(() => {
    const n = parseInt(customTarget, 10);
    if (n > 0 && n <= 9999) {
      setTarget(n);
      setCount(0);
      setShowCustom(false);
    }
  }, [customTarget]);

  const dhikr = DHIKR_LIST[selectedDhikr];

  const celebStyle = {
    opacity: celebAnim,
    transform: [
      {
        scale: celebAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
        }),
      },
      {
        translateY: celebAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const dhikrName =
    settings.language === "ru" || settings.language === "uz_cyrillic"
      ? latinToRussianTranslit(dhikr.name)
      : dhikr.name;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: bottomInset + 120 }}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dhikrScroll}
      >
        {DHIKR_LIST.map((d, i) => {
          const active = selectedDhikr === i;
          const dName =
            settings.language === "ru" || settings.language === "uz_cyrillic"
              ? latinToRussianTranslit(d.name)
              : d.name;
          return (
            <Pressable
              key={i}
              onPress={() => {
                setSelectedDhikr(i);
                setCount(0);
                setCompleted(0);
              }}
              style={[
                styles.dhikrChip,
                {
                  backgroundColor: active ? c.tint + "18" : c.card,
                  borderColor: active ? c.tint : c.border,
                },
              ]}
            >
              <Text style={[styles.dhikrChipArabic, { color: active ? c.tint : c.arabicText, opacity: active ? 1 : 0.7 }]}>
                {d.arabic}
              </Text>
              <Text style={[styles.dhikrChipText, { color: active ? c.tint : c.textSecondary }]}>
                {dName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.mainCard, { backgroundColor: "#101828", borderColor: c.border }]}>
        <Text style={[styles.cardArabic, { color: c.arabicText }]}>{dhikr.arabic}</Text>
        <Text style={[styles.cardMeaning, { color: c.tint }]}>{dhikrName}</Text>
        <Text style={[styles.cardTranslation, { color: c.textMuted }]}>{t[dhikr.key]}</Text>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        <View style={styles.ringWrapper}>
          <ProgressRing count={count} target={target} size={280} strokeWidth={18} />

          <Animated.View style={[styles.tapButtonOuter, { transform: [{ scale: scaleAnim }] }]}>
            <Pressable
              onPress={handleTap}
              onLongPress={handleLongPress}
              delayLongPress={600}
              style={styles.tapPressable}
            >
              <LinearGradient
                colors={["#1E2B45", "#111827"]}
                style={[styles.tapGradient, { borderColor: c.tint + "40" }]}
              >
                <Text style={[styles.countNumber, { color: count > 0 ? c.tint : c.text }]}>
                  {count}
                </Text>
                <View style={styles.progressTextRow}>
                  <Text style={[styles.progressSlash, { color: c.textMuted }]}>/ </Text>
                  <Text style={[styles.progressTarget, { color: c.textMuted }]}>{target}</Text>
                </View>
                <Text style={[styles.tapHint, { color: c.textSecondary }]}>{t.tap}</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View style={[styles.celebBadge, celebStyle]}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.celebText}>{target} {t.times}!</Text>
          </Animated.View>
        </View>

        {completed > 0 && (
          <View style={[styles.completedRow, { backgroundColor: "#1DB95418", borderColor: "#1DB95440" }]}>
            <Ionicons name="checkmark-circle" size={15} color="#1DB954" />
            <Text style={[styles.completedText, { color: "#1DB954" }]}>
              {t.tasbihRepeated(completed, target)}
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.targetCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.targetLabel, { color: c.textMuted }]}>{t.target}</Text>
        <View style={styles.targetBtns}>
          {[33, 99].map((val) => (
            <Pressable
              key={val}
              onPress={() => setTargetOption(val)}
              style={[
                styles.targetBtn,
                target === val
                  ? { backgroundColor: c.tint }
                  : { backgroundColor: "transparent", borderColor: c.border, borderWidth: 1 },
              ]}
            >
              <Text style={[styles.targetBtnText, { color: target === val ? "#000" : c.textSecondary }]}>
                {val}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setShowCustom(!showCustom)}
            style={[
              styles.targetBtn,
              showCustom || (target !== 33 && target !== 99)
                ? { backgroundColor: c.tint }
                : { backgroundColor: "transparent", borderColor: c.border, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.targetBtnText,
                {
                  color:
                    showCustom || (target !== 33 && target !== 99) ? "#000" : c.textSecondary,
                },
              ]}
            >
              {target !== 33 && target !== 99 ? `${target}` : t.other}
            </Text>
          </Pressable>
        </View>

        {showCustom && (
          <View style={styles.customRow}>
            <TextInput
              value={customTarget}
              onChangeText={setCustomTarget}
              placeholder={t.enterNumber}
              placeholderTextColor={c.textMuted}
              keyboardType="number-pad"
              style={[
                styles.customInput,
                { color: c.text, backgroundColor: c.background, borderColor: c.border },
              ]}
            />
            <Pressable
              onPress={applyCustomTarget}
              style={[styles.customApply, { backgroundColor: c.tint }]}
            >
              <Text style={styles.customApplyText}>OK</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function QiblaView() {
  const c = Colors.dark;
  const { settings } = useQuran();
  const t = getStrings(settings.language);
  const [bearing, setBearing] = useState<number | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [hasSensor, setHasSensor] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const subscriptionRef = useRef<ReturnType<typeof Magnetometer.addListener> | null>(null);

  useEffect(() => {
    (async () => {
      let lat = TASHKENT_LAT;
      let lon = TASHKENT_LON;
      let fallback = true;

      if (Platform.OS !== "web") {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Low,
            });
            lat = loc.coords.latitude;
            lon = loc.coords.longitude;
            fallback = false;
          }
        } catch {}
      }

      setUsingFallback(fallback);
      const b = calcBearing(lat, lon, MECCA_LAT, MECCA_LON);
      setBearing(b);
    })();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      setHasSensor(false);
      return;
    }

    Magnetometer.isAvailableAsync().then((available) => {
      setHasSensor(available);
      if (!available) return;

      Magnetometer.setUpdateInterval(100);
      subscriptionRef.current = Magnetometer.addListener(({ x, y }) => {
        const angle = Math.atan2(-y, x) * (180 / Math.PI);
        setHeading(((angle + 360) % 360));
      });
    });

    return () => {
      subscriptionRef.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (bearing === null) return;
    const qiblaAngle = hasSensor ? (bearing - heading + 360) % 360 : bearing;
    Animated.timing(rotateAnim, {
      toValue: qiblaAngle,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [bearing, heading, hasSensor]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 359],
    outputRange: ["0deg", "359deg"],
    extrapolate: "clamp",
  });

  const displayBearing = bearing !== null ? Math.round(bearing) : 0;
  const compassDirs = [t.compassN, t.compassE, t.compassS, t.compassW];

  return (
    <View style={styles.qiblaContainer}>
      <View style={[styles.compassOuter, { borderColor: c.tint + "30", backgroundColor: "#101828" }]}>
        <View style={[styles.compassMid, { borderColor: c.border }]}>
          <View style={[styles.compassRing, { borderColor: c.tint + "20" }]}>
            {compassDirs.map((dir, i) => {
              const angle = i * 90;
              const rad = (angle - 90) * (Math.PI / 180);
              const r = 95;
              const x = Math.cos(rad) * r;
              const y = Math.sin(rad) * r;
              return (
                <Text
                  key={dir}
                  style={[
                    styles.compassDir,
                    {
                      color: i === 0 ? c.tint : c.textSecondary,
                      fontFamily: i === 0 ? "Inter_700Bold" : "Inter_500Medium",
                      transform: [{ translateX: x }, { translateY: y }],
                      position: "absolute",
                    },
                  ]}
                >
                  {dir}
                </Text>
              );
            })}

            <Animated.View style={[styles.needleWrapper, { transform: [{ rotate: spin }] }]}>
              <LinearGradient
                colors={[c.tint, "#b8952a"]}
                style={styles.needleTop}
              />
              <View style={[styles.needleBottom, { backgroundColor: c.textMuted + "80" }]} />
            </Animated.View>

            <View style={[styles.compassCenter, { backgroundColor: c.tint, borderColor: "#101828" }]} />
          </View>
        </View>
      </View>

      <View style={[styles.qiblaInfoCard, { backgroundColor: "#101828", borderColor: c.border }]}>
        <Text style={[styles.qiblaLabel, { color: c.text }]}>{t.qiblaDirection}</Text>
        <Text style={[styles.qiblaDegrees, { color: c.tint }]}>
          {displayBearing}° {t.compassN}
        </Text>
      </View>

      {(usingFallback || !hasSensor) && (
        <View style={[styles.fallbackNote, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="information-circle-outline" size={14} color={c.textMuted} />
          <Text style={[styles.fallbackText, { color: c.textMuted }]}>
            {usingFallback ? t.qiblaPermission : t.networkError}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TasbihScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const { settings } = useQuran();
  const t = getStrings(settings.language);
  const [activeTab, setActiveTab] = useState<TabType>("tasbih");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 0 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={{ paddingTop: topPadding + 12, paddingHorizontal: 16, marginBottom: 12 }}>
        <Text style={[styles.screenTitle, { color: c.text }]}>{t.tasbih}</Text>

        <View style={[styles.tabRow, { backgroundColor: "#101828", borderColor: c.border }]}>
          <Pressable
            onPress={() => setActiveTab("tasbih")}
            style={[styles.tabBtn, activeTab === "tasbih" && { backgroundColor: c.tint }]}
          >
            <MaterialCommunityIcons
              name="counter"
              size={16}
              color={activeTab === "tasbih" ? "#000" : c.textSecondary}
            />
            <Text style={[styles.tabBtnText, { color: activeTab === "tasbih" ? "#000" : c.textSecondary }]}>
              {t.tasbih}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("qibla")}
            style={[styles.tabBtn, activeTab === "qibla" && { backgroundColor: c.tint }]}
          >
            <Ionicons
              name="compass-outline"
              size={16}
              color={activeTab === "qibla" ? "#000" : c.textSecondary}
            />
            <Text style={[styles.tabBtnText, { color: activeTab === "qibla" ? "#000" : c.textSecondary }]}>
              {t.qibla}
            </Text>
          </Pressable>
        </View>
      </View>

      {activeTab === "tasbih" ? <TasbihView bottomInset={bottomInset} /> : <QiblaView />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  dhikrScroll: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 4,
    paddingTop: 4,
  },
  dhikrChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 3,
    minWidth: 100,
  },
  dhikrChipArabic: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    writingDirection: "rtl",
  },
  dhikrChipText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },

  mainCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: "center",
  },
  cardArabic: {
    fontSize: 38,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    writingDirection: "rtl",
    lineHeight: 56,
  },
  cardMeaning: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  cardTranslation: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  divider: {
    width: "100%",
    height: 1,
    marginVertical: 24,
    opacity: 0.5,
  },

  ringWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 280,
    height: 280,
  },
  tapButtonOuter: {
    width: 230,
    height: 230,
    borderRadius: 115,
  },
  tapPressable: {
    flex: 1,
    borderRadius: 115,
    overflow: "hidden",
  },
  tapGradient: {
    flex: 1,
    borderRadius: 115,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  countNumber: {
    fontSize: 80,
    fontFamily: "Inter_700Bold",
    lineHeight: 88,
    includeFontPadding: false,
  },
  progressTextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressSlash: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  progressTarget: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  tapHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  celebBadge: {
    position: "absolute",
    bottom: -14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1DB954",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  celebText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },

  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "stretch",
  },
  completedText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },

  targetCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  targetLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  targetBtns: {
    flexDirection: "row",
    gap: 8,
  },
  targetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  targetBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  customRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    alignItems: "center",
  },
  customInput: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  customApply: {
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
  },
  customApplyText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },

  qiblaContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 20,
  },
  compassOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  compassMid: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  compassRing: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  compassDir: {
    fontSize: 15,
    textAlign: "center",
  },
  needleWrapper: {
    width: 8,
    height: 140,
    alignItems: "center",
    position: "absolute",
  },
  needleTop: {
    width: 6,
    flex: 1,
    borderRadius: 3,
  },
  needleBottom: {
    width: 6,
    flex: 1,
    borderRadius: 3,
  },
  compassCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: "absolute",
    borderWidth: 3,
  },
  qiblaInfoCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 32,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  qiblaLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  qiblaDegrees: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  fallbackNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
  },
  fallbackText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
});
