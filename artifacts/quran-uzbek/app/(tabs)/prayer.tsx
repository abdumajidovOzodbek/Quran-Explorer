import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { fetchPrayerTimes, PrayerTimes } from "@/constants/api";
import {
  cancelPrayerNotif,
  getNotifPermissionStatus,
  requestNotifPermissions,
  rescheduleEnabledNotifs,
  schedulePrayerNotif,
} from "@/constants/notifications";
import { useQuran } from "@/context/QuranContext";
import { getStrings } from "@/constants/i18n";

const TASHKENT_LAT = 41.2995;
const TASHKENT_LON = 69.2401;
const NOTIF_ENABLED_KEY = "@quran_prayer_notif_enabled";

const PRAYER_STATIC = [
  { key: "Fajr", icon: "moon-outline" as const, colors: ["#1a1a4e", "#252580"] as [string, string], hasNotif: true },
  { key: "Sunrise", icon: "sunny-outline" as const, colors: ["#3d2800", "#7a5200"] as [string, string], hasNotif: false },
  { key: "Dhuhr", icon: "partly-sunny-outline" as const, colors: ["#0a2d42", "#0d4a6a"] as [string, string], hasNotif: true },
  { key: "Asr", icon: "cloud-outline" as const, colors: ["#2e1800", "#5a3200"] as [string, string], hasNotif: true },
  { key: "Maghrib", icon: "cloudy-night-outline" as const, colors: ["#42100d", "#721a16"] as [string, string], hasNotif: true },
  { key: "Isha", icon: "star-outline" as const, colors: ["#180d42", "#2c1870"] as [string, string], hasNotif: true },
];

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function getNextPrayer(times: PrayerTimes, nowMinutes: number): string {
  const prayerKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  for (const key of prayerKeys) {
    const t = times[key as keyof PrayerTimes] as string;
    if (t && parseTimeToMinutes(t) > nowMinutes) return key;
  }
  return "Fajr";
}

export default function PrayerScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { settings } = useQuran();
  const t = getStrings(settings.language);

  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("Toshkent");
  const [now, setNow] = useState(new Date());
  const [enabledNotifs, setEnabledNotifs] = useState<Record<string, boolean>>({});
  const [notifPermission, setNotifPermission] = useState<string>("undetermined");
  const timesRef = useRef<PrayerTimes | null>(null);

  const getPrayerName = (key: string): string => {
    const map: Record<string, string> = {
      Fajr: t.fajr,
      Sunrise: t.sunrise,
      Dhuhr: t.dhuhr,
      Asr: t.asr,
      Maghrib: t.maghrib,
      Isha: t.isha,
    };
    return map[key] ?? key;
  };

  const formatCountdown = (diffMinutes: number): string => {
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    if (h > 0) return `${h} ${t.hours} ${m} ${t.minutes}`;
    return `${m} ${t.minutes}`;
  };

  const PRAYER_NAMES: Record<string, string> = {
    Fajr: t.fajr,
    Dhuhr: t.dhuhr,
    Asr: t.asr,
    Maghrib: t.maghrib,
    Isha: t.isha,
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadNotifState();
    if (Platform.OS !== "web") {
      getNotifPermissionStatus().then(setNotifPermission);
    }
  }, []);

  const loadNotifState = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
      if (stored) setEnabledNotifs(JSON.parse(stored));
    } catch {}
  };

  const saveNotifState = async (state: Record<string, boolean>) => {
    try {
      await AsyncStorage.setItem(NOTIF_ENABLED_KEY, JSON.stringify(state));
    } catch {}
  };

  const loadTimes = async () => {
    setLoading(true);
    setError(null);
    try {
      let lat = TASHKENT_LAT;
      let lon = TASHKENT_LON;
      let cityName = "Toshkent";

      if (Platform.OS !== "web") {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
            lat = location.coords.latitude;
            lon = location.coords.longitude;
            const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
            if (geocode[0]?.city) cityName = geocode[0].city;
          }
        } catch {}
      }

      setCity(cityName);
      const data = await fetchPrayerTimes(lat, lon, cityName);
      setTimes(data);
      timesRef.current = data;
    } catch {
      setError(t.prayerError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTimes(); }, []);

  useEffect(() => {
    if (times && Platform.OS !== "web") {
      const timesMap: Record<string, string> = {};
      for (const p of PRAYER_STATIC) {
        if (p.hasNotif) {
          const time = times[p.key as keyof PrayerTimes] as string;
          if (time) timesMap[p.key] = time;
        }
      }
      rescheduleEnabledNotifs(timesMap, enabledNotifs, PRAYER_NAMES);
    }
  }, [times, enabledNotifs]);

  const toggleNotif = async (prayerKey: string) => {
    if (Platform.OS === "web") return;
    let permission = notifPermission;
    if (permission !== "granted") {
      const granted = await requestNotifPermissions();
      permission = granted ? "granted" : "denied";
      setNotifPermission(permission);
    }
    if (permission !== "granted") return;

    const currentEnabled = enabledNotifs[prayerKey] ?? false;
    const newEnabled = !currentEnabled;
    const updated = { ...enabledNotifs, [prayerKey]: newEnabled };
    setEnabledNotifs(updated);
    await saveNotifState(updated);

    const prayerName = getPrayerName(prayerKey);
    if (newEnabled && timesRef.current) {
      const timeStr = timesRef.current[prayerKey as keyof PrayerTimes] as string;
      if (timeStr) await schedulePrayerNotif(prayerKey, prayerName, timeStr);
    } else {
      await cancelPrayerNotif(prayerKey);
    }
  };

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nextPrayer = times ? getNextPrayer(times, nowMinutes) : null;

  const getCountdown = (key: string): string => {
    if (!times) return "";
    const prayerTime = times[key as keyof PrayerTimes] as string;
    const prayerMins = parseTimeToMinutes(prayerTime);
    let diff = prayerMins - nowMinutes;
    if (diff < 0) diff += 24 * 60;
    return formatCountdown(diff);
  };

  const clockStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  const today = now.toLocaleDateString("ru", { weekday: "long", day: "numeric", month: "long" });

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
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: c.text }]}>{t.prayerTitle}</Text>
            <Text style={[styles.cityText, { color: c.textSecondary }]}>
              📍 {city}
            </Text>
            {times?.hijriDate && (
              <Text style={[styles.hijriText, { color: c.tint }]}>{times.hijriDate}</Text>
            )}
          </View>
          <View style={[styles.clockBox, { backgroundColor: c.tint + "15", borderColor: c.tint + "30" }]}>
            <Text style={[styles.clockTime, { color: c.tint }]}>{clockStr}</Text>
            <Text style={[styles.clockDate, { color: c.textMuted }]} numberOfLines={1}>{today}</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={[styles.loadingText, { color: c.textSecondary }]}>{t.loading}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <View style={[styles.errorIconBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="wifi-outline" size={36} color={c.textMuted} />
          </View>
          <Text style={[styles.errorText, { color: c.textSecondary }]}>{error}</Text>
          <Pressable onPress={loadTimes} style={[styles.retryBtn, { backgroundColor: c.tint }]}>
            <Text style={styles.retryText}>{t.retry}</Text>
          </Pressable>
        </View>
      ) : times ? (
        <View style={styles.prayerList}>
          {nextPrayer && (
            <LinearGradient
              colors={["#1a2d50", "#0d1f3c"]}
              style={[styles.nextCard, { borderColor: c.tint + "40" }]}
            >
              <View style={styles.nextCardLeft}>
                <Text style={[styles.nextLabel, { color: c.tint + "99" }]}>{t.nextPrayer}</Text>
                <Text style={[styles.nextName, { color: "#fff" }]}>{getPrayerName(nextPrayer)}</Text>
                <Text style={[styles.nextTime, { color: c.tint }]}>
                  {times[nextPrayer as keyof PrayerTimes] as string}
                </Text>
              </View>
              <View style={styles.nextCardRight}>
                <Ionicons name="time-outline" size={20} color={c.tint + "80"} />
                <Text style={[styles.nextCountdown, { color: "#fff" }]}>
                  {getCountdown(nextPrayer)}
                </Text>
                <Text style={[styles.nextRemaining, { color: c.tint + "80" }]}>{t.remaining}</Text>
              </View>
            </LinearGradient>
          )}

          {PRAYER_STATIC.map((prayer) => {
            const timeStr = times[prayer.key as keyof PrayerTimes] as string;
            const isNext = prayer.key === nextPrayer;
            const isSunrise = prayer.key === "Sunrise";
            const prayerMins = parseTimeToMinutes(timeStr);
            const isPast = prayerMins < nowMinutes && !isNext;
            const isNotifEnabled = enabledNotifs[prayer.key] ?? false;

            return (
              <LinearGradient
                key={prayer.key}
                colors={prayer.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.prayerCard,
                  isNext && { borderColor: c.tint + "70", borderWidth: 1.5 },
                  isPast && { opacity: 0.6 },
                ]}
              >
                {isNext && (
                  <View style={[styles.nextIndicator, { backgroundColor: c.tint }]} />
                )}
                <View style={[styles.iconBox, { backgroundColor: "rgba(255,255,255,0.1)" }]}>
                  <Ionicons name={prayer.icon} size={22} color="#fff" />
                </View>
                <View style={styles.prayerInfo}>
                  <Text style={styles.prayerName}>{getPrayerName(prayer.key)}</Text>
                  {isSunrise && (
                    <Text style={styles.prayerSubNote}>{t.notPrayerTime}</Text>
                  )}
                  {isNext && (
                    <Text style={styles.prayerCountdown}>{getCountdown(prayer.key)} {t.remaining}</Text>
                  )}
                  {isPast && !isSunrise && (
                    <Text style={styles.prayerPast}>{t.prayerPast}</Text>
                  )}
                </View>
                <Text style={styles.prayerTime}>{timeStr}</Text>
                {prayer.hasNotif && Platform.OS !== "web" && (
                  <Pressable
                    onPress={() => toggleNotif(prayer.key)}
                    style={[
                      styles.bellBtn,
                      isNotifEnabled && { backgroundColor: "rgba(255,255,255,0.2)" },
                    ]}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={isNotifEnabled ? "notifications" : "notifications-outline"}
                      size={20}
                      color={isNotifEnabled ? "#fff" : "rgba(255,255,255,0.4)"}
                    />
                  </Pressable>
                )}
              </LinearGradient>
            );
          })}

          <View style={styles.bottomRow}>
            <Pressable
              onPress={loadTimes}
              style={({ pressed }) => [
                styles.refreshBtn,
                { backgroundColor: "#101828", borderColor: c.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="refresh-outline" size={16} color={c.textSecondary} />
              <Text style={[styles.refreshText, { color: c.textSecondary }]}>{t.refresh}</Text>
            </Pressable>
          </View>

          <View style={[styles.methodNote, { backgroundColor: "#101828", borderColor: c.border }]}>
            <Ionicons name="information-circle-outline" size={15} color={c.textMuted} />
            <Text style={[styles.methodNoteText, { color: c.textMuted }]}>{t.methodNote}</Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 120 },
  pageHeader: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  cityText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  hijriText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 3,
  },
  clockBox: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    minWidth: 90,
  },
  clockTime: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  clockDate: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    textAlign: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  errorIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  errorText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: { color: "#000", fontFamily: "Inter_700Bold", fontSize: 15 },
  prayerList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  nextCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 6,
  },
  nextCardLeft: { gap: 4 },
  nextCardRight: { alignItems: "flex-end", gap: 4 },
  nextLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  nextName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  nextTime: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  nextCountdown: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  nextRemaining: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  prayerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "hidden",
  },
  nextIndicator: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderRadius: 4,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerInfo: { flex: 1, gap: 3 },
  prayerName: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  prayerSubNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
  },
  prayerCountdown: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
  },
  prayerPast: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.4)",
  },
  prayerTime: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomRow: {
    marginTop: 4,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  refreshText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  methodNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 2,
  },
  methodNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
