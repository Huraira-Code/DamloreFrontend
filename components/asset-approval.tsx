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
import { Progress } from "@/components/ui/progress"; // Assuming shadcn/ui Progress component
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
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
    READY: 0,
    DELIVERED: 0,
  };

  products.forEach((product) => {
    product?.images?.forEach((e) => {
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

const LoadingModal = ({ isOpen, deletedCount, totalCount }) => {
  const progressValue = totalCount > 0 ? (deletedCount / totalCount) * 100 : 0;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deleting Images</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-center">
          <p className="mb-4">
            Deleting images... ({deletedCount} / {totalCount} deleted)
          </p>
          <Progress value={progressValue} className="w-full" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

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
    versionHistory: [], // Added version history to the dialog state
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [newImage, setNewImage] = useState({ file: null });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newNote, setNewNote] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [imageModal, setImageModal] = useState({
    open: false,
    imageId: null,
    sessionId: null,
  });
  const [deletedCount, setDeletedCount] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState(null); // null = original image
  const [totalImagesToDelete, setTotalImagesToDelete] = useState(0); // New state for total count
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
  const [promoteModal, setPromoteModal] = useState({
    open: false,
    shotImages: [] as Array<{
      id: string;
      url: string;
      status: string;
      productId: string;
    }>,
    inProgressImages: [] as Array<{
      id: string;
      url: string;
      status: string;
      productId: string;
    }>,
  });
  // --- Transformation Function from Sessions to Products ---
  const transformSessionsToProducts = (sessions, users) => {
    const productsTransformed = [];

    sessions.forEach((session) => {
      console.log("avoided sesson", session);
      // Use shootingListIDs as populated array
      const assignedUserObj = users.find(
        (user) => user._id === session?.assignedUser
      );
      console.log("assigned username", assignedUserObj);
      const assignedUserName = assignedUserObj
        ? assignedUserObj.name
        : "Unknown User";

      const transformedProduct = {
        barcode: session.barcode,
        categories: [], // Populate if categories exist on your list/product
        season: session?.name || "", // Assuming session name is season
        merchandisingClass: session.merchandisingclass,
        gender: session.gender,
        assetType: session.assetypes ? [session.assetypes] : [],
        status: session.arrival, // Assuming list.arrival is the product status
        assignedUser: assignedUserName,
        id: session._id,
        // Images are now directly available via list.imageIDs
        images: session?.imageIDs?.map((img) => ({
          id: img._id,
          status: img.status || "",
          url: img.imageURL, // Assuming imageURL is the field for the image URL
          type: img.assetType || img.assetypes || "Unknown",
          sku: img.sku || session.sku,
          barcode: img.barcode || session.barcode,
          merchandisingClass:
            img.merchandisingClass || session.merchandisingclass,
          assetType: img.assetType || session.assetypes,
          notes: img.notes || "",
          comments: img.comments || "",
          versionHistory: img.versionHistory || [], // Assuming versionHistroy is the field for version history
        })),
      };
      productsTransformed.push(transformedProduct);
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
        console.log("Fetched sessions:", fullyPopulatedSessions);
        const transformedData = transformSessionsToProducts(
          fullyPopulatedSessions,
          fetchedUsers
        );
        console.log("Transformed products:", transformedData);
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
      const response = await axios.post(
        `${API_BASE_URL}/admin/notes/${viewImageDialog.imageId}`,
        {
          note: newNote,
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
        setViewImageDialog((prev) => ({
          ...prev,
          notes: [...prev.notes, newNote],
        }));
        setNewNote(""); // Clear the input
        fetchProducts(); // Refresh data
      } else {
        alert(`Failed to save notes: ${response.data.msg}`);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      alert("Error saving notes. Please try again.");
    }
  };

  const openImageVersionDialog = (imageId, sessionId) => {
    setImageModal({
      open: true,
      imageId,
      sessionId,
    });
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

    result = [...result].sort((a, b) => a?.code?.localeCompare(b.code));

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
    console.log("select Image", productId);
    console.log("products ", products);
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const allSelected = product.images.every((img) => selectedImages[img.id]);

    const newSelectedImages = { ...selectedImages };

    product.images.forEach((img) => {
      newSelectedImages[img.id] = !allSelected;
    });

    setSelectedImages(newSelectedImages);
  };

  const onDeleteSelected = async (productId: string) => {
    const imageIdsToDelete = Object.keys(selectedImages).filter(
      (imageId) => selectedImages[imageId]
    );

    if (imageIdsToDelete.length === 0) {
      alert("No images selected for deletion.");
      return;
    }

    setIsDeleting(true);
    setDeletedCount(0);
    setTotalImagesToDelete(imageIdsToDelete.length); // Set total count

    const productToUpdate = products.find((p) => p.id === productId);
    if (!productToUpdate) {
      setIsDeleting(false);
      alert("Product not found.");
      return;
    }

    let successfullyDeleted: string[] = [];
    const BEARER_TOKEN = localStorage.getItem("token");

    for (const imageId of imageIdsToDelete) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/admin/deleteimage/${productId}/${imageId}`,
          {
            headers: {
              Authorization: `Bearer ${BEARER_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = response.data;

        if (response.status === 200) {
          console.log(`Successfully deleted image ${imageId}:`, result.msg);
          successfullyDeleted.push(imageId);
          setDeletedCount((prev) => prev + 1);
        } else {
          console.error(`Failed to delete image ${imageId}:`, result.msg);
          // Optionally, show an error for individual image deletion
          alert(`Failed to delete image ${imageId}: ${result.msg}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          console.error(
            `Failed to delete image ${imageId}:`,
            error.response.data.msg
          );
          alert(
            `Failed to delete image ${imageId}: ${error.response.data.msg}`
          );
        } else {
          console.error(`Error deleting image ${imageId}:`, error);
          alert(`Error deleting image ${imageId}: ${error.message}`);
        }
      }
    }

    // Update the UI state only with images that were successfully deleted
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.id === productId) {
          const updatedImages = product.images.filter(
            (image) => !successfullyDeleted.includes(image.id)
          );
          return { ...product, images: updatedImages };
        }
        return product;
      })
    );

    // Clear the selection for the images that were attempted to be deleted
    setSelectedImages((prev) => {
      const newSelection = { ...prev };
      imageIdsToDelete.forEach((imageId) => {
        delete newSelection[imageId];
      });
      return newSelection;
    });

    setIsDeleting(false);
    alert(
      `Deletion process completed. Successfully deleted ${successfullyDeleted.length} out of ${imageIdsToDelete.length} selected images.`
    );
  };

  const onPromoteSelected = async (productId: string) => {
    const selectedImageIds = Object.keys(selectedImages).filter(
      (imageId) => selectedImages[imageId]
    );

    if (selectedImageIds.length === 0) {
      alert("No images selected for promotion.");
      return;
    }

    const shotImages = [];
    const inProgressImages = [];

    for (const product of products) {
      for (const image of product.images) {
        if (selectedImageIds.includes(image.id)) {
          const imageData = {
            id: image.id,
            url: image.url,
            status: image.status,
            productId: product.id,
          };

          if (image.status === "SHOT") {
            shotImages.push(imageData);
          } else if (image.status === "IN PROGRESS") {
            inProgressImages.push(imageData);
          }
        }
      }
    }

    setPromoteModal({
      open: true,
      shotImages,
      inProgressImages,
    });
  };
  // Modified viewImage to include notes and comments from the image object
  const viewImage = (
    url: string,
    product: any,
    imageType: string,
    imageStatus: string,
    imageId: string,
    notes: string = "",
    comments: string = "",
    versionHistory: any[] = []
  ) => {
    console.log("Viewing image:", {
      url,
      product,
      imageType,
      imageStatus,
      imageId,
      notes,
      comments,
      versionHistory,
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
      versionHistory,
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
      nextStatus = "READY"; // Or whatever the next logical step is after IN PROGRESS
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

  const handleVersionUpload = async () => {
    if (!newImage.file || !imageModal.imageId || !imageModal.sessionId) return;
    console.log(
      "new session account",
      newImage.file,
      imageModal.imageId,
      imageModal.sessionId
    );

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("files", newImage.file);
      formData.append("imageId", imageModal.imageId);
      formData.append("sessionId", imageModal.sessionId);
      const BEARER_TOKEN = localStorage.getItem("token");

      const res = await axios.post(`${API_BASE_URL}/admin/addImage`, formData, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });
      console.log("motku huraira", res);
      setImageModal({ ...imageModal, open: false });
      setNewImage({ file: null });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
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
      <div
        className="bg-white border-b sticky top-0 z-10"
        style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
      >
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
        <div
          className="bg-white p-4 rounded-md border mb-4 shadow-sm"
          style={{ marginLeft: "1rem", marginRight: "1rem" }}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div
              className="relative w-full sm:w-96"
              style={{ maxHeight: "65%" }}
            >
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

            <DropdownMenu style={{ height: "65%" }}>
              <DropdownMenuTrigger>
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
              <DropdownMenuContent
                align="end"
                className="w-56"
                style={{ height: "100%" }}
              >
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

        <div
          className="bg-white rounded-md border mb-4 shadow-sm overflow-hidden"
          style={{ marginRight: "1rem", marginLeft: "1rem" }}
        >
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
                value="READY"
                className="flex-1 rounded-none data-[state=active]:bg-background py-3 px-4"
              >
                READY
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
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-md border shadow-sm">
            {/* You'll need to import a Spinner or LoadingDots component, or create a simple one */}
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <div className="text-lg font-medium mb-2">Loading sessions...</div>
            <p className="text-sm text-muted-foreground">
              Please wait while we fetch your data.
            </p>
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
            <LoadingModal
              isOpen={isDeleting}
              deletedCount={deletedCount}
              totalCount={totalImagesToDelete}
            />
            {filteredProducts.map(
              (product) => (
                console.log("Rendering ProductRow for product:", product),
                (
                  <ProductRow
                    product={product}
                    selectedImages={selectedImages}
                    onToggleSelect={toggleImageSelection}
                    onDeleteSelected={() => onDeleteSelected(product.id)}
                    onPromoteSelected={() => onPromoteSelected(product.id)}
                    onSelectAll={() => selectAllImages(product.id)}
                    // Pass imageStatus, imageId, notes, and comments to onViewImage
                    onViewImage={(
                      url,
                      type,
                      status,
                      id,
                      notes,
                      comments,
                      versionHistory
                    ) =>
                      viewImage(
                        url,
                        product,
                        type,
                        status,
                        id,
                        notes,
                        comments,
                        versionHistory
                      )
                    }
                  />
                )
              )
            )}
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
      >
        <DialogContent className="max-w-6xl h-[90vh] flex p-0 overflow-hidden">
          {/* Left Side - Fixed (Image + Versions) */}
          <div className="w-2/3 flex flex-col p-6 border-r">
            {/* Main Image - Fixed height */}
            <div className="h-[70%] bg-gray-50 rounded-lg flex items-center justify-center">
              <img
                src={
                  selectedVersion?.data?.imageURL ||
                  viewImageDialog.url ||
                  "/placeholder.svg"
                }
                alt="Main preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="mt-4 flex-1">
              <h3 className="text-sm font-medium mb-2">Image Versions</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {/* Original Image */}

                <div className="flex flex-col items-center">
                  <div
                    className="flex-shrink-0 w-20 h-20 border-2 border-dashed rounded-md cursor-pointer flex items-center justify-center text-gray-400 hover:border-blue-500"
                    onClick={() =>
                      openImageVersionDialog(
                        viewImageDialog.imageId,
                        viewImageDialog?.product?.id
                      )
                    } // use correct imageId/sessionId
                  >
                    <span className="text-3xl font-light">+</span>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    Upload
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={`flex-shrink-0 w-20 h-20 border rounded-md cursor-pointer relative hover:border-blue-500 ${
                      !selectedVersion ? "border-blue-500" : ""
                    }`}
                    onClick={() => setSelectedVersion(null)}
                  >
                    <img
                      src={viewImageDialog.url || "/placeholder.svg"}
                      alt="Current Version"
                      className="w-full h-full object-contain p-1"
                    />
                    {!selectedVersion && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                        Current
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    V{viewImageDialog.versionHistory?.length + 1}
                  </span>
                </div>

                {/* Version History */}
                {[...(viewImageDialog.versionHistory || [])]
                  .sort((a, b) => b.versionNumber - a.versionNumber) // Sort descending
                  .map((version) => (
                    <div
                      key={version._id}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`flex-shrink-0 w-20 h-20 border rounded-md cursor-pointer relative hover:border-blue-500 ${
                          selectedVersion?._id === version._id
                            ? "border-blue-500"
                            : ""
                        }`}
                        onClick={() => setSelectedVersion(version)}
                      >
                        <img
                          src={version.data.imageURL}
                          alt={`Version ${version.versionNumber}`}
                          className="w-full h-full object-contain p-1"
                        />
                        {selectedVersion?._id === version._id && (
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                            Selected
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        V{version.versionNumber}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Side - Scrollable Content */}
          <div className="w-1/3 flex flex-col overflow-y-auto p-6">
            {/* Product Info */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Product Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Season:</div>
                <div>{viewImageDialog.product?.season || "-"}</div>

                <div className="text-muted-foreground">Class:</div>
                <div>{viewImageDialog.product?.merchandisingClass || "-"}</div>

                <div className="text-muted-foreground">Gender:</div>
                <div>{viewImageDialog.product?.gender || "-"}</div>

                <div className="text-muted-foreground">Status:</div>
                <div>
                  <Badge variant="secondary">
                    {viewImageDialog.imageStatus}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Notes Section with Edit Capability */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Notes</h3>
              </div>
              <div className="bg-gray-50 rounded-md p-3 min-h-24 max-h-40 overflow-y-auto">
                {viewImageDialog.notes && viewImageDialog.notes.length > 0 ? (
                  // Map over the notes array if it exists and has items
                  viewImageDialog.notes.map((note, index) => (
                    <p
                      style={{ fontSize: 14 }}
                      key={index}
                      className="whitespace-pre-wrap"
                    >
                      {note}
                    </p>
                  ))
                ) : (
                  // Show "No notes added" if the array is empty or doesn't exist
                  <p className="text-muted-foreground italic">No notes added</p>
                )}
              </div>
              {/* Note Editor (would be conditionally shown) */}
              <Textarea
                placeholder="Add a Note..."
                className="min-h-[60px] mt-2"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <Button onClick={handleSaveNotes} className="mt-2" size="sm">
                Add Note
              </Button>
            </div>

            <div className="mb-6 flex-1">
              <h3 className="text-sm font-medium mb-2">Comments</h3>
              <div className="bg-gray-50 rounded-md p-3 max-h-60 overflow-y-auto mb-2">
                {viewImageDialog.versionHistory?.length > 0 ? (
                  <div className="space-y-3">
                    {viewImageDialog.versionHistory.map((version) => (
                      <div key={version._id} className="text-sm">
                        <div className="font-medium">
                          Version {version.versionNumber}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {dayjs(version.createdAt).fromNow()}
                        </div>
                        <p className="mt-1">{version.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    No version comments yet
                  </p>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex justify-between gap-2 pt-4 border-t sticky bottom-0 bg-background">
              {/* <Button variant="outline" className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button> */}
              <Button onClick={handleApproveImage} className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={promoteModal.open}
        onOpenChange={(open) => setPromoteModal({ ...promoteModal, open })}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Promote Selected Images</DialogTitle>
          </DialogHeader>

          {/* SHOT Images Section */}
          {promoteModal.shotImages.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  SHOT Images ({promoteModal.shotImages.length})
                </h3>
                <Button
                  size="sm"
                  onClick={async () => {
                    // Move all SHOT images to IN PROGRESS
                    setIsExporting(true);
                    const BEARER_TOKEN = localStorage.getItem("token");
                    const successfulUpdates = [];

                    for (const image of promoteModal.shotImages) {
                      try {
                        const response = await axios.put(
                          `${API_BASE_URL}/admin/send/${image.id}`,
                          { status: "IN PROGRESS" },
                          {
                            headers: {
                              Authorization: `Bearer ${BEARER_TOKEN}`,
                            },
                          }
                        );
                        if (response.status === 200) {
                          successfulUpdates.push(image.id);
                        }
                      } catch (error) {
                        console.error(
                          `Failed to update image ${image.id}:`,
                          error
                        );
                      }
                    }

                    setIsExporting(false);
                    if (successfulUpdates.length > 0) {
                      alert(
                        `Successfully moved ${successfulUpdates.length} images to IN PROGRESS`
                      );
                      fetchProducts(); // Refresh data
                    }
                    setPromoteModal({ ...promoteModal, open: false });
                  }}
                  disabled={isExporting}
                >
                  {isExporting ? "Processing..." : "Move All to IN PROGRESS"}
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {promoteModal.shotImages.map((image) => (
                  <div key={image.id} className="relative border rounded p-1">
                    <img
                      src={image.url}
                      alt="Selected for promotion"
                      className="w-full h-20 object-contain"
                    />
                    <div className="absolute top-1 right-1">
                      <Checkbox
                        checked={selectedImages[image.id]}
                        onCheckedChange={() => toggleImageSelection(image.id)}
                        className="h-4 w-4 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IN PROGRESS Images Section */}
          {promoteModal.inProgressImages.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  IN PROGRESS Images ({promoteModal.inProgressImages.length})
                </h3>
                <Button
                  size="sm"
                  onClick={async () => {
                    // Move all IN PROGRESS images to APPROVED
                    setIsExporting(true);
                    const BEARER_TOKEN = localStorage.getItem("token");
                    const successfulUpdates = [];

                    for (const image of promoteModal.inProgressImages) {
                      try {
                        const response = await axios.put(
                          `${API_BASE_URL}/admin/send/${image.id}`,
                          { status: "READY" },
                          {
                            headers: {
                              Authorization: `Bearer ${BEARER_TOKEN}`,
                            },
                          }
                        );
                        if (response.status === 200) {
                          successfulUpdates.push(image.id);
                        }
                      } catch (error) {
                        console.error(
                          `Failed to update image ${image.id}:`,
                          error
                        );
                      }
                    }

                    setIsExporting(false);
                    if (successfulUpdates.length > 0) {
                      alert(
                        `Successfully moved ${successfulUpdates.length} images to READY`
                      );
                      fetchProducts(); // Refresh data
                    }
                    setPromoteModal({ ...promoteModal, open: false });
                  }}
                  disabled={isExporting}
                >
                  {isExporting ? "Processing..." : "Move All to APPROVED"}
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {promoteModal.inProgressImages.map((image) => (
                  <div key={image.id} className="relative border rounded p-1">
                    <img
                      src={image.url}
                      alt="Selected for promotion"
                      className="w-full h-20 object-contain"
                    />
                    <div className="absolute top-1 right-1">
                      <Checkbox
                        checked={selectedImages[image.id]}
                        onCheckedChange={() => toggleImageSelection(image.id)}
                        className="h-4 w-4 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPromoteModal({ ...promoteModal, open: false })}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={imageModal.open}
        onOpenChange={(val) => setImageModal({ ...imageModal, open: val })}
      >
        <DialogContent className="space-y-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Image Version</DialogTitle>
          </DialogHeader>

          {isUploading ? (
            <div className="mt-2 space-y-1 text-sm text-blue-600 w-full">
              Uploading image...
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-blue-500 h-2 rounded transition-all duration-200"
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewImage({
                      ...newImage,
                      file: e.target.files?.[0] || null,
                    })
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleVersionUpload} disabled={!newImage.file}>
                  Upload
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
