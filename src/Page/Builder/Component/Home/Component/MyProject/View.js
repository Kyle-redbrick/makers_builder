import React from "react";
import { injectIntl } from "react-intl";
import "./index.scss";
import FilteringHeader from "../FilteringHeader";
import projectDetailIcon from "../../../../../../Image/icon-more.svg";
import editIcon from "../../../../../../Image/icon-edit.svg";
import copyIcon from "../../../../../../Image/copy.svg";
import deleteIcon from "../../../../../../Image/delete.svg";

function View(props) {
  const {
    setFilteringData,
    myProjects,
    onClickProject,
    handleOnScroll,
    projectsRef,
    handleEdit,
    onClickDetailBtn,
    selectProject,
    handleDelete,
    handleCopy,
    setProjectName,
    intl,
    fetchMyProjects,
  } = props;
  return (
    <div
      className="builder--home__myProject"
      ref={projectsRef}
      onScroll={handleOnScroll}
    >
      <p className="myProject__title">
        {intl.formatMessage({ id: "ID_BUILDER_MYPROJECT_OPEN" })}
      </p>
      <FilteringHeader setFilteringData={setFilteringData} />
      <div className="bottom__projectItems">
        {myProjects.length ? (
          myProjects.map((item, index) => {
            return (
              <div className="projectItem" key={index}>
                <div
                  className="projectItem__top"
                  onClick={(e) => {
                    e.preventDefault();
                    onClickProject(item.id);
                  }}
                >
                  <img
                    className="top__img"
                    src={item.thumbnailURL.THUMBNAIL_ALI()}
                    alt="icon"
                  />
                </div>

                <div
                  className="projectItem__bottom"
                  onClick={(e) => {
                    e.preventDefault();
                    onClickProject(item.pId, item.type);
                  }}
                >
                  <div className="bottom__title">{item.title}</div>
                  <div className="bottom__time">
                    {item.updatedAt &&
                      item.updatedAt.split("T")[0].replaceAll("-", ".")}
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
                        handleEdit(item.id, item.title, fetchMyProjects)
                      }
                    >
                      <img src={editIcon} alt="" />
                      {intl.formatMessage({ id: "ID_BUILDER_MAIN_EDIT" })}
                    </li>
                    <li onClick={() => handleCopy(item.id, fetchMyProjects)}>
                      <img src={copyIcon} alt="" />
                      {intl.formatMessage({ id: "ID_BUILDER_MAIN_COPY" })}
                    </li>
                    <li onClick={() => handleDelete(item.id, fetchMyProjects)}>
                      <img src={deleteIcon} alt="" />
                      {intl.formatMessage({ id: "ID_BUILDER_MAIN_DELETE" })}
                    </li>
                  </ul>
                </div>
              </div>
            );
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
