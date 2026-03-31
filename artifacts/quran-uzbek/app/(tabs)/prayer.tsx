import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
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

const TASHKENT_LAT = 41.2995;
const TASHKENT_LON = 69.2401;

const PRAYERS = [
  { key: "Fajr", name: "Bomdod", icon: "moon-outline" as const, gradient: ["#1a1a3e", "#2d2d6e"] as [string, string] },
  { key: "Sunrise", name: "Quyosh", icon: "sunny-outline" as const, gradient: ["#3d2b00", "#7c5900"] as [string, string] },
  { key: "Dhuhr", name: "Peshin", icon: "partly-sunny-outline" as const, gradient: ["#0d2e3e", "#0d4a5e"] as [string, string] },
  { key: "Asr", name: "Asr", icon: "cloud-outline" as const, gradient: ["#2e1a00", "#5c3500"] as [string, string] },
  { key: "Maghrib", name: "Shom", icon: "cloudy-night-outline" as const, gradient: ["#3e0d0d", "#6e1515"] as [string, string] },
  { key: "Isha", name: "Xufton", icon: "star-outline" as const, gradient: ["#1a0d3e", "#2e1a6e"] as [string, string] },
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

function formatCountdown(diffMinutes: number): string {
  if (diffMinutes < 0) diffMinutes += 24 * 60;
  const h = Math.floor(diffMinutes / 60);
  const m = diffMinutes % 60;
  if (h > 0) return `${h} soat ${m} daqiqa`;
  return `${m} daqiqa`;
}

export default function PrayerScreen() {
  const insets = useSafeAreaInsets();
  const c = Colors.dark;
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("Toshkent");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

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
    } catch (e) {
      setError("Namoz vaqtlarini yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimes();
  }, []);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nextPrayer = times ? getNextPrayer(times, nowMinutes) : null;

  const getCountdown = (key: string): string => {
    if (!times) return "";
    const t = times[key as keyof PrayerTimes] as string;
    const prayerMins = parseTimeToMinutes(t);
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
        <Text style={[styles.title, { color: c.text }]}>Namoz vaqtlari</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>{city} • {today}</Text>
        {times?.hijriDate ? (
          <Text style={[styles.hijriDate, { color: c.tint }]}>{times.hijriDate} (Hijriy)</Text>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={[styles.loadingText, { color: c.textSecondary }]}>Yuklanmoqda...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={48} color={c.textMuted} />
          <Text style={[styles.errorText, { color: c.textSecondary }]}>{error}</Text>
          <Pressable onPress={loadTimes} style={[styles.retryBtn, { backgroundColor: c.tint }]}>
            <Text style={styles.retryText}>Qayta urinish</Text>
          </Pressable>
        </View>
      ) : times ? (
        <View style={styles.prayerList}>
          {nextPrayer && (
            <View style={[styles.nextCard, { backgroundColor: c.card, borderColor: c.tint + "40" }]}>
              <Ionicons name="time-outline" size={18} color={c.tint} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.nextLabel, { color: c.textSecondary }]}>Keyingi namoz</Text>
                <Text style={[styles.nextName, { color: c.tint }]}>
                  {PRAYERS.find(p => p.key === nextPrayer)?.name ?? nextPrayer}
                </Text>
              </View>
              <Text style={[styles.nextCountdown, { color: c.text }]}>{getCountdown(nextPrayer)}</Text>
            </View>
          )}

          {PRAYERS.map((prayer) => {
            const timeStr = times[prayer.key as keyof PrayerTimes] as string;
            const isNext = prayer.key === nextPrayer;
            const isSunrise = prayer.key === "Sunrise";
            const prayerMins = parseTimeToMinutes(timeStr);
            const isPast = prayerMins < nowMinutes && !isNext;

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
                  <Text style={[styles.prayerName, { opacity: isPast ? 0.5 : 1 }]}>{prayer.name}</Text>
                  {isSunrise && (
                    <Text style={styles.prayerSubNote}>Namoz vaqti emas</Text>
                  )}
                </View>
                <View style={{ alignItems: "flex-end", gap: 2 }}>
                  <Text style={[styles.prayerTime, { opacity: isPast ? 0.5 : 1 }]}>{timeStr}</Text>
                  {isNext && (
                    <Text style={styles.prayerCountdown}>{getCountdown(prayer.key)} qoldi</Text>
                  )}
                  {isPast && !isSunrise && (
                    <Text style={styles.prayerPast}>O'tdi</Text>
                  )}
                </View>
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
            <Text style={[styles.refreshText, { color: c.textSecondary }]}>Yangilash</Text>
          </Pressable>

          <View style={[styles.methodNote, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={c.textMuted} />
            <Text style={[styles.methodNoteText, { color: c.textMuted }]}>
              Hisob usuli: Hanafiy (method 4) • Manba: aladhan.com
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
  prayerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
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
