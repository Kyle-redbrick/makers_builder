import React, { useEffect, useState } from "react";
import * as request from "../../Common/Util/HTTPRequest";
import View from "./View";
import { getGuestId } from "../../Common/Util/GuestIdUtil";

const Container = (props) => {
  const { mode, projectId } = props.match.params;
  const [sampleGameURL, setSampleGameURL] = useState("");
  const [isRankingShow, setIsRankingShow] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAsc, setIsAsc] = useState(true);
  const screenMode = mode.toLowerCase();

  const gameEventHandler = (event) => {
    if (event.data.source) {
      if (event.data.source === "wizlab") {
        if (event.data.type === "gameEvent") {
          const { type, data } = JSON.parse(event.data.message);
          switch (type) {
            case "showRanking":
              if (isSaved) {
                setIsAsc(false);
                setIsRankingShow(true);
              } else {
                setTimeout(() => {
                  setIsAsc(false);
                  setIsRankingShow(true);
                }, 300);
              }
              break;
            case "showRankingAscending":
              if (isSaved) {
                setIsAsc(true);
                setIsRankingShow(true);
              } else {
                setTimeout(() => {
                  setIsAsc(true);
                  setIsRankingShow(true);
                }, 300);
              }
              break;
            case "hideRanking":
              setIsRankingShow(false);
              break;
            case "saveScore":
              const saveScoreFunction = async ({ projectId, data }) => {
                let body = {
                  projectId: projectId,
                  score: data,
                };
                if (!localStorage.getItem("makersToken")) {
                  let userGuestId = getGuestId();
                  body.guestId = userGuestId;
                }
                let response = await request
                  .saveSampleGameRanking(body)
                  .then((res) => res.json())
                  .then((json) => {
                    localStorage.setItem("ascId", json.data.ascId);
                    localStorage.setItem("descId", json.data.descId);
                    setIsSaved(true);
                  });
                console.log(response);
              };
              saveScoreFunction({ projectId, data });
              // setIsRankingShow(true);
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
        console.log(ans);
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
      isAsc={isAsc}
      sampleGameURL={sampleGameURL}
      mode={screenMode}
      projectId={projectId}
      isRankingShow={isRankingShow}
      setIsRankingShow={setIsRankingShow}
    />
  );
};

export default Container;
