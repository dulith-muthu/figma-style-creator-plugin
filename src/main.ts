import {
  emit,
  loadFontsAsync as nodeLoadFontAsync,
  once,
  showUI,
} from '@create-figma-plugin/utilities';
import styles from './styles.css';

import {
  CustomPaintStyle,
  DisplayText,
  FetchData,
  FetchDataHandler,
  FetchMessageEventHandler,
  FetchType,
  InsertDataHandler,
  PresetData,
} from './types';

const baseX = 25;
const baseY = 50;
var nowX = baseX;
var nowY = baseY;
const fetchData: FetchData = { 
  fonts: [],
  paintStyles: []
 }
 var existingTextStyles: PaintStyle[];
 var existingPaintStyles: PaintStyle[];

export default function () {

  once<FetchMessageEventHandler>('FETCH_DATA_REQST', async function (data: FetchType) {
    const loadFonts = figma.listAvailableFontsAsync();
    const loadStyles = new Promise<CustomPaintStyle[]>((resolve, reject) => {
      resolve(processPaintStyles());
    });

    Promise.all([loadFonts, loadStyles]).then((values) => {
      fetchData.fonts = values[0];
      fetchData.paintStyles = values[1];
      emit<FetchDataHandler>('FETCH_DATA_REPLY', fetchData);
    }).catch(error => {
      figma.notify('There was an error while loading.. :[  Please restart the plugin');
      console.log(error);
    });
  });

  once<InsertDataHandler>('INSERT_DATA', async function (data: PresetData) {
    const textStyles = await createTextStyles();

    data.black.id = createColorStyle(data.black);
    const colorStylesText: DisplayText = {
      text: 'Primary Colors',
      textStyleId: textStyles.heading,
      colorStyleId: data.black.id,
    };
    await createColorStyles(colorStylesText, [
      data.primary700,
      data.primary500,
      data.primary300,
      data.primary50,
    ]);

    const buttonText: DisplayText = {
      text: 'Button',
      textStyleId: textStyles.base,
      colorStyleId: data.primary50.id,
    };
    const varients: { name: string; fillColorId: string }[] = [
      { name: 'Default', fillColorId: data.primary500.id },
      { name: 'Hover', fillColorId: data.primary300.id },
      { name: 'Focus', fillColorId: data.primary700.id },
    ];

    await createButton(buttonText, varients);
    
    figma.closePlugin();
  });
  showUI({ width: 400, height: 500 });
}

async function createTextStyles(): Promise<{ base: string; heading: string }> {
  const baseFont = {
    family: 'Roboto',
    style: 'Medium',
  };
  const headingFont = {
    family: 'Inter',
    style: 'Bold',
  };
  await figma.loadFontAsync(baseFont);
  await figma.loadFontAsync(headingFont);

  const existingTextStyles = figma.getLocalTextStyles();

  const eBaseDefault = existingTextStyles.find(t => t.name == 'Base/Default')
  const baseDefault = eBaseDefault ? eBaseDefault : figma.createTextStyle();
  baseDefault.name = 'Base/Default';
  baseDefault.fontName = baseFont;
  baseDefault.fontSize = 16;

  const eHeadingHero = existingTextStyles.find(t => t.name == 'Heading/Hero')
  const headingHero = eHeadingHero ? eHeadingHero : figma.createTextStyle();
  headingHero.name = 'Heading/Hero';
  headingHero.fontName = headingFont;
  headingHero.fontSize = 40;
  headingHero.lineHeight = {
    value: 48,
    unit: 'PIXELS',
  };

  return {
    base: baseDefault.id,
    heading: headingHero.id,
  };
}

async function createColorStyles(
  displayText: DisplayText,
  paints: CustomPaintStyle[]
): Promise<void> {
  const fFrame = createAutoLayoutFrame(displayText.text, 'HORIZONTAL', 24, 24, 16, 'CENTER', nowX, nowY);

  const fText = await createText(createNodeName("cs", displayText.text), displayText);
  fFrame.findChild((n) => n.id === fText.id) ? null : fFrame.appendChild(fText);

  paints.forEach((p, i) => {
    p.id = createColorStyle(p);

    const fCircle = createColorCircle(createNodeName("els", p.name), p, fFrame);
    fFrame.findChild((n) => n.id === fCircle.id) ? null : fFrame.appendChild(fCircle);
  });
  nowY += 120;
}

function createColorStyle(style: CustomPaintStyle): string {
  existingPaintStyles = existingPaintStyles != undefined ? existingPaintStyles : figma.getLocalPaintStyles();
  const existingPaint = existingPaintStyles.find(p => p.type === 'PAINT' && p.name == style.name);
  const fPaintStyle = existingPaint ? (existingPaint as PaintStyle) : figma.createPaintStyle();
  fPaintStyle.name = style.name;
  fPaintStyle.paints = [style.paint];
  return fPaintStyle.id;
}

async function createButtonVariant(
  variantName: string,
  buttonText: DisplayText,
  fillColorId: string | undefined,
  parentNode: ComponentSetNode
): Promise<ComponentNode> {
  const existingComponent = parentNode ? parentNode.findChild(n => n.name.includes(variantName) && n.type === 'COMPONENT') as ComponentNode : undefined;
  const fComponent = existingComponent ? existingComponent : figma.createComponent();
  fComponent.resizeWithoutConstraints(106, 43);
  fComponent.name = variantName;
  fComponent.layoutMode = 'HORIZONTAL';
  fComponent.paddingLeft = 24;
  fComponent.paddingRight = 24;
  fComponent.paddingTop = 12;
  fComponent.paddingBottom = 12;
  fComponent.cornerRadius = 4;
  fComponent.fillStyleId = fillColorId ? fillColorId : '';
  fComponent.itemSpacing = 10;
  fComponent.primaryAxisSizingMode = 'AUTO';
  fComponent.counterAxisSizingMode = 'AUTO';
  fComponent.primaryAxisAlignItems = 'CENTER';
  fComponent.counterAxisAlignItems = 'CENTER';
  fComponent.clipsContent = false;

  const fLabel = existingComponent ? existingComponent.findChild(n => n.name === buttonText.text && n.type === 'TEXT') as TextNode : figma.createText();
  await nodeLoadFontAsync([fLabel]);
  fLabel.characters = buttonText.text;
  fLabel.textStyleId = buttonText.textStyleId;
  fLabel.fillStyleId = buttonText.colorStyleId ? buttonText.colorStyleId : '';
  fComponent.appendChild(fLabel);

  return fComponent;
}

async function createButton(
  text: DisplayText,
  variantsProps: { name: string; fillColorId: string }[]
): Promise<ComponentSetNode> {
  const existingComponentSet = figma.currentPage.findOne(n => n.name === text.text && n.type === 'COMPONENT_SET') as ComponentSetNode;

  const variants: ComponentNode[] = [];
  for (let i = 0; i < variantsProps.length; i++) {
    variants.push(await createButtonVariant(variantsProps[i].name, text, variantsProps[i].fillColorId, existingComponentSet));
  }
  
  const fFrame =  existingComponentSet ? existingComponentSet : figma.combineAsVariants(variants, figma.currentPage);
  fFrame.x = nowX;
  fFrame.y = nowY;
  fFrame.name = text.text;
  fFrame.paddingLeft = 24;
  fFrame.paddingRight = 24;
  fFrame.paddingTop = 24;
  fFrame.paddingBottom = 24;
  fFrame.itemSpacing = 16;
  fFrame.layoutMode = 'HORIZONTAL';
  fFrame.primaryAxisSizingMode = 'AUTO';
  fFrame.counterAxisSizingMode = 'AUTO';
  fFrame.primaryAxisAlignItems = 'MIN';
  fFrame.counterAxisAlignItems = 'MIN';

  nowY += 100;
  return fFrame;
}

function createAutoLayoutFrame(
  name: string,
  layoutMode: 'HORIZONTAL' | 'VERTICAL',
  verPadding: number,
  hozPadding: number,
  space: number,
  align: 'MIN' | 'MAX' | 'CENTER',
  x: number,
  y: number
): FrameNode {
  const existingFrame = figma.currentPage.findOne(n => n.name === name && n.type === 'FRAME') as FrameNode
  const fFrame = existingFrame ? existingFrame : figma.createFrame();
  fFrame.name = name;
  fFrame.layoutMode = layoutMode;
  fFrame.paddingLeft = hozPadding;
  fFrame.paddingRight = hozPadding;
  fFrame.paddingTop = verPadding;
  fFrame.paddingBottom = verPadding;
  fFrame.itemSpacing = space;
  fFrame.primaryAxisSizingMode = 'AUTO';
  fFrame.counterAxisSizingMode = 'AUTO';
  fFrame.primaryAxisAlignItems = align;
  fFrame.counterAxisAlignItems = align;
  fFrame.clipsContent = false;
  fFrame.fills = [];
  fFrame.x = x;
  fFrame.y = y;

  return fFrame;
}

async function createText(name: string, displayText: DisplayText): Promise<TextNode> {
  const existingFrame = figma.currentPage.findOne(n => n.name === name && n.type === 'TEXT') as TextNode
  const fText = existingFrame ? existingFrame : figma.createText();
  await nodeLoadFontAsync([fText]);
  fText.name = name;
  fText.characters = displayText.text;
  fText.textStyleId = displayText.textStyleId;
  fText.fillStyleId = displayText.colorStyleId ? displayText.colorStyleId : '';
  
  return fText;
}

function createColorCircle(name: string, paintStyle: CustomPaintStyle, parentNode: FrameNode): EllipseNode {
  const existingFrame =  parentNode.findChild(n => n.name === name && n.type === 'ELLIPSE')
  const fCircle = existingFrame ? (existingFrame as EllipseNode) : figma.createEllipse();
  fCircle.name = name;
  fCircle.constraints = { horizontal: 'CENTER', vertical: 'CENTER' };
  fCircle.resizeWithoutConstraints(42, 42);
  fCircle.fillStyleId = paintStyle.id;

  return fCircle;
}


function processPaintStyles(): CustomPaintStyle[] {
  const names = ['Primary/700', 'Primary/500', 'Primary/300', 'Primary/50', 'Black'];
  const styles: CustomPaintStyle[] = figma.getLocalPaintStyles()
  .filter((s) => (names.includes(s.name)))
  .map((s) => ( {
    id: s.id,
    name: s.name,
    paint: s.paints[0]
  } ));

  return styles;
}

function createNodeName(prefix: string, name: string): string {
  return `${prefix}_${replaceAll(name, '[ /]', '_').toLowerCase()}`
}

function replaceAll(str: string, findRegEx: string, replace: string): string {
  return str.replace(new RegExp(findRegEx, 'g'), replace);
}