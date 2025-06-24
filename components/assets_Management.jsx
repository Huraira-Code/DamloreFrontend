"use client";

import { useState, useEffect, useMemo } from "react"; // Import useMemo
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Info, XCircle, CheckCircle2 } from "lucide-react";
import API_BASE_URL from "@/API_BASE_URL";

export default function DigitalAssetManagementPage({ appliedFilters = {} }) {
  // Store the full, unfiltered sessions data
  const [allSessions, setAllSessions] = useState([]);
  // Use this state to display sessions, which will be filtered
  const [sessionsToDisplay, setSessionsToDisplay] = useState([]);

  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [newSession, setNewSession] = useState({ name: "", user: "" });

  const [openImageDetailModal, setOpenImageDetailModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Will store the image object when clicked
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedMetadata, setEditedMetadata] = useState({}); // To hold changes during edit

  const [openShootingModal, setOpenShootingModal] = useState(false);
  const [shootingSessionIndex, setShootingSessionIndex] = useState(null);
  const [shootingListForm, setShootingListForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    gender: "",
    merchandisingclass: "",
    assetypes: "",
    arrival: "",
    user: "",
    images: [],
  });

  const [imageModal, setImageModal] = useState({
    open: false,
    sessionIdx: null,
    listIdx: null,
    sku: "",
    barcode: "",
    gender: "",
    merchandisingclass: "",
    assetypes: "",
    arrival: "",
  });
  const [newImage, setNewImage] = useState({
    files: [],
  });

  const [fetchedUsers, setFetchedUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [alertDialogContent, setAlertDialogContent] = useState({
    title: "",
    description: "",
    type: "",
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogContent, setConfirmDialogContent] = useState({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const BEARER_TOKEN = localStorage.getItem("token")
  // --- Fetch Users Function ---
  const fetchUsersMortal = async () => {
    setIsUsersLoading(true);
    setUsersError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      });
      setFetchedUsers(response.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsersError(
        "Failed to load users. Please check your network or API token."
      );
      setFetchedUsers([]);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleUpdateImageMetadata = async () => {
    if (!selectedImage?._id) {
      setAlertDialogContent({
        title: "Error",
        description: "No image selected for update.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }

    try {
      const payload = {
        assetType: editedMetadata.assetType,
        merchandisingClass: editedMetadata.merchandisingClass,
        sku: editedMetadata.sku, // Include SKU in payload
        barcode: editedMetadata.barcode, // Include Barcode in payload
        // Add any other fields you want to update that are on the image
      };

      const response = await axios.put(
        `${API_BASE_URL}/admin/images/${selectedImage._id}`, // Assuming an API endpoint for updating image metadata
        payload,
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setAlertDialogContent({
          title: "Success",
          description: "Image metadata updated successfully!",
          type: "success",
        });
        setIsAlertDialogOpen(true);
        setOpenImageDetailModal(false); // Close the modal
        setIsEditingMetadata(false); // Exit edit mode
        await fetchAllSessions(); // Re-fetch data to reflect changes
      }
    } catch (error) {
      console.error("Failed to update image metadata:", error);
      setAlertDialogContent({
        title: "API Error",
        description:
          error.response?.data?.message ||
          "Failed to update image metadata. Please try again.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
    }
  };

  // --- Fetch ALL Sessions and their data (no filters applied here) ---
  const fetchAllSessions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/sessions`, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      });

      if (response.status === 200) {
        const fetchedSessionsPromises = response.data.shootingSessions.map(
          async (session) => {
            const assignedUserObj = fetchedUsers.find(
              (user) => user._id === session.assignedUser
            );
            const assignedUserName = assignedUserObj
              ? assignedUserObj.name
              : "Unknown User";

            const shootingListsFromSession =
              session.shootingListIDs && Array.isArray(session.shootingListIDs)
                ? session.shootingListIDs.filter((list) => list && list._id)
                : [];

            const shootingListsWithFetchedImagesPromises =
              shootingListsFromSession.map(async (list) => {
                try {
                  const imagesResponse = await axios.get(
                    `${API_BASE_URL}/admin/images/${list._id}`,
                    {
                      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
                    }
                  );
                  return {
                    ...list,
                    images: imagesResponse.data.imagesData || [],
                  };
                } catch (imageError) {
                  console.error(
                    `Failed to fetch images for shooting list ID ${list._id}:`,
                    imageError.response?.data?.msg || imageError.message
                  );
                  return { ...list, images: [] };
                }
              });

            const shootingListsWithFetchedImages = await Promise.all(
              shootingListsWithFetchedImagesPromises
            );

            return {
              _id: session._id,
              name: session.name,
              assignedUser: session.assignedUser,
              user: assignedUserName,
              title: session.name,
              shootingLists: shootingListsWithFetchedImages,
            };
          }
        );

        const fullyPopulatedSessions = await Promise.all(
          fetchedSessionsPromises
        );
        console.log(fullyPopulatedSessions);
        // Store the full, unfiltered data
        setAllSessions(fullyPopulatedSessions);
      }
    } catch (error) {
      console.error("Failed to fetch sessions (overall):", error);
      setAlertDialogContent({
        title: "API Error",
        description:
          error.response?.data?.message || "Failed to load sessions.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      setAllSessions([]); // Clear all sessions on error
    }
  };

  // --- Initial Data Load (Users and then all Sessions) ---
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchUsersMortal();
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (fetchedUsers.length > 0 || !isUsersLoading) {
      fetchAllSessions(); // Fetch all sessions once users are ready
    }
  }, [fetchedUsers, isUsersLoading]);

  // --- Filter Logic (using useMemo for performance) ---
  const filterSessions = useMemo(() => {
    let filtered = allSessions;

    // Apply filters based on appliedFilters prop
    if (Object.keys(appliedFilters).length > 0) {
      // Example: Filter by SKU (individual input or bulk)
      if (appliedFilters.skuFilter || appliedFilters.bulkSkuCodes) {
        const targetSkus = new Set(
          (appliedFilters.skuFilter ? [appliedFilters.skuFilter] : [])
            .concat(
              appliedFilters.bulkSkuCodes
                ? appliedFilters.bulkSkuCodes.split(/\r?\n/).filter(Boolean)
                : []
            )
            .map((s) => s.toLowerCase())
        );

        if (targetSkus.size > 0) {
          console.log("mukesh ambani");
          console.log(filtered);
          filtered = filtered.filter((session) =>
            session.shootingLists.some((list) =>
              targetSkus.has(list.sku.toLowerCase())
            )
          );
          console.log(filtered);
        }
      }

      // Example: Filter by Barcode
      if (appliedFilters.barcodeFilter || appliedFilters.bulkBarcodeCodes) {
        const targetBarcodes = new Set(
          (appliedFilters.barcodeFilter ? [appliedFilters.barcodeFilter] : [])
            .concat(
              appliedFilters.bulkBarcodeCodes
                ? appliedFilters.bulkBarcodeCodes.split(/\r?\n/).filter(Boolean)
                : []
            )
            .map((b) => b.toLowerCase())
        );

        if (targetBarcodes.size > 0) {
          filtered = filtered.filter((session) =>
            session.shootingLists.some((list) =>
              targetBarcodes.has(list.barcode.toLowerCase())
            )
          );
        }
      }

      // Example: Filter by Farfetch ID (if you have it on your lists)
      if (
        appliedFilters.farfetchIdFilter ||
        appliedFilters.bulkFarfetchIdCodes
      ) {
        const targetFarfetchIds = new Set(
          (appliedFilters.farfetchIdFilter
            ? [appliedFilters.farfetchIdFilter]
            : []
          )
            .concat(
              appliedFilters.bulkFarfetchIdCodes
                ? appliedFilters.bulkFarfetchIdCodes
                    .split(/\r?\n/)
                    .filter(Boolean)
                : []
            )
            .map((id) => id.toLowerCase())
        );
        if (targetFarfetchIds.size > 0) {
          filtered = filtered.filter((session) =>
            session.shootingLists.some(
              (list) =>
                targetFarfetchIds.has((list.farfetchId || "").toLowerCase()) // Assuming lists might have farfetchId
            )
          );
        }
      }

      // Filter by Merchandising Classes (assuming lists have a merchandisingClass field)
      if (appliedFilters.selectedMerchandisingClasses?.length > 0) {
        const selectedClasses = new Set(
          appliedFilters.selectedMerchandisingClasses.map((c) =>
            c.toLowerCase()
          )
        );
        filtered = filtered.filter((session) =>
          session.shootingLists.some((list) =>
            selectedClasses.has((list.merchandisingClass || "").toLowerCase())
          )
        );
      }

      // Filter by Seasons (assuming sessions or lists have a season field)
      if (appliedFilters.selectedSeasons?.length > 0) {
        const selectedSeasons = new Set(
          appliedFilters.selectedSeasons.map((s) => s.toLowerCase())
        );
        filtered = filtered.filter((session) =>
          session.shootingLists.some(
            (list) => selectedSeasons.has((list.season || "").toLowerCase()) // Assuming lists might have season
          )
        );
      }

      // Filter by Genders
      if (appliedFilters.selectedGenders?.length > 0) {
        const selectedGenders = new Set(
          appliedFilters.selectedGenders.map((g) => g.toLowerCase())
        );
        filtered = filtered.filter((session) =>
          session.shootingLists.some((list) =>
            selectedGenders.has((list.gender || "").toLowerCase())
          )
        );
      }

      // Filter by Asset Types (this would typically be a property of the image itself,
      // or a category for the shooting list, depending on your schema.
      // For this example, let's assume it's a property of the image.
      // This filter is more complex as it needs to look deeply into nested images.
      if (appliedFilters.selectedAssetTypes?.length > 0) {
        const selectedAssetTypes = new Set(
          appliedFilters.selectedAssetTypes.map((at) => at.toLowerCase())
        );
        filtered = filtered.filter((session) =>
          session.shootingLists.some((list) =>
            list.images.some(
              (image) =>
                selectedAssetTypes.has((image.assetType || "").toLowerCase()) // Assuming image has an assetType
            )
          )
        );
      }

      // Filter by Clients (users assigned to sessions or shooting lists)
      if (appliedFilters.selectedClients?.length > 0) {
        const selectedClientIds = new Set(
          appliedFilters.selectedClients
            .map((client) => client._id)
            .filter(Boolean)
        );
        filtered = filtered.filter(
          (session) =>
            selectedClientIds.has(session.assignedUser) || // Session assigned user
            session.shootingLists.some((list) =>
              selectedClientIds.has(list.userId)
            ) // List assigned user
        );
      }
    }

    return filtered;
  }, [allSessions, appliedFilters]); // Re-run filtering when allSessions or appliedFilters change

  // Update sessionsToDisplay whenever filteredSessions changes
  useEffect(() => {
    setSessionsToDisplay(filterSessions);
  }, [filterSessions]);

  // --- Handle Add Session ---
  const handleAddSession = async () => {
    if (!newSession.name.trim() || !newSession.user) {
      setAlertDialogContent({
        title: "Validation Error",
        description: "Please fill in all session fields.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/createsession`,
        {
          name: newSession.name.trim(),
          assignedUser: newSession.user,
        },
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        setNewSession({ name: "", user: "" });
        setOpenSessionModal(false);
        // Re-fetch ALL sessions after adding a new one
        await fetchAllSessions();

        setAlertDialogContent({
          title: "Success",
          description: "Session added successfully!",
          type: "success",
        });
        setIsAlertDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to add session:", error);
      setAlertDialogContent({
        title: "API Error",
        description:
          error.response?.data?.message ||
          "Failed to add session. Please try again.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
    }
  };

  // --- Open Shooting List Modal ---
  const openShootingListModal = (sessionIndex) => {
    setShootingSessionIndex(sessionIndex);
    setShootingListForm({
      name: "",
      sku: "",
      barcode: "",
      gender: "",
      merchandisingclass: "",
      assetypes: "",
      arrival: "",
      user: "",
      images: [],
    });
    setOpenShootingModal(true);
  };

  // --- Handle Shooting List Image Upload (Local Preview - NO LONGER USED FOR DISPLAYING PERSISTED IMAGES) ---
  const handleShootingListImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setShootingListForm((prev) => ({
      ...prev,
      images: [...prev.images, ...urls],
    }));
  };

  // --- Handle Add Shooting List (API Call) ---
  const handleAddShootingList = async () => {
    if (!shootingListForm.name.trim() || !shootingListForm.user) {
      setAlertDialogContent({
        title: "Validation Error",
        description:
          "Please fill in Name, User, and Arrival Status for the shooting list.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }

    const currentSessionId = sessionsToDisplay[shootingSessionIndex]?._id; // Use sessionsToDisplay here

    if (!currentSessionId) {
      setAlertDialogContent({
        title: "Error",
        description:
          "Could not find the parent session for this shooting list.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }

    try {
      const payload = {
        sessionId: currentSessionId,
        name: shootingListForm.name.trim(),
        sku: shootingListForm.sku,
        barcode: shootingListForm.barcode,
        gender: shootingListForm.gender,
        assetypes: shootingListForm.assetypes,
        merchandisingclass: shootingListForm.merchandisingclass,
        arrival: shootingListForm.arrival,
        userId: shootingListForm.user,
      };

      const response = await axios.post(
        `${API_BASE_URL}/admin/createlist`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        setOpenShootingModal(false);
        setShootingListForm({
          name: "",
          sku: "",
          barcode: "",
          gender: "",
          assetypes: "",
          merchandisingclass: "",
          arrival: "",
          user: "",
          images: [],
        });
        // Re-fetch ALL sessions after adding a new list
        await fetchAllSessions();

        setAlertDialogContent({
          title: "Success",
          description: "Shooting list added successfully! Reloading data...",
          type: "success",
        });
        setIsAlertDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to add shooting list:", error);
      setAlertDialogContent({
        title: "API Error",
        description:
          error.response?.data?.message ||
          "Failed to add shooting list. Please try again.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
    }
  };

  // --- Handle Image Upload (API Call) ---
  const handleImageUpload = async () => {
    const {
      sessionIdx,
      listIdx,
      sku,
      barcode,
      gender,
      assetypes,
      merchandisingclass,
      arrival,
    } = imageModal; // Destructure the new properties
    if (newImage.files.length === 0) {
      setAlertDialogContent({
        title: "Validation Error",
        description: "Please select one or more image files.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }

    const shootingListId =
      sessionsToDisplay[sessionIdx].shootingLists[listIdx]._id; // Use sessionsToDisplay here

    if (!shootingListId) {
      setAlertDialogContent({
        title: "Error",
        description: "Could not find the shooting list ID to upload image.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("listId", shootingListId);
    // Append the shooting list details to the form data
    formData.append("sku", sku);
    formData.append("barcode", barcode);
    formData.append("gender", gender);
    formData.append("merchandisingclass", merchandisingclass);
    formData.append("assetypes", assetypes);
    formData.append("arrival", arrival);
    newImage.files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
        }
      );

      if (
        response.status === 201 ||
        (response.status === 200 &&
          response.data.data &&
          response.data.data.length > 0)
      ) {
        // Re-fetch ALL sessions after uploading images
        await fetchAllSessions();

        setImageModal({ open: false, sessionIdx: null, listIdx: null });
        setNewImage({ files: [] });

        setAlertDialogContent({
          title: "Success",
          description: `${response.data.data.length} image(s) uploaded successfully! Reloading data...`,
          type: "success",
        });
        setIsAlertDialogOpen(true);
      } else {
        setAlertDialogContent({
          title: "Upload Error",
          description:
            "Image upload response was unexpected. No images returned.",
          type: "error",
        });
        setIsAlertDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      setAlertDialogContent({
        title: "API Error",
        description:
          error.response?.data?.msg ||
          "Failed to upload image. Please try again.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Digital Asset Management</h1>
        <Dialog open={openSessionModal} onOpenChange={setOpenSessionModal}>
          <DialogTrigger asChild>
            <Button>Add Session</Button>
          </DialogTrigger>
          <DialogContent className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add New Session</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="session-name">Session Name</Label>
              <Input
                id="session-name"
                value={newSession.name}
                onChange={(e) =>
                  setNewSession({ ...newSession, name: e.target.value })
                }
                placeholder="Enter session title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assign-user">Assign User</Label>
              <Select
                onValueChange={(value) =>
                  setNewSession({ ...newSession, user: value })
                }
                value={newSession.user}
                disabled={isUsersLoading || usersError}
              >
                <SelectTrigger id="assign-user">
                  <SelectValue
                    placeholder={
                      isUsersLoading
                        ? "Loading users..."
                        : usersError
                        ? "Error loading users"
                        : "Select a user"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {usersError ? (
                    <SelectItem value="error" disabled>
                      <span className="flex items-center text-red-500">
                        <XCircle className="h-4 w-4 mr-2" /> {usersError}
                      </span>
                    </SelectItem>
                  ) : fetchedUsers.length === 0 && !isUsersLoading ? (
                    <SelectItem value="no-users" disabled>
                      No users found
                    </SelectItem>
                  ) : (
                    fetchedUsers.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name} (ID: {user._id})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleAddSession}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Add Shooting List Modal */}
      <Dialog open={openShootingModal} onOpenChange={setOpenShootingModal}>
        <DialogContent className="space-y-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Shooting List</DialogTitle>
          </DialogHeader>

          {["name", "sku", "barcode", "gender"].map((field) => (
            <div key={field} className="space-y-2">
              <Label htmlFor={`shooting-${field}`}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Label>
              <Input
                id={`shooting-${field}`}
                value={shootingListForm[field]}
                onChange={(e) =>
                  setShootingListForm({
                    ...shootingListForm,
                    [field]: e.target.value,
                  })
                }
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="arrival-status">Select Merchandising Class</Label>
            <Select
              onValueChange={(value) =>
                setShootingListForm({
                  ...shootingListForm,
                  merchandisingclass: value,
                })
              }
              value={shootingListForm.merchandisingclass}
            >
              <SelectTrigger id="arrival-status">
                <SelectValue placeholder="Select Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOCKS">SOCKS</SelectItem>
                <SelectItem value="SET UNDERWEAR">SET UNDERWEAR</SelectItem>
                <SelectItem value="SCARF">SCARF</SelectItem>
                <SelectItem value="SMALL LEATHER GOODS">
                  SMALL LEATHER GOODS
                </SelectItem>
                <SelectItem value="SUNGLASSES">SUNGLASSES</SelectItem>
                <SelectItem value="TIES">TIES</SelectItem>
                <SelectItem value="TOWEL">TOWEL</SelectItem>
                <SelectItem value="RTW (READY-TO-WEAR)">
                  RTW (READY-TO-WEAR)
                </SelectItem>
                <SelectItem value="ACCESSORIES">ACCESSORIES</SelectItem>
                <SelectItem value="GLOVES">GLOVES</SelectItem>
                <SelectItem value="JEWELRY">JEWELRY</SelectItem>
                <SelectItem value="KEY CHAINS">KEY CHAINS</SelectItem>
                <SelectItem value="PAPILLONS">PAPILLONS</SelectItem>
                <SelectItem value="RINGS">RINGS</SelectItem>
                <SelectItem value="BAGS">BAGS</SelectItem>
                <SelectItem value="BELTS">BELTS</SelectItem>
                <SelectItem value="SHOES">SHOES</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shooting-list-assign-user">Assign User</Label>
            <Select
              onValueChange={(value) =>
                setShootingListForm({ ...shootingListForm, user: value })
              }
              value={shootingListForm.user}
              disabled={isUsersLoading || usersError}
            >
              <SelectTrigger id="shooting-list-assign-user">
                <SelectValue
                  placeholder={
                    isUsersLoading
                      ? "Loading users..."
                      : usersError
                      ? "Error loading users"
                      : "Select a user"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {usersError ? (
                  <SelectItem value="error" disabled>
                    <span className="flex items-center text-red-500">
                      <XCircle className="h-4 w-4 mr-2" /> {usersError}
                    </span>
                  </SelectItem>
                ) : fetchedUsers.length === 0 && !isUsersLoading ? (
                  <SelectItem value="no-users" disabled>
                    No users found
                  </SelectItem>
                ) : (
                  fetchedUsers.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} (ID: {user._id})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="arrival-status">Select Asset Type</Label>
            <Select
              onValueChange={(value) =>
                setShootingListForm({ ...shootingListForm, assetypes: value })
              }
              value={shootingListForm.assetypes}
            >
              <SelectTrigger id="arrival-status">
                <SelectValue placeholder="Select Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="On Model">On Model</SelectItem>
                <SelectItem value="Ghost">Ghost</SelectItem>
                <SelectItem value="Still Life">Still Life</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upload-images">Upload Images</Label>
            <Input
              id="upload-images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleShootingListImageUpload}
            />
            <div className="grid grid-cols-3 gap-2 pt-2">
              {shootingListForm.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className="w-full h-24 object-cover rounded"
                  alt={`Preview ${idx}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleAddShootingList}>Add</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Image with Metadata Modal */}
      <Dialog
        open={imageModal.open}
        onOpenChange={(val) => setImageModal({ ...imageModal, open: val })}
      >
        <DialogContent className="space-y-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Images</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="image-files">Image Files</Label>
            <Input
              id="image-files"
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setNewImage({
                  ...newImage,
                  files: Array.from(e.target.files),
                })
              }
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleImageUpload}>Upload</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sessions & Shooting Lists Display */}
      {sessionsToDisplay.length > 0 ? ( // Use sessionsToDisplay for rendering
        sessionsToDisplay.map((session, sIdx) => (
          <Card key={session._id || sIdx} className="mb-6 bg-white shadow-md">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-semibold">{session.title}</h2>
                  <p className="text-sm text-gray-500">
                    Assigned to: {session.user}
                  </p>
                </div>
                <Button onClick={() => openShootingListModal(sIdx)}>
                  Add Shooting List
                </Button>
              </div>

              {session.shootingLists.length === 0 ? (
                <div className="py-4 text-center text-gray-500">
                  No shooting lists for this session yet.
                </div>
              ) : (
                session.shootingLists.map((list, lIdx) => (
                  <div
                    key={list._id || lIdx}
                    className="border-t border-gray-300 pt-3 mb-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="text-lg font-medium">{list.name}</h3>
                        <p className="text-sm text-gray-600">
                          SKU: {list.sku} | Gender: {list.gender} | Asset Type:{" "}
                          {list?.assetypes}
                        </p>
                        <p className="text-sm text-gray-600">
                          Barcode: {list.barcode} | Merchandising Class:{" "}
                          {list.merchandisingclass} | Status: {list.arrival}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          setImageModal({
                            open: true,
                            sessionIdx: sIdx,
                            listIdx: lIdx,
                            sku: list.sku,
                            barcode: list.barcode,
                            gender: list.gender,
                            merchandisingclass: list.merchandisingclass,
                            assetypes: list.assetypes,
                            arrival: list.arrival,
                          })
                        }
                      >
                        Add Image
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {list.images && list.images.length > 0 ? (
                        list.images.map((img, iIdx) => {
                          // Determine the background color class based on the image status
                          let statusBgClass = "bg-gray-500"; // Default color if status is not matched
                          switch (img.status) {
                            case "SHOT":
                              statusBgClass = "bg-red-600"; // Red for SHOT
                              break;
                            case "IN PROGRESS":
                              statusBgClass = "bg-orange-500"; // Orange for IN PROGRESS
                              break;
                            case "APPROVED":
                              statusBgClass = "bg-green-600"; // Green for APPROVED
                              break;
                            case "DELIVERED":
                              statusBgClass = "bg-blue-600"; // Blue for DELIVERED
                              break;
                            default:
                              statusBgClass = "bg-gray-500"; // Fallback for unknown status
                          }

                          return (
                            <div
                              key={img._id || iIdx}
                              className="rounded-lg border p-2 bg-white cursor-pointer relative"
                              onClick={() => {
                                setSelectedImage(img);
                                setEditedMetadata({
                                  ...img,
                                  assetType: img.assetType || "",
                                  merchandisingClass:
                                    img.merchandizingClass || "", // Fix: Check for typo if 'merchandizingClass' is used elsewhere
                                });
                                setIsEditingMetadata(false);
                                setOpenImageDetailModal(true);
                              }}
                            >
                              <img
                                src={img.imageURL}
                                alt={`Image ${iIdx}`}
                                className="rounded-lg w-full h-32 object-cover"
                              />

                              {/* Image Status Tablet with Dynamic Color */}
                              {img.status && ( // Only render if img.status exists
                                <div
                                  className={`
              absolute top-2 right-2
              ${statusBgClass} text-white
              px-2 py-1 rounded-md
              text-xs font-medium
              shadow-md
            `}
                                >
                                  {img.status}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full text-center text-gray-500 text-sm py-2">
                          No images for this list yet.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-md border shadow-sm">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <div className="text-lg font-medium mb-2">No sessions found</div>
          <p className="text-sm text-muted-foreground">
            Click "Add Session" to create a new session.
          </p>
          {/* Display a message if no sessions due to filters */}
          {Object.keys(appliedFilters).length > 0 &&
            Object.values(appliedFilters).some(
              (val) =>
                (Array.isArray(val) && val.length > 0) ||
                (typeof val === "string" && val.trim() !== "")
            ) && (
              <p className="text-sm text-muted-foreground mt-2">
                (Try adjusting your filters, no sessions match the current
                criteria.)
              </p>
            )}
        </div>
      )}
      {/* Custom Alert/Success Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {alertDialogContent.type === "success" ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              {alertDialogContent.title}
            </DialogTitle>
            <DialogDescription>
              {alertDialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsAlertDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Confirmation Dialog (optional, for future use) */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{confirmDialogContent.title}</DialogTitle>
            <DialogDescription>
              {confirmDialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                confirmDialogContent.onConfirm();
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openImageDetailModal}
        onOpenChange={setOpenImageDetailModal}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
            <DialogDescription>
              View and edit metadata for this image.
            </DialogDescription>
          </DialogHeader>

          {selectedImage && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:w-1/2 flex justify-center items-center">
                <img
                  src={selectedImage.imageURL}
                  alt="Selected Image"
                  className="max-w-full max-h-[400px] object-contain rounded-lg shadow-md"
                />
              </div>

              <div className="md:w-1/2 space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Metadata
                </h3>

                {!isEditingMetadata ? (
                  <div className="space-y-2">
                    {/* Display Metadata */}
                    <p>
                      <strong>Image ID:</strong> {selectedImage._id}
                    </p>
                    <p>
                      <strong>File Name:</strong> {selectedImage.fileName}
                    </p>
                    <p>
                      <strong>Original Name:</strong>{" "}
                      {selectedImage.originalName}
                    </p>
                    <p>
                      <strong>Asset Type:</strong>{" "}
                      {selectedImage.assetypes || "N/A"}
                    </p>
                    <p>
                      <strong>Merchandising Class:</strong>{" "}
                      {selectedImage.merchandisingclass || "N/A"}
                    </p>
                    <p>
                      <strong>Uploaded At:</strong>{" "}
                      {new Date(selectedImage.uploadedAt).toLocaleString()}
                    </p>
                    {/* Add any other metadata fields you have */}
                    <p>
                      <strong>SKU:</strong> {selectedImage.sku || "N/A"}
                    </p>
                    <p>
                      <strong>Barcode:</strong> {selectedImage.barcode || "N/A"}
                    </p>
                    {/* You'll need to fetch these from the parent shootingList if not directly on the image */}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Edit Metadata Form */}
                    <div className="space-y-1">
                      <Label htmlFor="edit-asset-type">Asset Type</Label>
                      <Select
                        id="edit-asset-type"
                        onValueChange={(value) =>
                          setEditedMetadata({
                            ...editedMetadata,
                            assetType: value,
                          })
                        }
                        value={editedMetadata.assetType || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Asset Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="On Model">On Model</SelectItem>
                          <SelectItem value="Ghost">Ghost</SelectItem>
                          <SelectItem value="Still Life">Still Life</SelectItem>
                          <SelectItem value="Video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="edit-merchandising-class">
                        Merchandising Class
                      </Label>
                      <Select
                        id="edit-merchandising-class"
                        onValueChange={(value) =>
                          setEditedMetadata({
                            ...editedMetadata,
                            merchandisingClass: value,
                          })
                        }
                        value={editedMetadata.merchandisingClass || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Merchandising Class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SOCKS">SOCKS</SelectItem>
                          <SelectItem value="SET UNDERWEAR">
                            SET UNDERWEAR
                          </SelectItem>
                          <SelectItem value="SCARF">SCARF</SelectItem>
                          <SelectItem value="SMALL LEATHER GOODS">
                            SMALL LEATHER GOODS
                          </SelectItem>
                          <SelectItem value="SUNGLASSES">SUNGLASSES</SelectItem>
                          <SelectItem value="TIES">TIES</SelectItem>
                          <SelectItem value="TOWEL">TOWEL</SelectItem>
                          <SelectItem value="RTW (READY-TO-WEAR)">
                            RTW (READY-TO-WEAR)
                          </SelectItem>
                          <SelectItem value="ACCESSORIES">
                            ACCESSORIES
                          </SelectItem>
                          <SelectItem value="GLOVES">GLOVES</SelectItem>
                          <SelectItem value="JEWELRY">JEWELRY</SelectItem>
                          <SelectItem value="KEY CHAINS">KEY CHAINS</SelectItem>
                          <SelectItem value="PAPILLONS">PAPILLONS</SelectItem>
                          <SelectItem value="RINGS">RINGS</SelectItem>
                          <SelectItem value="BAGS">BAGS</SelectItem>
                          <SelectItem value="BELTS">BELTS</SelectItem>
                          <SelectItem value="SHOES">SHOES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* --- NEW: SKU Input --- */}
                    <div className="space-y-1">
                      <Label htmlFor="edit-sku">SKU</Label>
                      <Input
                        id="edit-sku"
                        value={editedMetadata.sku || ""}
                        onChange={(e) =>
                          setEditedMetadata({
                            ...editedMetadata,
                            sku: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* --- NEW: Barcode Input --- */}
                    <div className="space-y-1">
                      <Label htmlFor="edit-barcode">Barcode</Label>
                      <Input
                        id="edit-barcode"
                        value={editedMetadata.barcode || ""}
                        onChange={(e) =>
                          setEditedMetadata({
                            ...editedMetadata,
                            barcode: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Add other editable fields here (e.g., Input for custom tags) */}
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  {!isEditingMetadata ? (
                    <Button onClick={() => setIsEditingMetadata(true)}>
                      Edit Metadata
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditingMetadata(false);
                          setEditedMetadata(selectedImage); // Revert changes
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleUpdateImageMetadata}>
                        Save Changes
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
