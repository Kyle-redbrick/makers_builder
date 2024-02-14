import React, { useEffect, useState } from "react";
import * as request from "../../Common/Util/HTTPRequest";
import View from "./View";
import { getGuestId } from "../../Common/Util/GuestIdUtil";

const Container = (props) => {
  const { mode, projectId } = props.match.params;
  const [sampleGameURL, setSampleGameURL] = useState("");
  const [isRankingShow, setIsRankingShow] = useState(false);
  const email = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")).email
    : undefined;

  const sendMessageToIframe = (data) => {
    document
      .getElementById("makers__iframe")
      .contentWindow.postMessage(
        { message: JSON.stringify(data), source: "makers", type: "gameData" },
        "*"
      );
  };

  const getGameDataDefaultParams = () => {
    let params = { projectId: projectId };
    if (email) {
      params.email = email;
    } else {
      params.guestId = getGuestId();
    }
    return params;
  };

  const gameEventHandler = (event) => {
    if (event.data.source) {
      if (event.data.source === "wizlab") {
        if (event.data.type === "gameEvent") {
          const { type, data } = JSON.parse(event.data.message);
          switch (type) {
            case "showRanking":
              // this.handleRankingShow(false);
              break;
            case "showRankingAscending":
              // this.handleRankingShow(true);
              break;
            case "hideRanking":
              setIsRankingShow(false);
              // this.handleRankingHide();
              break;
            case "saveScore":
              setIsRankingShow(true);
              // this.saveScore(data);
              break;
            case "saveGameData":
              // this.saveGameData(data);
              break;
            case "resetGameData":
              // this.resetGameData();
              break;
            case "loadGameData":
              // this.loadGameData();
              break;
            default:
          }
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener("message", gameEventHandler, false);

    return () => {
      window.removeEventListener("message", gameEventHandler);
    };
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await request.getSampleGameURL(projectId);
        const ans = await response.json();
        console.log("ans :", ans);
        const sampleGame = ans.data.sampleGameURL;
        const url = `${process.env.REACT_APP_THUMBNAIL_ALI}${sampleGame}`;
        setSampleGameURL(url);
      } catch (error) {
        //
      }
    };

    fetchData();
  }, [projectId]);

  return (
    <View
      {...props}
      sampleGameURL={sampleGameURL}
      mode={mode}
      projectId={projectId}
      isRankingShow={isRankingShow}
      setIsRankingShow={setIsRankingShow}
    />
  );
};

export default Container;
