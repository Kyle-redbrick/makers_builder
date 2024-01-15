import { URL } from "./Constant";
import { detectIE } from "./detectBrowser";

export const fetchSaasRequest = (url, method, param) => {
  let headers = {
    "Content-Type": "application/json; charset=utf-8",
  };
  if (localStorage.getItem("makersToken")) {
    headers["Authorization"] = `Bearer ${localStorage.getItem("makersToken")}`;
  }

  const requestInfo = {
    method: method,
    headers: headers,
  };

  if (param) requestInfo["body"] = JSON.stringify(param);

  return new Promise((resolve, reject) => {
    fetch(url, requestInfo)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => reject(error));
  });
};

///////////////////////////////////////////////////////////////////////////////
/** SAAS */

export const getPythonItembooks = () => {
  return fetchSaasRequest(URL.API_SAAS_SERVER + `itemBook/list`, "GET");
};

export const sceneUpload = (projectId) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER +
      `project/scene/upload?projectId=${projectId}&fileType=jpeg&mimeType=image/jpeg`,
    "GET"
  );
};

export const saveSaasMission = (progressId, values) => {
  let body = {};
  if (values && values.completedMissionNum) {
    body["completedMissionNumber"] = values.completedMissionNum;
  }
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `progress/lesson?progressId=${progressId}`,
    "PUT",
    body
  );
};

export const getMyLessonInfo = (progressId) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `progress/myLesson?progressId=${progressId}`
  );
};

export const copySaasProject = (pId) => {
  const param = { projectId: pId };
  return fetchSaasRequest(URL.API_SAAS_SERVER + `project/copy`, "POST", param);
};

export const copyAndGoToCreatePage = ({
  lessonId,
  projectId,
  classId,
  courseId,
}) => {
  let params;
  let userInfo = JSON.parse(localStorage.getItem("userInfo"));
  let userRole = userInfo.role;
  if (userRole === "EDUCATOR") {
    params = { lessonId, projectId };
  } else {
    params = { lessonId, projectId, classId, courseId };
  }
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `lesson/copyProject`,
    "POST",
    params
  );
};

export const tagUpdate = (lessonId, tags) => {
  const params = {
    tags: tags,
    lessonId: lessonId,
  };
  return fetchSaasRequest(URL.API_SAAS_SERVER + `lesson/tag`, "POST", params);
};

export const keyCommandsUpdate = (lessonId, keyCommands) => {
  const params = {
    keyCommands,
    lessonId,
  };
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `lesson/keyCommand`,
    "POST",
    params
  );
};

export const projectIconUpload = (pId) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER +
      `project/thumbnail/upload?projectId=${pId}&fileType=jpg&mimeType=image/jpeg`,
    "GET"
  );
};

export const updateSaasProject = ({ params, pId }) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `project?projectId=${pId}`,
    "PUT",
    params
  );
};

export const deleteSaasProject = (id) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `project?projectId=${id}`,
    "DELETE"
  );
};

export const createNewProject = (props) => {
  const param = {
    title: props.title ? props.title : "testTemplate",
    useCustomIcon: 1, //or 0
    thumbnailURL:
      "https://wizschool-images.s3.ap-northeast-2.amazonaws.com/c59fb10cb7918db05336bb614cd3a278.jpg",
    url: "",
    language: props.language ? props.language : "JS", //or OOBC
    locale: "ko",
    state:
      props.editorFormat === "JS"
        ? {
            scene: {
              scenes: {
                scene1: {
                  sceneName: "scene1",
                  sprites: {
                    gray: {
                      type: "background",
                      assetId: "gray_v3",
                      code: "",
                      preview: {
                        name: "gray",
                        type: "background",
                        angle: 0,
                        left: -199,
                        top: -479,
                        scaleX: 1,
                        scaleY: 1,
                        width: 1678,
                        height: 1678,
                        opacity: 1,
                      },
                    },
                  },
                  spriteIds: ["gray"],
                  preview:
                    "https://wizschool-images.s3.ap-northeast-2.amazonaws.com/c59fb10cb7918db05336bb614cd3a278.jpg",
                  worldWidth: 1280,
                  worldHeight: 720,
                },
              },
              sceneIds: ["scene1"],
              soundIds: [],
              timeStamp: 1619136251326,
              editorMode: "javascript-wiz",
            },
            interaction: {
              selected: {
                objects: { scene1: { name: "gray", type: "background" } },
                api: "ID_PHYSICS",
                method: null,
                scene: "scene1",
              },
              jukebox: { isPlaying: false },
            },
            preview: {
              isPlaying: false,
              isFullScreen: false,
              screenMode: "HORIZONTAL",
              volume: 100,
            },
          }
        : {
            scene: {
              scenes: {
                scene1: {
                  sceneName: "scene1",
                  sprites: {
                    undefined: {
                      code: {
                        lines: [
                          {
                            id: "ujqw3r",
                            block: {
                              id: "1qfds5",
                              mode: "empty",
                              grammars: {
                                sprite: "subject",
                                variable: "subject",
                                function: "subject",
                                util: "subject",
                              },
                              blockTypes: [
                                "sprite",
                                "variable",
                                "function",
                                "util",
                              ],
                              dataTypes: {
                                sprite: [
                                  "sprite",
                                  "screen",
                                  "joystick",
                                  "text",
                                  "sound",
                                ],
                                variable: ["sprite", "function"],
                                function: ["function"],
                                util: ["util", "mobile"],
                              },
                            },
                            folded: false,
                          },
                        ],
                      },
                    },
                    gray: {
                      type: "background",
                      assetId: "gray_v3",
                      code: "",
                      preview: {
                        name: "gray",
                        type: "background",
                        angle: 0,
                        left: -199,
                        top: -479,
                        scaleX: 1,
                        scaleY: 1,
                        width: 1678,
                        height: 1678,
                        opacity: 1,
                      },
                    },
                  },
                  spriteIds: ["gray"],
                  preview:
                    "https://wizschool-images.s3.ap-northeast-2.amazonaws.com/1f1178ed6a853b6b1a2c3b5b84253342.jpg",
                  worldWidth: 1280,
                  worldHeight: 720,
                },
              },
              sceneIds: ["scene1"],
              soundIds: ["documentary_v3"],
              timeStamp: 1674805985227,
              editorMode: "block",
            },
            interaction: {
              selected: {
                objects: {
                  scene1: {
                    name: "gray",
                    type: "background",
                  },
                },
                api: "ID_PHYSICS",
                method: null,
                scene: "scene1",
              },
              jukebox: {
                isPlaying: false,
              },
            },
            preview: {
              isPlaying: false,
              isFullScreen: false,
              screenMode: "HORIZONTAL",
              volume: 100,
            },
          },
  };

  return fetchSaasRequest(URL.API_SAAS_SERVER + `project`, "POST", param);
};

export const deleteCourse = (param) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `course?courseId=${param}`,
    "DELETE"
  );
};

export const deleteLesson = (param) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `lesson/force?lessonId=${param}`,
    "DELETE"
  );
};

export const getSaasAllCourse = () => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER +
      "course/list/available?offset=0&limit=100&classification=created",
    "GET"
  );
};

export const getNewCourse = (param) => {
  return fetchSaasRequest(URL.API_SAAS_SERVER + "course", "POST", param);
};

export const getCourseInfo = (courseId) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `course/info?courseId=${courseId}`
  );
};

export const addLecture = () => {
  const param = {
    locale: "ko", // or "en","zh"
    title: "test_lesson",
    thumbnailURL: "",
    description: "test",
    language: "JS", // JS / OOBC / 3D / PYTHON
    template: "",
    totalMissionNumber: 0,
    sampleGameURL: "",
  };
  return fetchSaasRequest(URL.API_SAAS_SERVER + `lesson`, "POST", param);
};

export const connectCourseAndLecture = ({ courseId, lessonId, order }) => {
  const param = {
    courseId,
    lessonList: [{ id: lessonId, order: order + 1 }],
  };
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `course/register/lesson`,
    "POST",
    param
  );
};

export const getLecture = (lectureId) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `lesson/info?lessonId=${lectureId}`
  );
};

export const getLessonInfoForClass = (lectureId) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `lesson/info/learn?lessonId=${lectureId}`
  );
};

export const updateLecture = (lectureId, lectureValues) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `lesson?lessonId=${lectureId}`,
    "PUT",
    lectureValues
  );
};

export const updateCourse = (lectureId, lectureValues) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `course?courseId=${lectureId}`,
    "PUT",
    lectureValues
  );
};

export const thumbnailUpload = (lessonId) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER +
      `lesson/thumbnail/upload?lessonId=${lessonId}&fileType=jpg&mimeType=image/jpeg`,
    "GET"
  );
};

export const courseThumbnailUpload = (courseId) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER +
      `course/thumbnail/upload?courseId=${courseId}&fileType=jpg&mimeType=image/jpeg`,
    "GET"
  );
};

export const templateFilesUpload = (params) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `lesson/templatefiles/upload`,
    "POST",
    params
  );
};

export const getMySaasProject = (params) => {
  if (params.keyword) {
    return fetchSaasRequest(
      URL.API_SAAS_SERVER +
        `project/my/list?limit=${params.limit}&offset=${params.offset}&searchType=title&keyword=${params.keyword}`,
      "GET"
    );
  } else {
    return fetchSaasRequest(
      URL.API_SAAS_SERVER +
        `project/my/list?limit=${params.limit}&offset=${params.offset}`,
      "GET"
    );
  }
};

export const getMyPublishedSaasProject = (params) => {
  if (params.keyword) {
    return fetchSaasRequest(
      URL.API_SAAS_SERVER +
        `project/my/list/published?limit=${params.limit}&offset=${params.offset}&searchType=title&keyword=${params.keyword}`,
      "GET"
    );
  } else {
    return fetchSaasRequest(
      URL.API_SAAS_SERVER +
        `project/my/list/published?limit=${params.limit}&offset=${params.offset}`,
      "GET"
    );
  }
};

export const getSaasDevelopingProject = (pId) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return fetchSaasRequest(
    URL.API_SAAS_SERVER +
      `project/info?projectId=${pId}&projectType=${
        userInfo.role || "EDUCATOR"
      }`,
    "GET"
  );
};

export const getUserInfo = () => {
  return fetchSaasRequest(URL.API_SAAS_SERVER + "user/info", "GET");
};

///////////////////////////////////////////////////////////////////////////////

export const fetchOriginRequest = (url, method, param) => {
  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    platform: "wizlab",
  };
  if (detectIE()) {
    headers["Pragma"] = "no-cache";
  }

  if (localStorage.getItem("astroToken")) {
    headers["Authorization"] =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwidWlkIjo1LCJzaWQiOjAsImRpc3RyaWN0TmFtZSI6IiIsImVtYWlsIjoiZGFubnlAcmVkYnJpY2suc3BhY2UiLCJ1c2VyVHlwZSI6IloiLCJuYW1lIjoia2ltIHRlc3QiLCJmdWxsbmFtZSI6eyJmYW1pbHkiOiJraW0iLCJnaXZlbiI6InRlc3QifSwibmlja05hbWUiOiJUZXN0IiwiaWNvbiI6Imh0dHBzOi8vczMuYXAtbm9ydGhlYXN0LTIuYW1hem9uYXdzLmNvbS93aXpzY2hvb2wtaW1hZ2VzL3Byb2ZpbGUtaW1hZ2UtMDEucG5nIiwiaWF0IjoxNjk0MDU1NDY0fQ.MFqsaqPYZqaHnpfmYgsLX1c5gu5JiuZ0yPRTsReFeB8";
  }

  headers["locale"] = localStorage.getItem("lang");
  headers["domain"] = localStorage.getItem(window.location.hostname);

  const requestInfo = {
    method: method,
    headers: headers,
  };

  if (param) requestInfo["body"] = JSON.stringify(param);

  return new Promise((resolve, reject) => {
    fetch(url, requestInfo)
      .then((res) => {
        // Achievement.handleResponse(res);
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

///////////////////////////////////////////////////////////////////////////////

export const fetchRequest = (url, method, param) => {
  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    platform: "wizlab",
  };
  if (detectIE()) {
    headers["Pragma"] = "no-cache";
  }

  if (localStorage.getItem("astroToken")) {
    headers["Authorization"] =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ilg1bCtGLzlPL3NmS05VRnQ5d25GRm54T2duN0gwSjlhRWtwYlFGYTBkRGM9IiwibmFtZSI6IjEx7YWM7IqkIiwidG9rZW5Gb3IiOiJFRFVDQVRPUiIsImlhdCI6MTY5MzQ1NTk4NSwiZXhwIjoxNjk0MDYwNzg1fQ.SO_xcd_5FcqsBiCyp2u888KaeYetHM0Vnhx_p2nIqCYdd";
  }

  headers["locale"] = localStorage.getItem("lang");
  headers["domain"] = localStorage.getItem(window.location.hostname);

  const requestInfo = {
    method: method,
    headers: headers,
  };

  if (param) requestInfo["body"] = JSON.stringify(param);

  return new Promise((resolve, reject) => {
    fetch(url, requestInfo)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**** User */
export const userProfile = (param) => {
  return fetchRequest(URL.API_SERVER + `user/profile/${param.email}`, "GET");
};

export const login = (param) => {
  return fetchRequest(URL.API_SERVER + "account/login", "POST", param);
};

export const loginByToken = (param) => {
  return fetchRequest(URL.API_SERVER + "user/loginByToken", "POST", param);
};

export const signup = (param) => {
  return fetchRequest(URL.API_SERVER + "user/signup", "POST", param);
};
export const signout = (param) => {
  return fetchRequest(URL.API_SERVER + "user/signout", "POST", param);
};
export const updateUserInfo = (param) => {
  return fetchRequest(URL.API_SERVER + "user/update", "POST", param);
};
export const sendPasswordMail = (param) => {
  return fetchRequest(URL.API_SERVER + "user/sendPasswordMail/", "POST", param);
};
export const getBadgeCount = (param) => {
  return fetchRequest(URL.API_SERVER + `user/badge/${param.email}`, "GET");
};

/**** Report */
export const postReport = (param) => {
  return fetchRequest(URL.API_SERVER + "report", "POST", param);
};

/**** SMS */
export const smsPlayLink = (param) => {
  return fetchRequest(URL.API_SERVER + "sms/playLink", "POST", param);
};

/**** Project */
export const getDefaultProject = (param) => {
  return fetchRequest(URL.API_SERVER + "project/default", "GET");
};

export const getDefaultTemplateProject = (param) => {
  return fetchRequest(URL.API_SERVER + `project/template/${param.id}`, "GET");
};

export const getTemplateProjectsByType = (param) => {
  return fetchOriginRequest(
    URL.API_SERVER + `templates/bytype/${param.type}`,
    "GET"
  );
};

export const getTemplateProjectsByKeyword = (param) => {
  return fetchRequest(URL.API_SERVER + `templates/byKeyword`, "POST", param);
};

export const getDevelopingProject = (param) => {
  return fetchRequest(
    URL.API_SERVER + `project/developing/${param.pId}`,
    "GET"
  );
};
export const getDevelopingProjectInfo = (param) => {
  return fetchRequest(
    URL.API_SERVER + `project/developing/info/${param.pId}`,
    "GET"
  );
};
export const getDevelopingProjects = (param) => {
  const { email, offset, limit, keyword } = param;
  return fetchRequest(
    URL.API_SERVER +
      `project/developings/${email}/${offset}/${limit}/${keyword}`,
    "GET"
  );
};
export const getDevelopingProjectsByType = (param) => {
  return fetchRequest(
    URL.API_SERVER + `project/developings/bytype`,
    "POST",
    param
  );
};

export const getPublishedProject = (param) => {
  return fetchRequest(URL.API_SERVER + `project/published/${param.pId}`, "GET");
};
export const getPublishedProjectV2 = (param) => {
  return fetchRequest(
    URL.API_SERVER + `project/v2/published/${param.pId}`,
    "GET"
  );
};
export const getPublishedProjects = (param) => {
  const { email, offset, limit } = param;
  return fetchRequest(
    URL.API_SERVER + `project/publisheds/${email}/${offset}/${limit}`,
    "GET"
  );
};
export const getPublishedProjectByKeyword = (param) => {
  const { keyword } = param;
  return fetchRequest(URL.API_SERVER + `project/search/${keyword}`, "GET");
};

export const updatePublishedProjectsViewCount = (param) => {
  const { pId } = param;
  return fetchRequest(
    URL.API_SERVER + `project/published/viewcount/${pId}`,
    "PUT"
  );
};

export const postDevelopingProject = (param) => {
  return fetchRequest(URL.API_SERVER + "project/developing", "POST", param);
};
export const updateDevelopingProject = (param) => {
  return fetchRequest(
    URL.API_SERVER + `project/developing/${param.pId}`,
    "PUT",
    param
  );
};
export const deleteDevelopingProject = (param) => {
  return fetchRequest(
    URL.API_SERVER + `project/developing/${param.pId}/${param.email}`,
    "DELETE"
  );
};
export const copyDevelopingProject = (param) => {
  return fetchRequest(
    URL.API_SERVER + `project/developing/copy`,
    "POST",
    param
  );
};

export const postPublishedProject = (param) => {
  return fetchRequest(URL.API_SERVER + "project/published", "POST", param);
};

export const getAppsBy = (param) => {
  const { mode, offset, limit } = param;
  return fetchRequest(
    URL.API_SERVER + `project/getAppsBy/${mode}/${offset}/${limit}`,
    "GET"
  );
};

export const getPopularTag = (param) => {
  return fetchRequest(URL.API_SERVER + `project/tag/popular`, "GET");
};

/*** comment */
export const getComments = (param) => {
  return fetchRequest(
    URL.API_SERVER +
      `${param.parentType}/comment/${param.parentId}/${param.limit}/${param.offset}`,
    "GET"
  );
};
export const postComment = (param) => {
  return fetchRequest(
    URL.API_SERVER + `${param.parentType}/comment`,
    "POST",
    param
  );
};
export const deleteComment = (param) => {
  return fetchRequest(
    URL.API_SERVER + `published/comment/${param.id}`,
    "DELETE"
  );
};
export const editComment = (param) => {
  return fetchRequest(URL.API_SERVER + `published/comment`, "PUT", param);
};

export const postReply = (param) => {
  return fetchRequest(
    URL.API_SERVER + `${param.parentType}/reply`,
    "POST",
    param
  );
};
export const deleteReply = (param) => {
  return fetchRequest(URL.API_SERVER + `published/reply/${param.id}`, "DELETE");
};
export const editReply = (param) => {
  return fetchRequest(URL.API_SERVER + `published/reply`, "PUT", param);
};

/*** like */
export const updatePublishedLike = (param) => {
  return fetchRequest(URL.API_SERVER + "published/like", "POST", param);
};
export const getPublishedLike = (param) => {
  return fetchRequest(
    URL.API_SERVER + `published/like/${param.pId}/${param.email}`,
    "GET"
  );
};

/*** upload */
export const upload = (formData) => {
  return fetch(URL.API_SERVER + "upload", {
    method: "POST",
    body: formData,
  });
};
export const uploadAsset = (formData) => {
  return fetch(URL.API_SERVER + "upload/asset", {
    method: "POST",
    body: formData,
  });
};
export const uploadPublished = (param) => {
  return fetchRequest(URL.API_SERVER + "upload/published", "POST", param);
};

export const uploadSaasPublished = () => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + "project/sampleGame/upload",
    "GET"
  );
};

export const uploadCustomAsset = () => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + "asset/customAsset/upload",
    "GET"
  );
};

export const addCustomAsset = (param) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + "asset/customAsset",
    "POST",
    param
  );
};

/*** asset */
export const assetsById = (param) => {
  return fetchRequest(URL.API_SERVER + "asset/getByIds", "POST", param);
};

export const getAssetsById = (param) => {
  return fetchSaasRequest(URL.API_SAAS_SERVER + "asset/list" + param, "GET");
};

export const addAsset = (param) => {
  return fetchRequest(URL.API_SERVER + "asset", "POST", param);
};

export const getCategories = () => {
  return fetchSaasRequest(URL.API_SAAS_SERVER + "assetCategory/list", "GET");
};

export const assetsByCategory = (param) => {
  return fetchSaasRequest(
    URL.API_SAAS_SERVER + `asset/category/list?categoryId=${param.categoryId}`
  );
};

/*** community */
export const getCommunityArticle = (param) => {
  return fetchRequest(
    URL.API_SERVER + `community/article/${param.articleId}`,
    "GET"
  );
};

/*** product */
export const getCLabProducts = (param) => {
  return fetchRequest(URL.API_SERVER + `products/${param.productType}`, "GET");
};
export const getCLabProduct = (param) => {
  return fetchRequest(URL.API_SERVER + `product/${param.id}`, "GET");
};

/*** gameRanking */
export const getGameRanking = (param) => {
  const { pId } = param;
  return fetchRequest(URL.API_SERVER + `gameRanking/${pId}`, "GET");
};
export const getGameRankingAsc = (param) => {
  const { pId } = param;
  return fetchRequest(URL.API_SERVER + `gameRanking/asc/${pId}`, "GET");
};

export const saveScore = (param) => {
  return fetchRequest(URL.API_SERVER + "gameRanking", "POST", param);
};

/*** statistics */
export const sendToStatistics = (param) => {
  return fetchRequest(URL.API_SERVER + "statistics", "POST", param);
};

/*** point payment */
export const pushInstantRun = (param) => {
  return fetchRequest(URL.API_SERVER + `push/instantRun`, "POST", param);
};

/*** noti */
export const getNotifications = (param) => {
  return fetchRequest(
    URL.API_SERVER +
      `notification/${param.email}/${param.limit}/${param.offset}`,
    "GET"
  );
};

/*** subscribe */
export const getSubscribesByType = (param) => {
  return fetchRequest(URL.API_SERVER + `subscribe/creators`, "POST", param);
};

export const isSubscribe = (param) => {
  return fetchRequest(
    URL.API_SERVER +
      `subscribe/isSubscribe/${param.email}/${param.creatorEmail}`,
    "GET"
  );
};
export const addSubscribe = (param) => {
  return fetchRequest(URL.API_SERVER + `subscribe`, "POST", param);
};

export const removeSubscribe = (param) => {
  return fetchRequest(
    URL.API_SERVER + `subscribe/${param.email}/${param.creatorEmail}`,
    "DELETE"
  );
};

// wizlive send entrance
export const sendWizLabReport = (param) => {
  return fetchRequest(
    URL.API_SERVER + `liveTutor/webhook/report`,
    "POST",
    param
  );
};

//game data
export const loadGameData = (param) => {
  return fetchRequest(URL.API_SERVER + `gameData/load`, "POST", param);
};

export const saveGameData = (param) => {
  return fetchRequest(URL.API_SERVER + `gameData/save`, "POST", param);
};

/** wiz lab project list */
export const getProjectListForTutor = (param) => {
  return fetchRequest(URL.API_SERVER + `project/list/tutor`, "GET");
};

export const getProjectLoadForTutor = (param) => {
  return fetchRequest(URL.API_SERVER + `project/load/tutor/${param.id}`, "GET");
};

// new wizlive
export const getReservationById = (param) => {
  return fetchRequest(
    URL.API_SERVER + `wizLive/reservation/id/${param.reservationId}`,
    "GET"
  );
};

//get record info
export const getS3Json = (param) => {
  return fetch(param.url, {
    method: "GET",
    headers: {},
  });
};

//project templates
export const getTemplateProjects = (param) => {
  return fetchRequest(URL.API_SERVER + "templates/", "GET", param);
};

/** tutorial */
export const getMyTutorialList = (param) => {
  return fetchRequest(URL.API_SERVER + `tutorial/list/${param.email}`, "GET");
};

export const getMyTutorial = (param) => {
  return fetchRequest(
    URL.API_SERVER + `tutorial/get/${param.email}/${param.level}`,
    "GET"
  );
};

export const createTutorialItem = (param) => {
  return fetchRequest(
    URL.API_SERVER + `tutorial/create/${param.email}/${param.level}`,
    "GET"
  );
};

export const updateTutorialItem = (param) => {
  return fetchRequest(URL.API_SERVER + `tutorial/update`, "POST", param);
};
// chat
export const getChatMessages = (param) => {
  return fetchRequest(URL.API_SERVER + `chat/messages/${param.roomId}`, "GET");
};

//OCP
export const addOcpUser = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/user/add`, "POST", param);
};

export const getMyOcp = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/myOcp`, "POST", param);
};

export const updateMyOcpSync = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/myOcp/update`, "POST", param);
};

export const updateMyOcpLevel = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/myOcp/level`, "POST", param);
};
export const updateOcpUser = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/user/update`, "POST", param);
};

export const getOcpUser = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/user`, "POST", param);
};

export const getOcpSuccessUser = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/user/success`, "POST", param);
};

export const addMyOcp = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/myOcp/add`, "POST", param);
};

export const updateMyOcpPrint = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/myOcp/print`, "POST", param);
};

//OCP2
export const addOcpUser2 = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/s2/user/add`, "POST", param);
};

export const getMyOcp2 = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/s2/myOcp/type`, "POST", param);
};

export const updateMyOcpSync2 = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/s2/myOcp/update`, "POST", param);
};

export const updateMyOcpLevel2 = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/s2/myOcp/level`, "POST", param);
};
export const updateOcpUser2 = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/s2/user/update`, "POST", param);
};

export const getOcpUser2 = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/s2/user`, "POST", param);
};

export const getOcpSuccessUser2 = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/s2/user/success`, "POST", param);
};

export const addMyOcp2 = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/s2/myOcp/add`, "POST", param);
};

export const updateMyOcpPrint2 = (param) => {
  return fetchRequest(URL.API_SERVER + `ocp/s2/myOcp/print`, "POST", param);
};

export const getOCPComments = (param) => {
  return fetchRequest(URL.API_SERVER + "ocp/s2/comments/get", "POST", param);
};
export const getOCPCommentsByEmail = (param) => {
  return fetchRequest(
    URL.API_SERVER + "ocp/s2/comments/getByEmail",
    "POST",
    param
  );
};
export const getOCPCount = (param) => {
  return fetchRequest(URL.API_SERVER + "ocp/s2/count/get", "POST", param);
};

export const addOCPComment = (param) => {
  return fetchRequest(URL.API_SERVER + "ocp/s2/comment/add", "POST", param);
};

export const deleteOCPComment = (param) => {
  return fetchRequest(URL.API_SERVER + "ocp/s2/comment/delete", "POST", param);
};

export const addOCPReport = (param) => {
  return fetchRequest(
    URL.API_SERVER + "ocp/s2/comment/report/add",
    "POST",
    param
  );
};

//play page
export const playProject = (params) => {
  return fetchRequest(URL.API_SERVER + "play/game/tag", "POST", params);
};

export const getProjectsByType = (param) => {
  return fetchRequest(URL.API_SERVER + `projects/bytype`, "POST", param);
};

/** ocp2 challenge event  */
export const getWhiteList = (param) => {
  return fetchRequest(URL.API_SERVER + `whiteList/${param.email}`, "GET");
};

//builder qna
export const getBuilderQuestions = (param) => {
  if (param.userId) {
    return fetchRequest(
      URL.API_SERVER +
        `wizlabQnA/${param.limit}/${param.offset}/${param.userId}`,
      "GET"
    );
  } else {
    return fetchRequest(
      URL.API_SERVER + `wizlabQnA/${param.limit}/${param.offset}`,
      "GET"
    );
  }
};

export const getBuilderQuestion = (param) => {
  return fetchRequest(URL.API_SERVER + `wizlabQnA/${param.id}`, "GET");
};

export const getQuestionState = (param) => {
  return fetchRequest(
    URL.API_SERVER + `wizlabQnA/get/state/${param.id}`,
    "POST"
  );
};

export const postBuilderQuestion = (params) => {
  return fetchRequest(URL.API_SERVER + `wizlabQnA/`, "POST", params);
};

export const postBuilderAnswer = (params) => {
  return fetchRequest(URL.API_SERVER + `wizlabQnA/answer`, "POST", params);
};

// dreamclass
export const deleteDreamLecture = (id) => {
  return fetchRequest(URL.API_SERVER + `dreamLecture/${id}`, "DELETE");
};
export const addDreamLectureForCourse = (courseId) => {
  return fetchRequest(
    URL.API_SERVER + `dreamCourse/${courseId}/emptyLecture`,
    "POST"
  );
};
export const getDreamProject = (id) => {
  return fetchRequest(URL.API_SERVER + `dreamProject/${id}`, "GET");
};
export const getDreamProjectsByTag = (tag) => {
  return fetchRequest(URL.API_SERVER + `dreamProjects/?tag=${tag}`, "GET");
};
export const updateDreamProject = (id, params) => {
  return fetchRequest(URL.API_SERVER + `dreamProject/${id}`, "PUT", params);
};
export const deleteDreamProject = (id) => {
  return fetchRequest(URL.API_SERVER + `dreamProject/${id}`, "DELETE");
};
export const addDreamProjectForLecture = (lectureId) => {
  return fetchRequest(
    URL.API_SERVER + `dreamLecture/${lectureId}/emptyProject`,
    "POST"
  );
};
export const postMyDreamProject = ({ projectId }) => {
  return fetchRequest(`${URL.API_SERVER}myDreamProject`, "POST", { projectId });
};

export const saveMyDreamProject = (id, updateValues) => {
  return fetchRequest(
    URL.API_SERVER + `myProject/complete/${id}`,
    "PUT",
    updateValues
  );
};
export const getNextMyDreamProject = (id) => {
  return fetchRequest(URL.API_SERVER + `nextMyProject/${id}`, "GET");
};

export const getPythonCategoryItembooks = () => {
  return fetchRequest(
    URL.API_SERVER + `dream/python/category/itembooks`,
    "GET"
  );
};

// ranking page
export const createDreamReport = (params) => {
  return fetchRequest(URL.API_SERVER + "dreamReport", "POST", params);
};

export const addCertificateInfo = (formData) => {
  return fetchRequest(
    URL.API_SERVER + `course/certificate`,
    "POST",
    formData
  ).then((res) => res.json());
};

export const accountActivateCheckout = (authorityKey) => {
  return fetchRequest(
    URL.API_SERVER + `account/activate/checkout/${authorityKey}`,
    "GET"
  );
};
export const getLearn = (formData) => {
  return fetchRequest(URL.API_SERVER + `learn/box`, "GET", formData).then(
    (res) => res.json()
  );
};
export const inviteSignup = (params, authorityKey) => {
  return fetchRequest(
    URL.API_SERVER + `account/register/${authorityKey.authorityKey}`,
    "POST",
    params
  );
};

export const loginByGoogle = (params) => {
  return fetchRequest(
    URL.API_SERVER + `account/loginByGoogle`,
    "POST",
    params
  ).then((res) => res.json());
};

export const getProjectShowHintState = (projectId) => {
  return fetchRequest(URL.API_SERVER + `myProject/${projectId}`, "GET").then(
    (res) => res.json()
  );
};
