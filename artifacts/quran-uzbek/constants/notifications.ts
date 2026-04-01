import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { getStrings } from "./i18n";
import type { AppLanguage } from "@/types/quran";

const NOTIF_IDS_KEY = "@quran_notif_ids";
const SETTINGS_KEY = "@quran_settings";

// Android: channel sound = filename WITHOUT extension, must match res/raw/adhan.mp3
// iOS: notification content sound = filename WITH extension
const ADHAN_SOUND_IOS = "adhan.mp3";
const ANDROID_CHANNEL_ID = "prayer-times-v2"; // bumped to force fresh channel with adhan sound
const OLD_CHANNEL_ID = "prayer-times";        // will be deleted on startup

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Run once on module load: delete old channel (locked with wrong sound), create fresh one
if (Platform.OS === "android") {
  Notifications.deleteNotificationChannelAsync(OLD_CHANNEL_ID).catch(() => {});
  Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Namoz vaqtlari",
    importance: Notifications.AndroidImportance.MAX,
    sound: "adhan",        // matches res/raw/adhan.mp3 (no extension)
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#c5a55a",
    enableLights: true,
    enableVibrate: true,
  }).catch(() => {});
}

async function getCurrentLanguage(): Promise<AppLanguage> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      if (settings.language) return settings.language as AppLanguage;
    }
  } catch {}
  return "uz_latin";
}

export async function requestNotifPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function getNotifPermissionStatus(): Promise<string> {
  if (Platform.OS === "web") return "denied";
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch {
    return "denied";
  }
}

export async function schedulePrayerNotif(
  prayerKey: string,
  prayerName: string,
  timeStr: string
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const parts = timeStr.split(":");
    const h = parseInt(parts[0] ?? "0", 10);
    const m = parseInt(parts[1] ?? "0", 10);
    if (isNaN(h) || isNaN(m)) return;

    const lang = await getCurrentLanguage();
    const t = getStrings(lang);

    const stored = await AsyncStorage.getItem(NOTIF_IDS_KEY);
    const ids: Record<string, string> = stored ? JSON.parse(stored) : {};

    if (ids[prayerKey]) {
      await Notifications.cancelScheduledNotificationAsync(ids[prayerKey]).catch(() => {});
    }
    if (ids[`${prayerKey}_before`]) {
      await Notifications.cancelScheduledNotificationAsync(ids[`${prayerKey}_before`]).catch(() => {});
    }

    // Android uses channel (channel carries the sound); iOS sets sound directly in content
    const channelProp = Platform.OS === "android" ? { channelId: ANDROID_CHANNEL_ID } : {};
    const soundProp = Platform.OS === "ios" ? { sound: ADHAN_SOUND_IOS } : {};

    const atTimeId = await Notifications.scheduleNotificationAsync({
      content: {
        title: t.prayerTimeNotifTitle,
        body: t.prayerTimeNotifBody.replace("{prayer}", prayerName),
        ...soundProp,
        ...channelProp,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: h,
        minute: m,
      },
    });
    ids[prayerKey] = atTimeId;

    let beforeH = h;
    let beforeM = m - 10;
    if (beforeM < 0) {
      beforeM += 60;
      beforeH = beforeH - 1;
      if (beforeH < 0) beforeH = 23;
    }

    const beforeId = await Notifications.scheduleNotificationAsync({
      content: {
        title: t.prayerBeforeNotifTitle,
        body: t.prayerBeforeNotifBody.replace("{prayer}", prayerName),
        ...soundProp,
        ...channelProp,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: beforeH,
        minute: beforeM,
      },
    });
    ids[`${prayerKey}_before`] = beforeId;

    await AsyncStorage.setItem(NOTIF_IDS_KEY, JSON.stringify(ids));
  } catch {}
}

export async function cancelPrayerNotif(prayerKey: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    const stored = await AsyncStorage.getItem(NOTIF_IDS_KEY);
    if (!stored) return;
    const ids: Record<string, string> = JSON.parse(stored);
    if (ids[prayerKey]) {
      await Notifications.cancelScheduledNotificationAsync(ids[prayerKey]).catch(() => {});
      delete ids[prayerKey];
    }
    if (ids[`${prayerKey}_before`]) {
      await Notifications.cancelScheduledNotificationAsync(ids[`${prayerKey}_before`]).catch(() => {});
      delete ids[`${prayerKey}_before`];
    }
    await AsyncStorage.setItem(NOTIF_IDS_KEY, JSON.stringify(ids));
  } catch {}
}

export async function rescheduleEnabledNotifs(
  times: Record<string, string>,
  enabled: Record<string, boolean>,
  prayerNameMap: Record<string, string>
): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    for (const [key, isEnabled] of Object.entries(enabled)) {
      if (isEnabled && times[key]) {
        await schedulePrayerNotif(key, prayerNameMap[key] ?? key, times[key]);
      }
    }
  } catch {}
}
