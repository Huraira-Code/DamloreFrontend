"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X, Download, Grid, List, Info, Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ProductRow from "@/components/product-row"
import StatusBar from "@/components/status-bar"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

// Sample product data
const sampleProducts = [
  {
    id: "S74AM1580S30341470",
    code: "S74AM1580S30341470",
    farfetchId: "FF12345",
    barcode: "8057189123456",
    categories: ["DENIM", "JACKETS"],
    season: "SS24",
    merchandisingClass: "RTW (READY-TO-WEAR)",
    gender: "Men",
    assetType: ["On Model", "Ghost"],
    status: "Raw",
    images: [
      {
        id: "S74AM1580S30341470T",
        status: "",
        url: "/images/S74AM1580S30341470T.jpg",
        type: "On Model",
      },
      {
        id: "S74AM1580S30341470M",
        status: "",
        url: "/images/S74AM1580S30341470M.jpg",
        type: "On Model",
      },
      {
        id: "S74AM1580S30341470B",
        status: "",
        url: "/images/S74AM1580S30341470B.jpg",
        type: "On Model",
      },
      {
        id: "S74AM1580S30341470S",
        status: "",
        url: "/images/S74AM1580S30341470S.jpg",
        type: "On Model",
      },
      {
        id: "S74AM1580S30341470G1",
        status: "",
        url: "/images/S74AM1580S30341470G1.jpg",
        type: "Ghost",
      },
      {
        id: "S74AM1580S30341470G2",
        status: "",
        url: "/images/S74AM1580S30341470G2.jpg",
        type: "Ghost",
      },
    ],
  },
  {
    id: "80119MCGV01",
    code: "80119MCGV01",
    farfetchId: "FF54321",
    barcode: "8057189654321",
    categories: ["SHOES", "ACCESSORIES"],
    season: "SS24",
    merchandisingClass: "JEWELRY",
    gender: "Women",
    assetType: ["On Model", "Still Life"],
    status: "In Progress",
    images: [
      { id: "img6", status: "", url: "/placeholder.svg?height=200&width=200", type: "On Model" },
      { id: "img7", status: "", url: "/placeholder.svg?height=200&width=200", type: "Still Life" },
      { id: "img8", status: "", url: "/placeholder.svg?height=200&width=200", type: "On Model" },
      { id: "img8a", status: "", url: "/placeholder.svg?height=200&width=200", type: "Still Life" },
      { id: "img8b", status: "", url: "/placeholder.svg?height=200&width=200", type: "On Model" },
    ],
  },
  {
    id: "80133MNGV01",
    code: "80133MNGV01",
    farfetchId: "FF67890",
    barcode: "8057189678901",
    categories: ["DRESSES", "TOPS"],
    season: "FW24",
    merchandisingClass: "RTW (READY-TO-WEAR)",
    gender: "Women",
    assetType: ["On Model", "Ghost"],
    status: "Approved",
    images: [
      { id: "img9", status: "", url: "/placeholder.svg?height=200&width=200", type: "On Model" },
      { id: "img10", status: "", url: "/placeholder.svg?height=200&width=200", type: "Ghost" },
      { id: "img10a", status: "", url: "/placeholder.svg?height=200&width=200", type: "On Model" },
      { id: "img10b", status: "", url: "/placeholder.svg?height=200&width=200", type: "Ghost" },
      { id: "img10c", status: "", url: "/placeholder.svg?height=200&width=200", type: "On Model" },
      { id: "img10d", status: "", url: "/placeholder.svg?height=200&width=200", type: "Ghost" },
    ],
  },
  {
    id: "80173MGV02",
    code: "80173MGV02",
    farfetchId: "FF13579",
    barcode: "8057189135790",
    categories: ["PANTS", "JEANS"],
    season: "SS25",
    merchandisingClass: "BAGS",
    gender: "Unisex",
    assetType: ["Ghost", "Still Life"],
    status: "Delivered",
    images: [
      { id: "img11", status: "", url: "/placeholder.svg?height=200&width=200", type: "Ghost" },
      { id: "img12", status: "", url: "/placeholder.svg?height=200&width=200", type: "Still Life" },
      { id: "img13", status: "", url: "/placeholder.svg?height=200&width=200", type: "Ghost" },
      { id: "img13a", status: "", url: "/placeholder.svg?height=200&width=200", type: "Still Life" },
      { id: "img13b", status: "", url: "/placeholder.svg?height=200&width=200", type: "Ghost" },
      { id: "img13c", status: "", url: "/placeholder.svg?height=200&width=200", type: "Still Life" },
    ],
  },
]

// Get unique values for filters
const getUniqueValues = (products, key) => {
  if (key === "categories" || key === "assetType") {
    const allValues = products.flatMap((product) => product[key])
    return [...new Set(allValues)]
  }
  return [...new Set(products.map((product) => product[key]))]
}

// Status counts
const getStatusCounts = (products) => {
  const counts = {
    total: products.length,
    Raw: 0,
    "In Progress": 0,
    Approved: 0,
    Delivered: 0,
  }

  products.forEach((product) => {
    const status = product.status
    counts[status] = (counts[status] || 0) + 1
  })

  return counts
}

// Asset types
const assetTypes = ["On Model", "Ghost", "Still Life", "Video"]

// Merchandising classes
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
]

export default function AssetApproval() {
  const [products, setProducts] = useState(sampleProducts)
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts)
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: boolean }>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [bulkCodesDialogOpen, setBulkCodesDialogOpen] = useState(false)
  const [bulkCodes, setBulkCodes] = useState("")
  const [currentTab, setCurrentTab] = useState("All")
  const [viewImageDialog, setViewImageDialog] = useState({ open: false, url: "", product: null, imageType: "" })
  const [statusCounts, setStatusCounts] = useState(getStatusCounts(products))
  const [exportFormatDialog, setExportFormatDialog] = useState(false)

  const [exportDestination, setExportDestination] = useState("")
  const [exportPlatform, setExportPlatform] = useState("")
  const [exportFormat, setExportFormat] = useState("zip")
  const [exportSize, setExportSize] = useState("platform")
  const [customWidth, setCustomWidth] = useState("1200")
  const [customHeight, setCustomHeight] = useState("1200")
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  // Filter states
  const [activeFilters, setActiveFilters] = useState<{
    season: string[]
    merchandisingClass: string[]
    gender: string[]
    assetType: string[]
  }>({
    season: [],
    merchandisingClass: [],
    gender: [],
    assetType: [],
  })

  // Get unique values for filters
  const uniqueSeasons = getUniqueValues(products, "season")
  const uniqueGenders = getUniqueValues(products, "gender")

  // Handle search and filtering
  useEffect(() => {
    let result = [...products]

    // Apply status filter (tabs)
    if (currentTab !== "All") {
      result = result.filter((product) => {
        return product.status === currentTab
      })
    }

    // Apply search
    if (searchTerm) {
      // Check if it's a multi-code search (separated by |)
      if (searchTerm.includes("|")) {
        const codes = searchTerm.split("|").map((code) => code.trim().toLowerCase())
        result = result.filter((product) =>
          codes.some(
            (code) =>
              product.code.toLowerCase().includes(code) ||
              product.farfetchId.toLowerCase().includes(code) ||
              product.barcode.toLowerCase().includes(code),
          ),
        )
      } else {
        // Regular search
        result = result.filter(
          (product) =>
            product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.farfetchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.barcode.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }
    }

    // Apply season filters
    if (activeFilters.season.length > 0) {
      result = result.filter((product) => activeFilters.season.includes(product.season))
    }

    // Apply merchandising class filters
    if (activeFilters.merchandisingClass.length > 0) {
      result = result.filter((product) => activeFilters.merchandisingClass.includes(product.merchandisingClass))
    }

    // Apply gender filters
    if (activeFilters.gender.length > 0) {
      result = result.filter((product) => activeFilters.gender.includes(product.gender))
    }

    // Apply asset type filters
    if (activeFilters.assetType.length > 0) {
      result = result.filter((product) => product.assetType.some((type) => activeFilters.assetType.includes(type)))
    }

    // Sort by code
    result = [...result].sort((a, b) => a.code.localeCompare(b.code))

    setFilteredProducts(result)
  }, [searchTerm, activeFilters, products, currentTab])

  // Handle bulk code import
  const handleBulkCodeImport = () => {
    if (!bulkCodes.trim()) return

    const codeList = bulkCodes
      .split("\n")
      .map((code) => code.trim())
      .filter((code) => code.length > 0)

    if (codeList.length > 0) {
      setSearchTerm(codeList.join("|"))
    }

    setBulkCodesDialogOpen(false)
  }

  // Toggle image selection
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => ({
      ...prev,
      [imageId]: !prev[imageId],
    }))
  }

  // Select all images for a product
  const selectAllImages = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    const allSelected = product.images.every((img) => selectedImages[img.id])

    const newSelectedImages = { ...selectedImages }

    product.images.forEach((img) => {
      newSelectedImages[img.id] = !allSelected
    })

    setSelectedImages(newSelectedImages)
  }

  // View image
  const viewImage = (url: string, product: any, imageType: string) => {
    setViewImageDialog({ open: true, url, product, imageType })
  }

  // Toggle filter
  const toggleFilter = (filterType: "season" | "merchandisingClass" | "gender" | "assetType", value: string) => {
    setActiveFilters((prev) => {
      const currentFilters = [...prev[filterType]]
      const index = currentFilters.indexOf(value)

      if (index === -1) {
        currentFilters.push(value)
      } else {
        currentFilters.splice(index, 1)
      }

      return {
        ...prev,
        [filterType]: currentFilters,
      }
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({
      season: [],
      merchandisingClass: [],
      gender: [],
      assetType: [],
    })
    setSearchTerm("")
    setCurrentTab("All")
  }

  // Count active filters
  const activeFilterCount =
    activeFilters.season.length +
    activeFilters.merchandisingClass.length +
    activeFilters.gender.length +
    activeFilters.assetType.length +
    (searchTerm ? 1 : 0) +
    (currentTab !== "All" ? 1 : 0)

  // Count selected images
  const selectedCount = Object.values(selectedImages).filter(Boolean).length

  // Handle export
  const handleExport = () => {
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      setExportFormatDialog(false)

      // Reset export options for next time
      setExportDestination("")
      setExportPlatform("")

      // Show success message
      alert(
        `Export completed successfully!\n\nDestination: ${exportDestination}\nPlatform: ${exportPlatform}\nFormat: ${exportFormat}\nSize: ${exportSize}${exportSize === "custom" ? ` (${customWidth}x${customHeight})` : ""}`,
      )
    }, 2000)
  }

  return (
    <div className="flex flex-col">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Asset Approval</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} products | {selectedCount} selected
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Asset approval system</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      <StatusBar statusCounts={statusCounts} />

      <div className="container py-4">
        {/* Search and action bar */}
        <div className="bg-white p-4 rounded-md border mb-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product code, Farfetch ID, barcode..."
                className="pl-8 pr-20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="absolute right-0 top-0 h-9 flex">
                <Dialog open={bulkCodesDialogOpen} onOpenChange={setBulkCodesDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <List className="h-4 w-4" />
                      <span className="sr-only">Bulk import</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Code List</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Textarea
                        placeholder="Enter one code per line..."
                        value={bulkCodes}
                        onChange={(e) => setBulkCodes(e.target.value)}
                        className="min-h-[200px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setBulkCodesDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBulkCodeImport}>Import</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {searchTerm && (
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchTerm("")}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <div className="font-medium text-sm mb-1">Asset Type</div>
                  {assetTypes.map((assetType) => (
                    <DropdownMenuCheckboxItem
                      key={assetType}
                      checked={activeFilters.assetType.includes(assetType)}
                      onCheckedChange={() => toggleFilter("assetType", assetType)}
                    >
                      {assetType}
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />

                  <div className="font-medium text-sm mb-1 mt-2">Merchandising Class</div>
                  <div className="max-h-40 overflow-y-auto">
                    {merchandisingClasses.map((merchandisingClass) => (
                      <DropdownMenuCheckboxItem
                        key={merchandisingClass}
                        checked={activeFilters.merchandisingClass.includes(merchandisingClass)}
                        onCheckedChange={() => toggleFilter("merchandisingClass", merchandisingClass)}
                      >
                        {merchandisingClass}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>

                  <DropdownMenuSeparator />

                  <div className="font-medium text-sm mb-1 mt-2">Season</div>
                  {uniqueSeasons.map((season) => (
                    <DropdownMenuCheckboxItem
                      key={season}
                      checked={activeFilters.season.includes(season)}
                      onCheckedChange={() => toggleFilter("season", season)}
                    >
                      {season}
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />

                  <div className="font-medium text-sm mb-1 mt-2">Gender</div>
                  {uniqueGenders.map((gender) => (
                    <DropdownMenuCheckboxItem
                      key={gender}
                      checked={activeFilters.gender.includes(gender)}
                      onCheckedChange={() => toggleFilter("gender", gender)}
                    >
                      {gender}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={clearAllFilters} className="whitespace-nowrap">
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>

            <Dialog open={exportFormatDialog} onOpenChange={setExportFormatDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Export Options</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <div className="font-medium">Export Destination</div>
                    <div className="grid grid-cols-2 gap-2">
                      {["E-commerce", "Marketplace"].map((option) => (
                        <Button
                          key={option}
                          variant={exportDestination === option ? "default" : "outline"}
                          onClick={() => setExportDestination(option)}
                          className="justify-start"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>

                    {exportDestination && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {["Farfetch", "Mytheresa", "Luisaviaroma", "YNAP"].map((platform) => (
                          <Button
                            key={platform}
                            variant={exportPlatform === platform ? "default" : "outline"}
                            onClick={() => setExportPlatform(platform)}
                            className="justify-start"
                          >
                            {platform}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="font-medium">File Format</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={exportFormat === "jpg" ? "default" : "outline"}
                        onClick={() => setExportFormat("jpg")}
                        className="justify-start"
                      >
                        JPG
                      </Button>
                      <Button
                        variant={exportFormat === "zip" ? "default" : "outline"}
                        onClick={() => setExportFormat("zip")}
                        className="justify-start"
                      >
                        ZIP (JPG)
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="font-medium">Image Size</div>
                    <div className="grid grid-cols-1 gap-2">
                      <Select value={exportSize} onValueChange={setExportSize}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select image size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="original">Original Size</SelectItem>
                          <SelectItem value="platform">Platform Specific</SelectItem>
                          <SelectItem value="custom">Custom Size</SelectItem>
                        </SelectContent>
                      </Select>

                      {exportSize === "custom" && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="space-y-1">
                            <label htmlFor="width" className="text-sm">
                              Width (px)
                            </label>
                            <Input
                              id="width"
                              type="number"
                              placeholder="Width"
                              value={customWidth}
                              onChange={(e) => setCustomWidth(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <label htmlFor="height" className="text-sm">
                              Height (px)
                            </label>
                            <Input
                              id="height"
                              type="number"
                              placeholder="Height"
                              value={customHeight}
                              onChange={(e) => setCustomHeight(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-metadata"
                      checked={includeMetadata}
                      onCheckedChange={(checked) => setIncludeMetadata(checked === true)}
                    />
                    <label htmlFor="include-metadata" className="text-sm font-medium leading-none">
                      Include metadata
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setExportFormatDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleExport}
                    disabled={!exportDestination || !exportFormat || !exportSize || isExporting}
                  >
                    {isExporting ? (
                      <>
                        <span className="mr-2">Exporting...</span>
                        <span className="loading loading-spinner loading-xs"></span>
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <Grid className="mr-2 h-4 w-4" />
              Export Grid
            </Button>
          </div>

          {/* Active filters display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {activeFilters.merchandisingClass.map((merchandisingClass) => (
                <Badge
                  key={`class-${merchandisingClass}`}
                  variant="outline"
                  className="flex items-center gap-1 bg-white"
                >
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter("merchandisingClass", merchandisingClass)}
                  />
                  {merchandisingClass}
                </Badge>
              ))}
              {activeFilters.season.map((season) => (
                <Badge key={`season-${season}`} variant="outline" className="flex items-center gap-1 bg-white">
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter("season", season)} />
                  {season}
                </Badge>
              ))}
              {activeFilters.gender.map((gender) => (
                <Badge key={`gender-${gender}`} variant="outline" className="flex items-center gap-1 bg-white">
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter("gender", gender)} />
                  {gender}
                </Badge>
              ))}
              {activeFilters.assetType.map((assetType) => (
                <Badge key={`type-${assetType}`} variant="outline" className="flex items-center gap-1 bg-white">
                  <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter("assetType", assetType)} />
                  {assetType}
                </Badge>
              ))}
              {searchTerm && (
                <Badge variant="outline" className="flex items-center gap-1 bg-white">
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                  {searchTerm.length > 20 ? searchTerm.substring(0, 20) + "..." : searchTerm}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Status tabs */}
        <div className="bg-white rounded-md border mb-4 shadow-sm overflow-hidden">
          <Tabs defaultValue="All" value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="w-full flex rounded-none bg-muted/30 p-0 h-auto">
              <TabsTrigger value="All" className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4">
                All
              </TabsTrigger>
              <TabsTrigger value="Raw" className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4">
                Raw
              </TabsTrigger>
              <TabsTrigger
                value="In Progress"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger value="Approved" className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4">
                Approved
              </TabsTrigger>
              <TabsTrigger
                value="Delivered"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
                Delivered
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Products list */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                selectedImages={selectedImages}
                onToggleSelect={toggleImageSelection}
                onSelectAll={() => selectAllImages(product.id)}
                onViewImage={(url, type) => viewImage(url, product, type)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-md border shadow-sm">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-lg font-medium mb-2">No products found</div>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
            {activeFilterCount > 0 && (
              <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Image view dialog */}
      <Dialog open={viewImageDialog.open} onOpenChange={(open) => setViewImageDialog({ ...viewImageDialog, open })}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {viewImageDialog.product && (
                <div className="flex items-center justify-between">
                  <span>{viewImageDialog.product?.code}</span>
                  <Badge>{viewImageDialog.imageType}</Badge>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <div className="relative w-full aspect-square">
              {viewImageDialog.url && (
                <img
                  src={viewImageDialog.url || "/placeholder.svg"}
                  alt="Image preview"
                  className="object-contain w-full h-full"
                />
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline">
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button>
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
