"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { FiUpload, FiAlertCircle, FiYoutube, FiFileText, FiGlobe } from "react-icons/fi"
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai"
import { BsCheckCircle, BsUpload } from "react-icons/bs"
import { FaRegEye, FaRegFilePdf } from "react-icons/fa"
import Loader from "../Componnts/LoaderUpload"
import { backendRequest } from "../Helper/BackendReques"
import { notifyResponse } from "../Helper/notify"
import DeleteModal from "../Componnts/DeleteModal"
import { API_BASE_URL } from "../Helper/constant"

interface UploadedFile {
  id: number
  name: string
  size: number
  url: string
  status: boolean
  path: string
  type?: string // 'youtube' or 'file' or 'web'
}

interface FetchFileInterface {
  success: boolean
  file: UploadedFile[]
}

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

const UploadPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null)
  const [isAddingYoutube, setIsAddingYoutube] = useState(false)
  const [activeTab, setActiveTab] = useState<"pdf" | "youtube" | "web">("pdf")
  const [dragActive, setDragActive] = useState(false)
  const [webUrls, setWebUrls] = useState<string[]>([""])
  const [isAddingWebContent, setIsAddingWebContent] = useState(false)
  const [processingUrls, setProcessingUrls] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await backendRequest<FetchFileInterface>("GET", "/files")
      if (response.success) {
        setUploadedFiles(response.file)
      } else {
        notifyResponse(response)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files).filter((file) => {
      if (file.type !== "application/pdf") {
        notifyResponse({ detail: `${file.name} is not a PDF file` })
        return false
      }
      if (file.size > MAX_FILE_SIZE) {
        notifyResponse({ detail: `${file.name} exceeds 500MB size limit` })
        return false
      }
      return true
    })

    if (newFiles.length === 0) return

    setNewFiles(newFiles)
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleFileUpload = async () => {
    if (!newFiles.length) {
      return notifyResponse({
        success: false,
        detail: "Please select files to upload",
      })
    }
    try {
      setIsUploading(true)
      for (const file of newFiles) {
        const formData = new FormData()
        formData.append("file", file)
        const response = await backendRequest("POST", "/upload-file", formData, {}, true)
        if (response.success) {
          await fetchFiles()
          notifyResponse(response)
        } else {
          notifyResponse(response)
        }
      }
    } catch (error) {
      console.error("Upload failed:", error)
      notifyResponse({
        success: false,
        detail: "Failed to upload one or more files. Please try again.",
      })
    } finally {
      setNewFiles([])
      setIsUploading(false)
    }
  }

  const truncateFileName = (fileName: string) => {
    const maxLength = 15
    const fileExtension = fileName.slice(fileName.lastIndexOf("."))
    const baseName = fileName.slice(0, fileName.lastIndexOf("."))
    const truncatedBaseName = baseName.length > maxLength ? baseName.slice(0, maxLength) + "..." : baseName
    return truncatedBaseName + fileExtension
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDelete = async () => {
    if (!deleteFileId) return
    const fileId = deleteFileId
    try {
      const response = await backendRequest("DELETE", `/files/${fileId}`)
      if (response.success) {
        notifyResponse(response)
        setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
      } else {
        notifyResponse(response)
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      notifyResponse({
        success: false,
        detail: "Failed to delete file. Please try again.",
      })
    } finally {
      setIsDeleteModalOpen(false)
      setDeleteFileId(null)
    }
  }

  const handleToggle = async (fileId: number) => {
    const file = uploadedFiles.find((f) => f.id === fileId)
    if (!file) return

    try {
      const response = await backendRequest("PUT", `/files/${fileId}`, {
        status: !file.status,
      })
      if (response.success) {
        setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: !f.status } : f)))
        notifyResponse(response)
      }
    } catch (error) {
      console.error("Error updating file status:", error)
      notifyResponse({
        success: false,
        detail: "Failed to update file status. Please try again.",
      })
    }
  }

  const handleViewPdf = (id: number) => {
    try {
      window.open(`${API_BASE_URL}/file/${id}`, "_blank")
    } catch (error) {
      notifyResponse({ success: false, detail: "Failed to open PDF" })
    }
  }

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const handleWebUrlChange = (index: number, value: string) => {
    const newWebUrls = [...webUrls]
    newWebUrls[index] = value
    setWebUrls(newWebUrls)
  }

  const handleRemoveWebUrlField = (index: number) => {
    const newWebUrls = [...webUrls]
    newWebUrls.splice(index, 1)
    setWebUrls(newWebUrls.length > 0 ? newWebUrls : [""])
  }

  const handleAddWebUrlField = () => {
    setWebUrls([...webUrls, ""])
  }

  const handleWebContentSubmit = async () => {
    // Filter out empty URLs and validate
    const validUrls = webUrls.filter((url) => url.trim() !== "")

    if (validUrls.length === 0) {
      return notifyResponse({
        success: false,
        detail: "Please enter at least one valid URL",
      })
    }

    // Check if all URLs are valid
    const invalidUrls = validUrls.filter((url) => !validateUrl(url))
    if (invalidUrls.length > 0) {
      return notifyResponse({
        success: false,
        detail: `Invalid URL format: ${invalidUrls.join(", ")}`,
      })
    }

    setIsAddingWebContent(true)

    try {
      // Send all URLs in a single request
      const response = await backendRequest("POST", "/add-web-content", {
        urls: validUrls,
      })

      if (response.success) {
        notifyResponse({
          success: true,
          detail: `Successfully added content from ${validUrls.length} URL(s)`,
        })

        // Clear the form and refresh files
        setWebUrls([""])
        await fetchFiles()
      } else {
        notifyResponse(response)
      }
    } catch (error) {
      console.error("Failed to add web content:", error)
      notifyResponse({
        success: false,
        detail: "Failed to add web content. Please try again.",
      })
    } finally {
      setIsAddingWebContent(false)
    }
  }

  const handleMultipleYoutubeUpload = async () => {
    // Similar implementation to web content but for YouTube URLs
    const validUrls = webUrls.filter((url) => url.trim() !== "")

    if (validUrls.length === 0) {
      return notifyResponse({
        success: false,
        detail: "Please enter at least one YouTube URL",
      })
    }

    // Check if all URLs are YouTube URLs
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/
    const invalidUrls = validUrls.filter((url) => !youtubeRegex.test(url))
    if (invalidUrls.length > 0) {
      return notifyResponse({
        success: false,
        detail: `Invalid YouTube URL format: ${invalidUrls.join(", ")}`,
      })
    }

    setIsAddingYoutube(true)

    try {
      // Process each YouTube URL individually
      for (const url of validUrls) {
        setProcessingUrls((prev) => ({ ...prev, [url]: true }))

        const response = await backendRequest("POST", "/add-transcription", {
          video_url: url,
        })

        if (response.success) {
          notifyResponse({
            success: true,
            detail: `Successfully added YouTube video: ${url}`,
          })
        } else {
          notifyResponse({
            success: false,
            detail: `Failed to add YouTube video ${url}: ${response.detail || "Unknown error"}`,
          })
        }

        setProcessingUrls((prev) => ({ ...prev, [url]: false }))
      }

      // Clear the form and refresh files
      setWebUrls([""])
      await fetchFiles()
    } catch (error) {
      console.error("Failed to add YouTube videos:", error)
      notifyResponse({
        success: false,
        detail: "Failed to add YouTube videos. Please try again.",
      })
    } finally {
      setIsAddingYoutube(false)
      setProcessingUrls({})
    }
  }

  return (
    <div className="bg-gray-100 min-h-[90vh]">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <FiFileText className="mr-3 text-blue-500" />
            Knowledge Base
          </h1>
          <p className="text-gray-600">Upload and manage your documents and videos for AI processing</p>
        </div>

        {/* Tabs Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 transition-all duration-300 hover:shadow-xl">
          <div className="flex border-b flex-wrap">
            <button
              className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-200 ${
                activeTab === "pdf"
                  ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("pdf")}
            >
              <div className="flex items-center justify-center gap-2">
                <FaRegFilePdf className="size-5" />
                <span>Upload PDF</span>
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-200 ${
                activeTab === "youtube"
                  ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("youtube")}
            >
              <div className="flex items-center justify-center gap-2">
                <FiYoutube className="size-5" />
                <span>YouTube URL</span>
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-4 text-center font-medium transition-all duration-200 ${
                activeTab === "web"
                  ? "text-blue-500 border-b-2 border-blue-500 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab("web")}
            >
              <div className="flex items-center justify-center gap-2">
                <FiGlobe className="size-5" />
                <span>Web Content</span>
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === "pdf" && (
              <div
                className={`transition-all duration-200 ease-in-out ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                {/* Drag and drop area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center transition-all duration-200 
                    ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"}
                    ${newFiles.length > 0 ? "bg-green-50 border-green-300" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    id="file-upload"
                    className="hidden"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    disabled={isUploading}
                  />

                  {newFiles.length > 0 ? (
                    <div>
                      <BsCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Files Ready for Upload</h3>
                      <ul className="max-w-lg mx-auto text-sm text-gray-600 mb-3">
                        {newFiles.map((file, index) => (
                          <li key={index} className="flex justify-between items-center py-1">
                            <span className="truncate">{file.name}</span>
                            <span className="text-gray-500 ml-2">{formatFileSize(file.size)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <BsUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Drag & Drop PDF Files</h3>
                      <p className="text-sm text-gray-500 mb-3">or click to browse from your computer</p>
                      <p className="text-xs text-gray-400">Maximum file size: 500MB</p>
                    </div>
                  )}

                  <div className="mt-4 flex justify-center">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <FaRegFilePdf className="mr-2 size-4" />
                      {newFiles.length > 0 ? "Select Different Files" : "Select Files"}
                    </label>
                  </div>
                </div>

                {newFiles.length > 0 && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleFileUpload}
                      className="flex items-center justify-center gap-2 bg-blue-500 text-white rounded-full text-lg py-2 px-8 hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader size="sm" /> Uploading...
                        </>
                      ) : (
                        <>
                          <FiUpload /> Upload {newFiles.length} {newFiles.length === 1 ? "File" : "Files"}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "youtube" && (
              <div className="transition-all duration-200 ease-in-out">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6">
                    <div className="flex items-start">
                      <FiYoutube className="h-6 w-6 text-red-500 mr-3 mt-1" />
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-1">Add YouTube Videos</h3>
                        <p className="text-sm text-gray-600">
                          Enter YouTube URLs to extract and add their content to your knowledge base.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {webUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => handleWebUrlChange(index, e.target.value)}
                            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="https://www.youtube.com/watch?v=..."
                            disabled={isAddingYoutube}
                          />
                        </div>
                        {processingUrls[url] && (
                          <div className="w-10 flex justify-center">
                            <Loader size="sm" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveWebUrlField(index)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                          disabled={webUrls.length === 1 || isAddingYoutube}
                        >
                          <AiOutlineDelete className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={handleAddWebUrlField}
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50"
                      disabled={isAddingYoutube}
                    >
                      <AiOutlinePlus /> Add Another URL
                    </button>

                    <button
                      onClick={handleMultipleYoutubeUpload}
                      className="flex items-center justify-center gap-2 bg-blue-500 text-white rounded-full py-2 px-6 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      disabled={isAddingYoutube || webUrls.every((url) => !url.trim())}
                    >
                      {isAddingYoutube ? (
                        <>
                          <Loader size="sm" /> Processing...
                        </>
                      ) : (
                        <>
                          <FiYoutube /> Upload Videos
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "web" && (
              <div className="transition-all duration-200 ease-in-out">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div className="flex items-start">
                      <FiGlobe className="h-6 w-6 text-blue-500 mr-3 mt-1" />
                      <div>
                        <h3 className="text-md font-medium text-gray-900 mb-1">Add Web Content</h3>
                        <p className="text-sm text-gray-600">
                          Enter website URLs to extract and add their content to your knowledge base.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {webUrls.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => handleWebUrlChange(index, e.target.value)}
                            className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="https://example.com/page"
                            disabled={isAddingWebContent}
                          />
                        </div>
                        {processingUrls[url] && (
                          <div className="w-10 flex justify-center">
                            <Loader size="sm" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveWebUrlField(index)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                          disabled={webUrls.length === 1 || isAddingWebContent}
                        >
                          <AiOutlineDelete className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={handleAddWebUrlField}
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50"
                      disabled={isAddingWebContent}
                    >
                      <AiOutlinePlus /> Add Another URL
                    </button>

                    <button
                      onClick={handleWebContentSubmit}
                      className="flex items-center justify-center gap-2 bg-blue-500 text-white rounded-full py-2 px-6 hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                      disabled={isAddingWebContent || webUrls.every((url) => !url.trim())}
                    >
                      {isAddingWebContent ? (
                        <>
                          <Loader size="sm" /> Processing...
                        </>
                      ) : (
                        <>
                          <FiGlobe /> Add Web Content
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Files List Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <BsCheckCircle className="mr-2 text-blue-500" />
            Knowledge Base Files
          </h2>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader size="md" color="blue" />
              <p className="text-gray-500 mt-4">Loading your knowledge base...</p>
            </div>
          ) : uploadedFiles.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No files in your knowledge base</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Upload PDF documents, add YouTube videos, or import web content to create your knowledge base
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-gray-50 rounded-lg p-4 transition-all duration-200 hover:shadow-md border border-gray-100 hover:border-blue-200"
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 p-2 rounded-lg mr-3 ${
                        file.type === "youtube" ? "bg-red-100" : file.type === "website" ? "bg-blue-100" : "bg-blue-100"
                      }`}
                    >
                      {file.type === "youtube" ? (
                        <FiYoutube className="w-6 h-6 text-red-500" />
                      ) : file.type === "website" ? (
                        <FiGlobe className="w-6 h-6 text-blue-500" />
                      ): ""}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <div className="flex items-center space-x-2 ml-2">
                          <div
                            className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer ${
                              file.status ? "bg-blue-500" : "bg-gray-300"
                            }`}
                            onClick={() => handleToggle(file.id)}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                                file.status ? "translate-x-6" : ""
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        {file.type === "youtube"
                          ? "Youtube Video"
                          : file.type === "website"
                            ? "Website Page Content"
                            : "PDF Document"}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-500">
                          {file.status ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>

                        <div className="flex space-x-3">
                          {file.type !== "youtube" && file.type !== "web" && (
                            <button
                              onClick={() => handleViewPdf(file.id)}
                              className="text-green-500 hover:text-green-600 transition-colors duration-200 rounded-full hover:bg-green-50 p-1"
                              title="View PDF"
                            >
                              <FaRegEye className="w-5 h-5" />
                            </button>
                          )}
                          {(file.type === "youtube" || file.type === "web") && (
                            <a
                              href={file.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-500 hover:text-green-600 transition-colors duration-200 rounded-full hover:bg-green-50 p-1"
                            >
                              <FaRegEye className="w-5 h-5" />
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setDeleteFileId(file.id)
                              setIsDeleteModalOpen(true)
                            }}
                            className="text-red-500 hover:text-red-600 transition-colors duration-200 rounded-full hover:bg-red-50 p-1"
                            title="Delete file"
                          >
                            <AiOutlineDelete className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        message="Are you sure you want to delete this file from your knowledge base?"
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default UploadPage

