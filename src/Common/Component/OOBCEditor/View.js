import React from "react";
import Context from "./Component/Context";
import { LineGroup, Line } from "./Component/Line";
import { BlockGroup } from "./Component/Block";
import Selector from "./Component/Selector";
import ContextMenu from "./Component/ContextMenu";
import UtilMenu from "./Component/UtilMenu";
import ConstantEditor from "./Component/ConstantEditor";
import "./index.scss";

export default function (props) {
  const {
    context,
    lines,
    currentLine,
    currentBlock,
    constantBlockToEdit,
    selectorInfo,
    selectorMode,
    contextMenuInfo,
    zoomLevel,
    isMinZoom,
    isMaxZoom,
    onScrollContext,
    onClickContext,
    onClickLine,
    onLineContextMenu,
    onClickLineContextMenu,
    onClickFoldLine,
    onTouchLineStart,
    onTouchLineMove,
    onTouchLineEnd,
    onDragLine,
    onDragLineOverEnd,
    onDragLineBegin,
    onDragLineEnd,
    onClickInstanceBlock,
    onClickPrototypeBlock,
    onClickAddGlobalVar,
    onClickConstantBlockEdit,
    onClickConstantEditorOverlay,
    onClickConstantEditorConfirm,
    onClickConstantEditorCancel,
    onChangeContantEditorData,
    onClickSelectorCategory,
    onClickSelectorClose,
    onClickZoomIn,
    onClickZoomOut,
    triggerFull,
    exitFull,
  } = props;
  const zoomClass = `oobceditor-zoomLevel${zoomLevel}`;

  return (
    <div id="oobceditor" className={`oobceditor ${zoomClass}`}>
      <Context
        context={context}
        onScrollContext={onScrollContext}
        onClickContext={onClickContext}
      >
        <LineGroup onDragLineOverEnd={onDragLineOverEnd}>
          {lines.map((line) => (
            <Line
              key={line.id}
              line={line}
              currentLine={currentLine}
              onClickLine={onClickLine}
              onLineContextMenu={onLineContextMenu}
              onClickFoldLine={onClickFoldLine}
              onTouchLineStart={onTouchLineStart}
              onTouchLineMove={onTouchLineMove}
              onTouchLineEnd={onTouchLineEnd}
              onDragLine={onDragLine}
              onDragLineBegin={onDragLineBegin}
              onDragLineEnd={onDragLineEnd}
            >
              <BlockGroup
                context={context}
                block={line.block}
                currentBlock={currentBlock}
                onClickBlock={onClickInstanceBlock}
                onClickConstantBlockEdit={onClickConstantBlockEdit}
              />
            </Line>
          ))}
        </LineGroup>
      </Context>
      <Selector
        mode={selectorMode}
        context={context}
        currentBlock={currentBlock}
        selectorInfo={selectorInfo}
        onClickPrototypeBlock={onClickPrototypeBlock}
        onClickAddGlobalVar={onClickAddGlobalVar}
        onClickSelectorCategory={onClickSelectorCategory}
        onClickSelectorClose={onClickSelectorClose}
      />
      <ContextMenu
        contextMenuInfo={contextMenuInfo}
        onClickLineContextMenu={onClickLineContextMenu}
      />
      <UtilMenu
        isMinZoom={isMinZoom}
        isMaxZoom={isMaxZoom}
        onClickZoomIn={onClickZoomIn}
        onClickZoomOut={onClickZoomOut}
        triggerFull={triggerFull}
        exitFull={exitFull}
      />
      <ConstantEditor
        constantBlock={constantBlockToEdit}
        onClickOverlay={onClickConstantEditorOverlay}
        onClickConfirm={onClickConstantEditorConfirm}
        onClickCancel={onClickConstantEditorCancel}
        onChangeData={onChangeContantEditorData}
      />
    </div>
  );
}
