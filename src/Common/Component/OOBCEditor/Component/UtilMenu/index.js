import React from "react";
import "./index.scss";

import zoomInImg from "../../Image/zoom_in.png";
import zoomOutImg from "../../Image/zoom_out.png";
import fullImg from "../../../../../Image/builder/full-screen.svg";

export default function (props) {
  const { isMinZoom, isMaxZoom, onClickZoomIn, onClickZoomOut } = props;

  const handleClickFullScreen = (event) => {
    let element = document.body;

    if (event instanceof HTMLElement) {
      element = event;
    }

    let isFullscreen =
      document.webkitIsFullScreen || document.mozFullScreen || false;

    element.requestFullScreen =
      element.requestFullScreen ||
      element.webkitRequestFullScreen ||
      element.mozRequestFullScreen ||
      function () {
        return false;
      };
    document.cancelFullScreen =
      document.cancelFullScreen ||
      document.webkitCancelFullScreen ||
      document.mozCancelFullScreen ||
      function () {
        return false;
      };

    isFullscreen ? document.cancelFullScreen() : element.requestFullScreen();
  };
  return (
    <div className="oobceditor_utils">
      <div
        className={`oobceditor_util oobceditor_util-full`}
        onClick={handleClickFullScreen}
      >
        <img src={fullImg} alt="full" />
      </div>
      <div
        className={`oobceditor_util oobceditor_util-zoom_in${
          isMaxZoom ? " oobceditor_util-disabled" : ""
        }`}
        onClick={onClickZoomIn}
      >
        <img src={zoomInImg} alt="zoomIn" />
      </div>
      <div
        className={`oobceditor_util oobceditor_util-zoom_out${
          isMinZoom ? " oobceditor_util-disabled" : ""
        }`}
        onClick={onClickZoomOut}
      >
        <img src={zoomOutImg} alt="zoomOut" />
      </div>
    </div>
  );
}
