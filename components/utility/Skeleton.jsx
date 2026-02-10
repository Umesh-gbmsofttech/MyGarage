import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import COLORS from '../../theme/colors';

const Skeleton = ({ height = 16, width = '100%', style }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 50],
  });

  return (
    <View style={[styles.base, { height, width }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

const SkeletonRow = ({ lines = 3, lineHeight = 12, gap = 8 }) => {
  return (
    <View style={{ gap }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={`sk-${index}`} height={lineHeight} width={`${90 - index * 10}%`} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: COLORS.skeletonBase,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: COLORS.skeletonHighlight,
    opacity: 0.8,
  },
});

export { Skeleton, SkeletonRow };
export default Skeleton;
