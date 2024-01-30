import React, { Component } from "react";
import { connect } from "react-redux";
// import moment from "moment";
import { withRouter } from "react-router-dom";
import store from "../../Store";
import { injectIntl } from "react-intl";
import * as userInfoActions from "../../../../Common/Store/Reducer/UserInfo";
import * as projectActions from "../../../Builder/Store/Reducer/project";
import { PAGETYPE } from "../../../../Common/Util/Constant";
import checkBlockedUser from "../../../../Common/Util/CheckBlockedUser";
import PopUp, {
  showPopUp,
  showPopUpBuilder,
} from "../../../../Common/Component/PopUp";
import InstantMobileRun from "../../../../Common/Component/InstantMobileRun";
import QRPopup from "../../../../Common/Component/QRPopup";
import Publish from "../../../../Common/Component/Publish";
import SignIn from "../../../../Common/Component/SignIn";
import { getColorTheme, toggleColorTheme } from "../../utils/colorThemeUtil";
import * as TrackingUtil from "../../../../Common/Util/TrackingUtil";
import * as modalActions from "../../Store/Reducer/modal";
import * as webrtcActions from "../../Store/Reducer/webrtc";
import * as request from "../../../../Common/Util/HTTPRequest";
import View from "./View";

class Container extends Component {
  constructor(props) {
    super(props);
    this.pageType = props.match.path.split("/")[1];
    this.pageParams = props.match.params;
    let isMenuEnabled = true;
    if (this.pageType === PAGETYPE.TUTORIAL && this.pageParams.level !== "10") {
      isMenuEnabled = false;
    }
    this.state = {
      currentTheme: getColorTheme(),
      isMenuEnabled,
      isClickPublish: false,
      isTrial: false,
    };
  }

  componentDidMount() {
    const userEmail =
      JSON.parse(localStorage.getItem("userInfo")).email || null;
    if (userEmail === "trial_student@redbrick.space") {
      this.setState({ isTrial: true });
    }
    const didReadHelp = localStorage.getItem("didReadHelp");
    if (!didReadHelp && this.pageType !== PAGETYPE.OCP2) {
      this.openHelp();
    }
  }

  handleChangeTheme = () => {
    toggleColorTheme();
    this.setState({ currentTheme: getColorTheme() }, () => {
      TrackingUtil.sendGAEvent({
        category: "Builder",
        action: `ChangeColorMode`,
        label: getColorTheme(),
      });
    });
  };

  openInstantRunPopup = () => {
    TrackingUtil.sendGAEvent({
      category: "Builder",
      action: `MenuActions`,
      label: "MobilePlay",
    });
    showPopUp(<InstantMobileRun />, {
      store,
      defaultPadding: false,
      dismissOverlay: true,
    });
  };

  openSharePopup = () => {
    TrackingUtil.sendGAEvent({
      category: "Builder",
      action: `MenuActions`,
      label: "Share",
    });
    showPopUpBuilder(
      <QRPopup project={this.props.project} isBuilder={true} />,
      {
        store,
        defaultPadding: false,
        dismissOverlay: true,
        overflow: true,
      }
    );
  };

  clickPublishPopup = () => {
    this.setState({ isClickPublish: !this.state.isClickPublish });
  };

  //////////////openPublishPopup시작//////////////
  openPublishPopup = () => {
    this.setState({ isClickPublish: false });
    const isBlocked = checkBlockedUser(this.props.userinfo);
    if (isBlocked) {
      return;
    }
    if (!this.props.userinfo.email) {
      TrackingUtil.sendGAEvent({
        category: "Builder",
        action: `MenuActions`,
        label: "Publishing",
      });

      // 퍼블리싱 팝업 open
      this.props.setLog({ publish: true });

      if (this.pageType === PAGETYPE.TUTORIAL) {
        showPopUpBuilder(
          <Publish
            isDeveloping={true}
            isBuilder={true}
            tutorialLevel={this.pageParams.level * 1}
          />,
          {
            store,
            dismissOverlay: false,
            defaultPadding: false,
            scrollable: true,
          }
        );
      } else {
        showPopUpBuilder(<Publish isDeveloping={true} isBuilder={true} />, {
          store,
          dismissOverlay: false,
          defaultPadding: false,
          scrollable: true,
        });
      }
    } else {
      this.openLoginPopup();
    }
  };
  // openPublishPopup = () => {
  //   this.setState({ isClickPublish: false });
  //   const isBlocked = checkBlockedUser(this.props.userinfo);
  //   if (isBlocked) {
  //     return;
  //   }
  //   if (this.props.userinfo.email) {
  //     TrackingUtil.sendGAEvent({
  //       category: "Builder",
  //       action: `MenuActions`,
  //       label: "Publishing"
  //     });

  //     // 퍼블리싱 팝업 open
  //     this.props.setLog({ publish: true });

  //     if (this.pageType === PAGETYPE.TUTORIAL) {
  //       showPopUp(
  //         <Publish
  //           isDeveloping={true}
  //           isBuilder={true}
  //           tutorialLevel={this.pageParams.level * 1}
  //         />,
  //         {
  //           store,
  //           dismissOverlay: false,
  //           defaultPadding: false,
  //           scrollable: true
  //         }
  //       );
  //     } else {
  //       showPopUp(<Publish isDeveloping={true} isBuilder={true} />, {
  //         store,
  //         dismissOverlay: false,
  //         defaultPadding: false,
  //         scrollable: true
  //       });
  //     }
  //   } else {
  //     this.openLoginPopup();
  //   }
  // };

  openPublishGame = () => {
    this.setState({ isClickPublish: false });

    // 퍼블리싱 한 게임 보기
  };

  openLoginPopup = () => {
    showPopUp(<SignIn isBuilder={true} />, {
      store,
      mobileFullscreen: true,
    });
  };

  openHelp = () => {
    this.props.handleHelp(true);
  };

  handleLogout = () => {
    localStorage.removeItem("astroToken");
    this.props.updateUserInfo();
  };

  handleTemplateBtn = () => {
    this.props.setIsAppModalOn(true, "PROJECTLIST");
  };

  editProjectName = (pId, newName) => {
    request
      .updateDevelopingProject({ pId, name: newName })
      .then((res) => res.json)
      .catch((e) => console.error(e));
    this.props.setProjectName(newName);
  };

  handlechangeProjectName = (pId, name) => {
    showPopUp(
      <PopUp.OneInput
        titleId="ID_PROJECT_POPUP_EDIT_TITLE"
        defaultInput={name}
        buttonNameId="ID_PROJECT_POPUP_EDIT_OK"
        buttonAction={(newVal) => {
          this.editProjectName(pId, newVal);
        }}
      />,
      { store, dismissOverlay: true }
    );
  };

  render() {
    const {
      userinfo,
      project,
      openProjectPopup,
      intl,
      isTutor,
      isAppModalOn,
      appModalType,
      handleSelectTab,
      editorMode,
    } = this.props;
    const {
      openInstantRunPopup,
      openSharePopup,
      openPublishPopup,
      openLoginPopup,
      openHelp,
      handleLogout,
      handleChangeTheme,
      handleTemplateBtn,
      clickPublishPopup,
      handlechangeProjectName,
    } = this;
    const { currentTheme, isMenuEnabled, isClickPublish, isTrial } = this.state;
    return (
      <View
        isTrial={isTrial}
        email={userinfo.email}
        name={userinfo.name}
        icon={userinfo.icon}
        project={project}
        openProjectPopup={openProjectPopup}
        openInstantRunPopup={openInstantRunPopup}
        openSharePopup={openSharePopup}
        openPublishPopup={openPublishPopup}
        clickPublishPopup={clickPublishPopup}
        openLoginPopup={openLoginPopup}
        openHelp={openHelp}
        handleLogout={handleLogout}
        handleChangeTheme={handleChangeTheme}
        currentTheme={currentTheme}
        isMenuEnabled={isMenuEnabled}
        intl={intl}
        pageType={this.pageType}
        isTutor={isTutor}
        isAppModalOn={isAppModalOn}
        appModalType={appModalType}
        handleTemplateBtn={handleTemplateBtn}
        handleSelectTab={handleSelectTab}
        editorMode={editorMode}
        isClickPublish={isClickPublish}
        handlechangeProjectName={handlechangeProjectName}
      />
    );
  }
}

export default connect(
  (state) => ({
    userinfo: state.userinfo,
    isTutor: state.userinfo.isTutor,
    email: state.userinfo.email,
    icon: state.userinfo.icon,
    name: state.userinfo.name,
    project: state.project,
    isAppModalOn: state.modal.isAppModalOn,
    appModalType: state.modal.appModalType,
    editorMode: state.scene.editorMode,
  }),
  {
    updateUserInfo: userInfoActions.updateUserInfo,
    setIsAppModalOn: modalActions.setIsAppModalOn,
    setLog: webrtcActions.setLog,
    setProjectName: projectActions.setProjectName,
  }
)(injectIntl(withRouter(Container)));
