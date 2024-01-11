import { WizSpritePrefix, EDITORMODE } from "../../../Common/Util/Constant";
import ApiLibrary from "./apiLibrary";

const escodegen = require("escodegen");
const acorn = require("acorn");
const escodegenDan = require("./escodegen");

class Parser {
  constructor() {
    this.editorMode = undefined;
    this.apiList = null;
    this.apiList3d = null;
  }
  setApiLibrary() {
    if (!this.apiList) {
      this.apiList = ApiLibrary.getAllFunctions().map((f) => {
        return f.caption.split("(")[0];
      });
      this.apiList.push("server");
      this.apiList.push("onJoystick");
      this.apiList.push("onDpad");
    }
  }

  parse(code, editorMode) {
    this.editorMode = editorMode;
    this.setApiLibrary();
    return this.execParse(code);
  }

  execParse(code) {
    let comments = [],
      tokens = [];
    let ast = acorn.parse(code, {
      // collect ranges for each node
      ranges: true,
      // collect comments in Esprima's format
      // onComment: comments,
      // collect token ranges
      onToken: tokens,
      ecmaVersion: 8,
    });
    this.consume(ast);
    // attach comments using collected information
    escodegen.attachComments(ast, comments, tokens);
    // generate code
    return escodegen.generate(ast, { comment: true });
  }

  consume(node) {
    if (!node) return;

    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        this.consume(node[i]);
      }
    } else {
      // console.log(node);
      if (this[node.type]) {
        this[node.type](node);
      } else {
        // console.log("-> unhandled node");
      }
    }
  }

  /*
    Explore All Nodes to...
      => add wizSprite prefix to api, server(keyword)
          - CallExpression, Identifier
      => asynchronize all functions
          - FunctionDeclaration, FunctionExpression, ArrowFunctionExpression
          * need to async 'all' functions?
            this.promiseList = [
              "moveForward",
              "moveX",
              "moveY",
              "moveTo",
              "moveToSprite",
              "moveToMousePointer",
              "moveToRandom",
              "input",
              "wait"
            ];
      => add wait(0) to block inifinite loop
          - WhileStatement, DoWhileStatement
  */
  // ===== Node ==========
  Program(node) {
    this.consume(node.body);
  }
  Property(node) {
    this.consume(node.value);
  }
  Identifier(node) {
    if (
      node.name === "server" ||
      node.name === "global" ||
      node.name === "socket"
    ) {
      node.name = `${WizSpritePrefix}.${node.name}`;
    }
  }

  VariableDeclarator(node) {
    this.consume(node.init);
  }
  FunctionDeclaration(node) {
    node.async = true;
    this.consume(node.body);
  }
  VariableDeclaration(node) {
    this.consume(node.declarations);
  }

  ExpressionStatement(node) {
    this.consume(node.expression);
  }
  WhileStatement(node) {
    node.body.body.push({
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "wait",
        },
        arguments: [
          {
            type: "Literal",
            value: 0,
            raw: "0",
          },
        ],
      },
    });
    this.consume(node.test);
    this.consume(node.body);
  }
  DoWhileStatement(node) {
    node.body.body.push({
      type: "ExpressionStatement",
      expression: {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          name: "wait",
        },
        arguments: [
          {
            type: "Literal",
            value: 0,
            raw: "0",
          },
        ],
      },
    });
    this.consume(node.body);
    this.consume(node.test);
  }
  BlockStatement(node) {
    this.consume(node.body);
  }
  ForStatement(node) {
    this.consume(node.init);
    this.consume(node.test);
    this.consume(node.update);
    this.consume(node.body);
  }
  IfStatement(node) {
    this.consume(node.test);
    this.consume(node.consequent);
    this.consume(node.alternate);
  }
  ReturnStatement(node) {
    this.consume(node.argument);
  }
  SwitchStatement(node) {
    this.consume(node.discriminant);
    this.consume(node.cases);
  }
  SwitchCase(node) {
    this.consume(node.test);
    this.consume(node.consequent);
  }

  CallExpression(node) {
    this.consume(node.arguments);
    if (node.callee.type === "Identifier") {
      const name = node.callee.name;
      if (
        (this.apiList && this.apiList.indexOf(name) > -1) ||
        (this.apiList3d && this.apiList3d.indexOf(name) > -1)
      ) {
        node.callee.name = `${WizSpritePrefix}.${node.callee.name}`;
      }
      node.callee.name = `await ${node.callee.name}`;
    }
    if (node.callee.type === "MemberExpression") {
      this.consume(node.callee);
      function findObject(object) {
        return object.object ? findObject(object.object) : object;
      }
      const object = findObject(node.callee.object);
      if (object.type === "CallExpression") {
        this.consume(object);
      } else if (object.type === "ArrayExpression") {
        this.consume(object);
      } else if (object.type === "Identifier") {
        if (
          object.name === "server" ||
          object.name === "global" ||
          object.name === "socket"
        ) {
          object.name = `${WizSpritePrefix}.${object.name}`;
        }
        object.name = `await ${object.name}`;
      }
    }
  }
  ObjectExpression(node) {
    this.consume(node.properties);
  }
  MemberExpression(node) {
    this.consume(node.object);
    this.consume(node.property);
  }
  AssignmentExpression(node) {
    this.consume(node.left);
    this.consume(node.right);
  }
  FunctionExpression(node) {
    node.async = true;
    this.consume(node.body);
  }
  ArrowFunctionExpression(node) {
    node.async = true;
    this.consume(node.body);
  }
  ArrayExpression(node) {
    this.consume(node.elements);
  }
  BinaryExpression(node) {
    this.consume(node.left);
    this.consume(node.right);
  }
  UnaryExpression(node) {
    this.consume(node.argument);
  }
  LogicalExpression(node) {
    this.consume(node.left);
    this.consume(node.right);
  }
  ConditionalExpression(node) {
    this.consume(node.test);
    this.consume(node.consequent);
    this.consume(node.alternate);
  }
  // ===== Node End ==========

  parseForSort(code) {
    let comments = [],
      tokens = [];
    let ast = acorn.parse(code, {
      // collect ranges for each node
      ranges: true,
      // collect comments in Esprima's format
      onComment: comments,
      // collect token ranges
      onToken: tokens,
      ecmaVersion: 8,
    });

    const _ast = ast;

    // attach comments using collected information
    escodegenDan.attachComments(_ast, comments, tokens);
    // generate code
    return escodegenDan.generate(_ast, {
      comment: true,
      format: {
        quotes: "double",
        semicolons: false,
        space: "",
      },
    });
  }
}

export default new Parser();
