import React from "react";
import { injectIntl } from "react-intl";
import "./index.scss";
import { useState } from "react";
import Game2dIcon from "../../../../../../Image/icon-2d.svg";
import PopUp, { showPopUp } from "../../../../../../Common/Component/PopUp";

import projectDetailIcon from "../../../../../../Image/icon-more.svg";
import editIcon from "../../../../../../Image/icon-edit.svg";
import copyIcon from "../../../../../../Image/copy.svg";
import deleteIcon from "../../../../../../Image/delete.svg";

function View(props) {
  const {
    onClick2DGame,
    onClickMyProjectMore,
    onClickMyPublishedMore,
    onClickDetailBtn,
    onClickProject,
    onClickPublishProject,
    onClickProjectEdit,
    handleEdit,
    handleDelete,
    handleCopy,
    selectProject,
    myProjects,
    myPublisheds,
    fetchMyProjects,
    setProjectName,
    intl,
    fetchMyPublished,
    onClickCodeCopy,
  } = props;

  return (
    // 새로 만들기
    <div className="builder--home__main">
      <div className="main__top">
        <div className="main__making">
          <div className="main__title">
            {intl.formatMessage({ id: "ID_BUILDER_MAIN_TITLE" })}
          </div>
          <div className="making__items">
            <div className="making__item" onClick={onClick2DGame}>
              <img src={Game2dIcon} alt="2d game" />
              {intl.formatMessage({ id: "ID_BUILDER_MAIN_2D_GAME" })}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 프로젝트 */}
      <div className="main__row row__myProjects">
        <div className="row__header">
          <div className="main__title">
            {intl.formatMessage({ id: "ID_BUILDER_MAIN_LATELY_PROJECT" })}
          </div>
          <div onClick={onClickMyProjectMore} className="myProjects__more">
            {intl.formatMessage({ id: "ID_BUILDER_MAIN_VIEW_MORE" })}
          </div>
        </div>
        <div className="project__Items">
          {myProjects.length ? (
            myProjects.map((item, index) => {
              return (
                <ProjectItem
                  project={item}
                  onClickProject={onClickProject}
                  onClickDetailBtn={onClickDetailBtn}
                  selectProject={selectProject}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleCopy={handleCopy}
                  key={index}
                  fetchMyPublished={fetchMyPublished}
                  fetchMyProjects={fetchMyProjects}
                  setProjectName={setProjectName}
                  intl={intl}
                  type="project"
                />
              );
            })
          ) : (
            <div className="project__Items no__Items">
              {intl.formatMessage({ id: "ID_BUILDER_MAIN_PLACEHOLDER01" })}
            </div>
          )}
        </div>
      </div>

      {/* 퍼블리싱 앱 */}
      <div className="main__row row__myPublished">
        <div className="row__header">
          <div className="main__title">
            {intl.formatMessage({ id: "ID_BUILDER_MAIN_PUBLISHING_APP" })}
          </div>
          <div onClick={onClickMyPublishedMore} className="myPublished__more">
            {intl.formatMessage({ id: "ID_BUILDER_MAIN_VIEW_MORE" })}
          </div>
        </div>

        <div className="project__Items">
          {myPublisheds.length ? (
            myPublisheds.map((item, index) => {
              return (
                <ProjectItem
                  project={item}
                  onClickProject={onClickProject}
                  onClickPublishProject={onClickPublishProject}
                  onClickDetailBtn={onClickDetailBtn}
                  handleEdit={handleEdit}
                  onClickProjectEdit={onClickProjectEdit}
                  selectProject={selectProject}
                  fetchMyPublished={fetchMyPublished}
                  fetchMyProjects={fetchMyProjects}
                  key={index}
                  handleDelete={handleDelete}
                  type="published"
                  intl={intl}
                  onClickCodeCopy={onClickCodeCopy}
                />
              );
            })
          ) : (
            <div className="project__Items no__Items">
              {intl.formatMessage({ id: "ID_BUILDER_MAIN_PLACEHOLDER02" })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const ProjectItem = (props) => {
  const {
    project,
    onClickProject,
    onClickPublishProject,
    onClickDetailBtn,
    onClickProjectEdit,
    selectProject,
    handleEdit,
    handleDelete,
    handleCopy,
    fetchMyProjects,
    fetchMyPublished,
    type,
    setProjectName,
    intl,
    onClickCodeCopy,
  } = props;
  const [isVisible, setIsVisble] = useState(project.isVisible);
  const onClickCodeAllow = () => setIsVisble(!isVisible);
  return (
    <div className="projectItem">
      <div
        className="projectItem__top"
        onClick={(e) => {
          e.preventDefault();
          onClickProject(project.id);
        }}
      >
        <img
          className="top__img"
          src={project.thumbnailURL.THUMBNAIL_ALI()}
          alt="project"
        />
      </div>
      <div className="projectItem__bottom">
        <div
          className="bottom__title"
          onClick={(e) => {
            e.preventDefault();
            onClickProject(project.id);
          }}
        >
          {project.title}
        </div>
        <div className="bottom__time">
          {project.updatedAt &&
            project.updatedAt.split("T")[0].replaceAll("-", ".")}
          <div className="code__allow">
            {type === "published" ? (
              isVisible ? (
                <p>공개</p>
              ) : (
                <p>비공개</p>
              )
            ) : undefined}
            {type === "published" && (
              <div className="publishform__code_allow__wrapper">
                <div
                  className={`publishform__code_allow ${
                    isVisible ? "On" : "Off"
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onClickCodeAllow();
                    onClickCodeCopy({ isVisible: !isVisible }, project.id);
                  }}
                >
                  <span />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className={`projectItem__detail ${
          selectProject.id === project.id &&
          selectProject.type === type &&
          "selected"
        }`}
        onClick={() => {
          onClickDetailBtn(project.id, type);
        }}
      >
        <img src={projectDetailIcon} alt="project Detail Icon" />
        <ul className="projectItem__detail__list">
          <>
            <li
              onClick={() =>
                handleEdit(
                  project.id,
                  project.title,
                  fetchMyProjects,
                  fetchMyPublished
                )
              }
            >
              <img src={editIcon} alt="edit" />
              {intl.formatMessage({ id: "ID_BUILDER_MAIN_EDIT" })}
            </li>
            <li
              onClick={() => {
                showPopUp(
                  <PopUp.TwoButton
                    title="프로젝트 삭제"
                    subtitle={`프로젝트를 지우시겠습니까? \n삭제하시면 복구할 수 없습니다.`}
                    confirmButtonName="삭제"
                    confirmAction={() =>
                      handleDelete(
                        project.id,
                        fetchMyProjects,
                        fetchMyPublished
                      )
                    }
                    cancelButtonName="취소"
                    cancelAction={() => {}}
                  />
                );
              }}
            >
              <img src={deleteIcon} alt="" />
              {intl.formatMessage({ id: "ID_BUILDER_MAIN_DELETE" })}
            </li>
            <li
              onClick={() => {
                handleCopy(project.id, fetchMyProjects);
              }}
            >
              <img src={copyIcon} alt="" />
              {intl.formatMessage({ id: "ID_BUILDER_MAIN_COPY" })}
            </li>
          </>
        </ul>
      </div>
    </div>
  );
};

export default injectIntl(View);
