import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
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
import Colors from "@/constants/colors";

interface AudioPlayerProps {
  url: string;
  surahName: string;
  reciterName: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentVerse?: number;
  totalVerses?: number;
}

function WebAudioPlayer({
  url,
  surahName,
  reciterName,
  onClose,
  onNext,
  onPrev,
  currentVerse,
  totalVerses,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const c = Colors.dark;

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    setIsLoading(true);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);

    audio.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      setDuration(audio.duration || 0);
      audio.play().catch(() => {});
    });
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration || 0);
    });
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("timeupdate", () => setPosition(audio.currentTime));
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      onNext?.();
    });
    audio.addEventListener("error", () => setIsLoading(false));

    audio.load();

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [url]);

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
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const progress = duration > 0 ? position / duration : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.info}>
        <Animated.View
          style={[
            styles.playIndicator,
            {
              backgroundColor: isPlaying ? c.audioActive + "22" : c.card,
              borderColor: isPlaying ? c.audioActive : c.border,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons name="musical-notes" size={20} color={isPlaying ? c.audioActive : c.textSecondary} />
        </Animated.View>

        <View style={styles.textInfo}>
          <Text style={[styles.surahName, { color: c.text }]} numberOfLines={1}>{surahName}</Text>
          <Text style={[styles.reciterName, { color: c.textSecondary }]} numberOfLines={1}>{reciterName}</Text>
          {currentVerse && totalVerses && (
            <Text style={[styles.verseInfo, { color: c.tint }]}>{currentVerse}/{totalVerses} oyat</Text>
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: c.border }]}>
          <View style={[styles.progressFill, { backgroundColor: c.audioActive, width: `${progress * 100}%` as any }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: c.textMuted }]}>{formatTime(position)}</Text>
          <Text style={[styles.timeText, { color: c.textMuted }]}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        {onPrev && (
          <Pressable onPress={onPrev} style={styles.controlBtn}>
            <Ionicons name="play-skip-back" size={22} color={c.textSecondary} />
          </Pressable>
        )}

        <Pressable onPress={togglePlay} style={[styles.playBtn, { backgroundColor: c.audioActive }]}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
          )}
        </Pressable>

        {onNext && (
          <Pressable onPress={onNext} style={styles.controlBtn}>
            <Ionicons name="play-skip-forward" size={22} color={c.textSecondary} />
          </Pressable>
        )}

        <Pressable onPress={onClose} style={styles.controlBtn}>
          <Ionicons name="close" size={22} color={c.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

function NativeAudioPlayer(props: AudioPlayerProps) {
  const { url, surahName, reciterName, onClose, onNext, onPrev, currentVerse, totalVerses } = props;

  const player = useAudioPlayer({ uri: url });
  const status = useAudioPlayerStatus(player);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const c = Colors.dark;

  const isPlaying = status.playing;
  const isLoading = status.isBuffering;
  const duration = status.duration || 0;
  const position = status.currentTime || 0;
  const progress = duration > 0 ? position / duration : 0;

  useEffect(() => {
    player.play();
  }, [url]);

  useEffect(() => {
    if (status.didJustFinish) {
      onNext?.();
    }
  }, [status.didJustFinish]);

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
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.info}>
        <Animated.View
          style={[
            styles.playIndicator,
            {
              backgroundColor: isPlaying ? c.audioActive + "22" : c.card,
              borderColor: isPlaying ? c.audioActive : c.border,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Ionicons name="musical-notes" size={20} color={isPlaying ? c.audioActive : c.textSecondary} />
        </Animated.View>

        <View style={styles.textInfo}>
          <Text style={[styles.surahName, { color: c.text }]} numberOfLines={1}>{surahName}</Text>
          <Text style={[styles.reciterName, { color: c.textSecondary }]} numberOfLines={1}>{reciterName}</Text>
          {currentVerse && totalVerses && (
            <Text style={[styles.verseInfo, { color: c.tint }]}>{currentVerse}/{totalVerses} oyat</Text>
          )}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: c.border }]}>
          <View style={[styles.progressFill, { backgroundColor: c.audioActive, width: `${progress * 100}%` as any }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: c.textMuted }]}>{formatTime(position)}</Text>
          <Text style={[styles.timeText, { color: c.textMuted }]}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        {onPrev && (
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPrev(); }} style={styles.controlBtn}>
            <Ionicons name="play-skip-back" size={22} color={c.textSecondary} />
          </Pressable>
        )}

        <Pressable onPress={togglePlay} style={[styles.playBtn, { backgroundColor: c.audioActive }]}>
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
          )}
        </Pressable>

        {onNext && (
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onNext(); }} style={styles.controlBtn}>
            <Ionicons name="play-skip-forward" size={22} color={c.textSecondary} />
          </Pressable>
        )}

        <Pressable onPress={onClose} style={styles.controlBtn}>
          <Ionicons name="close" size={22} color={c.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

export function AudioPlayer(props: AudioPlayerProps) {
  if (Platform.OS === "web") {
    return <WebAudioPlayer {...props} />;
  }
  return <NativeAudioPlayer {...props} />;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playIndicator: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textInfo: {
    flex: 1,
    gap: 2,
  },
  surahName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  reciterName: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  verseInfo: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  progressContainer: {
    gap: 4,
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
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  controlBtn: {
    padding: 8,
  },
  playBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 2,
  },
});
