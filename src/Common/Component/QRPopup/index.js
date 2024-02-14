import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage, injectIntl } from "react-intl";
import QRCode from "qrcode.react";
import { URL } from "../../Util/Constant";
import * as request from "../../Util/HTTPRequest";
import PopUp, { showPopUp } from "../PopUp";
import PhoneDropDown from "./PhoneDropDown";
import closeImg from "../../../Image/builder/x-copy-3.svg";
import closeImg_darkmode from "../../../Image/builder/x-copy-3_darkmode.svg";
import * as TrackingUtil from "../../Util/TrackingUtil";
import { getColorTheme } from "../../../Page/Builder/utils/colorThemeUtil";
import shareCopyImg from "../../../Image/share_icon_copy.png";

import "./index.scss";

class QRPopup extends Component {
  constructor(props) {
    super(props);
    if (this.props.isBuilder) {
      require("./index_builder.scss");
    }
    this.state = {
      phoneNum: "",
      countryCode: "+1",
      copied: false,
      QRLink: "",
    };
  }

  loadSaasProject = async (pId) => {
    let response = await request.getSaasDevelopingProject(pId);
    const ans = await response.json();
    const project = ans.data.projectInfo;
    let screenMode = project.screenMode;
    screenMode = screenMode.toLowerCase();
    // let sampleGame =
    //   project.sampleGameURL.split("/")[
    //     project.sampleGameURL.split("/").length - 1
    //   ];

    this.setState({
      QRLink: `${process.env.REACT_APP_QR_LINK}/${screenMode}/${pId}`,
    });
  };

  componentDidMount = async () => {
    const pId = window.location.pathname.slice(1);
    await this.loadSaasProject(pId);
    /*for css */
    const popup = document.querySelector(".QRPopup").closest(".popup_contents");
    popup.style.borderRadius = "20px";
    const dismissBtn = popup.querySelector("#popup_dismissbtn");
    dismissBtn.style.display = "none";
  };

  handleInputChange = (e) => {
    const target = e.target;
    this.setState(
      (state) => ({
        [target.name]: target.value,
      }),
      () => {}
    );
  };
  handleCountryChange = (countryCode) => {
    this.setState({
      countryCode,
    });
  };

  getIsPhoneNumValid = () => {
    // TODO : check whether or not typeof phoneNum is number
    let { phoneNum } = this.state;
    return phoneNum && phoneNum.length >= 11;
  };

  copyUrl = () => {
    // const { pId } = this.props.project;
    // const url = URL.REDBRICK_URL + "/wizapp/" + pId;
    const url = this.state.QRLink;
    navigator.clipboard.writeText(url);
    this.setState({ copied: true }, () => {
      setTimeout(() => {
        this.setState({ copied: false });
      }, 1500);
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    // TODO: phoneNum validation check

    if (!this.getIsPhoneNumValid()) {
      showPopUp(
        <PopUp.OneButton
          title={<FormattedMessage id="ID_BUILDER_ALERT_MSG_QRWARN" />}
          buttonName={<FormattedMessage id="ID_BUILDER_ALERT_CLOSEBTN" />}
        />
      );
      return;
    }

    let { pId, name } = this.props.project;
    // let url = URL.WIZ_APP + pId;
    let url = this.state.QRLink;

    const countryCode = this.state.countryCode;
    const localNumber = this.state.phoneNum;
    const params = { countryCode, localNumber, url, name };

    request
      .smsPlayLink(params)
      .then((response) => {
        if (response.status === 200) {
          TrackingUtil.sendGAEvent({
            category: "Builder",
            action: `Share`,
            label: "SMS",
          });
          showPopUp(
            <PopUp.OneButton
              title={<FormattedMessage id="ID_BUILDER_ALERT_MSG_QRSUCC" />}
              buttonName={<FormattedMessage id="ID_BUILDER_ALERT_CLOSEBTN" />}
            />
          );
        } else {
          showPopUp(
            <PopUp.OneButton
              title={<FormattedMessage id="ID_BUILDER_ALERT_MSG_QRFAIL" />}
              buttonName={<FormattedMessage id="ID_BUILDER_ALERT_CLOSEBTN" />}
            />
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  render() {
    const { phoneNum, countryCode, copied } = this.state;
    let { pId } = this.props.project;
    let url = this.state.QRLink;
    // let url = URL.WIZ_APP + pId;
    const colorTheme = getColorTheme();

    return (
      <div className="QRPopup">
        <div className="QRPopup__header">
          <div className="header__title">
            <FormattedMessage id="ID_POPUP_SHARE_TITLE" />
          </div>
          <img
            className="popup__closebtn"
            src={colorTheme === "darkMode" ? closeImg_darkmode : closeImg}
            alt="img"
            onClick={this.props.dismiss}
          />
        </div>
        <div className="QR_NOTICE">
          <FormattedMessage id="ID_QRNOTICE" />
        </div>
        <div className="QR__wrapper">
          <QRCode
            className="QRPopup__qrcode"
            value={url}
            style={{ width: "125px", height: "125px" }}
          />
        </div>
        <div className="QRPopupBottom">
          <div className="QR__desc">
            <FormattedMessage id="ID_QRTITLE" />
          </div>
        </div>
        <div className={`QRPopupCopied ${copied && "QRPopupCopiedShow"}`}>
          <FormattedMessage id="ID_SHARE_COPIED" />
        </div>
        <div className="QRPopupSNS">
          <div onClick={this.copyUrl} className="QRPopupSNSItem">
            <img src={shareCopyImg} alt="share fb" />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    email: state.userinfo.email,
  }),
  {}
)(injectIntl(QRPopup));
