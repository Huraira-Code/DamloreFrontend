// In components/sidebar.jsx
"use client";

import Link from "next/link";
import {
  LayoutGrid,
  CheckSquare,
  Folder,
  Settings,
  Search,
  Save,
  X,
  List,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react"; // Keep useState for dialogs
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UserManagement } from "@/components/user_management"; // Assuming this is correct
import axios from "axios";
import API_BASE_URL from "@/API_BASE_URL";

// Destructure all the props passed from Home
export default function Sidebar({
  setActivePage,
  activePage,
  bulkSkuCodes,
  setBulkSkuCodes,
  bulkBarcodeCodes,
  setBulkBarcodeCodes,
  bulkFarfetchIdCodes,
  setBulkFarfetchIdCodes,
  skuFilter,
  setSkuFilter,
  barcodeFilter,
  setBarcodeFilter,
  farfetchIdFilter,
  setFarfetchIdFilter,
  selectedMerchandisingClasses,
  setSelectedMerchandisingClasses,
  selectedSeasons,
  setSelectedSeasons,
  selectedGenders,
  setSelectedGenders,
  selectedAssetTypes,
  setSelectedAssetTypes,
  selectedClients,
  setSelectedClients,
  onSearch, // The new prop for the search handler
  ClearFilter,
}) {
  // Dialog states remain local to Sidebar
  const [bulkSkuDialogOpen, setBulkSkuDialogOpen] = useState(false);
  const [bulkBarcodeDialogOpen, setBulkBarcodeDialogOpen] = useState(false);
  const [bulkFarfetchIdDialogOpen, setBulkFarfetchIdDialogOpen] =
    useState(false);

  const [users, setUsers] = useState([]);

  // Sample filter options (these can remain in Sidebar or be lifted if shared)
  const assetTypes = ["On Model", "Ghost", "Still Life", "Video"];
  const merchandisingClasses = [
    "SOCKS",
    "SET UNDERWEAR",
    "SCARF",
    "SMALL LEATHER GOODS",
    "SUNGLASSES",
    "TIES",
    "TOWEL",
    "RTW (READY-TO-WEAR)",
    "ACCESSORIES",
    "GLOVES",
    "JEWELRY",
    "KEY CHAINS",
    "PAPILLONS",
    "RINGS",
    "BAGS",
    "BELTS",
    "SHOES",
  ];
  const genders = ["Men", "Women", "Unisex"];
  const seasons = ["SS24", "FW24", "SS25"];

  // Toggle functions now use the setter functions passed as props
  const toggleMerchandisingClass = (value) => {
    setSelectedMerchandisingClasses((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const toggleSeason = (value) => {
    setSelectedSeasons((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const toggleGender = (value) => {
    setSelectedGenders((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const toggleAssetType = (value) => {
    setSelectedAssetTypes((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const toggleClient = (value) => {
    setSelectedClients((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleLogout = () => {
    // Remove the token from local storage
    localStorage.removeItem("token");

    // Optional: redirect to login or home page
    window.location.href = "/login"; // or use your router
  };

  // Function to clear all filters
  const baseClasses = "flex items-center gap-3 px-3 py-2 text-sm rounded-md";
  const activeClasses = "bg-blue-50 text-blue-600";
  const inactiveClasses = "hover:bg-slate-100 text-slate-500";
  const BEARER_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODQxMzNiZjA3MGVjMjY0NThlOTIxZjYiLCJlbWFpbCI6Imh1cmFpcmFzaGFoaWQwMDBAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ5MTAzNTk5LCJleHAiOjE3NTE2OTU1OTl9.ZvZr2jE2pEpxMnn4bYKdkqY1GoDmhts2zCecekHbbSA";

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      });
      setUsers(response.data.users);
    } catch (err) {
      console.log(err);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div
      className="w-72 border-r bg-white h-screen sticky top-0 flex flex-col"
      style={{ overflowY: "scroll" }}
    >
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">P</span>
        </div>
        <span className="font-semibold text-lg">Photo DAM</span>
        <span className="text-xs text-muted-foreground ml-auto">v2.3.5</span>
      </div>

      <nav className="flex-1 ">
        {/* <Link
          href="#"
          onClick={() => setActivePage("dashboard")}
          className={`${baseClasses} ${
            activePage === "dashboard" ? activeClasses : inactiveClasses
          }`}
        >
          <LayoutGrid className="h-5 w-5" />
          <span>Dashboard</span>
        </Link> */}

        <Link
          href="#"
          onClick={() => setActivePage("assetApproval")}
          className={`${baseClasses} ${
            activePage === "assetApproval" ? activeClasses : inactiveClasses
          }`}
        >
          <CheckSquare className="h-5 w-5" />
          <span>Asset Approval</span>
        </Link>

        <Link
          href="#"
          onClick={() => setActivePage("digitalAssetManagement")}
          className={`${baseClasses} ${
            activePage === "digitalAssetManagement"
              ? activeClasses
              : inactiveClasses
          }`}
        >
          <Folder className="h-5 w-5" />
          <span>Digital Asset Management</span>
        </Link>
        <Link
          href="#"
          onClick={() => setActivePage("userManagement")}
          className={`${baseClasses} ${
            activePage === "userManagement" ? activeClasses : inactiveClasses
          }`}
        >
          <Folder className="h-5 w-5" />
          <span>User Management</span>
        </Link>

        <Link
          href="#"
          onClick={() => handleLogout()}
          className={`${baseClasses} ${
            activePage === "settings" ? activeClasses : inactiveClasses
          }`}
        >
          <Settings className="h-5 w-5" />
          <span>Logout</span>
        </Link>
      </nav>

      <Separator className="my-4" />

      <div className="px-4 space-y-4">
        <div className="text-sm font-medium">Filters</div>

        <Accordion
          type="multiple"
          defaultValue={[
            "client",
            "asset-type",
            "sku",
            "season",
            "merchandising",
            "gender",
          ]}
        >
          <AccordionItem value="client">
            <AccordionTrigger className="text-sm py-2">Client</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Select Client
                      <span className="ml-2">
                        {selectedClients.length > 0
                          ? `(${selectedClients.length})`
                          : ""}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {users.map((client) => (
                      <DropdownMenuCheckboxItem
                        key={client.name}
                        checked={selectedClients.includes(client)}
                        onCheckedChange={() => toggleClient(client)}
                      >
                        {client?.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="asset-type">
            <AccordionTrigger className="text-sm py-2">
              Asset Type
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedAssetTypes.map((type) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className="flex items-center gap-1 bg-white"
                      onClick={() => toggleAssetType(type)}
                    >
                      <X className="h-3 w-3" />
                      {type}
                    </Badge>
                  ))}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Select Asset Type
                      <span className="ml-2">
                        {selectedAssetTypes.length > 0
                          ? `(${selectedAssetTypes.length})`
                          : ""}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {assetTypes.map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type}
                        checked={selectedAssetTypes.includes(type)}
                        onCheckedChange={() => toggleAssetType(type)}
                      >
                        {type}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sku">
            <AccordionTrigger className="text-sm py-2">SKU</AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Filter by SKU..."
                  className="text-sm"
                  value={skuFilter}
                  onChange={(e) => setSkuFilter(e.target.value)}
                />
                <Dialog
                  open={bulkSkuDialogOpen}
                  onOpenChange={setBulkSkuDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <List className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import SKU List</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Textarea
                        placeholder="Enter one SKU per line..."
                        value={bulkSkuCodes}
                        onChange={(e) => setBulkSkuCodes(e.target.value)}
                        className="min-h-[200px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setBulkSkuDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => setBulkSkuDialogOpen(false)}>
                        Import
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="barcode">
            <AccordionTrigger className="text-sm py-2">
              Barcode
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Filter by barcode..."
                  className="text-sm"
                  value={barcodeFilter}
                  onChange={(e) => setBarcodeFilter(e.target.value)}
                />
                <Dialog
                  open={bulkBarcodeDialogOpen}
                  onOpenChange={setBulkBarcodeDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <List className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Barcode List</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Textarea
                        placeholder="Enter one barcode per line..."
                        value={bulkBarcodeCodes}
                        onChange={(e) => setBulkBarcodeCodes(e.target.value)}
                        className="min-h-[200px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setBulkBarcodeDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => setBulkBarcodeDialogOpen(false)}>
                        Import
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="season">
            <AccordionTrigger className="text-sm py-2">Season</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedSeasons.map((season) => (
                    <Badge
                      key={season}
                      variant="outline"
                      className="flex items-center gap-1 bg-white"
                      onClick={() => toggleSeason(season)}
                    >
                      <X className="h-3 w-3" />
                      {season}
                    </Badge>
                  ))}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Select Season
                      <span className="ml-2">
                        {selectedSeasons.length > 0
                          ? `(${selectedSeasons.length})`
                          : ""}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {seasons.map((season) => (
                      <DropdownMenuCheckboxItem
                        key={season}
                        checked={selectedSeasons.includes(season)}
                        onCheckedChange={() => toggleSeason(season)}
                      >
                        {season}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="merchandising">
            <AccordionTrigger className="text-sm py-2">
              Merchandising Class
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedMerchandisingClasses.map((cls) => (
                    <Badge
                      key={cls}
                      variant="outline"
                      className="flex items-center gap-1 bg-white"
                      onClick={() => toggleMerchandisingClass(cls)}
                    >
                      <X className="h-3 w-3" />
                      {cls}
                    </Badge>
                  ))}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Select Merchandising Class
                      <span className="ml-2">
                        {selectedMerchandisingClasses.length > 0
                          ? `(${selectedMerchandisingClasses.length})`
                          : ""}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 max-h-[300px] overflow-auto">
                    {merchandisingClasses.map((cls) => (
                      <DropdownMenuCheckboxItem
                        key={cls}
                        checked={selectedMerchandisingClasses.includes(cls)}
                        onCheckedChange={() => toggleMerchandisingClass(cls)}
                      >
                        {cls}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="gender">
            <AccordionTrigger className="text-sm py-2">Gender</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedGenders.map((gender) => (
                    <Badge
                      key={gender}
                      variant="outline"
                      className="flex items-center gap-1 bg-white"
                      onClick={() => toggleGender(gender)}
                    >
                      <X className="h-3 w-3" />
                      {gender}
                    </Badge>
                  ))}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Select Gender
                      <span className="ml-2">
                        {selectedGenders.length > 0
                          ? `(${selectedGenders.length})`
                          : ""}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    {genders.map((gender) => (
                      <DropdownMenuCheckboxItem
                        key={gender}
                        checked={selectedGenders.includes(gender)}
                        onCheckedChange={() => toggleGender(gender)}
                      >
                        {gender}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="farfetch">
            <AccordionTrigger className="text-sm py-2">
              Farfetch ID
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Filter by Farfetch ID..."
                  className="text-sm"
                  value={farfetchIdFilter}
                  onChange={(e) => setFarfetchIdFilter(e.target.value)}
                />
                <Dialog
                  open={bulkFarfetchIdDialogOpen}
                  onOpenChange={setBulkFarfetchIdDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <List className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Farfetch ID List</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Textarea
                        placeholder="Enter one Farfetch ID per line..."
                        value={bulkFarfetchIdCodes}
                        onChange={(e) => setBulkFarfetchIdCodes(e.target.value)}
                        className="min-h-[200px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setBulkFarfetchIdDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => setBulkFarfetchIdDialogOpen(false)}
                      >
                        Import
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={ClearFilter}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
          <Button size="sm" className="w-full" onClick={onSearch}>
            {" "}
            {/* Call onSearch prop */}
            <Search className="h-3.5 w-3.5 mr-1" />
            Search
          </Button>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="w-full">
            <Save className="h-3.5 w-3.5 mr-1" />
            Save Search
          </Button>
        </div>
      </div>
    </div>
  );
}
