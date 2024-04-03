import * as request from "../../../Common/Util/HTTPRequest";

class AssetLibrary {
  baseURL = `${process.env.REACT_APP_THUMBNAIL_ALI}`;
  fonts = [
    { id: "Black And White Picture", name: "ID_FONT_BNWP" },
    { id: "Black Han Sans", name: "ID_FONT_BHS" },
    { id: "Cute Font", name: "ID_FONT_CUTE" },
    { id: "Do Hyeon", name: "ID_FONT_DOHYEON" },
    { id: "Dokdo", name: "ID_FONT_DOKDO" },
    { id: "East Sea Dokdo", name: "ID_FONT_ESD" },
    { id: "Gaegu", name: "ID_FONT_GAEGU" },
    { id: "Gamja Flower", name: "ID_FONT_GF" },
    { id: "Gothic A1", name: "ID_FONT_GA" },
    { id: "Gugi", name: "ID_FONT_GUGI" },
    { id: "Hi Melody", name: "ID_FONT_HM" },
    { id: "Jua", name: "ID_FONT_JUA" },
    { id: "Kirang Haerang", name: "ID_FONT_KH" },
    { id: "Nanum Brush Script", name: "ID_FONT_NBS" },
    { id: "Nanum Gothic", name: "ID_FONT_NG" },
    { id: "Nanum Myeongjo", name: "ID_FONT_NM" },
    { id: "Nanum Pen Script", name: "ID_FONT_NPS" },
    { id: "Noto Sans KR", name: "ID_FONT_NSANSK" },
    { id: "Noto Serif KR", name: "ID_FONT_NSERIFK" },
    { id: "Poor Story", name: "ID_FONT_PS" },
    { id: "Song Myung", name: "ID_FONT_SM" },
    { id: "Stylish", name: "ID_FONT_STYLISH" },
    { id: "Sunflower", name: "ID_FONT_SUNFLOWER" },
    { id: "Yeon Sung", name: "ID_FONT_YEONSUNG" },
  ];
  categories = [];
  sprites = {};
  sounds = {};
  categoryItems = {};
  firstTemplateName = "";

  constructor() {
    //temp
    for (var i in this.components) {
      var component = this.components[i];
      this.sprites[component.assetId] = component;
    }
    this.loadCategories();
  }

  getCategories(email) {
    // const managers = [
    //   "selena@wizschool.io",
    //   "gocks0922@gmail.com",
    //   "chris@wizschool.io",
    //   "het@wizschool.io",
    //   "y3000y7@gmail.com",
    //   "rei@wizschool.io",
    //   "rei2@wizschool.io",
    //   "noah@wizschool.io",
    //   "sona@wizschool.io",
    //   "martha@wizschool.io",
    //   "zayden@wizschool.io",
    //   "afterschool01@wizschool.io",
    //   "4wizclass@wizschool.io",
    //   "globalcontent@wizschool.io",
    //   "crong@wizschool.io",
    //   "chjsuac@wizschool.io",
    //   "oobc@wizschool.io",
    //   "cc@wizschool.io"
    // ];
    // if (email && managers.indexOf(email) !== -1) {
    //   return this.categories;
    // } else {
    //   return this.categories.filter(c => c.name !== "illust");
    // }
    return this.categories;
  }

  loadCategories(callback) {
    request
      .getCategories()
      .then((res) => res.json())
      .then((categories) => {
        this.categories = categories.data.filter(
          (c) => c.name !== "wizlive" && c.name !== "template"
        );
        if (callback) callback();
      })
      .catch((err) => console.error(err));
  }

  loadAllSounds(callback) {
    this.loadCategories(() => {
      const soundCategories = this.categories.filter(
        (c) => c.name === "sfx" || c.name === "bgm"
      );
      let i = 0;
      const load = (name) => {
        this.loadAssetsByCategory(name, () => {
          i++;
          if (soundCategories.length > i) {
            load(soundCategories[i].name);
          } else {
            callback();
          }
        });
      };
      load(soundCategories[i].name);
    });
  }

  loadAssetsByCategory(category, callback) {
    if (this.categoryItems[category]) {
      callback(this.categoryItems[category]);
      return;
    }

    request
      .assetsByCategory({ categoryId: category })
      .then((res) => res.json())
      .then((json) => {
        if (!this.categoryItems[category]) {
          this.categoryItems[category] = [];
        }
        json.data.forEach((subItem) => {
          const assets = subItem.assetCategoryItems;
          this.categoryItems[subItem.name] = [];
          for (var i in assets) {
            let asset = assets[i].asset;
            let assetBundle;

            if (asset.type === "sound") {
              asset = this.convertSoundAsset(asset);
              assetBundle = this.sounds;
            } else {
              asset = this.convertSpriteAsset(asset);
              assetBundle = this.sprites;
            }

            this.categoryItems[subItem.name].push({
              assetId: asset.assetId,
              type: asset.type,
              subtype: asset.subtype,
            });

            if (!assetBundle[asset.assetId]) {
              assetBundle[asset.assetId] = asset;
            }
            if (category === "new") {
              assetBundle[asset.assetId].isNew = true;
            }
          }

          this.categoryItems[category] = [
            ...this.categoryItems[category],
            ...this.categoryItems[subItem.name],
          ];
        });

        if (category === "template" || category === "illust") {
          this.firstTemplateName = json[0].name;
          this.categoryItems[category] =
            this.categoryItems[this.firstTemplateName];
        }

        callback(this.categoryItems[category]);
      });
  }

  loadAssetsFromScene(state, callback) {
    const spriteAssetIds = [];

    let param = "?";

    for (var i in state.sceneIds) {
      const spriteIds = state.scenes[state.sceneIds[i]].spriteIds;
      const sprites = state.scenes[state.sceneIds[i]].sprites;
      for (var j in spriteIds) {
        if (spriteAssetIds.indexOf(sprites[spriteIds[j]].assetId) === -1) {
          spriteAssetIds.push(sprites[spriteIds[j]].assetId);
          param = param + `spriteIds=${sprites[spriteIds[j]].assetId}&`;
        }
      }
    }

    if (state.soundIds.length) {
      for (i = 0; i < state.soundIds.length; i++) {
        param = param + `soundIds=${state.soundIds[i]}&`;
      }
    }

    if (param.charAt(param.length - 1) === "&") {
      param = param.slice(0, -1);
    }

    request
      .getAssetsById(param)
      .then((res) => res.json())
      .then((json) => {
        if (json.message === "You've logged in from other place") {
          alert(
            "로그아웃된 상태이므로 학습 템플릿을 불러올 수 없습니다.\n창을 닫고 다시 로그인 후 이용해주세요.\n1개의 계정은 1개의 기기에서만 로그인할 수 있습니다."
          );
          window.location.replace(process.env.REACT_APP_CLASS_AI);
        }
        const sprites = json.data.sprites;
        let i = 0;
        let asset = undefined;
        for (i in sprites) {
          asset = sprites[i];
          asset = this.convertSpriteAsset(asset);
          this.sprites[asset.assetId] = asset;
        }

        const sounds = json.data.sounds;
        for (i in sounds) {
          asset = sounds[i];
          asset = this.convertSoundAsset(asset);
          this.sounds[asset.assetId] = asset;
        }
        callback();
      });
  }

  async loadAssetsForGame(state) {
    let shouldLoad = false;
    let data = { sprites: {}, sounds: {} };

    // make ids array except for text sprites
    const spriteAssetIds = [];
    let i = 0;
    for (i in state.sceneIds) {
      const spriteIds = state.scenes[state.sceneIds[i]].spriteIds;
      const sprites = state.scenes[state.sceneIds[i]].sprites;
      for (var j in spriteIds) {
        if (sprites[spriteIds[j]].type !== "text") {
          if (spriteAssetIds.indexOf(sprites[spriteIds[j]].assetId) === -1) {
            spriteAssetIds.push(sprites[spriteIds[j]].assetId);
          }
        }
      }
    }
    // check if sprites loaded
    for (i in spriteAssetIds) {
      if (this.sprites[spriteAssetIds[i]]) {
        data.sprites[spriteAssetIds[i]] = this.sprites[spriteAssetIds[i]];
      } else {
        shouldLoad = true;
        break;
      }
    }
    // check if sounds loaded
    if (!shouldLoad) {
      for (i in state.soundIds) {
        if (this.sounds[state.soundIds[i]]) {
          data.sounds[state.soundIds[i]] = this.sounds[state.soundIds[i]];
        } else {
          shouldLoad = true;
          break;
        }
      }
    }

    if (shouldLoad) {
      data = { sprites: {}, sounds: {} };

      let param = "?";
      if (state.soundIds.length) {
        for (i = 0; i < state.soundIds.length; i++) {
          param = param + `soundIds=${state.soundIds[i]}&`;
        }
      }
      if (spriteAssetIds) {
        for (i = 0; i < spriteAssetIds.length; i++) {
          param = param + `spriteIds=${spriteAssetIds[i]}&`;
        }
      }

      if (param.charAt(param.length - 1) === "&") {
        param = param.slice(0, -1);
      }

      const response = await request.getAssetsById(param);

      const json = await response.json();

      const sprites = json.data.sprites;
      i = 0;
      let asset = undefined;
      for (i in sprites) {
        asset = sprites[i];
        asset = this.convertSpriteAsset(asset);
        data.sprites[asset.assetId] = asset;
      }

      const sounds = json.data.sounds;
      for (i in sounds) {
        asset = sounds[i];
        asset = this.convertSoundAsset(asset);
        data.sounds[asset.assetId] = asset;
      }
    }

    return new Promise(function (resolve) {
      resolve(data);
    });
  }

  convertSoundAsset = (asset) => {
    asset.path = this.baseURL + asset.path;
    asset.id = asset.assetId;
    return asset;
  };
  convertSpriteAsset = (asset) => {
    if (asset.bodySize) {
      asset.bodySize = JSON.parse(asset.bodySize);
    }
    if (asset.spriteAnimations) {
      asset.spriteAnimations = JSON.parse(asset.spriteAnimations);
    }
    if (asset.spriteSize) {
      asset.spriteSize = JSON.parse(asset.spriteSize);
    }

    asset.path = this.baseURL + asset.path;
    asset.thumb = this.baseURL + asset.thumb;
    if (asset.spritePath) {
      asset.spritePath = this.baseURL + asset.spritePath;
    }

    asset.id = asset.assetId;
    return asset;
  };

  get textboxThumb() {
    return this.baseURL + "/asset/sprite/sprite-text.svg";
  }

  getAsset = (id) => {
    return this.sprites[id];
  };
  loadAsset = (id, callback) => {
    if (!id) callback();

    const asset = this.getAsset(id);
    if (asset) {
      callback(asset);
    } else {
      request
        .getAssetsById(`?spriteIds=${id}`)
        .then((res) => res.json())
        .then((json) => json.data)
        .then((json) => {
          for (let sprite of json.sprites) {
            this.sprites[id] = this.convertSpriteAsset(sprite);
          }
          if (callback) callback(this.getAsset(id));
        });
    }
  };

  getSoundAsset = (id) => {
    return this.sounds[id];
  };

  addAsset = (asset) => {
    asset = this.convertSpriteAsset(asset);
    this.sprites[asset.assetId] = asset;
  };

  getAll() {
    const { sprites, sounds } = this;
    return { sprites, sounds };
  }
  setAll(assets) {
    const { sprites, sounds } = assets;
    this.sprites = { ...this.sprites, ...sprites };
    this.sounds = { ...this.sounds, ...sounds };
  }

  getAssetByName = (name) => {
    for (let id in this.sprites) {
      let sprite = this.sprites[id];
      if (sprite.defaultName === name) {
        return sprite;
      }
    }
  };

  getSoundAssetByName = (name) => {
    for (let id in this.sounds) {
      let sound = this.sounds[id];
      if (sound.defaultName === name) {
        return sound;
      }
    }
  };
}

export default new AssetLibrary();
