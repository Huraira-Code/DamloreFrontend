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

export default function DigitalAssetManagementPage({ appliedFilters = {} }) {
  // Store the full, unfiltered sessions data
  const [allSessions, setAllSessions] = useState([]);
  // Use this state to display sessions, which will be filtered
  const [sessionsToDisplay, setSessionsToDisplay] = useState([]);

  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [newSession, setNewSession] = useState({ name: "", user: "" });

  const [openShootingModal, setOpenShootingModal] = useState(false);
  const [shootingSessionIndex, setShootingSessionIndex] = useState(null);
  const [shootingListForm, setShootingListForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    gender: "",
    size: "",
    dimension: "",
    arrival: "",
    user: "",
    images: [],
  });

  const [imageModal, setImageModal] = useState({
    open: false,
    sessionIdx: null,
    listIdx: null,
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

  const API_BASE_URL = "https://damlorefinal.vercel.app";
  const BEARER_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODQxMzNiZjA3MGVjMjY0NThlOTIxZjYiLCJlbWFpbCI6Imh1cmFpcmFzaGFoaWQwMDBAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzQ5MTAzNTk5LCJleHAiOjE3NTE2OTU1OTl9.ZvZr2jE2pEpxMnn4bYKdkqY1GoDmhts2zCecekHbbSA";

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
          console.log("mukesh ambani")
          console.log(filtered)
          filtered = filtered.filter((session) =>
            session.shootingLists.some((list) =>
              targetSkus.has(list.sku.toLowerCase())
            )
          );
          console.log(filtered)
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
      if (appliedFilters.farfetchIdFilter || appliedFilters.bulkFarfetchIdCodes) {
        const targetFarfetchIds = new Set(
          (appliedFilters.farfetchIdFilter ? [appliedFilters.farfetchIdFilter] : [])
            .concat(
              appliedFilters.bulkFarfetchIdCodes
                ? appliedFilters.bulkFarfetchIdCodes.split(/\r?\n/).filter(Boolean)
                : []
            )
            .map((id) => id.toLowerCase())
        );
        if (targetFarfetchIds.size > 0) {
            filtered = filtered.filter(session =>
                session.shootingLists.some(list =>
                    targetFarfetchIds.has((list.farfetchId || '').toLowerCase()) // Assuming lists might have farfetchId
                )
            );
        }
      }

      // Filter by Merchandising Classes (assuming lists have a merchandisingClass field)
      if (appliedFilters.selectedMerchandisingClasses?.length > 0) {
        const selectedClasses = new Set(
          appliedFilters.selectedMerchandisingClasses.map((c) => c.toLowerCase())
        );
        filtered = filtered.filter((session) =>
          session.shootingLists.some((list) =>
            selectedClasses.has((list.merchandisingClass || '').toLowerCase())
          )
        );
      }

      // Filter by Seasons (assuming sessions or lists have a season field)
      if (appliedFilters.selectedSeasons?.length > 0) {
        const selectedSeasons = new Set(
          appliedFilters.selectedSeasons.map((s) => s.toLowerCase())
        );
        filtered = filtered.filter((session) =>
          session.shootingLists.some((list) =>
            selectedSeasons.has((list.season || '').toLowerCase()) // Assuming lists might have season
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
            selectedGenders.has((list.gender || '').toLowerCase())
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
            list.images.some((image) =>
              selectedAssetTypes.has((image.assetType || '').toLowerCase()) // Assuming image has an assetType
            )
          )
        );
      }

      // Filter by Clients (users assigned to sessions or shooting lists)
      if (appliedFilters.selectedClients?.length > 0) {
          const selectedClientIds = new Set(
              appliedFilters.selectedClients.map(client => client._id).filter(Boolean)
          );
          filtered = filtered.filter(session =>
              selectedClientIds.has(session.assignedUser) || // Session assigned user
              session.shootingLists.some(list => selectedClientIds.has(list.userId)) // List assigned user
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
      size: "",
      dimension: "",
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
    if (
      !shootingListForm.name.trim() ||
      !shootingListForm.user ||
      !shootingListForm.arrival
    ) {
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
        size: shootingListForm.size,
        dimension: shootingListForm.dimension,
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
          size: "",
          dimension: "",
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
    const { sessionIdx, listIdx } = imageModal;

    if (newImage.files.length === 0) {
      setAlertDialogContent({
        title: "Validation Error",
        description: "Please select one or more image files.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }

    const shootingListId = sessionsToDisplay[sessionIdx].shootingLists[listIdx]._id; // Use sessionsToDisplay here

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

          {["name", "sku", "barcode", "gender", "size", "dimension"].map(
            (field) => (
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
            )
          )}

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
            <Label htmlFor="arrival-status">Arrival Status</Label>
            <Select
              onValueChange={(value) =>
                setShootingListForm({ ...shootingListForm, arrival: value })
              }
              value={shootingListForm.arrival}
            >
              <SelectTrigger id="arrival-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arrival">Arrival</SelectItem>
                <SelectItem value="non-arrival">Non-arrival</SelectItem>
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
                          SKU: {list.sku} | Gender: {list.gender} | Size:{" "}
                          {list.size}
                        </p>
                        <p className="text-sm text-gray-600">
                          Barcode: {list.barcode} | Dimension: {list.dimension}{" "}
                          | Status: {list.arrival}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          setImageModal({
                            open: true,
                            sessionIdx: sIdx,
                            listIdx: lIdx,
                          })
                        }
                      >
                        Add Image
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {list.images && list.images.length > 0 ? (
                        list.images.map((img, iIdx) => (
                          <div
                            key={img._id || iIdx}
                            className="rounded-lg border p-2 bg-white"
                          >
                            <img
                              src={img.imageURL}
                              alt={`Image ${iIdx}`}
                              className="rounded-lg w-full h-32 object-cover"
                            />
                          </div>
                        ))
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
    </main>
  );
}