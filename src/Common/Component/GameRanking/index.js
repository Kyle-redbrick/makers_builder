import React, { Component } from "react";
import "./index.scss";
import * as request from "../../Util/HTTPRequest";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { FormattedMessage } from "react-intl";
import rankBgImage from "../../../Image/rank-icon.svg";
import rankNoneImage from "../../../Image/group.svg";
import guestProfileImage from "../../../Image/guest-profile.svg";
import closeBtnImage from "../../../Image/close-btn.svg";
import { getGuestId } from "../../../Common/Util/GuestIdUtil";

class GameRanking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  async componentDidMount() {
    const { projectId, isAsc } = this.props;

    let response = await request
      .getSampleGameRanking({ projectId, isAsc })
      .then((res) => res.json())
      .then((json) => {
        this.setState({ data: json.data.gameRanking });
      });
    console.log(response);
  }

  onClickClose = () => {
    this.props.setIsRankingShow(!this.props.isRankingShow);
  };

  render() {
    const { data } = this.state;
    const ascId = localStorage.getItem("ascId");
    const descId = localStorage.getItem("descId");

    let userRank = -1;
    let userScore = 0;
    data.forEach((ranking, idx) => {
      if (ranking.id === ascId || ranking.id === descId) {
        userRank = idx + 1;
        userScore = ranking.score;
      }
    });

    return (
      <div className="GameRankingContainer">
        <div className="Header">
          <div className="Header__ranking">
            <img src={rankBgImage} alt="Rank" />
            {userRank !== -1 && <p>{userRank}</p>}
            {userRank === -1 && <img src={rankNoneImage} alt="Rank none" />}
          </div>
          <div className="Header__score">
            <p>{userScore === 0 ? "-" : userScore}</p>
          </div>
        </div>
        <div className="Close" onClick={this.onClickClose}>
          <img src={closeBtnImage} alt="Close button" />
        </div>
        <div className="Body">
          <div className="Body__rankingLabel">
            <FormattedMessage id="ID_WIZAPPDETAIL_GAME_RANKING_LABLE" />
          </div>
          <div className="Body__content">
            {data.map((rank, idx) => {
              const { score, guestId, user, name, profileImage } = rank;
              const ranking = idx + 1;
              const target = ranking === userRank ? "user" : "";
              return (
                <div key={idx}>
                  <div className={`Body__item--bg${ranking % 2}`}>
                    <div className={`Body--${target}`}>
                      <table>
                        <tbody>
                          <tr className="Body__row">
                            <td className="Body__item__ranking">{ranking}</td>
                            <td>
                              {profileImage && (
                                <p
                                  className="Body__item__icon"
                                  style={{
                                    backgroundImage: `url(${profileImage.THUMBNAIL_ALI()})`,
                                  }}
                                />
                              )}
                              {!profileImage && (
                                <p
                                  className="Body__item__icon"
                                  style={{
                                    backgroundImage: `url(${guestProfileImage})`,
                                  }}
                                />
                              )}
                            </td>
                            <td className="Body__item__name">
                              <p>{name || guestId}</p>
                              <p>{score}</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default GameRanking;
