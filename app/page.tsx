"use client";

import { useState } from "react";
import AssetApproval from "@/components/asset-approval";
import Sidebar from "@/components/sidebar";
import DigitalAssetManagementPage from "@/components/assets_Management";
import UserManagement from "@/components/user_management";

export default function Home() {
  const [activePage, setActivePage] = useState("assetApproval"); // default page

  // 1. Lift ALL filter states from Sidebar to Home
  const [bulkSkuCodes, setBulkSkuCodes] = useState("");
  const [bulkBarcodeCodes, setBulkBarcodeCodes] = useState("");
  const [bulkFarfetchIdCodes, setBulkFarfetchIdCodes] = useState("");
  const [skuFilter, setSkuFilter] = useState("");
  const [barcodeFilter, setBarcodeFilter] = useState("");
  const [farfetchIdFilter, setFarfetchIdFilter] = useState("");
  const [selectedMerchandisingClasses, setSelectedMerchandisingClasses] =
    useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

  // This state will hold the filters that are actively applied for search
  const [appliedFilters, setAppliedFilters] = useState({});

  // 2. Function to handle search from Sidebar
  const handleSearch = () => {
    // When the search button is clicked in the sidebar,
    // gather all current filter states and update appliedFilters.
    setAppliedFilters({
      bulkSkuCodes,
      bulkBarcodeCodes,
      bulkFarfetchIdCodes,
      skuFilter,
      barcodeFilter,
      farfetchIdFilter,
      selectedMerchandisingClasses,
      selectedSeasons,
      selectedGenders,
      selectedAssetTypes,
      selectedClients,
    });
    console.log("Search button clicked! Applied Filters:", {
      bulkSkuCodes,
      bulkBarcodeCodes,
      bulkFarfetchIdCodes,
      skuFilter,
      barcodeFilter,
      farfetchIdFilter,
      selectedMerchandisingClasses,
      selectedSeasons,
      selectedGenders,
      selectedAssetTypes,
      selectedClients,
    });
    // You might also want to change the active page to a results page if needed
    // setActivePage("digitalAssetManagement");
  };

  // Updated ClearFilter function to reset all individual filter states
  const ClearFilter = () => {
    setBulkSkuCodes("");
    setBulkBarcodeCodes("");
    setBulkFarfetchIdCodes("");
    setSkuFilter("");
    setBarcodeFilter("");
    setFarfetchIdFilter("");
    setSelectedMerchandisingClasses([]);
    setSelectedSeasons([]);
    setSelectedGenders([]);
    setSelectedAssetTypes([]);
    setSelectedClients([]);
    setAppliedFilters({}); // Also clear the applied filters
    console.log("All filters cleared!");
  };

  const renderPage = () => {
    switch (activePage) {
      case "digitalAssetManagement":
        // Pass appliedFilters to the content page
        return <DigitalAssetManagementPage appliedFilters={appliedFilters} />;
      case "assetApproval":
        // Pass appliedFilters to the content page
        return <AssetApproval appliedFilters={appliedFilters} />;
      case "userManagement":
        return <UserManagement />; // UserManagement likely doesn't need filters
      default:
        return <DigitalAssetManagementPage appliedFilters={appliedFilters} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        setActivePage={setActivePage}
        activePage={activePage}
        bulkSkuCodes={bulkSkuCodes}
        setBulkSkuCodes={setBulkSkuCodes}
        bulkBarcodeCodes={bulkBarcodeCodes}
        setBulkBarcodeCodes={setBulkBarcodeCodes}
        bulkFarfetchIdCodes={bulkFarfetchIdCodes}
        setBulkFarfetchIdCodes={setBulkFarfetchIdCodes}
        skuFilter={skuFilter}
        setSkuFilter={setSkuFilter}
        barcodeFilter={barcodeFilter}
        setBarcodeFilter={setBarcodeFilter}
        farfetchIdFilter={farfetchIdFilter}
        setFarfetchIdFilter={setFarfetchIdFilter}
        selectedMerchandisingClasses={selectedMerchandisingClasses}
        setSelectedMerchandisingClasses={setSelectedMerchandisingClasses}
        selectedSeasons={selectedSeasons}
        setSelectedSeasons={setSelectedSeasons}
        selectedGenders={selectedGenders}
        setSelectedGenders={setSelectedGenders}
        selectedAssetTypes={selectedAssetTypes}
        setSelectedAssetTypes={setSelectedAssetTypes}
        selectedClients={selectedClients}
        setSelectedClients={setSelectedClients}
        onSearch={handleSearch} // Pass the search handler
        ClearFilter={ClearFilter}
      />
      <main className="flex-1">{renderPage()}</main>
    </div>
  );
}
