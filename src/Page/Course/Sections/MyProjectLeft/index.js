import React from "react";
import BeforeLogin from "./BeforeLogin";
import AfterLogin from "./AfterLogin";
import "./index.scss";
/* props.session.isLogin ? */
function MyProjectLeft (props) {
  return (
    <div className="left-slide">
      { false ? <AfterLogin {...props}/> : <BeforeLogin {...props}/> } 
    </div>
  )
}

export default MyProjectLeft ;
