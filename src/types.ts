import {
  convertRgbColorToHexColor,
  EventHandler,
} from '@create-figma-plugin/utilities';
import { createSolidPaint, createSolidPaintStyle } from './utils';


export const defaultColorRGB = { r: 0.5, g: 0.5, b: 0.5 };
export const defaultColorHex = '#4287F5';

export interface InsertDataHandler extends EventHandler {
  name: 'INSERT_DATA';
  handler: (data: PresetData) => void;
}

export interface FetchMessageEventHandler extends EventHandler {
  name: 'FETCH_DATA_REQST';
  handler: (data: FetchType) => void;
}

export interface FetchDataHandler extends EventHandler {
  name: 'FETCH_DATA_REPLY';
  handler: (data: FetchData) => void;
}

export enum FetchType {
  ALL,
  FONTS,
  PAINTS
}

export interface FetchData {
  fonts: Font[];
  paintStyles: CustomPaintStyle[];
}

export class PresetData {
  constructor() {
    this.primary700 = createSolidPaintStyle('Primary/700', '#39219C');
    this.primary500 = createSolidPaintStyle('Primary/500', '#522BF0');
    this.primary300 = createSolidPaintStyle('Primary/300', '#7E61F1');
    this.primary50 = createSolidPaintStyle('Primary/50', '#FFFFFF');
    this.black = createSolidPaintStyle('Black', '#000000');
  }
  primary700: CustomPaintStyle;
  primary500: CustomPaintStyle;
  primary300: CustomPaintStyle;
  primary50: CustomPaintStyle;
  black: CustomPaintStyle;

  setPrimary(list: string[]): void {
    this.primary700.paint = list[0]
      ? createSolidPaint(list[0])
      : this.primary700.paint;
    this.primary500.paint = list[1]
      ? createSolidPaint(list[1])
      : this.primary500.paint;
    this.primary300.paint = list[2]
      ? createSolidPaint(list[2])
      : this.primary300.paint;
    this.primary50.paint = list[3] ? createSolidPaint(list[3]) : this.primary50.paint;
  }

  getPrimary(): string[] {
    const paints = [
      this.primary700,
      this.primary500,
      this.primary300,
      this.primary50,
    ];
    return paints.map((p) => {
      const newHex = convertRgbColorToHexColor((p.paint as SolidPaint).color);
      return newHex ? '#' + newHex : defaultColorHex;
    });
  }
}

export interface CustomPaintStyle {
  id: string;
  name: string;
  paint: Paint;
}

export interface DisplayText {
  text: string;
  textStyleId: string;
  colorStyleId?: string;
}

