import {
  Button,
  Container,
  Dropdown,
  DropdownOption,
  LoadingIndicator,
  render,
  VerticalSpace,
} from '@create-figma-plugin/ui';
import { emit, once } from '@create-figma-plugin/utilities';
import { h } from 'preact';
import { useCallback, useState } from 'preact/hooks';

import styles from './styles.css';
import {
  FetchData,
  FetchDataHandler,
  FetchMessageEventHandler,
  FetchType,
  InsertDataHandler,
  PresetData,
} from './types';
import { CustomPicker } from './picker';

function Plugin() {
  const data = new PresetData();
  const [loading, setLoading] = useState(true);
  const [fontSelect, setFontSelect] = useState("Roboto")
  const [fonts, setFontsList]  = useState([{value: "Roboto"}]);

  const [primaryColors, setPrimaryColors] = useState(data.getPrimary());
  const setPrimaryColor = (newColor: string[]) => {
    setPrimaryColors(newColor);
  };

  once<FetchDataHandler>('FETCH_DATA_REPLY', (fetchData: FetchData) => {
    //setFontsList(data.fonts.map((f) => ({value: f.fontName.family})))
    fetchData.paintStyles.forEach((f) => {
      switch (f.name) {
        case 'Primary/700':
          data.primary700 = f
          break;
        case 'Primary/500':
          data.primary500 = f
          break;
        case 'Primary/300':
          data.primary300 = f
          break;
        case 'Primary/50':
          data.primary50 = f
          break;
        case 'Black':
          data.black = f
          break;
      }
    });
    setPrimaryColors(data.getPrimary())
    setLoading(false);
  });
  emit<FetchMessageEventHandler>('FETCH_DATA_REQST', FetchType.FONTS);

  const handleInsertCodeButtonClick = useCallback(
    function () {
      data.setPrimary(primaryColors);
      emit<InsertDataHandler>('INSERT_DATA', data);
    },
    [data]
  );

  return (
    <Container>
      {loading ? (
        <Container>
          <VerticalSpace></VerticalSpace>
          <LoadingIndicator></LoadingIndicator>
        </Container>
      ) : (
        <div>
          <VerticalSpace space="small" />
          <div class={styles.container}>
            <CustomPicker
              color={primaryColors}
              onChange={setPrimaryColor}
              prompt={'Pick Primary Color'}
            />
          </div>
          <VerticalSpace space="large" />
          {/* <Dropdown value={fontSelect} options={fonts} onValueChange={setFontSelect}></Dropdown> */}
          <VerticalSpace space='large' />
          <Button fullWidth onClick={handleInsertCodeButtonClick}>
            Create Styles
          </Button>
          <VerticalSpace space="small" />
        </div>
      )}
    </Container>
  );
}

export default render(Plugin);
