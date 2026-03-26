import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import Colors from "@/constants/colors";

interface ShimmerSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function ShimmerSkeleton({ width = "100%", height = 20, borderRadius = 8, style }: ShimmerSkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: Colors.dark.shimmer, opacity },
        style,
      ]}
    />
  );
}

export function SurahListSkeleton() {
  return (
    <View style={styles.container}>
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={i} style={styles.item}>
          <ShimmerSkeleton width={48} height={48} borderRadius={12} />
          <View style={styles.textContainer}>
            <ShimmerSkeleton width={140} height={16} borderRadius={6} />
            <ShimmerSkeleton width={90} height={12} borderRadius={6} style={{ marginTop: 6 }} />
          </View>
          <ShimmerSkeleton width={70} height={24} borderRadius={6} />
        </View>
      ))}
    </View>
  );
}

export function VerseSkeleton() {
  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={styles.verseItem}>
          <ShimmerSkeleton width="100%" height={40} borderRadius={8} />
          <ShimmerSkeleton width="85%" height={40} borderRadius={8} style={{ marginTop: 8 }} />
          <ShimmerSkeleton width="90%" height={14} borderRadius={6} style={{ marginTop: 16 }} />
          <ShimmerSkeleton width="75%" height={14} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  verseItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
});
