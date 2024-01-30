import React, { Component } from "react";
import { CONTEXTMENU } from "./Constant";
import Localization from "./Localization";
import Alert from "./Alert";
import Sound from "./Sound";
import OOBC from "./OOBC";
import View from "./View";

class OOBCEditor extends Component {
  constructor(props) {
    super(props);
    Localization.updateLocaleTo(this.props.locale);
    Alert.configureWith(this.props.alert);
    Sound.configureWith(this.props.sound);

    this.oobcContext = new OOBC.Context();
    this.oobcContext.updatePrototypesInfo(this.props.prototypesInfo);

    this.state = {
      lines: this.oobcContext.getDisplayLines(),
      currentLine: null,
      currentBlock: null,
      constantBlockToEdit: null,
      selectorInfo: null,
      contextMenuInfo: null,
      zoomLevel: 0,
    };
  }
  componentDidMount() {
    this.setKeyListener();
    this.loadZoomLevel();
  }
  componentWillUnmount() {
    this.clearKeyListener();
    this.clearScrollInterval();
  }
  componentDidUpdate(prevProps) {
    if (
      JSON.stringify(prevProps.prototypesInfo) !==
      JSON.stringify(this.props.prototypesInfo)
    ) {
      this.onUpdatePrototypesInfo();
    }
    if (prevProps.locale !== this.props.locale) {
      this.onUpdateLocale();
    }
  }
  onUpdatePrototypesInfo() {
    this.oobcContext.updatePrototypesInfo(this.props.prototypesInfo);
    const { currentBlock } = this.state;
    if (currentBlock) {
      const prevCategory = this.state.selectorInfo.currentCategory;
      const selectorInfo = this.getSelectorInfoFor(currentBlock);
      selectorInfo.currentCategory = prevCategory;
      this.setState({ selectorInfo });
    }
  }
  onUpdateLocale() {
    Localization.updateLocaleTo(this.props.locale);
    this.onUpdateContext();
  }

  initEmptyContext() {
    this.oobcContext = new OOBC.Context();
    this.onInitContext();
  }
  initContextWith(contextJSON) {
    this.oobcContext = OOBC.Context.fromJSON(contextJSON);
    this.onInitContext();
  }
  onInitContext() {
    this.oobcContext.updatePrototypesInfo(this.props.prototypesInfo);
    this.setState({
      lines: this.oobcContext.getDisplayLines(),
      currentLine: null,
      currentBlock: null,
      selectorInfo: null,
    });
  }
  onUpdateContext() {
    this.setState({ lines: this.oobcContext.getDisplayLines() }, () => {
      const { onUpdateContextJSON } = this.props;
      const contextJSON = this.getContextJSON();
      if (onUpdateContextJSON) onUpdateContextJSON(contextJSON);
    });
  }
  getContextJSON() {
    return this.oobcContext.toJSON();
  }

  setCurrentLine(line) {
    this.setState(
      {
        currentLine: line,
        currentBlock: null,
        selectorInfo: null,
        contextMenuInfo: null,
      },
      () => {
        if (line) this.scrollToLine(line);
      }
    );
  }
  setCurrentBlock(block) {
    if (block) {
      const parentLine = block.getParentLine();
      const selectorInfo = this.getSelectorInfoFor(block);
      this.setState(
        {
          currentLine: parentLine,
          currentBlock: block,
          selectorInfo: selectorInfo,
          contextMenuInfo: null,
        },
        () => {
          this.scrollToLine(parentLine);
        }
      );
    } else {
      this.setState({
        currentBlock: null,
        selectorInfo: null,
      });
    }
  }
  setCurrentCategory(category) {
    if (!this.state.selectorInfo) return;
    const selectorInfo = {
      ...this.state.selectorInfo,
      currentCategory: category,
    };
    this.setState({ selectorInfo });
  }
  setConstantBlockToEdit(constantBlock) {
    const { onChangeConstantEditorOn } = this.props;
    if (onChangeConstantEditorOn) {
      const constantEditorOn = !!constantBlock;
      onChangeConstantEditorOn(constantEditorOn);
    }
    this.setState({ constantBlockToEdit: constantBlock });
  }

  replaceOrCoverCurrentBlockWith(instanceBlock) {
    if (this.state.currentBlock.isCompatibleWith(instanceBlock)) {
      this.replaceCurrentBlockWith(instanceBlock);
    } else {
      const confirm = () => {
        this.coverCurrentBlockWith(instanceBlock);
      };
      this.showCoverBlockWarning(confirm);
    }
  }
  replaceCurrentBlockWith(instanceBlock) {
    this.state.currentBlock.replaceWith(instanceBlock);
    this.onReplaceOrCoverCurrentBlockWith(instanceBlock);
  }
  showCoverBlockWarning(confirm) {
    const { formatWithId } = Localization;
    Alert.confirm({
      title: formatWithId("ID_OOBC_ALERT_REPLACE_BLOCK_TITLE"),
      message: formatWithId("ID_OOBC_ALERT_REPLACE_BLOCK_MESSAGE"),
      confirmButtonName: Localization.formatWithId("ID_OOBC_GENERAL_REPLACE"),
      confirmButtonAction: confirm,
      cancelButtonName: Localization.formatWithId("ID_OOBC_GENERAL_CANCEL"),
    });
  }
  coverCurrentBlockWith(instanceBlock) {
    this.state.currentBlock.coverWith(instanceBlock);
    this.onReplaceOrCoverCurrentBlockWith(instanceBlock);
  }
  onReplaceOrCoverCurrentBlockWith(instanceBlock) {
    this.addLineBelowIfNeeded();
    this.onUpdateContext();
    if (this.shouldOpenConstantEditorFor(instanceBlock)) {
      this.setConstantBlockToEdit(instanceBlock);
    } else {
      this.setCurrentBlock(instanceBlock.findNextEmptyBlock());
    }
  }
  addLineBelowIfNeeded() {
    const { currentLine } = this.state;
    if (currentLine.isLastSibling()) {
      currentLine.addSibling();
    }
  }
  shouldOpenConstantEditorFor(block) {
    switch (block.type) {
      case OOBC.TYPE.BLOCK.NUMBERBLOCK:
      case OOBC.TYPE.BLOCK.STRINGBLOCK:
      case OOBC.TYPE.BLOCK.KEY:
        return block.data === null;
      case OOBC.TYPE.BLOCK.POSITION:
        return true;
      default:
        return false;
    }
  }

  onClickLine = (line) => {
    const { currentLine } = this.state;
    if (line === currentLine) {
      this.setCurrentLine(null);
    } else {
      Sound.playWithId("touchLine");
      this.setCurrentLine(line);
    }
  };
  onClickFoldLine = (line) => {
    Sound.playWithId("touchLine");
    if (line.folded) {
      line.unfold();
    } else {
      line.fold();
    }
    this.onUpdateContext();
  };
  onDragLine = (dragLine, hoverLine, dragOffset) => {
    if (dragLine.lineNum === hoverLine.lineNum) return;

    this.scrollWhileDraggingLineIfNeeded(dragOffset);

    let didMove;
    if (this.getIsUpwardDragging(hoverLine, dragOffset)) {
      didMove = dragLine.moveBefore(hoverLine);
    } else {
      didMove = dragLine.moveAfter(hoverLine);
    }

    if (didMove) this.onUpdateContext();
  };
  onDragLineOverEnd = (dragLine) => {
    const didMove = dragLine.moveToLastOfContext();
    if (didMove) this.onUpdateContext();
  };
  scrollWhileDraggingLineIfNeeded(dragOffset) {
    const context = document.getElementById("oobceditor_context");
    const contextRect = context.getBoundingClientRect();
    const contextOffsetY = dragOffset.y - contextRect.top;
    const offsetToScroll = 20;
    if (contextOffsetY < offsetToScroll) {
      if (!this.scrollInterval) {
        this.scrollInterval = setInterval(() => {
          context.scrollTo({ top: context.scrollTop - 1 });
        }, 1);
      }
    } else if (contextRect.height - contextOffsetY < offsetToScroll) {
      if (!this.scrollInterval) {
        this.scrollInterval = setInterval(() => {
          context.scrollTo({ top: context.scrollTop + 1 });
        }, 1);
      }
    } else {
      this.clearScrollInterval();
    }
  }
  getIsUpwardDragging = (hoverLine, dragOffset) => {
    const hoverLineElement = document.getElementById(
      `oobceditor_line-${hoverLine.id}`
    );
    if (!hoverLineElement) return false;
    const hoverLineRect = hoverLineElement.getBoundingClientRect();
    if (hoverLineRect.top + hoverLineRect.height / 2 > dragOffset.y) {
      return true;
    } else {
      return false;
    }
  };
  clearScrollInterval() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = undefined;
    }
  }
  onDragLineBegin = (line) => {
    this.prevLineFolded = line.folded;
    this.prevBlock = this.state.currentBlock;
    this.setCurrentBlock(null);
    const shouldFoldBeforeDragStart = line.getCallbackBlock() && !line.folded;
    if (shouldFoldBeforeDragStart) {
      line.fold();
      this.onUpdateContext();
    }
  };
  onDragLineEnd = (line) => {
    this.setCurrentBlock(this.prevBlock);
    if (!this.prevLineFolded) {
      line.unfold();
      this.onUpdateContext();
    }
    this.clearScrollInterval();
  };
  scrollToLine(line) {
    const scroller = document.getElementById("oobceditor_context");
    const element = document.getElementById(`oobceditor_line-${line.id}`);
    if (scroller && element) {
      let top;
      if (this.state.currentBlock) {
        top =
          element.offsetTop -
          (scroller.offsetHeight / 2 - element.offsetHeight) / 2;
      } else {
        top =
          element.offsetTop -
          (scroller.offsetHeight - element.offsetHeight) / 2;
      }
      scroller.scroll({ top, behavior: "smooth" });
    }
  }

  onScrollContext = () => {
    this.clearLineLongTouchTimeout();
  };
  onClickContext = () => {
    this.setCurrentLine(null);
  };

  onTouchLineStart = (line, position) => {
    this.lineLongTouchPosition = position;
    this.setLineLongTouchTimeout(() => {
      this.onLineLongTouch(line, this.lineLongTouchPosition);
    });
  };
  onTouchLineMove = (position) => {
    this.lineLongTouchPosition = position;
  };
  onTouchLineEnd = (line) => {
    this.clearLineLongTouchTimeout();
  };
  onLineLongTouch = (line, position) => {
    this.clearLineLongTouchTimeout();
    this.openLineContextMenu(line, position);
  };
  setLineLongTouchTimeout(callback) {
    this.clearLineLongTouchTimeout();
    this.lineLongTouchTimeout = setTimeout(callback, 700);
  }
  clearLineLongTouchTimeout() {
    if (this.lineLongTouchTimeout) {
      clearTimeout(this.lineLongTouchTimeout);
      this.lineLongTouchTimeout = undefined;
    }
  }

  onClickInstanceBlock = (instanceBlock) => {
    const { currentBlock } = this.state;
    if (instanceBlock !== currentBlock) {
      Sound.playWithId("contextBlock");
      this.setCurrentBlock(instanceBlock);
    }
  };
  onClickPrototypeBlock = (prototypeBlock) => {
    if (this.isDisabledPrototypeBlock(prototypeBlock)) {
      this.onClickDisabledPrototypeBlock(prototypeBlock);
    } else {
      const { currentBlock } = this.state;
      const instanceBlock =
        currentBlock.createInstanceBlockWith(prototypeBlock);
      Sound.playWithId("prototypeBlock");
      this.replaceOrCoverCurrentBlockWith(instanceBlock);
    }
  };
  isDisabledPrototypeBlock(prototypeBlock) {
    const { disabledPrototypeBlocks = [] } = this.state.selectorInfo || {};
    return disabledPrototypeBlocks.includes(prototypeBlock);
  }
  onClickDisabledPrototypeBlock(prototypeBlock) {
    const { formatWithId } = Localization;
    if (
      prototypeBlock instanceof OOBC.Action &&
      (prototypeBlock.data === "playAnimation" ||
        prototypeBlock.data === "stopAnimation")
    ) {
      Alert.alert({
        title: formatWithId("ID_OOBC_ALERT_DISABLED_BLOCK_TITLE"),
        message: formatWithId("ID_OOBC_ALERT_DISABLED_ANIMATEBLOCK_MESSAGE"),
        buttonName: formatWithId("ID_OOBC_GENERAL_CONFIRM"),
      });
    } else {
      Alert.alert({
        title: formatWithId("ID_OOBC_ALERT_DISABLED_BLOCK_TITLE"),
        message: formatWithId("ID_OOBC_ALERT_DISABLED_BLOCK_MESSAGE"),
        buttonName: formatWithId("ID_OOBC_GENERAL_CONFIRM"),
      });
    }
  }

  onClickAddGlobalVar = () => {
    this.showGlobalVarPrompt();
  };
  showGlobalVarPrompt() {
    const { formatWithId } = Localization;
    Alert.prompt({
      title: formatWithId("ID_OOBC_ALERT_ADDVAR_TITLE"),
      message: formatWithId("ID_OOBC_ALERT_ADDVAR_MESSAGE"),
      placeholder: formatWithId("ID_OOBC_ALERT_ADDVAR_PLACEHOLDER"),
      confirmButtonName: formatWithId("ID_OOBC_GENERAL_CONFIRM"),
      cancelButtonName: formatWithId("ID_OOBC_GENERAL_CANCEL"),
      confirmButtonAction: this.onConfirmGlobalVarPrompt,
    });
  }
  onConfirmGlobalVarPrompt = (name) => {
    if (this.checkGlobalVarAndAlertIfInvalid(name)) {
      const { onAddGlobalVar } = this.props;
      if (onAddGlobalVar) onAddGlobalVar(name);
    }
  };
  checkGlobalVarAndAlertIfInvalid(name) {
    const { formatWithId } = Localization;
    if (!this.checkGlobalVarName(name)) {
      Alert.alert({
        title: formatWithId("ID_OOBC_ALERT_ADDVAR_TITLE"),
        message: formatWithId("ID_OOBC_ALERT_ADDVAR_INVALIDNAME_MESSAGE"),
        buttonName: Localization.formatWithId("ID_OOBC_GENERAL_CONFIRM"),
        buttonAction: this.onClickAddGlobalVar,
      });
      return false;
    }
    if (this.checkGlobalVarExist(name)) {
      Alert.alert({
        title: formatWithId("ID_OOBC_ALERT_ADDVAR_TITLE"),
        message: formatWithId("ID_OOBC_ALERT_ADDVAR_EXISTNAME_MESSAGE"),
        buttonName: Localization.formatWithId("ID_OOBC_GENERAL_CONFIRM"),
        buttonAction: this.onClickAddGlobalVar,
      });
      return false;
    }
    return true;
  }
  checkGlobalVarName(name) {
    return RegExp("^[a-zA-Z_$][a-zA-Z_$0-9]*$").test(name);
  }
  checkGlobalVarExist(name) {
    const { variables = [] } = this.props.prototypesInfo || {};
    return variables.includes(name);
  }

  onClickConstantBlockEdit = (constantBlock) => {
    this.setConstantBlockToEdit(constantBlock);
  };
  onClickConstantEditorOverlay = () => {
    this.setConstantBlockToEdit(null);
  };
  onClickConstantEditorConfirm = (constantBlock, newData) => {
    constantBlock.data = newData;
    this.onUpdateContext();
    this.setConstantBlockToEdit(null);
    this.setCurrentBlock(constantBlock.findNextEmptyBlock());
  };
  onClickConstantEditorCancel = (constantBlock) => {
    this.updateDefaultConstantDataIfNull(constantBlock);
    this.setConstantBlockToEdit(null);
  };
  updateDefaultConstantDataIfNull(constantBlock) {
    if (constantBlock.data === null) {
      switch (constantBlock.type) {
        case OOBC.TYPE.BLOCK.NUMBERBLOCK:
          constantBlock.data = 0;
          break;
        case OOBC.TYPE.BLOCK.STRINGBLOCK:
          constantBlock.data = Localization.formatWithId(
            "ID_OOBC_BLOCK_STRING_DEFAULT"
          );
          break;
        default:
          break;
      }
      this.onUpdateContext();
    }
  }
  onChangeContantEditorData = (data) => {
    const { onChangeConstantEditorValue } = this.props;
    if (onChangeConstantEditorValue) {
      onChangeConstantEditorValue(data);
    }
  };

  onClickSelectorCategory = (category) => {
    Sound.playWithId("blockCategory");
    this.setCurrentCategory(category);
  };
  onClickSelectorClose = () => {
    this.setCurrentBlock(null);
  };
  getSelectorInfoFor(instanceBlock) {
    const selectorInfo = {
      categories: [],
      currentCategory: null,
      prototypeBlocksOf: {},
      disabledPrototypeBlocks: [],
    };
    const replaceablePrototypeBlocks =
      instanceBlock.filterPrototypeBlocksReplaceable(
        this.oobcContext.getPrototypeBlocks()
      );
    const disabledPrototypeBlocks = instanceBlock.filterPrototypeBlocksDisabled(
      replaceablePrototypeBlocks
    );
    selectorInfo.disabledPrototypeBlocks = disabledPrototypeBlocks;
    for (let i in replaceablePrototypeBlocks) {
      const prototypeBlock = replaceablePrototypeBlocks[i];
      const category = prototypeBlock.category;
      if (!selectorInfo.categories.includes(category)) {
        selectorInfo.categories.push(category);
        selectorInfo.prototypeBlocksOf[category] = [];
      }
      selectorInfo.prototypeBlocksOf[category].push(prototypeBlock);
    }
    if (instanceBlock.checkBlockReplaceable(new OOBC.Variable())) {
      if (!selectorInfo.categories.includes(OOBC.TYPE.CATEGORY.VARIABLE)) {
        selectorInfo.categories.push(OOBC.TYPE.CATEGORY.VARIABLE);
      }
      selectorInfo.prototypeBlocksOf[OOBC.TYPE.CATEGORY.VARIABLE] =
        this.oobcContext.prototypeBlocks.filter(
          (block) => block.category === OOBC.TYPE.CATEGORY.VARIABLE
        );
    }
    this.sortCategories(selectorInfo.categories);
    selectorInfo.currentCategory = selectorInfo.categories[0];
    return selectorInfo;
  }
  sortCategories(categories) {
    const priority = [
      OOBC.TYPE.CATEGORY.CONSTANT,
      OOBC.TYPE.CATEGORY.GAMEOBJECT,
      OOBC.TYPE.CATEGORY.ACTION,
      OOBC.TYPE.CATEGORY.PROPERTY,
      OOBC.TYPE.CATEGORY.OPERATOR,
      OOBC.TYPE.CATEGORY.UTIL,
      OOBC.TYPE.CATEGORY.VARIABLE,
      OOBC.TYPE.CATEGORY.FUNCTIONBLOCK,
      OOBC.TYPE.CATEGORY.CALLBACK,
    ];
    categories.sort((a, b) => priority.indexOf(a) - priority.indexOf(b));
  }
  getCurrentCategory() {
    const { selectorInfo } = this.state;
    if (!selectorInfo) return;
    return selectorInfo.currentCategory;
  }

  onLineContextMenu = (line, position) => {
    this.clearLineLongTouchTimeout();
    this.openLineContextMenu(line, position);
  };
  openLineContextMenu(line, position) {
    const contextMenuInfo = this.getContextMenuInfoFor(line, position);
    Sound.playWithId("contextBlock");
    this.setContextMenuInfo(contextMenuInfo);
  }
  getContextMenuInfoFor(line, position) {
    const contextMenuIds = this.getAvailableContextMenuIdsFor(line);
    const style = this.getContextMenuStyle(
      position,
      contextMenuIds.length,
      line
    );
    return { line, contextMenuIds, style };
  }
  getAvailableContextMenuIdsFor(line) {
    const contextMenuIds = [];
    if (this.state.lines.length > 1) {
      contextMenuIds.push(CONTEXTMENU.DELETE);
    }
    if (line.block.data) {
      contextMenuIds.push(CONTEXTMENU.COPY);
    }
    if (this.copiedLine) {
      contextMenuIds.push(CONTEXTMENU.PASTE);
    }
    contextMenuIds.push(CONTEXTMENU.ADD);
    if (line.disabled) {
      contextMenuIds.push(CONTEXTMENU.ENABLE);
    } else {
      contextMenuIds.push(CONTEXTMENU.DISABLE);
    }
    // TODO: 코멘트 기능이 추가되기 전까지 코멘트 메뉴를 보여주지 않습니다.
    // if (line.comment) {
    //   contextMenuIds.push(CONTEXTMENU.DELETECOMMENT);
    // } else {
    //   contextMenuIds.push(CONTEXTMENU.COMMENT);
    // }
    return contextMenuIds;
  }
  getContextMenuStyle(position, contextMenuCount, line) {
    let px, py;
    if (position) {
      px = position.x;
      py = position.y;
    } else {
      const lineRect = document
        .getElementById(`oobceditor_line-${line.id}`)
        .getBoundingClientRect();
      px = lineRect.width;
      py = lineRect.top + lineRect.height / 2;
    }
    const width = 120;
    const height = contextMenuCount * 30 + 12;
    const offset = 18;
    const oobceditorRect = document
      .getElementById("oobceditor")
      .getBoundingClientRect();
    let top = py - oobceditorRect.top - offset;
    const maxTop = oobceditorRect.height - height - offset;
    if (top > maxTop) top = maxTop;
    let left = px - oobceditorRect.left + offset;
    const maxLeft = oobceditorRect.width - width - offset;
    if (left > maxLeft) left = maxLeft;

    return { top, left, width, height };
  }
  setContextMenuInfo(contextMenuInfo) {
    this.setState({ contextMenuInfo: null }, () => {
      if (!contextMenuInfo) return;
      this.setState({
        currentLine: contextMenuInfo.line,
        currentBlock: null,
        contextMenuInfo,
      });
    });
  }

  onClickLineContextMenu = (line, contextMenuId) => {
    Sound.playWithId("menu");
    switch (contextMenuId) {
      case CONTEXTMENU.DELETE:
        this.onClickDeleteLine(line);
        break;
      case CONTEXTMENU.COPY:
        this.onClickCopyLine(line);
        break;
      case CONTEXTMENU.PASTE:
        this.onClickPasteLine(line);
        break;
      case CONTEXTMENU.ADD:
        this.onClickAddLine(line);
        break;
      case CONTEXTMENU.ENABLE:
        this.onClickEnableLine(line);
        break;
      case CONTEXTMENU.DISABLE:
        this.onClickDisableLine(line);
        break;
      case CONTEXTMENU.COMMENT:
        this.onClickAddComment(line);
        break;
      case CONTEXTMENU.DELETECOMMENT:
        this.onClickDeleteComment(line);
        break;
      default:
        break;
    }
    this.setState({ contextMenuInfo: null });
  };
  onClickDeleteLine(line) {
    if (line.isEmpty()) {
      Sound.stopWithId("menu");
      Sound.playWithId("deleteLine");
      this.oobcContext.deleteLine(line);
      this.setCurrentLine(null);
      this.onUpdateContext();
    } else {
      const { formatWithId } = Localization;
      Alert.confirm({
        title: formatWithId("ID_OOBC_ALERT_DELETELINE_TITLE"),
        message: formatWithId("ID_OOBC_ALERT_DELETELINE_MESSAGE"),
        confirmButtonName: Localization.formatWithId("ID_OOBC_GENERAL_CLEAR"),
        confirmButtonAction: () => {
          Sound.stopWithId("menu");
          Sound.playWithId("deleteLine");
          this.oobcContext.deleteLine(line);
          this.setCurrentLine(null);
          this.onUpdateContext();
        },
        cancelButtonName: Localization.formatWithId("ID_OOBC_GENERAL_CANCEL"),
      });
    }
  }
  onClickCopyLine(line) {
    this.copiedLine = line;
  }
  onClickPasteLine(line) {
    if (!this.copiedLine) return;
    const clone = this.copiedLine.clone();
    line.addAfter(clone);
    this.onUpdateContext();
    this.setCurrentLine(clone);
  }
  onClickAddLine(line) {
    const newLine = line.addEmptyAfter();
    this.onUpdateContext();
    this.setCurrentLine(newLine);
  }
  onClickEnableLine(line) {
    line.enable();
    this.onUpdateContext();
  }
  onClickDisableLine(line) {
    line.disable();
    this.onUpdateContext();
  }
  onClickAddComment(line) {}
  onClickDeleteComment(line) {}

  getInstanceBlockElementAt(lineNum, blockNum) {
    const instanceBlock = this.getInstanceBlockAt(lineNum, blockNum);
    if (!instanceBlock) return;
    const element = document.getElementById(
      `oobceditor_block-${instanceBlock.id}`
    );
    return element;
  }
  getInstanceBlockAt(lineNum, blockNum) {
    return this.oobcContext.getBlockAt(lineNum, blockNum);
  }
  clickInstanceBlockAt(lineNum, blockNum) {
    const instanceBlock = this.getInstanceBlockAt(lineNum, blockNum);
    if (!instanceBlock) return;
    if (
      this.state.currentBlock === instanceBlock &&
      instanceBlock instanceof OOBC.Constant
    ) {
      this.onClickConstantBlockEdit(instanceBlock);
    } else {
      this.onClickInstanceBlock(instanceBlock);
    }
  }
  getPrototypeBlockElementWithData(data) {
    const prototypeBlock = this.getPrototypeBlockWithData(data);
    if (!prototypeBlock) return;
    const element = document.getElementById(
      `oobceditor_block-${prototypeBlock.id}`
    );
    return element;
  }
  getPrototypeBlockWithData(data) {
    const currentCategoryPrototypeBlocks =
      this.getCurrentCategoryPrototypeBlocks();
    const prototypeBlockWithData = currentCategoryPrototypeBlocks.find(
      (prototypeBlock) => prototypeBlock.data === data
    );
    return prototypeBlockWithData;
  }
  getCurrentCategoryPrototypeBlocks() {
    const { selectorInfo } = this.state;
    if (!selectorInfo) return [];
    const { currentCategory, prototypeBlocksOf } = selectorInfo;
    const prototypeBlocks = prototypeBlocksOf[currentCategory];
    return prototypeBlocks;
  }
  clickPrototypeBlockWithData(data) {
    const prototypeBlock = this.getPrototypeBlockWithData(data);
    if (!prototypeBlock) return;
    this.onClickPrototypeBlock(prototypeBlock);
  }
  getSelectorCategoryElementWithName(category) {
    const element = document.getElementById(
      `oobceditor_selector_category-${category}`
    );
    return element;
  }
  onClickSelectorCategoryWithName(category) {
    this.onClickSelectorCategory(category);
  }

  setKeyListener() {
    // window.addEventListener("keyup", this.keyListener);
  }
  clearKeyListener() {
    // window.removeEventListener("keyup", this.keyListener);
  }
  keyListener = (event) => {
    const { key } = event;
    switch (key) {
      case "Backspace":
      case "Delete":
        this.onDeleteKeyListener();
        break;
      case "Enter":
        this.onEnterKeyListener();
        break;
      case "Tab":
        this.onTabKeyListener();
        break;
      default:
        break;
    }
  };
  onDeleteKeyListener = () => {
    const { currentLine } = this.state;
    if (currentLine) {
      this.onClickDeleteLine(currentLine);
    }
  };
  onEnterKeyListener = () => {
    const { currentLine } = this.state;
    if (currentLine) {
      this.onClickAddLine(currentLine);
    }
  };
  onTabKeyListener = () => {
    const { currentLine } = this.state;
    if (currentLine) {
      this.openLineContextMenu(currentLine);
    }
  };

  loadZoomLevel() {
    let zoomLevel = this.getZoomLevelFromLocal();
    this.setState({ zoomLevel });
    this.maxZoomLevel = 4;
    this.minZoomLevel = 0;
  }
  updateZoomLevelToLocal() {
    const { zoomLevel } = this.state;
    localStorage.setItem("oobcEditorZoomLevel", zoomLevel);
  }
  getZoomLevelFromLocal() {
    const defaultZoomLevel = 3;
    const zoomLevel = parseInt(localStorage.getItem("oobcEditorZoomLevel"));
    if (isNaN(zoomLevel)) {
      return defaultZoomLevel;
    } else {
      return zoomLevel;
    }
  }
  onClickZoomIn = () => {
    this.zoomInIfPossible();
  };
  zoomInIfPossible() {
    const zoomLevel = this.state.zoomLevel + 1;
    if (zoomLevel <= this.maxZoomLevel) {
      this.setState({ zoomLevel }, () => {
        this.updateZoomLevelToLocal();
      });
    }
  }
  onClickZoomOut = () => {
    this.zoomOutIfPossible();
  };
  zoomOutIfPossible() {
    const zoomLevel = this.state.zoomLevel - 1;
    if (zoomLevel >= this.minZoomLevel) {
      this.setState({ zoomLevel }, () => {
        this.updateZoomLevelToLocal();
      });
    }
  }

  render() {
    const {
      lines,
      currentLine,
      currentBlock,
      constantBlockToEdit,
      selectorInfo,
      contextMenuInfo,
      zoomLevel,
    } = this.state;
    const isMinZoom = this.minZoomLevel === zoomLevel;
    const isMaxZoom = this.maxZoomLevel === zoomLevel;

    return (
      <View
        context={this.oobcContext}
        lines={lines}
        currentLine={currentLine}
        currentBlock={currentBlock}
        constantBlockToEdit={constantBlockToEdit}
        selectorMode={this.props.selectorMode}
        selectorInfo={selectorInfo}
        contextMenuInfo={contextMenuInfo}
        zoomLevel={zoomLevel}
        isMinZoom={isMinZoom}
        isMaxZoom={isMaxZoom}
        onScrollContext={this.onScrollContext}
        onClickContext={this.onClickContext}
        onClickLine={this.onClickLine}
        onLineContextMenu={this.onLineContextMenu}
        onClickLineContextMenu={this.onClickLineContextMenu}
        onClickFoldLine={this.onClickFoldLine}
        onTouchLineStart={this.onTouchLineStart}
        onTouchLineMove={this.onTouchLineMove}
        onTouchLineEnd={this.onTouchLineEnd}
        onDragLine={this.onDragLine}
        onDragLineOverEnd={this.onDragLineOverEnd}
        onDragLineBegin={this.onDragLineBegin}
        onDragLineEnd={this.onDragLineEnd}
        onClickInstanceBlock={this.onClickInstanceBlock}
        onClickPrototypeBlock={this.onClickPrototypeBlock}
        onClickAddGlobalVar={this.onClickAddGlobalVar}
        onClickConstantBlockEdit={this.onClickConstantBlockEdit}
        onClickConstantEditorOverlay={this.onClickConstantEditorOverlay}
        onClickConstantEditorConfirm={this.onClickConstantEditorConfirm}
        onClickConstantEditorCancel={this.onClickConstantEditorCancel}
        onChangeContantEditorData={this.onChangeContantEditorData}
        onClickSelectorCategory={this.onClickSelectorCategory}
        onClickSelectorClose={this.onClickSelectorClose}
        onClickZoomIn={this.onClickZoomIn}
        onClickZoomOut={this.onClickZoomOut}
        triggerFull={this.props.triggerFull}
        exitFull={this.props.exitFull}
      />
    );
  }
}

export default OOBCEditor;
