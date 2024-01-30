import React from "react";
import reactDom from "react-dom";
import ReactToolTip from "react-tooltip";
import { ToastContainer } from "react-toastify";
import { PAGETYPE } from "../../Common/Util/Constant";
import useFullscreen from "./utils/useFullScreen";
import "react-toastify/dist/ReactToastify.css";
import "./index.scss";

import Header from "./Component/Header";
import LeftBar from "./Component/LeftBar";
import RightBar from "./Component/RightBar";
import Editor from "./Component/Editor";
import Play from "./Component/Play";
import Game from "./Component/Game";
import GameEvent from "./Component/GameEvent";
import Preload from "./Component/Preload";
// import Project from "./Component/Project";
import Socket from "./Component/Socket";
import AudioPlayer from "./Component/AudioPlayer";
import Video from "./Component/Video";
import API from "./Component/API";
import Chat from "./Component/Chat";
import Property from "./Component/Property";
import QnA from "./Component/QnA";
import Preview from "./Component/Preview";
import SpriteBox from "./Component/SpriteBox";
import SoundBox from "./Component/SoundBox";
import Scene from "./Component/Scene";
import Videoclass from "./Component/Videoclass";
import OCP from "./Component/OCP";
// import OCP2BLOCK from "./Component/OCP2BLOCK";
import OCP2 from "./Component/OCP2";
import Tutorial from "./Component/Tutorial";
import RecordPlayer from "./Component/RecordPlayer";
import Help from "./Component/Help";
import Home from "./Component/Home";
import Snippet from "./Component/Snippet";
import OCPView from "./Component/OCPView";
import DreamBuilder from "./Component/DreamBuilder";
import Tabs from "./Component/Tabs";
import MultiSocket from "./Component/MultiSocket";

export default function (props) {
  const {
    isLoading,
    location,
    isProjectPopupOpened,
    openProjectPopup,
    closeProjectPopup,
    isHelpOpened,
    handleHelp,
    pageType,
    reservationId,
    reservation,
    roomId,
    isTutor,
    studentEmail,
    tutorEmail,
    lectureVideos,
    lectureSlides,
    pId,
    isFreeTrial,
    modalContent,
    showModal,
    popupStates,
    popupZIndexes,
    handleSelectTab,
    handleChangeZIndex,
    currentTutorial,
    email,
    name,
    calculateNewPosition,
    isTooltipPositionLeft,
  } = props;

  const liveProps = {
    reservationId,
    roomId,
    isTutor,
    studentEmail,
    tutorEmail,
    lectureVideos,
    lectureSlides,
    pId,
    isFreeTrial,
    pageType,
    email,
    name,
  };
  const popupZIndexOffset = 2;

  const onFullS = (isFull) => {
    console.log(isFull ? "Full Screen" : "Not Full Screen");
  };

  const { element, triggerFull, exitFull } = useFullscreen(onFullS);

  if (isLoading) {
    return (
      <div className="Page--BUILDER">
        {isProjectPopupOpened ? (
          // <Project canClose={false} />
          <Home
            canClose={false}
            pageType={pageType}
            closeProjectPopup={closeProjectPopup}
          />
        ) : (
          <div className="Builder--Loading">
            <div className="Builder--Loading--Progress" />
            <div className="Builder--Loading--Text">Loading...</div>
          </div>
        )}
      </div>
    );
  } else {
    if (pageType === PAGETYPE.CLASS) {
      return <DreamBuilder {...props} />;
    } else if (isOCPPage(pageType)) {
      return <OCPView {...props} />;
    } else {
      return (
        <div className="Page--BUILDER" ref={element}>
          {/* none ui components */}
          <Preload />
          <AudioPlayer />
          <Socket pageType={pageType} {...liveProps} />
          <Header
            location={location}
            openProjectPopup={openProjectPopup}
            handleHelp={handleHelp}
            isTutor={isTutor}
            handleSelectTab={handleSelectTab}
          />
          {pageType === PAGETYPE.WIZLIVE_1V4 && (
            <Tabs {...liveProps} isMonitor={pageType === "monitor_1v4"} />
          )}
          {pageType === PAGETYPE.MONITOR_1V4 && (
            <Tabs {...liveProps} isMonitor={pageType === "monitor_1v4"} />
          )}

          {/* MultiLive Socket */}
          {pageType === PAGETYPE.WIZLIVE_1V4 && <MultiSocket {...liveProps} />}
          {pageType === PAGETYPE.MONITOR_1V4 && <MultiSocket {...liveProps} />}

          <div className="Content">
            {/* modal */}
            <div
              className={`Content_Modal ${
                modalContent ? "Content_Modal-visible" : ""
              }`}
            >
              <div className="Content_Modal_Overlay" />
              <div className="Content_Modal_Container">
                <div className="Content_Modal_Content">{modalContent}</div>
              </div>
            </div>
            <LeftBar handleSelectTab={handleSelectTab} />
            <div className="Content_Main">
              <Editor
                pageType={pageType}
                triggerFull={triggerFull}
                exitFull={exitFull}
              />
            </div>
            {pageType === PAGETYPE.OCP2 || (
              <RightBar
                pageType={pageType}
                liveProps={liveProps}
                popupStates={popupStates}
                handleSelectTab={handleSelectTab}
                isTutor={isTutor}
              />
            )}
            {popupStates.videoclass && (
              <Videoclass
                handleSelectTab={handleSelectTab}
                handleChangeZIndex={() => {
                  handleChangeZIndex("videoclass");
                }}
                zIndex={popupZIndexes.indexOf("videoclass") + popupZIndexOffset}
                showModal={showModal}
              />
            )}
            {popupStates.ocp && (
              <OCP
                handleSelectTab={handleSelectTab}
                handleChangeZIndex={handleChangeZIndex}
                zIndex={popupZIndexes.indexOf("ocp") + popupZIndexOffset}
                showModal={showModal}
              />
            )}
            {/* {popupStates.ocp2block && (
            <OCP2BLOCK
              handleSelectTab={handleSelectTab}
              handleChangeZIndex={handleChangeZIndex}
              zIndex={popupZIndexes.indexOf("ocp2block") + popupZIndexOffset}
              showModal={showModal}
            />
          )} */}
            {(popupStates.ocp2js || popupStates.ocp2block) && (
              <OCP2
                handleSelectTab={handleSelectTab}
                handleChangeZIndex={handleChangeZIndex}
                zIndex={popupZIndexes.indexOf("ocp2js") + popupZIndexOffset}
                showModal={showModal}
              />
            )}
            {popupStates.tutorial && currentTutorial && (
              <Tutorial
                handleSelectTab={handleSelectTab}
                handleChangeZIndex={handleChangeZIndex}
                zIndex={popupZIndexes.indexOf("tutorial") + popupZIndexOffset}
                currentTutorial={currentTutorial}
              />
            )}
            {pageType !== PAGETYPE.RECORD_PLAYER && (
              <Video
                handleSelectTab={handleSelectTab}
                handleChangeZIndex={handleChangeZIndex}
                zIndex={popupZIndexes.indexOf("video") + popupZIndexOffset}
                isOn={popupStates.video}
              />
            )}
            <Snippet
              handleSelectTab={handleSelectTab}
              handleChangeZIndex={handleChangeZIndex}
              zIndex={popupZIndexes.indexOf("snippet") + popupZIndexOffset}
              isOn={popupStates.snippet}
            />

            <API
              handleSelectTab={handleSelectTab}
              handleChangeZIndex={handleChangeZIndex}
              zIndex={popupZIndexes.indexOf("api") + popupZIndexOffset}
              isOn={popupStates.api}
            />
            <Chat
              handleSelectTab={handleSelectTab}
              handleChangeZIndex={handleChangeZIndex}
              zIndex={popupZIndexes.indexOf("chat") + popupZIndexOffset}
              isOn={popupStates.chat}
            />
            <Property
              handleSelectTab={handleSelectTab}
              handleChangeZIndex={handleChangeZIndex}
              zIndex={popupZIndexes.indexOf("property") + popupZIndexOffset}
              isOn={popupStates.property}
            />
            <QnA
              handleSelectTab={handleSelectTab}
              handleChangeZIndex={handleChangeZIndex}
              zIndex={popupZIndexes.indexOf("qna") + popupZIndexOffset}
              isOn={popupStates.qna}
            />
            <Preview
              handleChangeZIndex={handleChangeZIndex}
              handleSelectTab={handleSelectTab}
              zIndex={popupZIndexes.indexOf("preview") + popupZIndexOffset}
            />
            <SpriteBox
              handleSelectTab={handleSelectTab}
              handleChangeZIndex={handleChangeZIndex}
              zIndex={popupZIndexes.indexOf("spriteBox") + popupZIndexOffset}
              isOn={popupStates.spriteBox}
            />
            <SoundBox
              handleSelectTab={handleSelectTab}
              handleChangeZIndex={handleChangeZIndex}
              zIndex={popupZIndexes.indexOf("soundBox") + popupZIndexOffset}
              isOn={popupStates.soundBox}
            />
            <Scene
              handleSelectTab={handleSelectTab}
              handleChangeZIndex={handleChangeZIndex}
              zIndex={popupZIndexes.indexOf("scene") + popupZIndexOffset}
              isOn={popupStates.scene}
            />
          </div>

          <Play pageType={pageType} />
          <Game />
          {(pageType === PAGETYPE.VIDEOCLASS ||
            pageType === PAGETYPE.OCP ||
            pageType === PAGETYPE.OCP2 ||
            pageType === PAGETYPE.TUTORIAL) && <GameEvent />}
          {isProjectPopupOpened && (
            // <Project canClose={true} closeProjectPopup={closeProjectPopup} />
            <Home
              canClose={true}
              pageType={pageType}
              closeProjectPopup={closeProjectPopup}
            />
          )}
          {pageType !== PAGETYPE.RECORD_PLAYER &&
            pageType !== PAGETYPE.WIZLIVE &&
            pageType !== PAGETYPE.MONITOR_1V4 &&
            pageType !== PAGETYPE.WIZLIVE_1V4 &&
            isHelpOpened && <Help handleHelp={handleHelp} />}
          {pageType === PAGETYPE.RECORD_PLAYER && (
            <RecordPlayer
              reservationId={reservationId}
              reservation={reservation}
            />
          )}
          <ToastContainer autoClose={2000} />
          <ReactToolTip
            className={isTooltipPositionLeft ? "left" : ""}
            multiline={true}
            place="bottom"
            effect="solid"
            overridePosition={calculateNewPosition}
          />
        </div>
      );
    }
  }
}

function isOCPPage(pageType) {
  const ocpPageTypes = [PAGETYPE.OCP, PAGETYPE.OCP2];
  return ocpPageTypes.includes(pageType);
}
