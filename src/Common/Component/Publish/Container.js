import React, { Component } from "react";
import { connect } from "react-redux";
import ReactToolTip from "react-tooltip";
import { injectIntl } from "react-intl";
import * as request from "../../Util/HTTPRequest";
import * as projectActions from "../../../Page/Builder/Store/Reducer/project";
import * as webrtcActions from "../../../Page/Builder/Store/Reducer/webrtc";
import generateGamePage from "../../../Page/Builder/utils/gamePageGenerator";
import { getColorTheme } from "../../../Page/Builder/utils/colorThemeUtil";
import { generatePIDForTutorial } from "../../Util/PIDGenerator";
import { ImageCompressor } from "../../Util/FileCompressor";
import stringify from "json-stringify-safe";
import PopUp, { showPopUp } from "../PopUp";
import jwt_decode from "jwt-decode";
import View from "./View";
import "./index.scss";

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      description: "",
      icon: "",
      iconUpdated: undefined,
      isCopyAllowed: undefined,
      isCodeCopyAllowed: undefined,
      tags: [],
      popularTags: [],
      challengeEventAttend: false,
      nameValidation: true,
      descriptionValidation: true,
      isCustomThumbnail: false,
    };
    if (this.props.isBuilder) {
      require("./index_builder.scss");
    }
  }
  componentDidMount = async () => {
    const pId = window.location.pathname.slice(1);
    request
      .getSaasDevelopingProject(pId)
      .then((res) => res.json())
      .then((json) => {
        const { title, thumbnailURL, isVisible, isCodeCopiable, description } =
          json.data.projectInfo;
        this.setState({
          name: title,
          icon: thumbnailURL,
          isCopyAllowed: isVisible,
          isCodeCopyAllowed: isCodeCopiable,
          description: description,
        });
      });

    const popup = document
      .querySelector(".publishpopup")
      .closest(".popup_contents");
    const dismissBtn = popup.querySelector("#popup_dismissbtn");
    dismissBtn.style.display = "none";
  };
  handleCheckValidation = (target) => {
    const stateName = `${target.name}Validation`;
    this.setState({ [stateName]: target.value ? true : false });
  };
  handleInputChange = (e) => {
    const target = e.target;
    this.setState({ [target.name]: target.value });
    if (target.name !== "tag") {
      this.handleCheckValidation(target);
    }
  };
  handleIsCopyAllowedChange = (e) => {
    this.setState((state) => ({
      isCopyAllowed: !state.isCopyAllowed,
    }));
  };
  handleIsCodeCopyAllowedChange = (e) => {
    this.setState((state) => ({
      isCodeCopyAllowed: !state.isCodeCopyAllowed,
    }));
  };
  handleImgClick = () => {
    document.getElementById("PublishForm__icon__input").click();
  };
  handleAddClick = () => {
    document.getElementById("PublishForm__icon__input").click();
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { name, description, isCopyAllowed, isCodeCopyAllowed } = this.state;
    const pId =
      window.location.pathname.split("/")[2] ||
      window.location.pathname.slice(1);
    let downloadUrl;
    if (this.props.scene) {
      const state = {
        editorMode: this.props.scene.editorMode,
        scene: {
          scenes: this.props.scene.scenes,
          sceneIds: this.props.scene.sceneIds,
          soundIds: this.props.scene.soundIds,
          soundNames: this.props.scene.soundNames,
        },
        preview: {
          screenMode: this.props.preview.screenMode,
        },
      };
      const gameMeta = { pId, gameTitle: name };
      const doc = await generateGamePage(state, gameMeta);
      let url = await request.uploadSaasPublished();
      url = await url.json();
      const uploadUrl = url.url.uploadUrl;
      downloadUrl = url.url.downloadUrl;
      const putResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "html",
        },
        body: doc,
      });
      console.log("putResponse :", putResponse);
    }
    let params = {
      isVisible: isCopyAllowed,
      isCodeCopiable: isCodeCopyAllowed,
      description: description,
    };
    if (name) {
      params.title = name;
    }
    if (this.state.icon) {
      params.thumbnailURL = this.state.icon;
    }
    if (this.state.isCustomThumbnail) {
      params.isCustomThumbnail = true;
    }
    if (downloadUrl) {
      params.sampleGameURL = downloadUrl;
    }
    try {
      request
        .updateSaasProject({ params, pId })
        .then((res) => res.json())
        .then((json) => console.log("json", json));
    } catch (e) {
      console.error(e);
    }

    showPopUp(
      <PopUp.OneButton
        title={this.props.intl.formatMessage({
          id: "ID_BUILDER_ALERT_MSG_SUCC",
        })}
        buttonName={this.props.intl.formatMessage({
          id: "ID_BUILDER_ALERT_CONFIRMBTN",
        })}
        buttonAction={this.props.buttonAction}
      />,
      {
        dismissButton: false,
        darkmode: getColorTheme() === "darkMode",
      }
    );
  };
  handleCloseBtn = () => {
    // 퍼블리싱 팝업 종료
    this.props.setLog({ publish: false });
    this.props.dismiss();
  };

  // 게임 썸네일 등록하기 (수정)
  handleFileInput = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      let reader = new FileReader();
      reader.onload = () => {
        this.setState({ iconUpdated: reader.result });
      };
      reader.readAsDataURL(e.target.files[0]);
    }

    if (!selectedFile) return;

    try {
      const uploadResponse = await request.projectIconUpload(
        window.location.pathname.split("/")[2] ||
          window.location.pathname.slice(1)
      );
      const uploadData = await uploadResponse.json();
      const putUrl = uploadData.url.uploadUrl;
      const downloadUrl = uploadData.url.downloadUrl;
      const putResponse = await fetch(putUrl, {
        method: "PUT",
        headers: {
          // "Content-Type": "multipart/form-data",
          "Content-Type": "image/jpeg",
        },
        body: selectedFile,
      });

      console.log("putResponse", putResponse);
      this.setState({ icon: downloadUrl });
      this.setState({ isCustomThumbnail: true });
    } catch (error) {
      console.error("파일 업로드 실패 : ", error);
    }
  };
  handleFileDelete = () => {
    const { isDeveloping } = this.props;
    if (isDeveloping) {
      document.getElementById("PublishForm__icon__input").value = "";
      this.props.setScreenshotURL(null, false);
    }
  };

  getIcon = () => {
    const { isDeveloping } = this.props;
    if (isDeveloping) {
      return this.props.project.screenshotURL;
    } else {
      return this.state.icon;
    }
  };
  getPID = () => {
    const { email, isDeveloping, tutorialLevel } = this.props;
    if (isDeveloping) {
      if (tutorialLevel) {
        return generatePIDForTutorial(email, tutorialLevel);
      } else {
        return this.props.project.pId;
      }
    } else {
      return this.props.pId;
    }
  };

  onAddTag = (tag) => {
    const { tags } = this.state;
    if (tags.indexOf(tag) < 0 && tags.length <= 10) {
      if (tag.length > 10) {
        tag = tag.substring(0, 10);
      }
      this.setState({ tags: [].concat(tags, tag) });
    }
  };
  onDeleteTag = (index) => {
    const tags = [...this.state.tags];
    tags.splice(index, 1);
    this.setState({ tags });
  };

  handleChallengeEvent = (e) => {
    this.setState({ challengeEventAttend: e.target.checked });
    if (e.target.checked) this.onAddTag("챌린지");
  };
  render() {
    const {
      name,
      description,
      isCopyAllowed,
      isCodeCopyAllowed,
      tags,
      popularTags,
      challengeEventAttend,
      nameValidation,
      descriptionValidation,
    } = this.state;
    const icon = this.state.icon;
    const { isDeveloping, isTutorial, project } = this.props;
    return (
      <div>
        <View
          name={name}
          description={description}
          isCopyAllowed={isCopyAllowed}
          isCodeCopyAllowed={isCodeCopyAllowed}
          icon={icon}
          iconUpdated={this.state.iconUpdated}
          tags={tags}
          isDeveloping={isDeveloping}
          isTutorial={isTutorial}
          useCustomIcon={project ? project.useCustomIcon : false}
          handleInputChange={this.handleInputChange}
          handleIsCopyAllowedChange={this.handleIsCopyAllowedChange}
          handleIsCodeCopyAllowedChange={this.handleIsCodeCopyAllowedChange}
          handleImgClick={this.handleImgClick}
          handleAddClick={this.handleAddClick}
          handleSubmit={this.handleSubmit}
          handleCloseBtn={this.handleCloseBtn}
          handleFileInput={this.handleFileInput}
          handleFileDelete={this.handleFileDelete}
          onDeleteTag={this.onDeleteTag}
          onAddTag={this.onAddTag}
          popularTags={popularTags}
          handleChallengeEvent={this.handleChallengeEvent}
          challengeEventAttend={challengeEventAttend}
          nameValidation={nameValidation}
          descriptionValidation={descriptionValidation}
        />

        <ReactToolTip multiline={true} className="publish__tooltip" />
      </div>
    );
  }
}

export default connect(
  (state) => ({
    email: state.userinfo.email,
    organization: state.userinfo.organization,
    project: state.project,
    scene: state.scene,
    preview: state.preview,
    interaction: state.interaction,
  }),
  {
    setScreenshotURL: projectActions.setScreenshotURL,
    publishProject: projectActions.publishProject,
    setLog: webrtcActions.setLog,
  }
)(injectIntl(Container));
