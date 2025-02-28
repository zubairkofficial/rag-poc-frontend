import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { backendRequest } from "../Helper/BackendReques";
import { notifyResponse } from "../Helper/notify";
import { FiEye, FiEyeOff } from "react-icons/fi";
import LoaderUpload from "../Componnts/LoaderUpload";

const ResetPassword = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([true, false, false]);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const steps = ["Enter Email", "Verify Code", "Set Password"];

  const goToStep = (stepIndex: number) => {
    if (completedSteps[stepIndex]) {
      setActiveStep(stepIndex);
    }
  };
  const navigate = useNavigate();

  const validateStep = () => {
    let newErrors: { [key: string]: string } = {};

    if (activeStep === 0) {
      if (!email) newErrors.email = "Email is required";
      else if (!email.includes("@")) newErrors.email = "Enter a valid email";
    }

    if (activeStep === 1) {
      if (!code) newErrors.code = "Verification code is required";
      else if (code.length < 4) newErrors.code = "Enter a valid  code";
    }

    if (activeStep === 2) {
      if (!newPassword) newErrors.newPassword = "Password is required";
      else if (newPassword.length < 6)
        newErrors.newPassword = "Password must be at least 6 characters";

      if (!confirmPassword) newErrors.confirmPassword = "Confirm your password";
      else if (newPassword !== confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendResetCode = async () => {
    if (!validateStep()) return;

    console.log("Sending reset code to:", email);
    setLoading(true);
    try {
      const response = await backendRequest("POST", "/password-reset-code", {
        email,
      });
      console.log(response);
      if (response.success) {
        setActiveStep(1);
        setCompletedSteps([true, true, false]);
        notifyResponse(response);
        setErrors({});
      } else {
        notifyResponse(response);
      }
    } catch (error) {}
    finally{
        setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!validateStep()) return;

    console.log("Verifying code:", code);
    setLoading(true);
    try {
      const response = await backendRequest("POST", "/confirm-opt", {
        email,
        code,
      });
      console.log(response);
      if (response.success) {
        setActiveStep(2);
        setCompletedSteps([true, true, true]);
        notifyResponse(response);
        setErrors({});
      } else {
        notifyResponse(response);
      }
    } catch (error) {}
    finally{
        setLoading(false);
    }   
  };

  const resetPassword = async () => {
    if (!validateStep()) return;

    console.log("Resetting password...");
    setLoading(true);
    try {
      const response = await backendRequest("POST", "/reset-password", {
        email,
        code,
        password: newPassword,
      });
      console.log(response);
      if (response.success) {
        notifyResponse(response);
        navigate("/login");
        setErrors({});
      } else {
        notifyResponse(response);
      }
    } catch (error) {}
    finally{
        setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full mx-auto p-6 bg-white shadow-lg rounded-lg">
        {/* Custom Clickable Stepper */}
        <h1 className="text-center text-2xl font-semibold pb-5">
          Reset Password
        </h1>
        <div className="flex justify-between items-center mb-6 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col z-10 items-center cursor-pointer"
              onClick={() => goToStep(index)}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center text-white font-semibold rounded-full transition-all 
                  ${
                    completedSteps[index]
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "bg-gray-300 cursor-not-allowed"
                  }
                  ${activeStep === index ? "ring-2 ring-purple-400" : ""}`}
              >
                {index + 1}
              </div>
              <p className="text-xs mt-1">{step}</p>
            </div>
          ))}
          <div className="absolute top-4 left-4 right-6 h-0.5 bg-gray-300 z-0"></div>
        </div>

        {/* Step 1: Enter Email */}
        {activeStep === 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className={`w-full px-3 py-2 mt-1 border-2 rounded-lg focus:ring-0 focus:ring-blue-300 ${
                errors.email ? "border-red-500" : "border-purple-300"
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}

            <button
              disabled={loading}
              onClick={sendResetCode}
              className={`w-full mt-5  text-white p-2 rounded-lg  transition ${loading? "hover:cursor-not-allowed bg-blue-500":" hover:cursor-pointer bg-blue-500 hover:bg-blue-600"} `}
            >
             {loading?<LoaderUpload size="sm"/>:" Send Reset Code"}
            </button>
          </div>
        )}

        {/* Step 2: Enter Code */}
        {activeStep === 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Verification Code
            </label>
            <input
              type="text"
              placeholder="Enter the code"
              className={`w-full px-3 py-2 mt-1 border-2 rounded-lg focus:ring-0 focus:ring-blue-300 ${
                errors.code ? "border-red-500" : "border-purple-300"
              }`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {errors.code && (
              <p className="text-red-500 text-sm">{errors.code}</p>
            )}

            <button
            disabled={loading}
              onClick={verifyCode}
              className={`w-full mt-5  text-white p-2 rounded-lg  transition ${loading? "hover:cursor-not-allowed bg-blue-500":" hover:cursor-pointer bg-blue-500 hover:bg-blue-600"} `}
            >
             {loading?<LoaderUpload size="sm"/>:"Verify Code"} 
            </button>
          </div>
        )}

        {/* Step 3: Set Password */}
        {activeStep === 2 && (
          <div>
            
            <div>
              <label className="block text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full mt-1 p-2 border-2 rounded-lg outline-none ${
                    errors.newPassword
                      ? "border-red-500"
                      : "border-gray-300 focus:ring focus:ring-purple-600"
                  }`}
                  placeholder="Enter your password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-2 top-6 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="hover:cursor-pointer" />
                  ) : (
                    <FiEye className="hover:cursor-pointer" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
                <label className="block text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full mt-1 p-2 border-2 rounded-lg outline-none ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300 focus:ring focus:ring-purple-600"
                    }`}
                    placeholder="Enter confirmation password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-6 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff className="hover:cursor-pointer" /> : <FiEye className="hover:cursor-pointer" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

            <button
            disabled={loading}
              onClick={resetPassword}
              className={`w-full mt-5 text-white p-2 rounded-lg  transition ${loading? "hover:cursor-not-allowed bg-blue-500":" hover:cursor-pointer bg-blue-500 hover:bg-blue-600"} `}
            >
             {loading?<LoaderUpload size="sm"/>:"Reset Password"} 
            </button>
          </div>
        )}

        <p className="text-center text-gray-600 mt-4">
          Return to{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
