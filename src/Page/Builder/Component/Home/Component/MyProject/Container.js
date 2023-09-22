import React, { Component } from "react";
import { injectIntl } from "react-intl";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import View from "./View";
import { PAGETYPE } from "../../../../../../Common/Util/Constant";
import * as request from "../../../../../../Common/Util/HTTPRequest";

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myProjects: [],
      currentPage: 1,
      dataType: [],
      keyword: "",
    };
    this.pageSize = 15;
    this.projectsRef = React.createRef();
  }
  componentDidMount = () => {
    if (!this.props.email) return;
  };

  fetchMyProjects = async () => {
    console.log("fetchMyProjects 실행");
    let { currentPage } = this.state;
    let pageOffset = Math.ceil((currentPage - 1) * this.pageSize);
    let params = {
      offset: pageOffset,
      limit: this.pageSize,
    };

    try {
      if (this.state.keyword) {
        params.keyword = this.state.keyword;
        let res = await request.getMySaasProject(params);
        let myProject = await res.json();
        this.setState({ myProjects: myProject.data.projectList });
        return myProject.data.projectList;
      } else {
        let res = await request.getMySaasProject(params);
        let myProject = await res.json();
        this.setState({ myProjects: myProject.data.projectList });
        return myProject.data.projectList;
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  // fetchMyProjects = async () => {
  //   let { currentPage, dataType, keyword } = this.state;
  //   let pageOffset = Math.ceil((currentPage - 1) * this.pageSize);
  //   let params = {
  //     type: dataType,
  //     email: this.props.email,
  //     offset: pageOffset,
  //     limit: this.isFirstFetchData ? 60 : this.pageSize,
  //     keyword
  //   };
  //   try {
  //     let res = await request.getDevelopingProjectsByType(params);
  //     let myProjects = await res.json();
  //     return myProjects.rows;
  //   } catch (error) {
  //     console.log(error);
  //     return [];
  //   }
  // };
  isFirstFetchData = () => {
    let { currentPage } = this.state;
    return currentPage === 1;
  };
  //TODO : have to refactoring
  setFilteringData = (
    filteredType = ["js3d", "js", "wizlabOOBC", "OOBC"],
    keyword = ""
  ) => {
    this.setState(
      { currentPage: 1, dataType: filteredType, keyword },
      async () => {
        let data = await this.fetchMyProjects();
        this.setState({ myProjects: data });
      }
    );
  };
  onClickProject = (id) => {
    if (!id) return;
    this.props.history.replace({
      pathname: `/${PAGETYPE.BUILDER}/${id}`,
    });
    window.location.reload();
  };

  //TODO : have to refactoring
  handleOnScroll = () => {
    const container = this.projectsRef.current;
    if (
      container.offsetHeight + container.scrollTop >=
      container.scrollHeight
    ) {
      this.setState(
        (prev) => ({
          currentPage: prev.currentPage + 1,
        }),
        async () => {
          let data = await this.fetchMyProjects();
          this.setState((prev) => ({
            myProjects: prev.myProjects.concat(data),
          }));
        }
      );
    }
  };

  setProjectName = (pId, newName) => {
    this.setState((prev) => ({
      myProjects: prev.myProjects.map((item, index) => {
        if (item.pId === pId) {
          item.name = newName;
        }
        return item;
      }),
    }));
  };
  render() {
    const {
      handleEdit,
      onClickDetailBtn,
      selectProject,
      handleDelete,
      handleCopy,
    } = this.props;
    const { myProjects } = this.state;
    const {
      onClickProject,
      handleOnScroll,
      projectsRef,
      setFilteringData,
      setProjectName,
      fetchMyProjects,
    } = this;
    return (
      <View
        myProjects={myProjects}
        onClickProject={onClickProject}
        handleOnScroll={handleOnScroll}
        projectsRef={projectsRef}
        setFilteringData={setFilteringData}
        onClickDetailBtn={onClickDetailBtn}
        handleEdit={handleEdit}
        selectProject={selectProject}
        handleDelete={handleDelete}
        handleCopy={handleCopy}
        setProjectName={setProjectName}
        fetchMyProjects={fetchMyProjects}
      />
    );
  }
}
export default connect(
  (state) => ({ email: state.userinfo.email }),
  {}
)(injectIntl(withRouter(Container)));
