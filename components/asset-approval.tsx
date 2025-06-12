"use client";

import { useState, useEffect, useMemo } from "react"; // Import useMemo
import {
  Search,
  Filter,
  X,
  Download,
  Grid,
  List,
  Info,
  Check,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ProductRow from "@/components/product-row";
import StatusBar from "@/components/status-bar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Import JSZip and file-saver
import JSZip from "jszip";
import { saveAs } from "file-saver";

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
      {
        id: "img6",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "On Model",
      },
      {
        id: "img7",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Still Life",
      },
      {
        id: "img8",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "On Model",
      },
      {
        id: "img8a",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Still Life",
      },
      {
        id: "img8b",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "On Model",
      },
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
      {
        id: "img9",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "On Model",
      },
      {
        id: "img10",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Ghost",
      },
      {
        id: "img10a",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "On Model",
      },
      {
        id: "img10b",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Ghost",
      },
      {
        id: "img10c",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "On Model",
      },
      {
        id: "img10d",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Ghost",
      },
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
      {
        id: "img11",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Ghost",
      },
      {
        id: "img12",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Still Life",
      },
      {
        id: "img13",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Ghost",
      },
      {
        id: "img13a",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Still Life",
      },
      {
        id: "img13b",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Ghost",
      },
      {
        id: "img13c",
        status: "",
        url: "/placeholder.svg?height=200&width=200",
        type: "Still Life",
      },
    ],
  },
];

// Get unique values for filters
const getUniqueValues = (products, key) => {
  if (key === "categories" || key === "assetType") {
    const allValues = products.flatMap((product) => product[key]);
    return [...new Set(allValues)];
  }
  return [...new Set(products.map((product) => product[key]))];
};

// Status counts
const getStatusCounts = (products) => {
  const counts = {
    total: products.length,
    Raw: 0,
    "In Progress": 0,
    Approved: 0,
    Delivered: 0,
  };

  products.forEach((product) => {
    const status = product.status;
    counts[status] = (counts[status] || 0) + 1;
  });

  return counts;
};

// Asset types (these can remain static if they don't change based on data)
const assetTypes = ["On Model", "Ghost", "Still Life", "Video"];

// Merchandising classes (these can remain static if they don't change based on data)
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

// Receive appliedFilters as a prop
export default function AssetApproval({ appliedFilters = {} }) {
  // `products` now holds the original, unfiltered sample data
  const [products, setProducts] = useState(sampleProducts);
  // `filteredProducts` will be the result of applying all filters (local + global)
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
  const [selectedImages, setSelectedImages] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState(""); // Local search term input
  const [bulkCodesDialogOpen, setBulkCodesDialogOpen] = useState(false);
  const [bulkCodes, setBulkCodes] = useState(""); // Local bulk codes input
  const [currentTab, setCurrentTab] = useState("All");
  const [viewImageDialog, setViewImageDialog] = useState({
    open: false,
    url: "",
    product: null,
    imageType: "",
  });
  const [statusCounts, setStatusCounts] = useState(getStatusCounts(products));
  const [exportFormatDialog, setExportFormatDialog] = useState(false);

  const [exportDestination, setExportDestination] = useState("");
  const [exportPlatform, setExportPlatform] = useState("");
  const [exportFormat, setExportFormat] = useState("zip");
  const [exportSize, setExportSize] = useState("platform");
  const [customWidth, setCustomWidth] = useState("1200");
  const [customHeight, setCustomHeight] = useState("1200");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Local filter states (Dropdown filters)
  const [activeFilters, setActiveFilters] = useState<{
    season: string[];
    merchandisingClass: string[];
    gender: string[];
    assetType: string[];
  }>({
    season: [],
    merchandisingClass: [],
    gender: [],
    assetType: [],
  });

  // Get unique values for filters from the *original* products list
  const uniqueSeasons = getUniqueValues(products, "season");
  const uniqueGenders = getUniqueValues(products, "gender");

  // This useEffect updates status counts whenever the `products` state changes
  useEffect(() => {
    setStatusCounts(getStatusCounts(products));
  }, [products]);

  // Main filtering logic using useMemo
  const productsToDisplay = useMemo(() => {
    let result = [...products]; // Start with all original products

    // --- Apply Global Filters from `appliedFilters` prop ---

    // Apply SKU, Barcode, Farfetch ID filter (individual or bulk)
    const globalSkuFilter = appliedFilters.skuFilter?.toLowerCase() || "";
    const globalBarcodeFilter =
      appliedFilters.barcodeFilter?.toLowerCase() || "";
    const globalFarfetchIdFilter =
      appliedFilters.farfetchIdFilter?.toLowerCase() || "";

    const globalBulkSkuCodes =
      appliedFilters.bulkSkuCodes
        ?.split(/\r?\n/)
        .map((s) => s.toLowerCase())
        .filter(Boolean) || [];
    const globalBulkBarcodeCodes =
      appliedFilters.bulkBarcodeCodes
        ?.split(/\r?\n/)
        .map((b) => b.toLowerCase())
        .filter(Boolean) || [];
    const globalBulkFarfetchIdCodes =
      appliedFilters.bulkFarfetchIdCodes
        ?.split(/\r?\n/)
        .map((id) => id.toLowerCase())
        .filter(Boolean) || [];

    if (
      globalSkuFilter ||
      globalBarcodeFilter ||
      globalFarfetchIdFilter ||
      globalBulkSkuCodes.length > 0 ||
      globalBulkBarcodeCodes.length > 0 ||
      globalBulkFarfetchIdCodes.length > 0
    ) {
      result = result.filter((product) => {
        const productCodeLower = product.code.toLowerCase();
        const productBarcodeLower = product.barcode.toLowerCase();
        const productFarfetchIdLower = product.farfetchId?.toLowerCase() || "";

        // Check individual search terms
        if (globalSkuFilter && productCodeLower.includes(globalSkuFilter))
          return true;
        if (
          globalBarcodeFilter &&
          productBarcodeLower.includes(globalBarcodeFilter)
        )
          return true;
        if (
          globalFarfetchIdFilter &&
          productFarfetchIdLower.includes(globalFarfetchIdFilter)
        )
          return true;

        // Check against bulk codes
        if (
          globalBulkSkuCodes.length > 0 &&
          globalBulkSkuCodes.some((code) => productCodeLower.includes(code))
        )
          return true;
        if (
          globalBulkBarcodeCodes.length > 0 &&
          globalBulkBarcodeCodes.some((code) =>
            productBarcodeLower.includes(code)
          )
        )
          return true;
        if (
          globalBulkFarfetchIdCodes.length > 0 &&
          globalBulkFarfetchIdCodes.some((id) =>
            productFarfetchIdLower.includes(id)
          )
        )
          return true;

        return false;
      });
    }

    // Apply global Merchandising Class filters
    if (appliedFilters.selectedMerchandisingClasses?.length > 0) {
      const globalSelectedClasses = new Set(
        appliedFilters.selectedMerchandisingClasses.map((c) => c.toLowerCase())
      );
      result = result.filter((product) =>
        globalSelectedClasses.has(product.merchandisingClass.toLowerCase())
      );
    }

    // Apply global Season filters
    if (appliedFilters.selectedSeasons?.length > 0) {
      const globalSelectedSeasons = new Set(
        appliedFilters.selectedSeasons.map((s) => s.toLowerCase())
      );
      result = result.filter((product) =>
        globalSelectedSeasons.has(product.season.toLowerCase())
      );
    }

    // Apply global Gender filters
    if (appliedFilters.selectedGenders?.length > 0) {
      const globalSelectedGenders = new Set(
        appliedFilters.selectedGenders.map((g) => g.toLowerCase())
      );
      result = result.filter((product) =>
        globalSelectedGenders.has(product.gender.toLowerCase())
      );
    }

    // Apply global Asset Type filters
    if (appliedFilters.selectedAssetTypes?.length > 0) {
      const globalSelectedAssetTypes = new Set(
        appliedFilters.selectedAssetTypes.map((at) => at.toLowerCase())
      );
      result = result.filter((product) =>
        product.assetType.some((type) =>
          globalSelectedAssetTypes.has(type.toLowerCase())
        )
      );
    }

    // Apply global Clients filter (This is a bit tricky with your current sample data structure
    // as products don't seem to have a 'client' or 'assignedUser' property directly.
    // If your `product` objects had a `clientId` or `assignedUserId` property,
    // you would filter based on `appliedFilters.selectedClients.map(client => client._id)`.
    // For now, I'll omit a direct client filter on `sampleProducts` as it's not directly supported.
    // If your actual `products` data has this, you'd add:
    /*
    if (appliedFilters.selectedClients?.length > 0) {
        const globalSelectedClientIds = new Set(appliedFilters.selectedClients.map(client => client._id).filter(Boolean));
        result = result.filter(product => globalSelectedClientIds.has(product.assignedClientId)); // Assuming product has assignedClientId
    }
    */

    // --- Apply Local Filters (from AssetApproval's own UI elements) ---

    // Apply status filter (tabs)
    if (currentTab !== "All") {
      result = result.filter((product) => product.status === currentTab);
    }

    // Apply local search term
    if (searchTerm) {
      // Check if it's a multi-code search (separated by |)
      if (searchTerm.includes("|")) {
        const codes = searchTerm
          .split("|")
          .map((code) => code.trim().toLowerCase());
        result = result.filter((product) =>
          codes.some(
            (code) =>
              product.code.toLowerCase().includes(code) ||
              (product.farfetchId &&
                product.farfetchId.toLowerCase().includes(code)) || // Ensure farfetchId exists
              (product.barcode && product.barcode.toLowerCase().includes(code)) // Ensure barcode exists
          )
        );
      } else {
        // Regular search
        result = result.filter(
          (product) =>
            product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.farfetchId &&
              product.farfetchId
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (product.barcode &&
              product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
    }

    // Apply local dropdown filters
    if (activeFilters.season.length > 0) {
      result = result.filter((product) =>
        activeFilters.season.includes(product.season)
      );
    }

    if (activeFilters.merchandisingClass.length > 0) {
      result = result.filter((product) =>
        activeFilters.merchandisingClass.includes(product.merchandisingClass)
      );
    }

    if (activeFilters.gender.length > 0) {
      result = result.filter((product) =>
        activeFilters.gender.includes(product.gender)
      );
    }

    if (activeFilters.assetType.length > 0) {
      result = result.filter((product) =>
        product.assetType.some((type) => activeFilters.assetType.includes(type))
      );
    }

    // Sort by code (always apply sorting at the end)
    result = [...result].sort((a, b) => a.code.localeCompare(b.code));

    return result;
  }, [products, currentTab, searchTerm, activeFilters, appliedFilters]); // Re-run when these dependencies change

  // Update filteredProducts whenever productsToDisplay changes
  useEffect(() => {
    setFilteredProducts(productsToDisplay);
  }, [productsToDisplay]);

  // Handle bulk code import (still uses local searchTerm)
  const handleBulkCodeImport = () => {
    if (!bulkCodes.trim()) return;

    const codeList = bulkCodes
      .split("\n")
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    if (codeList.length > 0) {
      // Update local search term with bulk codes
      setSearchTerm(codeList.join("|"));
    }

    setBulkCodesDialogOpen(false);
  };

  // Toggle image selection
  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => ({
      ...prev,
      [imageId]: !prev[imageId],
    }));
  };

  // Select all images for a product
  const selectAllImages = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const allSelected = product.images.every((img) => selectedImages[img.id]);

    const newSelectedImages = { ...selectedImages };

    product.images.forEach((img) => {
      newSelectedImages[img.id] = !allSelected;
    });

    setSelectedImages(newSelectedImages);
  };

  // View image
  const viewImage = (url: string, product: any, imageType: string) => {
    setViewImageDialog({ open: true, url, product, imageType });
  };

  // Toggle local dropdown filter
  const toggleFilter = (
    filterType: "season" | "merchandisingClass" | "gender" | "assetType",
    value: string
  ) => {
    setActiveFilters((prev) => {
      const currentFilters = [...prev[filterType]];
      const index = currentFilters.indexOf(value);

      if (index === -1) {
        currentFilters.push(value);
      } else {
        currentFilters.splice(index, 1);
      }

      return {
        ...prev,
        [filterType]: currentFilters,
      };
    });
  };

  // Clear all filters (local only)
  const clearAllFilters = () => {
    setActiveFilters({
      season: [],
      merchandisingClass: [],
      gender: [],
      assetType: [],
    });
    setSearchTerm("");
    setCurrentTab("All");
    // Note: This only clears local filters. Global filters (appliedFilters) come from Home and are not cleared here.
  };

  // Count active filters (local only)
  const activeLocalFilterCount =
    activeFilters.season.length +
    activeFilters.merchandisingClass.length +
    activeFilters.gender.length +
    activeFilters.assetType.length +
    (searchTerm ? 1 : 0) +
    (currentTab !== "All" ? 1 : 0);

  // Count selected images
  const selectedCount = Object.values(selectedImages).filter(Boolean).length;

  // Handle export

  // --- Image Processing and Export Function ---
  const handleExport = async () => {
    setIsExporting(true);

    const imagesToExport = products.flatMap((product) =>
      product.images.filter((image) => selectedImages[image.id])
    );

    if (imagesToExport.length === 0) {
      alert("Please select images to export.");
      setIsExporting(false);
      return;
    }

    const exportFileName = `exported_assets_${new Date()
      .toISOString()
      .slice(0, 10)}`; // e.g., exported_assets_2025-06-12

    try {
      if (exportFormat === "zip") {
        const zip = new JSZip();
        const imagePromises = imagesToExport.map(async (image) => {
          try {
            // Fetch image data as ArrayBuffer
            const response = await fetch(image.url);
            if (!response.ok)
              throw new Error(
                `Failed to fetch ${image.url}: ${response.statusText}`
              );
            const arrayBuffer = await response.arrayBuffer();

            // Potentially resize/reformat if size is not 'original'
            let finalBlob = new Blob([arrayBuffer], { type: "image/jpeg" }); // Assume original is JPEG for simplicity
            let fileName = `${image.id}.jpg`; // Default filename

            if (exportSize !== "original") {
              const img = new Image();
              const blobUrl = URL.createObjectURL(finalBlob); // Create a blob URL for the Image object
              await new Promise((resolve) => {
                img.onload = resolve;
                img.src = blobUrl;
              });
              URL.revokeObjectURL(blobUrl); // Clean up the blob URL

              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");

              let targetWidth = img.width;
              let targetHeight = img.height;

              if (exportSize === "platform") {
                // Example platform specific sizes (adjust as needed for actual platforms)
                if (exportPlatform === "Farfetch") {
                  targetWidth = 1500;
                  targetHeight = 2000;
                } else if (exportPlatform === "Mytheresa") {
                  targetWidth = 1000;
                  targetHeight = 1500;
                }
                // Add more platform logic
                // Maintain aspect ratio if one dimension is set. For simplicity, we assume fixed sizes.
              } else if (exportSize === "custom") {
                targetWidth = parseInt(customWidth, 10);
                targetHeight = parseInt(customHeight, 10);
              }

              // Ensure dimensions are valid numbers
              if (
                isNaN(targetWidth) ||
                isNaN(targetHeight) ||
                targetWidth <= 0 ||
                targetHeight <= 0
              ) {
                console.warn(
                  "Invalid custom/platform dimensions, using original."
                );
                targetWidth = img.width;
                targetHeight = img.height;
              }

              canvas.width = targetWidth;
              canvas.height = targetHeight;
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

              finalBlob = await new Promise((resolve) =>
                canvas.toBlob(resolve, "image/jpeg", 0.9)
              ); // Export as JPEG with quality 0.9
            }

            zip.file(fileName, finalBlob); // Add processed image to zip
          } catch (error) {
            console.error(`Failed to add image ${image.id} to zip:`, error);
            // Optionally, re-throw or handle specific errors
          }
        });

        await Promise.all(imagePromises);

        // Generate the ZIP file and trigger download
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${exportFileName}.zip`);
      } else if (exportFormat === "jpg") {
        // For individual JPG download, if only one image is selected
        if (imagesToExport.length === 1) {
          const image = imagesToExport[0];
          const response = await fetch(image.url);
          if (!response.ok)
            throw new Error(
              `Failed to fetch ${image.url}: ${response.statusText}`
            );
          const arrayBuffer = await response.arrayBuffer();
          let finalBlob = new Blob([arrayBuffer], { type: "image/jpeg" });
          let fileName = `${image.id}.jpg`;

          if (exportSize !== "original") {
            const img = new Image();
            const blobUrl = URL.createObjectURL(finalBlob);
            await new Promise((resolve) => {
              img.onload = resolve;
              img.src = blobUrl;
            });
            URL.revokeObjectURL(blobUrl);

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            let targetWidth = img.width;
            let targetHeight = img.height;

            if (exportSize === "platform") {
              if (exportPlatform === "Farfetch") {
                targetWidth = 1500;
                targetHeight = 2000;
              } else if (exportPlatform === "Mytheresa") {
                targetWidth = 1000;
                targetHeight = 1500;
              }
            } else if (exportSize === "custom") {
              targetWidth = parseInt(customWidth, 10);
              targetHeight = parseInt(customHeight, 10);
            }

            if (
              isNaN(targetWidth) ||
              isNaN(targetHeight) ||
              targetWidth <= 0 ||
              targetHeight <= 0
            ) {
              console.warn(
                "Invalid custom/platform dimensions, using original."
              );
              targetWidth = img.width;
              targetHeight = img.height;
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            finalBlob = await new Promise((resolve) =>
              canvas.toBlob(resolve, "image/jpeg", 0.9)
            );
          }

          saveAs(finalBlob, fileName);
        } else {
          // If multiple images are selected but format is JPG, alert user or consider forcing ZIP
          alert("To download multiple images, please select ZIP format.");
          setIsExporting(false);
          return;
        }
      } else {
        alert("Unsupported export format selected.");
        setIsExporting(false);
        return;
      }

      // Reset states after successful export
      setExportFormatDialog(false);
      setSelectedImages({});
      setExportDestination("");
      setExportPlatform("");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

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
                <Dialog
                  open={bulkCodesDialogOpen}
                  onOpenChange={setBulkCodesDialogOpen}
                >
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
                      <Button
                        variant="outline"
                        onClick={() => setBulkCodesDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleBulkCodeImport}>Import</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear search</span>
                  </Button>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeLocalFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeLocalFilterCount}
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
                      onCheckedChange={() =>
                        toggleFilter("assetType", assetType)
                      }
                    >
                      {assetType}
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />

                  <div className="font-medium text-sm mb-1 mt-2">
                    Merchandising Class
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {merchandisingClasses.map((merchandisingClass) => (
                      <DropdownMenuCheckboxItem
                        key={merchandisingClass}
                        checked={activeFilters.merchandisingClass.includes(
                          merchandisingClass
                        )}
                        onCheckedChange={() =>
                          toggleFilter("merchandisingClass", merchandisingClass)
                        }
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

            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="whitespace-nowrap"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>

            <Dialog
              open={exportFormatDialog}
              onOpenChange={setExportFormatDialog}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
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
                          variant={
                            exportDestination === option ? "default" : "outline"
                          }
                          onClick={() => setExportDestination(option)}
                          className="justify-start"
                        >
                          {option}
                        </Button>
                      ))}
                    </div>

                    {exportDestination && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {["Farfetch", "Mytheresa", "Luisaviaroma", "YNAP"].map(
                          (platform) => (
                            <Button
                              key={platform}
                              variant={
                                exportPlatform === platform
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() => setExportPlatform(platform)}
                              className="justify-start"
                            >
                              {platform}
                            </Button>
                          )
                        )}
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
                          <SelectItem value="original">
                            Original Size
                          </SelectItem>
                          <SelectItem value="platform">
                            Platform Specific
                          </SelectItem>
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
                      onCheckedChange={(checked) =>
                        setIncludeMetadata(checked === true)
                      }
                    />
                    <label
                      htmlFor="include-metadata"
                      className="text-sm font-medium leading-none"
                    >
                      Include metadata
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setExportFormatDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleExport}
                    disabled={
                      !exportDestination ||
                      !exportFormat ||
                      !exportSize ||
                      isExporting
                    }
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
          {activeLocalFilterCount > 0 && ( // Use activeLocalFilterCount here
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
              {activeFilters.merchandisingClass.map((merchandisingClass) => (
                <Badge
                  key={`class-${merchandisingClass}`}
                  variant="outline"
                  className="flex items-center gap-1 bg-white"
                >
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      toggleFilter("merchandisingClass", merchandisingClass)
                    }
                  />
                  {merchandisingClass}
                </Badge>
              ))}
              {activeFilters.season.map((season) => (
                <Badge
                  key={`season-${season}`}
                  variant="outline"
                  className="flex items-center gap-1 bg-white"
                >
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter("season", season)}
                  />
                  {season}
                </Badge>
              ))}
              {activeFilters.gender.map((gender) => (
                <Badge
                  key={`gender-${gender}`}
                  variant="outline"
                  className="flex items-center gap-1 bg-white"
                >
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter("gender", gender)}
                  />
                  {gender}
                </Badge>
              ))}
              {activeFilters.assetType.map((assetType) => (
                <Badge
                  key={`type-${assetType}`}
                  variant="outline"
                  className="flex items-center gap-1 bg-white"
                >
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => toggleFilter("assetType", assetType)}
                  />
                  {assetType}
                </Badge>
              ))}
              {searchTerm && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-white"
                >
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                  {searchTerm.length > 20
                    ? searchTerm.substring(0, 20) + "..."
                    : searchTerm}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Status tabs */}
        <div className="bg-white rounded-md border mb-4 shadow-sm overflow-hidden">
          <Tabs
            defaultValue="All"
            value={currentTab}
            onValueChange={setCurrentTab}
            className="w-full"
          >
            <TabsList className="w-full flex rounded-none bg-muted/30 p-0 h-auto">
              <TabsTrigger
                value="All"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="Raw"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
                Raw
              </TabsTrigger>
              <TabsTrigger
                value="In Progress"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
                In Progress
              </TabsTrigger>
              <TabsTrigger
                value="Approved"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
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
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
            {(activeLocalFilterCount > 0 ||
              (Object.keys(appliedFilters).length > 0 &&
                Object.values(appliedFilters).some(
                  (val) =>
                    (Array.isArray(val) && val.length > 0) ||
                    (typeof val === "string" && val.trim() !== "")
                ))) && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={clearAllFilters}
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Image view dialog */}
      <Dialog
        open={viewImageDialog.open}
        onOpenChange={(open) =>
          setViewImageDialog({ ...viewImageDialog, open })
        }
        style={{ height: "90%" }}
      >
        <DialogContent
          className="max-w-4xl"
          style={{ height: "90%", overflowY: "scroll" }}
        >
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
  );
}
