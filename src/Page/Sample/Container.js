import React, { useEffect, useState } from "react";
import * as request from "../../Common/Util/HTTPRequest";
import View from "./View";

const Container = (props) => {
  const { mode, projectId } = props.match.params;
  const [sampleGameURL, setSampleGameURL] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await request.getSaasDevelopingProject(projectId);
        const ans = await response.json();
        const sampleGame = ans.data.projectInfo.sampleGameURL;
        const url = `${process.env.REACT_APP_THUMBNAIL_ALI}${sampleGame}`;
        setSampleGameURL(url);
      } catch (error) {
        //
      }
    };

    fetchData();
  }, [projectId]);

  return <View {...props} sampleGameURL={sampleGameURL} mode={mode} />;
};

export default Container;
