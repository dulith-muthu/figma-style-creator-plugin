import { convertHexColorToRgbColor } from '@create-figma-plugin/utilities';
import { CustomPaintStyle, defaultColorRGB } from './types';

export function createSolidPaint(colorHex: string): SolidPaint {
  const RGBcolor = convertHexColorToRgbColor(
    colorHex[0] == '#' ? colorHex.slice(1) : colorHex
  );
  return {
    type: 'SOLID',
    visible: true,
    opacity: 1,
    blendMode: 'NORMAL',
    color: RGBcolor ? RGBcolor : defaultColorRGB,
  };
}

export function createSolidPaintStyle(
  name: string,
  colorHex: string
): CustomPaintStyle {
  return {
    id: '', // later this will be set
    name: name,
    paint: createSolidPaint(colorHex),
  };
}
