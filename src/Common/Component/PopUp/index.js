import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import defaultStore from "../../Store";

import OneButton from "./OneButton";
import TwoButton from "./TwoButton";
import OneInput from "./OneInput";
import TwoInput from "./TwoInput";
import dismissImg from "../../../Image/popup_dismiss.svg";

// python Page
import PythonAlert from "../../../Page/Python/Components/PopupComponents/AlertPopup";
import PythonOneButtonAlert from "../../../Page/Python/Components/PopupComponents/OneButtonAlertPopup";
import PythonExecResult from "../../../Page/Python/Components/PopupComponents/ExecResultPopup";
import PythonCollection from "../../../Page/Python/Components/PopupComponents/CollectionPopup";
import PythonInfo from "../../../Page/Python/Components/PopupComponents/InfoPopup";
import PythonSetting from "../../../Page/Python/Components/PopupComponents/SettingPopup";
import PythonClue from "../../../Page/Python/Components/PopupComponents/CluePopup";

import "./index.scss";

import en from "react-intl/locale-data/en";
import ko from "react-intl/locale-data/ko";
import zh from "react-intl/locale-data/zh";
import ja from "react-intl/locale-data/ja";

import locale from "../../../locale";
import { IntlProvider, addLocaleData } from "react-intl";

addLocaleData([...en, ...ko, ...zh, ...ja]);

// const defaultLang = localStorage.getItem("lang");

class PopUpContainer extends Component {
  componentDidMount() {

    setTimeout(() => {
      const overlay = document.getElementById("popup_overlay");
      if (overlay) overlay.classList.remove("popup_overlay-invisible");
      const contents = document.getElementById("popup_contents");
      if (contents) contents.classList.remove("popup_contents-larged");
    }, 10);
    window.onpopstate = e => {
      //dismiss popup
      ReactDOM.render(null, document.getElementById("popup"));
      document.body.classList.toggle("body-unsrollable");
   }
  }

  render() {
    const {
      dismiss,
      dismissButton,
      dismissOverlay,
      defaultPadding,
      scrollable,
      darkmode,
      overflow,
      mobileFullscreen,
      pythonPopup,
      isBackTrans
    } = this.props;
    return (
      <div
        className={`popup_container ${
          darkmode ? "popup_container-darkmode" : ""
        } ${pythonPopup ? "popup_container-python" : ""}`}
      >
        <div
          id="popup_overlay"
          className="popup_overlay popup_overlay-invisible"
          onClick={() => {
            if (dismissOverlay) dismiss();
          }}
        />
        <div id="popup_scrollable" className="popup_scrollable">
          <div
            id="popup_contents"
            className={` ${isBackTrans? "popup_contents_opacity": "popup_contents"} popup_contents-larged ${
              defaultPadding ? "popup_contents-defaultPadding" : ""
            } ${scrollable ? "popup_contents-scrollable" : ""} ${
              overflow ? "popup_contents-overflow-show" : ""
            } ${mobileFullscreen ? "popup_contents-mobileFullscreen" : ""}`}
          >
            {dismissButton && (
              <img
                id="popup_dismissbtn"
                className={
                  localStorage.getItem("colorTheme") === "darkMode"
                    ? `popup_dismissbtn_darkmode`
                    : `popup_dismissbtn`
                }
                src={dismissImg}
                alt="popup_dismissbtn"
                onClick={dismiss}
              />
            )}
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export const showPopUp = (content, options = {} ,isBackTrans) => {
  const root = document.getElementById("root");
  let popup = document.getElementById("popup");
  if (!popup) {
    popup = document.createElement("div");
    popup.setAttribute("id", "popup");
    popup.classList.add(localStorage.getItem("lang"));
    root.appendChild(popup);
    window.onhashchange = function() {
      showPopUp();
    };
  }

  const dismiss = () => {
    ReactDOM.render(null, popup);
    document.body.classList.toggle("body-unsrollable");
  };
  dismiss();

  const {
    store = defaultStore,
    dismissButton = true,
    dismissOverlay = false,
    defaultPadding = true,
    scrollable = false,
    darkmode = false,
    overflow = false,
    mobileFullscreen = false,
    enterToConfirm = true,
    pythonPopup = false
  } = options;

  if (content) {
    setTimeout(() => {
      document.body.classList.add("body-unsrollable");
      ReactDOM.render(
        <IntlProvider locale={localStorage.getItem("lang")} messages={locale[localStorage.getItem("lang")]}>
          <Provider store={store}>
            <PopUpContainer
              dismiss={dismiss}
              dismissButton={dismissButton}
              dismissOverlay={dismissOverlay}
              defaultPadding={defaultPadding}
              scrollable={scrollable}
              darkmode={darkmode}
              overflow={overflow}
              mobileFullscreen={mobileFullscreen}
              enterToConfirm={enterToConfirm}
              pythonPopup={pythonPopup}
              isBackTrans={isBackTrans}
            >
              {React.cloneElement(content, { dismiss })}
            </PopUpContainer>
          </Provider>
        </IntlProvider>,
        popup
      );
    }, 10);
  }
};

export const hidePopUp = () => {
  let popup = document.getElementById("popup");
  if (popup) {
    ReactDOM.render(null, popup);
  }
  document.body.classList.remove("body-unsrollable");
};

export default {
  OneButton,
  TwoButton,
  OneInput,
  TwoInput,
  PythonAlert,
  PythonOneButtonAlert,
  PythonInfo,
  PythonCollection,
  PythonExecResult,
  PythonSetting,
  PythonClue
};
