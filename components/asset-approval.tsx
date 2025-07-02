"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
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
// Import xlsx
import * as XLSX from "xlsx";
import API_BASE_URL from "@/API_BASE_URL";

// --- API Constants (Move these to environment variables in a real app) ---

// --- Helper Functions (remain mostly the same) ---
const getUniqueValues = (products, key) => {
  console.log("status", products);
  if (key === "categories" || key === "assetType") {
    const allValues = products.flatMap((product) => product[key]);
    return [...new Set(allValues)];
  }
  return [...new Set(products.map((product) => product[key]))];
};

const getStatusCounts = (products) => {
  const counts = {
    total: products.length,
    SHOT: 0,
    "IN PROGRESS": 0,
    APPROVED: 0,
    DELIVERED: 0,
  };

  products.forEach((product) => {
    product.images.forEach((e) => {
      console.log("me2", e);
      const status = e.status;
      console.log("this is sattus", product.status);
      counts[status] = (counts[status] || 0) + 1;
    });
  });
  console.log("jio2", counts);
  return counts;
};

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

export default function AssetApproval({ appliedFilters = {} }) {
  // --- New State for Data Fetching ---
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedUsers, setFetchedUsers] = useState([]);
  // --- Existing States ---
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedImages, setSelectedImages] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkCodesDialogOpen, setBulkCodesDialogOpen] = useState(false);
  const [bulkCodes, setBulkCodes] = useState("");
  const [currentTab, setCurrentTab] = useState("All");
  const [viewImageDialog, setViewImageDialog] = useState({
    open: false,
    url: "",
    product: null,
    imageType: "",
    imageStatus: "",
    imageId: "",
    notes: "", // Added notes to the dialog state
    comments: "", // Added comments to the dialog state
  });
  const [statusCounts, setStatusCounts] = useState(getStatusCounts([]));
  const [exportFormatDialog, setExportFormatDialog] = useState(false);
  const [exportDestination, setExportDestination] = useState("");
  const [exportPlatform, setExportPlatform] = useState("");
  const [exportFormat, setExportFormat] = useState("zip");
  const [exportSize, setExportSize] = useState("platform");
  const [customWidth, setCustomWidth] = useState("1200");
  const [customHeight, setCustomHeight] = useState("1200");
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
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

  // --- Transformation Function from Sessions to Products ---
  const transformSessionsToProducts = (sessions, users) => {
    const productsTransformed = [];

    sessions.forEach((session) => {
      session.shootingListIDs.forEach((list) => {
        // Use shootingListIDs as populated array
        const assignedUserObj = users.find((user) => user._id === list.userId);
        const assignedUserName = assignedUserObj
          ? assignedUserObj.name
          : "Unknown User";

        const transformedProduct = {
          id: list._id,
          code: list.sku || list.name,
          shootingName: list.name,
          farfetchId: list.farfetchId || "",
          barcode: list.barcode,
          categories: [], // Populate if categories exist on your list/product
          season: session?.name || "", // Assuming session name is season
          merchandisingClass: list.merchandisingclass,
          gender: list.gender,
          assetType: list.assetypes ? [list.assetypes] : [],
          status: list.arrival, // Assuming list.arrival is the product status
          assignedUser: assignedUserName,
          // Images are now directly available via list.imageIDs
          images: list.imageIDs.map((img) => ({
            id: img._id,
            status: img.status || "",
            url: img.imageURL, // Assuming imageURL is the field for the image URL
            type: img.assetType || img.assetypes || "Unknown",
            sku: img.sku || list.sku,
            barcode: img.barcode || list.barcode,
            merchandisingClass:
              img.merchandisingClass || list.merchandisingclass,
            assetType: img.assetType || list.assetypes,
            notes: img.notes || "",
            comments: img.comments || "",
          })),
        };
        productsTransformed.push(transformedProduct);
      });
    });
    return productsTransformed;
  };

  // --- Fetch Users Function ---
  const fetchUsers = async () => {
    const BEARER_TOKEN = localStorage.getItem("token");

    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      });
      setFetchedUsers(response.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please check your network or API token.");
      setFetchedUsers([]);
    }
  };

  // --- Fetch Products Data ---
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    const BEARER_TOKEN = localStorage.getItem("token");

    try {
      // Ensure users are fetched first if not already available
      if (fetchedUsers.length === 0) {
        await fetchUsers();
      }

      const sessionsResponse = await axios.get(
        `${API_BASE_URL}/admin/sessions`, // Single API call thanks to backend population
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
        }
      );

      if (sessionsResponse.status === 200) {
        // The sessionsResponse.data.shootingSessions already contains populated lists and images
        const fullyPopulatedSessions = sessionsResponse.data.shootingSessions;

        const transformedData = transformSessionsToProducts(
          fullyPopulatedSessions,
          fetchedUsers
        );
        setProducts(transformedData);
        setStatusCounts(getStatusCounts(transformedData));
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(
        "Failed to load products. Please check your network or API token."
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!viewImageDialog.imageId) return;
    const BEARER_TOKEN = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/send/${viewImageDialog.imageId}`,
        {
          notes: viewImageDialog.notes,
          comments: viewImageDialog.comments,
        },
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response from saving notes:", response);
      if (response.status === 200) {
        alert("Notes and comments saved successfully!");

        // *** FIX START ***
        // Optimistically update the viewImageDialog state with the new notes/comments
        // This assumes your backend returns the updated imageData in the response,
        // which is good practice. If not, you might need to find the specific
        // image in your 'products' state and update it there, or re-fetch all products.
        setViewImageDialog((prevDialog) => ({
          ...prevDialog,
          // Update with the values that were just successfully saved
          notes: prevDialog.notes,
          comments: prevDialog.comments,
          // If your backend returns the updated image data, you can use:
          // notes: response.data.imageData.notes || "",
          // comments: response.data.imageData.comments || "",
        }));

        // Re-fetch products to ensure overall data consistency across the app,
        // especially if notes/comments are also displayed in ProductRow.
        fetchProducts();
        // *** FIX END ***
      } else {
        alert(`Failed to save notes: ${response.data.msg}`);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Error saving notes. Please try again.");
    }
  };

  // --- Initial Data Load on Mount ---
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (fetchedUsers.length > 0) {
      fetchProducts();
    }
  }, [fetchedUsers]);

  useEffect(() => {
    setStatusCounts(getStatusCounts(products));
  }, [products]);

  const uniqueSeasons = getUniqueValues(products, "season");
  const uniqueGenders = getUniqueValues(products, "gender");

  const productsToDisplay = useMemo(() => {
    let result = [...products];

    if (appliedFilters.selectedMerchandisingClasses?.length > 0) {
      const globalSelectedClasses = new Set(
        appliedFilters.selectedMerchandisingClasses.map((c) => c.toLowerCase())
      );
      result = result.filter((product) =>
        globalSelectedClasses.has(
          (product.merchandisingClass || "").toLowerCase()
        )
      );
    }

    if (appliedFilters.selectedAssetTypes?.length > 0) {
      const globalSelectedAssetTypes = new Set(
        appliedFilters.selectedAssetTypes.map((at) => at.toLowerCase())
      );
      result = result.filter((product) =>
        product.assetType.some((type) =>
          globalSelectedAssetTypes.has((type || "").toLowerCase())
        )
      );
    }

    if (activeFilters.merchandisingClass.length > 0) {
      result = result.filter((product) =>
        activeFilters.merchandisingClass.includes(product.merchandisingClass)
      );
    }

    if (activeFilters.assetType.length > 0) {
      result = result.filter((product) =>
        product.assetType.some((type) => activeFilters.assetType.includes(type))
      );
    }
    if (activeFilters.gender.length > 0) {
      result = result.filter((product) => {
        const productGenders = Array.isArray(product.gender)
          ? product.gender.map((g) => g.toLowerCase())
          : [(product.gender || "").toLowerCase()];

        const filterGenders = activeFilters.gender.map((g) => g.toLowerCase());

        return filterGenders.some((filterGender) =>
          productGenders.includes(filterGender)
        );
      });
    }

    if (activeFilters.season.length > 0) {
      result = result.filter((product) =>
        activeFilters.season.includes(product.season)
      );
    }

    console.log("merasas", result);
    if (currentTab !== "All") {
      console.log("moka 2", currentTab);
      result = result.filter((product) =>
        product.images.some(
          (image) => image.status.toLowerCase() === currentTab.toLowerCase()
        )
      );
    }

    result = [...result].sort((a, b) => a.code.localeCompare(b.code));

    return result;
  }, [products, currentTab, searchTerm, activeFilters, appliedFilters]);

  useEffect(() => {
    setFilteredProducts(productsToDisplay);
  }, [productsToDisplay]);

  const handleBulkCodeImport = () => {
    if (!bulkCodes.trim()) return;

    const codeList = bulkCodes
      .split("\n")
      .map((code) => code.trim())
      .filter((code) => code.length > 0);

    if (codeList.length > 0) {
      setSearchTerm(codeList.join("|"));
    }

    setBulkCodesDialogOpen(false);
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => ({
      ...prev, // Ensure previous state is spread correctly
      [imageId]: !prev[imageId],
    }));
  };

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

  // Modified viewImage to include notes and comments from the image object
  const viewImage = (
    url: string,
    product: any,
    imageType: string,
    imageStatus: string,
    imageId: string,
    notes: string = "",
    comments: string = ""
  ) => {
    console.log("Viewing image:", {
      url,
      product,
      imageType,
      imageStatus,
      imageId,
      notes,
      comments,
    });
    setViewImageDialog({
      open: true,
      url,
      product,
      imageType,
      imageStatus,
      imageId,
      notes, // Set existing notes
      comments, // Set existing comments
    });
  };

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

  const clearAllFilters = () => {
    setActiveFilters({
      season: [],
      merchandisingClass: [],
      gender: [],
      assetType: [],
    });
    setSearchTerm("");
    setCurrentTab("All");
  };

  const activeLocalFilterCount =
    activeFilters.season.length +
    activeFilters.merchandisingClass.length +
    activeFilters.gender.length +
    activeFilters.assetType.length +
    (searchTerm ? 1 : 0) +
    (currentTab !== "All" ? 1 : 0);

  const selectedCount = Object.values(selectedImages).filter(Boolean).length;

  // --- Function to handle approving an image (now with notes/comments) ---
  const handleApproveImage = async () => {
    if (!viewImageDialog.imageId) return;
    const BEARER_TOKEN = localStorage.getItem("token");

    // Determine the next status based on current status for "Approve" button
    let nextStatus = "";
    if (viewImageDialog.imageStatus.toUpperCase() === "SHOT") {
      nextStatus = "IN PROGRESS";
    } else if (viewImageDialog.imageStatus.toUpperCase() === "IN PROGRESS") {
      nextStatus = "APPROVED"; // Or whatever the next logical step is after IN PROGRESS
    } else {
      // Handle other cases or disallow approval if not SHOT/IN PROGRESS
      alert("This image cannot be approved from its current status.");
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/send/${viewImageDialog.imageId}`, // Backend expects /admin/send/:id
        {
          status: nextStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response from approving image:", response);
      if (response.status === 200) {
        alert(`Image status updated to '${nextStatus}' successfully!`);
        setViewImageDialog({
          ...viewImageDialog,
          open: false,
          notes: "",
          comments: "",
        }); // Close dialog and clear fields
        fetchProducts(); // Re-fetch products to update UI
      } else {
        alert(`Failed to update image status: ${response.data.msg}`);
      }
    } catch (error) {
      console.error("Error updating image status:", error);
      alert("Error updating image status. Please try again.");
    }
  };

  // --- Function to handle rejecting an image ---
  const handleRejectImage = async () => {
    if (!viewImageDialog.imageId) return;
    const BEARER_TOKEN = localStorage.getItem("token");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/send/${viewImageDialog.imageId}`, // Or a separate reject endpoint if you have one
        {
          status: "REJECTED", // Example status for rejection
          notes: viewImageDialog.notes, // Include notes on rejection
          comments: viewImageDialog.comments, // Include comments on rejection
        },
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response from rejecting image:", response);
      if (response.status === 200) {
        alert("Image status updated to 'REJECTED' successfully!");
        setViewImageDialog({
          ...viewImageDialog,
          open: false,
          notes: "",
          comments: "",
        });
        fetchProducts();
      } else {
        alert(`Failed to reject image: ${response.data.msg}`);
      }
    } catch (error) {
      console.error("Error rejecting image:", error);
      alert("Error rejecting image. Please try again.");
    }
  };

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
      .slice(0, 10)}`;

    try {
      if (exportFormat === "zip") {
        const zip = new JSZip();
        const imagePromises = imagesToExport.map(async (image) => {
          try {
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

            zip.file(fileName, finalBlob);
          } catch (error) {
            console.error(`Failed to add image ${image.id} to zip:`, error);
          }
        });

        await Promise.all(imagePromises);

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${exportFileName}.zip`);
      } else if (exportFormat === "jpg") {
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
          alert("To download multiple images, please select ZIP format.");
          setIsExporting(false);
          return;
        }
      } else {
        alert("Unsupported export format selected.");
        setIsExporting(false);
        return;
      }

      setExportFormatDialog(false);
      setSelectedImages({});
      setExportDestination("");
      setExportPlatform("");
    } catch (error: any) {
      console.error("Export failed:", error);
      alert("Export failed: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGrid = () => {
    console.log("abnjh");
    const selectedImagesWithMetadata: any[] = [];

    products.forEach((product) => {
      product.images.forEach((image) => {
        if (selectedImages[image.id]) {
          selectedImagesWithMetadata.push({
            "Product Code": product.code,
            "Farfetch ID": product.farfetchId,
            Barcode: product.barcode,
            Category: product.categories.join(", "),
            Season: product.season,
            "Merchandising Class": product.merchandisingClass,
            Gender: product.gender,
            "Asset Type (Product)": product.assetType.join(", "),
            "Image ID": image.id,
            "Image Type": image.type,
            "Image URL": image.url,
            "Product Status": product.status,
            "Image Status": image.status || "N/A",
            Notes: image.notes || "", // Include notes in export
            Comments: image.comments || "", // Include comments in export
          });
        }
      });
    });

    if (selectedImagesWithMetadata.length === 0) {
      alert("Please select images to export metadata.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(selectedImagesWithMetadata);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Image Metadata");

    const excelFileName = `image_metadata_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, excelFileName);

    setSelectedImages({});
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

            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={handleExportGrid}
            >
              <Grid className="mr-2 h-4 w-4" />
              Export Grid
            </Button>
          </div>

          {activeLocalFilterCount > 0 && (
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
                value="SHOT"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
                SHOT
              </TabsTrigger>
              <TabsTrigger
                value="IN PROGRESS"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
                IN PROGRESS
              </TabsTrigger>
              <TabsTrigger
                value="APPROVED"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
                APPROVED
              </TabsTrigger>
              <TabsTrigger
                value="DELIVERED"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
                DELIVERED
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-center bg-white rounded-md border shadow-sm">
            <svg
              className="animate-spin h-8 w-8 text-blue-500 mr-3"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading products...
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-md border shadow-sm text-red-500">
            <AlertCircle className="h-12 w-12 mb-4" />
            <div className="text-lg font-medium mb-2">Error loading data</div>
            <p className="text-sm">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchProducts}>
              Retry
            </Button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                selectedImages={selectedImages}
                onToggleSelect={toggleImageSelection}
                onSelectAll={() => selectAllImages(product.id)}
                // Pass imageStatus, imageId, notes, and comments to onViewImage
                onViewImage={(url, type, status, id, notes, comments) =>
                  viewImage(url, product, type, status, id, notes, comments)
                }
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
          {/* Notes and Comments Section */}

          <div className="flex justify-between mt-4">
            {/* Approve Button */}
            {viewImageDialog.imageStatus.toUpperCase() === "SHOT" ||
            viewImageDialog.imageStatus.toUpperCase() === "IN PROGRESS" ? (
              <Button onClick={handleApproveImage}>
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            ) : null}

            {/* Reject Button (Always show for flexibility, or you can condition it) */}
            <Button variant="outline" onClick={handleRejectImage}>
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
