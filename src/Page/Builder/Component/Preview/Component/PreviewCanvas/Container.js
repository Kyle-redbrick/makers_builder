import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { fabric } from "fabric";
import WebFont from "webfontloader";
import stringify from "json-stringify-safe";

import * as sceneActions from "../../../../Store/Reducer/scene";
import * as projectActions from "../../../../Store/Reducer/project";
import * as interactionActions from "../../../../Store/Reducer/interaction";

import * as TrackingUtil from "../../../../../../Common/Util/TrackingUtil";
import { SpriteType, WORLD } from "../../../../../../Common/Util/Constant";
import * as request from "../../../../../../Common/Util/HTTPRequest";
import AssetLibrary from "../../../../utils/assetLibrary";
import View from "./View";

class Container extends Component {
  constructor(props) {
    super(props);
    if (props.setRef) {
      props.setRef(this);
    }

    const {
      worldWidth = WORLD.DEFAULT_WIDTH,
      worldHeight = WORLD.DEFAULT_HEIGHT,
    } = props.selectedScene || {};
    this.WORLD_WIDTH = worldWidth;
    this.WORLD_HEIGHT = worldHeight;

    this.refreshSprites = [];
    this.firstUpdateCycleMills = 1000;
    this.commonUpdateCycleMills = 3000;
    this.updateCycleMills = this.firstUpdateCycleMills;

    this.imagesOnLoading = [];

    this.state = { previewStyle: null };
  }
  // life cycle
  componentDidMount() {
    this.initFabric();
    this.drawSprites();
    this.selectObject();
    this.updateWorldSize();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.selectedSceneId === this.props.selectedSceneId) {
      if (
        prevProps.selectedScene.worldWidth !==
          this.props.selectedScene.worldWidth ||
        prevProps.selectedScene.worldHeight !==
          this.props.selectedScene.worldHeight
      ) {
        this.onChangeWorldSize();
      }
    } else {
      this.onChangeCurrentScene();
    }
    if (prevProps.screenMode !== this.props.screenMode) {
      this.onChangeScreenMode();
    }
    this.drawFabric();
  }
  componentWillUnmount() {
    if (this.updateScreenshotTimer) {
      clearTimeout(this.updateScreenshotTimer);
    }
    // if (this.thumbTimer) {
    //   clearTimeout(this.thumbTimer);
    // }
  }
  shouldComponentUpdate(nextProps, nextStates) {
    if (
      this.props.email &&
      !nextProps.screenshotURL &&
      !nextProps.useCustomIcon
    ) {
      this.updateScreenshotData(true);
    }

    this.checkRefreshSprites(this.props, nextProps);
    if (this.refreshSprites.length > 0) {
      return true;
    }

    if (this.state.previewStyle !== nextStates.previewStyle) {
      return true;
    }

    if (nextProps.selectedSceneId === this.props.selectedSceneId) {
      if (
        nextProps.selectedScene.worldWidth !==
          this.props.selectedScene.worldWidth ||
        nextProps.selectedScene.worldHeight !==
          this.props.selectedScene.worldHeight
      ) {
        return true;
      }
    }

    if (nextProps.screenMode !== this.props.screenMode) {
      return true;
    }

    return false;
  }
  checkRefreshSprites(currentProps, nextProps) {
    const currentSprites = currentProps.sprites;
    const currentSpriteIds = currentProps.spriteIds;
    const nextSprites = nextProps.sprites;
    const nextSpriteIds = nextProps.spriteIds;
    const currentSelectedScene = currentProps.selectedSceneId;
    const nextSelectedScene = nextProps.selectedSceneId;

    this.refreshSprites = [];

    if (currentSelectedScene !== nextSelectedScene) {
      this.imagesOnLoading = [];
      this.previewCanvas.clear();
      Object.keys(nextSprites).forEach((key, index) => {
        this.refreshSprites.push({
          type: "ADD",
          id: key,
        });
      });
    } else {
      // 씬 번경이 아니라면 기존 로직 그대로
      for (let i = 0; i < currentSpriteIds.length; i++) {
        if (nextSprites[currentSpriteIds[i]] === undefined) {
          this.refreshSprites.push({
            type: "REMOVE",
            id: currentSpriteIds[i],
          });
        }
      }
      for (let i = 0; i < nextSpriteIds.length; i++) {
        if (currentSprites[nextSpriteIds[i]] === undefined) {
          this.refreshSprites.push({
            type: "ADD",
            id: nextSpriteIds[i],
          });
        } else {
          const currentPreview = currentSprites[nextSpriteIds[i]].preview;
          const nextPreview = nextSprites[nextSpriteIds[i]].preview;
          const previewKeys = Object.keys(nextPreview);
          for (let j = 0; j < previewKeys.length; j++) {
            const key = previewKeys[j];
            if (!this.previewCanvas.isMouseDown) {
              if (currentPreview[key] !== nextPreview[key]) {
                this.refreshSprites.push({
                  type: "REFRESH",
                  id: nextSpriteIds[i],
                });
                break;
              }
            }
          }
        }
      }

      if (this.props.selectedObject.name !== nextProps.selectedObject.name) {
        this.refreshSprites.push({ type: "SELECT" });
      }

      for (let i in currentSpriteIds) {
        if (currentSpriteIds[i] !== nextSpriteIds[i]) {
          this.refreshSprites.push({ type: "REORDER" });
          break;
        }
      }

      if (
        nextSpriteIds.includes(currentProps.selectedObject.name) &&
        currentProps.sprites[currentProps.selectedObject.name].locked !==
          nextProps.sprites[currentProps.selectedObject.name].locked
      ) {
        this.refreshSprites.push({ type: "LOCK" });
      }

      if (this.props.screenMode !== nextProps.screenMode) {
        this.refreshSprites.push({ type: "SCREEN" });
      }
    }
  }
  onChangeWorldSize = () => {
    this.updateWorldSize();
  };
  onChangeCurrentScene = () => {
    this.updateWorldSize();
  };
  updateWorldSize = () => {
    const { selectedScene } = this.props;
    if (!selectedScene) return;
    const {
      worldWidth = WORLD.DEFAULT_WIDTH,
      worldHeight = WORLD.DEFAULT_HEIGHT,
    } = selectedScene;
    this.WORLD_WIDTH = worldWidth;
    this.WORLD_HEIGHT = worldHeight;
    this.previewCanvas.setWidth(this.WORLD_WIDTH);
    this.previewCanvas.setHeight(this.WORLD_HEIGHT);
    this.previewCanvas.setDimensions(
      { width: "100%", height: "100%" },
      { cssOnly: true }
    );
    this.previewCanvas.getObjects().forEach((object) => {
      if (object.type === SpriteType.BACKGROUND) {
        const _width =
          object.fill.source.width < this.WORLD_WIDTH
            ? this.WORLD_WIDTH
            : object.fill.source.width;
        const _height =
          object.fill.source.height < this.WORLD_HEIGHT
            ? this.WORLD_HEIGHT
            : object.fill.source.height;
        const left =
          this.WORLD_WIDTH < _width ? -(_width - this.WORLD_WIDTH) / 2 : 0;
        const top =
          this.WORLD_HEIGHT < _height ? -(_height - this.WORLD_HEIGHT) / 2 : 0;
        object.set({ width: _width, height: _height, left, top });
      }
      this.exportPreviewData(object);
    });
    this.previewCanvas.renderAll();
    setTimeout(() => {
      this.updatePreviewStyle();
    }, 10);
  };

  initFabric() {
    // create a wrapper around native canvas element (with id="previewCanvas")
    this.previewCanvas = new fabric.Canvas("previewCanvas");
    this.previewCanvas.setWidth(this.WORLD_WIDTH);
    this.previewCanvas.setHeight(this.WORLD_HEIGHT);
    this.previewCanvas.setDimensions(
      { width: "100%", height: "100%" },
      { cssOnly: true }
    );
    this.previewCanvas.selection = false;
    this.previewCanvas.on("mouse:down", this.onMouseDown);
    this.previewCanvas.on("mouse:up", this.onMouseUp);
    this.previewCanvas.on("object:modified", this.onModified);
    this.previewCanvas.on("text:changed", this.onTextChanged);
    // this.previewCanvas.on("object:moving", this.onModified);
    // this.previewCanvas.on("object:scaling", this.onModified);
    // this.previewCanvas.on("object:rotating", this.onModified);
    this.previewCanvas.isMouseDown = false;
  }
  onModified = (event) => {
    if (event.target) {
      this.exportPreviewData(event.target);
    }
  };
  onTextChanged = (event) => {
    if (event.target) {
      this.exportPreviewData(event.target);
    }
  };
  onMouseUp = (event) => {
    this.previewCanvas.isMouseDown = false;
  };
  onMouseDown = (event) => {
    this.props.handleChangeZIndex("preview");
    this.previewCanvas.isMouseDown = true;
    if (event.target) {
      const { selectedSceneId } = this.props;
      const { name, type } = event.target;
      if (!this.props.sprites[name]) {
        this.previewCanvas.remove(event.target);
        return;
      }
      if (this.props.selectedObject.name !== name) {
        if (!this.props.sprites[name].locked) {
          TrackingUtil.sendGAEvent({
            category: "Builder",
            action: `ClickSprite`,
            label: "Preview",
          });
          this.props.selectSprite(selectedSceneId, name, type);
        }
      }
    }
  };

  drawFabric() {
    const { sprites, selectedObject } = this.props;
    this.refreshSprites.forEach((sprite) => {
      switch (sprite.type) {
        case "ADD":
          this.drawSprite(sprites[sprite.id], sprite.id);
          break;
        case "REMOVE":
          this.removeSprite(sprite.id);
          break;
        case "REFRESH":
          this.refreshProperty(sprite.id);
          break;
        case "SELECT":
          this.selectObject();
          break;
        case "REORDER":
          this.sortObjects();
          break;
        case "LOCK":
          this.lockSprite(selectedObject.name);
          break;
        case "SCREEN":
          // const shouldAdjust = this.refreshSprites.length === 1;
          // this.setScreenMode(shouldAdjust);
          break;
        default:
          break;
      }
    });
    //for preview thumb
    this.updateScreenshotData();
  }
  drawSprite(sprite, id) {
    switch (sprite.type) {
      case SpriteType.PLAIN:
      case SpriteType.SPRITE:
      case SpriteType.CUSTOM:
      case SpriteType.COMPONENT:
        this.drawPlainSprite(sprite, id);
        break;
      case SpriteType.BACKGROUND:
        this.drawBackgroundSprite(sprite, id);
        break;
      case SpriteType.TEXT:
        this.drawTextSprite(sprite, id);
        break;
      default:
        break;
    }
  }
  drawSprites() {
    const { sprites, spriteIds } = this.props;
    spriteIds.forEach((id) => {
      this.drawSprite(sprites[id], id);
    });
  }
  drawPlainSprite(sprite, name) {
    const asset = AssetLibrary.getAsset(sprite.assetId);
    const type = sprite.type;
    const prevTexture = sprite.preview;
    const subtype = asset.subtype;
    const image = new Image();
    this.imagesOnLoading.push(image);
    image.crossOrigin = "anonymous";
    image.src = asset.path + "?fabric=1";
    image.onload = () => {
      const index = this.imagesOnLoading.indexOf(image);
      if (index >= 0) {
        this.imagesOnLoading.splice(index, 1);
      } else {
        return;
      }

      const img = new fabric.Image(image, {
        width: image.width,
        height: image.height,
        left: this.WORLD_WIDTH / 2,
        top: this.WORLD_HEIGHT / 2,
      });

      img.name = name;
      img.type = type;
      img.subtype = subtype;
      img.originX = "center";
      img.originY = "center";
      img.selectable =
        subtype !== "ranking" || sprite.locked ? !sprite.locked : true;
      if (prevTexture.name) {
        //restore texture infos
        const { left, top, scaleX, scaleY, angle, opacity } = prevTexture;
        img.set({ left, top, scaleX, scaleY, angle, opacity });
      }

      //set selection style
      img.set({
        borderColor: "#8592A6",
        cornerSize: 20,
        cornerStyle: "circle",
        cornerColor: "white",
        cornerStrokeColor: "#8592A6",
        padding: 5,
        borderScaleFactor: 2,
        transparentCorners: false,
      });

      img.setControlVisible("mb", false);
      img.setControlVisible("ml", false);
      img.setControlVisible("mr", false);
      img.setControlVisible("mt", false);

      //add to canvas
      this.previewCanvas.add(img);
      this.sortObjects();
      this.exportPreviewData(img);
    };
  }
  drawBackgroundSprite(sprite, name) {
    const asset = AssetLibrary.getAsset(sprite.assetId);
    const type = sprite.type;
    const img = new Image();
    this.imagesOnLoading.push(img);
    img.crossOrigin = "anonymous";
    img.src = asset.path + "?fabric=1";
    img.onload = () => {
      const index = this.imagesOnLoading.indexOf(img);
      if (index >= 0) {
        this.imagesOnLoading.splice(index, 1);
      } else {
        return;
      }

      const previewHeight = this.WORLD_HEIGHT;
      const previewWidth = this.WORLD_WIDTH;
      const width = img.width < previewWidth ? previewWidth : img.width;
      const height = img.height < previewHeight ? previewHeight : img.height;
      const left = previewWidth < width ? -(width - previewWidth) / 2 : 0;
      const top = previewHeight < height ? -(height - previewHeight) / 2 : 0;
      const shape = new fabric.Rect({ width, height, left, top });

      shape.name = name;
      shape.type = type;
      // shape.opacity = sprite.preview.opacity;
      shape.selectable = false;

      const prevTexture = sprite.preview;
      if (prevTexture.name) {
        //restore texture infos
        const { opacity } = prevTexture;
        shape.set({ opacity });
      }

      shape.set(
        "fill",
        new fabric.Pattern({
          source: img,
          repeat: "repeat",
        })
      );
      //add to canvas
      this.previewCanvas.add(shape);
      this.sortObjects();
      this.exportPreviewData(shape);
    };
  }
  drawTextSprite(sprite, id) {
    const preview = sprite.preview;
    const draw = () => {
      const type = sprite.type;
      var text = new fabric.IText(preview.textValue, {
        name: id,
        fontFamily: preview.fontFamily,
        fontSize: preview.fontSize,
        fontWeight: preview.fontWeight,
        fontStyle: preview.fontStyle,
        fill: preview.fontColor,
        type: type,
        left: WORLD.DEFAULT_WIDTH / 2,
        top: WORLD.DEFAULT_HEIGHT / 2,
        originX: "center",
        originY: "center",
        borderColor: "#8592A6",
        cornerSize: 20,
        cornerStyle: "circle",
        cornerColor: "white",
        cornerStrokeColor: "#8592A6",
        padding: 5,
        borderScaleFactor: 2,
        transparentCorners: false,
        selectable: sprite.locked ? !sprite.locked : true,
        editable: sprite.locked ? !sprite.locked : true,
      });

      const prevTexture = sprite.preview;
      if (prevTexture.name) {
        //restore texture infos
        const { left, top, scaleX, scaleY, angle, opacity } = prevTexture;
        text.set({ left, top, scaleX, scaleY, angle, opacity });
      }
      text.setControlVisible("mb", false);
      text.setControlVisible("ml", false);
      text.setControlVisible("mr", false);
      text.setControlVisible("mt", false);
      this.previewCanvas.add(text);
      this.sortObjects();
      this.exportPreviewData(text);
    };

    WebFont.load({
      google: {
        families: [preview.fontFamily],
        text: preview.textValue,
      },
      fontactive: draw,
      fontinactive: draw,
    });
  }
  removeSprite(name) {
    let spritesOnPreview = this.previewCanvas.getObjects();
    for (let i = 0; i < spritesOnPreview.length; i++) {
      const onSprite = spritesOnPreview[i];
      if (onSprite.name === name) {
        this.previewCanvas.remove(onSprite);
        break;
      }
    }
  }
  lockSprite(name) {
    const { sprites } = this.props;
    let spritesOnPreview = this.previewCanvas.getObjects();
    for (let i in spritesOnPreview) {
      if (name === spritesOnPreview[i].name) {
        this.previewCanvas.discardActiveObject();
        if (spritesOnPreview[i].type !== "background") {
          spritesOnPreview[i].selectable = !sprites[name].locked;
        }
        if (spritesOnPreview[i].type === "text") {
          spritesOnPreview[i].editable = !sprites[name].locked;
        }
        this.previewCanvas.renderAll();
        break;
      }
    }
  }

  refreshProperty(name) {
    const { sprites } = this.props;
    const sprite = sprites[name];
    const preview = sprite.preview;
    const { left, top, scaleX, scaleY, angle, opacity } = preview;
    const {
      textValue,
      fontColor,
      fontFamily,
      fontSize,
      fontStyle,
      fontWeight,
    } = preview;
    const isText = fontColor !== undefined;
    if (left === undefined) return;

    let spritesOnPreview = this.previewCanvas.getObjects();
    for (let i = 0; i < spritesOnPreview.length; i++) {
      const onSprite = spritesOnPreview[i];
      if (onSprite.name === name) {
        // refresh preview
        onSprite.set({ left, top, scaleX, scaleY, angle, opacity });
        onSprite.setCoords();

        // refresh lock
        if (onSprite.type !== "background") {
          onSprite.selectable = !sprite.locked;
        }
        if (onSprite.type === "text") {
          onSprite.editable = !sprite.locked;
        }

        // refresh select
        this.selectObject();

        // refresh text
        if (isText) {
          const draw = () => {
            onSprite.set({
              text: textValue,
              fill: fontColor,
              fontFamily,
              fontSize,
              fontStyle,
              fontWeight,
            });
            this.previewCanvas.renderAll();
          };

          WebFont.load({
            google: {
              families: [fontFamily],
              text: textValue,
            },
            fontactive: draw,
            fontinactive: draw,
          });
        } else {
          this.previewCanvas.renderAll();
        }
        break;
      }
    }
  }
  sortObjects() {
    if (this.sortTimer) {
      clearTimeout(this.sortTimer);
      this.sortTimer = undefined;
    }
    this.sortTimer = setTimeout(() => {
      const { spriteIds } = this.props;
      const addedSprites = this.previewCanvas.getObjects();
      if (spriteIds.length === addedSprites.length) {
        this.previewCanvas.getObjects().forEach((object) => {
          const fabricZorder = this.getZorder(object);
          const spriteIndex = spriteIds.indexOf(object.name);
          if (fabricZorder !== spriteIndex) {
            this.setZorder(object, spriteIndex);
          }
        });
        for (let i in addedSprites) {
          const object = addedSprites[i];
          const fabricZorder = this.getZorder(object);
          const spriteIndex = spriteIds.indexOf(object.name);
          if (fabricZorder !== spriteIndex) {
            this.sortObjects();
            break;
          }
        }
      }
    }, 100);
  }
  getZorder(object) {
    return this.previewCanvas.getObjects().indexOf(object);
  }
  setZorder(object, position) {
    while (this.getZorder(object) > position) {
      this.previewCanvas.sendBackwards(object);
    }
    while (this.getZorder(object) < position) {
      this.previewCanvas.bringForward(object);
    }
  }
  selectObject() {
    const { selectedObject } = this.props;
    const name = selectedObject.name;

    if (this.previewCanvas.getActiveObject()) {
      if (this.previewCanvas.getActiveObject().name === name) {
        return;
      }
    }

    let spritesOnPreview = this.previewCanvas.getObjects();
    for (let i in spritesOnPreview) {
      if (name === spritesOnPreview[i].name) {
        if (spritesOnPreview[i].selectable) {
          this.previewCanvas.setActiveObject(this.previewCanvas.item(i));
        } else {
          this.previewCanvas.discardActiveObject();
        }
        this.previewCanvas.renderAll();
        break;
      }
    }
  }
  onChangeScreenMode() {
    this.setScreenMode(true);
  }
  setScreenMode(shouldAdjust) {
    const { screenMode } = this.props;
    const canvasWidth = this.previewCanvas.getWidth();
    let verticalToHorizontal = false;
    let horizontalToVertical = false;
    let width, height;
    if (screenMode === "HORIZONTAL" && canvasWidth !== WORLD.DEFAULT_WIDTH) {
      verticalToHorizontal = true;
      width = WORLD.DEFAULT_WIDTH;
      height = WORLD.DEFAULT_HEIGHT;
    } else if (
      screenMode === "VERTICAL" &&
      canvasWidth === WORLD.DEFAULT_WIDTH
    ) {
      horizontalToVertical = true;
      width = WORLD.DEFAULT_HEIGHT;
      height = WORLD.DEFAULT_WIDTH;
    }

    if (verticalToHorizontal || horizontalToVertical) {
      this.previewCanvas.setWidth(width);
      this.previewCanvas.setHeight(height);
      this.previewCanvas.setDimensions(
        { width: "100%", height: "100%" },
        { cssOnly: true }
      );

      if (shouldAdjust) {
        this.previewCanvas.getObjects().forEach((object) => {
          if (object.type === SpriteType.BACKGROUND) {
            const previewHeight = height;
            const previewWidth = width;
            const _width =
              object.fill.source.width < previewWidth
                ? previewWidth
                : object.fill.source.width;
            const _height =
              object.fill.source.height < previewHeight
                ? previewHeight
                : object.fill.source.height;
            const left =
              previewWidth < _width ? -(_width - previewWidth) / 2 : 0;
            const top =
              previewHeight < _height ? -(_height - previewHeight) / 2 : 0;
            object.set({ width: _width, height: _height, left, top });
          } else {
            object.top = (object.top / width) * height;
            object.left = (object.left / height) * width;
            object.setCoords();
          }
          this.exportPreviewData(object);
        });
      }
      this.previewCanvas.renderAll();
    }
  }

  exportPreviewData = (sprite) => {
    let mapper = (item) => {
      const {
        name,
        type,
        subtype,
        angle,
        left,
        top,
        scaleX,
        scaleY,
        width,
        height,
        opacity,
      } = item;
      return {
        name,
        type,
        subtype,
        angle,
        left,
        top,
        scaleX,
        scaleY,
        width,
        height,
        opacity,
      };
    };
    const { selectedSceneId } = this.props;
    const previewData = mapper(sprite);
    if (sprite.type === SpriteType.TEXT) {
      const { text } = sprite;
      previewData.textValue = text;
    }

    if (this.props.sprites[this.props.selectedObject.name]) {
      const currentData = stringify(previewData);
      const prevData = stringify(
        this.props.sprites[this.props.selectedObject.name].preview
      );

      if (currentData !== prevData && this.props.sprites[sprite.name]) {
        if (
          stringify(previewData) !==
          stringify(this.props.sprites[sprite.name].preview)
        ) {
          this.props.setSpritePreview(
            selectedSceneId,
            sprite.name,
            previewData
          );
        }
      }
      this.updateScreenshotData();
    }
  };

  updateScreenshotData = (immediate = false) => {
    if (this.updateScreenshotTimer) {
      clearTimeout(this.updateScreenshotTimer);
    }
    this.updateScreenshotTimer = setTimeout(
      async () => {
        if (this.updateCycleMills === this.firstUpdateCycleMills) {
          this.updateCycleMills = this.commonUpdateCycleMills;
        }
        try {
          const projectId = window.location.pathname.slice(1);
          const screenShotdata = this.previewCanvas.toDataURL({
            format: "jpeg",
            quality: 0.7,
          });
          const icon = await this.uploadScreenshot(screenShotdata, projectId);
          this.props.setScenePreview(this.props.selectedSceneId, icon);
        } catch (e) {
          console.error(e);
        }
      },
      immediate ? 0 : this.updateCycleMills
    );
  };
  uploadScreenshot = async (screenshotData, projectId) => {
    let byteString;
    if (screenshotData.split(",")[0].indexOf("base64") >= 0) {
      byteString = atob(screenshotData.split(",")[1]);
    } else {
      byteString = unescape(screenshotData.split(",")[1]);
    }
    // separate out the mime component
    const mimeString = screenshotData.split(",")[0].split(":")[1].split(";")[0];
    // write the bytes of the string to a typed array
    let ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ia], { type: mimeString });
    let data = new FormData();
    data.append("file", blob);
    let url = undefined;
    let isCustomThumbnail = localStorage.getItem("isCustomThumbnail");
    try {
      const response = await request.sceneUpload(projectId);
      const json = await response.json();
      const uploadUrl = await json.url.uploadUrl;
      const downloadUrl = await json.url.downloadUrl;
      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": mimeString,
        },
        body: blob,
      });
      console.log("putResponse : ", putResponse);
      url = downloadUrl;
      if (isCustomThumbnail === "false") {
        let pId =
          window.location.pathname.split("/")[2] ||
          window.location.pathname.slice(1);
        const uploadResponse = await request.projectIconUpload(pId);
        const uploadData = await uploadResponse.json();
        const putUrl = uploadData.url.uploadUrl;
        const downloadUrl = uploadData.url.downloadUrl;
        const putResponse = await fetch(putUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "image/jpeg",
          },
          body: blob,
        });
        console.log("putResponse", putResponse);
        let params = {
          thumbnailURL: downloadUrl,
        };
        try {
          request
            .updateSaasProject({ params, pId })
            .then((res) => res.json())
            .then((json) => console.log("json", json));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (e) {
      console.error(e);
    }
    return url;
  };

  createPreviewStyle = () => {
    const previewContainerRect = this.getPreviewContatinerRect();
    const isHorizontalMode = this.getIsHorizontalMode();
    const defaultWidth = isHorizontalMode
      ? WORLD.DEFAULT_WIDTH
      : WORLD.DEFAULT_HEIGHT;
    const defaultHeight = isHorizontalMode
      ? WORLD.DEFAULT_HEIGHT
      : WORLD.DEFAULT_WIDTH;
    const width =
      (previewContainerRect.width * this.WORLD_WIDTH) / defaultWidth + 2;
    const height =
      (previewContainerRect.height * this.WORLD_HEIGHT) / defaultHeight + 2;
    const top = -1;
    const left = -1;
    return { top, left, width, height };
  };
  updatePreviewStyle = () => {
    this.setState({ previewStyle: this.createPreviewStyle() });
  };
  getPreviewContainerElement = () => {
    const previewContainerElement =
      document.getElementById("preview_container");
    return previewContainerElement;
  };
  getPreviewContatinerRect = () => {
    const previewContainerElement = this.getPreviewContainerElement();
    return previewContainerElement.getBoundingClientRect();
  };
  onResize = (e) => {
    this.updatePreviewStyle();
  };

  getIsHorizontalMode = () => {
    const { screenMode } = this.props;
    return screenMode === "HORIZONTAL";
  };

  render() {
    const { fixed } = this.props;
    const { previewStyle } = this.state;
    return <View fixed={fixed} previewStyle={previewStyle} />;
  }
}

export default connect(
  (state) => ({
    selectedSceneId: state.interaction.selected.scene,
    selectedScene: state.scene.scenes[state.interaction.selected.scene],
    sprites: state.scene.scenes[state.interaction.selected.scene].sprites,
    spriteIds: state.scene.scenes[state.interaction.selected.scene].spriteIds,
    screenMode: state.preview.screenMode,
    selectedObject:
      state.interaction.selected.objects[state.interaction.selected.scene],
    pId: state.project.pId,
    email: state.userinfo.email,
    timeStamp: state.project.timeStamp,
    screenshotURL: state.project.screenshotURL,
    useCustomIcon: state.project.useCustomIcon,
  }),
  {
    setSpritePreview: sceneActions.setSpritePreview,
    selectSprite: interactionActions.selectSprite,
    setScreenshotURL: projectActions.setScreenshotURL,
    setScenePreview: sceneActions.setScenePreview,
  }
)(injectIntl(Container));
