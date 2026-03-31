import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const NOTIF_IDS_KEY = "@quran_notif_ids";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

    const stored = await AsyncStorage.getItem(NOTIF_IDS_KEY);
    const ids: Record<string, string> = stored ? JSON.parse(stored) : {};
    if (ids[prayerKey]) {
      await Notifications.cancelScheduledNotificationAsync(ids[prayerKey]).catch(() => {});
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Namoz vaqti 🕌",
        body: `${prayerName} namozi vaqti kirdi`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: h,
        minute: m,
      },
    });

    ids[prayerKey] = id;
    await AsyncStorage.setItem(NOTIF_IDS_KEY, JSON.stringify(ids));
  } catch {
  }
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
      await AsyncStorage.setItem(NOTIF_IDS_KEY, JSON.stringify(ids));
    }
  } catch {
  }
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
  } catch {
  }
}
