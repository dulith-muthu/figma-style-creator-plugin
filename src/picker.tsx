import { Button, Container, VerticalSpace } from '@create-figma-plugin/ui';
import { useState, useMemo } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { HexColorPicker } from 'react-colorful';
import { h } from 'preact';
import styles from './styles.css';

// Color converter https://github.com/omgovich/colord
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
extend([namesPlugin]);

export const CustomPicker = ({
  color,
  onChange,
  prompt,
}: {
  color: string[];
  onChange: (pallete: string[]) => void;
  prompt?: string;
}) => {
  const [value, setValue] = useState(color[0]);
  const [value2, setValue2] = useState(color[1]);
  const [value3, setValue3] = useState(color[2]);
  const [value4, setValue4] = useState(color[3]);
  const [showPicker, setShowPicker] = useState(false);

  const debounced = useDebouncedCallback(
    (newVal: string) => {
      const valArray = [
        newVal,
        colord(newVal).lighten(0.15).toHex(),
        colord(newVal).lighten(0.3).toHex(),
        colord(newVal).lighten(0.7).toHex(),
      ];
      setValue(valArray[0]);
      setValue2(valArray[1]);
      setValue3(valArray[2]);
      setValue4(valArray[3]);
    },
    100,
    { leading: true }
  );

  function togglePicker(save: boolean): void {
    setShowPicker(!showPicker);
    if (save) {
      onChange([value, value2, value3, value4]);
    } else {
      setValue(color[0]);
      setValue2(color[1]);
      setValue3(color[2]);
      setValue4(color[3]);
    }
  }

  //   useMemo(() => {
  //     debounced(color);
  //     return color.startsWith('rgba') ? colord(color).toHex() : color;
  //   }, [color]);

  return (
    <div class={styles.colorPickerContainer}>
      <h3>{prompt ? prompt : 'Pick a Color'}</h3>
      <div
        class={styles.colorPicker}
        onClick={() => {
          togglePicker(false);
        }}
        style={{ backgroundColor: value }}
      ></div>
      <div
        class={styles.colorPickerSmall}
        onClick={() => {
          togglePicker(false);
        }}
        style={{ backgroundColor: value2 }}
      ></div>
      <div
        class={styles.colorPickerSmall}
        onClick={() => {
          togglePicker(false);
        }}
        style={{ backgroundColor: value3 }}
      ></div>
      <div
        class={styles.colorPickerSmall}
        onClick={() => {
          togglePicker(false);
        }}
        style={{ backgroundColor: value4 }}
      ></div>
      {showPicker ? (
        <div class={styles.absolute}>
          <HexColorPicker color={value} onChange={debounced} />
          <div class={styles.pickedColorBox} style={{ borderColor: value }}>
            {value} : Primary/700
          </div>
          <div class={styles.pickedColorBox} style={{ borderColor: value2 }}>
            {value2} : Primary/500
          </div>
          <div class={styles.pickedColorBox} style={{ borderColor: value3 }}>
            {value3} : Primary/300
          </div>
          <div class={styles.pickedColorBox} style={{ borderColor: value4 }}>
            {value4} : Primary/50
          </div>
          <VerticalSpace space="medium" />
          <Container space="extraLarge">
            <Button
              class={styles.ml}
              secondary
              onClick={() => {
                togglePicker(false);
              }}
            >
              Cancel
            </Button>
            <Button
              class={styles.ml}
              onClick={() => {
                togglePicker(true);
              }}
            >
              Save
            </Button>
          </Container>
        </div>
      ) : null}
    </div>
  );
};
