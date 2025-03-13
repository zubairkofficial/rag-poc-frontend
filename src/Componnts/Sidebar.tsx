interface ChatList {
  id: number;
  chat_name?: string;
}

interface SidebarInterface {
  toggleSidebar: () => void;
  isOpen: boolean;
}

interface FetchChatInterface {
  chat: ChatList[];
  success: boolean;
}
interface NewChatInterface {
  id: number;
  success: boolean;
}

interface ChatList {
  id: number;
  chat_name?: string;
}

import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FaComments } from "react-icons/fa";
import { LuFiles } from "react-icons/lu";
import { backendRequest } from "../Helper/BackendReques";
import { RiChatNewLine } from "react-icons/ri";
import { BsThreeDots } from "react-icons/bs";
import { MdOutlineSettingsSuggest } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
import DeleteModal from "../Componnts/DeleteModal";
import EditModal from "./EditModal";
import { notifyResponse } from "../Helper/notify";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";
import { BiBot } from "react-icons/bi";

interface SidebarInterface {
  toggleSidebar: () => void;
  isOpen: boolean;
}

const Sidebar = ({ toggleSidebar, isOpen }: SidebarInterface) => {
  const [active, setActive] = useState("Home");
  const [isChatDropdownOpen, setIsChatDropdownOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeChat, setActiveChat] = useState<null | number>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [chatList, setChatList] = useState<ChatList[]>([]);
  const [name, setName] = useState("");
 const  type = localStorage.getItem("type")

  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleFetchChat = async () => {
    try {
      const response = await backendRequest<FetchChatInterface>("GET", "/chat");
      if (response.success) {
        setChatList(response.chat);
      }
    } catch (error) {
      // Handle error
    }
  };

  const handleNewChat = async () => {
    try {
      const response = await backendRequest<NewChatInterface>(
        "POST",
        "/create-chat"
      );
      if (response.success) {
        navigate(`chat/${response.id}`);
      }
    } catch (error) {
      // Handle error
    }
  };

  useEffect(() => {
    if (pathname === "/") setActive("Home");
    if (location.pathname === "/settings" || location.pathname === "/admin/settings" || location.pathname === "/user/settings") setActive("Settings");
    if (pathname === "/admin/files") setActive("Files");
    if (/^\/(user|admin)\/chat\/\d+$/.test(pathname)) setActive("Chat");
    

    handleFetchChat();
  }, [pathname]);

  const toggleChatDropdown = () => setIsChatDropdownOpen(!isChatDropdownOpen);

  const truncateFileName = (fileName: string) => {
    const maxLength = 15;
    const lastDotIndex = fileName.lastIndexOf(".");

    let baseName = fileName;
    let extension = "";

    if (lastDotIndex !== -1) {
      baseName = fileName.slice(0, lastDotIndex);
      extension = fileName.slice(lastDotIndex);
    }

    const truncatedBaseName =
      baseName.length > maxLength
        ? baseName.slice(0, maxLength) + "..."
        : baseName;

    return truncatedBaseName + extension;
  };

  const handleDeleteChat = async () => {
    try {
      const response = await backendRequest("DELETE", `/chat/${id}`);
      if (response.success) {
        setChatList((prev) => prev.filter((chat) => chat.id !== +id));
        setActiveChat(null);
        // setSelectedChatId(null);
        notifyResponse(response);
        handleNewChat();
        setShowDeleteModal(false);
      } else {
        notifyResponse(response);
      }
    } catch (error) {}
  };
  const handlEditChatName = async () => {
    try {
      const response = await backendRequest("PUT", `/chat/${id}`, {
        name,
      });
      if (response.success) {
        setChatList((prev) =>
          prev.map((chat) =>
            chat.id === +id ? { ...chat, chat_name: name } : chat
          )
        );
        setShowEditModal(false);
        // setSelectedChatId(null);
        setName("");
        notifyResponse(response);
      } else {
        notifyResponse(response);
      }
    } catch (error) {}
  };
  const chatDropdownRef = useRef<HTMLDivElement | null>(null); // Ref for the chat dropdown
  const chatListRef = useRef<HTMLDivElement | null>(null); // Ref for the entire chat list section

  const handleClickOutside = (event: MouseEvent) => {
    console.log("event.target", event.target);
    
    if (
      chatDropdownRef.current &&
      !chatDropdownRef.current.contains(event.target as Node) &&
      chatListRef.current &&
      !chatListRef.current.contains(event.target as Node)
    ) {
      setActiveChat(null); // Close active chat if clicked outside
    }
  };

  document.addEventListener("onclick", handleClickOutside);

  // window.addEventListener('click', (event) => {
  //   // const target = event.target as HTMLElement;
  //   if (activeChat) {
  //     setActiveChat(null);
  //   } else {
  //     // setIsChatDropdownOpen(false);
  //   }
  // });

  return (
    <>
      <aside
        ref={chatListRef}
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-10 w-64 bg-gray-50 text-white transition-transform duration-300 ease-in-out lg:transition-none h-screen`}
      >
        <div className="flex flex-col px-4  h-full">
          <button
            className="lg:hidden  flex justify-end px-2 pt-2 rounded-md bg-gray-50 text-blue-600 hover:cursor-pointer"
            onClick={toggleSidebar}
          >
            <RxCrossCircled size={25} />
          </button>

          {/* <div className="flex  items-center justify-center  bg-gray-50">
      
            <img
              className=" object-cover  w-full sm:mt-0 -mt-5"
              src="/Logo.png"
              alt=""
            />
          </div> */}
          <div className="flex justify-end me-3 mb-2 py-4">
            <p
              onClick={() => {
                toggleSidebar();
                handleNewChat();
              }}
              className={`inline-block items-center px-3 py-3 rounded-2xl hover:cursor-pointer bg-blue-500 text-white ${
                active === "Home" ? "bg-blue-500 text-white" : ""
              }`}
            >
              <RiChatNewLine className="" size={20} />
            </p>
          </div>
          {/* <nav className="mt-3 flex flex-col space-y-2 px-3"> */}
          {
            type === "admin" &&

          <Link
            onClick={toggleSidebar}
            to="/admin/files"
            className={`flex my-2 items-center px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white ${
              active === "Files" ? "bg-blue-500 text-white" : "text-gray-800"
            }`}
          >
            <LuFiles className="mr-3" size={20} />
            <span>Files</span>
          </Link>
          }
          {
            type === "admin" &&

          <Link
            onClick={toggleSidebar}
            to="/admin/widget"
            className={`flex my-2 items-center px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white ${
              active === "Widget" ? "bg-blue-500 text-white" : "text-gray-800"
            }`}
          >
            <BiBot className="mr-3" size={20} />
            <span>Widget</span>
          </Link>
          }
          {

            type == "admin" &&
          <div
            className={`relative ${
              (!isChatDropdownOpen && type=="admin" ) && "flex-1 overflow-y-auto"
            } `}
          >
            <button
              onClick={toggleChatDropdown}
              className={`flex items-center w-full  px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white hover:cursor-pointer ${
                active === "Chat" ? "bg-blue-500 text-white" : "text-gray-800"
              }`}
            >
              <FaComments className="mr-3" size={20} />
              <span>Chat</span>
              {type === "admin" && (isChatDropdownOpen  ? (
                <IoChevronUpOutline size={20} className="ml-auto" />
              ) : (
                <IoChevronDownOutline size={20} className="ml-auto" />
              ))}
            </button>
          </div>
          }
          {(isChatDropdownOpen || type =="user") && (
            <div className="  w-full py-2 rounded-md flex flex-col space-y-1 flex-1 overflow-y-auto custom-scrollbar">
              {chatList.map((chat) => (
                <div key={chat.id} className="relative">
                  <Link
                    to={`/${type}/chat/${chat.id}`}
                    onClick={toggleSidebar}
                    className={`block group ps-3 ms-4 relative py-1 text-gray-600 hover:bg-blue-600 hover:text-white rounded-xl mr-2 ${
                      id && +id === chat.id ? "bg-blue-500 text-white" : ""
                    }`}
                  >
                    {chat.chat_name
                      ? truncateFileName(chat.chat_name)
                      : "New Chat"}
                    <BsThreeDots
                      ref={chatDropdownRef}
                      onClick={() => {
                        activeChat
                          ? setActiveChat(null)
                          : setActiveChat(chat.id);
                      }}
                      className={`absolute group-hover:opacity-100 right-4 top-1/2 transform -translate-y-1/2 ${
                        id && +id === chat.id ? "opacity-100" : "opacity-0"
                      }`}
                      size={15}
                    />
                  </Link>
                  {activeChat === chat.id && (
                    <div className="popover-card absolute right-0 top-10 bg-white shadow-lg rounded-md p-2 z-10 w-32 border">
                      <button
                        className="w-full text-left px-3 py-1 hover:bg-blue-500 hover:text-white text-gray-700  border border-purple-600 rounded-lg hover:cursor-pointer"
                        onClick={() => {
                          setShowEditModal(true);
                          setActiveChat(null);
                          setName(chat.chat_name ? chat.chat_name : "New Chat");
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="w-full text-left px-3 py-1 text-white bg-red-600 rounded-lg mt-2 hover:cursor-pointer"
                        onClick={() => {
                          setShowDeleteModal(true);
                          setActiveChat(null);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <Link
            onClick={toggleSidebar}
            to="settings"
            className={`flex items-center px-6 mt-1  mb-2 py-3 rounded-2xl hover:bg-blue-600  hover:text-white ${
              active === "Settings"
                ? "bg-blue-500 text-white"
                : "text-blue-600 bg-gray-100"
            }`}
          >
            <MdOutlineSettingsSuggest className="mr-3" size={20} />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
      <DeleteModal
        message="Are you sure you want to delete this chat ? This action cannot be undone."
        isOpen={showDeleteModal}
        onConfirm={handleDeleteChat}
        onCancel={() => setShowDeleteModal(false)}
      />
      <EditModal
        name={name}
        onChangeName={setName}
        isOpen={showEditModal}
        onConfirm={handlEditChatName}
        onCancel={() => setShowEditModal(false)}
      />
    </>
  );
};

export default Sidebar;
