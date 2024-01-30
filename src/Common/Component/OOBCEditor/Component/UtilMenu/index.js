import React, { useState } from "react";
import "./index.scss";

import zoomInImg from "../../Image/zoom_in.png";
import zoomOutImg from "../../Image/zoom_out.png";
import fullImg from "../../../../../Image/builder/full-screen.svg";

export default function (props) {
  const {
    isMinZoom,
    isMaxZoom,
    onClickZoomIn,
    onClickZoomOut,
    triggerFull,
    exitFull,
  } = props;
  const [isFullScreen, setIsFullScreen] = useState(false);
  return (
    <div className="oobceditor_utils">
      <div
        className={`oobceditor_util oobceditor_util-full`}
        onClick={() => {
          if (isFullScreen) {
            exitFull();
          } else {
            triggerFull();
          }
          setIsFullScreen(!isFullScreen);
        }}
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
