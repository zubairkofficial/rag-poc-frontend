import Sidebar from '../Componnts/Sidebar'
import Header from '../Componnts/Header'
import { Outlet } from 'react-router-dom';
import { useState } from 'react';

const Layout = () => {
    const [isOpen, setIsOpen] = useState(false)
  const toogleSidebar = () => setIsOpen(!isOpen)

  return (
    <div className="flex space-x-3 h-screen bg-gray-200">
    <Sidebar toggleSidebar={toogleSidebar} isOpen={isOpen} />
    <div className="flex flex-col flex-1 overflow-hidden">
      <Header toogleSidebar={toogleSidebar} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 sm:p-6 sm:pt-0 sm:pb-0 sm:px-0   px-2">
        <Outlet/>
      </main>
    </div>
  </div>
  )
}

export default Layout
