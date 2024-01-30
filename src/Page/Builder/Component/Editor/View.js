import React from "react";
import { EDITORMODE } from "../../../../Common/Util/Constant";
import AceEditor from "./Component/AceEditor";
import OOBCEditorWrapper from "./Component/OOBCEditorWrapper";
import "./index.scss";

export default function (props) {
  const { pageType, editorMode, triggerFull, exitFull } = props;

  let editor;
  switch (editorMode) {
    case EDITORMODE.JAVASCRIPT:
    case EDITORMODE.PYTHON:
    default:
      editor = (
        <AceEditor
          pageType={pageType}
          triggerFull={triggerFull}
          exitFull={exitFull}
        />
      );
      break;
    case EDITORMODE.BLOCK:
      editor = (
        <OOBCEditorWrapper triggerFull={triggerFull} exitFull={exitFull} />
      );
      break;
  }

  return <div className="EditorContainer">{editor}</div>;
}
