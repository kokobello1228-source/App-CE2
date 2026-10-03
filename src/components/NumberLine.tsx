import { View } from 'react-native';
import Svg, { Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { valueAt, type M3Item } from '../skills/m3/logic';
import { colors } from '../theme';

const WIDTH = 640;
const HEIGHT = 230;
const MARGIN = 70;
const LINE_Y = 175;
const BOX_W = 92;
const BOX_H = 52;

/**
 * Number line drawn like the official booklet: the two ends are labelled in
 * boxes, and an arrow comes down from an empty box onto one tick.
 */
export function NumberLine({ item }: { item: M3Item }) {
  const spacing = (WIDTH - 2 * MARGIN) / item.intervals;
  const x = (index: number) => MARGIN + index * spacing;
  const arrowX = x(item.arrow);
  const ticks = Array.from({ length: item.intervals + 1 }, (_, i) => i);
  const [first, last] = item.labels;
  // The empty box is lifted when it would overlap an end label.
  const nearEnd = item.arrow * spacing < BOX_W || (item.intervals - item.arrow) * spacing < BOX_W;
  const emptyBoxY = nearEnd ? 8 : 70;
  const labelBoxY = 70;
  return (
    <View
      accessible
      accessibilityLabel={`Ligne graduée de ${valueAt(item, first)} à ${valueAt(item, last)}. Une flèche montre une graduation.`}
      style={{ width: '100%', aspectRatio: WIDTH / HEIGHT, backgroundColor: colors.surface, borderRadius: 14 }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Line x1={x(first)} y1={LINE_Y} x2={x(last)} y2={LINE_Y} stroke={colors.text} strokeWidth={4} />
        {ticks.map((i) => {
          const end = i === first || i === last;
          return (
            <Line
              key={i}
              x1={x(i)}
              x2={x(i)}
              y1={end ? labelBoxY + BOX_H : LINE_Y - 12}
              y2={LINE_Y + (end ? 26 : 0)}
              stroke={colors.text}
              strokeWidth={end ? 4 : 3}
            />
          );
        })}
        {[first, last].map((i) => (
          <Rect
            key={`b${i}`}
            x={x(i) - BOX_W / 2}
            y={labelBoxY}
            width={BOX_W}
            height={BOX_H}
            fill={colors.surface}
            stroke={colors.text}
            strokeWidth={2}
          />
        ))}
        {[first, last].map((i) => (
          <SvgText key={`t${i}`} x={x(i)} y={labelBoxY + 37} fontSize={30} fill={colors.text} textAnchor="middle">
            {String(valueAt(item, i))}
          </SvgText>
        ))}
        <Rect
          x={arrowX - BOX_W / 2}
          y={emptyBoxY}
          width={BOX_W}
          height={BOX_H}
          fill={colors.selected}
          stroke={colors.primary}
          strokeWidth={3}
        />
        <SvgText x={arrowX} y={emptyBoxY + 37} fontSize={30} fontWeight="bold" fill={colors.primary} textAnchor="middle">
          ?
        </SvgText>
        <Line x1={arrowX} y1={emptyBoxY + BOX_H} x2={arrowX} y2={LINE_Y - 22} stroke={colors.primary} strokeWidth={4} />
        <Polygon
          points={`${arrowX},${LINE_Y - 8} ${arrowX - 9},${LINE_Y - 24} ${arrowX + 9},${LINE_Y - 24}`}
          fill={colors.primary}
        />
      </Svg>
    </View>
  );
}
