import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAudio, AudioState } from "@/context/AudioContext";
import { useQuran } from "@/context/QuranContext";

const TAB_BAR_HEIGHT = Platform.OS === "web" ? 84 : 56;
const FADE_STEPS = 50;
const FADE_INTERVAL_MS = 100;

function formatSleepLabel(minutes: number | null, secondsLeft: number | null): string {
  if (minutes === null || secondsLeft === null) return "";
  if (secondsLeft > 60) return `${minutes}m`;
  if (secondsLeft > 0) return `${secondsLeft}s`;
  return "";
}

function SleepTimerButton({
  sleepMinutes,
  sleepSecondsLeft,
  isFading,
  onPress,
}: {
  sleepMinutes: number | null;
  sleepSecondsLeft: number | null;
  isFading: boolean;
  onPress: () => void;
}) {
  const c = Colors.dark;
  const isActive = sleepMinutes !== null || isFading;
  const label = isFading ? "..." : formatSleepLabel(sleepMinutes, sleepSecondsLeft);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.sleepBtn,
        isActive && { backgroundColor: c.tint + "20", borderColor: c.tint + "60", borderWidth: 1 },
      ]}
      accessibilityLabel="Uyqu taymer"
    >
      <Ionicons
        name={isActive ? "moon" : "moon-outline"}
        size={17}
        color={isActive ? c.tint : c.textMuted}
      />
      {isActive && label ? (
        <Text style={[styles.sleepLabel, { color: c.tint }]}>{label}</Text>
      ) : null}
    </Pressable>
  );
}

function WebPlayer({ audio }: { audio: AudioState }) {
  const { stopAudio, playNext, playPrev, sleepMinutes, sleepSecondsLeft, isFading, cycleSleepTimer } = useAudio();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const insets = useSafeAreaInsets();
  const c = Colors.dark;

  useEffect(() => {
    const el = new Audio(audio.audioUrl);
    audioRef.current = el;
    setIsLoading(true);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);

    el.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      setDuration(el.duration || 0);
      el.play().catch(() => {});
    });
    el.addEventListener("loadedmetadata", () => setDuration(el.duration || 0));
    el.addEventListener("play", () => setIsPlaying(true));
    el.addEventListener("pause", () => setIsPlaying(false));
    el.addEventListener("timeupdate", () => setPosition(el.currentTime));
    el.addEventListener("ended", () => {
      setIsPlaying(false);
      playNext();
    });
    el.addEventListener("error", () => setIsLoading(false));
    el.load();

    return () => {
      el.pause();
      el.src = "";
      audioRef.current = null;
    };
  }, [audio.audioUrl]);

  useEffect(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
    if (!isFading) return;

    const el = audioRef.current;
    if (!el) return;
    el.volume = 1.0;
    let vol = 1.0;

    fadeRef.current = setInterval(() => {
      vol = Math.max(0, vol - 1 / FADE_STEPS);
      if (el) el.volume = vol;
      if (vol <= 0) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        fadeRef.current = null;
        if (el) el.pause();
      }
    }, FADE_INTERVAL_MS);

    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      if (el && el.volume < 1) el.volume = 1.0;
    };
  }, [isFading]);

  useEffect(() => {
    if (isPlaying) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) el.pause();
    else el.play().catch(() => {});
  };

  const progress = duration > 0 ? position / duration : 0;
  const bottomOffset = insets.bottom + TAB_BAR_HEIGHT + 8;

  return (
    <View style={[styles.container, { bottom: bottomOffset, backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.icon,
            {
              backgroundColor: isPlaying ? c.audioActive + "22" : c.card,
              borderColor: isPlaying ? c.audioActive : c.border,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons name="musical-notes" size={18} color={isPlaying ? c.audioActive : c.textSecondary} />
        </Animated.View>

        <View style={styles.info}>
          <Text style={[styles.surahName, { color: c.text }]} numberOfLines={1}>
            {audio.surahName}
          </Text>
          <Text style={[styles.meta, { color: c.tint }]}>
            {audio.ayahNo}/{audio.totalVerses} oyat • {audio.reciterName}
          </Text>
        </View>

        <View style={styles.controls}>
          <SleepTimerButton
            sleepMinutes={sleepMinutes}
            sleepSecondsLeft={sleepSecondsLeft}
            isFading={isFading}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); cycleSleepTimer(); }}
          />
          <Pressable onPress={playPrev} style={styles.btn}>
            <Ionicons name="play-skip-back" size={20} color={c.textSecondary} />
          </Pressable>
          <Pressable onPress={togglePlay} style={[styles.playBtn, { backgroundColor: c.audioActive }]}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
            )}
          </Pressable>
          <Pressable onPress={playNext} style={styles.btn}>
            <Ionicons name="play-skip-forward" size={20} color={c.textSecondary} />
          </Pressable>
          <Pressable onPress={stopAudio} style={styles.btn}>
            <Ionicons name="close" size={20} color={c.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.progressBar, { backgroundColor: c.border }]}>
        <View style={[styles.progressFill, { backgroundColor: c.audioActive, width: `${progress * 100}%` as any }]} />
      </View>
    </View>
  );
}

function NativePlayer({ audio }: { audio: AudioState }) {
  const { stopAudio, playNext, playPrev, sleepMinutes, sleepSecondsLeft, isFading, cycleSleepTimer } = useAudio();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const insets = useSafeAreaInsets();
  const c = Colors.dark;

  const player = useAudioPlayer({ uri: audio.audioUrl });
  const status = useAudioPlayerStatus(player);

  const isPlaying = status.playing;
  const isLoading = status.isBuffering;
  const duration = status.duration || 0;
  const position = status.currentTime || 0;
  const progress = duration > 0 ? position / duration : 0;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    player.play();
  }, [audio.audioUrl]);

  useEffect(() => {
    if (status.didJustFinish) {
      playNext();
    }
  }, [status.didJustFinish]);

  useEffect(() => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
      fadeRef.current = null;
    }
    if (!isFading) {
      if (typeof player.volume !== "undefined") player.volume = 1.0;
      return;
    }

    let vol = 1.0;
    fadeRef.current = setInterval(() => {
      vol = Math.max(0, vol - 1 / FADE_STEPS);
      if (typeof player.volume !== "undefined") player.volume = vol;
      if (vol <= 0) {
        if (fadeRef.current) clearInterval(fadeRef.current);
        fadeRef.current = null;
        player.pause();
      }
    }, FADE_INTERVAL_MS);

    return () => {
      if (fadeRef.current) clearInterval(fadeRef.current);
      if (typeof player.volume !== "undefined") player.volume = 1.0;
    };
  }, [isFading]);

  useEffect(() => {
    if (isPlaying) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlaying) player.pause();
    else player.play();
  };

  const bottomOffset = insets.bottom + TAB_BAR_HEIGHT + 8;

  return (
    <View style={[styles.container, { bottom: bottomOffset, backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.icon,
            {
              backgroundColor: isPlaying ? c.audioActive + "22" : c.card,
              borderColor: isPlaying ? c.audioActive : c.border,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons name="musical-notes" size={18} color={isPlaying ? c.audioActive : c.textSecondary} />
        </Animated.View>

        <View style={styles.info}>
          <Text style={[styles.surahName, { color: c.text }]} numberOfLines={1}>
            {audio.surahName}
          </Text>
          <Text style={[styles.meta, { color: c.tint }]}>
            {audio.ayahNo}/{audio.totalVerses} oyat • {audio.reciterName}
          </Text>
        </View>

        <View style={styles.controls}>
          <SleepTimerButton
            sleepMinutes={sleepMinutes}
            sleepSecondsLeft={sleepSecondsLeft}
            isFading={isFading}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); cycleSleepTimer(); }}
          />
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); playPrev(); }} style={styles.btn}>
            <Ionicons name="play-skip-back" size={20} color={c.textSecondary} />
          </Pressable>
          <Pressable onPress={togglePlay} style={[styles.playBtn, { backgroundColor: c.audioActive }]}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
            )}
          </Pressable>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); playNext(); }} style={styles.btn}>
            <Ionicons name="play-skip-forward" size={20} color={c.textSecondary} />
          </Pressable>
          <Pressable onPress={stopAudio} style={styles.btn}>
            <Ionicons name="close" size={20} color={c.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.progressBar, { backgroundColor: c.border }]}>
        <View style={[styles.progressFill, { backgroundColor: c.audioActive, width: `${progress * 100}%` as any }]} />
      </View>
    </View>
  );
}

export function GlobalAudioPlayer() {
  const { audio } = useAudio();
  const { saveLastRead } = useQuran();

  useEffect(() => {
    if (!audio) return;
    saveLastRead({
      surahNo: audio.surahNo,
      surahName: audio.surahName,
      ayahNo: audio.ayahNo,
    });
  }, [audio?.surahNo, audio?.ayahNo]);

  if (!audio) return null;
  if (Platform.OS === "web") return <WebPlayer audio={audio} />;
  return <NativePlayer audio={audio} />;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  surahName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  meta: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  sleepBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    padding: 5,
    borderRadius: 8,
  },
  sleepLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  btn: {
    padding: 6,
  },
  playBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 2,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
});
