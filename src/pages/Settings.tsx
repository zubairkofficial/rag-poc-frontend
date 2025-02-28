import React, { useEffect, useState } from "react";
import { FiUser } from "react-icons/fi";
import { GrUpdate } from "react-icons/gr";
import { backendRequest } from "../Helper/BackendReques";
import { user, setUserInfo } from "../Helper/user";
import { notifyResponse } from "../Helper/notify";

interface UpdateProfileResponse {
  data: {
    name: string;
    email: string;
  };
  success: boolean;
}

interface settingFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const intitalForm = {
  name: user.name ? user.name : "",
  email: user.email ? user.email : "",
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};
const Settings: React.FC = () => {
  const [formData, setFormData] = useState<settingFormData>(intitalForm);

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  
  const [apiKey, setApiKey] = useState("");
  const [apiModal, setApiModal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUpdateApi, setIsLoadingUpdateApi] = useState(false);

  const type = localStorage.getItem("type")


  const getApikeyData = async ()=>{
    if (type=="user") return
    // if (!apiKey) {
    //   notifyResponse({success:false,detail:"Open AI Api key is required"})
    //   return
    // }
    // if (!apiModal) {
    //   notifyResponse({success:false,detail:"Open AI Modal is required key is required"})
    //   return
    // }
    if (isLoadingUpdateApi) return
    setIsLoadingUpdateApi(true)
    try {
     const  response =  await backendRequest("GET","/api-key")
     if (response.success){
      console.log("api form data is ",response)
      setApiKey(response.data.api_key)
      setApiModal(response.data.modal)
     }
    } catch (error) {
      
    }
    finally{
      setIsLoadingUpdateApi(false)
    }
  }

  const updateApikeyData = async (e: React.FormEvent)=>{
    e.preventDefault()
    
    if (type=="user") return

    if (!apiKey) {
      notifyResponse({success:false,detail:"Open AI Api key is required"})
      return
    }
    if (!apiModal) {
      notifyResponse({success:false,detail:"Open AI Modal is required key is required"})
      return
    }
    if (isLoadingUpdateApi) return s
    setIsLoadingUpdateApi(true)
    try {
     const  response =  await backendRequest("POST","/update-api-key",{api_key:apiKey,model:apiModal})
     if (response.success){
      console.log("api form data is ",response)
      notifyResponse(response)
      setApiKey(response.data.api_key)
      // setApiModal(response.data.modal)
     }
    } catch (error) {
      
    }
    finally{
      setIsLoadingUpdateApi(false)
    }
  }

  useEffect(() => {
    console.log("befre this ");
    console.log(intitalForm, "this is the value of form data");
    setFormData(intitalForm);
    getApikeyData()
    console.log("after this ");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = { ...errors };

    // Name and email are always required
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required";
      valid = false;
    }

    // Check if password change is attempted
    if (formData.newPassword.trim()) {
      if (!formData.currentPassword.trim()) {
        newErrors.currentPassword = "Current password is required";
        valid = false;
      }

      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "New password must be at least 6 characters";
        valid = false;
      }

      if (formData.confirmNewPassword !== formData.newPassword) {
        newErrors.confirmNewPassword = "Passwords do not match";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      if (isLoading) return;
      console.log("Form submitted:", formData);

      try {
        setIsLoading(true);
        if (formData.newPassword.trim()) {
          const response = await backendRequest<UpdateProfileResponse>(
            "POST",
            "/update-profile",
            {
              name: formData.name,
              email: formData.email,
              password: formData.currentPassword,
            }
          );
          if (response.success) {
            setUserInfo(response.data);
            notifyResponse(response);
            setFormData(intitalForm);
            setIsLoading(false);
          } else {
            notifyResponse(response);
            setIsLoading(false);
          }
          //  console.log("Updating password...");
        } else {
          const response = await backendRequest<UpdateProfileResponse>(
            "POST",
            "/update-profile",
            {
              name: formData.name,
              email: formData.email,
            }
          );
          if (response.success) {
            setUserInfo(response.data);
            notifyResponse(response);

            setIsLoading(false);
          } else {
            notifyResponse(response);
            setIsLoading(false);
          }

          //  console.log("Updating name and email...");
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex  items-center justify-center min-h-[90vh] bg-gray-100 sm:px-4 py-2">
      <div className="w-full max-w-2xl bg-white rounded-lg sm:px-8 sm:py-4 p-3">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {/* Settings */}
          <FiUser size={36} className="inline-block ml-2 font-bold " />
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password Update Section */}
          <h3 className="text-xl font-semibold mt-4">
            Change Password
          </h3>

          <div>
            <label className="block text-gray-700">Current Password</label>
            <input
              type="password"
              autoComplete="off"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 ${
                errors.currentPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm">{errors.currentPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm">{errors.newPassword}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Confirm New Password</label>
            <input
              type="password"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-600 ${
                errors.confirmNewPassword ? "border-red-500" : "border-gray-300"
              }`}
              disabled={!formData.newPassword} // Disable if new password is not entered
            />
            {errors.confirmNewPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmNewPassword}
              </p>
            )}
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className={`w-full flex gap-x-2 items-center justify-center py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : " hover:cursor-pointer"
            }`}
          >
            <GrUpdate className="size-4" />
            Update Settings
          </button>
        </form>
        {
          type === "admin" && 
        <form onSubmit={updateApikeyData}>
          <div className="flex sm:flex-row flex-col items-center space-x-4 py-3">
            <div className="w-full ms-3">
              <label className="block text-gray-700">Open AI Api key</label>
              <input
                type="text"
                name="confirmNewPassword"
                value={apiKey}
                onChange={(e)=>setApiKey(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  errors.confirmNewPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {errors.confirmNewPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmNewPassword}
                </p>
              )}
            </div>

            <div className="w-full">
              <label className="block text-gray-700">Select AI Model</label>
              <select
                name="model"
                value={apiModal || 'gpt-4o-mini'}
                onChange={(e)=>setApiModal(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none bg-white text-gray-700 hover:border-blue-600 focus:border-purple-600 transition duration-300"
              >
                {/* <option value="gpt-4o-mini">GPT-4O-mini</option> */}
                <option value="gpt-4o-mini">GPT-4O-mini</option>
                <option value="gpt-4o">GPT-4O</option>
              </select>
            </div>
          </div>

          <button
            disabled={isLoadingUpdateApi}
            type="submit"
            className={`w-full flex gap-x-2 items-center justify-center py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ${
              isLoadingUpdateApi
                ? "opacity-50 cursor-not-allowed"
                : " hover:cursor-pointer"
            }`}
          >
            <GrUpdate className="size-4" />
            Update Api Key
          </button>
        </form>
        }
      </div>
    </div>
  );
};

export default Settings;
