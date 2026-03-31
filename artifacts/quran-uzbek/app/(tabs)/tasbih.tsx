import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import Svg, { Circle, G } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const MECCA_LAT = 21.4225;
const MECCA_LON = 39.8262;
const TASHKENT_LAT = 41.2995;
const TASHKENT_LON = 69.2401;

const DHIKR_LIST = [
  { arabic: "سُبْحَانَ اللّٰهِ", name: "Subhanalloh", meaning: "Alloh pokdir" },
  { arabic: "الْحَمْدُ لِلّٰهِ", name: "Alhamdulilloh", meaning: "Allohga hamd" },
  { arabic: "اللّٰهُ أَكْبَرُ", name: "Allohu akbar", meaning: "Alloh ulugʻdir" },
  { arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ", name: "La ilaha illalloh", meaning: "Allohdan oʻzga iloh yoʻq" },
  { arabic: "أَسْتَغْفِرُ اللّٰهَ", name: "Astaghfirulloh", meaning: "Allohdan magʻfirat" },
  { arabic: "صَلَّى اللّٰهُ عَلَيْهِ وَسَلَّمَ", name: "Sallavot", meaning: "Payʼgʼambarga salovat" },
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
  size = 220,
  strokeWidth = 14,
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

  return (
    <Svg width={size} height={size} style={{ position: "absolute" }}>
      <G transform={`rotate(-90, ${cx}, ${cy})`}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={progress >= 1 ? c.accent : c.tint}
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
  const [selectedDhikr, setSelectedDhikr] = useState(0);
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const [customTarget, setCustomTarget] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [completed, setCompleted] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const celebAnim = useRef(new Animated.Value(0)).current;

  const handleTap = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
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
          Animated.delay(600),
          Animated.timing(celebAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
        return 0;
      }
      return next;
    });
  }, [target, scaleAnim, celebAnim]);

  const handleLongPress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    Alert.alert(
      "Hisoblagichni nolga qaytarish",
      "Joriy hisobni nolga qaytarasizmi?",
      [
        { text: "Bekor qilish", style: "cancel" },
        {
          text: "Ha, nolga qaytarish",
          style: "destructive",
          onPress: () => {
            setCount(0);
            setCompleted(0);
          },
        },
      ]
    );
  }, []);

  const setTargetOption = useCallback((t: number) => {
    setTarget(t);
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
          outputRange: [0.8, 1.1],
        }),
      },
    ],
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: bottomInset + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dhikrScroll}
      >
        {DHIKR_LIST.map((d, i) => (
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
                backgroundColor:
                  selectedDhikr === i ? c.tint + "22" : c.card,
                borderColor:
                  selectedDhikr === i ? c.tint : c.border,
              },
            ]}
          >
            <Text
              style={[
                styles.dhikrChipText,
                { color: selectedDhikr === i ? c.tint : c.textSecondary },
              ]}
            >
              {d.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.arabicRow}>
        <Text style={[styles.arabicText, { color: c.arabicText }]}>
          {dhikr.arabic}
        </Text>
        <Text style={[styles.meaningText, { color: c.textMuted }]}>
          {dhikr.meaning}
        </Text>
      </View>

      <View style={styles.ringWrapper}>
        <ProgressRing count={count} target={target} size={220} />

        <Animated.View
          style={[styles.tapButton, { transform: [{ scale: scaleAnim }] }]}
        >
          <Pressable
            onPress={handleTap}
            onLongPress={handleLongPress}
            delayLongPress={600}
            style={[
              styles.tapInner,
              {
                backgroundColor: c.card,
                borderColor: c.border,
              },
            ]}
          >
            <Text style={[styles.countNumber, { color: c.text }]}>{count}</Text>
            <Text style={[styles.tapHint, { color: c.textMuted }]}>bosing</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.celebBadge, celebStyle]}>
          <Text style={styles.celebText}>✓ {target} marta!</Text>
        </Animated.View>
      </View>

      {completed > 0 && (
        <View style={[styles.completedRow, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="checkmark-circle" size={16} color={c.accent} />
          <Text style={[styles.completedText, { color: c.accent }]}>
            {completed} × {target} = {completed * target} marta takrorlandı
          </Text>
        </View>
      )}

      <View style={styles.targetRow}>
        <Text style={[styles.targetLabel, { color: c.textMuted }]}>Maqsad:</Text>
        {[33, 99].map((t) => (
          <Pressable
            key={t}
            onPress={() => setTargetOption(t)}
            style={[
              styles.targetBtn,
              {
                backgroundColor: target === t ? c.tint : c.card,
                borderColor: target === t ? c.tint : c.border,
              },
            ]}
          >
            <Text
              style={[
                styles.targetBtnText,
                { color: target === t ? "#000" : c.textSecondary },
              ]}
            >
              {t}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setShowCustom(!showCustom)}
          style={[
            styles.targetBtn,
            {
              backgroundColor:
                showCustom || (target !== 33 && target !== 99) ? c.tint : c.card,
              borderColor:
                showCustom || (target !== 33 && target !== 99) ? c.tint : c.border,
            },
          ]}
        >
          <Text
            style={[
              styles.targetBtnText,
              {
                color:
                  showCustom || (target !== 33 && target !== 99)
                    ? "#000"
                    : c.textSecondary,
              },
            ]}
          >
            {target !== 33 && target !== 99 ? `${target}` : "Boshqa"}
          </Text>
        </Pressable>
      </View>

      {showCustom && (
        <View style={styles.customRow}>
          <TextInput
            value={customTarget}
            onChangeText={setCustomTarget}
            placeholder="Raqam kiriting"
            placeholderTextColor={c.textMuted}
            keyboardType="number-pad"
            style={[
              styles.customInput,
              {
                color: c.text,
                backgroundColor: c.card,
                borderColor: c.border,
              },
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
    </ScrollView>
  );
}

function QiblaView() {
  const c = Colors.dark;
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
        const angle = Math.atan2(y, x) * (180 / Math.PI);
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

  return (
    <View style={styles.qiblaContainer}>
      <View style={[styles.compassOuter, { borderColor: c.border, backgroundColor: c.card }]}>
        <View style={[styles.compassRing, { borderColor: c.tint + "30" }]}>
          {["Sh", "Sr", "J", "G"].map((dir, i) => {
            const angle = i * 90;
            const rad = (angle - 90) * (Math.PI / 180);
            const r = 90;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            return (
              <Text
                key={dir}
                style={[
                  styles.compassDir,
                  {
                    color: dir === "Sh" ? c.tint : c.textMuted,
                    transform: [
                      { translateX: x },
                      { translateY: y },
                    ],
                    position: "absolute",
                  },
                ]}
              >
                {dir}
              </Text>
            );
          })}

          <Animated.View style={[styles.needleWrapper, { transform: [{ rotate: spin }] }]}>
            <View style={[styles.needleTop, { backgroundColor: c.tint }]} />
            <View style={[styles.needleBottom, { backgroundColor: c.textMuted }]} />
          </Animated.View>

          <View style={[styles.compassCenter, { backgroundColor: c.tint }]} />
        </View>
      </View>

      <Text style={[styles.qiblaLabel, { color: c.text }]}>Makka tomoni</Text>
      <Text style={[styles.qiblaDegrees, { color: c.tint }]}>
        {displayBearing}° shimoldan
      </Text>

      {usingFallback && (
        <View style={[styles.fallbackNote, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="location-outline" size={14} color={c.textMuted} />
          <Text style={[styles.fallbackText, { color: c.textMuted }]}>
            Toshkent koordinatasidan hisoblandi
          </Text>
        </View>
      )}

      {!hasSensor && (
        <View style={[styles.fallbackNote, { backgroundColor: c.card, borderColor: c.border }]}>
          <Ionicons name="information-circle-outline" size={14} color={c.textMuted} />
          <Text style={[styles.fallbackText, { color: c.textMuted }]}>
            Kompas sensori mavjud emas — statik yo'nalish ko'rsatilmoqda
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TasbihScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const [activeTab, setActiveTab] = useState<TabType>("tasbih");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 0 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={{ paddingTop: topPadding + 12, paddingHorizontal: 16, marginBottom: 12 }}>
        <Text style={[styles.screenTitle, { color: c.text }]}>Tasbih</Text>

        <View style={[styles.tabRow, { backgroundColor: c.card, borderColor: c.border }]}>
          <Pressable
            onPress={() => setActiveTab("tasbih")}
            style={[
              styles.tabBtn,
              activeTab === "tasbih" && { backgroundColor: c.tint },
            ]}
          >
            <MaterialCommunityIcons
              name="counter"
              size={16}
              color={activeTab === "tasbih" ? "#000" : c.textSecondary}
            />
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === "tasbih" ? "#000" : c.textSecondary },
              ]}
            >
              Hisoblagich
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("qibla")}
            style={[
              styles.tabBtn,
              activeTab === "qibla" && { backgroundColor: c.tint },
            ]}
          >
            <Ionicons
              name="compass-outline"
              size={16}
              color={activeTab === "qibla" ? "#000" : c.textSecondary}
            />
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === "qibla" ? "#000" : c.textSecondary },
              ]}
            >
              Qibla
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
    gap: 8,
    paddingBottom: 4,
  },
  dhikrChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  dhikrChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  arabicRow: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 6,
  },
  arabicText: {
    fontSize: 26,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    writingDirection: "rtl",
  },
  meaningText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  ringWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 220,
    marginVertical: 8,
  },
  tapButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  tapInner: {
    flex: 1,
    borderRadius: 90,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  countNumber: {
    fontSize: 64,
    fontFamily: "Inter_700Bold",
    lineHeight: 72,
  },
  tapHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  celebBadge: {
    position: "absolute",
    bottom: -8,
    backgroundColor: "#1DB954",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  targetLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginRight: 4,
  },
  targetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  targetBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  customRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 10,
    alignItems: "center",
  },
  customInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  customApply: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
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
    gap: 16,
  },
  compassOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  compassRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  compassDir: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    position: "absolute",
  },
  needleWrapper: {
    width: 8,
    height: 140,
    alignItems: "center",
    position: "absolute",
  },
  needleTop: {
    flex: 1,
    width: 6,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  needleBottom: {
    flex: 1,
    width: 6,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    opacity: 0.4,
  },
  compassCenter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: "absolute",
  },
  qiblaLabel: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  qiblaDegrees: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  fallbackNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: "stretch",
  },
  fallbackText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
