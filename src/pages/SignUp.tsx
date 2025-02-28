import { useState } from "react";
import { Link } from "react-router-dom";
import { backendRequest } from "../Helper/BackendReques";
import { notifyResponse } from "../Helper/notify";
import VerifyAccount from "./VerifyAccount";
import { FiEye, FiEyeOff } from "react-icons/fi";
import LoaderUpload from "../Componnts/LoaderUpload";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyAccount, setVerifyAccount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    let valid = true;
    let newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name) {
      newErrors.name = "Name is required";
      valid = false;
    }

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
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        console.log("Signing up with", name, email, password);
        const response = await backendRequest("POST", "/signup", { name, email, password });
        if (response.success === true) {
          setVerifyAccount(true);
        }
        notifyResponse(response);
        console.log(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      {verifyAccount ? (
        <VerifyAccount email={email} />
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-gray-700">Full Name</label>
                <input
                  type="text"
                  className={`w-full mt-1 p-2 border rounded-lg outline-none ${
                    errors.name ? "border-red-500" : "border-gray-300 focus:ring focus:ring-indigo-300"
                  }`}
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  className={`w-full mt-1 p-2 border rounded-lg outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300 focus:ring focus:ring-indigo-300"
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
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-4 cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff className="hoer:cursor-pointer" /> : <FiEye className="hoer:cursor-pointer" />} 
                  </span>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <button
              disabled={loading}
                type="submit"
                className={`w-full  text-white p-2 rounded-lg  transition ${loading? "hover:cursor-not-allowed bg-blue-500":" hover:cursor-pointer bg-blue-500 hover:bg-blue-600"} `}
              >
               {loading?<LoaderUpload size="sm"/>:"Sign Up"} 
              </button>
            </form>
            <p className="text-center text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;
