import Svg, { Circle, Line, Polygon, Rect } from 'react-native-svg';
import type { CornerPoint } from '@/types';
import { theme } from '@/constants/theme';

type Props = {
  corners: CornerPoint[];
  width: number;
  height: number;
  /**
   * Show viewport frame, optional court silhouette guide, and partial quad while placing corners.
   */
  calibrationMode?: boolean;
};

/** Rough baseline perspective — normalized; aligns with typical “court in frame” framing */
const REFERENCE_COURT: CornerPoint[] = [
  { x: 0.1, y: 0.22 },
  { x: 0.9, y: 0.22 },
  { x: 0.93, y: 0.8 },
  { x: 0.07, y: 0.8 },
];

const toPts = (corners: CornerPoint[], w: number, h: number) =>
  corners.map((c) => `${c.x * w},${c.y * h}`).join(' ');

/**
 * Draws court quad through calibrated corners (normalized 0–1 → pixel space).
 * In calibration mode, also draws a reference boundary and progressive edges while tapping.
 */
export function CourtOverlay({ corners, width, height, calibrationMode = false }: Props) {
  if (width <= 0 || height <= 0) return null;

  const hasQuad = corners.length === 4;
  const inset = 8;

  if (!calibrationMode && !hasQuad) return null;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }} pointerEvents="none">
      {calibrationMode && !hasQuad ? (
        <>
          <Rect
            x={inset}
            y={inset}
            width={width - inset * 2}
            height={height - inset * 2}
            fill="none"
            stroke={theme.textMuted}
            strokeWidth={1.5}
            strokeDasharray="10 8"
            opacity={0.45}
          />
          {corners.length === 0 ? (
            <Polygon
              points={toPts(REFERENCE_COURT, width, height)}
              fill={theme.accent}
              fillOpacity={0.06}
              stroke={theme.accent}
              strokeWidth={1.5}
              strokeDasharray="14 10"
              strokeOpacity={0.55}
            />
          ) : null}
        </>
      ) : null}

      {hasQuad ? (
        <>
          <Polygon
            points={toPts(corners, width, height)}
            fill="transparent"
            stroke={theme.line}
            strokeWidth={2}
            opacity={0.85}
          />
          <Line
            x1={corners[0].x * width}
            y1={corners[0].y * height}
            x2={corners[2].x * width}
            y2={corners[2].y * height}
            stroke={theme.accent}
            strokeWidth={1}
            strokeDasharray="6 6"
            opacity={0.5}
          />
          <Line
            x1={corners[1].x * width}
            y1={corners[1].y * height}
            x2={corners[3].x * width}
            y2={corners[3].y * height}
            stroke={theme.accent}
            strokeWidth={1}
            strokeDasharray="6 6"
            opacity={0.5}
          />
        </>
      ) : calibrationMode && corners.length > 0 ? (
        <>
          {corners.map((c, i) => {
            if (i === 0) return null;
            const prev = corners[i - 1];
            return (
              <Line
                key={`seg-${i}`}
                x1={prev.x * width}
                y1={prev.y * height}
                x2={c.x * width}
                y2={c.y * height}
                stroke={theme.line}
                strokeWidth={2}
                opacity={0.9}
              />
            );
          })}
          {corners.length === 3 ? (
            <Line
              x1={corners[2].x * width}
              y1={corners[2].y * height}
              x2={corners[0].x * width}
              y2={corners[0].y * height}
              stroke={theme.textMuted}
              strokeWidth={1.5}
              strokeDasharray="8 6"
              opacity={0.65}
            />
          ) : null}
          {corners.map((c, i) => (
            <Circle
              key={`dot-${i}`}
              cx={c.x * width}
              cy={c.y * height}
              r={10}
              fill={theme.surfaceMuted}
              stroke={theme.accent}
              strokeWidth={2}
            />
          ))}
        </>
      ) : null}
    </Svg>
  );
}
