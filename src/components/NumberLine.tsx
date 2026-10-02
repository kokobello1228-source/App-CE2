import { View } from 'react-native';
import Svg, { Line, Polygon, Text as SvgText } from 'react-native-svg';
import { valueAt, type M3Item } from '../skills/m3/logic';
import { colors } from '../theme';

const WIDTH = 640;
const HEIGHT = 180;
const MARGIN = 44;
const LINE_Y = 110;

/** Graduated line with two labelled ticks and an arrow pointing at one tick. */
export function NumberLine({ item }: { item: M3Item }) {
  const spacing = (WIDTH - 2 * MARGIN) / item.intervals;
  const x = (index: number) => MARGIN + index * spacing;
  const arrowX = x(item.arrow);
  const ticks = Array.from({ length: item.intervals + 1 }, (_, i) => i);
  const labelText = item.labels.map((i) => valueAt(item, i)).join(' et ');
  return (
    <View
      accessible
      accessibilityLabel={`Ligne graduée avec les nombres ${labelText}. Une flèche montre une graduation.`}
      style={{ width: '100%', aspectRatio: WIDTH / HEIGHT, backgroundColor: colors.surface, borderRadius: 14 }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Line x1={MARGIN - 24} y1={LINE_Y} x2={WIDTH - MARGIN + 24} y2={LINE_Y} stroke={colors.text} strokeWidth={4} />
        <Polygon
          points={`${WIDTH - MARGIN + 34},${LINE_Y} ${WIDTH - MARGIN + 20},${LINE_Y - 9} ${WIDTH - MARGIN + 20},${LINE_Y + 9}`}
          fill={colors.text}
        />
        {ticks.map((i) => {
          const labelled = item.labels.includes(i);
          return (
            <Line
              key={i}
              x1={x(i)}
              x2={x(i)}
              y1={LINE_Y - (labelled ? 18 : 13)}
              y2={LINE_Y + (labelled ? 18 : 13)}
              stroke={colors.text}
              strokeWidth={labelled ? 4 : 3}
            />
          );
        })}
        {item.labels.map((i) => (
          <SvgText key={`l${i}`} x={x(i)} y={LINE_Y + 52} fontSize={28} fontWeight="bold" fill={colors.text} textAnchor="middle">
            {String(valueAt(item, i))}
          </SvgText>
        ))}
        <Line x1={arrowX} y1={30} x2={arrowX} y2={LINE_Y - 34} stroke={colors.primary} strokeWidth={5} />
        <Polygon
          points={`${arrowX},${LINE_Y - 22} ${arrowX - 11},${LINE_Y - 40} ${arrowX + 11},${LINE_Y - 40}`}
          fill={colors.primary}
        />
        <SvgText x={arrowX} y={24} fontSize={26} fontWeight="bold" fill={colors.primary} textAnchor="middle">
          ?
        </SvgText>
      </Svg>
    </View>
  );
}
