import React, { Component } from "react";
import { connect } from "react-redux";
import View from "./View";

class Container extends Component {
  render() {
    return (
      <View pageType={this.props.pageType} editorMode={this.props.editorMode} />
    );
  }
}

export default connect(state => ({ editorMode: state.scene.editorMode }))(
  Container
);
