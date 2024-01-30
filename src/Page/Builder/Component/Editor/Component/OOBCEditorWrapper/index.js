import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import PopUp, { showPopUp } from "../../../../../../Common/Component/PopUp";
import OOBCEditor from "../../../../../../Common/Component/OOBCEditor";
import * as sceneActions from "../../../../Store/Reducer/scene";
import AssetLibrary from "../../../../utils/assetLibrary";
import "./index.scss";

function OOBCEditorWrapper(props) {
  const oobcEditorRef = useRef(null);
  const { triggerFull, exitFull } = props;
  const locale = props.intl.locale;
  const alert = { type: "tapioca", PopUp, showPopUp };

  const getPrototypeBlocksInfo = () => {
    const prototypesInfo = {
      sceneIds: props.sceneIds || [],
      gameObjects: getGameObjectPrototypeBlocks(),
      variables: props.globalVariables || [],
      strings: props.customStrings || [],
    };
    return prototypesInfo;
  };
  const getGameObjectPrototypeBlocks = () => {
    const gameObjects = [];

    const { selectedScene, soundIds } = props;
    if (selectedScene) {
      for (let spriteId in selectedScene.sprites) {
        const sprite = selectedScene.sprites[spriteId];
        if (!sprite.preview) continue;
        const { type, name } = sprite.preview;
        if (sprite.type === "text") {
          gameObjects.push({ type, name });
        } else {
          const asset = AssetLibrary.getAsset(sprite.assetId);
          if (asset) {
            let thumbnailSrc = asset.thumb;
            if (sprite.type === "background" && asset.oobcThumb) {
              thumbnailSrc = asset.oobcThumb;
            }
            const animationIds =
              asset.spriteAnimations && Object.keys(asset.spriteAnimations);
            gameObjects.push({ type, name, thumbnailSrc, animationIds });
          } else {
            gameObjects.push({ type, name });
          }
        }
      }
    }

    for (let soundId of soundIds) {
      const soundAsset = AssetLibrary.getSoundAsset(soundId);
      const soundName = soundAsset.defaultName;
      gameObjects.push({ type: "sound", name: soundName });
    }

    return gameObjects;
  };

  const onUpdateContextJSON = (contextJSON) => {
    const { selectedSceneId, selectedSpriteId, setSpriteCode } = props;
    if (selectedSceneId && selectedSpriteId) {
      const code = JSON.stringify(contextJSON);
      setSpriteCode(selectedSceneId, selectedSpriteId, code);
    }
  };
  useEffect(() => {
    const { selectedSprite } = props;
    if (selectedSprite && selectedSprite.code) {
      let contextJSON;
      try {
        contextJSON = JSON.parse(selectedSprite.code);
        oobcEditorRef.current.initContextWith(contextJSON);
      } catch {
        oobcEditorRef.current.initEmptyContext();
      }
    } else {
      oobcEditorRef.current.initEmptyContext();
    }
  }, [props.timeStamp, props.selectedSpriteId]);

  const onAddGlobalVar = (variableName) => {
    if (props.addGlobalVariable) {
      props.addGlobalVariable(variableName);
    }
  };

  const isLocked = props.selectedSprite && props.selectedSprite.locked;

  return (
    <div
      className={`oobcEditorWrapper${
        isLocked ? " oobcEditorWrapper-locked" : ""
      }`}
    >
      <OOBCEditor
        ref={oobcEditorRef}
        locale={locale}
        alert={alert}
        prototypesInfo={getPrototypeBlocksInfo()}
        onUpdateContextJSON={onUpdateContextJSON}
        onAddGlobalVar={onAddGlobalVar}
        triggerFull={triggerFull}
        exitFull={exitFull}
      />
      <div className="oobcEditorWrapper_lock">
        <div className="oobcEditorWrapper_lock_message">
          {props.intl.formatMessage({ id: "ID_EDIT_LOCK_SPRITE_TITLE" })}
        </div>
      </div>
    </div>
  );
}

export default connect(
  (state) => {
    const { timeStamp } = state.project;
    const { sceneIds, scenes, soundIds, globalVariables } = state.scene;
    const { scene: selectedSceneId, objects: selectedObjectInfos = {} } =
      state.interaction.selected;
    const selectedScene = scenes[selectedSceneId];
    const selectedObjectInfo = selectedObjectInfos[selectedSceneId];
    const selectedSpriteId = selectedObjectInfo && selectedObjectInfo.name;
    const selectedSprite =
      selectedScene && selectedScene.sprites[selectedSpriteId];

    const { customStrings } = state.block;

    return {
      timeStamp,
      sceneIds,
      selectedSceneId,
      selectedScene,
      selectedSpriteId,
      selectedSprite,
      soundIds,
      globalVariables,
      customStrings,
    };
  },
  {
    setSpriteCode: sceneActions.setSpriteCode,
    addGlobalVariable: sceneActions.addGlobalVariable,
  }
)(injectIntl(OOBCEditorWrapper));
