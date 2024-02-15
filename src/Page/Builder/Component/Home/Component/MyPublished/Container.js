import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { showPopUp } from "../../../../../../Common/Component/PopUp";
import { PAGETYPE } from "../../../../../../Common/Util/Constant";
import * as request from "../../../../../../Common/Util/HTTPRequest";
import View from "./View";
import PublishPopup from "../../../../../../Common/Component/Publish";

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataType: [],
      keyword: "",
      myPublisheds: [],
      currentPage: 1,
    };
    this.pageSize = 45;
    this.projectsRef = React.createRef();
  }

  componentDidMount = () => {
    if (!this.props.email) return;
  };

  fetchMyPublisheds = async () => {
    let { currentPage } = this.state;
    let pageOffset = Math.ceil((currentPage - 1) * this.pageSize);
    let params = {
      offset: pageOffset,
      limit: this.pageSize,
    };
    try {
      if (this.state.keyword) {
        params.keyword = this.state.keyword;
        let res = await request.getMyPublishedSaasProject(params);
        let myPublished = await res.json();
        if (currentPage === 1) {
          this.setState({ myPublisheds: myPublished.data.projectList });
        } else {
          this.setState((prev) => ({
            myPublisheds: prev.myPublisheds.concat(
              myPublished.data.projectList
            ),
          }));
        }
        return myPublished.data.projectList;
      } else {
        let res = await request.getMyPublishedSaasProject(params);
        let myPublished = await res.json();
        if (currentPage === 1) {
          this.setState({ myPublisheds: myPublished.data.projectList });
        } else {
          this.setState((prev) => ({
            myPublisheds: prev.myPublisheds.concat(
              myPublished.data.projectList
            ),
          }));
        }
        return myPublished.data.projectList;
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  isFirstFetchData = () => {
    let { currentPage } = this.state;
    return currentPage === 1;
  };
  onClickShowProject = (pId) => {
    if (!pId) return;
    this.props.history.push(`?pId=${pId}`);
  };
  onClickProject = (id) => {
    if (!id) return;
    this.props.history.replace({
      pathname: `/${id}`,
      // pathname: `/${PAGETYPE.BUILDER}/${id}`,
    });
    window.location.reload();
  };
  //TODO : have to refactoring
  handleOnScroll = () => {
    const container = this.projectsRef.current;
    if (
      container.offsetHeight + container.scrollTop + 1 >=
      container.scrollHeight
    ) {
      this.setState(
        (prev) => ({
          currentPage: prev.currentPage + 1,
        }),
        async () => {
          let data = await this.fetchMyPublisheds();
          console.log("published data : ", data);
          // this.setState((prev) => ({
          //   myPublisheds: prev.myPublisheds.concat(data),
          // }));
        }
      );
      // } else {
      //   alert("스크롤 이벤트 실패");
    }
  };
  handleProjectLive = async (published) => {
    published.live = !published.live;
    if (!published.tags) {
      published.tags = [];
    }
    try {
      await request.postPublishedProject(published);
      this.updateItemInfo(published);
    } catch (e) {
      console.error(e);
    }
  };

  onClickProjectEdit = (published) => {
    showPopUp(
      <PublishPopup
        pId={published.pId}
        isDeveloping={false}
        publishCallback={this.updateItemInfo}
        isBuilder={true}
      />,
      { defaultPadding: false, scrollable: true }
    );
  };
  updateItemInfo = (params) => {
    this.setState((state) => ({
      myPublisheds: state.myPublisheds.map((item) => {
        if (item.pId === params.pId) {
          return {
            ...item,
            ...params,
          };
        } else {
          return item;
        }
      }),
    }));
  };

  onClickCodeCopy = async (params, pId) => {
    const res = await request.updateSaasProject({ params, pId });
    const codeCopyResult = await res.json();
    console.log("codeCopyResult", codeCopyResult);
  };

  //TODO : have to refactoring
  setFilteringData = (filteredType = [], keyword = "") => {
    this.setState(
      { currentPage: 1, dataType: filteredType, keyword },
      async () => {
        let data = await this.fetchMyPublisheds();
        this.setState({ myPublisheds: data });
      }
    );
  };
  render() {
    const {
      onClickProjectEdit,
      onClickDetailBtn,
      selectProject,
      handleDelete,
      handleCopy,
      handleEdit,
    } = this.props;
    const {
      onClickProject,
      onClickShowProject,
      handleOnScroll,
      projectsRef,
      handleProjectLive,
      setFilteringData,
      fetchMyPublisheds,
      onClickCodeCopy,
    } = this;
    const { myPublisheds } = this.state;
    return (
      <View
        myPublisheds={myPublisheds}
        setFilteringData={setFilteringData}
        onClickProject={onClickProject}
        onClickShowProject={onClickShowProject}
        handleOnScroll={handleOnScroll}
        projectsRef={projectsRef}
        handleProjectLive={handleProjectLive}
        handleCopy={handleCopy}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        onClickProjectEdit={onClickProjectEdit}
        onClickDetailBtn={onClickDetailBtn}
        selectProject={selectProject}
        fetchMyPublisheds={fetchMyPublisheds}
        onClickCodeCopy={onClickCodeCopy}
      />
    );
  }
}
export default connect(
  (state) => ({ email: state.userinfo.email }),
  {}
)(injectIntl(withRouter(Container)));
