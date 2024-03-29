const BabylonConstant = {
  EDITOR_CAMERA_FOCUS_DISTANCE: 30,
  GAMEMODE: {
    PLAY: "play",
    EDIT: "edit",
    PREVIEW: "preview"
  },
  GIZMO: {
    POSITION: "position",
    ROTATION: "rotation",
    SCALE: "scale"
  },
  GAMEOBJECT: {
    EMPTY: "empty",
    CAMERA: "camera",
    LIGHT: "light",
    SKYBOX: "skybox",
    MESH: "mesh",
    GUI: "gui",
    TEXTURE_GUI: "textureGui"
  },
  CAMERA: {
    UNIVERSAL: "universal",
    ARCROTATE: "arcRotate",
    FOLLOW: "follow"
  },
  LIGHT: {
    POINT: "point",
    DIRECTIONAL: "directional",
    SPOT: "spot",
    HEMISPHERIC: "hemispheric"
  },
  MESH: {
    BOX: "box",
    GROUND: "ground",
    SPHERE: "sphere",
    OBJ: "obj"
  },
  GUI: {
    BUTTON: "button",
    TEXT: "text"
  },
  TEXTURE_GUI: {},
  EMPTY: {
    VIRTUAL_JOYSTICK: "virtualJoystick"
  },
  PROPERTY_ID: {
    NAME: "name",
    POSITION: "position",
    ROTATION: "rotation",
    SCALE: "scale",
    DIRECTION: "direction",
    SIZE: "size",
    WIDTH: "width",
    HEIGHT: "height",
    TEXT: "text",
    INTENSITY: "intensity",
    RANGE: "range",
    CODE: "code",
    LOCK: "isLocked",
    PARENT_ID: "parentId",
    TARGET_ID: "targetId",
    IS_ACTIVE_CAMERA: "isActiveCamera"
  }
};

window.BabylonConstant = BabylonConstant;
