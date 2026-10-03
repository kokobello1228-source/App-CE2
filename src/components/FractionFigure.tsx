import Svg, { Path, Rect } from 'react-native-svg';
import type { Figure } from '../skills/m8/logic';
import { colors } from '../theme';

const GREY = '#9C9C9C';

function slicePath(cx: number, cy: number, r: number, from: number, to: number): string {
  const point = (angle: number) => `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  const large = to - from > Math.PI ? 1 : 0;
  return `M${cx},${cy} L${point(from)} A${r},${r} 0 ${large} 1 ${point(to)} Z`;
}

/** Disc or bar split into parts (equal or not), some of them grey. */
export function FractionFigure({ figure, size = 110 }: { figure: Figure; size?: number }) {
  const total = figure.sizes.reduce((a, b) => a + b, 0);
  const shaded = new Set(figure.shaded);
  if (figure.shape === 'disc') {
    const r = size / 2 - 4;
    let angle = -Math.PI / 2;
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {figure.sizes.map((s, i) => {
          const from = angle;
          angle += (s / total) * 2 * Math.PI;
          return (
            <Path
              key={i}
              d={slicePath(size / 2, size / 2, r, from, angle)}
              fill={shaded.has(i) ? GREY : colors.surface}
              stroke={colors.text}
              strokeWidth={2}
            />
          );
        })}
      </Svg>
    );
  }
  const width = size * 1.4;
  const height = size * 0.5;
  let x = 3;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {figure.sizes.map((s, i) => {
        const w = (s / total) * (width - 6);
        const rect = (
          <Rect key={i} x={x} y={3} width={w} height={height - 6} fill={shaded.has(i) ? GREY : colors.surface} stroke={colors.text} strokeWidth={2} />
        );
        x += w;
        return rect;
      })}
    </Svg>
  );
}
