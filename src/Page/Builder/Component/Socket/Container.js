import React, { Component } from "react";
import { connect } from "react-redux";
import io from "socket.io-client";
import * as request from "../../../../Common/Util/HTTPRequest";
import { URL } from "../../../../Common/Util/Constant";
import * as socketActions from "../../Store/Reducer/socket";
import * as chatActions from "../../Store/Reducer/chat";

const socket = io(URL.SOCKET_SERVER, {});
export const socketUtil = {
  socket: socket,
  sendSocketEvent: (event, data = {}) => {
    socket.emit(event, data);
  },
};

class Container extends Component {
  socketTimer = undefined;

  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
    let pId = window.location.pathname.slice(1);
    if (this.socketTimer) {
      clearTimeout(this.socketTimer);
    }
    this.socketTimer = setTimeout(() => {
      const { scene, interaction, preview } = this.props;

      const state = {
        scene,
        interaction: { ...interaction, isPublished: undefined },
        preview: { ...preview, isPlaying: false },
      };

      let params = { state: state };

      request.updateSaasProject({ params, pId }).then((res) => res.json());
    }, 3000);
  }

  render() {
    return <div style={{ display: "none" }} />;
  }
}

export default connect(
  (state) => {
    const { history, historyIndex, ..._scene } = state.scene;

    return {
      selectedSceneId: state.interaction.selected.scene,
      selectedObject:
        state.interaction.selected.objects[state.interaction.selected.scene],
      pId: state.project.pId,
      scene: _scene,
      interaction: {
        ...state.interaction,
        jukebox: {
          isPlaying: false,
        },
        addSoundsTimeStamp: undefined,
      },
      preview: state.preview,
      email: state.userinfo.email,
      project: state.project,
      instantRunURL: state.socket.url,
      requestImage: state.socket.requestImage,
      messageQueue: state.chat.messageQueue,
      rooms: state.chat.rooms,
      currentUser: state.tabs.currentUser,
    };
  },
  {
    setRequestImage: socketActions.setRequestImage,
    setResponseImage: socketActions.setResponseImage,
    clearMsgQueue: chatActions.clearMsgQueue,
    addMsg: chatActions.addMsg,
    addUnreadMsgCount: chatActions.addUnreadMsgCount,
  }
)(Container);
