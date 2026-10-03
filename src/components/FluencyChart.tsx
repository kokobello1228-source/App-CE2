import { View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import type { FluencyResult } from '../storage/store';
import { colors, fonts } from '../theme';

const W = 320;
const H = 160;
const PAD = 28;
const TARGET = 70;

/** Words-per-minute curve over time, with the official target of 70. */
export function FluencyChart({ results }: { results: FluencyResult[] }) {
  const last = results.slice(-12);
  const max = Math.max(100, ...last.map((r) => r.wcpm)) + 10;
  const x = (i: number) => PAD + (last.length <= 1 ? (W - 2 * PAD) / 2 : (i * (W - 2 * PAD)) / (last.length - 1));
  const y = (v: number) => H - PAD - (v / max) * (H - 2 * PAD);
  return (
    <View accessible accessibilityLabel={`Évolution : ${last.map((r) => r.wcpm).join(', ')} mots par minute`}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        <Line x1={PAD} x2={W - PAD} y1={y(TARGET)} y2={y(TARGET)} stroke={colors.success} strokeWidth={2} strokeDasharray="6 5" />
        <SvgText x={W - PAD} y={y(TARGET) - 6} fontSize={12} fontFamily={fonts.bold} fill={colors.success} textAnchor="end">
          objectif 70
        </SvgText>
        <Line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke={colors.border} strokeWidth={1.5} />
        {last.length > 1 && (
          <Polyline points={last.map((r, i) => `${x(i)},${y(r.wcpm)}`).join(' ')} fill="none" stroke={colors.primary} strokeWidth={3} />
        )}
        {last.map((r, i) => (
          <Circle key={i} cx={x(i)} cy={y(r.wcpm)} r={5} fill={colors.primary} />
        ))}
        {last.map((r, i) => (
          <SvgText key={`t${i}`} x={x(i)} y={y(r.wcpm) - 10} fontSize={12} fontFamily={fonts.bold} fill={colors.text} textAnchor="middle">
            {String(r.wcpm)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
