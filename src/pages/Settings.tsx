import React, { useEffect, useState } from "react";
import { FiUser, FiSettings, FiEye, FiEyeOff } from "react-icons/fi";
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

interface ApiResponse {
  success: boolean;
  data: ApiKeyData;
  detail?: string;
}

interface ApiKeyData {
  api_key: string;
  modal: string;
  base_url?: string;
  provider?: string;
}

interface settingFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ModelOption {
  name: string;
  value: string;
}

interface ProviderOption {
  name: string;
  value: string;
  baseUrl: string;
  models: ModelOption[];
}

const intitalForm = {
  name: user.name ? user.name : "",
  email: user.email ? user.email : "",
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const providerOptions: ProviderOption[] = [
  {
    name: "OpenAI",
    value: "openai",
    baseUrl: "https://api.openai.com/v1/",
    models: [
      { name: "GPT-4O-mini", value: "gpt-4o-mini" },
      { name: "GPT-4O", value: "gpt-4o" }
    ]
  },
  {
    name: "Gemini",
    value: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai/",
    models: [
      { name: "Gemini 1.5 Pro", value: "gemini-1.5-pro-002" },
      { name: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
      { name: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
      { name: "Gemini 2.0 Flash Experimental", value: "gemini-2.0-flash-exp" }
    ]
  }
];

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
  const [baseUrl, setBaseUrl] = useState("");
  const [provider, setProvider] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUpdateApi, setIsLoadingUpdateApi] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [showApiKey, setShowApiKey] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  const type = localStorage.getItem("type");

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvider = e.target.value;
    setProvider(selectedProvider);
    
    const providerData = providerOptions.find(p => p.value === selectedProvider);
    if (providerData) {
      setBaseUrl(providerData.baseUrl);
      setAvailableModels(providerData.models);
      // Reset to first model of the selected provider
      setApiModal(providerData.models[0].value);
    }
  };

  const getApikeyData = async () => {
    if (type !== "admin") return;
    if (isLoadingUpdateApi) return;
    
    setIsLoadingUpdateApi(true);
    try {
      const response = await backendRequest<ApiResponse>("GET", "/api-key");
      if (response.success) {
        console.log("API form data is:", response);
        
        // Set API key from response
        setApiKey(response.data.api_key || "");
        
        // Determine provider from base_url or direct provider field
        let foundProviderOption: ProviderOption | undefined;
        
        if (response.data.provider) {
          // If provider is directly specified in response
          foundProviderOption = providerOptions.find(p => p.value === response.data.provider);
          if (foundProviderOption) {
            setProvider(foundProviderOption.value);
          }
        } else if (response.data.base_url) {
          // Try to match by base_url
          foundProviderOption = providerOptions.find(p => p.baseUrl === response.data.base_url);
          if (foundProviderOption) {
            setProvider(foundProviderOption.value);
          }
        }
        
        // If no provider found, default to first one
        if (!foundProviderOption) {
          foundProviderOption = providerOptions[0];
          setProvider(foundProviderOption.value);
        }
        
        // Set available models based on provider
        setAvailableModels(foundProviderOption.models);
        
        // Set base URL (either from response or from matched provider)
        setBaseUrl(response.data.base_url || foundProviderOption.baseUrl);
        
        // Set the model (if it exists in provider's models, otherwise use first model)
        if (response.data.modal) {
          const modelExists = foundProviderOption.models.some(model => model.value === response.data.modal);
          if (modelExists) {
            setApiModal(response.data.modal);
          } else {
            setApiModal(foundProviderOption.models[0].value);
          }
        } else {
          setApiModal(foundProviderOption.models[0].value);
        }
        
        setDataFetched(true);
      }
    } catch (error) {
      console.error("Error fetching API key data:", error);
    } finally {
      setIsLoadingUpdateApi(false);
    }
  };

  const updateApikeyData = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type !== "admin") return;

    if (!apiKey) {
      notifyResponse({success: false, detail: "API key is required"});
      return;
    }
    
    if (!apiModal) {
      notifyResponse({success: false, detail: "AI Model is required"});
      return;
    }
    
    if (isLoadingUpdateApi) return;
    setIsLoadingUpdateApi(true);
    
    try {
      const selectedProviderData = providerOptions.find(p => p.value === provider);
      const selectedBaseUrl = selectedProviderData ? selectedProviderData.baseUrl : baseUrl;
      
      const response = await backendRequest<ApiResponse>("POST", "/update-api-key", {
        api_key: apiKey,
        model: apiModal,
        base_url: selectedBaseUrl,
        provider: provider
      });
      
      if (response.success) {
        notifyResponse(response);
        
        // Update state with response data
        if (response.data) {
          if (response.data.api_key) setApiKey(response.data.api_key);
          if (response.data.modal) setApiModal(response.data.modal);
          if (response.data.base_url) setBaseUrl(response.data.base_url);
          if (response.data.provider) setProvider(response.data.provider);
        
          // Update available models based on the provider
          if (response.data.provider) {
            const providerData = providerOptions.find(p => p.value === response.data.provider);
            if (providerData) {
              setAvailableModels(providerData.models);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating API key:", error);
    } finally {
      setIsLoadingUpdateApi(false);
    }
  };

  useEffect(() => {
    setFormData(intitalForm);
    // Fetch API key data when component mounts
    getApikeyData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = { ...errors };

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
              newPassword: formData.newPassword,
              confirmNewPassword: formData.confirmNewPassword
            }
          );
          if (response.success) {
            setUserInfo(response.data);
            notifyResponse(response);
            setFormData({
              ...formData,
              currentPassword: "",
              newPassword: "",
              confirmNewPassword: ""
            });
          } else {
            notifyResponse(response);
          }
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
          } else {
            notifyResponse(response);
          }
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] bg-gray-100 sm:px-4 py-2">
      <div className="w-full max-w-5xl bg-white rounded-lg sm:px-8 sm:py-4 p-3">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          <FiUser size={36} className="inline-block ml-2 font-bold" />
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
        
        {type === "admin" && (
          <form onSubmit={updateApikeyData} className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FiSettings className="mr-2" />
              AI Provider Settings
            </h3>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select AI Provider</label>
              <select
                name="provider"
                value={provider}
                onChange={handleProviderChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none bg-white text-gray-700 hover:border-blue-600 focus:border-blue-600 transition duration-300"
              >
                {providerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex sm:flex-row flex-col sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="w-full relative">
                <label className="block text-gray-700 mb-2">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border-gray-300 pr-10"
                    placeholder="Enter API Key"
                  />
                  <button
                    type="button"
                    onClick={toggleApiKeyVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 hover:text-blue-600"
                  >
                    {showApiKey ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-gray-700 mb-2">Select AI Model</label>
                <select
                  name="model"
                  value={apiModal}
                  onChange={(e) => setApiModal(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none bg-white text-gray-700 hover:border-blue-600 focus:border-blue-600 transition duration-300"
                  disabled={availableModels.length === 0}
                >
                  {availableModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              disabled={isLoadingUpdateApi}
              type="submit"
              className={`w-full flex gap-x-2 items-center justify-center py-2 mt-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ${
                isLoadingUpdateApi
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:cursor-pointer"
              }`}
            >
              <GrUpdate className="size-4" />
              Update AI Settings
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Settings;