"use client";

import { useState } from "react";
import ClientSidebar from "@/components/clientSideBar";
import AllSessions from "@/components/all_sessions";
import ApprovedSessions from "@/components/approved_sessions";
export default function ClientDashboard() {
  const [activePage, setActivePage] = useState("allSessions");

  const renderPage = () => {
    switch (activePage) {
      case "allSessions":
        return <AllSessions />;
      case "approvedSessions":
        return <ApprovedSessions />;
      default:
        return <AllSessions />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ClientSidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-4">{renderPage()}</main>
    </div>
  );
}
