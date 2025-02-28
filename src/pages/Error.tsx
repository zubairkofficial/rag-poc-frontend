// src/pages/NotFound.js
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Error = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.clear();
    navigate("/");

  }, []);
  return (
    <div className="flex justify-center item-center min-h-screen">
     
       <img className="flex justify-center item-center w-full " src="/404.png"/>
      {/* <Link to="/">Go back home</Link> */}
    </div>
  );
};

export default Error;
