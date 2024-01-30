import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import * as sceneActions from "../../../../Store/Reducer/scene";
import * as chatActions from "../../../../Store/Reducer/chat";
import * as chatbotActions from "../../../../Store/Reducer/chatbot";
import * as webrtcActions from "../../../../Store/Reducer/webrtc";
import { SpriteType, EDITORMODE } from "../../../../../../Common/Util/Constant";
import ApiLibrary from "../../../../utils/apiLibrary";
import stringify from "json-stringify-safe";
import AssetLibrary from "../../../../utils/assetLibrary";
import JSEvaluator from "../../../../utils/JSEvaluator";
import View from "./View";
import { FormattedMessage, injectIntl } from "react-intl";
import Parser from "../../../../utils/parser";
import { toast } from "react-toastify";
import { ChatbotMsgType } from "../../../../../../Common/Util/Constant";
// import ChatbotError from "../../../Chat/Component/ChatBot/Component/ChatbotError";
import * as TrackingUtil from "../../../../../../Common/Util/TrackingUtil";

const enableJSEval = true;
let signalNameWorker = undefined;
let signalNames = [];
let globalValueWorker = undefined;
let globalValues = [];

class Container extends Component {
  constructor(props) {
    super(props);
    this.isLive =
      this.props.match.path.startsWith("/monitor") ||
      this.props.match.path.startsWith("/wizlive") ||
      this.props.match.path.startsWith("/live");
    this.ace = window.ace;
    this.langTools = undefined;
    this.completers = {};
    this.aceEditor = undefined;
    this.undoManagers = {};
    this.JSEval = new JSEvaluator();
    this.symtab = undefined;
    this.errorTimer = null;
    this.apiList = ApiLibrary.getAllFunctions();
    this.autoCompleteApiList = this.getAutoCompleteApiList(this.apiList);
    this.apiNameSet = this.getApiNameSet(this.apiList);
    this.JSEval.setListOfReserved(
      this.apiList.map((api) => {
        const cleanCaption = api.caption.replace(/\[.+\]/, "array");
        const tokens = cleanCaption.match(/[a-z|A-Z]+/g);
        return {
          id: tokens[0],
          type: "function",
          value: {
            /* Return value of a function */
            type: "object",
            value: {},
          },
          params: tokens.slice(1),
          requiredParamCount: api.requiredParamCount || tokens.length - 1,
        };
      })
    );
    this.state = { tooltip: null };
  }

  getAutoCompleteApiList(apiList) {
    const captionList = apiList.map(({ caption }) => {
      return caption;
    });

    const filteredApiList = apiList.filter((item, index) => {
      return captionList.indexOf(item.caption) === index;
    });

    return filteredApiList;
  }

  getApiNameSet(apiList) {
    const ret = new Set();

    for (let i = 0; i < apiList.length; i++) {
      const api = apiList[i];
      const caption = api.caption;
      const idx = caption.indexOf("(");

      if (idx === -1) {
        continue;
      }

      const name = caption.substring(0, idx);
      ret.add(name);
    }

    // Additional Reserved Keyword
    ret.add("let");
    ret.add("var");
    ret.add("function");
    ret.add("switch");
    ret.add("case");
    ret.add("default");
    ret.add("global");
    ret.add("if");
    ret.add("else if");
    ret.add("else");

    return ret;
  }

  componentDidMount() {
    this.setAceEditor();
    this.setUndoManager();
    this.setCode();
    this.setWorkers();
    this.setSignalNames();
    this.setGlobalValues();
    this.setAPILibrary();
  }

  componentDidUpdate() {
    this.setCode();
    this.setSignalNames();
    this.setGlobalValues();
    this.setSelectionRange(this.props.editorRange);

    // for changing editor mode
    // isUpdateEditorMode is for minimize unnecessary function call related to editorMode
    if (this.isUpdateEditorMode) {
      this.setAceEditor();
      this.setAPILibrary();
      this.isUpdateEditorMode = false;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.editorMode !== nextProps.editorMode) {
      this.isUpdateEditorMode = true;
      return true;
    }
    if (this.state.tooltip !== nextState.tooltip) {
      return true;
    }
    if (
      this.props.log.api !== nextProps.log.api ||
      this.props.log.animation !== nextProps.log.animation ||
      this.props.log.sound !== nextProps.log.sound ||
      this.props.log.chatbot !== nextProps.log.chatbot
    ) {
      this.aceEditor.resize();
    }

    if (
      this.isLive &&
      stringify(nextProps.editorRange) !== stringify(this.props.editorRange)
    ) {
      return true;
    }
    if (this.props.timeStamp !== nextProps.timeStamp) {
      return true;
    }
    if (this.props.editorTimeStamp !== nextProps.editorTimeStamp) {
      return true;
    }
    if (this.props.selectedSceneId !== nextProps.selectedSceneId) {
      return true;
    }

    const currentSpriteName = this.props.selectedObject.name;
    const nextSpriteName = nextProps.selectedObject.name;
    if (currentSpriteName === nextSpriteName) {
      if (
        nextProps.sprites[currentSpriteName] &&
        this.props.sprites[currentSpriteName].locked !==
          nextProps.sprites[currentSpriteName].locked
      ) {
        return true;
      } else {
        return false;
      }
    }

    return true;
  }

  setAPILibrary() {
    this.apiList = ApiLibrary.getAllFunctions(this.props.editorMode);
    this.autoCompleteApiList = this.getAutoCompleteApiList(this.apiList);
    this.apiNameSet = this.getApiNameSet(this.apiList);
    this.JSEval.setListOfReserved(
      this.apiList.map((api) => {
        const cleanCaption = api.caption.replace(/\[.+\]/, "array");
        const tokens = cleanCaption.match(/[a-z|A-Z]+/g);
        return {
          id: tokens[0],
          type: "function",
          value: {
            /* Return value of a function */
            type: "object",
            value: {},
          },
          params: tokens.slice(1),
          requiredParamCount: api.requiredParamCount || tokens.length - 1,
        };
      })
    );
  }

  setAutoCompleters() {
    this.langTools = this.ace.require("ace/ext/language_tools");
    // const TokenIterator = this.ace.require("ace/token_iterator").TokenIterator;

    //default completers
    const staticWordCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        let list = this.autoCompleteApiList.map(
          ({ caption, value, newLine, selection, selectionType }) => {
            return {
              caption: caption,
              value: value,
              meta: "function",
              completer: {
                insertMatch: (editor) => {
                  editor.removeWordLeft();
                  editor.insert(value);
                  if (editor.curOp && !editor.curOp.command.name) {
                    editor.curOp.command.name = "Return";
                    this.handleOnChange(undefined, editor);
                  }
                  setNewLine(editor, newLine);
                  setNewLines(editor, caption);
                  setSelectionWord(
                    editor,
                    getMatchedValue(newLine, value),
                    selection,
                    selectionType
                  );
                  // showSelectionWordList(selectionType);
                },
              },
            };
          }
        );

        function setNewLine(editor, newLine) {
          if (newLine === undefined) {
            return;
          }

          const valueRange = editor.find(newLine, {
            backwards: true,
            caseSensitive: true,
          });
          if (valueRange === undefined) {
            return;
          }
          editor.selection.moveCursorToPosition(valueRange.end);
          editor.selection.clearSelection();
          editor.insert(editor.session.doc.getNewLineCharacter());
          if (editor.curOp && !editor.curOp.command.name) {
            // editor.curOp.command.name = "Return";
            this.handleOnChange(undefined, editor);
          }
        }

        function setNewLines(editor, caption) {
          switch (caption) {
            case "switch~case":
              const afterNewLines = [
                `case "" :`,
                `break;`,
                `default :`,
                `break;`,
              ];

              const afterNewLine = afterNewLines.join("");
              const valueRange = editor.find(afterNewLine, {
                backwards: false,
                caseSensitive: true,
              });
              if (valueRange === undefined) {
                return;
              }

              editor.selection.moveCursorToPosition(valueRange.end);
              editor.selection.clearSelection();

              for (let i = afterNewLines.length - 1; i >= 0; i--) {
                setNewLine(editor, afterNewLines[i]);
              }
              break;
            default:
              break;
          }
        }

        function getMatchedValue(newLine, value) {
          if (newLine !== undefined) {
            return newLine;
          } else {
            return value;
          }
        }

        function setSelectionWord(editor, value, selection, selectionType) {
          if (selection === undefined) {
            return;
          }
          const valueRange = editor.find(value, {
            backwards: true,
            caseSensitive: true,
          });
          if (valueRange === undefined) {
            return;
          }
          editor.selection.moveCursorToPosition(valueRange.start);
          const selectionRange = editor.find(selection, { backwards: false });
          if (selectionRange === undefined) {
            return;
          }
          editor.selection.setSelectionRange(
            selectionRange,
            isSelectionRangeReverse(selectionType)
          );
        }

        function isSelectionRangeReverse(selectionType) {
          return selectionType !== undefined;
        }

        // const showSelectionWordList = selectionType => {
        //   if (selectionType) {
        //     setTimeout(() => {
        //       this.langTools.setCompleters(this.getCompleters(selectionType));
        //       this.aceEditor.completer.showPopup(this.aceEditor);
        //       this.langTools.setCompleters(this.getCompleters("all"));
        //     }, 10); //TODO : remove delay
        //   }
        // };

        let start = prefix.split("").reverse().join("");

        const entries = this.JSEval.FindSymbol(
          start,
          {
            start: {
              line: pos.row + 1,
              column: pos.column,
            },
            end: {
              line: pos.row + 1,
              column: pos.column,
            },
          },
          this.symtab,
          true
        );

        if (Array.isArray(entries) === true) {
          entries.forEach((entry) => {
            list.push({
              caption: entry.id,
              name: entry.id,
              value: entry.id,
              score: 1,
              meta: entry.type,
            });
          });
        }

        return callback(null, list);
      },
    };

    const clearCompleterTarget = (editor) => {
      const start = editor.selection.getRange().start;
      const end = editor.selection.getRange().end;
      const line = editor.session.getLine(start.row);
      if (line[start.column - 1] && line[start.column - 1] !== `"`) {
        editor.removeWordLeft();
      }
      if (line[end.column] && line[end.column] !== `"`) {
        editor.removeWordRight();
      }
    };

    const animationCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const { selectedObject, sprites } = this.props;
        const sprite = sprites[selectedObject.name];
        let animations = [];
        if (AssetLibrary.getAsset(sprite.assetId)) {
          animations = AssetLibrary.getAsset(sprite.assetId).spriteAnimations;
        }
        let names = [];
        if (animations) {
          names = Object.keys(animations);
        }

        callback(
          null,
          names.map((name) => {
            return {
              caption: name,
              value: name,
              meta: "Animation",
              completer: {
                insertMatch: (editor) => {
                  clearCompleterTarget(editor);
                  editor.insert(name);
                  if (editor.curOp && !editor.curOp.command.name) {
                    editor.curOp.command.name = "Return";
                    this.handleOnChange(undefined, editor);
                  }
                  setTimeout(() => {
                    editor.completer.detach();
                  }, 10);

                  const newPos = {
                    row: pos.row,
                    column: session.getLine(pos.row).length,
                  };
                  editor.selection.moveCursorToPosition(newPos);
                },
              },
            };
          })
        );
      },
    };

    const soundCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const { soundIds } = this.props;
        callback(
          null,
          soundIds.map((soundId) => {
            const name = AssetLibrary.getSoundAsset(soundId).defaultName;
            return {
              caption: name,
              value: name,
              meta: "Sound",
              completer: {
                insertMatch: (editor) => {
                  clearCompleterTarget(editor);
                  editor.insert(name);
                  if (editor.curOp && !editor.curOp.command.name) {
                    editor.curOp.command.name = "Return";
                    this.handleOnChange(undefined, editor);
                  }
                  setTimeout(() => {
                    editor.completer.detach();
                  }, 10);

                  const newPos = {
                    row: pos.row,
                    column: session.getLine(pos.row).length,
                  };
                  editor.selection.moveCursorToPosition(newPos);
                },
              },
            };
          })
        );
      },
    };

    const spriteCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const { sprites } = this.props;
        callback(
          null,
          Object.keys(sprites).map((name) => {
            return {
              caption: name,
              value: name,
              meta: "Sprite",
              completer: {
                insertMatch: (editor) => {
                  clearCompleterTarget(editor);
                  editor.insert(name);
                  if (editor.curOp && !editor.curOp.command.name) {
                    editor.curOp.command.name = "Return";
                    this.handleOnChange(undefined, editor);
                  }
                  setTimeout(() => {
                    editor.completer.detach();
                  }, 10);

                  let newLine = false;
                  const functions = session
                    .getLine(editor.selection.getRange().start.row)
                    .match(/([a-zA-Z_{1}][a-zA-Z0-9_]+)(?=\()/g);
                  if (functions && functions[0]) {
                    const f = functions[0];
                    if (f === "onOverlap") {
                      newLine = true;
                    }
                  }
                  const newPos = {
                    row: pos.row + (newLine ? 1 : 0),
                    column: session.getLine(pos.row).length,
                  };
                  editor.selection.moveCursorToPosition(newPos);
                },
              },
            };
          })
        );
      },
    };

    const sceneCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const { sceneIds } = this.props;
        callback(
          null,
          sceneIds.map((name) => {
            return {
              caption: name,
              value: name,
              meta: "Scene",
              completer: {
                insertMatch: (editor) => {
                  clearCompleterTarget(editor);
                  editor.insert(name);
                  if (editor.curOp && !editor.curOp.command.name) {
                    editor.curOp.command.name = "Return";
                    this.handleOnChange(undefined, editor);
                  }
                  setTimeout(() => {
                    editor.completer.detach();
                  }, 10);

                  const newPos = {
                    row: pos.row,
                    column: session.getLine(pos.row).length,
                  };
                  editor.selection.moveCursorToPosition(newPos);
                },
              },
            };
          })
        );
      },
    };

    const directionCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const directions = ["left", "right", "up", "down"];
        callback(
          null,
          directions.map((name) => {
            return {
              caption: name,
              value: name,
              meta: "Direction",
              completer: {
                insertMatch: (editor) => {
                  clearCompleterTarget(editor);
                  editor.insert(name);
                  if (editor.curOp && !editor.curOp.command.name) {
                    editor.curOp.command.name = "Return";
                    this.handleOnChange(undefined, editor);
                  }
                  setTimeout(() => {
                    editor.completer.detach();
                  }, 10);

                  const newPos = {
                    row: pos.row + 1,
                    column: session.getLine(pos.row).length,
                  };
                  editor.selection.moveCursorToPosition(newPos);
                },
              },
            };
          })
        );
      },
    };

    const keyCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const keys = [
          "left",
          "right",
          "up",
          "down",
          "shift",
          "control",
          "space",
          "enter",
          "esc",
          "f1",
          "f2",
          "f3",
          "f4",
          "f5",
          "f6",
          "f7",
          "f8",
          "f9",
          "f10",
          "f11",
          "f12",
        ];

        callback(
          null,
          keys.map((name) => {
            return {
              caption: name,
              value: name,
              meta: "Key",
              completer: {
                insertMatch: (editor) => {
                  clearCompleterTarget(editor);
                  editor.insert(name);
                  if (editor.curOp && !editor.curOp.command.name) {
                    editor.curOp.command.name = "Return";
                    this.handleOnChange(undefined, editor);
                  }
                  setTimeout(() => {
                    editor.completer.detach();
                  }, 10);

                  const newPos = {
                    row: pos.row + 1,
                    column: session.getLine(pos.row).length,
                  };
                  editor.selection.moveCursorToPosition(newPos);
                },
              },
            };
          })
        );
      },
    };

    const colorCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const colors = window.HTML_Colors;
        const colorNames = Object.keys(colors);
        callback(
          null,
          colorNames.map((name) => {
            return {
              caption: name,
              value: name,
              meta: "Color",
              completer: {
                insertMatch: (editor) => {
                  clearCompleterTarget(editor);
                  editor.insert(name);
                  if (editor.curOp && !editor.curOp.command.name) {
                    editor.curOp.command.name = "Return";
                    this.handleOnChange(undefined, editor);
                  }
                  setTimeout(() => {
                    editor.completer.detach();
                  }, 10);

                  const newPos = {
                    row: pos.row,
                    column: session.getLine(pos.row).length,
                  };
                  editor.selection.moveCursorToPosition(newPos);
                },
              },
            };
          })
        );
      },
    };

    const textCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const completer = this.langTools.textCompleter;
        const completions = completer.getCompletions(
          editor,
          session,
          pos,
          prefix,
          (e, items) => {
            const filteredItems = getFilteredItems(items, this.apiNameSet);
            callback(null, filteredItems);
          }
        );

        function getFilteredItems(items, apiNameSet) {
          return items.filter((item) => {
            if (apiNameSet.has(item.caption)) {
              return false;
            } else if (isAlreadySignalName(item.caption)) {
              return false;
            } else if (isAlreadyGlobalValue(item.caption)) {
              return false;
            } else {
              return true;
            }
          });
        }

        function isAlreadySignalName(itemCaption) {
          for (let i = 0; i < signalNames.length; i++) {
            if (signalNames[i] === itemCaption) {
              return true;
            }
          }

          return false;
        }

        function isAlreadyGlobalValue(itemCaption) {
          for (let i = 0; i < globalValues.length; i++) {
            if (globalValues[i] === itemCaption) {
              return true;
            }
          }

          return false;
        }

        return completions;
      },
    };

    const signalCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        callback(
          null,
          signalNames.map((name) => {
            return {
              caption: name,
              value: name,
              meta: "Signal",
              completer: {
                insertMatch: (editor) => {
                  clearCompleterTarget(editor);
                  editor.insert(name);
                  if (editor.curOp && !editor.curOp.command.name) {
                    editor.curOp.command.name = "Return";
                    this.handleOnChange(undefined, editor);
                  }
                  setTimeout(() => {
                    editor.completer.detach();
                  }, 10);

                  const newPos = {
                    row: pos.row + 1,
                    column: session.getLine(pos.row).length,
                  };
                  editor.selection.moveCursorToPosition(newPos);
                },
              },
            };
          })
        );
      },
    };

    const globalValueCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        callback(
          null,
          globalValues.map(function (name) {
            return {
              caption: name,
              value: name,
              meta: "Global",
            };
          })
        );
      },
    };

    this.completers = {
      staticWordCompleter,
      animationCompleter,
      soundCompleter,
      spriteCompleter,
      sceneCompleter,
      directionCompleter,
      keyCompleter,
      colorCompleter,
      textCompleter,
      signalCompleter,
      globalValueCompleter,
    };

    this.langTools.setCompleters(this.getCompleters("all"));
  }

  getCompleters = (selectionType) => {
    switch (selectionType) {
      case "all":
        return Object.keys(this.completers).map((key) => this.completers[key]);
      case "global":
        return [this.completers[selectionType + "ValueCompleter"]];
      default:
        return [this.completers[selectionType + "Completer"]];
    }
  };

  setAceEditor() {
    this.aceEditor = this.ace.edit("ace-editor");
    // this.aceEditor.session.setMode(`ace/mode/${this.props.editorMode}`);
    // if (this.isLive) {
    //   this.aceEditor.setTheme("ace/theme/wizschool-clive");
    // } else {
    //   this.aceEditor.setTheme("ace/theme/wizschool");
    // }
    this.aceEditor.session.setMode(`ace/mode/${EDITORMODE.JAVASCRIPT}`);
    this.aceEditor.setTheme("ace/theme/wizschool");

    this.aceEditor.on("changeSelection", this.handleOnChangeSelection);
    this.aceEditor.on("change", this.handleOnChange);
    this.aceEditor.on("mousemove", this.handleMousemove);
    document.getElementById("ace-editor").addEventListener("mouseout", () => {
      document.getElementById("EditorContainer_tooltip").style.display = "none";
    });
    this.aceEditor.getSession().setUseWrapMode(false);
    this.aceEditor.setFontSize(this.getStoredFontSize());

    this.undoManagers.defaultManager = this.aceEditor.session.getUndoManager();

    this.aceEditor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
    });

    this.setAutoCompleters();

    // const currentEditorMode = this.props.editorMode;
    this.aceEditor.session.on("changeMode", function (e, session) {
      if (`ace/mode/${EDITORMODE.JAVASCRIPT}` === session.getMode().$id) {
        if (!!session.$worker) {
          session.$worker.send("setOptions", [
            {
              "-W041": false,
              "-W033": false,
              "-W104": false,
              "-W118": false,
            },
          ]);
        }
      }
    });

    // this.aceEditor.session.on("changeMode", function(e, session) {
    //   if ("ace/mode/javascript-wiz" === session.getMode().$id) {
    //     const worker = session.$worker;

    //     if (worker === undefined || worker === null) {
    //       return;
    //     }
    //     // worker.send("command", "args");
    //   }
    // });
  }

  getStoredFontSize = () => {
    const fontSize = localStorage.getItem("wizFontSize");
    if (fontSize) {
      return parseInt(fontSize);
    }
    return 18;
  };

  setUndoManager() {
    const { selectedObject, selectedSceneId } = this.props;
    const name = selectedObject.name;

    if (!this.undoManagers[selectedSceneId]) {
      this.undoManagers[selectedSceneId] = {};
    }
    if (!this.undoManagers[selectedSceneId][name]) {
      this.undoManagers[selectedSceneId][name] = new window.ace.UndoManager();
    }
    const undoManager = this.undoManagers[selectedSceneId][name];
    this.aceEditor.session.setUndoManager(undoManager);
  }

  setCode() {
    const { sprites, selectedObject } = this.props;
    if (selectedObject.name && sprites[selectedObject.name]) {
      const code = sprites[selectedObject.name].code;
      this.aceEditor.session.setUndoManager(this.undoManagers.defaultManager);
      if (this.aceEditor.getValue() !== code) {
        this.aceEditor.setValue(code ? code : "", 1);
      }
      this.setUndoManager();
      this.aceEditor.setReadOnly(false);
    } else {
      this.aceEditor.session.setUndoManager(this.undoManagers.defaultManager);
      this.aceEditor.setValue(
        "// " + this.props.intl.formatMessage({ id: "ID_EDITOR_EMPTYSPIRTE" }),
        1
      );
      this.aceEditor.setReadOnly(true);
    }
  }

  setWorkers() {
    if (window.Worker) {
      signalNameWorker = new Worker("ace/worker-signal-name.js");
      globalValueWorker = new Worker("ace/worker-global-value.js");
    }
  }

  setSignalNames() {
    if (window.Worker && signalNameWorker) {
      signalNameWorker.onmessage = function (e) {
        if (e === undefined || e.data === undefined) {
          return;
        }
        signalNames = e.data;
      };

      const { sprites, spriteIds } = this.props;
      signalNameWorker.postMessage({ sprites, spriteIds });
    } else {
      // worker not supported logic
    }
  }

  setGlobalValues() {
    if (window.Worker && globalValueWorker) {
      globalValueWorker.onmessage = function (e) {
        if (e === undefined || e.data === undefined) {
          return;
        }

        globalValues = e.data;
      };

      const { sprites, spriteIds } = this.props;
      globalValueWorker.postMessage({ sprites, spriteIds });
    } else {
      // worker not supported logic
    }
  }

  handleMousemove = (e) => {
    try {
      const tooltip = document.getElementById("EditorContainer_tooltip");
      const pos = e.getDocumentPosition();
      const line = e.editor.session.getLine(pos.row);

      // 해당 라인에 있는 함수들의 범위 구하기
      let funcsRanges = [];
      const funcRegex = /([a-zA-Z_{1}][a-zA-Z0-9_]+)(?=\()/gim;
      let funcMatch;
      while ((funcMatch = funcRegex.exec(line))) {
        funcsRanges.push({ start: funcMatch.index, end: funcRegex.lastIndex });
      }

      // 현재 커서가 있는 함수의 범위 구하기
      let currentFuncRange;
      for (let i = 0; i < funcsRanges.length; i++) {
        const funcRange = funcsRanges[i];
        if (funcRange.start <= pos.column && pos.column <= funcRange.end) {
          currentFuncRange = funcRange;
          break;
        }
      }

      // 현재 커서가 있는 함수의 이름 구하기
      if (currentFuncRange) {
        const currentFunctionName = line.substring(
          currentFuncRange.start,
          currentFuncRange.end
        );

        // 해당 함수의 api 정보 불러오기
        let api = this.apiList.find((api) => api.name === currentFunctionName);
        if (!api) {
          tooltip.style.display = "none";
          return;
        }

        // 이름이 대체된 api라면 대체된 api의 정보를 불러오기
        const equal = api.equal;
        const caption = api.caption;
        if (equal) {
          api = { ...this.apiList.find((api) => api.name === equal) };
          api.caption = caption;
        }

        // 툴팁 보여주기
        this.setState({ tooltip: { ...api } }, () => {
          tooltip.style.display = "block";
          tooltip.style.left = `${e.domEvent.offsetX}px`;
          tooltip.style.top = `${e.domEvent.offsetY + 18}px`;
        });
      } else {
        tooltip.style.display = "none";
      }
    } catch (e) {}
  };

  handleOnChange = (event, editor) => {
    //TTA 시험을 위한 로그 작성
    this.onChangedAt = Date.now();
    console.log("코드 변경 감지: ", this.onChangedAt);
    //

    const code = editor.getValue();
    const { selectedSceneId, selectedObject } = this.props;
    const spriteName = selectedObject.name;

    if (editor.completer === undefined) {
      try {
        editor.execCommand("startAutocomplete");
        editor.completer.detach();
        this.refreshCompleterPopupSize();
      } catch (e) {}
    }

    // If inserted number, disable autocomplete
    if (event) {
      editor.setOptions({ enableLiveAutocompletion: isNaN(event.lines[0]) });
    }

    // if (this.JSEvaluatorTimer) {
    //   clearTimeout(this.JSEvaluatorTimer);
    // }
    // this.JSEvaluatorTimer = setTimeout(() => {
    this.parseJSEvaluator(code, editor);
    // }, 0);

    if (spriteName) {
      if (editor.curOp && editor.curOp.command.name) {
        //changed by user
        // if (this.codeTimer) {
        // clearTimeout(this.codeTimer);
        // }
        // this.codeTimer = setTimeout(() => {
        this.props.setSpriteCode(selectedSceneId, spriteName, code);
        // }, 100);
      } else {
        if (this.isLive) {
          const { selectedObject, selectedSceneId } = this.props;
          const name = selectedObject.name;

          if (!this.undoManagers[selectedSceneId]) {
            this.undoManagers[selectedSceneId] = {};
          }
          this.undoManagers[selectedSceneId][name] =
            new window.ace.UndoManager();
          const undoManager = this.undoManagers[selectedSceneId][name];
          this.aceEditor.session.setUndoManager(undoManager);
        }
      }
    }
  };

  parseJSEvaluator = (code, editor) => {
    // Parsing the code (JSEvaluator uses the Acorn)
    let errors = [];
    // eslint-disable-next-line
    let annotations = [];

    // TODO:
    // Ugly way to enable the following code block only for the development version.
    if (enableJSEval) {
      // if (enableJSEval || window.location.hostname !== "dream.wizlab.net") {
      var ret;

      try {
        // Parsing the code (JSEvaluator uses the Acorn)
        ret = this.JSEval.parse(code);
      } catch (e) {
        // console.log("JSEvaluator", e);
        ret = false;
      }

      if (ret === true) {
        // Evaluating the parsed code (AST)
        // In order to build the symbol table and get the runtime errors
        let symtab;

        if (this.JSEval.build() === true) {
          symtab = this.JSEval.SymbolTable();
          // Update the symbol table only if the JSEval successfully built the table.
          // Otherwise uses the old table for the auto completions.
          if (symtab !== null) {
            this.symtab = symtab;
          }
        }
      }
    }

    errors = this.JSEval.getErrors();
    annotations = editor.getSession().getAnnotations();

    // TODO:
    // Pass the errors to the chatbot
    // console.log("JSEvaluator detects", errors);
    // let chatbotErrors = [...errors, ...annotations];
    let chatbotErrors = [...errors];
    this.props.setChatbotErrors(chatbotErrors);
    this.props.removeChatbotMessages({ type: ChatbotMsgType.BOT_ERROR });

    if (chatbotErrors.length > 0) {
      this.handleShowErrors(editor);

      //TTA 시험을 위한 로그 작성
      const now = Date.now();
      console.log(
        "에러 발생 감지: ",
        now,
        "에러 발생 감지 소요 시간 : ",
        now - this.onChangedAt + "ms"
      );
      //
    }
  };

  handleShowErrors = () => {
    const errors = this.props.errors;
    errors.forEach((item) => {
      item.text = this.setErrorText(item);
      item.onClick = () => {
        let end = item.loc && item.loc.end;
        if (!end) return;
        let position = {
          row: end.line - 1,
          column: end.column,
        };
        this.aceEditor.selection.moveCursorToPosition(position);
        this.aceEditor.selection.clearSelection();
      };
    });

    let newMsg = {
      sender: "WIZBOT",
      type: ChatbotMsgType.BOT_ERROR,
      errors,
    };

    this.props.addNewMsg([newMsg]);
  };

  setErrorText = (item) => {
    // let startLine = item.loc ? item.loc.start.line : item.row + 1;
    let message = item.message;

    let text = ``;
    if (/parameter/i.test(message)) {
      text += message.split(" ")[0] + " 함수는 ";
      text += message.split(" ")[2] + "개의 매개변수를 넣어주어야 해~";
    }
    if (/is undefined/i.test(message)) {
      text += message.split(" ")[0] + " 는 아직 정의되지 않은 것 같은데?";
    }
    if (/has already been declared/i.test(message)) {
      let name = message.match(/'\w+'/);
      text += `이미 정의된 ${name}를 다시 정의하고 있어.`;
    }
    if (/Cannot change the constant/i.test(message)) {
      let name = message.split(" ")[4];
      text += `const로 정의한 ${name}를 다시 정의하고 있군.`;
    }
    // if (/(subtract|divide|multiply) operation/i.test(message)) {
    //   let operation = message
    //     .match(/\w+ operation/i)[0]
    //     .replace(/ operation/i, "");

    //   let ko_operation;
    //   if (operation === "subtract") ko_operation = "빼기";
    //   else if (operation === "divide") ko_operation = "나누기";
    //   else if (operation === "multiply") ko_operation = "곱하기";

    //   let [left, right] = message.match(/\w+ \| \w+/i)[0].split(/\s\|\s/i);

    //   text += `${left} 타입에서 ${right} 타입을 ${operation}(${ko_operation}) 하네.`;
    // }
    if (message === this.JSEval.ERROR_MESSAGE.FUNCTION_UPPER_LOWER) {
      text += `함수의 대소문자를 확인해봐.\n (${item.typingFunction} → ${item.originFunction})`;
    }
    if (!text) {
      text += "을 확인해봐!";
    }

    return text;
  };

  handleOnChangeSelection = (event, editor) => {
    let range = this.getSelectionRange();
    if (
      editor.curOp &&
      editor.curOp.selectionChanged &&
      editor.curOp.command.name
    ) {
      //changed by user
      function diff(rang1, rang2) {
        return {
          val1: rang1.row === rang2.row,
          val2: rang1.column === rang2.column,
        };
      }

      if (this.props.editorRange && range) {
        const v1 = diff(this.props.editorRange.end, range.end);
        const v2 = diff(this.props.editorRange.start, range.start);

        if (!v1.val1 || !v1.val2 || !v2.val1 || !v2.val2) {
          range.byUser = true;
          this.props.setEditorRange(range);
        }
      } else if (!this.props.editorRange && range) {
        range.byUser = true;
        this.props.setEditorRange(range);
      }

      // if (this.rangeTimer) {
      // clearTimeout(this.rangeTimer);
      // }
      // this.rangeTimer = setTimeout(() => {
      // range.byUser = true;
      // this.props.setEditorRange(range);
      // }, 10);
      // }
    } else {
      return;
    }

    const line = editor.session.getLine(range.start.row);

    // 문자열의 범위 모두 구하기
    let quotesRanges = [];
    const quoteRegex = /'((?:\\.|[^'])*)'|"((?:\\.|[^"])*)"/gim;
    let quoteMatch;
    while ((quoteMatch = quoteRegex.exec(line))) {
      quotesRanges.push({ start: quoteMatch.index, end: quoteRegex.lastIndex });
    }
    // console.log("quotesRanges", quotesRanges);

    // 커서가 위치한 문자열을 현재 문자열로 저장
    let currentQuoteRange;
    for (let i in quotesRanges) {
      const quoteRange = quotesRanges[i];
      if (
        range.start.column === quoteRange.start + 1 ||
        range.end.column === quoteRange.end - 1
      ) {
        currentQuoteRange = quoteRange;
        break;
      }
    }
    // console.log("currentQuoteRange", currentQuoteRange);

    // 현재 문자열이 있으면 자동완성 활성화
    if (currentQuoteRange) {
      // 함수이름의 범위 모두 구하기
      let funcsRanges = [];
      const funcRegex = /([a-zA-Z_{1}][a-zA-Z0-9_]+)(?=\()/gim;
      let funcMatch;
      while ((funcMatch = funcRegex.exec(line))) {
        funcsRanges.push({ start: funcMatch.index, end: funcRegex.lastIndex });
      }
      // console.log("funcsRanges", funcsRanges);

      // 현재 문자열의 start에 가장 가까운 함수이름의 범위 구하기
      let currentFunctionRange;
      for (let i in funcsRanges) {
        const funcRange = funcsRanges[i];
        if (funcRange.end < currentQuoteRange.start) {
          currentFunctionRange = funcRange;
        } else {
          break;
        }
      }
      if (!currentFunctionRange) {
        return;
      }

      // 해당 함수의 이름 구하기
      const currentFunctionName = line.substring(
        currentFunctionRange.start,
        currentFunctionRange.end
      );
      // console.log("currentFunctionName", currentFunctionName);

      // 함수 이름으로 자동완성 리스트 업데이트 및 보여주기
      let list = this.autoCompleteApiList.filter(
        (api) => api.caption.indexOf(currentFunctionName) !== -1
      );
      if (list && list[0]) {
        let selectionType = list[0].selectionType;
        if (selectionType) {
          setTimeout(() => {
            this.isCustomCompleterOpen = true;
            this.langTools.setCompleters(this.getCompleters(selectionType));
            editor.completer.showPopup(editor);
            this.langTools.setCompleters(this.getCompleters("all"));
          }, 10);
        }
      }
    } else {
      // 문자열 밖에 커서가 있을 때는 커스텀 컴플리터를 해제
      if (this.isCustomCompleterOpen) {
        setTimeout(() => {
          this.isCustomCompleterOpen = false;
          editor.completer.detach();
        }, 10);
      }
    }
  };

  setSorting = () => {
    try {
      const { selectedSceneId, selectedObject } = this.props;
      const spriteName = selectedObject.name;
      const code = this.aceEditor.getValue();
      const parsedCode = Parser.parseForSort(code);
      this.props.setSpriteCode(selectedSceneId, spriteName, parsedCode);
      this.aceEditor.setValue(parsedCode, 1);
      toast.info(<FormattedMessage id="ID_BUILDER_CODE_SORT_COMPLETE" />, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      TrackingUtil.sendGAEvent({
        category: "Builder",
        action: `EditorActions`,
        label: "Align",
      });

      this.aceEditor.curOp.command.name = "Return";
      this.handleOnChange(undefined, this.aceEditor);
    } catch (e) {
      toast.warn(
        <FormattedMessage id="ID_BUILDER_CODE_SORT_AFTER_FIX_ERROR" />,
        { position: toast.POSITION.BOTTOM_RIGHT }
      );
    }
  };

  setFontZoomIn = () => {
    const size = this.aceEditor.getFontSize() + 2;
    if (size > 50) {
      return;
    }
    TrackingUtil.sendGAEvent({
      category: "Builder",
      action: `EditorActions`,
      label: "ZoomIn",
    });
    localStorage.setItem("wizFontSize", size);
    this.aceEditor.setFontSize(size);
    this.refreshCompleterPopupSize();
  };

  setFontZoomOut = () => {
    const MIN_SIZE = 8;
    const size = this.aceEditor.getFontSize() - 2;
    if (size < MIN_SIZE) {
      return;
    }
    TrackingUtil.sendGAEvent({
      category: "Builder",
      action: `EditorActions`,
      label: "ZoomOut",
    });
    localStorage.setItem("wizFontSize", size);
    this.aceEditor.setFontSize(size);
    this.refreshCompleterPopupSize();
  };

  refreshCompleterPopupSize = () => {
    if (this.aceEditor.completer) {
      const percent = this.aceEditor.getFontSize() + 10 + "%";
      this.aceEditor.completer.popup.container.style.width = percent;
    }
  };

  getSelectionRange() {
    return this.aceEditor.selection.getRange();
  }

  setSelectionRange(range) {
    if (!this.isLive || !range) {
      return;
    }
    let editorRange = { ...this.getSelectionRange() };
    let propsRange = { ...range };
    delete editorRange["byUser"];
    delete propsRange["byUser"];
    if (stringify(editorRange) !== stringify(propsRange)) {
      this.aceEditor.selection.setRange(range);
    } else {
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.errorTimer);
  }

  render() {
    const { selectedObject, sprites } = this.props;
    const spriteName = selectedObject.name;
    const { setFontZoomIn, setFontZoomOut, setSorting } = this;
    const { tooltip } = this.state;
    const sprite = sprites[spriteName];
    const spriteIcon = sprite
      ? sprite.type === SpriteType.TEXT
        ? AssetLibrary.textboxThumb
        : AssetLibrary.getAsset(sprite.assetId).thumb
      : undefined;
    return (
      <View
        selectedObject={sprites[spriteName]}
        spriteName={spriteName}
        spriteIcon={spriteIcon}
        setFontZoomIn={setFontZoomIn}
        setFontZoomOut={setFontZoomOut}
        setSorting={setSorting}
        tooltip={tooltip}
        intl={this.props.intl}
        triggerFull={this.props.triggerFull}
        exitFull={this.props.exitFull}
        editorMode={this.props.editorMode}
      />
    );
  }
}

export default connect(
  (state) => ({
    selectedSceneId: state.interaction.selected.scene,
    selectedObject:
      state.interaction.selected.objects[state.interaction.selected.scene],
    sprites: state.scene.scenes[state.interaction.selected.scene].sprites,
    spriteIds: state.scene.scenes[state.interaction.selected.scene].spriteIds,
    soundIds: state.scene.soundIds,
    sceneIds: state.scene.sceneIds,
    timeStamp: state.project.timeStamp,
    editorTimeStamp: state.scene.timeStamp,
    errors: state.chatbot.errors,
    editorRange: state.webrtc.editorRange,
    log: state.webrtc.log,
    editorMode: state.scene.editorMode,
  }),
  {
    setSpriteCode: sceneActions.setSpriteCode,
    setChatbotErrors: chatbotActions.setChatbotErrors,
    setEditorRange: webrtcActions.setEditorRange,
    removeChatbotMessages: chatbotActions.removeChatbotMessages,
    addMsg: chatActions.addMsg,
    addNewMsg: chatbotActions.addNewMsg,
  }
)(withRouter(injectIntl(Container)));
