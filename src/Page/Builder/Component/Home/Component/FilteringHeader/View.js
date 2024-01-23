import React from "react";
import { injectIntl } from "react-intl";
import "./index.scss";
import dropdownIcon from "../../../../../../Image/icon-drop-down.svg";
import searchIcon from "../../../../../../Image/builder-icon-search.svg";

function View(props) {
  const {
    onClickDimension,
    dimensionType,
    editorType,
    onClickEditorFormat,
    dimension,
    editorFormat,
    onChangeSearch,
    isClickedDropDown,
    onClickTitle,
    intl,
    onClickSearch,
    onKeyPressSearch,
  } = props;
  return (
    <div className="filteringHeader">
      <div
        className={`${
          isClickedDropDown === "engine" && "header__title__selected"
        } wrapper`}
      >
        <p className="header__title" onClick={() => onClickTitle("engine")}>
          {intl.formatMessage({ id: "ID_DREAM_BUILDER_HOME_ENGINE" })}
          <img src={dropdownIcon} alt="" />
        </p>
        <ul className="header__select select__dimension">
          <li
            className={`dimension__item item__${
              dimension === dimensionType.ALL ? "active" : ""
            }`}
            onClick={() => {
              onClickDimension(dimensionType.ALL);
            }}
          >
            {intl.formatMessage({ id: "ID_DREAM_BUILDER_HOME_ALL_KR" })}
          </li>
          {/* <li
            className={`dimension__item item__${
              dimension === dimensionType["3D"] ? "active" : ""
            }`}
            onClick={() => {
              onClickDimension(dimensionType["3D"]);
            }}
          >
            {intl.formatMessage({ id: "ID_DREAM_BUILDER_HOME_3D" })}
          </li> */}
          <li
            className={`dimension__item item__${
              dimension === dimensionType["2D"] ? "active" : ""
            }`}
            onClick={() => {
              onClickDimension(dimensionType["2D"]);
            }}
          >
            {intl.formatMessage({ id: "ID_DREAM_BUILDER_HOME_2D" })}
          </li>
        </ul>
      </div>

      <div
        className={`${
          isClickedDropDown === "lang" && "header__title__selected"
        } wrapper`}
      >
        <p className="header__title" onClick={() => onClickTitle("lang")}>
          {intl.formatMessage({ id: "ID_DREAM_BUILDER_HOME_LANG" })}
          <img src={dropdownIcon} alt="" />
        </p>
        <ul className="header__select select__editorFormat">
          <li
            className={`dimension__item item__${
              editorFormat === editorType.ALL ? "active" : ""
            }`}
            onClick={() => {
              onClickEditorFormat(editorType.ALL);
            }}
          >
            {intl.formatMessage({ id: "ID_DREAM_BUILDER_HOME_ALL_EN" })}
          </li>
          <li
            className={`dimension__item item__${
              editorFormat === editorType.TEXT ? "active" : ""
            }`}
            onClick={() => {
              onClickEditorFormat(editorType.TEXT);
            }}
          >
            {intl.formatMessage({ id: "ID_DREAM_BUILDER_HOME_TEXT" })}
          </li>
          <li
            className={`dimension__item item__${
              editorFormat === editorType.BLOCK ? "active" : ""
            }`}
            onClick={() => {
              onClickEditorFormat(editorType.BLOCK);
            }}
          >
            {intl.formatMessage({ id: "ID_DREAM_BUILDER_HOME_BLOCK" })}
          </li>
        </ul>
      </div>
      <div className="header__search">
        <input
          onChange={onChangeSearch}
          onKeyPress={onKeyPressSearch}
          placeholder={intl.formatMessage({
            id: "ID_PROJECT_SEARCH",
          })}
        />
        <img src={searchIcon} alt="" onClick={onClickSearch} />
      </div>
    </div>
  );
}

export default injectIntl(View);
