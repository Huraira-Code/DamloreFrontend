"use client";

import { LayoutGrid, CheckSquare , Settings } from "lucide-react";

export default function ClientSidebar({ activePage, setActivePage }) {
  const baseClasses = "flex items-center gap-3 px-4 py-3 text-sm rounded-md";
  const activeClasses = "bg-blue-100 text-blue-700 font-semibold";
  const inactiveClasses = "hover:bg-slate-100 text-slate-600";
  const handleLogout = () => {
    // Remove the token from local storage
    localStorage.removeItem("token");

    // Optional: redirect to login or home page
    window.location.href = "/login"; // or use your router
  };

  return (
    <div className="w-64 bg-white h-screen border-r flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-bold">U</span>
        </div>
        <span className="text-lg font-semibold">Photo DAM</span>
        <span className="ml-auto text-xs text-gray-400">v1.0</span>
      </div>

      <nav className="flex flex-col mt-4 space-y-1 px-2">
        <button
          onClick={() => setActivePage("allSessions")}
          className={`${baseClasses} ${
            activePage === "allSessions" ? activeClasses : inactiveClasses
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
          All Sessions
        </button>

        <button
          onClick={() => setActivePage("approvedSessions")}
          className={`${baseClasses} ${
            activePage === "approvedSessions" ? activeClasses : inactiveClasses
          }`}
        >
          <CheckSquare className="h-5 w-5" />
          Delivered Sessions
        </button>

        <button
          onClick={() => handleLogout()}
          className={`${baseClasses} ${
            activePage === "settings" ? activeClasses : inactiveClasses
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
