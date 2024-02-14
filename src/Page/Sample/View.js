import React, { useEffect, useState } from "react";
import GameRanking from "../../Common/Component/GameRanking";
import "./index.scss";

const View = (props) => {
  const [iframeWidth, setIframeWidth] = useState("100vw");
  const [iframeHeight, setIframeHeight] = useState("100vh");
  const { projectId, isRankingShow, setIsRankingShow, mode } = props;

  useEffect(() => {
    const updateDimensions = () => {
      if (window.matchMedia("(orientation: landscape)").matches) {
        if (mode === "vertical") {
          // case1 (가로모드의 세로게임)
          setIframeHeight("100vh");
          setIframeWidth("56.25vh");
        } else {
          // case2 (가로모드의 가로게임)
          setIframeHeight("100vh");
          setIframeWidth("177.78vh");
        }
      } else {
        if (mode === "vertical") {
          // case3 (세로모드의 세로게임)
          setIframeWidth("100vw");
          setIframeHeight("177.78vw");
        } else {
          // case4 (세로모드의 가로게임)
          setIframeWidth("100vw");
          setIframeHeight("56.25vw");
        }
      }
    };

    updateDimensions(); // 초기 로딩 시 한 번 실행

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [mode]);
  console.log("여기", props.sampleGameURL);
  return (
    <div className="gameView">
      {isRankingShow && (
        <div className="gameRanking">
          <GameRanking
            isRankingShow={isRankingShow}
            setIsRankingShow={setIsRankingShow}
          />
        </div>
      )}
      <div className={`gameWrapper ${isRankingShow ? "blur" : ""}`}>
        <iframe
          id="makers__iframe"
          title="guide"
          src={props.sampleGameURL}
          style={{
            width: iframeWidth,
            height: iframeHeight,
            border: 0,
          }}
          scrolling="no"
          allow="autoplay"
          allowFullScreen
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );
};

export default View;
