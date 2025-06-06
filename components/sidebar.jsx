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
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserManagement } from "@/components/user_management";
export default function Sidebar({ setActivePage, activePage }) {
  const [bulkSkuDialogOpen, setBulkSkuDialogOpen] = useState(false);
  const [bulkBarcodeDialogOpen, setBulkBarcodeDialogOpen] = useState(false);
  const [bulkFarfetchIdDialogOpen, setBulkFarfetchIdDialogOpen] =
    useState(false);
  const [bulkSkuCodes, setBulkSkuCodes] = useState("");
  const [bulkBarcodeCodes, setBulkBarcodeCodes] = useState("");
  const [bulkFarfetchIdCodes, setBulkFarfetchIdCodes] = useState("");
  const [selectedMerchandisingClasses, setSelectedMerchandisingClasses] =
    useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);

  // Sample filter options
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
  const clients = [
    "Farfetch",
    "Mytheresa",
    "Luisaviaroma",
    "YNAP",
    "Zalando",
    "Moda Operandi",
    "Net-a-Porter",
    "Matches Fashion",
  ];

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

  const baseClasses = "flex items-center gap-3 px-3 py-2 text-sm rounded-md";
  // Classes for the active link
  const activeClasses = "bg-blue-50 text-blue-600";
  // Classes for inactive links
  const inactiveClasses = "hover:bg-slate-100 text-slate-500";

  return (
    <div className="w-72 border-r bg-white h-screen sticky top-0 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">P</span>
        </div>
        <span className="font-semibold text-lg">Photo DAM</span>
        <span className="text-xs text-muted-foreground ml-auto">v2.3.5</span>
      </div>

      <nav className="flex-1 ">
        <Link
          href="#"
          onClick={() => setActivePage("dashboard")}
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
            activePage === "dashboard"
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-slate-100 text-slate-500"
          }`}
        >
          <LayoutGrid className="h-5 w-5" />{" "}
          {/* Icon color handled by parent text color */}
          <span>Dashboard</span>
        </Link>

        <Link
          href="#"
          onClick={() => setActivePage("assetApproval")}
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
            activePage === "assetApproval"
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-slate-100 text-slate-500"
          }`}
        >
          <CheckSquare className="h-5 w-5" />{" "}
          {/* Icon color handled by parent text color */}
          <span>Asset Approval</span>
        </Link>

        <Link
          href="#"
          onClick={() => setActivePage("digitalAssetManagement")}
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
            activePage === "digitalAssetManagement"
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-slate-100 text-slate-500"
          }`}
        >
          <Folder className="h-5 w-5" />{" "}
          {/* Icon color handled by parent text color */}
          <span>Digital Asset Management</span>
        </Link>
        <Link
          href="#"
          onClick={() => setActivePage("userManagement")}
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
            activePage === "userManagement"
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-slate-100 text-slate-500"
          }`}
        >
          {" "}
          <Folder className="h-5 w-5" />{" "}
          {/* Icon color handled by parent text color */}
          <span>User Management</span>
        </Link>

        <Link
          href="#"
          onClick={() => setActivePage("settings")}
          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md ${
            activePage === "settings"
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-slate-100 text-slate-500"
          }`}
        >
          <Settings className="h-5 w-5" />{" "}
          {/* Icon color handled by parent text color */}
          <span>Settings</span>
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
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedClients.map((client) => (
                    <Badge
                      key={client}
                      variant="outline"
                      className="flex items-center gap-1 bg-white"
                      onClick={() => toggleClient(client)}
                    >
                      <X className="h-3 w-3" />
                      {client}
                    </Badge>
                  ))}
                </div>
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
                    {clients.map((client) => (
                      <DropdownMenuCheckboxItem
                        key={client}
                        checked={selectedClients.includes(client)}
                        onCheckedChange={() => toggleClient(client)}
                      >
                        {client}
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
                <Input placeholder="Filter by SKU..." className="text-sm" />
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
                <Input placeholder="Filter by barcode..." className="text-sm" />
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
          <Button size="sm" variant="outline" className="w-full">
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
          <Button size="sm" className="w-full">
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
