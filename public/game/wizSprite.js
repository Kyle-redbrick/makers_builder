function WizSprite(param) {
  this.defaultSpeed = 100; // speed = px / 0.1s
  this.speed = 100;

  // user listeners
  this.onKeyListener = {};
  this.onKeyUpListener = {};
  this.onClickListener = undefined;
  this.onClickUpListener = undefined;
  this.onScreenClickListener = undefined;
  this.onScreenClickUpListener = undefined;
  this.onListeningListener = undefined;
  this.onFaceDetectListener = undefined;
  this.signalReceiver = {};
  this.signalQueue = [];
  this.swipeHandler = {};

  this.errorHandler = param.errorHandler;
  this.game = param.game;
  this.gameScene = param.gameScene;
  this.type = param.type;
  this.subtype = param.subtype;
  this.sprite = param.sprite;
  this.codeData = param.codeData;
  this.spriteName = param.spriteName;
  this.originalName = param.originalName;
  this.spriteId = param.spriteId;
  this.asset = param.asset;
  this.socketManager = param.socketManager;
  this.isCloned = this.spriteName !== this.originalName;
  this.setAnimations();
  this.setBodySize();
  this.isCodeRun = this.isCloned;

  this.saySprite = undefined;
  this.sayBgSprite = undefined;

  this.pen = undefined;
  this.penSize = 1;
  this.penColor = "0x000000";

  this.sayTimer = undefined;

  this.prevDegreeForVFD = 0;
  this.prevForceForVFD = 0;

  this.sendGameEvent = function (event) {
    this.gameScene.sendGameEvent(
      Object.assign({ spriteId: this.spriteName }, event)
    );
  };

  setFunctions.call(this);
}

WizSprite.prototype.setAnimations = function () {
  if (this.type !== SpriteType.PLAIN && this.type !== SpriteType.SPRITE) {
    return;
  }
  if (this.asset.spriteAnimations) {
    var animations = this.asset.spriteAnimations;
    var names = Object.keys(animations);
    for (var i in names) {
      var name = names[i];
      var frameRate = animations[name].frameRate;
      var indexes = animations[name].indexes;
      this.sprite.animations.add(name, indexes, frameRate, true);
    }
  }
};

WizSprite.prototype.setBodySize = function () {
  if (this.type !== SpriteType.PLAIN && this.type !== SpriteType.SPRITE) {
    return;
  }
  var bodySize = this.asset.bodySize;
  if (bodySize) {
    this.sprite.body.setSize(
      bodySize[0],
      bodySize[1],
      bodySize[2],
      bodySize[3]
    );
  }
};

WizSprite.prototype.runCode = function () {
  var sandbox = {
    cameraFollow: this.cameraFollow,
    fixToCamera: this.fixToCamera,

    moveForward: this.moveForward,
    moveX: this.moveX,
    moveY: this.moveY,
    turn: this.turn,
    turnToSprite: this.turnToSprite,
    turnToMousePointer: this.turnToMousePointer,
    setHorizontalFlip: this.setHorizontalFlip,
    setVerticalFlip: this.setVerticalFlip,
    setFlipX: this.setFlipX,
    setFlipY: this.setFlipY,
    getFlipX: this.getFlipX,
    getFlipY: this.getFlipY,
    setDegree: this.setDegree,
    getDegree: this.getDegree,
    setMoveSpeed: this.setMoveSpeed,
    getMoveSpeed: this.getMoveSpeed,
    goForward: this.goForward,
    goX: this.goX,
    goY: this.goY,
    goTo: this.goTo,
    goToSprite: this.goToSprite,
    goToMousePointer: this.goToMousePointer,
    goToRandom: this.goToRandom,
    setX: this.setX,
    setY: this.setY,
    getX: this.getX,
    getY: this.getY,
    moveTo: this.moveTo,
    moveToSprite: this.moveToSprite,
    moveToMousePointer: this.moveToMousePointer,
    moveToRandom: this.moveToRandom,
    setDraggable: this.setDraggable,
    getDraggable: this.getDraggable,

    say: this.say,
    stopSay: this.stopSay,
    playAnimation: this.playAnimation,
    stopAnimation: this.stopAnimation,
    getCurrentAnimation: this.getCurrentAnimation,
    setSize: this.setSize,
    addSize: this.addSize,
    getSize: this.getSize,
    show: this.show,
    hide: this.hide,
    bringToTop: this.bringToTop,
    getX: this.getX,
    getY: this.getY,
    getWidth: this.getWidth,
    getHeight: this.getHeight,
    setWidth: this.setWidth,
    setHeight: this.setHeight,
    getWorldWidth: this.getWorldWidth,
    getWorldHeight: this.getWorldHeight,
    getMousePointerX: this.getMousePointerX,
    getMousePointerY: this.getMousePointerY,
    shake: this.shake,
    flash: this.flash,
    clone: this.clone,
    isClickedSprite: this.isClickedSprite,
    isPressedKey: this.isPressedKey,
    isClickedMouse: this.isClickedMouse,
    isOverlapped: this.isOverlapped,

    onFrame: this.onFrame,
    onSignal: this.onSignal,
    sendSignal: this.sendSignal,
    onSwipe: this.onSwipe,
    onOut: this.onOut,
    onOutStage: this.onOutStage,
    changeScene: this.changeScene,
    kill: this.kill,
    revive: this.revive,

    wait: this.wait,
    print: this.print,
    input: this.input,

    onClick: this.onClick,
    onClickUp: this.onClickUp,
    onTouch: this.onTouch,
    onTouchUp: this.onTouchUp,
    onScreenClick: this.onScreenClick,
    onScreenClickUp: this.onScreenClickUp,
    onKey: this.onKey,
    onKeyUp: this.onKeyUp,

    getRandom: this.getRandom,
    abs: Math.abs,
    round: Math.round,
    ceil: Math.ceil,
    floor: Math.floor,
    pow: Math.pow,
    sqrt: Math.sqrt,
    log: Math.log,
    getName: this.getName,

    global: global,
    server: this.server,
    socket: this.socket,
    getSprite: this.getSprite,

    setCollideWorldBounds: this.setCollideWorldBounds,
    setCollideScene: this.setCollideWorldBounds,
    setCollision: this.setCollision,
    setCheckCollision: this.setCheckCollision,
    setCollideSide: this.setCollideSide,
    onOverlap: this.onOverlap,
    onOverlapOnce: this.onOverlapOnce,
    setImmovable: this.setImmovable,
    setMovable: this.setMovable,
    getMovable: this.getMovable,
    setMass: this.setMass,
    getMass: this.getMass,
    setGravityX: this.setGravityX,
    setGravityY: this.setGravityY,
    setVelocityX: this.setVelocityX,
    setVelocityY: this.setVelocityY,
    getVelocityX: this.getVelocityX,
    getVelocityY: this.getVelocityY,
    setVelocityFromDegree: this.setVelocityFromDegree,
    setAccelerationFromDegree: this.setAccelerationFromDegree,
    setBounceX: this.setBounceX,
    setBounceY: this.setBounceY,
    setAccelerationX: this.setAccelerationX,
    setAccelerationY: this.setAccelerationY,
    getGravityX: this.getGravityX,
    getGravityY: this.getGravityY,
    getVelocityX: this.getVelocityX,
    getVelocityY: this.getVelocityY,
    getBounceX: this.getBounceX,
    getBounceY: this.getBounceY,
    getAccelerationX: this.getAccelerationX,
    getAccelerationY: this.getAccelerationY,

    setText: this.setText,
    appendText: this.appendText,
    clearText: this.clearText,
    getText: this.getText,
    setTextColor: this.setTextColor,
    setRandomTextColor: this.setRandomTextColor,
    getTextColor: this.getTextColor,

    playSound: this.playSound,
    restartSound: this.restartSound,
    stopSound: this.stopSound,
    pauseSound: this.pauseSound,
    resumeSound: this.resumeSound,
    stopAllSounds: this.stopAllSounds,
    setSoundVolume: this.setSoundVolume,
    addSoundVolume: this.addSoundVolume,
    getSoundVolume: this.getSoundVolume,

    getYear: this.getYear,
    getMonth: this.getMonth,
    getDay: this.getDay,
    getHour: this.getHour,
    getMin: this.getMin,
    getSec: this.getSec,

    startTimer: this.startTimer,
    pauseTimer: this.pauseTimer,
    resumeTimer: this.resumeTimer,
    resetTimer: this.resetTimer,
    getTimer: this.getTimer,

    onJoystick: this.onJoystick,
    onDpad: this.onDpad,

    startPen: this.startPen,
    endPen: this.endPen,
    setPenColor: this.setPenColor,
    setRandomPenColor: this.setRandomPenColor,
    getPenColor: this.getPenColor,
    setPenSize: this.setPenSize,
    addPenSize: this.addPenSize,
    getPenSize: this.getPenSize,
    erasePen: this.erasePen,

    saveScore: this.saveScore,
    showRanking: this.showRanking,
    showRankingAscending: this.showRankingAscending,
    hideRanking: this.hideRanking,

    vibrate: this.vibrate,
    onGyro: this.onGyro,
    startListening: this.startListening,
    onListening: this.onListening,
    onShake: this.onShake,
    speak: this.speak,

    translate: this.translate,

    openCamera: this.openCamera,
    closeCamera: this.closeCamera,
    switchCamera: this.switchCamera,
    onFaceDetect: this.onFaceDetect,
  };

  var func = userDefinedFunction[this.gameScene.sceneId][this.originalName];
  // console.log(func.toString());
  if (typeof func === "function") {
    func(sandbox);
  }
  this.isCodeRun = true;
  if (this.signalQueue.length > 0) {
    for (var i in this.signalQueue) {
      var name = this.signalQueue[i];
      this.onReceive(name);
    }
    this.signalQueue = [];
  }
};

/*************************************/
//internal functions

WizSprite.prototype.getDistance = function (x1, y1, x2, y2) {
  var a = x1 - x2;
  var b = y1 - y2;
  return Math.sqrt(a * a + b * b);
};

WizSprite.prototype.getTimeSec = function (x1, y1, x2, y2) {
  var distance = this.getDistance(x1, y1, x2, y2);
  return distance / this.speed / 10; // speed = px / 0.1s
};

WizSprite.prototype.update = function () {
  if (this.sayBgSprite && this.saySprite) {
    if (408 / 196 < this.saySprite.width / this.saySprite.height) {
      this.sayBgSprite.width = this.saySprite.width * 1.2;
      this.sayBgSprite.height = (this.saySprite.width / 408) * 196;
    } else {
      this.sayBgSprite.height = this.saySprite.height * 1.2;
      this.sayBgSprite.width = (this.saySprite.height / 196) * 408;
    }

    this.sayBgSprite.x = this.sprite.x;
    if (this.sprite.body) {
      this.sayBgSprite.y = this.sprite.y - this.sprite.body.height / 2;
    } else {
      this.sayBgSprite.y = this.sprite.y - this.sprite.height / 2;
    }

    if (this.sprite.body) {
      if (
        this.sprite.y + this.sprite.body.height / 2 <
        this.gameScene.world.bounds.height / 3
      ) {
        this.sayBgSprite.y =
          this.sprite.y + this.sprite.body.height + this.sayBgSprite.height;
      }
    } else {
      if (
        this.sprite.y + this.sprite.height / 2 <
        this.gameScene.world.bounds.height / 3
      ) {
        this.sayBgSprite.y =
          this.sprite.y + this.sprite.height + this.sayBgSprite.height;
      }
    }

    if (this.sayBgSprite.x < this.sayBgSprite.width / 2) {
      this.sayBgSprite.x = this.sayBgSprite.width / 2;
    } else if (
      this.sayBgSprite.x >
      this.gameScene.world.bounds.width - this.sayBgSprite.width / 2
    ) {
      this.sayBgSprite.x =
        this.gameScene.world.bounds.width - this.sayBgSprite.width / 2;
    }

    if (this.sayBgSprite.y < this.sayBgSprite.height) {
      this.sayBgSprite.y = this.sayBgSprite.height;
    } else if (this.sayBgSprite.y > this.gameScene.world.bounds.height) {
      this.sayBgSprite.y = this.gameScene.world.bounds.height;
    }

    this.saySprite.x = this.sayBgSprite.centerX;
    this.saySprite.y = this.sayBgSprite.centerY;

    this.sayBgSprite.visible = true;
    this.saySprite.visible = true;
  }

  if (this.joystickCallback) {
    if (this.sprite.pad.stick.isDown) {
      var degree = (this.sprite.pad.stick.rotation * 180) / Math.PI;
      this.joystickCallback(degree, this.sprite.pad.stick.force);
      this.sendGameEvent({
        api: "onJoystick",
        degree: degree,
        force: this.sprite.pad.stick.force,
      });
    } else {
      this.joystickCallback(0, 0);
    }
  }

  if (this.dpadCallback) {
    if (this.sprite.pad.stick.isDown) {
      switch (this.sprite.pad.stick.direction) {
        case Phaser.LEFT:
          this.dpadCallback("left");
          break;
        case Phaser.RIGHT:
          this.dpadCallback("right");
          break;
        case Phaser.UP:
          this.dpadCallback("up");
          break;
        case Phaser.DOWN:
          this.dpadCallback("down");
          break;
        default:
          this.dpadCallback("none");
          break;
      }
    } else {
      this.dpadCallback("none");
    }
  }

  if (this.pen) {
    this.pen.lineStyle(this.penSize, this.penColor, 1);
    this.pen.lineTo(this.sprite.position.x, this.sprite.position.y);
  }
};

/*************************************/
//callbacks from game scene
WizSprite.prototype.onKeyRelease = function (key) {
  if (this.onKeyUpListener[key]) {
    this.sendGameEvent({ api: "onKeyUp", key });
    this.onKeyUpListener[key]();
  }
};

WizSprite.prototype.onKeyDown = function (key) {
  if (this.onKeyListener[key]) {
    this.sendGameEvent({ api: "onKey", key });
    this.onKeyListener[key]();
  }
};

WizSprite.prototype.onClicked = function () {
  this.isClicked = true;
  if (this.onClickListener) {
    this.onClickListener();
    this.sendGameEvent({
      api: "onClick",
    });
  }
};

WizSprite.prototype.onClickedUp = function () {
  this.isClicked = false;
  if (this.onClickUpListener) {
    this.onClickUpListener();
    this.sendGameEvent({
      api: "onClickUp",
    });
  }
};

WizSprite.prototype.onScreenClicked = function () {
  if (this.onScreenClickListener) {
    this.onScreenClickListener();
    this.sendGameEvent({
      api: "onScreenClick",
    });
  }
};

WizSprite.prototype.onScreenClickedUp = function () {
  if (this.onScreenClickUpListener) {
    this.onScreenClickUpListener();
  }
};

WizSprite.prototype.onReceive = function (name) {
  if (this.isCodeRun) {
    if (this.signalReceiver[name]) {
      this.signalReceiver[name]();
    }
  } else {
    this.signalQueue.push(name);
  }
};

WizSprite.prototype.onSlide = function (direction) {
  if (this.swipeHandler[direction]) {
    this.swipeHandler[direction]();
  }
};

WizSprite.prototype.getErrorName = function (msg) {
  const sceneId = this.game.state.current;
  const spriteId = this.spriteName;
  const api = msg;
  return { sceneId, spriteId, api };
};

WizSprite.prototype.calculateAngle = function (point, targetPoint) {
  var deltaY = point.y - targetPoint.y;
  var deltaX = targetPoint.x - point.x;
  var result = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
  var degree = result < 0 ? 360 + result : result;
  return degree;
};

WizSprite.prototype.sendMessageToParent = function (payload) {
  payload = JSON.stringify(payload);
  try {
    //android
    if (window.app) {
      window.app.onGameEvent(payload);
    }

    //ios
    if (window.webkit) {
      window.webkit.messageHandlers.onGameEvent.postMessage({
        payload: payload,
      });
    }

    //web
    parent.postMessage(
      {
        message: payload,
        source: "wizlab",
        type: "gameEvent",
      },
      "*"
    );
  } catch (err) {
    console.log(err);
  }
};

WizSprite.prototype.onGyroChanged = function (x, y) {
  if (this.onGyroListener) {
    this.onGyroListener(x, y);
  }
};

WizSprite.prototype.onListeningResult = function (msg) {
  if (this.onListeningListener) {
    this.onListeningListener(msg);
  }
};

WizSprite.prototype.onShaked = function () {
  if (this.onShakeListener) {
    this.onShakeListener();
  }
};

WizSprite.prototype.onFaceDetected = function (face) {
  if (this.onFaceDetectListener) {
    this.onFaceDetectListener(JSON.parse(face));
  }
};

WizSprite.prototype.onSaveGameData = function () {
  if (this.onSaveGameDataListener) {
    this.onSaveGameDataListener();
  }
};

WizSprite.prototype.onResetGameData = function () {
  if (this.onResetGameDataListener) {
    this.server.data = serverData;
    this.onResetGameDataListener();
  }
};

WizSprite.prototype.onLoadGameData = function () {
  if (this.onLoadGameDataListener) {
    this.server.data = serverData;
    this.onLoadGameDataListener();
  }
};

/*************************************/
//functions for user

//1.motions
function setFunctions() {
  this.cameraFollow = function () {
    this.game.camera.follow(this.sprite);
  }.bind(this);
  this.fixToCamera = function () {
    this.sprite.fixedToCamera = true;
  }.bind(this);

  this.moveForward = function (steps) {
    // error handler ->
    if (steps === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("moveForward")
      );
      return;
    }
    if (isNaN(steps)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("moveForward")
      );
      return;
    }
    //  <- error handler

    var angle = (this.sprite.angle * Math.PI) / 180;
    var x = steps * Math.cos(angle) + this.sprite.x;
    var y = steps * Math.sin(angle) + this.sprite.y;

    this.sendGameEvent({ api: "moveForward", steps });

    return new Promise(
      function (resolve) {
        this.moveTo(x, y).then(function () {
          resolve();
        });
      }.bind(this)
    );
  }.bind(this);

  this.moveX = function (steps) {
    // error handler ->
    if (steps === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("moveX")
      );
      return;
    }
    if (isNaN(steps)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("moveX")
      );
      return;
    }
    //  <- error handler
    if (steps === 0) {
      return;
    }
    if (this.type === SpriteType.BACKGROUND) {
      this.sprite.tilePosition.x += steps;
    } else {
      var x = this.sprite.x + steps;
      var y = this.sprite.y;
      this.sendGameEvent({ api: "moveX", steps: steps });
      return new Promise(
        function (resolve) {
          this.moveTo(x, y).then(function () {
            resolve();
          });
        }.bind(this)
      );
    }
  }.bind(this);

  this.moveY = function (steps) {
    // error handler ->
    if (steps === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("moveY")
      );
      return;
    }
    if (isNaN(steps)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("moveY")
      );
      return;
    }
    //  <- error handler
    if (steps === 0) {
      return;
    }
    if (this.type === SpriteType.BACKGROUND) {
      this.sprite.tilePosition.y += steps;
    } else {
      var x = this.sprite.x;
      var y = this.sprite.y + steps;
      this.sendGameEvent({ api: "moveY", steps: steps });
      return new Promise(
        function (resolve) {
          this.moveTo(x, y).then(function () {
            resolve();
          });
        }.bind(this)
      );
    }
  }.bind(this);

  this.turn = function (degree) {
    // error handler ->
    if (degree === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("turn")
      );
      return;
    }
    if (isNaN(degree)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("turn")
      );
      return;
    }
    //  <- error handler

    this.sprite.angle += degree;

    this.sendGameEvent({ api: "turn", degree: degree });
  }.bind(this);

  this.turnToSprite = function (spriteName) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (spriteName === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("goToSprite")
      );
      return;
    }
    //  <- error handler

    var targetSprite = this.getSprite(spriteName);
    var point = this.sprite.body.center;
    var targetPoint = targetSprite.sprite.body.center;
    var degree = this.calculateAngle(point, targetPoint);
    this.setDegree(360 - degree);

    this.sendGameEvent({ api: "turnToSprite", spriteName: spriteName });
  }.bind(this);

  this.turnToMousePointer = function () {
    if (!this.sprite.body) {
      return;
    }
    var point = this.sprite.body.center;
    var targetPoint = {
      x: this.game.input.activePointer.x,
      y: this.game.input.activePointer.y,
    };
    var degree = this.calculateAngle(point, targetPoint);
    this.setDegree(360 - degree);

    this.sendGameEvent({ api: "turnToMousePointer" });
  }.bind(this);

  this.setFlipX = function (isFlipped) {
    if (isFlipped === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setFlipX")
      );
      return;
    }
    var x = Math.abs(this.sprite.scale.x);
    x = isFlipped ? -x : x;
    this.sprite.scale.x = x;
    this.sendGameEvent({ api: "setFlipX", isFlipped: isFlipped });
  }.bind(this);

  this.setFlipY = function (isFlipped) {
    if (isFlipped === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setFlipY")
      );
      return;
    }
    var y = Math.abs(this.sprite.scale.y);
    y = isFlipped ? -y : y;
    this.sprite.scale.y = y;
    this.sendGameEvent({ api: "setFlipY", isFlipped: isFlipped });
  }.bind(this);

  this.getFlipX = function () {
    return this.sprite.scale.x < 0;
  }.bind(this);

  this.getFlipX = function () {
    return this.sprite.scale.y < 0;
  }.bind(this);

  this.setHorizontalFlip = function (isFlipped) {
    if (isFlipped === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setHorizontalFlip")
      );
      return;
    }
    var x = Math.abs(this.sprite.scale.x);
    x = isFlipped ? -x : x;
    this.sprite.scale.x = x;
  }.bind(this);

  this.setVerticalFlip = function (isFlipped) {
    if (isFlipped === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setVerticalFlip")
      );
      return;
    }
    var y = Math.abs(this.sprite.scale.y);
    y = isFlipped ? -y : y;
    this.sprite.scale.y = y;
  }.bind(this);

  this.setDegree = function (degree) {
    // error handler ->
    if (degree === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setDegree")
      );
      return;
    }
    if (isNaN(degree)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setDegree")
      );
      return;
    }
    //  <- error handler

    this.sprite.angle = degree;
  }.bind(this);

  this.getDegree = function () {
    return this.sprite.angle;
  }.bind(this);

  this.setMoveSpeed = function (speed) {
    // error handler ->
    if (speed === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setMoveSpeed")
      );
      return;
    }
    if (isNaN(speed)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setMoveSpeed")
      );
      return;
    }
    //  <- error handler

    this.speed = speed;
    this.sendGameEvent({ api: "setMoveSpeed", speed: speed });
  }.bind(this);

  this.getMoveSpeed = function () {
    return this.speed;
  }.bind(this);

  this.goForward = function (steps) {
    // error handler ->
    if (steps === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("goForward")
      );
      return;
    }
    if (isNaN(steps)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("goForward")
      );
      return;
    }
    //  <- error handler

    var angle = (this.sprite.angle * Math.PI) / 180;
    var x = steps * Math.cos(angle) + this.sprite.x;
    var y = steps * Math.sin(angle) + this.sprite.y;

    this.goTo(x, y);
  }.bind(this);

  this.goX = function (steps) {
    // error handler ->
    if (steps === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("goX")
      );
      return;
    }
    if (isNaN(steps)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("goX")
      );
      return;
    }
    //  <- error handler

    if (this.type === SpriteType.BACKGROUND) {
      this.sprite.tilePosition.x += steps;
    } else {
      var x = this.sprite.x + steps;
      var y = this.sprite.y;
      this.goTo(x, y);
    }
    this.sendGameEvent({ api: "goX", steps: steps });
  }.bind(this);

  this.goY = function (steps) {
    // error handler ->
    if (steps === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("goY")
      );
      return;
    }
    if (isNaN(steps)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("goY")
      );
      return;
    }
    //  <- error handler

    if (this.type === SpriteType.BACKGROUND) {
      this.sprite.tilePosition.y += steps;
    } else {
      var x = this.sprite.x;
      var y = this.sprite.y + steps;
      this.goTo(x, y);
    }
    this.sendGameEvent({ api: "goY", steps: steps });
  }.bind(this);

  this.goTo = function (x, y) {
    // error handler ->
    if (x === undefined || y === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("goTo")
      );
      return;
    }
    if (isNaN(x) || isNaN(y)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("goTo")
      );
      return;
    }
    //  <- error handler

    this.sprite.position.x = x;
    this.sprite.position.y = y;
    this.sendGameEvent({ api: "goTo", x: x, y: y });
  }.bind(this);

  this.goToSprite = function (spriteName) {
    // error handler ->
    if (spriteName === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("goToSprite")
      );
      return;
    }
    //  <- error handler

    var targetSprite = this.getSprite(spriteName);
    if (targetSprite) {
      var x = targetSprite.sprite.position.x;
      var y = targetSprite.sprite.position.y;
      this.goTo(x, y);
      this.sendGameEvent({ api: "goToSprite", targetSpriteId: spriteName });
    }
  }.bind(this);

  this.goToMousePointer = function () {
    var x = this.game.input.activePointer.x;
    var y = this.game.input.activePointer.y;
    this.goTo(x, y);
    this.sendGameEvent({ api: "goToMousePointer" });
  }.bind(this);

  this.goToRandom = function () {
    var isHorizontal = this.getWorldWidth() > this.getWorldHeight();
    var x = isHorizontal ? this.getRandom(0, 1280) : this.getRandom(0, 720);
    var y = isHorizontal ? this.getRandom(0, 720) : this.getRandom(0, 1280);
    this.goTo(x, y);
    this.sendGameEvent({ api: "goToRandom" });
  }.bind(this);

  this.setX = function (x) {
    if (x === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setX")
      );
      return;
    }
    if (isNaN(x)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setX")
      );
      return;
    }

    if (this.type === SpriteType.BACKGROUND) {
      this.sprite.tilePosition.x += x;
    } else {
      var x = this.sprite.x + x;
      var y = this.sprite.y;
      this.goTo(x, y);
    }
    this.sendGameEvent({ api: "setX", x });
  }.bind(this);

  this.setY = function (y) {
    if (y === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setY")
      );
      return;
    }
    if (isNaN(y)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setY")
      );
      return;
    }

    if (this.type === SpriteType.BACKGROUND) {
      this.sprite.tilePosition.y += y;
    } else {
      var x = this.sprite.x;
      var y = this.sprite.y + y;
      this.goTo(x, y);
    }
    this.sendGameEvent({ api: "setY", y });
  }.bind(this);

  this.getX = function () {
    return this.sprite.x;
  }.bind(this);

  this.getY = function () {
    return this.sprite.y;
  }.bind(this);

  this.moveTo = function (x, y) {
    // error handler ->
    if (x === undefined || y === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("moveTo")
      );
      return;
    }
    if (isNaN(x) || isNaN(y)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("moveTo")
      );
      return;
    }
    //  <- error handler

    var secs = this.getTimeSec(
      x,
      y,
      this.sprite.position.x,
      this.sprite.position.y
    );
    this.sendGameEvent({ api: "moveTo", x, y });

    return new Promise(
      function (resolve) {
        var tween = this.game.add.tween(this.sprite.position);
        tween.to({ x: x, y: y }, secs * 1000, Phaser.Easing.Linear.None, true);
        tween.onComplete.addOnce(function () {
          resolve();
        });
      }.bind(this)
    );
  }.bind(this);

  this.moveToSprite = function (spriteName) {
    // error handler ->
    if (spriteName === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("moveToSprite")
      );
      return;
    }
    //  <- error handler

    var targetSprite = this.getSprite(spriteName);
    if (targetSprite) {
      this.sendGameEvent({ api: "moveToSprite", spriteName });
      var x = targetSprite.sprite.position.x;
      var y = targetSprite.sprite.position.y;
      return new Promise(
        function (resolve) {
          this.moveTo(x, y).then(function () {
            resolve();
          });
        }.bind(this)
      );
    }
  }.bind(this);

  this.moveToMousePointer = function () {
    this.sendGameEvent({ api: "moveToMousePointer" });
    var x = this.game.input.activePointer.x;
    var y = this.game.input.activePointer.y;
    return new Promise(
      function (resolve) {
        this.moveTo(x, y).then(function () {
          resolve();
        });
      }.bind(this)
    );
  }.bind(this);

  this.moveToRandom = function () {
    this.sendGameEvent({ api: "moveToRandom" });
    var isHorizontal = this.getWorldWidth() > this.getWorldHeight();
    var x = isHorizontal ? this.getRandom(0, 1280) : this.getRandom(0, 720);
    var y = isHorizontal ? this.getRandom(0, 720) : this.getRandom(0, 1280);
    return new Promise(
      function (resolve) {
        this.moveTo(x, y).then(function () {
          resolve();
        });
      }.bind(this)
    );
  }.bind(this);

  this.setDraggable = function (enabled) {
    // error handler ->
    if (enabled === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setDraggable")
      );
      return;
    }
    //  <- error handler

    if (this.sprite.input) {
      if (enabled) {
        this.sprite.input.enableDrag();
        this.sendGameEvent({ api: "setDraggable", enabled: true });
      } else {
        this.sprite.input.disableDrag();
        this.sendGameEvent({ api: "setDraggable", enabled: false });
      }
    }
    this.sprite._drag = enabled;
  }.bind(this);

  this.getDraggable = function () {
    return this.sprite._drag;
  }.bind(this);

  //2.form
  this.say = function (message, sec) {
    if (message === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("say")
      );
      return;
    }
    message = String(message);
    this.stopSay();
    if (sec === undefined) {
      sec = 1;
    }
    var text = "";
    for (var i = 0; i < message.length; i++) {
      text += message.charAt(i);
      if (i !== 0 && i % 12 === 0) {
        text += "\n";
      }
    }
    var style = {
      fill: "#555555",
      font: "32px Arial",
    };

    this.sayBgSprite = this.game.add.sprite(0, 0, "say_bg");
    this.sayBgSprite.visible = false;
    this.sayBgSprite.anchor.set(0.5, 1);
    this.saySprite = this.game.add.text(0, 0, text, style);
    this.saySprite.anchor.set(0.5, 0.5);
    this.saySprite.visible = false;

    if (this.sayTimer) {
      clearTimeout(this.sayTimer);
    }
    if (sec) {
      this.sendGameEvent({ api: "say", message: message, sec: sec });
      this.sayTimer = setTimeout(
        function () {
          this.stopSay();
        }.bind(this),
        sec * 1000
      );
    }
  }.bind(this);

  this.stopSay = function () {
    if (this.saySprite) {
      this.saySprite.kill();
      this.saySprite = undefined;
    }
    if (this.sayBgSprite) {
      this.sayBgSprite.kill();
      this.sayBgSprite = undefined;
    }
  }.bind(this);

  this.playAnimation = function (name, isLoop) {
    if (!this.sprite.body) {
      return;
    }
    if (this.type !== SpriteType.PLAIN && this.type !== SpriteType.SPRITE) {
      return;
    }
    if (!this.asset.spriteAnimations) {
      return;
    }

    // error handler ->
    if (name === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("playAnimation")
      );
      return;
    }
    //  <- error handler

    var spriteAnimations = this.asset.spriteAnimations;
    if (!spriteAnimations[name]) {
      // error handler ->
      this.errorHandler(
        ErrorType.PARAMETER_NOT_FOUND,
        this.getErrorName("playAnimation")
      );
      //  <- error handler

      return;
    }
    var bodySize = spriteAnimations[name].bodySize;
    if (bodySize) {
      this.sprite.body.setSize(
        bodySize[0],
        bodySize[1],
        bodySize[2],
        bodySize[3]
      );
    }
    if (!this.sprite.animations._anims[name]) {
      return;
    }
    this.sprite.animations._anims[name].loop = isLoop;
    this.sprite.animations.play(name);
    this.sendGameEvent({
      api: "playAnimation",
      name,
      isLoop: isLoop,
    });
    if (!isLoop) {
      this.sprite.animations._anims[name].onComplete.addOnce(function () {
        this.sprite.frame = 0;
      }, this);
    }
  }.bind(this);

  this.stopAnimation = function () {
    this.sprite.animations.stop();
    this.sprite.frame = 0;
  }.bind(this);

  this.getCurrentAnimation = function () {
    if (
      this.sprite.animations &&
      this.sprite.animations.currentAnim &&
      this.sprite.animations.currentAnim.isPlaying
    ) {
      return this.sprite.animations.currentAnim.name;
    } else {
      return "";
    }
  }.bind(this);

  this.setSize = function (percent) {
    // error handler ->
    if (percent === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setSize")
      );
      return;
    }
    if (isNaN(percent)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setSize")
      );
      return;
    }
    //  <- error handler

    var x = percent / 100;
    var y = percent / 100;
    if (this.sprite.scale.x < 0) {
      x = (percent / 100) * -1;
    }
    if (this.sprite.scale.y < 0) {
      y = (percent / 100) * -1;
    }

    this.sprite.scale.setTo(x, y);
  }.bind(this);

  this.addSize = function (percent) {
    // error handler ->
    if (percent === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("addSize")
      );
      return;
    }
    if (isNaN(percent)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("addSize")
      );
      return;
    }
    //  <- error handler
    this.setSize(this.getSize() + percent);
  }.bind(this);

  this.getSize = function () {
    return parseInt(Math.abs(this.sprite.scale.x * 100));
  }.bind(this);

  this.show = function () {
    this.sprite.alpha = 1;
    this.sprite.inputEnabled = true;
    this.sendGameEvent({ api: "show" });
    if (this.sprite._drag) {
      this.setDraggable(true);
    }
    // this.sprite.visible = true;
  }.bind(this);

  this.hide = function () {
    this.stopSay();
    this.sprite.alpha = 0;
    this.sprite.inputEnabled = false;
    this.sendGameEvent({ api: "hide" });
    // this.sprite.visible = false;
  }.bind(this);

  this.getX = function () {
    return this.sprite.position.x;
  }.bind(this);

  this.bringToTop = function () {
    this.sprite.bringToTop();
  }.bind(this);

  this.getY = function () {
    return this.sprite.position.y;
  }.bind(this);

  this.setWidth = function (width) {
    if (width === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setWidth")
      );
      return;
    }
    if (isNaN(width)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setWidth")
      );
      return;
    }

    this.sprite.width = width;
    this.sendGameEvent({ api: "setWidth", width });
  }.bind(this);

  this.setHeight = function (height) {
    if (height === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setHeight")
      );
      return;
    }
    if (isNaN(height)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setHeight")
      );
      return;
    }
    this.sprite.height = height;
    this.sendGameEvent({ api: "setHeight", height });
  }.bind(this);

  this.getWidth = function () {
    return this.sprite.width;
  }.bind(this);

  this.getHeight = function () {
    return this.sprite.height;
  }.bind(this);

  this.getWorldWidth = function () {
    return this.game.width;
  }.bind(this);

  this.getWorldHeight = function () {
    return this.game.height;
  }.bind(this);

  this.getMousePointerX = function () {
    return this.game.input.activePointer.x;
  }.bind(this);

  this.getMousePointerY = function () {
    return this.game.input.activePointer.y;
  }.bind(this);

  this.shake = function () {
    this.game.camera.shake(
      0.02,
      200,
      false,
      window.Phaser.Camera.SHAKE_VERTICAL,
      true
    );
    this.sendGameEvent({
      api: "shake",
    });
  }.bind(this);

  this.flash = function () {
    this.game.camera.flash(0xffffff, 200, false);
  }.bind(this);

  // swipe
  this.onSwipe = function (direction, callback) {
    this.swipeHandler[direction] = callback;
  }.bind(this);

  //3.event
  this.onFrame = function (fn) {
    this.gameScene.updateFunctions.push(fn);
  }.bind(this);

  this.onSignal = function (name, callback) {
    this.signalReceiver[name] = callback;
    this.sendGameEvent({
      api: "onSignal",
      name,
    });
  }.bind(this);

  this.sendSignal = function (name) {
    // error handler ->
    if (name === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("sendSignal")
      );
      return;
    }
    //  <- error handler
    this.sendGameEvent({
      api: "sendSignal",
      name,
    });
    this.gameScene.sendSignal(name);
  }.bind(this);

  this.onOut = function (fn) {
    this.sprite.checkWorldBounds = true;
    this.sprite.events.onOutOfBounds.add(fn, this);
  }.bind(this);

  this.onOutStage = function (fn) {
    this.sprite.checkWorldBounds = true;
    this.sprite.events.onOutOfBounds.add(function () {
      this.sendGameEvent({ api: "onOutStage" });
      fn();
    }, this);
  }.bind(this);

  this.changeScene = function (sceneId) {
    // error handler ->
    if (sceneId === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("changeScene")
      );
      return;
    }

    if (!this.game.state.states[sceneId]) {
      this.errorHandler(
        ErrorType.PARAMETER_NOT_FOUND,
        this.getErrorName("changeScene")
      );
    }
    //  <- error handler
    this.stopAllSounds();
    this.game.state.start(sceneId, true, false);
    this.sendGameEvent({ api: "changeScene", name: sceneId });
  }.bind(this);

  this.kill = function () {
    this.stopSay();
    this.sprite.kill();
    this.sendGameEvent({ api: "kill" });
  }.bind(this);

  this.revive = function () {
    this.sprite.revive();
    this.sendGameEvent({ api: "revive" });
  }.bind(this);

  this.clone = function () {
    this.sendGameEvent({ api: "clone" });
    return this.gameScene.cloneSprite(this);
  }.bind(this);

  //4.control
  this.wait = function (secs) {
    // error handler ->
    if (secs === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("wait")
      );
      return;
    }
    if (isNaN(secs)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("wait")
      );
      return;
    }
    //  <- error handler

    //is need?
    secs = secs === 0 ? 0.01 : secs;

    this.sendGameEvent({ api: "wait", secs: secs });

    return new Promise(function (resolve) {
      setTimeout(function () {
        resolve();
      }, secs * 1000);
    });
  }.bind(this);

  //5.perception
  this.onClick = function (fn) {
    this.onClickListener = fn;
  }.bind(this);

  this.onClickUp = function (fn) {
    this.onClickUpListener = fn;
  }.bind(this);

  this.onTouch = function (fn) {
    this.onClickListener = fn;
  }.bind(this);

  this.onTouchUp = function (fn) {
    this.onClickUpListener = fn;
  }.bind(this);

  this.onScreenClick = function (fn) {
    this.onScreenClickListener = fn;
  }.bind(this);

  this.onScreenClickUp = function (fn) {
    this.onScreenClickUpListener = fn;
  }.bind(this);

  this.onKey = function (name, callback) {
    if (name === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("getRandom")
      );
    }
    this.onKeyListener[name] = callback;
  }.bind(this);

  this.onKeyUp = function (name, callback) {
    this.onKeyUpListener[name] = callback;
  }.bind(this);

  //6.operation
  this.getRandom = function (min, max) {
    // error handler ->
    if (min === undefined || max === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("getRandom")
      );
      return;
    }
    if (isNaN(min) || isNaN(max)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("getRandom")
      );
      return;
    }
    //  <- error handler

    min = min ? min : 0;
    max = max ? max : 100;
    this.sendGameEvent({ api: "getRandom", min, max });
    return this.game.rnd.integerInRange(min, max);
  }.bind(this);

  this.getName = function () {
    return this.originalName;
  }.bind(this);

  this.print = function (message) {
    console.log("%c " + message, "background: #555; color: #bada55");
    parent.postMessage({ message: message, source: "wizlab", type: "chatbot" });
  };

  this.input = function (message) {
    this.sendGameEvent({ api: "input", resolved: false });
    return new Promise((resolve) => {
      onclickInputShow(message, (value) => {
        this.sendGameEvent({ api: "input", resolved: true });
        resolve(value);
      });
    });
  }.bind(this);

  //7.parameters
  this.getSprite = function (spriteName) {
    // error handler ->
    if (spriteName === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("getSprite")
      );
      return;
    }
    //  <- error handler

    return this.gameScene.getSprite(spriteName);
  }.bind(this);

  //8.physics
  this.setCollideScene = function (enable) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (enable === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setCollideScene")
      );
      return;
    }
    //  <- error handler

    this.sprite.body.collideWorldBounds = enable;
    this.sendGameEvent({ api: "setCollideScene", enable: enable });
  }.bind(this);

  this.setCollideWorldBounds = function (enable) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (enable === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setCollideWorldBounds")
      );
      return;
    }
    //  <- error handler

    this.sprite.body.collideWorldBounds = enable;
  }.bind(this);

  this.setCollision = function (targetName) {
    // error handler ->
    if (targetName === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setCollision")
      );
      return;
    }
    //  <- error handler

    if (Array.isArray(targetName)) {
      for (var i in targetName) {
        var name = targetName[i];
        this.gameScene.addCollision(this.spriteName, name);
        this.sendGameEvent({ api: "setCollision", targetName: name });
      }
    } else {
      this.gameScene.addCollision(this.spriteName, targetName);
      this.sendGameEvent({ api: "setCollision", targetName: targetName });
    }
  }.bind(this);

  this.setCheckCollision = function (direction, enabled) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (direction === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setCheckCollision")
      );
      return;
    }
    if (enabled === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setCheckCollision")
      );
      return;
    }
    //  <- error handler
    switch (direction) {
      case "up":
        this.sprite.body.checkCollision.up = enabled;
        break;
      case "down":
        this.sprite.body.checkCollision.down = enabled;
        break;
      case "left":
        this.sprite.body.checkCollision.left = enabled;
        break;
      case "right":
        this.sprite.body.checkCollision.right = enabled;
        break;
      default:
        this.errorHandler(
          ErrorType.PARAMETER_NOT_FOUND,
          this.getErrorName("setCheckCollision")
        );
        break;
    }
  }.bind(this);

  this.setCollideSide = function (direction, enabled) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (direction === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setCollideSide")
      );
      return;
    }
    if (enabled === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setCollideSide")
      );
      return;
    }
    //  <- error handler
    switch (direction) {
      case "up":
        this.sprite.body.checkCollision.up = enabled;
        break;
      case "down":
        this.sprite.body.checkCollision.down = enabled;
        break;
      case "left":
        this.sprite.body.checkCollision.left = enabled;
        break;
      case "right":
        this.sprite.body.checkCollision.right = enabled;
        break;
      default:
        this.errorHandler(
          ErrorType.PARAMETER_NOT_FOUND,
          this.getErrorName("setCollideSide")
        );
        break;
    }
  }.bind(this);

  this.onOverlap = function (targetName, fn) {
    // error handler ->
    if (targetName === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("onOverlap")
      );
      return;
    }
    //  <- error handler

    if (Array.isArray(targetName)) {
      for (var i in targetName) {
        var name = targetName[i];
        this.gameScene.addOverlap(this.spriteName, name, fn);
        this.sendGameEvent({ api: "onOverlap", name: name });
      }
    } else {
      this.gameScene.addOverlap(this.spriteName, targetName, fn);
      this.sendGameEvent({ api: "onOverlap", name: targetName });
    }
  }.bind(this);

  this.onOverlapOnce = function (targetName, fn) {
    // error handler ->
    if (targetName === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("onOverlapOnce")
      );
      return;
    }
    //  <- error handler

    if (Array.isArray(targetName)) {
      for (var i in targetName) {
        var name = targetName[i];
        this.gameScene.addOverlapOnce(this.spriteName, name, fn);
        this.sendGameEvent({ api: "onOverlapOnce", name: name });
      }
    } else {
      this.gameScene.addOverlapOnce(this.spriteName, targetName, fn);
      this.sendGameEvent({ api: "onOverlapOnce", name: targetName });
    }
  }.bind(this);

  this.setImmovable = function (enable) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (enable === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setImmovable")
      );
      return;
    }
    //  <- error handler

    this.sprite.body.immovable = enable;
  }.bind(this);

  this.setMovable = function (enable) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (enable === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setMovable")
      );
      return;
    }
    //  <- error handler

    this.sprite.body.immovable = !enable;
    this.sendGameEvent({ api: "setMovable", enable: enable });
  }.bind(this);

  this.getMovable = function () {
    return !this.sprite.body.immovable;
  }.bind(this);

  this.setMass = function (value) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setMass")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setMass")
      );
      return;
    }
    //  <- error handler

    this.sprite.body.mass = value;
  }.bind(this);

  this.getMass = function () {
    return this.sprite.body.mass;
  }.bind(this);

  this.setGravityX = function (value) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setGravityX")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setGravityX")
      );
      return;
    }
    //  <- error handler

    if (this.sprite.body) this.sprite.body.gravity.x = value;
  }.bind(this);

  this.setGravityY = function (value) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setGravityY")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setGravityY")
      );
      return;
    }
    //  <- error handler

    if (this.sprite.body) {
      this.sprite.body.gravity.y = value;
      this.sendGameEvent({ api: "setGravityY", value: value });
    }
  }.bind(this);

  this.getGravityX = function () {
    if (this.sprite.body) {
      return this.sprite.body.gravity.x;
    } else {
      return 0;
    }
  }.bind(this);

  this.getGravityY = function () {
    if (this.sprite.body) {
      return this.sprite.body.gravity.y;
    } else {
      return 0;
    }
  }.bind(this);

  this.setVelocityX = function (value) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setVelocityX")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setVelocityX")
      );
      return;
    }
    //  <- error handler

    if (this.sprite.body) {
      this.sprite.body.velocity.x = value;
      this.sendGameEvent({ api: "setVelocityX", value: value });
    }
  }.bind(this);

  this.setVelocityY = function (value) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setVelocityY")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setVelocityY")
      );
      return;
    }
    //  <- error handler

    if (this.sprite.body) {
      this.sprite.body.velocity.y = value;
      this.sendGameEvent({ api: "setVelocityY", value: value });
    }
  }.bind(this);

  this.getVelocityX = function () {
    if (!this.sprite.body) {
      return 0;
    }
    return this.sprite.body.velocity.x;
  }.bind(this);

  this.getVelocityY = function () {
    if (!this.sprite.body) {
      return 0;
    }
    return this.sprite.body.velocity.y;
  }.bind(this);

  this.getVelocityX = function () {
    return this.sprite.body.velocity.x;
  }.bind(this);

  this.getVelocityY = function () {
    return this.sprite.body.velocity.y;
  }.bind(this);

  this.setBounceX = function (value) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setBounceX")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setBounceX")
      );
      return;
    }
    //  <- error handler

    this.sprite.body.bounce.x = value;
    this.sendGameEvent({ api: "setBounceX", value: value });
  }.bind(this);

  this.setBounceY = function (value) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setBounceY")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setBounceY")
      );
      return;
    }
    //  <- error handler

    this.sprite.body.bounce.y = value;
    this.sendGameEvent({ api: "setBounceY", value: value });
  }.bind(this);

  this.getBounceX = function () {
    if (this.sprite.body) {
      return this.sprite.body.bounce.x;
    } else {
      return 0;
    }
  }.bind(this);

  this.getBounceY = function () {
    if (this.sprite.body) {
      return this.sprite.body.bounce.y;
    } else {
      return 0;
    }
  }.bind(this);

  this.setAccelerationX = function (value) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setAccelerationX")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setAccelerationX")
      );
      return;
    }
    //  <- error handler
    this.sprite.body.acceleration.x = value;
    this.sendGameEvent({ api: "setAccelerationX", value: value });
  }.bind(this);

  this.setAccelerationY = function (value) {
    if (!this.sprite.body) {
      return;
    }
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setAccelerationY")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setAccelerationY")
      );
      return;
    }
    //  <- error handler

    this.sprite.body.acceleration.y = value;
    this.sendGameEvent({ api: "setAccelerationY", value: value });
  }.bind(this);

  this.getAccelerationX = function () {
    return this.sprite.body.acceleration.x;
  }.bind(this);

  this.getAccelerationY = function () {
    return this.sprite.body.acceleration.y;
  }.bind(this);

  //9.sound
  this.playSound = function (name, isLoop) {
    // error handler ->
    if (name === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("playSound")
      );
      return;
    }

    if (!this.gameScene.hasSound(name)) {
      this.errorHandler(
        ErrorType.PARAMETER_NOT_FOUND,
        this.getErrorName("playSound")
      );
      return;
    }
    //  <- error handler
    this.gameScene.playSound(name, isLoop);
    this.sendGameEvent({
      api: "playSound",
      name,
      isLoop,
    });
  }.bind(this);

  this.restartSound = function (name) {
    // error handler ->
    if (name === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("restartSound")
      );
      return;
    }
    if (!this.gameScene.hasSound(name)) {
      this.errorHandler(
        ErrorType.PARAMETER_NOT_FOUND,
        this.getErrorName("restartSound")
      );
    }
    //  <- error handler

    this.gameScene.restartSound(name);
  }.bind(this);

  this.stopSound = function (name) {
    // error handler ->
    if (name === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("stopSound")
      );
      return;
    }
    if (!this.gameScene.hasSound(name)) {
      this.errorHandler(
        ErrorType.PARAMETER_NOT_FOUND,
        this.getErrorName("stopSound")
      );
    }
    //  <- error handler

    this.gameScene.stopSound(name);
  }.bind(this);

  this.pauseSound = function (name) {
    // error handler ->
    if (name === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("pauseSound")
      );
      return;
    }
    if (!this.gameScene.hasSound(name)) {
      this.errorHandler(
        ErrorType.PARAMETER_NOT_FOUND,
        this.getErrorName("pauseSound")
      );
    }
    //  <- error handler

    this.gameScene.pauseSound(name);
    this.sendGameEvent({ api: "pauseSound", name: name });
  }.bind(this);

  this.resumeSound = function (name) {
    // error handler ->
    if (name === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("resumeSound")
      );
      return;
    }
    if (!this.gameScene.hasSound(name)) {
      this.errorHandler(
        ErrorType.PARAMETER_NOT_FOUND,
        this.getErrorName("resumeSound")
      );
    }
    //  <- error handler

    this.gameScene.resumeSound(name);
    this.sendGameEvent({ api: "resumeSound", name: name });
  }.bind(this);

  this.stopAllSounds = function () {
    this.game.sound.stopAll();
  }.bind(this);

  this.setSoundVolume = function (value) {
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setSoundVolume")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("setSoundVolume")
      );
      return;
    }
    //  <- error handler

    var systemVolume = this.game.systemVolume ? this.game.systemVolume : 100;
    var newVolume = value;
    newVolume = newVolume < 0 ? 0 : newVolume;
    newVolume = newVolume > 1 ? 1 : newVolume;
    this.game.gameVolume = newVolume;
    this.game.sound.volume = (this.game.gameVolume * systemVolume) / 100;
  }.bind(this);

  this.addSoundVolume = function (value) {
    // error handler ->
    if (value === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("addSoundVolume")
      );
      return;
    }
    if (isNaN(value)) {
      this.errorHandler(
        ErrorType.PARAMETER_INVALID_TYPE,
        this.getErrorName("addSoundVolume")
      );
      return;
    }
    //  <- error handler};

    var newVolume = this.game.gameVolume + value;
    this.setSoundVolume(newVolume);
  }.bind(this);

  this.getSoundVolume = function () {
    return this.game.gameVolume;
  }.bind(this);

  this.setText = function (text) {
    // error handler ->
    if (text === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setText")
      );
      return;
    }
    //  <- error handler

    if (this.type === SpriteType.TEXT) {
      text = text.toString();
      this.sprite.text = text;
      this.sendGameEvent({ api: "setText", text: text });
    }
  }.bind(this);

  this.getText = function () {
    if (this.type === SpriteType.TEXT) {
      this.sendGameEvent({ api: "getText" });
      return this.sprite.text;
    } else {
      return undefined;
    }
  }.bind(this);

  this.appendText = function (text) {
    // error handler ->
    if (text === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("appendText")
      );
      return;
    }
    //  <- error handler

    if (this.type === SpriteType.TEXT) {
      this.sprite.text = this.getText() + text;
      this.sendGameEvent({ api: "appendText", text: text });
    }
  }.bind(this);

  this.clearText = function () {
    if (this.type === SpriteType.TEXT) {
      this.sprite.text = "";
      this.sendGameEvent({ api: "clearText" });
    }
  }.bind(this);

  this.setTextColor = function (color) {
    if (color === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setTextColor")
      );
      return;
    }
    if (HTML_Colors[color]) {
      color = HTML_Colors[color];
    }
    if (this.type === SpriteType.TEXT) {
      this.sprite.addColor(color, 0);
    }
  }.bind(this);

  this.setRandomTextColor = function () {
    var rndColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
    this.setTextColor(rndColor);
  }.bind(this);

  this.getTextColor = function () {
    if (this.type === SpriteType.TEXT) {
      if (this.sprite.colors[0]) {
        return this.sprite.colors[0];
      } else {
        return this.sprite.style.fill;
      }
    }
  }.bind(this);

  //date
  this.getYear = function () {
    return new Date().getFullYear();
  }.bind(this);

  this.getMonth = function () {
    return new Date().getMonth() + 1;
  }.bind(this);

  this.getDay = function () {
    return new Date().getDate();
  }.bind(this);

  this.getHour = function () {
    return new Date().getHours();
  }.bind(this);

  this.getMin = function () {
    return new Date().getMinutes();
  }.bind(this);

  this.getSec = function () {
    return new Date().getSeconds();
  }.bind(this);

  this.startTimer = function () {
    this.sendGameEvent({ api: "startTimer" });
    this.gameScene.startTimer();
  }.bind(this);

  this.pauseTimer = function () {
    this.sendGameEvent({ api: "pauseTimer" });
    this.gameScene.pauseTimer();
  }.bind(this);

  this.resumeTimer = function () {
    this.sendGameEvent({ api: "resumeTimer" });
    this.gameScene.resumeTimer();
  }.bind(this);

  this.resetTimer = function () {
    this.sendGameEvent({ api: "resetTimer" });
    this.gameScene.resetTimer();
  }.bind(this);

  this.getTimer = function () {
    this.sendGameEvent({ api: "getTimer" });
    return this.gameScene.getTimer();
  }.bind(this);

  this.isClickedSprite = function () {
    return this.isClicked;
  }.bind(this);

  this.isPressedKey = function (key) {
    if (this.gameScene.pressedKeys[key]) {
      return true;
    } else {
      return false;
    }
  }.bind(this);

  this.isClickedMouse = function () {
    return this.game.input.activePointer.isDown;
  }.bind(this);

  this.isOverlapped = function (targetName) {
    // error handler ->
    if (targetName === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("isOverlapped")
      );
      return;
    }
    //  <- error handler

    return this.gameScene.isOverlapped(this.sprite, targetName);
  }.bind(this);

  //joystick
  this.onJoystick = function (callback) {
    if (this.subtype === "analog") {
      this.joystickCallback = callback;
    }
  }.bind(this);

  this.onDpad = function (callback) {
    if (this.subtype === "dpad") {
      this.dpadCallback = callback;
    }
  }.bind(this);

  this.setVelocityFromDegree = function (degree, force, maxSpeed) {
    if (!this.sprite.body) {
      return;
    }
    var rotation = (degree * Math.PI) / 180;
    this.game.physics.arcade.velocityFromRotation(
      rotation,
      force * maxSpeed,
      this.sprite.body.velocity
    );

    if (degree !== this.prevDegreeForVFD && force !== this.prevForceForVFD) {
      this.prevDegreeForVFD = degree;
      this.prevForceForVFD = force;
      this.sendGameEvent({
        api: "setVelocityFromDegree",
        degree: degree,
        force: force,
        maxSpeed: maxSpeed,
      });
    }
  }.bind(this);

  this.setAccelerationFromDegree = function (degree, force, maxSpeed) {
    if (!this.sprite.body) {
      return;
    }
    var rotation = (degree * Math.PI) / 180;
    this.game.physics.arcade.accelerationFromRotation(
      rotation,
      force * maxSpeed,
      this.sprite.body.acceleration
    );
  }.bind(this);

  /*** pen */
  this.startPen = function () {
    if (!this.pen) {
      //add graphics
      var pen = this.game.add.graphics(0, 0);
      //disable input
      pen.inputEnabled = false;
      //add to sprite group
      this.gameScene.spriteGroup.add(pen);

      //depth sorting
      pen.z = this.sprite.z - 1;
      var groupChildren = this.gameScene.spriteGroup.children;
      for (var i = pen.z; i < groupChildren.length; i++) {
        groupChildren[i].z = groupChildren[i].z + 1;
      }
      this.gameScene.spriteGroup.sort("z", Phaser.Group.SORT_ASCENDING);

      //set default values
      this.pen = pen;
      this.pen.lineStyle(this.penSize, this.penColor, 1);
      this.pen.moveTo(this.sprite.position.x, this.sprite.position.y);
    } else {
      this.pen.lineStyle(this.penSize, this.penColor, 1);
    }
  }.bind(this);

  this.endPen = function () {
    if (this.pen) {
      this.pen = undefined;
      // this.pen.lineStyle(0, 0, 0);
      this.sendGameEvent({ api: "endPen" });
    }
  }.bind(this);

  this.setPenColor = function (color) {
    // error handler ->
    if (color === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setPenColor")
      );
      return;
    }
    //  <- error handler

    if (HTML_Colors[color]) {
      color = HTML_Colors[color];
    }
    color = color.replace("#", "0x");
    this.penColor = color;
    if (this.pen) {
      this.pen.lineStyle(this.penSize, this.penColor, 1);

      this.sendGameEvent({ api: "setPenColor" });
    }
  }.bind(this);

  this.setRandomPenColor = function () {
    var colorKeys = Object.keys(HTML_Colors);
    var rnd = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    // var rndColor = "#" + Math.floor(Math.random() * 16777215).toString(16);

    this.setPenColor(HTML_Colors[rnd]);
  }.bind(this);

  this.getPenColor = function () {
    if (this.pen) {
      var color = String(this.pen.lineColor);
      color = color.replace("0x", "#");
      return color;
    }
  }.bind(this);

  this.setPenSize = function (size) {
    // error handler ->
    if (size === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("setPenSize")
      );
      return;
    }
    //  <- error handler

    this.penSize = size;
    if (this.pen) {
      this.pen.lineStyle(this.penSize, this.penColor, 1);
    }
  }.bind(this);

  this.getPenSize = function () {
    return this.penSize;
  }.bind(this);

  this.addPenSize = function (size) {
    if (size === undefined) {
      this.errorHandler(
        ErrorType.PARAMETER_UNDEFINED,
        this.getErrorName("addPenSize")
      );
      return;
    }
    this.setPenSize(this.penSize + size);
  }.bind(this);

  this.erasePen = function () {
    for (var i = this.gameScene.spriteGroup.children.length - 1; i >= 0; i--) {
      var child = this.gameScene.spriteGroup.children[i];
      if (child.lineAlpha) {
        child.clear();
        child.destroy();
        this.gameScene.spriteGroup.remove(child);
      }
    }
    if (this.pen) {
      var penStarted = this.pen.lineAlpha;
      this.pen.clear();
      this.pen.destroy();
      this.pen = undefined;
      if (penStarted) {
        this.startPen();
      }
    }
    this.sendGameEvent({ api: "erasePen" });
  }.bind(this);

  this.saveScore = function (score) {
    // if (this.subtype === "ranking") {
    this.sendMessageToParent({ type: "saveScore", data: score });
    this.sendGameEvent({ api: "saveScore", score: score });
    // }
  }.bind(this);

  this.showRanking = function () {
    // if (this.subtype === "ranking") {
    this.sendMessageToParent({ type: "showRanking" });
    this.sendGameEvent({ api: "showRanking" });
    // }
  }.bind(this);

  this.showRankingAscending = function () {
    // if (this.subtype === "ranking") {
    this.sendMessageToParent({ type: "showRankingAscending" });
    // }
  }.bind(this);

  this.hideRanking = function () {
    // if (this.subtype === "ranking") {
    this.sendMessageToParent({ type: "hideRanking" });
    // }
  }.bind(this);

  this.vibrate = function () {
    this.sendMessageToParent({ type: "vibrate" });
  }.bind(this);

  this.onGyro = function (fn) {
    this.onGyroListener = fn;
    this.sendMessageToParent({ type: "onGyro" });
  }.bind(this);

  this.startListening = function () {
    this.sendMessageToParent({ type: "startListening" });
  }.bind(this);

  this.onListening = function (fn) {
    this.onListeningListener = fn;
  }.bind(this);

  this.onShake = function (fn) {
    this.sendMessageToParent({ type: "onShake" });
    this.onShakeListener = fn;
  }.bind(this);

  this.translate = function (text, lang, callback) {
    var param = { text: text, lang: lang };
    fetch(TRANSLATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(param),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        callback(json.text);
      });
  };

  this.speak = function (msg) {
    this.sendMessageToParent({ type: "speak", data: msg });
  }.bind(this);

  //camera
  this.openCamera = function (facing) {
    if (
      this.asset &&
      this.asset.type === "component" &&
      this.asset.subtype === "camera"
    ) {
      var x =
        ((this.sprite.x - this.getWidth() / 2) / this.getWorldWidth()) * 100;
      var y =
        ((this.sprite.y - this.getHeight() / 2) / this.getWorldHeight()) * 100;
      var width = (this.getWidth() / this.getWorldWidth()) * 100;
      if (facing !== "back") {
        facing = "front";
      }
      this.sendMessageToParent({
        type: "openCamera",
        data: { x: x, y: y, width: width, facing: facing },
      });
    }
  }.bind(this);

  this.closeCamera = function () {
    if (
      this.asset &&
      this.asset.type == "component" &&
      this.asset.subtype == "camera"
    ) {
      this.sendMessageToParent({ type: "closeCamera" });
    } else {
    }
  }.bind(this);

  this.switchCamera = function () {
    if (
      this.asset &&
      this.asset.type == "component" &&
      this.asset.subtype == "camera"
    ) {
      this.sendMessageToParent({ type: "switchCamera" });
    } else {
    }
  }.bind(this);

  this.onFaceDetect = function (fn) {
    if (
      this.asset &&
      this.asset.type == "component" &&
      this.asset.subtype == "camera"
    ) {
      this.onFaceDetectListener = fn;
    } else {
    }
  }.bind(this);

  this.loadGameData = function (fn) {
    this.onLoadGameDataListener = fn;

    if (this.loadTimer) {
      clearTimeout(this.loadTimer);
    }

    this.loadTimer = setTimeout(
      function () {
        this.sendMessageToParent({ type: "loadGameData" });
      }.bind(this),
      1000
    );
  }.bind(this);

  this.saveGameData = function (fn) {
    this.onSaveGameDataListener = fn;

    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }

    this.saveTimer = setTimeout(
      function () {
        this.sendMessageToParent({
          type: "saveGameData",
          data: JSON.stringify(serverData),
        });
      }.bind(this),
      1000
    );
  }.bind(this);

  this.resetGameData = function (fn) {
    this.onResetGameDataListener = fn;
    this.sendMessageToParent({ type: "resetGameData" });
  }.bind(this);

  this.server = {
    data: serverData,
    load: this.loadGameData,
    save: this.saveGameData,
    reset: this.resetGameData,
  };

  this.socket = {
    connect: function (fn) {
      this.socketManager.connect(fn);
    }.bind(this),

    disconnect: function () {
      this.socketManager.disconnect();
    }.bind(this),

    isConnected: function () {
      return this.socketManager.isConnected();
    }.bind(this),

    emit: function (data) {
      this.socketManager.emit(data);
    }.bind(this),

    onReceive: function (fn) {
      this.socketManager.onReceive = fn;
    }.bind(this),

    getData: function (fn) {
      this.socketManager.getData(fn);
    }.bind(this),

    setData: function (data) {
      this.socketManager.setData(data);
    }.bind(this),

    joinRoom: function (roomId) {
      this.socketManager.joinRoom(roomId);
    }.bind(this),

    leaveRoom: function (roomId) {
      this.socketManager.leaveRoom(roomId);
    }.bind(this),

    emitRoom: function (roomId, data) {
      this.socketManager.emitRoom(roomId, data);
    }.bind(this),
  };
}
