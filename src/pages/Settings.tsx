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
  openai_api_key: string;
  gemini_api_key: string;
  modal?: string;
  model?: string;
  provider: string;
  prompt?: string;
}

interface SettingFormData {
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
  models: ModelOption[];
}

const initialForm = {
  name: user.name || "",
  email: user.email || "",
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

const providerOptions: ProviderOption[] = [
  {
    name: "OpenAI",
    value: "openai",
    models: [
      { name: "GPT-4O-mini", value: "gpt-4o-mini" },
      { name: "GPT-4O", value: "gpt-4o" }
    ]
  },
  {
    name: "Gemini",
    value: "google_genai",
    models: [
      // { name: "Gemini 1.5 Pro", value: "gemini-1.5-pro-002" },
      { name: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
      // { name: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
      { name: "Gemini 2.0 Flash Experimental", value: "gemini-2.0-flash-exp" }
    ]
  }
];

const Settings: React.FC = () => {
  const [formData, setFormData] = useState<SettingFormData>(initialForm);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [apiModel, setApiModel] = useState("");
  const [provider, setProvider] = useState("");
  const [prompt, setPrompt] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUpdateApi, setIsLoadingUpdateApi] = useState(false);
  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  
  const [showOpenaiApiKey, setShowOpenaiApiKey] = useState(false);
  const [showGeminiApiKey, setShowGeminiApiKey] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  const type = localStorage.getItem("type");

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProvider = e.target.value;
    setProvider(selectedProvider);
    
    const providerData = providerOptions.find(p => p.value === selectedProvider);
    if (providerData) {
      setAvailableModels(providerData.models);
      // Reset to first model of the selected provider
      setApiModel(providerData.models[0].value);
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
        
        setOpenaiApiKey(response.data.openai_api_key || "");
        setGeminiApiKey(response.data.gemini_api_key || "");
        setPrompt(response.data.prompt || "");
        
        // Set the provider
        if (response.data.provider) {
          setProvider(response.data.provider);
          
          // Set available models based on provider
          const providerData = providerOptions.find(p => p.value === response.data.provider);
          if (providerData) {
            setAvailableModels(providerData.models);
          }
        } else {
          // Default to first provider if not specified
          setProvider(providerOptions[0].value);
          setAvailableModels(providerOptions[0].models);
        }
        
        // Set the model (using either modal or model field from response)
        const modelValue = response.data.model || response.data.modal;
        if (modelValue) {
          const currentProvider = providerOptions.find(p => p.value === response.data.provider);
          if (currentProvider) {
            const modelExists = currentProvider.models.some(model => model.value === modelValue);
            if (modelExists) {
              setApiModel(modelValue);
            } else {
              setApiModel(currentProvider.models[0].value);
            }
          }
        } else {
          // Default to first model of selected provider
          const currentProvider = providerOptions.find(p => p.value === response.data.provider) || providerOptions[0];
          setApiModel(currentProvider.models[0].value);
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

    if (!openaiApiKey && provider === "openai") {
      notifyResponse({success: false, detail: "OpenAI API key is required"});
      return;
    }

    if (!geminiApiKey && provider === "google_genai") {
      notifyResponse({success: false, detail: "Gemini API key is required"});
      return;
    }
    
    if (!apiModel) {
      notifyResponse({success: false, detail: "AI Model is required"});
      return;
    }
    
    if (isLoadingUpdateApi) return;
    setIsLoadingUpdateApi(true);
    
    try {
      const response = await backendRequest<ApiResponse>("POST", "/update-api-key", {
        openai_api_key: openaiApiKey,
        gemini_api_key: geminiApiKey,
        model: apiModel,
        provider: provider,
        prompt: prompt
      });
      
      if (response.success) {
        notifyResponse(response);
        
        // Update state with response data
        if (response.data) {
          if (response.data.openai_api_key) setOpenaiApiKey(response.data.openai_api_key);
          if (response.data.gemini_api_key) setGeminiApiKey(response.data.gemini_api_key);
          if (response.data.model) setApiModel(response.data.model);
          else if (response.data.modal) setApiModel(response.data.modal);
          if (response.data.provider) setProvider(response.data.provider);
          if (response.data.prompt !== undefined) setPrompt(response.data.prompt);
        
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
    setFormData(initialForm);
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

  const toggleOpenaiApiKeyVisibility = () => {
    setShowOpenaiApiKey(!showOpenaiApiKey);
  };

  const toggleGeminiApiKeyVisibility = () => {
    setShowGeminiApiKey(!showGeminiApiKey);
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
              disabled={!formData.newPassword}
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
              <div className={`w-full relative ${provider !== "openai" && "hidden"}`}>
                <label className="block text-gray-700 mb-2">OpenAI API Key</label>
                <div className="relative">
                  <input
                    type={showOpenaiApiKey ? "text" : "password"}
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border-gray-300 pr-10"
                    placeholder="Enter OpenAI API Key"
                  />
                  <button
                    type="button"
                    onClick={toggleOpenaiApiKeyVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 hover:text-blue-600"
                  >
                    {showOpenaiApiKey ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className={`w-full relative ${provider !== "google_genai" && "hidden"}`}>
                <label className="block text-gray-700 mb-2">Gemini API Key</label>
                <div className="relative">
                  <input
                    type={showGeminiApiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border-gray-300 pr-10"
                    placeholder="Enter Gemini API Key"
                  />
                  <button
                    type="button"
                    onClick={toggleGeminiApiKeyVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 hover:text-blue-600"
                  >
                    {showGeminiApiKey ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-gray-700 mb-2">Select AI Model</label>
                <select
                  name="model"
                  value={apiModel}
                  onChange={(e) => setApiModel(e.target.value)}
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

            <div className="mt-4">
              <label className="block text-gray-700 mb-2">Custom Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 border-gray-300"
                placeholder="Enter a custom prompt for AI interactions"
                rows={4}
              />
              <p className="text-sm text-gray-600 mt-1">
                This prompt will be used as a default system or context prompt for AI interactions.
              </p>
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