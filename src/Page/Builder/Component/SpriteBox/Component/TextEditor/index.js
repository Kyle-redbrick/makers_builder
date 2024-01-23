import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage, injectIntl } from "react-intl";
import onClickOutside from "react-onclickoutside";
import { SketchPicker } from "react-color";
import { Picker } from "emoji-mart";
import AssetLibrary from "../../../../utils/assetLibrary";
import FontDropDown from "../../../../../../Common/Component/FontDropDown";
import * as sceneActions from "../../../../Store/Reducer/scene";
import { SpriteType } from "../../../../../../Common/Util/Constant";
import closeImg from "../../../../../../Image/builder/x-copy-3.svg";
import closeImg_darkmode from "../../../../../../Image/builder/x-copy-3_darkmode.svg";
import { getColorTheme } from "../../../../utils/colorThemeUtil";
import "emoji-mart/css/emoji-mart.css";
import "./index.scss";

const ColorDropDown = onClickOutside((props) => {
  const { color, presetColors, onChangeComplete } = props;
  return (
    <div className={`ColorDD`}>
      <SketchPicker
        color={color}
        presetColors={presetColors}
        onChangeComplete={onChangeComplete}
      />
    </div>
  );
});

const EmojiDropDown = onClickOutside((props) => {
  const { onSelect, i18n } = props;
  return (
    <div className={`EmojiDD`}>
      <Picker onSelect={onSelect} i18n={i18n} />
    </div>
  );
});

class TextEditor extends Component {
  state = {
    isPaletteOn: false,
    isEmojiOn: false,
    textboxProps: {
      fontFamily: "Jua",
      fontSize: 48,
      fontWeight: "normal",
      fontColor: "#000000",
      fontStyle: "normal",
      textValue: "hello world!",
    },
    isUploading: false,
  };

  fontFamilies = AssetLibrary.fonts;
  presetColors = [
    "#20a1ec",
    "#ffd185",
    "#77d354",
    "#ffba5c",
    "#23d8af",
    "#f96063",
    "#916cc5",
    "#3e4852",
    "#969fa9",
    "#ffffff",
  ];

  setTextboxProps = (id, value) => {
    let textboxProps = {
      ...this.state.textboxProps,
      [id]: value,
    };
    this.setState({
      ...this.state,
      textboxProps,
    });
  };

  // fontFamily
  handleFontChange = (value) => {
    this.setTextboxProps("fontFamily", value);
  };
  // fontSize, textValue
  handleOnChange = (event) => {
    const { id, value } = event.target;
    this.setTextboxProps(id, value);
  };
  // fontWeight, fontStyle
  handleOnToggle = (event) => {
    event.preventDefault();
    const { id } = event.target;
    const { fontWeight, fontStyle } = this.state.textboxProps;
    let value;
    switch (id) {
      case "fontWeight":
        value = fontWeight === "normal" ? "bold" : "normal";
        this.setTextboxProps(id, value);
        break;
      case "fontStyle":
        value = fontStyle === "normal" ? "italic" : "normal";
        this.setTextboxProps(id, value);
        break;
      default:
        break;
    }
  };
  // fontColor
  handleColorPick = (color) => {
    this.setTextboxProps("fontColor", color.hex);
  };

  handlePaletteBtn = (e) => {
    const { isPaletteOn } = this.state;
    this.setState({ isPaletteOn: !isPaletteOn, isEmojiOn: false });
  };
  handleEmojiBtn = (e) => {
    const { isEmojiOn } = this.state;
    this.setState({ isEmojiOn: !isEmojiOn, isPaletteOn: false });
  };
  handleEmojiPick = (emoji) => {
    let text = this.state.textboxProps.textValue;
    text += emoji.native;
    this.setTextboxProps("textValue", text);
  };

  handleColorDDClickOutside = (e) => {
    if (/TextEditorButton__color/.test(e.target.className)) return;
    if (this.state.isPaletteOn) this.handlePaletteBtn(e);
  };
  handleEmojiDDClickOutside = (e) => {
    if (/TextEditorButton__emoji/.test(e.target.className)) return;
    if (this.state.isEmojiOn) this.handleEmojiBtn(e);
  };
  handleApply = () => {
    if (this.state.isUploading) {
      return;
    }

    this.setState(
      {
        isUploading: true,
      },
      async () => {
        const { textboxProps } = this.state;
        let info = this.setTextSpriteInfo(textboxProps);
        info.name = this.props.countUpSameName("textbox", this.props.spriteIds);
        this.props.addSprites(this.props.selectedSceneId, [info]);
        this.props.dismiss();
      }
    );
  };

  setTextSpriteInfo = (item) => {
    const spriteId = "textbox";
    const name = "textbox";
    const type = SpriteType.TEXT;
    return { name, assetId: spriteId, preview: item, type };
  };
  render() {
    const {
      fontFamily,
      fontSize,
      fontWeight,
      fontColor,
      fontStyle,
      textValue,
    } = this.state.textboxProps;
    const textAreaStyle = {
      fontFamily,
      fontSize: Number(fontSize),
      fontWeight,
      color: fontColor,
      fontStyle,
    };
    const { isPaletteOn, isEmojiOn, isUploading } = this.state;
    const { handleApply } = this;
    const emojiToggle = isEmojiOn ? "on" : "off";
    const fontWeightToggle = fontWeight === "bold" ? "on" : "off";
    const fontStyleToggle = fontStyle === "italic" ? "on" : "off";
    const colorTheme = getColorTheme();

    return (
      <div className="TextEditor">
        <div className="TextEditor__row row__top">
          <div className="title">
            <FormattedMessage id="ID_TEXT_BOX_TITLE" />
          </div>
          <img
            src={colorTheme === "darkMode" ? closeImg_darkmode : closeImg}
            alt="img"
            className="closeBtn"
            onClick={this.props.dismiss}
          />
        </div>
        <div className="TextEditor__row TextEditor__row1">
          <div className="TextEditorBar">
            <div className="TextEditorBar__row1">
              <FontDropDown
                defaultValue={fontFamily}
                list={this.fontFamilies}
                handleSelectItem={this.handleFontChange}
              />
              <input
                className="TextEditorBar__fontsize"
                id="fontSize"
                onChange={this.handleOnChange}
                type="number"
                value={fontSize}
              />
            </div>
            <div className="TextEditorBar__row2">
              <div className="TextEditorBar__styleGroup">
                <button
                  className={`TextEditorButton TextEditorButton__fontweight--${fontWeightToggle}`}
                  id="fontWeight"
                  onClick={this.handleOnToggle}
                />
                <button
                  className={`TextEditorButton TextEditorButton__fontstyle--${fontStyleToggle}`}
                  id="fontStyle"
                  onClick={this.handleOnToggle}
                />
              </div>
              <div className="TextEditorBar__alignGroup">{""}</div>
              <div className="TextEditorBar__pickerGroup">
                <div
                  id={"storage-texteditor-color-btn"}
                  className={`TextEditorButton TextEditorButton__color`}
                  onClick={this.handlePaletteBtn}
                >
                  <span
                    className="TextEditorButton__color__A"
                    style={{ color: fontColor }}
                  >
                    U
                  </span>
                  <span
                    className="TextEditorButton__color__line"
                    style={{ backgroundColor: fontColor }}
                  />
                </div>
                <button
                  className={`TextEditorButton TextEditorButton__emoji--${emojiToggle}`}
                  onClick={this.handleEmojiBtn}
                />
              </div>
              <div className="TextEditorBar__dropdown">
                {isPaletteOn && (
                  <ColorDropDown
                    handleClickOutside={this.handleColorDDClickOutside}
                    color={fontColor}
                    presetColors={this.presetColors}
                    onChangeComplete={this.handleColorPick}
                  />
                )}
                {isEmojiOn && (
                  <EmojiDropDown
                    handleClickOutside={this.handleEmojiDDClickOutside}
                    onSelect={this.handleEmojiPick}
                    i18n={{
                      //TODO
                      search: this.props.intl.formatMessage({
                        id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_SEARCH",
                      }),
                      notfound: this.props.intl.formatMessage({
                        id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_NOT_FOUND",
                      }),
                      skintext: this.props.intl.formatMessage({
                        id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_SKIN_TEXT",
                      }),
                      categories: {
                        search: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_SEARCH",
                        }),
                        recent: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_RECENT",
                        }),
                        people: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_PEOPLE",
                        }),
                        nature: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_NATURE",
                        }),
                        foods: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_FOODS",
                        }),
                        activity: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_ACTIVITY",
                        }),
                        places: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_PLACES",
                        }),
                        objects: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_OBJECTS",
                        }),
                        symbols: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_SYMBOLS",
                        }),
                        flags: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_FLAGS",
                        }),
                        custom: this.props.intl.formatMessage({
                          id: "ID_STORAGE_CONTAINER_TEXT_EDITOR_DROP_DOWN_CATEGORIES_CUSTOM",
                        }),
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="TextEditor__row TextEditor__row2">
          <textarea
            id="textValue"
            className="TextEditorArea"
            onChange={this.handleOnChange}
            style={textAreaStyle}
            value={textValue}
          />
        </div>

        <div className="TextEditor__bottom">
          {!isUploading ? (
            <button className="applyBtn" onClick={handleApply}>
              <FormattedMessage id="ID_WIZLAB_DRAWING_SAVE" />
            </button>
          ) : (
            <button className="applyBtn off">
              <FormattedMessage id="ID_WIZLAB_DRAWING_SAVING" />
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    selectedSceneId: state.interaction.selected.scene,
    spriteIds: state.scene.scenes[state.interaction.selected.scene].spriteIds,
  }),
  {
    addSprites: sceneActions.addSprites,
  }
)(injectIntl(TextEditor));
