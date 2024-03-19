define("ace/theme/wizschool", [
  "require",
  "exports",
  "module",
  "ace/lib/dom",
], function (e, t, n) {
  (t.isDark = !1),
    (t.cssClass = "ace-wizschool"),
    (t.cssText = `
    .ace-wizschool {
      background-color: var(--editorColorWH);
      color: var(--editorColorBK);
    }
    .ace-wizschool .ace_gutter {
      // background: rgba(216, 216, 216, 0.2);
      color: var(--editorColorFold);
      z-index: 0; /* temporary */
    }
    .ace-wizschool .ace_print-margin {
      width: 1px;
      background-color: var(--editorColorWH);
    }
    .ace-wizschool .ace_cursor {
      color: var(--editorColorBK);
    }
    .ace-wizschool .ace_marker-layer .ace_selection {
      background: var(--editorColorSelection);
    }
    .ace-wizschool.ace_multiselect .ace_selection.ace_start {
      box-shadow: 0 0 3px 0px var(--editorColorWH);
    }
    .ace-wizschool .ace_marker-layer .ace_step {
      background: var(--editorColorStep);
    }
    .ace-wizschool .ace_marker-layer .ace_bracket {
      margin: -1px 0 0 -1px;
      border: 1px solid var(--editorColorBracket);
    }
    .ace-wizschool .ace_marker-layer .ace_active-line {
      background: var(--editorColorLine);
    }
    .ace-wizschool .ace_gutter-active-line {
      background-color: #008000;
    }
    .ace-wizschool .ace_marker-layer .ace_selected-word {
      border: 1px solid var(--editorColorSelection);
    }
    .ace-wizschool .ace_constant.ace_language {
      color: var(--editorColor05);
    }
    .ace-wizschool .ace_keyword,
    .ace-wizschool .ace_meta,
    .ace-wizschool .ace_variable.ace_language {
      color: var(--editorColor02);
    }
    .ace-wizschool .ace_invisible {
      color: var(--editorColorBracket);
    }
    .ace-wizschool .ace_constant.ace_character,
    .ace-wizschool .ace_constant.ace_other {
      color: var(--editorColor06);
    }
    .ace-wizschool .ace_constant.ace_numeric {
      color: var(--editorColor05);
    }
    .ace-wizschool .ace_entity.ace_other.ace_attribute-name,
    .ace-wizschool .ace_support.ace_constant,
    .ace-wizschool .ace_support.ace_function {
      color: var(--editorColorFold);
    }
    .ace-wizschool .ace_fold {
      background-color: var(--editorColor01);
      border-color: var(--editorColorFold);
    }
    .ace-wizschool .ace_entity.ace_name.ace_tag,
    .ace-wizschool .ace_support.ace_class,
    .ace-wizschool .ace_support.ace_type {
      color: var(--editorColor02);
    }
    .ace-wizschool .ace_storage {
      color: var(--editorColor01);
    }
    .ace-wizschool .ace_string {
      color: var(--editorColor03);
    }
    .ace-wizschool .ace_comment {
      color: var(--editorColor07);
    }
    .ace-wizschool .ace_indent-guide {
      border-right:1px solid var(--W_White);
    }
    .ace_entity.ace_name.ace_function {
      color: var(--editorColor04);
    }
    `);
  var r = e("../lib/dom");
  r.importCssString(t.cssText, t.cssClass);
});
(function () {
  window.require(["ace/theme/wizschool"], function (m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
