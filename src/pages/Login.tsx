import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { backendRequest } from "../Helper/BackendReques";
import { notifyResponse } from "../Helper/notify";
import VerifyAccount from "./VerifyAccount";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { setUserToken } from "../Helper/user";
import LoaderUpload from "../Componnts/LoaderUpload";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifyAccount, setVerifyAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const navigate = useNavigate();

  const validateForm = () => {
    let valid = true;
    let newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email address";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } 

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        const response = await backendRequest("POST", "/signin", { email, password });
        notifyResponse(response);
        if (response.verify == false) {
          setVerifyAccount(true);
        }else{
          setUserToken(response)
          navigate(`/${response.user.type}/chat/${response.chat}`)
        }
      } catch (error) {
        // Handle error
      }
      finally {
        setLoading(false);
      }
      console.log("Logging in with", email, password);
    }
  };

  return (
    <>
      {verifyAccount ? (
        <VerifyAccount email={email} />
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  className={`w-full mt-1 p-2 border rounded-lg outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300 focus:ring focus:ring-purple-600"
                  }`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full mt-1 p-2 border rounded-lg outline-none ${
                      errors.password ? "border-red-500" : "border-gray-300 focus:ring focus:ring-purple-600"
                    }`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-6 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff className="hover:cursor-pointer" /> : <FiEye className="hover:cursor-pointer" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <Link to="/reset-password" className="text-blue-500  text-center flex justify-center hover:underline">Reset Password </Link>

              <button
                type="submit"
                className={`w-full  text-white p-2 rounded-lg  transition ${loading? "hover:cursor-not-allowed bg-blue-500":" hover:cursor-pointer bg-blue-500 hover:bg-blue-600"} `}
              >
               {loading?<LoaderUpload size="sm"/>:"Login"} 
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
