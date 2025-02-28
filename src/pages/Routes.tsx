import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../Componnts/Loading"; 
import Layout from "./Layout";
import { LoginChecker } from "../Componnts/LoginChecker";
import Chat from "./Chat";
import UploadPage from "./UploadFiles";
import Settings from "./Settings";
import Home from "./Home";


const Login = lazy(() => import("./Login"));
const Signup = lazy(() => import("./SignUp"));
const Error = lazy(() => import("./Error"));
const ResetPassword = lazy(() => import("./ResetPassword"));

const AppRoutes = () => {

  return (
    <Router>
      {/* <Layout> */}
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<LoginChecker allowedUser="not-logged-in"><Login /></LoginChecker>} />
            <Route path="/signup" element={<LoginChecker allowedUser="not-logged-in"><Signup /></LoginChecker>}/>
            <Route path="/reset-password" element={<LoginChecker allowedUser="not-logged-in"><ResetPassword /></LoginChecker>} />
            {/* admin routes  */}
            
            <Route path="/" element={<LoginChecker allowedUser="logged-in"><Home /></LoginChecker>} > </Route>


            <Route path="/admin" element={<Layout/> }>
            <Route index element={<LoginChecker allowedUser="logged-in"><Navigate to={"/admin/files"} /></LoginChecker>} />
            <Route path="chat/:id" element={<LoginChecker allowedUser="logged-in"><Chat /></LoginChecker>} />
            <Route path="files" element={<LoginChecker allowedUser="logged-in"><UploadPage /></LoginChecker>} />
            <Route path="settings" element={<LoginChecker allowedUser="logged-in"><Settings /></LoginChecker>} />
            </Route>
            {/* user routes */}
            <Route path="/user" element={<Layout/> }>
            <Route index element={<LoginChecker allowedUser="logged-in"><Navigate to={"/files"} /></LoginChecker>} />
            <Route path="chat/:id" element={<LoginChecker allowedUser="logged-in"><Chat /></LoginChecker>} />
            {/* <Route path="files" element={<LoginChecker allowedUser="logged-in"><UploadPage /></LoginChecker>} /> */}
            <Route path="settings" element={<LoginChecker allowedUser="logged-in"><Settings /></LoginChecker>} />
            </Route>
            
            <Route path="*" element={<Error />} />
          </Routes>
        </Suspense>
      {/* </Layout> */}
    </Router>
  );
};

export default AppRoutes;
