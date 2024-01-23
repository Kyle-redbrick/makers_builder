import React, { Component } from "react";
import { connect } from "react-redux";
import { SketchPicker } from "react-color";
import DrawingCanvas from "./DrawingCanvas";
import onClickOutside from "react-onclickoutside";
import ReactTooltip from "react-tooltip";
import { FormattedMessage, injectIntl } from "react-intl";
import * as socketActions from "../../../../Store/Reducer/socket";
import * as sceneActions from "../../../../Store/Reducer/scene";
// import LoadingPopup from "../../../Common/LoadingPopup";
import PopUp, { showPopUp } from "../../../../../../Common/Component/PopUp";
import { SpriteType } from "../../../../../../Common/Util/Constant";
import * as request from "../../../../../../Common/Util/HTTPRequest";
import closeImg from "../../../../../../Image/builder/x-copy-3.svg";
import closeImg_darkmode from "../../../../../../Image/builder/x-copy-3_darkmode.svg";
import { getColorTheme } from "../../../../utils/colorThemeUtil";
import imageCompression from "browser-image-compression";
import "./index.scss";

class DrawingEditor extends Component {
  state = {
    canvasHeight: 0,
    isColorPickerOn: false,
    brushWidth: 10,
    selectedColor: "rgba(0,0,0,1)",
    selectedToolBtn: "pen",
    drawingBlob: undefined,
    isUploading: false,
  };
  drawingCanvas = undefined;
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

  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.email) {
      if (this.props.responseImage !== nextProps.responseImage) {
        if (nextProps.responseImage !== undefined) {
          this.addImageFromMobile(nextProps.responseImage);
          return false;
        }
      }
    }
    return true;
  }

  componentDidMount() {
    this.drawingCanvas = new DrawingCanvas(
      "drawingCanvas",
      this.onHistoryStatusChanged,
      this.onDrawingChanged
    );
    window.addEventListener("resize", this.resizeView);
    this.resizeView();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeView);
  }

  resizeView = () => {
    const className = "DrawingEditor__CanvasHolder";
    const width =
      document.getElementsByClassName(className)[0].clientWidth - 35;
    const height = (width * 9) / 16;
    this.drawingCanvas.setCanvasSize(width, height);
    this.setState({ canvasHeight: height });
  };

  onColorChanged = (color) => {
    const { r, g, b, a } = color.rgb;
    let newColor = `rgba(${r},${g},${b},${a})`;
    this.drawingCanvas.setColor(newColor);
    this.setState({
      selectedColor: newColor,
      // isColorPickerOn: false
    });
  };

  handleFillBtn = (e) => {
    this.setState({
      isColorPickerOn: !this.state.isColorPickerOn,
    });
  };

  handleColorDDClickOutside = (e) => {
    if (/FillBtn/.test(e.target.className)) return;
    if (this.state.isColorPickerOn) this.handleFillBtn(e);
  };

  handleBrushSizeChanged = (e) => {
    if (!isNaN(e.target.value)) {
      this.drawingCanvas.setBrushWidth(Number(e.target.value));
      this.setState({ brushWidth: Number(e.target.value) });
    }
  };

  addImageFromMobile = (url) => {
    this.drawingCanvas.addImageFromURL(url);
  };

  handleImportFileSelected = (e) => {
    const file = e.target.files[0];
    const fr = new FileReader();
    fr.onload = () => {
      this.drawingCanvas.addImageFromURL(fr.result);
    };
    fr.readAsDataURL(file);
  };

  onHistoryStatusChanged = (canUndo, canRedo) => {
    // console.log(`canUndo :${canUndo}, canRedo :${canRedo}`);
  };

  handleToolSelected = (tool) => {
    switch (tool) {
      case "image":
        this.fileInput.current.click();
        break;
      case "clear":
        this.drawingCanvas.clearAll();
        break;
      case "export":
        this.drawingCanvas.toBlob((blobUrl, blob) => {
          window.open(blobUrl, "_blank");
        });
        break;
      case "mobileImage":
        this.props.setRequestImage(true);
        break;
      case "undo":
        this.drawingCanvas.undo();
        break;
      case "redo":
        this.drawingCanvas.redo();
        break;
      case "delete":
        this.drawingCanvas.delete();
        break;
      case "forward":
        this.drawingCanvas.forward();
        break;
      case "backward":
        this.drawingCanvas.backward();
        break;
      case "front":
        this.drawingCanvas.front();
        break;
      case "back":
        this.drawingCanvas.back();
        break;
      case "paste":
        this.drawingCanvas.paste();
        break;

      default:
        this.drawingCanvas.selectTool(tool);
        break;
    }
  };

  ceaseMobileImage = (e) => {
    e.preventDefault();
    this.props.setRequestImage(false);
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
        const blob = this.state.drawingBlob;
        if (!blob || !blob.size || !blob.type) {
          showPopUp(
            <PopUp.OneButton
              title="빈 이미지는 저장할 수 없습니다."
              buttonName="확인"
            />
          );
          this.setState({ isUploading: false });
          return;
        }

        /** */
        const imageFile = blob;
        // console.log("originalFile instanceof Blob", imageFile instanceof Blob); // true
        // console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        };

        let compressedFile;
        try {
          compressedFile = await imageCompression(imageFile, options);
          // console.log(
          //   "compressedFile instanceof Blob",
          //   compressedFile instanceof Blob
          // ); // true
          // console.log(
          //   `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
          // ); // smaller than maxSizeMB
        } catch (error) {
          console.log(error);
        }

        /** */

        const { selectedSceneId } = this.props;
        this.tempSpriteIds = [];

        let data = new FormData();
        data.append("file", compressedFile);

        let url = await request.uploadCustomAsset();
        url = await url.json();
        const uploadUrl = url.url.uploadUrl;
        const downloadUrl = url.url.downloadUrl;
        const putResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "image/png",
          },
          body: compressedFile,
        });
        console.log("putResponse :", putResponse);
        let info = this.setCustomSpriteInfo(downloadUrl, "custom");
        info.name = this.props.countUpSameName("custom", this.props.spriteIds);
        const res = await request.addCustomAsset(info.asset);
        const asset = await res.json();
        console.log("asset :", asset);

        this.props.AssetLibrary.addAsset(info.asset);
        delete info["asset"];
        this.props.addSprites(selectedSceneId, [info]);
        this.props.dismiss();
      }
    );
  };
  onDrawingChanged = (blobUrl, blob) => {
    this.setState({ drawingBlob: blob });
  };

  setCustomSpriteInfo = (url, name) => {
    url = url.split("/");
    url = url[url.length - 1];
    url = url.split(".")[0];
    const assetId = url;
    const type = SpriteType.CUSTOM;
    url = "/asset/custom/" + url + ".png";

    const asset = {
      assetId,
      type,
      defaultName: name,
      path: url,
      thumb: url,
    };
    return { name, assetId, type, asset };
  };

  render() {
    const {
      canvasHeight,
      selectedColor,
      // brushWidth,
      isColorPickerOn,
      selectedToolBtn,
      isUploading,
    } = this.state;
    const { handleApply } = this;
    const ManageBtn = ({ name, tip } = {}) => {
      return (
        <React.Fragment>
          <p
            data-tip={tip}
            className={`ManageBtn ManageBtn--${name}`}
            onClick={() => this.handleToolSelected(name)}
          />
          <ReactTooltip />
        </React.Fragment>
      );
    };

    const LayerBtn = ({ name, text, tip } = {}) => {
      return (
        <React.Fragment>
          <div
            data-tip={tip}
            className={`LayerBtn LayerBtn--${name}`}
            onClick={() => this.handleToolSelected(name)}
          >
            <p className={`LayerBtn__icon LayerBtn__icon--${name}`} />
            <p className={`LayerBtn__text`}>{text}</p>
          </div>
          <ReactTooltip />
        </React.Fragment>
      );
    };

    const ToolBtn = ({ name, selectedToolBtn, tip } = {}) => {
      let toggle = name === selectedToolBtn ? "on" : "off";
      return (
        <React.Fragment>
          <ReactTooltip />
          <p
            data-tip={tip}
            className={`ToolBtn ToolBtn--${name}--${toggle}`}
            onClick={() => {
              this.setState({ selectedToolBtn: name }, () => {
                this.handleToolSelected(name);
              });
            }}
          />
        </React.Fragment>
      );
    };

    const FileBtn = ({ name, text } = {}) => {
      return (
        <div
          className={`FileBtn FileBtn--${name}`}
          onClick={() => this.handleToolSelected(name)}
        >
          <p className={`FileBtn__icon FileBtn__icon--${name}`} />
          <p className={`FileBtn__text`}>{text}</p>
        </div>
      );
    };

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

    const { formatMessage } = this.props.intl;
    // const { requestImage } = this.props;
    const colorTheme = getColorTheme();
    return (
      <div className="DrawingEditor">
        <div className="DrawingEditorTitleLine">
          <div className="DrawingEditorTitle">
            <FormattedMessage id="ID_DRAWING_EDITOR_TITLE" />
          </div>
          <div className="DrawingEditorClose">
            <img
              onClick={this.props.dismiss}
              src={colorTheme === "darkMode" ? closeImg_darkmode : closeImg}
              alt="img"
            />
          </div>
        </div>
        {/* {requestImage && (
          // <LoadingPopup
          //   message={"사진을 가져오는 중입니다..."}
          //   handleClose={this.ceaseMobileImage}
          // />
          <div>사진을 가져오는 중입니다...</div>
        )} */}
        <div className="DrawingEditorTopTools">
          <div className="DrawingEditorTopToolsLeft">
            <LayerBtn
              name="paste"
              text="Paste"
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_PASTE" })}
            />
            <LayerBtn
              name="forward"
              text="forward"
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_FORWARD" })}
            />
            <LayerBtn
              name="backward"
              text="Backward"
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_BACKWARD" })}
            />
            <LayerBtn
              name="front"
              text="Front"
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_FRONT" })}
            />
            <LayerBtn
              name="back"
              text="Back"
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_BACK" })}
            />
          </div>
          <div className="DrawingEditorTopToolsRight">
            <ManageBtn
              name="undo"
              text="undo"
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_UNDO" })}
            />
            <ManageBtn
              name="redo"
              text="redo"
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_REDO" })}
            />
            <ManageBtn
              name="delete"
              text="delete"
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_DELETE" })}
            />
          </div>
        </div>
        <div className="DrawingEditorContent">
          <div className="DrawingEditorLeftTools">
            <ToolBtn
              name="select"
              selectedToolBtn={selectedToolBtn}
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_SELECT" })}
            />
            {/** temp as pen */}
            <ToolBtn
              name="pen"
              selectedToolBtn={selectedToolBtn}
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_BRUSH" })}
            />
            <ToolBtn
              name="text"
              selectedToolBtn={selectedToolBtn}
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_TEXT" })}
            />
            <ToolBtn
              name="line"
              selectedToolBtn={selectedToolBtn}
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_LINE" })}
            />
            <ToolBtn
              name="circle"
              selectedToolBtn={selectedToolBtn}
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_CIRCLE" })}
            />
            <ToolBtn
              name="rectangle"
              selectedToolBtn={selectedToolBtn}
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_RECT" })}
            />
            <ToolBtn
              name="triangle"
              selectedToolBtn={selectedToolBtn}
              tip={formatMessage({ id: "ID_STORAGE_DRAWING_TIP_TRIANGLE" })}
            />

            <div className="DrawingEditorFill" onClick={this.handleFillBtn}>
              <p className="DrawingEditor__label">Fill</p>
              <p
                className="FillBtn"
                style={{
                  color: selectedColor,
                  backgroundColor: selectedColor,
                }}
              />
              {isColorPickerOn && (
                <ColorDropDown
                  handleClickOutside={this.handleColorDDClickOutside}
                  color={selectedColor}
                  presetColors={this.presetColors}
                  onChangeComplete={this.onColorChanged}
                />
              )}
            </div>
          </div>
          <div className="DrawingEditorBoard">
            <div
              style={{ height: canvasHeight }}
              className="DrawingEditor__CanvasHolder"
            >
              <canvas id="drawingCanvas" />
            </div>
          </div>
        </div>
        <div className="DrawingEditorBottom">
          <input
            ref={this.fileInput}
            style={{ display: "none" }}
            type="file"
            className="form-control"
            accept="image/*"
            onChange={this.handleImportFileSelected}
          />
          <FileBtn
            name="image"
            text={this.props.intl.formatMessage({
              id: "ID_WIZLAB_DRAWING_LOAD",
            })}
          />
          <FileBtn
            name="export"
            text={this.props.intl.formatMessage({
              id: "ID_WIZLAB_DRAWING_SAVE",
            })}
          />
          {/* {this.props.email && (
            <FileBtn
              name="mobileImage"
              text={this.props.intl.formatMessage({
                id: "ID_WIZLAB_DRAWING_MOBILE"
              })}
            />
          )} */}
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

// const ToolButton = props => {
//   return (
//     <button
//       className="DrawingEditor__tool"
//       onClick={e => props.onSelected(props.name)}
//     >
//       {props.name}
//     </button>
//   );
// };

export default connect(
  (state) => ({
    email: state.userinfo.email,
    requestImage: state.socket.requestImage,
    responseImage: state.socket.responseImage,
    selectedSceneId: state.interaction.selected.scene,
    spriteIds: state.scene.scenes[state.interaction.selected.scene].spriteIds,
  }),
  {
    setRequestImage: socketActions.setRequestImage,
    addSprites: sceneActions.addSprites,
  }
)(injectIntl(DrawingEditor));
