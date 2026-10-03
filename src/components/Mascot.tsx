import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

export type Mood = 'idle' | 'happy' | 'cheer' | 'think';

const BODY = '#5B8DEF';
const BODY_DARK = '#3F6FD1';
const BELLY = '#FFF3D1';
const INK = '#1D2A4D';
const BEAK = '#FFA23A';
const CHEEK = '#FF9BB0';
const native = Platform.OS !== 'web';

/**
 * Plume the owl, the app's companion. Breathes gently, blinks, jumps for joy
 * when the child succeeds and looks thoughtful when it is time to look again.
 */
export function Mascot({ mood = 'idle', size = 120 }: { mood?: Mood; size?: number }) {
  const [blink, setBlink] = useState(false);
  const bob = useRef(new Animated.Value(0)).current;
  const jump = useRef(new Animated.Value(0)).current;
  const reduce = useRef(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then((r) => {
      reduce.current = r;
      if (r) return;
      Animated.loop(
        Animated.sequence([
          Animated.timing(bob, { toValue: 1, duration: 1400, useNativeDriver: native }),
          Animated.timing(bob, { toValue: 0, duration: 1400, useNativeDriver: native }),
        ]),
      ).start();
    });
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800);
    return () => clearInterval(id);
  }, [bob]);

  useEffect(() => {
    if (mood !== 'cheer' || reduce.current) return;
    jump.setValue(0);
    Animated.sequence([
      Animated.spring(jump, { toValue: 1, useNativeDriver: native, speed: 30, bounciness: 14 }),
      Animated.spring(jump, { toValue: 0, useNativeDriver: native, speed: 14, bounciness: 10 }),
    ]).start();
  }, [mood, jump]);

  const translateY = Animated.add(
    bob.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }),
    jump.interpolate({ inputRange: [0, 1], outputRange: [0, -22] }),
  );
  const happyEyes = mood === 'cheer';
  const look = mood === 'think' ? { x: 3, y: -4 } : { x: 0, y: 0 };
  const wingUp = mood === 'cheer';

  return (
    <Animated.View style={{ width: size, height: size * 1.08, transform: [{ translateY }] }} accessible accessibilityLabel="Plume la chouette">
      <Svg width={size} height={size * 1.08} viewBox="0 0 120 130">
        {/* ear tufts */}
        <Path d="M30 30 L24 6 L46 22 Z" fill={BODY_DARK} />
        <Path d="M90 30 L96 6 L74 22 Z" fill={BODY_DARK} />
        {/* wings */}
        <G>
          <Ellipse cx={wingUp ? 16 : 20} cy={wingUp ? 50 : 78} rx={11} ry={24} fill={BODY_DARK} rotation={wingUp ? 35 : 12} origin={`${wingUp ? 16 : 20}, ${wingUp ? 50 : 78}`} />
          <Ellipse cx={wingUp ? 104 : 100} cy={wingUp ? 50 : 78} rx={11} ry={24} fill={BODY_DARK} rotation={wingUp ? -35 : -12} origin={`${wingUp ? 104 : 100}, ${wingUp ? 50 : 78}`} />
        </G>
        {/* body and belly */}
        <Ellipse cx={60} cy={72} rx={42} ry={50} fill={BODY} />
        <Ellipse cx={60} cy={90} rx={27} ry={30} fill={BELLY} />
        <Path d="M50 84 q4 4 8 0 M62 84 q4 4 8 0 M56 96 q4 4 8 0" stroke="#E8C98A" strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* eyes */}
        <Circle cx={43} cy={56} r={16} fill="#FFFFFF" />
        <Circle cx={77} cy={56} r={16} fill="#FFFFFF" />
        {happyEyes || blink ? (
          <G>
            <Path d={happyEyes ? 'M34 58 q9 -10 18 0' : 'M34 57 h18'} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
            <Path d={happyEyes ? 'M68 58 q9 -10 18 0' : 'M68 57 h18'} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          </G>
        ) : (
          <G>
            <Circle cx={43 + look.x} cy={57 + look.y} r={7.5} fill={INK} />
            <Circle cx={77 + look.x} cy={57 + look.y} r={7.5} fill={INK} />
            <Circle cx={45.5 + look.x} cy={54.5 + look.y} r={2.4} fill="#FFFFFF" />
            <Circle cx={79.5 + look.x} cy={54.5 + look.y} r={2.4} fill="#FFFFFF" />
          </G>
        )}
        {/* cheeks and beak */}
        <Circle cx={30} cy={74} r={5.5} fill={CHEEK} opacity={0.6} />
        <Circle cx={90} cy={74} r={5.5} fill={CHEEK} opacity={0.6} />
        <Path d={mood === 'cheer' || mood === 'happy' ? 'M53 68 L67 68 L60 80 Z' : 'M54 68 L66 68 L60 77 Z'} fill={BEAK} />
        {/* feet */}
        <Ellipse cx={48} cy={122} rx={9} ry={5} fill={BEAK} />
        <Ellipse cx={72} cy={122} rx={9} ry={5} fill={BEAK} />
      </Svg>
    </Animated.View>
  );
}
