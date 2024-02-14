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
    //   const { pId, isAsc } = this.props;
    //   try {
    //     let response;
    //     if (isAsc) {
    //       response = await request.getGameRankingAsc({ pId });
    //     } else {
    //       response = await request.getGameRanking({ pId });
    //     }
    //     const json = await response.json();
    //     this.setState({ data: json });
    //   } catch (e) {
    //     console.error(e);
    //   }
  }

  onClickClose = () => {
    this.props.setIsRankingShow(!this.props.isRankingShow);
  };

  render() {
    // const { data } = this.state;

    let rankingId;

    if (this.props.email) {
      rankingId = this.props.email;
    } else {
      rankingId = getGuestId();
    }

    let userRank = -1;
    let userScore = 0;
    // data.forEach((ranking, idx) => {
    //   if (ranking.user && ranking.user.email === rankingId) {
    //     userRank = idx + 1;
    //     userScore = formatNumber(ranking.score);
    //   } else {
    //     if (ranking.guestId === rankingId) {
    //       userRank = idx + 1;
    //       userScore = formatNumber(ranking.score);
    //     }
    //   }
    // });
    let data = [
      { score: "1", guestId: "1", user: "1" },
      { score: "2", guestId: "2", user: "2" },
      { score: "3", guestId: "3", user: "3" },
    ];
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
              const { score, guestId, user } = rank;
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
                              {user && (
                                <p
                                  className="Body__item__icon"
                                  style={{
                                    backgroundImage: `url(${user.icon})`,
                                  }}
                                />
                              )}
                              {!user && (
                                <p
                                  className="Body__item__icon"
                                  style={{
                                    backgroundImage: `url(${guestProfileImage})`,
                                  }}
                                />
                              )}
                            </td>
                            <td className="Body__item__name">
                              <p>
                                {user && user.name}
                                {!user && guestId}
                              </p>
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
