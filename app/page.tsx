"use client";

import { useState } from "react";
import AssetApproval from "@/components/asset-approval";
import Sidebar from "@/components/sidebar";
import DigitalAssetManagementPage from "@/components/assets_Management";
import UserManagement from "@/components/user_management";

export default function Home() {
  const [activePage, setActivePage] = useState("assetApproval"); // default page

  const renderPage = () => {
    switch (activePage) {
      case "digitalAssetManagement":
        return <DigitalAssetManagementPage />;
      case "assetApproval":
        return <AssetApproval />;
      case "userManagement":
        return <UserManagement />;
      default:
        return <DigitalAssetManagementPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar setActivePage={setActivePage} activePage={activePage} />
      <main className="flex-1">{renderPage()}</main>
    </div>
  );
}
