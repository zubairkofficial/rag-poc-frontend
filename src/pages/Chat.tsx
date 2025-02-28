import { useState, useEffect, useRef } from "react";
import { LuUser, LuBot } from "react-icons/lu";
import { IoIosSend } from "react-icons/io";
import { HiOutlineSparkles } from "react-icons/hi2";
import {
  backendRequest,
  backendStreamingRequest,
} from "../Helper/BackendReques";
import { useParams } from "react-router-dom";
// import Markdown from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

import { notifyResponse } from "../Helper/notify";
import Loader from "../Componnts/LoaderUpload";

interface Message {
  id: number;
  question?: string;
  answer?: string;
}
interface GetChatInterface {
  chat: Message[];
  success: boolean;
  // answer?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatFetchLoading, setChatFetchLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { id } = useParams();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFetch = async () => {
    try {
      setChatFetchLoading(true);
      const response = await backendRequest<GetChatInterface>(
        "GET",
        `/chat/${id}`
      );
      if (response.success) {
        let chatHistory = response.chat;
        if (chatHistory.length === 0) {
          chatHistory.push({
            id: 0,
            question: "", // No user question
            answer:
              "Hello! I’m your CTC Heat Pump Support Agent. I can assist with installation, troubleshooting, and general usage tips—in multiple languages. If I’m ever unsure, I’ll let you know and offer my best guidance. How can I help you today?",
          });
        }
        setMessages(chatHistory);
        setChatFetchLoading(false);
      } else {
        notifyResponse(response);
      }
      console.log("response", response);
    } catch (error) {
    } finally {
      setChatFetchLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
    handleFetch();
  }, [id]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (isLoading) return;

    const newMessage: Message = {
      id: messages.length + 1,
      question: input,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const stream = backendStreamingRequest("POST", `/chat/${id}`, {
        question: input,
      });

      for await (const chunk of stream) {
        if (chunk) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id
                ? { ...msg, answer: (msg.answer || "") + chunk }
                : msg
            )
          );
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log("Raw error:", error);

      let errorMessage = "An unknown error occurred.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        try {
          errorMessage = JSON.stringify(error);
        } catch (stringifyError) {
          errorMessage = "Error could not be stringified.";
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      console.error("Parsed error message:", errorMessage);

      notifyResponse({
        success: false,
        detail: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gray-100">
      <div className="h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-500 p-4 flex items-center gap-3">
          <HiOutlineSparkles className="w-6 h-6 text-purple-100" />
          <h1 className="text-xl font-semibold text-white">AI Assistant</h1>
        </div>

        {chatFetchLoading ? (
          <div className=" flex flex-col text-center py-8 flex-1 items-center justify-center ">
            <Loader size="md" color="purple" />
            <p className="text-gray-500 mt-3">Loading chat...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto sm:px-4 px-2 py-1 pt-5 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* User Message */}
                {msg.question && (
                  <div className="flex items-start sm:gap-3 gap-2 flex-row-reverse">
                    <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500">
                      <LuUser className="sm:w-5 sm:h-5 w-3 h-3 text-white" />
                    </div>
                    <div className="sm:py-1 sm:px-3 px-2 py-0.5 rounded-xl bg-blue-500 text-white ml-12">
                      {msg.question}
                    </div>
                  </div>
                )}

                {msg.answer && (
                  <div className="flex items-start sm:gap-3 gap-2">
                    <div className="sm:w-8 sm:h-8 mt-2 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-300">
                      <LuBot className="sm:w-5 sm:h-5 h-3 w-3 text-gray-600" />
                    </div>
                    <div className="py-3 px-4 rounded-2xl mt-4 bg-white text-gray-900 sm:mr-12 mr-0 shadow-md border border-gray-200">
                      <ReactMarkdown
                        className="prose prose-sm sm:prose-lg text-gray-900 leading-relaxed break-words"
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        components={{
                          strong: ({ children }) => (
                            <strong className="font-semibold">{children}</strong>
                          ),
                          em: ({ children }) => <em className="italic">{children}</em>,
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              className="text-blue-600 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {children}
                            </a>
                          ),
                          ul: ({ children }) => <ul className="list-disc ml-5">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-5">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          pre: ({ children }) => (
                            <pre className="bg-gray-800 text-white p-3 rounded-lg overflow-x-auto">
                              {children}
                            </pre>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-200 text-red-600 px-1 py-0.5 rounded">
                              {children}
                            </code>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-4xl font-bold ">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-3xl font-bold">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-2xl font-bold">{children}</h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-xl font-bold">{children}</h4>
                          ),
                          h5: ({ children }) => (
                            <h5 className="text-medium font-bold">{children}</h5>
                          ),
                        }}
                      >
                        {msg.answer}
                      </ReactMarkdown>


                      {/* <Markdown className="">{msg.answer}</Markdown> */}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Global Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-200">
                  <LuBot className="w-5 h-5 text-gray-600" />
                </div>
                <div className="py-1 px-3 rounded-xl bg-gray-100 text-gray-800 mr-12">
                  <div className="flex space-x-2 h-6 items-center">
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="container mx-auto flex items-center gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-purple-600/20"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            // disabled={isLoading}
            />
            <button
              disabled={!input.trim() || isLoading}
              className={` text-white  p-3 rounded-full ${isLoading || !input.trim()
                  ? "hover:cursor-not-allowed bg-blue-500 "
                  : "hover:cursor-pointer hover:bg-blue-600 bg-blue-500"
                }  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/50`}
              onClick={handleSend}
            >
              <IoIosSend className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
