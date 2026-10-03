import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/** Soft clouds and sparkles behind the content: depth without a gradient. */
export function SkyDecor() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMin slice">
        <Path d="M300 70 q14 -30 44 -18 q20 -22 44 0 q26 2 22 28 h-120 q-6 -12 10 -10 z" fill="#FFFFFF" opacity={0.85} />
        <Path d="M-10 250 q12 -26 40 -14 q18 -20 40 0 q24 2 20 26 h-110 z" fill="#FFFFFF" opacity={0.7} />
        <Path d="M290 520 q12 -24 36 -14 q16 -18 36 0 q22 2 18 24 h-98 z" fill="#FFFFFF" opacity={0.6} />
        <Path d="M40 760 q12 -24 36 -14 q16 -18 36 0 q22 2 18 24 h-98 z" fill="#FFFFFF" opacity={0.55} />
        <Path d="M372 210 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 z" fill="#FFD866" opacity={0.9} />
        <Path d="M360 330 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3 l8 -3 z" fill="#FFD866" opacity={0.8} />
        <Path d="M20 470 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" fill="#C9B6FF" opacity={0.9} />
        <Circle cx={250} cy={180} r={4} fill="#9FD8CB" opacity={0.8} />
        <Circle cx={140} cy={620} r={5} fill="#FFB8A8" opacity={0.7} />
        <Circle cx={380} cy={700} r={4} fill="#C9B6FF" opacity={0.8} />
      </Svg>
    </View>
  );
}
