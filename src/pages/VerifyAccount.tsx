import { useState } from "react";
// import { Link } from "react-router-dom";
import { backendRequest } from "../Helper/BackendReques";
import { notifyResponse } from "../Helper/notify";
import { setUserToken } from "../Helper/user";
import { useNavigate } from "react-router-dom";

const VerifyAccount = ({email}:{email:string}) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    if (!otp) {
      setError("OTP is required");
      return false;
    } else if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits");
      return false;
    }
    setError(null);
    return true;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setLoading(true);
        const response = await backendRequest("POST", "/account-verification", { code:otp,email });
        notifyResponse(response);
        if (response.success){
          setUserToken(response)
          navigate(`/${response.user.type}/chat/${response.chat}`);
        }
        console.log("Verification successful", response);
      } catch (error) {
        console.error("Verification failed", error);
      }
      finally {
        setLoading(false);
      }
    }
  };

  const resendOtp = async () => {
   
    
      try {
        
        const response = await backendRequest("POST", "/resend-otp", { email });
        notifyResponse(response);
        console.log("Verification successful", response);
      } catch (error) {
        console.error("Verification failed", error);
      }
    
  };



  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Verify Your Account
        </h2>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-gray-700">Enter OTP</label>
            <input
              type="text"
              className={`w-full mt-1 p-2 border rounded-lg outline-none ${
                error ? "border-red-500" : "border-gray-300 focus:ring focus:ring-indigo-300"
              }`}
              placeholder="Enter your OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <button
          disabled={loading}
            type="submit"
            className={`w-full  text-white p-2 rounded-lg  transition ${loading? "hover:cursor-not-allowed bg-blue-500":" hover:cursor-pointer bg-blue-500 hover:bg-blue-600"} `}
          >
            Verify OTP
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Didn't receive OTP?{" "}
          <span onClick={resendOtp} className="text-blue-500 hover:underline hover:cursor-pointer">
            Resend OTP
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyAccount;
