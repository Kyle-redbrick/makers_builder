import React, { Component } from "react";
import Localization from "../../Localization";
import { BLOCK } from "../../OOBC/type";
import "./index.scss";

import numpadDelete from "../../Image/numpad-delete.png";

export default function (props) {
  const {
    constantBlock,
    onClickOverlay,
    onClickConfirm,
    onClickCancel,
    onChangeData,
  } = props;
  return (
    <div
      id="oobceditor_constanteditor_container"
      className={`oobceditor_constanteditor_container${
        constantBlock ? " oobceditor_constanteditor_container-visible" : ""
      }`}
    >
      <div
        id="oobceditor_constanteditor_overlay"
        className="oobceditor_constanteditor_overlay"
        onClick={onClickOverlay}
      />
      {constantBlock && constantBlock.type === BLOCK.KEY ? (
        <KeyConstantEditor
          block={constantBlock}
          onClickConfirm={onClickConfirm}
        />
      ) : (
        <ConstantEditor
          constantBlock={constantBlock}
          onClickConfirm={onClickConfirm}
          onClickCancel={onClickCancel}
          onChangeData={onChangeData}
        />
      )}
    </div>
  );
}

class ConstantEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: undefined,
      data: undefined,
      focusedInputId: "oobceditor_constanteditor_input",
    };
  }
  componentDidMount() {
    this.didUpdateConstantBlock();
    window.addEventListener("keydown", this.onKeyDown);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.onKeyDown);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.constantBlock !== this.props.constantBlock) {
      this.didUpdateConstantBlock();
    }
    if (prevState.data !== this.state.data) {
      const { onChangeData } = this.props;
      if (onChangeData) {
        onChangeData(this.state.data);
      }
    }
  }
  didUpdateConstantBlock() {
    const { constantBlock } = this.props;
    const type = constantBlock && constantBlock.type;
    let data = constantBlock && constantBlock.data;
    if (data === null) {
      switch (type) {
        case BLOCK.NUMBERBLOCK:
          data = 0;
          break;
        case BLOCK.STRINGBLOCK:
          data = Localization.formatWithId("ID_OOBC_BLOCK_STRING_DEFAULT");
          break;
        default:
          break;
      }
    }
    this.setState({ type, data });
  }

  getInputsForBlockType(type) {
    let inputs;
    switch (type) {
      case BLOCK.NUMBERBLOCK:
        inputs = this.getInputsForNumberBlock();
        break;
      case BLOCK.STRINGBLOCK:
        inputs = this.getInputsForStringBlock();
        break;
      case BLOCK.POSITION:
        inputs = this.getInputsForPositionBlock();
        break;
      default:
        break;
    }
    return <div className="oobceditor_constanteditor_inputs">{inputs}</div>;
  }
  getInputsForNumberBlock() {
    const { data } = this.state;
    return (
      <input
        id="oobceditor_constanteditor_input"
        className="oobceditor_constanteditor_input"
        value={data}
        autoFocus
        disabled
      />
    );
  }
  getInputsForStringBlock() {
    const { data } = this.state;
    return (
      <input
        id="oobceditor_constanteditor_input"
        className="oobceditor_constanteditor_input"
        value={data}
        onFocus={this.onFocusInput}
        onChange={this.onChangeInput}
        autoFocus
      />
    );
  }
  getInputsForPositionBlock() {
    const { data, focusedInputId } = this.state;
    const { x, y } = data;
    return (
      <>
        <div
          id="oobceditor_constanteditor_input"
          className="oobceditor_constanteditor_input_wrapper"
          onClick={this.onClickInput}
        >
          <div className="oobceditor_constanteditor_input_title">x :</div>
          <input
            className={`oobceditor_constanteditor_input${
              focusedInputId === "oobceditor_constanteditor_input"
                ? ""
                : " oobceditor_constanteditor_input-blurred"
            }`}
            onClick={this.onClickInput}
            value={x}
            autoFocus
          />
        </div>
        <div
          id="oobceditor_constanteditor_input2"
          className="oobceditor_constanteditor_input_wrapper"
          onClick={this.onClickInput}
        >
          <div className="oobceditor_constanteditor_input_title">y :</div>
          <input
            className={`oobceditor_constanteditor_input${
              focusedInputId === "oobceditor_constanteditor_input2"
                ? ""
                : " oobceditor_constanteditor_input-blurred"
            }`}
            onClick={this.onClickInput}
            value={y}
            autoFocus
          />
        </div>
      </>
    );
  }

  onFocusInput = (e) => {
    e.currentTarget.select();
  };
  onChangeInput = (e) => {
    const { type } = this.state;
    const newValue = e.currentTarget.value;
    switch (type) {
      case BLOCK.NUMBERBLOCK:
      case BLOCK.POSITION:
        break;
      case BLOCK.STRINGBLOCK:
        this.setState({ data: newValue });
        break;
      default:
        break;
    }
  };
  onClickInput = (e) => {
    const inputId = e.currentTarget.id;
    this.setState({ focusedInputId: inputId });
  };

  onKeyDown = (e) => {
    if (e.key === "Enter") {
      this.onClickConfirm();
    } else {
      switch (this.state.type) {
        case BLOCK.NUMBERBLOCK:
        case BLOCK.POSITION:
          this.onNumberKeyDown(e);
          break;
        default:
          break;
      }
    }
  };
  onNumberKeyDown = (e) => {
    switch (e.key) {
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
      case "0":
      case "-":
      case ".":
        this.onClickNumpad(e.key);
        break;
      case "Delete":
      case "Backspace":
        this.onClickNumpad("delete");
        break;
      default:
        break;
    }
  };

  getKeypadForBlockType(type) {
    let keypad;
    switch (type) {
      case BLOCK.NUMBERBLOCK:
      case BLOCK.POSITION:
        keypad = this.getNumpad();
        break;
      default:
        break;
    }
    return <div className="oobceditor_constanteditor_keypad">{keypad}</div>;
  }
  getNumpad() {
    const numpads = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "0",
      ".",
      "-",
      "delete",
    ];
    return (
      <div className="oobceditor_constanteditor_numpads">
        {numpads.map((numpad) => (
          <div
            key={numpad}
            className={`oobceditor_constanteditor_numpad oobceditor_constanteditor_numpad-${numpad}`}
            onClick={() => {
              this.onClickNumpad(numpad);
            }}
            onTouchStart={(e) => {
              e.currentTarget.classList.add(
                "oobceditor_constanteditor_numpad-touched"
              );
            }}
            onTouchEnd={(e) => {
              e.currentTarget.classList.remove(
                "oobceditor_constanteditor_numpad-touched"
              );
            }}
          >
            {numpad === "delete" ? (
              <img
                className="oobceditor_constanteditor_numpad_img"
                src={numpadDelete}
                alt={numpad}
              />
            ) : (
              <div className="oobceditor_constanteditor_numpad_title">
                {numpad}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
  onClickNumpad = (numpad) => {
    let value = this.getFocusedInputValue();
    switch (numpad) {
      case ".":
        if (value === "") {
          value = "0.";
        } else if (value === "-") {
          value = "-0.";
        } else if (value.indexOf(numpad) < 0) {
          value = value + numpad;
        }
        break;
      case "-":
        if (value.indexOf(numpad) < 0) {
          value = numpad + value;
        } else {
          value = value.slice(1, value.length);
        }
        break;
      case "delete":
        if (value === "0.") {
          value = "";
        } else {
          value = value.slice(0, value.length - 1);
        }
        break;
      case "0":
        if (value !== "0" && value !== "-0") {
          value = value + numpad;
        }
        break;
      default:
        if (value === "0") {
          value = numpad;
        } else if (value === "-0") {
          value = -numpad;
        } else {
          value = value + numpad;
        }
        break;
    }
    if (parseFloat(value) >= 10000) value = "9999";
    this.updateFocusedInputValue(value);
  };
  getFocusedInputValue() {
    const { type, data, focusedInputId } = this.state;
    let value;
    if (type === BLOCK.NUMBERBLOCK) {
      value = data;
    } else if (type === BLOCK.POSITION) {
      const { x, y } = data;
      if (focusedInputId === "oobceditor_constanteditor_input") {
        value = x;
      } else {
        value = y;
      }
    }
    return `${value}`;
  }
  updateFocusedInputValue(value) {
    const { type, focusedInputId } = this.state;
    let data;
    if (type === BLOCK.NUMBERBLOCK) {
      data = value;
    } else if (type === BLOCK.POSITION) {
      data = { ...this.state.data };
      if (focusedInputId === "oobceditor_constanteditor_input") {
        data.x = value;
      } else {
        data.y = value;
      }
    }
    this.setState({ data });
  }

  getButtonForId(id) {
    const formatMessageId = `ID_OOBC_GENERAL_${id.toUpperCase()}`;
    const buttonTitle = Localization.formatWithId(formatMessageId);
    const onClick = {
      clear: this.onClickClear,
      cancel: this.onClickCancel,
      confirm: this.onClickConfirm,
    }[id];
    return (
      <button
        id={`oobceditor_constanteditor_button-${id}`}
        className={`oobceditor_constanteditor_button oobceditor_constanteditor_button-${id}`}
        onClick={onClick}
        onTouchStart={(e) => {
          e.currentTarget.classList.add(
            "oobceditor_constanteditor_button-touched"
          );
        }}
        onTouchEnd={(e) => {
          e.currentTarget.classList.remove(
            "oobceditor_constanteditor_button-touched"
          );
        }}
      >
        {buttonTitle}
      </button>
    );
  }
  onClickClear = () => {
    const { type, focusedInputId } = this.state;
    switch (type) {
      case BLOCK.NUMBERBLOCK:
      case BLOCK.STRINGBLOCK:
        this.setState({ data: "" });
        break;
      case BLOCK.POSITION:
        const data = { ...this.state.data };
        if (focusedInputId === "oobceditor_constanteditor_input") {
          data.x = "";
        } else {
          data.y = "";
        }
        this.setState({ data });
        break;
      default:
        break;
    }
  };
  onClickCancel = () => {
    const { constantBlock, onClickCancel } = this.props;
    if (onClickCancel) {
      onClickCancel(constantBlock);
    }
  };
  onClickConfirm = () => {
    const { constantBlock, onClickConfirm } = this.props;
    const { type } = this.state;
    let data = this.state.data;
    if (type === BLOCK.NUMBERBLOCK) {
      data = parseFloat(data) || 0;
    } else if (type === BLOCK.POSITION) {
      data = {
        x: parseFloat(data.x) || 0,
        y: parseFloat(data.y) || 0,
      };
    }
    if (onClickConfirm) {
      onClickConfirm(constantBlock, data);
    }
  };

  render() {
    const { type } = this.state;
    return (
      <div className="oobceditor_constanteditor">
        {this.getInputsForBlockType(type)}
        {this.getKeypadForBlockType(type)}
        <div className="oobceditor_constanteditor_buttons">
          {this.getButtonForId("clear")}
          {this.getButtonForId("cancel")}
          {this.getButtonForId("confirm")}
        </div>
      </div>
    );
  }
}

class KeyConstantEditor extends Component {
  componentDidMount() {
    window.addEventListener("keydown", this.onKeyDown);
  }
  componentWillUnmount() {
    window.removeEventListener("keydown", this.onKeyDown);
  }

  onKeyDown = (e) => {
    if (this.keysPrevented.includes(e.key)) {
      return;
    }

    e.preventDefault();
    this.props.onClickConfirm(this.props.block, this.convertKey(e.key));
  };
  get keysPrevented() {
    return ["Meta", "HangulMode", "HanjaMode"];
  }
  convertKey(key) {
    switch (key) {
      case "ArrowUp":
        return "up";
      case "ArrowDown":
        return "down";
      case "ArrowLeft":
        return "left";
      case "ArrowRight":
        return "right";
      case "Escape":
        return "esc";
      case " ":
        return "space";
      default:
        return key.toLowerCase();
    }
  }

  render() {
    return (
      <div className="oobceditor_constanteditor oobceditor_constanteditor--key">
        <div className="oobceditor_constanteditor_keymessage">
          {Localization.formatWithId("ID_OOBC_CONSTANTEDITOR_KEY_MESSAGE")}
        </div>
      </div>
    );
  }
}
