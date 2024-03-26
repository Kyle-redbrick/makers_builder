import React, { useState } from "react";
import "./index.scss";
import FilteringHeader from "../FilteringHeader";

import projectDetailIcon from "../../../../../../Image/icon-more.svg";
import editIcon from "../../../../../../Image/icon-edit.svg";
import viewAppIcon from "../../../../../../Image/icon-view-app.svg";
import { injectIntl } from "react-intl";
import copyIcon from "../../../../../../Image/copy.svg";
import deleteIcon from "../../../../../../Image/delete.svg";
import PopUp, { showPopUp } from "../../../../../../Common/Component/PopUp";

function View(props) {
  const {
    myPublisheds,
    onClickProject,
    onClickShowProject,
    handleOnScroll,
    projectsRef,
    handleProjectLive,
    onClickProjectEdit,
    setFilteringData,
    onClickDetailBtn,
    selectProject,
    intl,
    handleCopy,
    handleDelete,
    handleEdit,
    fetchMyPublisheds,
    onClickCodeCopy,
  } = props;

  const projectItem = (item) => {
    return (
      <React.Fragment key={item.id}>
        <div
          className={`projectItem projectItem__${item.live ? "" : "unactive"}`}
        >
          <div
            className="projectItem__top"
            onClick={() => onClickProject(item.id)}
          >
            <img
              src={item.thumbnailURL.THUMBNAIL_ALI()}
              className="top__img"
              alt="icon"
            />
          </div>

          <div className="projectItem__bottom">
            <div className="bottom__title">
              <span>{item.title}</span>
              <p className="arrow_box">{item.title}</p>
            </div>
            <div className="bottom__time">
              {item.updatedAt &&
                item.updatedAt.split("T")[0].replaceAll("-", ".")}
              <div>{item.isVisible ? "공개" : "비공개"}</div>
            </div>
          </div>
          <div
            className={`projectItem__detail ${
              selectProject.id === item.id && "selected"
            }`}
            onClick={() => {
              onClickDetailBtn(item.id);
            }}
          >
            <img src={projectDetailIcon} alt="project Detail Icon" />
            <ul className="projectItem__detail__list">
              <li
                onClick={() =>
                  handleEdit(item.id, item.title, fetchMyPublisheds)
                }
              >
                <img src={editIcon} alt="" />
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
                        handleDelete(item.id, fetchMyPublisheds)
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
            </ul>
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div
      className="builder--home__myPublished"
      onScroll={handleOnScroll}
      ref={projectsRef}
    >
      <p className="myPublished__title">
        {intl.formatMessage({ id: "ID_BUILDER_MYPUBLISHED_TITLE" })}
      </p>
      <FilteringHeader setFilteringData={setFilteringData} />
      <div className="bottom__projectItems">
        {myPublisheds.length ? (
          myPublisheds.map((item) => {
            return projectItem(item);
          })
        ) : (
          <div className="project__Items no__Items">
            {intl.formatMessage({ id: "ID_BUILDER_MYPROJECT_NO_ITEM" })}
          </div>
        )}
      </div>
    </div>
  );
}

export default injectIntl(View);
