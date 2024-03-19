import Context from "./context";
import Line from "./line";
import { STATE, GRAMMAR, BLOCK } from "./type";

class Block {
  constructor(props = {}) {
    this.id = props.id || Context.generateId();
    this.parent = props.parent;
    this.state = props.state;
    this.grammar = props.grammar;
    this.data = props.data;
    this.children = props.children;
  }

  get type() {
    return "Block";
  }
  get category() {
    return null;
  }

  clone(parent) {
    const clone = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this
    );
    clone.id = Context.generateId();
    clone.parent = parent;
    clone.children =
      clone.children && this.children.map((child) => child.clone(clone));
    return clone;
  }
  isEqual(block) {
    if (!(block instanceof Block)) {
      return false;
    }

    return this.type === block.type && this.data === block.data;
  }

  createInstanceBlockWith(prototypeBlock) {
    const instanceBlock = Object.assign(
      Object.create(Object.getPrototypeOf(prototypeBlock)),
      prototypeBlock
    );
    instanceBlock.id = Context.generateId();
    instanceBlock.state = STATE.INSTANCE;
    instanceBlock.parent = this.parent;
    instanceBlock.grammar = instanceBlock.getGrammarFor(this.parent);
    instanceBlock.children = instanceBlock.getDefaultChildren();
    return instanceBlock;
  }
  getGrammarFor(parent) {
    // inherit
  }
  getDefaultChildren() {
    // inherit
    return [];
  }
  isCompatibleWith(instanceBlock) {
    if (!this.children || this.children.length < 1) return true;

    if (this.children.length !== instanceBlock.children.length) return false;

    for (let i in this.children) {
      const childToMaintain = this.children[i];
      if (!childToMaintain.data) continue;
      if (
        !instanceBlock.children[i].checkBlockReplaceable(childToMaintain) ||
        childToMaintain.isDisabledFor(instanceBlock.children[i])
      ) {
        return false;
      }
    }

    if (this.children[0] instanceof Action) {
      const action = this.children[0];
      const objectives = action.children || [];
      action.parent = instanceBlock;
      for (let i in objectives) {
        const objective = objectives[i];
        if (!objective.data) continue;
        if (!objective.checkBlockReplaceable(objective)) {
          action.parent = this;
          return false;
        }
      }
      action.parent = this;
    }

    return true;
  }
  coverWith(instanceBlock) {
    if (this.parent instanceof Line) {
      this.parent.block = instanceBlock;
    } else {
      for (let i in this.parent.children) {
        if (this.parent.children[i] === this) {
          this.parent.children[i] = instanceBlock;
        }
      }
    }
    return instanceBlock;
  }
  replaceWith(instanceBlock) {
    if (this.parent instanceof Line) {
      this.parent.block = instanceBlock;
    } else {
      for (let i in this.parent.children) {
        if (this.parent.children[i] === this) {
          this.parent.children[i] = instanceBlock;
        }
      }
    }
    if (this.children && this.children.length > 0) {
      instanceBlock.children = this.children;
      for (let i in instanceBlock.children) {
        instanceBlock.children[i].parent = instanceBlock;
      }
    }
    return instanceBlock;
  }

  static getPrototypeBlocks() {
    return [];
  }
  filterPrototypeBlocksReplaceable(prototypeBlocks) {
    return prototypeBlocks.filter((block) => this.checkBlockReplaceable(block));
  }
  checkBlockReplaceable(block) {
    if (!this.parent.isAvailableParentFor(block)) {
      return false;
    }
    if (this.parent instanceof Line) {
      return this.parent.checkAvailableForRootBlock(block);
    } else if (this.parent instanceof Block) {
      const childIndex = this.parent.children.indexOf(this);
      return this.parent.checkChildAvailableAtIndex(block, childIndex);
    }
  }
  checkChildAvailableAtIndex(child, index) {
    if (child instanceof Operator) {
      if (this instanceof Operator) {
        return false;
      }
      const operatorTypes = child.getOperatorTypes();
      const finalChildTypes = this.getFinalChildTypesAt(index);
      for (let i in finalChildTypes) {
        if (operatorTypes.includes(finalChildTypes[i])) {
          return true;
        }
      }
      return false;
    } else {
      const availableChildTypes = this.getAvailableChildTypesAt(index);
      for (let i in availableChildTypes) {
        if (child instanceof availableChildTypes[i]) {
          return true;
        }
      }
      return false;
    }
  }
  getAvailableChildTypesAt(index, grammar) {
    return [];
  }
  getFinalChildTypesAt(index) {
    return [];
  }
  isAvailableParentFor(block) {
    const availableParentTypes = block.getAvailableParentTypes();
    for (let i in availableParentTypes) {
      if (this instanceof availableParentTypes[i]) {
        return true;
      }
    }
    return false;
  }
  getAvailableParentTypes() {
    return [Line, Block];
  }

  filterPrototypeBlocksDisabled(prototypeBlocks) {
    return prototypeBlocks.filter((block) => block.isDisabledFor(this));
  }
  isDisabledFor(block) {
    return false;
  }

  findChild(where) {
    if (!this.children) return;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child.match(where)) {
        return child;
      }
    }
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      const grandChild = child.findChild(where);
      if (grandChild) {
        return grandChild;
      }
    }
  }
  findParent(where) {
    if (!this.parent) return;
    if (this.parent.match(where)) {
      return this.parent;
    } else {
      return this.parent.findParent(where);
    }
  }
  findNextEmptyBlock() {
    const whereEmpty = { type: BLOCK.BLOCK };
    const parentLine = this.getParentLine();
    const blocks = [];
    Context.traverse(parentLine, {
      onBlock(block) {
        if (block.match(whereEmpty)) {
          blocks.push(block);
        }
      },
    });
    if (blocks.length > 0) {
      return blocks[0];
    } else {
      const nextLine = parentLine.getNextDisplayLine();
      if (nextLine.block instanceof Block) {
        return nextLine.block;
      } else {
        return;
      }
    }
  }
  match(where) {
    const { type, id, state, grammar, data } = where;
    if (type && type !== this.type) return false;
    if (id && id !== this.id) return false;
    if (state && state !== this.state) return false;
    if (grammar && grammar !== this.grammar) return false;
    if (data && data !== this.data) return false;
    return true;
  }
  getParentLine() {
    return this.findParent({ type: "Line" });
  }
  getParentContext() {
    return this.findParent({ type: "Context" });
  }

  static getConstructorByName(name) {
    return {
      Block: Block,
      GameObject: GameObject,
      Sprite: Sprite,
      Screen: Screen,
      Joystick: Joystick,
      DPad: DPad,
      Text: Text,
      Sound: Sound,
      Property: Property,
      Action: Action,
      Constant: Constant,
      NumberBlock: NumberBlock,
      StringBlock: StringBlock,
      BooleanBlock: BooleanBlock,
      Key: Key,
      Direction: Direction,
      Animation: Animation,
      Position: Position,
      Touch: Touch,
      Random: Random,
      Scene: Scene,
      Axis: Axis,
      Time: Time,
      Util: Util,
      Mobile: Mobile,
      Ranking: Ranking,
      Timer: Timer,
      Variable: Variable,
      Operator: Operator,
      Callback: Callback,
      FunctionBlock: FunctionBlock,
    }[name];
  }
  static getCompatibleJSONFrom(json, parent) {
    const compatibleJSON = {
      constructor: json.constructor,
      state: json.state,
      grammar: json.grammar,
      data: json.data,
      children: json.children,
    };
    if (json.blockType) {
      compatibleJSON.constructor =
        json.blockType[0].toUpperCase() +
        json.blockType.slice(1, json.blockType.length);
    }
    if (json.blockType === "sprite") {
      compatibleJSON.constructor =
        json.dataType[0].toUpperCase() +
        json.dataType.slice(1, json.dataType.length);
    }
    if (
      json.blockType === "util" &&
      ["if", "else if", "else", "repeat"].includes(json.data)
    ) {
      compatibleJSON.grammar = GRAMMAR.PHRASE;
    }
    if (json.blockType === "constant") {
      if (parent instanceof Action && parent.data === "playAnimation") {
        compatibleJSON.constructor = BLOCK.ANIMATION;
      } else if (["up", "down", "left", "right"].includes(json.data)) {
        compatibleJSON.constructor = BLOCK.DIRECTION;
      } else if (["x", "y"].includes(json.data)) {
        compatibleJSON.constructor = BLOCK.AXIS;
      } else if (json.data === "touch") {
        compatibleJSON.constructor = BLOCK.TOUCH;
      } else if (json.data === "random") {
        compatibleJSON.constructor = BLOCK.RANDOM;
      } else if (json.data instanceof Object) {
        compatibleJSON.constructor = BLOCK.POSITION;
      } else if (["true", "false"].includes(json.data)) {
        compatibleJSON.constructor = BLOCK.BOOLEANBLOCK;
      } else if (isNaN(json.data)) {
        compatibleJSON.constructor = BLOCK.STRINGBLOCK;
      } else {
        compatibleJSON.constructor = BLOCK.NUMBERBLOCK;
      }
    }
    if (json.childs) {
      compatibleJSON.children = json.childs;
    }
    if (json.mode) {
      compatibleJSON.state = json.mode;
    }
    if (compatibleJSON.constructor === BLOCK.CALLBACK && json.data) {
      compatibleJSON.children = json.data;
    }
    return compatibleJSON;
  }
  static fromJSON(json, parent) {
    const compatibleJSON = Block.getCompatibleJSONFrom(json, parent);
    const constructorName = compatibleJSON.constructor;
    const Constructor = Block.getConstructorByName(constructorName) || Block;
    const block = new Constructor({
      ...compatibleJSON,
      state: STATE.INSTANCE,
      parent,
    });
    if (compatibleJSON.children) {
      if (constructorName === BLOCK.CALLBACK) {
        block.children = compatibleJSON.children.map((child) =>
          Line.fromJSON(child, block)
        );
      } else {
        block.children = compatibleJSON.children.map((child) =>
          Block.fromJSON(child, block)
        );
      }
    }
    return block;
  }
  toJSON() {
    return {
      constructor: this.type,
      grammar: this.grammar,
      data: this.data,
      children: this.children
        ? this.children.map((child) => child.toJSON())
        : undefined,
    };
  }
  toJavascript() {
    return "";
  }
  linesToJavascript(lines) {
    let code = "";
    for (let i in lines) {
      const line = lines[i];
      const lineCode = line.toJavascript();
      if (lineCode) {
        if (code !== "") {
          code += "\n";
        }
        code += "\t";
        code += lineCode;
      }
    }
    return code;
  }
}

export class GameObject extends Block {
  get type() {
    return "GameObject";
  }
  get category() {
    return "GameObject";
  }

  getGrammarFor(parent) {
    if (parent instanceof Line) {
      return GRAMMAR.SUBJECT;
    } else {
      return GRAMMAR.OBJECTIVE;
    }
  }
  getDefaultChildren() {
    if (this.grammar === GRAMMAR.SUBJECT) {
      return [new Block({ state: STATE.INSTANCE, parent: this })];
    } else {
      return [];
    }
  }

  static getPrototypeBlocks(gameObjects) {
    const prototypeBlocks = [];
    for (let i in gameObjects) {
      const gameObject = gameObjects[i];
      let prototypeBlock;
      switch (gameObject.type) {
        case "sprite":
        case "spine":
        case "custom":
          prototypeBlock = Sprite.getPrototypeBlock(gameObject);
          break;
        case "text":
          prototypeBlock = Text.getPrototypeBlock(gameObject);
          break;
        case "component":
          if (gameObject.subtype === "dpad") {
            prototypeBlock = DPad.getPrototypeBlock(gameObject);
          } else {
            prototypeBlock = Joystick.getPrototypeBlock(gameObject);
          }
          break;
        case "background":
          prototypeBlock = Screen.getPrototypeBlock(gameObject);
          break;
        case "sound":
          prototypeBlock = Sound.getPrototypeBlock(gameObject);
          break;
        default:
          continue;
      }
      prototypeBlocks.push(prototypeBlock);
    }
    return prototypeBlocks;
  }
  getAvailableChildTypesAt(index) {
    if (this.grammar === GRAMMAR.SUBJECT) {
      return [Property, Action, Util];
    } else if (this.grammar === GRAMMAR.OBJECTIVE) {
      return [Property, Util];
    } else {
      return [];
    }
  }

  toJavascript() {
    if (this.grammar === GRAMMAR.SUBJECT) {
      const child = this.children[0];
      const childCode = child.toJavascript();
      return `getSprite("${this.data}")${childCode}`;
    } else if (this.grammar === GRAMMAR.OBJECTIVE) {
      const child = this.children && this.children[0];
      if (child) {
        const childCode = child.toJavascript();
        return `getSprite("${this.data}")${childCode}`;
      } else {
        if (this.parent.type === BLOCK.ACTION && this.parent.data === "set") {
          return `getSprite("${this.data}")`;
        } else {
          return `"${this.data}"`;
        }
      }
    }
  }
}
export class Sprite extends GameObject {
  get type() {
    return "Sprite";
  }
  get category() {
    return "GameObject";
  }

  getDefaultChildren() {
    if (this.grammar === GRAMMAR.OBJECTIVE) {
      if (
        this.parent instanceof Action &&
        this.parent.data === "set" &&
        this.parent.parent instanceof Variable
      ) {
        return [new Block({ state: STATE.INSTANCE, parent: this })];
      }
    } else {
      return super.getDefaultChildren();
    }
  }

  static getPrototypeBlock(sprite) {
    return new Sprite({ data: sprite.name, state: STATE.PROTOTYPE });
  }
  getAnimationIds() {
    const context = this.getParentContext();
    if (!context) return [];
    const gameObjectInfo = context.getGameObjectInfoWithName(this.data);
    if (!gameObjectInfo) return [];
    const animationIds = gameObjectInfo.animationIds || [];
    return animationIds;
  }
}
export class Screen extends GameObject {
  get type() {
    return "Screen";
  }
  get category() {
    return "GameObject";
  }

  static getPrototypeBlock(screen) {
    return new Screen({ data: screen.name, state: STATE.PROTOTYPE });
  }
}
export class Joystick extends GameObject {
  get type() {
    return "Joystick";
  }
  get category() {
    return "GameObject";
  }

  static getPrototypeBlock(joystick) {
    return new Joystick({ data: joystick.name, state: STATE.PROTOTYPE });
  }
}
export class DPad extends GameObject {
  get type() {
    return "DPad";
  }
  get category() {
    return "GameObject";
  }

  static getPrototypeBlock(dPad) {
    return new DPad({ data: dPad.name, state: STATE.PROTOTYPE });
  }
}
export class Text extends GameObject {
  get type() {
    return "Text";
  }
  get category() {
    return "GameObject";
  }

  static getPrototypeBlock(text) {
    return new Text({ data: text.name, state: STATE.PROTOTYPE });
  }
}
export class Sound extends GameObject {
  get type() {
    return "Sound";
  }
  get category() {
    return "GameObject";
  }

  static getPrototypeBlock(sound) {
    return new Sound({ data: sound.name, state: STATE.PROTOTYPE });
  }

  toJavascript() {
    const child = this.children[0];
    const childCode = child.toJavascript();
    return childCode;
  }
}

export class Property extends Block {
  get type() {
    return "Property";
  }
  get category() {
    return "Property";
  }

  getGrammarFor(parent) {
    return parent.grammar;
  }
  getDefaultChildren() {
    if (this.grammar === GRAMMAR.SUBJECT) {
      return [new Block({ state: STATE.INSTANCE, parent: this })];
    } else {
      return [];
    }
  }

  static getPrototypeBlocks() {
    const prototypeBlocks = [];
    const propertyNames = Property.getPropertyNames();
    for (let i = 0; i < propertyNames.length; i++) {
      const propertyName = propertyNames[i];
      prototypeBlocks.push(
        new Property({ data: propertyName, state: STATE.PROTOTYPE })
      );
    }
    return prototypeBlocks;
  }
  static getPropertyNames() {
    return [
      "text",
      "x",
      "y",
      "width",
      "height",
      "size",
      "degree",
      "mass",
      "moveSpeed",
      "draggable",
      "movable",
      "flipX",
      "flipY",
      "velocityX",
      "velocityY",
      "gravityX",
      "gravityY",
      "bounceX",
      "bounceY",
      "accelerationX",
      "accelerationY",
    ];
  }
  getAvailableChildTypesAt() {
    return [Action];
  }
  getAvailableParentTypes() {
    switch (this.data) {
      case "text":
        return [Text, Variable];
      case "x":
      case "y":
        return [Sprite, Text, Screen, Joystick, DPad, Variable];
      case "width":
      case "height":
        return [Sprite, Text, Joystick, DPad, Variable];
      case "size":
      case "degree":
      case "mass":
      case "moveSpeed":
      case "draggable":
      case "movable":
      case "flipX":
      case "flipY":
      case "velocityX":
      case "velocityY":
      case "gravityX":
      case "gravityY":
      case "bounceX":
      case "bounceY":
      case "accelerationX":
      case "accelerationY":
        return [Sprite, Text, Variable];
      default:
        return [];
    }
  }

  getPropertyType() {
    switch (this.data) {
      case "text":
        return [StringBlock, Time];
      case "draggable":
      case "movable":
      case "flipX":
      case "flipY":
        return [BooleanBlock];
      case "x":
      case "y":
      case "width":
      case "height":
      case "size":
      case "degree":
      case "mass":
      case "moveSpeed":
      case "velocityX":
      case "velocityY":
      case "gravityX":
      case "gravityY":
      case "bounceX":
      case "bounceY":
      case "accelerationX":
      case "accelerationY":
        return [NumberBlock];
      default:
        return [];
    }
  }

  toJavascript() {
    if (this.grammar === GRAMMAR.SUBJECT) {
      const child = this.children[0];
      if (child instanceof Action && child.data === "set") {
        const childCode = child.toJavascript();
        return childCode;
      } else {
        return;
      }
    } else if (this.grammar === GRAMMAR.OBJECTIVE) {
      const upperCased = this.data[0].toUpperCase() + this.data.slice(1);
      return `.get${upperCased}()`;
    }
  }
}

export class Action extends Block {
  get type() {
    return "Action";
  }
  get category() {
    return "Action";
  }

  getGrammarFor() {
    return GRAMMAR.VERB;
  }
  getDefaultChildren() {
    switch (this.data) {
      case "set":
      case "say":
      case "playAnimation":
      case "moveTo":
      case "goTo":
      case "turnTo":
      case "turn":
      case "addSize":
      case "wait":
      case "setCollision":
      case "changeScene":
      case "sendSignal":
      case "saveScore":
        return [new Block({ state: STATE.INSTANCE, parent: this })];
      case "onTouch":
      case "onTouchUp":
      case "onOut":
      case "onFrame":
      case "onShake":
      case "speak":
        return [new Callback({ state: STATE.INSTANCE, parent: this })];
      case "go":
      case "move":
      case "bind":
        return [
          new Block({ state: STATE.INSTANCE, parent: this }),
          new Block({ state: STATE.INSTANCE, parent: this }),
        ];
      case "onSwipe":
      case "onOverlap":
      case "onOverlapOnce":
      case "onKey":
      case "onKeyUp":
      case "onSignal":
        return [
          new Block({ state: STATE.INSTANCE, parent: this }),
          new Callback({ state: STATE.INSTANCE, parent: this }),
        ];
      default:
        return [];
    }
  }

  static getPrototypeBlocks() {
    const prototypeBlocks = [];
    const actionNames = Action.getActionNames();
    for (let i = 0; i < actionNames.length; i++) {
      const actionName = actionNames[i];
      prototypeBlocks.push(
        new Action({ data: actionName, state: STATE.PROTOTYPE })
      );
    }
    return prototypeBlocks;
  }
  static getActionNames() {
    return [
      "set",
      "say",
      "playAnimation",
      "stopAnimation",
      "move",
      "moveTo",
      "go",
      "goTo",
      "turn",
      "turnTo",
      "addSize",
      "show",
      "hide",
      "kill",
      "revive",
      "shake",
      "flash",
      "wait",
      "setCollision",
      "sendSignal",
      "onSignal",
      "onOverlap",
      "onOverlapOnce",
      "onKey",
      "onKeyUp",
      "onTouch",
      "onTouchUp",
      "onOut",
      "changeScene",
      "onFrame",
      "onSwipe",
      "bind",
      "play",
      "restart",
      "resume",
      "stop",
      "pause",
      "showRanking",
      "showRankingAscending",
      "saveScore",
      "startTimer",
      "pauseTimer",
      "resumeTimer",
      "resetTimer",
      "onShake",
      "speak",
      "vibrate",
    ];
  }
  isAvailableParentFor(block) {
    if (this.data === "playAnimation") {
      const spriteSubject = this.findParent({ type: BLOCK.SPRITE });
      if (!spriteSubject) return true;
      const context = this.getParentContext();
      const gameObjectInfo = context.getGameObjectInfoWithName(
        spriteSubject.data
      );
      const availableAnimationIds = gameObjectInfo.animationIds || [];
      const animationId = block.data;
      return availableAnimationIds.includes(animationId);
    } else {
      return super.isAvailableParentFor(block);
    }
  }
  getAvailableChildTypesAt(index) {
    switch (this.data) {
      case "set":
        if (this.parent instanceof Variable) {
          return [
            NumberBlock,
            StringBlock,
            BooleanBlock,
            Time,
            GameObject,
            Variable,
            Operator,
          ];
        } else if (this.parent instanceof Property) {
          return [...this.parent.getPropertyType(), Variable, Operator];
        } else {
          return [Variable, Operator];
        }
      case "say":
        return [NumberBlock, StringBlock, Time, Variable];
      case "playAnimation":
        return [Animation, Variable];
      case "moveTo":
        return [Sprite, Text, Position, Random, Touch];
      case "goTo":
        return [Sprite, Text, Position, Random, Touch];
      case "turnTo":
        return [Sprite, Text, Touch];
      case "wait":
      case "turn":
      case "addSize":
        return [NumberBlock, Variable];
      case "setCollision":
        return [Sprite, Screen, Text];
      case "onTouch":
      case "onTouchUp":
      case "onOut":
      case "onFrame":
      case "onShake":
      case "speak":
        return [Callback];
      case "changeScene":
        return [Scene];
      case "go":
      case "move":
        return (
          [
            [Direction, Axis],
            [NumberBlock, Variable],
          ][index] || []
        );
      case "onSwipe":
        return [[Direction], [Callback]][index] || [];
      case "onOverlap":
      case "onOverlapOnce":
        return [[Sprite, Text], [Callback]][index] || [];
      case "onKey":
      case "onKeyUp":
        return [[Key], [Callback]][index] || [];
      case "onSignal":
        return [[StringBlock], [Callback]][index] || [];
      case "bind":
        return (
          [
            [Sprite, Text],
            [NumberBlock, Variable],
          ][index] || []
        );
      case "sendSignal":
        return [StringBlock];
      case "saveScore":
        return [NumberBlock, Variable, Time];
      default:
        return [];
    }
  }
  getFinalChildTypesAt(index) {
    switch (this.data) {
      case "set":
        if (this.parent instanceof Property) {
          return [...this.parent.getPropertyType()];
        } else {
          return this.getAvailableChildTypesAt(index);
        }
      case "say":
        return [NumberBlock, StringBlock];
      case "playAnimation":
        return [Animation];
      case "wait":
      case "turn":
        return [NumberBlock];
      case "go":
      case "move":
        return [[Direction, Axis], [NumberBlock]][index] || [];
      case "bind":
        return [[Sprite, Text], [NumberBlock]][index] || [];
      default:
        return this.getAvailableChildTypesAt(index);
    }
  }
  getAvailableParentTypes() {
    switch (this.data) {
      case "set":
        return [Variable, Property];
      case "say":
      case "playAnimation":
      case "stopAnimation":
        return [Variable, Sprite];
      case "move":
      case "moveTo":
      case "goTo":
      case "turn":
      case "turnTo":
      case "show":
      case "hide":
      case "kill":
      case "revive":
      case "setCollision":
      case "onOverlap":
      case "onOverlapOnce":
      case "onOut":
        return [Variable, Sprite, Text];
      case "shake":
      case "onSwipe":
        return [Variable, Sprite, Screen];
      case "onTouch":
      case "onTouchUp":
      case "onKey":
      case "onKeyUp":
      case "go":
      case "wait":
      case "sendSignal":
      case "onSignal":
      case "addSize":
        return [Variable, Sprite, Screen, Text];
      case "flash":
      case "changeScene":
      case "onFrame":
        return [Variable, Screen];
      case "bind":
        return [Variable, Joystick, DPad];
      case "play":
      case "restart":
      case "resume":
      case "stop":
      case "pause":
        return [Variable, Sound];
      case "showRanking":
      case "showRankingAscending":
      case "saveScore":
        return [Ranking];
      case "startTimer":
      case "pauseTimer":
      case "resumeTimer":
      case "resetTimer":
        return [Timer];
      case "onShake":
      case "vibrate":
      case "speak":
        return [Variable, Mobile];
      default:
        return [];
    }
  }

  isDisabledFor(block) {
    if (this.isAnimateAction()) {
      if (block.parent instanceof Sprite) {
        const sprite = block.parent;
        const animationIds = sprite.getAnimationIds();
        return animationIds.length < 1;
      }
    }
    return false;
  }
  isAnimateAction() {
    return this.data === "playAnimation" || this.data === "stopAnimation";
  }

  toJavascript() {
    switch (this.data) {
      case "set":
        return this.toJavascriptForSet();
      case "move":
      case "go":
        return this.toJavascriptForMoveGo();
      case "moveTo":
      case "goTo":
        return this.toJavascriptForMoveToGoTo();
      case "turnTo":
        return this.toJavascriptForTurnTo();
      case "say":
        return this.toJavascriptForSay();
      case "playAnimation":
        return this.toJavascriptForPlayAnimation();
      case "setCollision":
        return this.toJavascriptForSetCollision();
      case "bind":
        return this.toJavascriptForBind();
      case "onTouch":
      case "onTouchUp":
        return this.toJavascriptForTouch();
      default:
        if (this.parent instanceof Sound) {
          return this.toJavascriptForSoundParent();
        } else if (this.parent instanceof Util) {
          return this.toJavascriptForUtilParent();
        } else {
          return this.toJavascriptForDefault();
        }
    }
  }
  getArgsToJavascript() {
    let args = "";
    for (let i in this.children) {
      const child = this.children[i];
      if (i !== "0") {
        args += ", ";
      }
      args += child.toJavascript();
    }
    return args;
  }
  toJavascriptForSet() {
    const child = this.children[0];
    const childCode = child.toJavascript();
    if (this.parent instanceof Property) {
      const propertyName = this.parent.data;
      const upperCased = propertyName[0].toUpperCase() + propertyName.slice(1);
      return `.set${upperCased}(${childCode})`;
    } else {
      return ` = ${childCode}`;
    }
  }
  toJavascriptForMoveGo() {
    const distance = this.children[1].toJavascript();
    if (this.children[0] instanceof Direction) {
      const directionBlock = this.children[0];
      switch (directionBlock.data) {
        case "up":
          return `.${this.data}Y(${distance} * (-1))`;
        case "down":
          return `.${this.data}Y(${distance})`;
        case "right":
          return `.${this.data}X(${distance})`;
        case "left":
          return `.${this.data}X(${distance} * (-1))`;
        default:
          return;
      }
    } else if (this.children[0] instanceof Axis) {
      const axisBlock = this.children[0];
      switch (axisBlock.data) {
        case "x":
          return `.${this.data}X(${distance})`;
        case "y":
          return `.${this.data}Y(${distance})`;
        default:
          return;
      }
    }
  }
  toJavascriptForMoveToGoTo() {
    if (this.children[0] instanceof GameObject) {
      const gameObject = this.children[0];
      const apiName = `${this.data}Sprite`;
      return `.${apiName}(${gameObject.toJavascript()})`;
    } else if (this.children[0] instanceof Position) {
      const positionBlock = this.children[0];
      const position = positionBlock.data;
      const apiName = `${this.data}`;
      return `.${apiName}(${position.x}, ${position.y})`;
    } else if (this.children[0] instanceof Random) {
      const apiName = `${this.data}Random`;
      return `.${apiName}()`;
    } else if (this.children[0] instanceof Touch) {
      const apiName = `${this.data}MousePointer`;
      return `.${apiName}()`;
    }
  }
  toJavascriptForTurnTo() {
    if (this.children[0] instanceof GameObject) {
      const gameObject = this.children[0];
      const apiName = `${this.data}Sprite`;
      return `.${apiName}(${gameObject.toJavascript()})`;
    } else if (this.children[0] instanceof Random) {
      const apiName = `${this.data}Random`;
      return `.${apiName}()`;
    } else if (this.children[0] instanceof Touch) {
      const apiName = `${this.data}MousePointer`;
      return `.${apiName}()`;
    }
  }
  toJavascriptForSay() {
    const stringBlock = this.children[0];
    const string = stringBlock.toJavascript();
    const defaultSayTime = 3;
    return `.say(${string}, ${defaultSayTime})`;
  }
  toJavascriptForPlayAnimation() {
    const animationBlock = this.children[0];
    const animationId = animationBlock.toJavascript();
    const defaultRepeat = true;
    return `.playAnimation(${animationId}, ${defaultRepeat})`;
  }
  toJavascriptForSetCollision() {
    if (this.children[0] instanceof Screen) {
      return ".setCollideScene(true)";
    } else if (this.children[0] instanceof GameObject) {
      const gameObject = this.children[0];
      const gameObjectId = gameObject.toJavascript();
      return `.${this.data}(${gameObjectId})`;
    }
  }
  toJavascriptForBind() {
    const gameObjectId = this.children[0].toJavascript();
    const maxSpeed = this.children[1].toJavascript();
    if (this.parent instanceof DPad) {
      return `.onDpad(function(direction){
  var sprite = getSprite(${gameObjectId})
  var speed = ${maxSpeed}
  sprite.setVelocityX(0)
  sprite.setVelocityY(0)
  switch(direction) {
    case "left":
      sprite.setVelocityX(-speed)
      break;
    case "right":
      sprite.setVelocityX(speed)
      break;
    case "up":
      sprite.setVelocityY(-speed)
      break;
    case"down":
      sprite.setVelocityY(speed)
      break;
    default:
      break;
  }
})`;
    } else {
      return `.onJoystick(function(degree, force){
  var maxSpeed = ${maxSpeed}
  var sprite = getSprite(${gameObjectId})
  sprite.setVelocityFromDegree(degree, force, maxSpeed)
})`;
    }
  }
  toJavascriptForTouch() {
    let touchApiName = this.data;
    const args = this.getArgsToJavascript();
    if (this.parent instanceof Screen) {
      touchApiName = {
        onTouch: "onScreenClick",
        onTouchUp: "onScreenClickUp",
      }[touchApiName];
    }
    return `.${touchApiName}(${args})`;
  }
  toJavascriptForSoundParent() {
    const soundApi = `${this.data}Sound`;
    const soundId = this.parent.data;
    return `${soundApi}("${soundId}")`;
  }
  toJavascriptForUtilParent() {
    const apiName = this.data;
    const args = this.getArgsToJavascript();
    return `${apiName}(${args})`;
  }
  toJavascriptForDefault() {
    const apiName = this.data;
    const args = this.getArgsToJavascript();
    return `.${apiName}(${args})`;
  }
}

export class Constant extends Block {
  get type() {
    return "Constant";
  }
  get category() {
    return "Constant";
  }

  getGrammarFor() {
    return GRAMMAR.OBJECTIVE;
  }

  static getPrototypeBlocks({ gameObjects = [], sceneIds, strings } = {}) {
    const animationIds = this.getAnimationIdsFrom(gameObjects);
    const prototypeBlocks = [
      ...NumberBlock.getPrototypeBlocks(),
      ...StringBlock.getPrototypeBlocks(strings),
      ...BooleanBlock.getPrototypeBlocks(),
      ...Key.getPrototypeBlocks(),
      ...Direction.getPrototypeBlocks(),
      ...Animation.getPrototypeBlocks(animationIds),
      ...Position.getPrototypeBlocks(),
      ...Touch.getPrototypeBlocks(),
      ...Random.getPrototypeBlocks(),
      ...Scene.getPrototypeBlocks(sceneIds),
      ...Axis.getPrototypeBlocks(),
      ...Time.getPrototypeBlocks(),
    ];
    return prototypeBlocks;
  }
  static getAnimationIdsFrom(gameObjects) {
    const animationIdSet = new Set();
    for (let i = 0; i < gameObjects.length; i++) {
      const gameObject = gameObjects[i];
      if (!gameObject.animationIds) continue;
      for (let j = 0; j < gameObject.animationIds.length; j++) {
        const animationId = gameObject.animationIds[j];
        animationIdSet.add(animationId);
      }
    }
    const animationIds = Array.from(animationIdSet);
    return animationIds;
  }

  toJavascript() {
    return `"${this.data}"`;
  }
}
export class NumberBlock extends Constant {
  get type() {
    return "NumberBlock";
  }
  get category() {
    return "Constant";
  }
  static getPrototypeBlocks() {
    return [new NumberBlock({ data: null, state: STATE.PROTOTYPE })];
  }

  toJavascript() {
    return this.data;
  }
}
export class StringBlock extends Constant {
  get type() {
    return "StringBlock";
  }
  get category() {
    return "Constant";
  }

  static getPrototypeBlocks(strings = []) {
    const prototypeBlocks = [
      new StringBlock({ data: null, state: STATE.PROTOTYPE }),
    ];
    for (let i = 0; i < strings.length; i++) {
      const string = strings[i];
      prototypeBlocks.push(
        new StringBlock({ data: string, state: STATE.PROTOTYPE })
      );
    }
    return prototypeBlocks;
  }
}
export class BooleanBlock extends Constant {
  get type() {
    return "BooleanBlock";
  }
  get category() {
    return "Constant";
  }
  static getPrototypeBlocks() {
    return [
      new BooleanBlock({ data: "true", state: STATE.PROTOTYPE }),
      new BooleanBlock({ data: "false", state: STATE.PROTOTYPE }),
    ];
  }

  toJavascript() {
    return this.data;
  }
}
export class Direction extends Constant {
  get type() {
    return "Direction";
  }
  get category() {
    return "Constant";
  }

  static getPrototypeBlocks() {
    return [
      new Direction({ data: "up", state: STATE.PROTOTYPE }),
      new Direction({ data: "down", state: STATE.PROTOTYPE }),
      new Direction({ data: "left", state: STATE.PROTOTYPE }),
      new Direction({ data: "right", state: STATE.PROTOTYPE }),
    ];
  }
}
export class Key extends Constant {
  get type() {
    return "Key";
  }
  get category() {
    return "Constant";
  }

  static getPrototypeBlocks() {
    return [new Key({ data: null, state: STATE.PROTOTYPE })];
  }
}
export class Animation extends Constant {
  get type() {
    return "Animation";
  }
  get category() {
    return "Constant";
  }

  static getPrototypeBlocks(animationIds) {
    const prototypeBlocks = [];
    for (let i = 0; i < animationIds.length; i++) {
      const animationId = animationIds[i];
      prototypeBlocks.push(
        new Animation({ data: animationId, state: STATE.PROTOTYPE })
      );
    }
    return prototypeBlocks;
  }
}
export class Position extends Constant {
  get type() {
    return "Position";
  }
  get category() {
    return "Constant";
  }

  isEqual(block) {
    if (!(block instanceof Block)) {
      return false;
    }

    return (
      this.type === block.type &&
      this.data.x === block.data.x &&
      this.data.y === block.data.y
    );
  }

  static getPrototypeBlocks() {
    return [new Position({ data: { x: 100, y: 100 }, state: STATE.PROTOTYPE })];
  }
}
export class Touch extends Constant {
  get type() {
    return "Touch";
  }
  get category() {
    return "Constant";
  }

  static getPrototypeBlocks() {
    return [new Touch({ data: "touch", state: STATE.PROTOTYPE })];
  }
}
export class Random extends Constant {
  get type() {
    return "Random";
  }
  get category() {
    return "Constant";
  }

  static getPrototypeBlocks() {
    return [new Random({ data: "random", state: STATE.PROTOTYPE })];
  }
}
export class Scene extends Constant {
  get type() {
    return "Scene";
  }
  get category() {
    return "Constant";
  }

  static getPrototypeBlocks(sceneIds = []) {
    const prototypeBlocks = [];
    for (let i = 0; i < sceneIds.length; i++) {
      const sceneId = sceneIds[i];
      prototypeBlocks.push(
        new Scene({ data: sceneId, state: STATE.PROTOTYPE })
      );
    }
    return prototypeBlocks;
  }
}
export class Axis extends Constant {
  get type() {
    return "Axis";
  }
  get category() {
    return "Constant";
  }

  static getPrototypeBlocks() {
    return [
      new Axis({ data: "x", state: STATE.PROTOTYPE }),
      new Axis({ data: "y", state: STATE.PROTOTYPE }),
    ];
  }
}
export class Time extends Constant {
  get type() {
    return "Time";
  }
  get category() {
    return "Constant";
  }

  static getPrototypeBlocks() {
    return [new Time({ data: "time", state: STATE.PROTOTYPE })];
  }

  toJavascript() {
    return "getTimer()";
  }
}

export class Util extends Block {
  get type() {
    return "Util";
  }
  get category() {
    return "Util";
  }

  getGrammarFor(parent) {
    switch (this.data) {
      case "if":
      case "else if":
      case "repeat":
      case "else":
        return GRAMMAR.PHRASE;
      case "clone":
        return parent.grammar;
      default:
        return GRAMMAR.SUBJECT;
    }
  }
  getDefaultChildren() {
    switch (this.data) {
      case "if":
      case "else if":
      case "repeat":
        return [
          new Block({ state: STATE.INSTANCE, parent: this }),
          new Callback({ state: STATE.INSTANCE, parent: this }),
        ];
      case "else":
        return [new Callback({ state: STATE.INSTANCE, parent: this })];
      case "clone":
        if (this.grammar === GRAMMAR.SUBJECT) {
          return [new Block({ state: STATE.INSTANCE, parent: this })];
        } else {
          return [];
        }
      default:
        return [];
    }
  }

  static getPrototypeBlocks() {
    const prototypeBlocks = [
      new Util({ data: "if", state: STATE.PROTOTYPE }),
      new Util({ data: "else if", state: STATE.PROTOTYPE }),
      new Util({ data: "else", state: STATE.PROTOTYPE }),
      new Util({ data: "repeat", state: STATE.PROTOTYPE }),
      new Util({ data: "clone", state: STATE.PROTOTYPE }),
      ...Mobile.getPrototypeBlocks(),
      ...Ranking.getPrototypeBlocks(),
      ...Timer.getPrototypeBlocks(),
    ];
    return prototypeBlocks;
  }
  isAvailableParentFor(block) {
    if (this.data === "clone") {
      if (block instanceof Util && block.data === "clone") {
        return false;
      }

      const availableParentTypes = block.getAvailableParentTypes();
      for (let i in availableParentTypes) {
        if (this.parent instanceof availableParentTypes[i]) {
          return true;
        }
      }
      return false;
    } else {
      return super.isAvailableParentFor(block);
    }
  }
  getAvailableChildTypesAt(index) {
    switch (this.data) {
      case "if":
      case "else if":
        return [[BooleanBlock, Variable, Operator], [Callback]][index] || [];
      case "repeat":
        return [[NumberBlock, Variable, Operator], [Callback]][index] || [];
      case "else":
        return [Callback];
      case "clone":
        return this.parent.getAvailableChildTypesAt(index);
      default:
        return [];
    }
  }
  getFinalChildTypesAt(index) {
    switch (this.data) {
      case "if":
      case "else if":
        return [[BooleanBlock], [Callback]][index] || [];
      case "repeat":
        return [[NumberBlock], [Callback]][index] || [];
      default:
        return this.getAvailableChildTypesAt(index);
    }
  }
  getAvailableParentTypes() {
    switch (this.data) {
      case "if":
      case "else if":
      case "repeat":
      case "else":
        return [Line];
      case "clone":
        return [Sprite, Text];
      default:
        return [];
    }
  }

  toJavascript() {
    switch (this.data) {
      case "repeat":
        return this.toJavascriptForRepeat();
      case "if":
      case "else if":
        return this.toJavascriptForIf();
      case "else":
        return this.toJavascriptForElse();
      case "clone":
        return this.toJavascriptForClone();
      default:
        return;
    }
  }
  toJavascriptForRepeat() {
    const repeat = this.children[0].toJavascript();
    const statement = this.linesToJavascript(this.children[1].children);
    return `for(let i = 0; i < ${repeat}; i++) {\n${statement}\n}`;
  }
  toJavascriptForIf() {
    const condition = this.children[0].toJavascript();
    const statement = this.linesToJavascript(this.children[1].children);
    return `${this.data}(${condition}) {\n${statement}\n}`;
  }
  toJavascriptForElse() {
    const statement = this.linesToJavascript(this.children[0].children);
    return `else {\n${statement}\n}`;
  }
  toJavascriptForClone() {
    const child = this.children && this.children[0];
    if (child) {
      const childCode = child.toJavascript();
      return `.clone()${childCode}`;
    } else {
      return `.clone()`;
    }
  }
}
export class Mobile extends Util {
  get type() {
    return "Mobile";
  }
  get category() {
    return "Util";
  }

  getGrammarFor() {
    return GRAMMAR.SUBJECT;
  }
  getDefaultChildren() {
    return [new Block({ state: STATE.INSTANCE, parent: this })];
  }

  static getPrototypeBlocks() {
    return [new Mobile({ data: "mobile", state: STATE.PROTOTYPE })];
  }
  getAvailableChildTypesAt() {
    return [Action];
  }
  getAvailableParentTypes() {
    return [Line];
  }

  toJavascript() {
    const child = this.children[0];
    const childCode = child.toJavascript();
    return childCode;
  }
}
export class Ranking extends Util {
  get type() {
    return "Ranking";
  }
  get category() {
    return "Util";
  }

  getGrammarFor() {
    return GRAMMAR.SUBJECT;
  }
  getDefaultChildren() {
    return [new Block({ state: STATE.INSTANCE, parent: this })];
  }

  static getPrototypeBlocks() {
    return [new Ranking({ data: "ranking", state: STATE.PROTOTYPE })];
  }
  getAvailableChildTypesAt() {
    return [Action];
  }
  getAvailableParentTypes() {
    return [Line];
  }

  toJavascript() {
    const child = this.children[0];
    const childCode = child.toJavascript();
    return childCode;
  }
}
export class Timer extends Util {
  get type() {
    return "Timer";
  }
  get category() {
    return "Util";
  }

  getGrammarFor() {
    return GRAMMAR.SUBJECT;
  }
  getDefaultChildren() {
    return [new Block({ state: STATE.INSTANCE, parent: this })];
  }

  static getPrototypeBlocks() {
    return [new Timer({ data: "timer", state: STATE.PROTOTYPE })];
  }
  getAvailableChildTypesAt() {
    return [Action];
  }
  getAvailableParentTypes() {
    return [Line];
  }

  toJavascript() {
    const child = this.children[0];
    const childCode = child.toJavascript();
    return childCode;
  }
}

export class Variable extends Block {
  get type() {
    return "Variable";
  }
  get category() {
    return "Variable";
  }

  getGrammarFor(parent) {
    if (parent instanceof Line) {
      return GRAMMAR.SUBJECT;
    } else {
      return GRAMMAR.OBJECTIVE;
    }
  }
  getDefaultChildren() {
    if (this.grammar === GRAMMAR.SUBJECT) {
      return [new Block({ state: STATE.INSTANCE, parent: this })];
    } else {
      return [];
    }
  }

  static getPrototypeBlocks(variables) {
    const prototypeBlocks = [];
    for (let i in variables) {
      const variable = variables[i];
      prototypeBlocks.push(
        new Variable({ data: variable, state: STATE.PROTOTYPE })
      );
    }
    return prototypeBlocks;
  }
  getAvailableChildTypesAt(index) {
    if (this.grammar === GRAMMAR.SUBJECT) {
      return [Property, Action, Util];
    } else if (this.grammar === GRAMMAR.OBJECTIVE) {
      return [Property];
    } else {
      return [];
    }
  }

  getPropertyType() {
    return [Block];
  }

  toJavascript() {
    const variableId = this.data;
    const child = this.children && this.children[0];
    if (child) {
      const childCode = child.toJavascript();
      return `global.${variableId}${childCode}`;
    } else {
      return `global.${variableId}`;
    }
  }
}

export class Operator extends Block {
  get type() {
    return "Operator";
  }
  get category() {
    return "Operator";
  }

  getGrammarFor() {
    return GRAMMAR.OBJECTIVE;
  }
  getDefaultChildren() {
    if (this.data === "!") {
      return [new Block({ state: STATE.INSTANCE, parent: this })];
    } else {
      return [
        new Block({ state: STATE.INSTANCE, parent: this }),
        new Block({ state: STATE.INSTANCE, parent: this }),
      ];
    }
  }

  static getPrototypeBlocks() {
    return [
      new Operator({ data: "+", state: STATE.PROTOTYPE }),
      new Operator({ data: "-", state: STATE.PROTOTYPE }),
      new Operator({ data: "/", state: STATE.PROTOTYPE }),
      new Operator({ data: "*", state: STATE.PROTOTYPE }),
      new Operator({ data: "%", state: STATE.PROTOTYPE }),
      new Operator({ data: ">", state: STATE.PROTOTYPE }),
      new Operator({ data: ">=", state: STATE.PROTOTYPE }),
      new Operator({ data: "==", state: STATE.PROTOTYPE }),
      new Operator({ data: "<=", state: STATE.PROTOTYPE }),
      new Operator({ data: "<", state: STATE.PROTOTYPE }),
      new Operator({ data: "&&", state: STATE.PROTOTYPE }),
      new Operator({ data: "||", state: STATE.PROTOTYPE }),
      new Operator({ data: "!", state: STATE.PROTOTYPE }),
    ];
  }
  getAvailableChildTypesAt() {
    switch (this.data) {
      case "-":
      case "/":
      case "*":
      case "%":
        return [NumberBlock, Variable];
      case "+":
        if (this.parent instanceof Action) {
          const childIndex = this.parent.children.indexOf(this);
          return this.parent.getAvailableChildTypesAt(childIndex);
        } else {
          return [NumberBlock, Variable];
        }
      case ">":
      case ">=":
      case "<=":
      case "<":
        return [NumberBlock, Variable];
      case "==":
        return [NumberBlock, StringBlock, BooleanBlock, Variable];
      case "&&":
      case "||":
      case "!":
        return [BooleanBlock, Variable];
      default:
        return [];
    }
  }
  getOperatorTypes() {
    switch (this.data) {
      case "-":
      case "/":
      case "*":
      case "%":
        return [NumberBlock];
      case "+":
        return [NumberBlock, StringBlock];
      case ">":
      case ">=":
      case "==":
      case "<=":
      case "<":
        return [BooleanBlock];
      case "&&":
      case "||":
      case "!":
        return [BooleanBlock];
      default:
        return [];
    }
  }

  toJavascript() {
    if (this.data === "!") {
      const operator = this.data;
      const flag = this.children[0].toJavascript();
      return `${operator}${flag}`;
    } else {
      const operator = this.data;
      const prev = this.children[0].toJavascript();
      const next = this.children[1].toJavascript();
      return `${prev} ${operator} ${next}`;
    }
  }
}

export class Callback extends Block {
  constructor(props = {}) {
    super(props);
    this.children = this.children || [new Line({ parent: this })];
    delete this.data;
  }

  get type() {
    return "Callback";
  }
  get category() {
    return "Callback";
  }

  toJavascript() {
    const code = this.linesToJavascript(this.children);
    return `function() {\n${code}\n}`;
  }

  getLines() {
    return this.children;
  }
  addLineAt(line, index) {
    line.parent = this;
    this.children.splice(index, 0, line);
  }
}

export class FunctionBlock extends Block {
  get type() {
    return "FunctionBlock";
  }
  get category() {
    return "FunctionBlock";
  }

  getAvailableChildTypesAt() {
    return [GameObject, Constant, Variable];
  }
}

export default Block;
