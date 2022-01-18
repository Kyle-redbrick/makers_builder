import React from "react";
import plusImg from "../../../../../../Image/builder/zoom-in.svg";
import minusImg from "../../../../../../Image/builder/zoom-out.svg";
import sortImg from "../../../../../../Image/builder/align.svg";
import "./index.scss";
import ButtonIndicator from "../../../ButtonIndicator";

export default function(props) {
  const {
    // spriteName,
    // spriteIcon,
    intl,
    setFontZoomIn,
    setFontZoomOut,
    setSorting,
    selectedObject,
    tooltip
  } = props;

  let locktoggle = "off";
  if (selectedObject) {
    locktoggle = selectedObject.locked ? "on" : "off";
  }

  const language = localStorage.getItem("wizLang");

  function getApiDescription(description) {
    if (description === undefined) {
      return "";
    } else {
      return description[language];
    }
  }

  return (
    <div className="EditorContainer__editor">
      <div id="ace-editor" />
      <div id="EditorContainer_tooltip" className="EditorContainer_tooltip">
        {tooltip && (
          <React.Fragment>
            <div className="EditorContainer_tooltip_anchor" />
            <div className="EditorContainer_tooltip_content">
              <div className="EditorContainer_tooltip_title">
                {tooltip.caption}
              </div>
              <div className="EditorContainer_tooltip_subtitle">
                {tooltip.tip && getApiDescription(tooltip.tip.description)}
              </div>
            </div>
          </React.Fragment>
        )}
      </div>

      <div className="EditorContainer__zoomBtns">
        <div
          className="EditorContainer__zoomBtn EditorContainer__sort"
          onClick={setSorting}
          data-tip={intl.formatMessage({ id: "ID_BUILDER_CODE_SORT" })}
        >
          <ButtonIndicator buttonId="sortImg">
            <img src={sortImg} alt="sort" />
          </ButtonIndicator>
        </div>
        <div
          className="EditorContainer__zoomBtn EditorContainer__zoomIn"
          onClick={setFontZoomIn}
          data-tip={intl.formatMessage({ id: "ID_BUILDER_CODE_PLUS" })}
        >
          <ButtonIndicator buttonId="plusImg">
            <img src={plusImg} alt="plus" />
          </ButtonIndicator>
        </div>
        <div
          className=" EditorContainer__zoomBtn EditorContainer__zoomOut"
          onClick={setFontZoomOut}
          data-tip={intl.formatMessage({ id: "ID_BUILDER_CODE_MINUS" })}
        >
          <ButtonIndicator buttonId="minusImg">
            <img src={minusImg} alt="minus" />
          </ButtonIndicator>
        </div>
      </div>

      <div className={`editLockContainer--${locktoggle}`}>
        <div className="editLockInner">
          <div className="editLock--title">
            {intl.formatMessage({
              id: "ID_EDIT_LOCK_SPRITE_TITLE"
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
