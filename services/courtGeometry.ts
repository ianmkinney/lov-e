import type { CornerPoint } from '@/types';

/**

 * Ray-casting point-in-polygon. Corners should be ordered consistently (e.g. TL, TR, BR, BL).
 */
export function pointInCourtPolygon(p: CornerPoint, corners: CornerPoint[]): boolean {
  if (corners.length < 3) return false;
  let inside = false;
  for (let i = 0, j = corners.length - 1; i < corners.length; j = i++) {
    const xi = corners[i].x;
    const yi = corners[i].y;
    const xj = corners[j].x;
    const yj = corners[j].y;
    const intersect =
      yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 0.000001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function normalizeCorners(corners: CornerPoint[]): CornerPoint[] {
  if (corners.length !== 4) return corners;
  return [...corners];
}
