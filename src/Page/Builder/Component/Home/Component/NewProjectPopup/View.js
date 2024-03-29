import React from "react";
import { injectIntl } from "react-intl";
import "./index.scss";
function View(props) {
  const {
    editorFormat,
    onClickEditorFormat,
    projectName,
    onChangeProjectName,
    onClickMake2DProject,
    gameDimension,
    intl,
  } = props;
  return (
    <div className="builder--home__newProjectPopup">
      <div className="builder--popup--title">
        {intl.formatMessage({ id: "ID_BUILDER_NEW_PROJECT_TITLE" })}
      </div>
      {gameDimension === "2D" && (
        <div className="newGamePopup__row row--format">
          <div
            className={
              intl.locale == "en"
                ? "newGamePopup__row--title_en"
                : "newGamePopup__row--title"
            }
          >
            {intl.formatMessage({ id: "ID_BUILDER_NEW_PROJECT_CHOOSE_LANG" })}
          </div>
          <div className="format__buttons">
            <button
              className={`button__${editorFormat === "JS" && "active"}`}
              onClick={() => onClickEditorFormat("JS")}
            >
              JS
            </button>
            {/* <button
              className={`button__${editorFormat === "PY" && "active"}`}
              onClick={() => onClickEditorFormat("PY")}
            >
              PY
            </button> */}

            <button
              className={`button__${editorFormat === "OOBC" && "active"}`}
              onClick={() => onClickEditorFormat("OOBC")}
            >
              OOBC
            </button>
          </div>
        </div>
      )}

      <div className="newGamePopup__row row--name">
        <div
          className={
            intl.locale == "en"
              ? "newGamePopup__row--title_en"
              : "newGamePopup__row--title"
          }
        >
          {intl.formatMessage({ id: "ID_BUILDER_NEW_PROJECT_PROJECT_NAME" })}
        </div>
        <input type="text" onChange={onChangeProjectName} value={projectName} />
      </div>
      <div
        className="newGamePopup__row row--submit"
        onClick={onClickMake2DProject}
      >
        <p>{intl.formatMessage({ id: "ID_BUILDER_NEW_PROJECT_START" })}</p>
      </div>
    </div>
  );
}

export default injectIntl(View);
