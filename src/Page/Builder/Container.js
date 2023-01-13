import React, { Component } from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "react-toastify/dist/ReactToastify.css";
import * as projectActions from "./Store/Reducer/project";
import * as previewActions from "./Store/Reducer/preview";
import * as webrtcActions from "./Store/Reducer/webrtc";
import * as videoActions from "./Store/Reducer/video";
import * as request from "../../Common/Util/HTTPRequest";
import AssetLibrary from "./utils/assetLibrary";
import { PAGETYPE, DEFAULT_VIDEO_URL } from "../../Common/Util/Constant";
import { detectIE } from "../../Common/Util/detectBrowser";
import View from "./View";
import Popup, { showPopUp } from "../../Common/Component/PopUp";
import * as TrackingUtil from "../../Common/Util/TrackingUtil";

class Container extends Component {
  constructor(props) {
    super(props);
    let popupStates = JSON.parse(localStorage.getItem("popupStates"));
    if (!popupStates) {
      popupStates = {
        video: false,
        snippet: false,
        api: false,
        chat: false,
        property: false,
        spriteBox: false,
        preview: false,
        soundBox: false,
        scene: false,
        animation: false,
        qna: false
      };
    }
    popupStates = {
      ...popupStates,
      ocp: props.location.path.split("/")[1] === PAGETYPE.OCP,
      ocp2block:
        props.location.path.split("/")[1] === PAGETYPE.OCP2 &&
        props.location.path.split("/")[2] === PAGETYPE.BLOCK,
      ocp2js:
        props.location.path.split("/")[1] === PAGETYPE.OCP2 &&
        props.location.path.split("/")[2] === PAGETYPE.JS,
      tutorial: props.location.path.split("/")[1] === PAGETYPE.TUTORIAL,
      live: props.location.path.split("/")[1] === PAGETYPE.WIZLIVE,
      live1v4: props.location.path.split("/")[1] === PAGETYPE.WIZLIVE_1V4,
      monitor1v4: props.location.path.split("/")[1] === PAGETYPE.MONITOR_1V4
    };

    let popupZIndexes = JSON.parse(localStorage.getItem("popupZIndexes"));
    if (!popupZIndexes || !popupZIndexes.includes("snippet")) {
      popupZIndexes = [
        "ocp",
        "ocp2block",
        "ocp2js",
        "tutorial",
        "live",
        "video",
        "snippet",
        "api",
        "chat",
        "property",
        "spriteBox",
        "preview",
        "soundBox",
        "scene",
        "animation",
        "qna"
      ];
    }

    this.templateId = localStorage.getItem("templateId");

    this.roomId = null;

    this.state = {
      isLoading: true,
      isProjectPopupOpened: false,
      params: props.location.params,
      pageType: props.location.path.split("/")[1],
      popupStates,
      popupZIndexes,
      currentTutorial: undefined,
      videoclassRef: undefined,
      isTooltipPositionLeft: false,
    };

    switch (this.state.pageType) {
      case PAGETYPE.WIZLIVE:
        this.state.reservationId = null;
        this.state.roomId = null;
        this.state.isTutor = null;
        this.state.studentEmail = null;
        this.state.tutorEmail = null;
        this.state.isFreeTrial = null;
        break;
      case PAGETYPE.WIZLIVE_1V4:
      case PAGETYPE.MONITOR_1V4:
        this.state.reservationId = null;
        this.state.roomId = null;
        this.state.isTutor = null;
        this.state.studentEmail = null;
        this.state.tutorEmail = null;
        this.state.isFreeTrial = null;
        break;
      case PAGETYPE.RECORD_PLAYER:
        this.state.reservationId = this.state.params.reservationId;
        break;
      default:
        break;
    }

    this.isIE = detectIE();
  }

  componentDidMount = async () => {
    try {
      if (this.isIE) {
        this.props.history.replace("/" + PAGETYPE.BUILDER);
        return;
      }

      let { email } = this.props;
      const { pageType, params } = this.state;
      const { pId, step, grade, reservationId, type } = params;

      if (pageType === PAGETYPE.WIZLIVE_1V4) {
        const regexRoomId = /(\w+)-(\w+)-(\w+)-(\w+)-(\w+)-(?<roomId>\w+)/;

        const {
          groups: { roomId }
        } = regexRoomId.exec(pId);

        this.roomId = roomId;
      }

      // this.timer = setInterval(() => {
      //   request.updateBuilderUsageTime({
      //     email: this.props.email,
      //     time: new Date().getTime()
      //   });
      // }, 1000);

      // TrackingUtil.sendPageEvent("/" + pageType, this.props.email);

      switch (pageType) {
        case PAGETYPE.WIZLIVE:
          const wizLiveRoom = await request
            .getWizLiveRoomId({ email })
            .then(res => res.json());
          if (wizLiveRoom && wizLiveRoom.roomId) {
            wizLiveRoom.myLecture.lecture.guideVideo &&
              this.props.setVideoURL(wizLiveRoom.myLecture.lecture.guideVideo);
            this.setState(
              {
                reservationId: wizLiveRoom.id,
                roomId: wizLiveRoom.roomId,
                isTutor: wizLiveRoom.isTutor,
                studentEmail: wizLiveRoom.studentEmail,
                tutorEmail: wizLiveRoom.tutorEmail,
                lectureVideos: JSON.parse(wizLiveRoom.myLecture.lecture.video),
                lectureSlides: JSON.parse(wizLiveRoom.myLecture.lecture.slides),
                lectureState: wizLiveRoom.myLecture.lecture.state,
                lectureTitle: wizLiveRoom.myLecture.lecture.title,
                isFreeTrial: wizLiveRoom.isFreeTrial
              },
              () => {
                this.loadWizlab();
              }
            );
          } else {
            showPopUp(
              <Popup.OneButton
                intl={this.props.intl}
                titleId="ID_BUILDER_ALERT_MSG_CLIVE_NOT_FOUND"
                buttonNameId="ID_BUILDER_ALERT_CONFIRMBTN"
                buttonAction={() => {
                  if (pId)
                    this.props.history.replace(`/${PAGETYPE.BUILDER}/${pId}`);
                  else this.props.history.replace("/" + PAGETYPE.WIZLIVE);
                }}
              />
            );
          }
          break;
        case PAGETYPE.MONITOR_1V4:
        case PAGETYPE.WIZLIVE_1V4:
          let wizLive1v4Room;

          if (pageType === PAGETYPE.MONITOR_1V4) {
            email = window.prompt(
              "튜터의 이메일을 입력해주세요",
              "johnjs@wizschool.io"
            );

            wizLive1v4Room = await request
              .getMonitorRoom1v4({ email })
              .then(res => res.json());
          } else {
            // WIZLIVE_1v4
            wizLive1v4Room = await request
              .getWizLive1v4RoomId({ email, roomId: this.roomId })
              .then(res => res.json());
          }

          if (wizLive1v4Room && wizLive1v4Room.roomId) {
            // wizLiveRoom.myLecture.lecture.guideVideo &&
            //   this.props.setVideoURL(wizLiveRoom.myLecture.lecture.guideVideo);
            this.setState(
              {
                reservationId: wizLive1v4Room.id,
                roomId: wizLive1v4Room.roomId,
                isTutor:
                  pageType === PAGETYPE.MONITOR_1V4
                    ? false
                    : wizLive1v4Room.isTutor,
                studentEmail: wizLive1v4Room.studentEmail,
                tutorEmail: wizLive1v4Room.tutorEmail,
                lectureVideos: JSON.parse(
                  wizLive1v4Room.myLecture.lecture.video
                ),
                lectureSlides: JSON.parse(
                  wizLive1v4Room.myLecture.lecture.slides
                ),
                lectureState: wizLive1v4Room.myLecture.lecture.state,
                lectureTitle: wizLive1v4Room.myLecture.lecture.title,
                isFreeTrial: wizLive1v4Room.isFreeTrial
              },
              () => {
                if (pageType === PAGETYPE.WIZLIVE_1V4) {
                  this.loadWizlab();
                } else if (pageType === PAGETYPE.MONITOR_1V4) {
                  this.defaultMonitor();
                }
              }
            );
          } else {
            showPopUp(
              <Popup.OneButton
                intl={this.props.intl}
                titleId="ID_BUILDER_ALERT_MSG_CLIVE_NOT_FOUND"
                buttonNameId="ID_BUILDER_ALERT_CONFIRMBTN"
                buttonAction={() => {
                  if (pId)
                    this.props.history.replace(`/${PAGETYPE.BUILDER}/${pId}`);
                  else this.props.history.replace("/" + PAGETYPE.WIZLIVE);
                }}
              />
            );
          }
          break;
        case PAGETYPE.BUILDER:
          this.loadWizlab();
          break;
        case PAGETYPE.BUILDER_EDIT:
          this.loadWizlab();
          break;
        case PAGETYPE.BUILDER_READONLY:
          showPopUp(
            <Popup.OneButton
              intl={this.props.intl}
              titleId="ID_BUILDER_ALERT_MSG_READONLY"
              buttonNameId="ID_BUILDER_ALERT_CONFIRMBTN"
            />
          );
          this.loadWizlab();
          break;
        case PAGETYPE.QNA_READONLY:
          showPopUp(
            <Popup.OneButton
              intl={this.props.intl}
              titleId="ID_BUILDER_ALERT_MSG_READONLY"
              buttonNameId="ID_BUILDER_ALERT_CONFIRMBTN"
            />
          );
          this.loadWizlabForQuestion();
          break;
        case PAGETYPE.VIDEOCLASS:
          this.loadDefaultProject();
          break;
        case PAGETYPE.OCP:
          const stage = require(`./utils/ocp/${grade}/stages/${
            step > 10 ? 10 : step
          }`);
          let ocpClass = stage.data;
          ocpClass.state = stage.state;
          AssetLibrary.loadAssetsFromScene(ocpClass.state.scene, () => {
            this.props.setProject({
              state: ocpClass.state,
              videoclass: ocpClass
            });
            this.setState({ isLoading: false });
          });
          break;
        case PAGETYPE.OCP2:
          try {
            let ocp2Template;
            if (this.props.location.path.split("/")[2] === PAGETYPE.BLOCK) {
              ocp2Template = require(`./Component/OCP2/template/block/${grade}/${step}`);
            } else if (this.props.location.path.split("/")[2] === PAGETYPE.JS) {
              ocp2Template = require(`./Component/OCP2/template/${type}/${grade}/${step}`);
            }
            AssetLibrary.loadAssetsFromScene(ocp2Template.state.scene, () => {
              this.props.setProject({
                state: ocp2Template.state,
                videoclass: ocp2Template.data
              });
              this.setState({ isLoading: false });
            });
          } catch (e) {
            console.error(e);
            showPopUp(
              <Popup.OneButton
                title="수업정보가 올바르지 않습니다"
                buttonName="확인"
              />
            );
          }
          break;
        case PAGETYPE.TUTORIAL:
          if (!this.props.email) {
            showPopUp(
              <Popup.OneButton
                title="로그인 후 이용해주세요"
                buttonName="확인"
              />
            );
            this.loadDefaultProject();
            return;
          }
          this.loadTutorial();
          break;
        case PAGETYPE.RECORD_PLAYER:
          const reservation = await request
            .getReservationById({ reservationId })
            .then(res => res.json());
          this.setState({ reservation: reservation.reservation }, () => {
            this.loadRecordProject();
          });
          break;
        case PAGETYPE.MONITOR:
          this.defaultMonitor();
          break;
        case PAGETYPE.DREAMCLASS:
          this.setState({ 
            isLoading: false, 
            popupStates: {
              video: false,
              snippet: false,
              api: false,
              chat: false,
              property: false,
              spriteBox: false,
              preview: false,
              soundBox: false,
              scene: false,
              animation: false,
              qna: false
            } 
          });
          break;
        default:
          this.loadWizlab();
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  componentWillUnmount = () => {
    // this.timer && clearInterval(this.timer);
    localStorage.removeItem("templateId");
  };

  loadTutorial = async () => {
    /** load & valid check */
    let myLevelInx = 0;
    let res = await request.getMyTutorialList({ email: this.props.email });
    let list = await res.json();
    let completeArr = list.rows.filter(item => {
      return item.isComplete;
    });
    if (completeArr.length) {
      myLevelInx = completeArr.reduce((pv, cv) => {
        return pv.tutorial.level > cv.tutorial.level ? pv : cv;
      }).tutorial.level;
    }

    const levelItem = await request
      .getMyTutorial({
        email: this.props.email,
        level: this.state.params.level
      })
      .then(res => res.json());

    if (!levelItem) {
      if (myLevelInx + 1 === Number(this.state.params.level)) {
        await request.createTutorialItem({
          email: this.props.email,
          level: this.state.params.level
        });
        window.location.reload();
      } else {
        showPopUp(
          <Popup.OneButton
            title="잘못된 경로입니다"
            buttonName="확인"
            buttonAction={() => this.loadDefaultProject()}
          />
        );
      }
    } else {
      const template = JSON.parse(levelItem.tutorial.template);
      const tutorialState = JSON.parse(levelItem.tutorial.state);
      AssetLibrary.loadAssetsFromScene(tutorialState.scene, () => {
        this.props.setProject({
          state: tutorialState,
          videoclass: template
        });
        this.setState({ isLoading: false, currentTutorial: levelItem });
      });
    }
  };

  defaultMonitor = async () => {
    try {
      let response = await request.getDefaultProject();
      const project = await response.json();

      this.setBrowserTitle(project.name);
      project.state = JSON.parse(project.state);

      AssetLibrary.loadAssetsFromScene(project.state.scene, () => {
        this.props.setProject(project);
        this.setState({ isLoading: false });
      });
    } catch (e) {
      console.error(e);
    }
  };

  loadWizlab = () => {
    document.title = "Astro Coding Go!";
    // const { pId } = this.state.params;
    // if (pId) {
    //   if (this.props.email) {
    //     this.loadProject(pId);
    //   } else {
    //     this.handleDefaultCase();
    //   }
    // } else {
    //   this.handleDefaultCase();
    // }
    const { pId } = this.state.params;
    if (this.props.email) {
      if (pId) {
        this.loadProject(pId);
      } else {
        this.setState({ isProjectPopupOpened: true });
      }
    } else {
      // this.handleDefaultCase();
      if (!this.props.email && this.templateId) {
        this.loadTemplateProject(this.templateId);
        localStorage.removeItem("templateId");
        return;
      }

      try {
        const urlParams = new URLSearchParams(window.location.search);
        const templateId = urlParams.get("t");
        if (templateId) {
          this.loadTemplateProject(templateId);
        } else {
          this.setState({ isProjectPopupOpened: true });
        }
      } catch (e) {
        this.setState({ isProjectPopupOpened: false });
      }
    }
  };

  loadWizlabForQuestion = async () => {
    const questionId = this.state.params.questionId;
    let response = await request.getQuestionState({ id: questionId });
    let projectState = await response.json();
    if (projectState) {
      projectState = JSON.parse(projectState.state);

      AssetLibrary.loadAssetsFromScene(projectState.scene, () => {
        const project = {
          state: projectState,
          name: ""
        };
        this.props.setProject(project);
        this.setState({ isLoading: false });
      });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.email && !this.props.email) {
      this.props.history.replace({ pathname: "/" + PAGETYPE.BUILDER });
      window.location.reload();
    } else if (
      !prevProps.email &&
      this.props.email &&
      this.state.pageType !== PAGETYPE.OCP &&
      this.state.pageType !== PAGETYPE.OCP2BLOCK &&
      this.state.pageType !== PAGETYPE.OCP2JS &&
      this.state.pageType !== PAGETYPE.OCP2
    ) {
      this.props.history.replace({ pathname: "/" + PAGETYPE.BUILDER });
      window.location.reload();
    }
  }

  openProjectPopup = () => {
    this.setState({ isProjectPopupOpened: true });
  };

  closeProjectPopup = () => {
    this.setState({ isProjectPopupOpened: false });
  };

  loadRecordProject = async () => {
    const state = JSON.parse(this.state.reservation.myLecture.lecture.state);
    AssetLibrary.loadAssetsFromScene(state.scene, () => {
      this.props.setProject({ state });
      this.setState({ isLoading: false });
    });
  };

  loadProject = async pId => {
    try {
      let response = await request.getDevelopingProject({ pId });
      const project = await response.json();
      if (project) {
        if (
          this.state.pageType === PAGETYPE.BUILDER_READONLY ||
          this.state.pageType === PAGETYPE.QNA_READONLY
        ) {
          if (!this.props.isTutor) {
            this.props.history.replace({ pathname: "/" + PAGETYPE.BUILDER });
            return;
          }
        } else if (
          project.email !== this.props.email &&
          this.state.pageType !== PAGETYPE.WIZLIVE &&
          this.state.pageType !== PAGETYPE.WIZLIVE_1V4
        ) {
          this.props.history.replace({
            pathname: "/" + PAGETYPE.BUILDER
          });
          return;
        }

        this.setBrowserTitle(project.name);
        project.state = JSON.parse(project.state);

        AssetLibrary.loadAssetsFromScene(project.state.scene, () => {
          this.props.setProject(project);
          this.setState({ isLoading: false });
        });
      } else {
        const { templateId } = this.state.params;
        this.createNewProjectFromServer(pId, templateId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  setBrowserTitle = title => {
    document.title = `Astro Coding Go!`;
    if (title) document.title += ` - ${title}`;
  };

  createNewProjectFromServer = async (pId, templateId) => {
    let name;
    const email = this.props.email;

    if (this.state.lectureTitle) {
      name = this.state.lectureTitle;
    } else {
      const randomChar = String.fromCharCode(
        Math.floor(Math.random() * Math.floor(48)) + 48
      ); //temp
      name = this.props.intl.formatMessage(
        { id: "ID_TIP_LAYOUT_NEW_PROJECT_FORMAT" },
        { randomChar: randomChar }
      );
    }
    let params = { pId, email, name };
    if (this.state.lectureState) {
      params.state = this.state.lectureState;
    }
    if (templateId) {
      params.templateId = templateId;
    }
    try {
      const response = await request.postDevelopingProject(params);
      const project = await response.json();
      this.setBrowserTitle(project.name);
      project.state = JSON.parse(project.state);
      project.video = {
        videoURL: DEFAULT_VIDEO_URL
      };

      AssetLibrary.loadAssetsFromScene(project.state.scene, () => {
        this.props.setProject(project);
        this.setState({ isLoading: false });
      });
    } catch (e) {
      console.error(e);
    }
  };

  loadDefaultProject = async () => {
    const response = await request.getDefaultProject();
    const project = await response.json();

    project.name = "";
    this.setBrowserTitle(project.name);
    project.state = JSON.parse(project.state);
    project.video = {
      videoURL: DEFAULT_VIDEO_URL
    };
    AssetLibrary.loadAssetsFromScene(project.state.scene, () => {
      this.props.setProject(project);
      this.setState({ isLoading: false });
    });
  };

  loadTemplateProject = async templateId => {
    const response = await request.getDefaultTemplateProject({
      id: templateId
    });
    const project = await response.json();

    project.name = "";
    this.setBrowserTitle(project.name);
    project.state = JSON.parse(project.state);
    project.video = {
      videoURL: DEFAULT_VIDEO_URL
    };
    AssetLibrary.loadAssetsFromScene(project.state.scene, () => {
      this.props.setProject(project);
      this.setState({ isLoading: false });
    });
  };

  handleSelectMainViewMode = mainViewMode => {
    this.setState({ mainViewMode });
  };

  handleChangeZIndex = name => {
    const sort = arr => {
      let indexes = arr.slice();
      for (let i = 0; i < indexes.length; i++) {
        if (name === indexes[i]) {
          const value = indexes[i];
          indexes.splice(i, 1);
          indexes.push(value);
          break;
        }
      }
      return indexes;
    };

    this.setState(
      state => {
        return {
          popupZIndexes: sort(state.popupZIndexes)
        };
      },
      () => {
        localStorage.setItem(
          "popupZIndexes",
          JSON.stringify(this.state.popupZIndexes)
        );
      }
    );
  };

  handleSelectTab = (name, from) => {
    this.props.setLog({ [name]: !this.state.popupStates[name] });
    if (!this.state.popupStates[name]) {
      if (name === "spriteView" || name === "sound" || name === "preview") {
        TrackingUtil.sendGAEvent({
          category: "Builder",
          action: `MenuActions`,
          label: name[0].toUpperCase() + name.slice(1)
        });
      }

      if (name === "spriteBox") {
        TrackingUtil.sendGAEvent({
          category: "Builder",
          action: `AddSprite`,
          label: from
        });
      }
    }
    this.setState(
      state => {
        return {
          popupStates: {
            ...state.popupStates,
            [name]: !state.popupStates[name]
          }
        };
      },
      () => {
        localStorage.setItem(
          "popupStates",
          JSON.stringify({
            ...this.state.popupStates,
            ocp: undefined,
            tutorial: undefined,
            live: undefined
          })
        );
        if (this.state.popupStates[name]) {
          this.handleChangeZIndex(name);
        }
      }
    );
  };

  showModal = modalContent => {
    this.setState({ modalContent });
  };
  handleHelp = isHelpOpened => {
    this.setState({ isHelpOpened });
  };

  setVideoclassRef = ref => {
    this.setState({ videoclassRef: ref });
  };

  render() {
    const { screenMode, location, email, name } = this.props;
    const {
      pageType,
      roomId,
      reservationId,
      isTutor,
      isLoading,
      tutorEmail,
      studentEmail,
      lectureVideos,
      lectureSlides,
      reservation,
      isProjectPopupOpened,
      modalContent,
      isHelpOpened,
      popupStates,
      popupZIndexes,
      currentTutorial,
      isFreeTrial,
      videoclassRef,
      isTooltipPositionLeft
    } = this.state;
    const { pId } = this.state.params;
    const {
      isIE,
      openProjectPopup,
      closeProjectPopup,
      handleHelp,
      handleChangeZIndex,
      handleSelectTab,
      showModal,
      setVideoclassRef
    } = this;

    const calculateNewPosition = pos => {
      if(pos.left <= 0)  {
        !isTooltipPositionLeft && this.setState({ isTooltipPositionLeft : true})
      } else {
        isTooltipPositionLeft && this.setState({ isTooltipPositionLeft : false})
      }
      
      const newPosition = {
        top: pos.top,
        left: pos.left <= 0 ? 0 : pos.left,
      };
      return newPosition;
    };

    return (
      <DndProvider backend={HTML5Backend}>
        <View
          screenMode={screenMode}
          location={location}
          pageType={pageType}
          roomId={roomId}
          reservationId={reservationId}
          isTutor={isTutor}
          isLoading={isLoading}
          isIE={isIE}
          tutorEmail={tutorEmail}
          studentEmail={studentEmail}
          lectureVideos={lectureVideos}
          lectureSlides={lectureSlides}
          pId={pId}
          reservation={reservation}
          isProjectPopupOpened={isProjectPopupOpened}
          openProjectPopup={openProjectPopup}
          closeProjectPopup={closeProjectPopup}
          modalContent={modalContent}
          showModal={showModal}
          isHelpOpened={isHelpOpened}
          handleHelp={handleHelp}
          popupStates={popupStates}
          popupZIndexes={popupZIndexes}
          handleChangeZIndex={handleChangeZIndex}
          handleSelectTab={handleSelectTab}
          currentTutorial={currentTutorial}
          isFreeTrial={isFreeTrial}
          videoclassRef={videoclassRef}
          setVideoclassRef={setVideoclassRef}
          email={email}
          name={name}
          calculateNewPosition={calculateNewPosition}
          isTooltipPositionLeft={isTooltipPositionLeft}
        />
      </DndProvider>
    );
  }
}

export default connect(
  state => ({
    email: state.userinfo.email,
    name: state.userinfo.name,
    isTutor: state.userinfo.isTutor,
    screenMode: state.preview.screenMode
  }),
  {
    setProject: projectActions.setProject,
    resetProject: projectActions.resetProject,
    setGameVolume: previewActions.setGameVolume,
    setLog: webrtcActions.setLog,
    setVideoURL: videoActions.setVideoURL
  }
)(injectIntl(Container));
