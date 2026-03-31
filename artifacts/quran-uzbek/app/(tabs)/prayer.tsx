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
  { key: "Fajr", icon: "moon-outline" as const, gradient: ["#1a1a3e", "#2d2d6e"] as [string, string], hasNotif: true },
  { key: "Sunrise", icon: "sunny-outline" as const, gradient: ["#3d2b00", "#7c5900"] as [string, string], hasNotif: false },
  { key: "Dhuhr", icon: "partly-sunny-outline" as const, gradient: ["#0d2e3e", "#0d4a5e"] as [string, string], hasNotif: true },
  { key: "Asr", icon: "cloud-outline" as const, gradient: ["#2e1a00", "#5c3500"] as [string, string], hasNotif: true },
  { key: "Maghrib", icon: "cloudy-night-outline" as const, gradient: ["#3e0d0d", "#6e1515"] as [string, string], hasNotif: true },
  { key: "Isha", icon: "star-outline" as const, gradient: ["#1a0d3e", "#2e1a6e"] as [string, string], hasNotif: true },
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
    } catch {
    }
  };

  const saveNotifState = async (state: Record<string, boolean>) => {
    try {
      await AsyncStorage.setItem(NOTIF_ENABLED_KEY, JSON.stringify(state));
    } catch {
    }
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
        } catch {
        }
      }

      setCity(cityName);
      const data = await fetchPrayerTimes(lat, lon, cityName);
      setTimes(data);
      timesRef.current = data;
    } catch (e) {
      setError(t.prayerError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimes();
  }, []);

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
      if (timeStr) {
        await schedulePrayerNotif(prayerKey, prayerName, timeStr);
      }
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

  const today = now.toLocaleDateString("ru", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.content,
        Platform.OS === "web" && { paddingBottom: 34 + 84 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: topPadding + 12, paddingHorizontal: 16, marginBottom: 20 }}>
        <Text style={[styles.title, { color: c.text }]}>{t.prayerTitle}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>{city} • {today}</Text>
        {times?.hijriDate ? (
          <Text style={[styles.hijriDate, { color: c.tint }]}>{times.hijriDate} ({t.hijri})</Text>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={[styles.loadingText, { color: c.textSecondary }]}>{t.loading}</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={48} color={c.textMuted} />
          <Text style={[styles.errorText, { color: c.textSecondary }]}>{error}</Text>
          <Pressable onPress={loadTimes} style={[styles.retryBtn, { backgroundColor: c.tint }]}>
            <Text style={styles.retryText}>{t.retry}</Text>
          </Pressable>
        </View>
      ) : times ? (
        <View style={styles.prayerList}>
          {nextPrayer && (
            <View style={[styles.nextCard, { backgroundColor: c.card, borderColor: c.tint + "40" }]}>
              <Ionicons name="time-outline" size={18} color={c.tint} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.nextLabel, { color: c.textSecondary }]}>{t.nextPrayer}</Text>
                <Text style={[styles.nextName, { color: c.tint }]}>
                  {getPrayerName(nextPrayer)}
                </Text>
              </View>
              <Text style={[styles.nextCountdown, { color: c.text }]}>{getCountdown(nextPrayer)}</Text>
            </View>
          )}

          {Platform.OS !== "web" && (
            <View style={[styles.notifHint, { backgroundColor: c.card, borderColor: c.border }]}>
              <Ionicons name="notifications-outline" size={14} color={c.textMuted} />
              <Text style={[styles.notifHintText, { color: c.textMuted }]}>
                {t.enableNotif}
              </Text>
            </View>
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
                colors={prayer.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.prayerCard,
                  isNext && { borderColor: c.tint + "60", borderWidth: 1.5 },
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
                  <Ionicons name={prayer.icon} size={22} color={isPast ? "#ffffff50" : "#fff"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.prayerName, { opacity: isPast ? 0.5 : 1 }]}>{getPrayerName(prayer.key)}</Text>
                  {isSunrise && (
                    <Text style={styles.prayerSubNote}>{t.notPrayerTime}</Text>
                  )}
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={[styles.prayerTime, { opacity: isPast ? 0.5 : 1 }]}>{timeStr}</Text>
                  {isNext && (
                    <Text style={styles.prayerCountdown}>{getCountdown(prayer.key)} {t.remaining}</Text>
                  )}
                  {isPast && !isSunrise && (
                    <Text style={styles.prayerPast}>{t.prayerPast}</Text>
                  )}
                </View>
                {prayer.hasNotif && Platform.OS !== "web" && (
                  <Pressable
                    onPress={() => toggleNotif(prayer.key)}
                    style={[
                      styles.bellBtn,
                      isNotifEnabled && { backgroundColor: "rgba(255,255,255,0.15)" },
                    ]}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={isNotifEnabled ? "notifications" : "notifications-outline"}
                      size={20}
                      color={isNotifEnabled ? "#fff" : "rgba(255,255,255,0.45)"}
                    />
                  </Pressable>
                )}
              </LinearGradient>
            );
          })}

          <Pressable
            onPress={loadTimes}
            style={({ pressed }) => [
              styles.refreshBtn,
              { backgroundColor: c.card, borderColor: c.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="refresh-outline" size={18} color={c.textSecondary} />
            <Text style={[styles.refreshText, { color: c.textSecondary }]}>{t.refresh}</Text>
          </Pressable>

          <View style={[styles.methodNote, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={c.textMuted} />
            <Text style={[styles.methodNoteText, { color: c.textMuted }]}>
              {t.methodNote}
            </Text>
          </View>
        </View>
      ) : null}
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
  hijriDate: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  errorText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#000",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  prayerList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  nextCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  nextLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nextName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  nextCountdown: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  notifHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 2,
  },
  notifHintText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  prayerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerName: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  prayerSubNote: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  prayerTime: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
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
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  refreshText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  methodNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  methodNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
