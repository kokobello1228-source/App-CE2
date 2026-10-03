import { View } from 'react-native';
import Svg, { G, Line, Rect } from 'react-native-svg';
import { GRID_COLS, GRID_ROWS, type Cell } from '../skills/m9/logic';
import { colors } from '../theme';

const CELL = 100;
const WIDTH = GRID_COLS * CELL;
const UNIT = 9;
const BAR_W = 13;
const CUBE = 17;
const FILL = '#F2E3C6';

/** A plate: 10 × 10 small squares. */
export function Plate({ x, y }: { x: number; y: number }) {
  const size = UNIT * 10;
  return (
    <G>
      <Rect x={x} y={y} width={size} height={size} fill={FILL} stroke={colors.text} strokeWidth={1.5} />
      {Array.from({ length: 9 }, (_, i) => (
        <G key={i}>
          <Line x1={x + (i + 1) * UNIT} y1={y} x2={x + (i + 1) * UNIT} y2={y + size} stroke={colors.text} strokeWidth={0.5} />
          <Line x1={x} y1={y + (i + 1) * UNIT} x2={x + size} y2={y + (i + 1) * UNIT} stroke={colors.text} strokeWidth={0.5} />
        </G>
      ))}
    </G>
  );
}

/** A bar: 10 stacked squares. */
export function Bar({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Rect x={x} y={y} width={BAR_W} height={UNIT * 10} fill={FILL} stroke={colors.text} strokeWidth={1.5} />
      {Array.from({ length: 9 }, (_, i) => (
        <Line key={i} x1={x} y1={y + (i + 1) * UNIT} x2={x + BAR_W} y2={y + (i + 1) * UNIT} stroke={colors.text} strokeWidth={0.5} />
      ))}
    </G>
  );
}

export function Cube({ x, y }: { x: number; y: number }) {
  return <Rect x={x} y={y} width={CUBE} height={CUBE} fill={FILL} stroke={colors.text} strokeWidth={1.5} />;
}

function CellContent({ cell }: { cell: Cell }) {
  const x0 = cell.col * CELL + 5;
  const y0 = cell.row * CELL + 5;
  const items = Array.from({ length: cell.count }, (_, i) => i);
  if (cell.kind === 'plate') return <Plate x={x0} y={y0} />;
  if (cell.kind === 'bar') return <>{items.map((i) => <Bar key={i} x={x0 + 12 + i * 26} y={y0} />)}</>;
  return <>{items.map((i) => <Cube key={i} x={x0 + 16 + (i % 2) * 40} y={y0 + 16 + Math.floor(i / 2) * 40} />)}</>;
}

/** Collection of base-10 blocks laid out on a grid (in order or scattered). */
export function Base10Blocks({ cells }: { cells: Cell[] }) {
  // Only the rows that hold blocks are drawn (no big empty area).
  const rows = Math.min(GRID_ROWS, Math.max(2, ...cells.map((c) => c.row + 1)));
  const HEIGHT = rows * CELL;
  return (
    <View
      accessible
      accessibilityLabel="Dessin de plaques, de barres et de cubes"
      style={{ width: '100%', aspectRatio: WIDTH / HEIGHT, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 2, borderColor: colors.border }}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {cells.map((cell, i) => (
          <CellContent key={i} cell={cell} />
        ))}
      </Svg>
    </View>
  );
}
