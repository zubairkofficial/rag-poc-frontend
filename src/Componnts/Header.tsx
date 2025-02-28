import { useState } from 'react'
import { FaUser, FaChevronDown, FaSignOutAlt, FaBars, FaChevronUp } from 'react-icons/fa'
import {user} from "../Helper/user"
import { useNavigate } from 'react-router-dom'

const Header = ({toogleSidebar}:{toogleSidebar:()=>void}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)
  const navigate = useNavigate()

  const handleLogout = ()=>{
    localStorage.clear()
    navigate("/login")
    
  }

  return (
    <header className="bg-gray-100 shadow-md h-[10vh]">
      <div className="max-w-7xl h-[10vh] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <button
                 className="lg:hidden  top-4 left-4  pt-0 px-2 ed-md  text-blue-500 hover:cursor-pointer"
                 onClick={toogleSidebar}
               >
                 <FaBars size={24} />
               </button>
          <h1 className=" opacity-0 text-2xl font-semibold text-gray-800">
         <span className=' hidden lg:block'>Dashboard</span> </h1>
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center hover:cursor-pointer space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <FaUser size={24} />
              <span className="hidden sm:inline-block">{user.name}</span>
              {isDropdownOpen?
              <FaChevronUp size={16} />:
              <FaChevronDown size={16} />
              }
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2  bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 text-sm text-gray-700">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
                <hr className="my-1" />
                <button onClick={handleLogout}  className="w-full text-left px-4 hover:cursor-pointer py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <FaSignOutAlt size={16} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header