"use client";

import { useState, useEffect } from "react";
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

export default function DigitalAssetManagementPage() {
  const [sessions, setSessions] = useState([]);
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
    user: "", // This will hold the assigned user ID
    images: [], // This is for local preview, actual images will be uploaded separately
  });

  const [imageModal, setImageModal] = useState({
    open: false,
    sessionIdx: null,
    listIdx: null,
  });
  // Changed newImage state to hold an array of files
  const [newImage, setNewImage] = useState({
    files: [], // Now an array for multiple files
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

  // --- Fetch Sessions Function (Updated to fetch images) ---
  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/sessions`, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      });

      if (response.status === 200) {
        // Use Promise.all to process all sessions concurrently
        const fetchedSessionsPromises = response.data.shootingSessions.map(
          async (session) => {
            const assignedUserObj = fetchedUsers.find(
              (user) => user._id === session.assignedUser
            );
            const assignedUserName = assignedUserObj
              ? assignedUserObj.name
              : "Unknown User";

            // Ensure shootingListIDs is an array, then filter out any non-objects or those without _id
            const shootingListsFromSession =
              session.shootingListIDs && Array.isArray(session.shootingListIDs)
                ? session.shootingListIDs.filter((list) => list && list._id) // Filter valid lists
                : [];

            // Fetch images for each shooting list concurrently
            const shootingListsWithFetchedImagesPromises =
              shootingListsFromSession.map(async (list) => {
                try {
                  const imagesResponse = await axios.get(
                    `${API_BASE_URL}/admin/images/${list._id}`, // API endpoint for getting images of a list
                    {
                      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
                    }
                  );
                  console.log("Image Response", imagesResponse);
                  // The backend controller returns { status: "success", imagesData: [...] }
                  return {
                    ...list,
                    images: imagesResponse.data.imagesData || [],
                  };
                } catch (imageError) {
                  console.error(
                    `Failed to fetch images for shooting list ID ${list._id}:`,
                    imageError.response?.data?.msg || imageError.message
                  );
                  // Return the list with an empty images array on error
                  return { ...list, images: [] };
                }
              });

            // Wait for all image fetches for this session's lists to complete
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

        // Wait for all session processing (including nested image fetches) to complete
        const fullyPopulatedSessions = await Promise.all(
          fetchedSessionsPromises
        );
        console.log(
          "Fully populated sessions with images:",
          fullyPopulatedSessions
        );
        setSessions(fullyPopulatedSessions);
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
    }
  };

  // --- useEffect to fetch data on component mount ---
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchUsersMortal();
    };
    loadInitialData();
  }, []);

  // Fetch sessions only after users are loaded/checked
  useEffect(() => {
    if (fetchedUsers.length > 0 || !isUsersLoading) {
      fetchSessions();
    }
  }, [fetchedUsers, isUsersLoading]); // Dependency on fetchedUsers and loading status

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
    console.log(newSession);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/createsession`,
        {
          name: newSession.name.trim(),
          assignedUser: newSession.user, // Ensure this matches your backend field name (userId or assignedUser)
        },
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        const createdSession = response.data;

        const assignedUserObj = fetchedUsers.find(
          (user) => user._id === createdSession.assignedUser
        );
        const assignedUserName = assignedUserObj
          ? assignedUserObj.name
          : "Unknown User";

        const newSessionEntry = {
          _id: createdSession._id,
          name: createdSession.name,
          assignedUser: createdSession.assignedUser,
          user: assignedUserName,
          title: createdSession.name,
          shootingLists: [], // Initially empty, will be populated on next fetchSessions
        };

        setSessions((prevSessions) => [...prevSessions, newSessionEntry]);

        setNewSession({ name: "", user: "" });
        setOpenSessionModal(false);

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
    // Reset form when opening
    setShootingListForm({
      name: "",
      sku: "",
      barcode: "",
      gender: "",
      size: "",
      dimension: "",
      arrival: "",
      user: "",
      images: [], // This is for local preview, actual images will be uploaded separately
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
    // Client-side validation
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

    const currentSessionId = sessions[shootingSessionIndex]?._id;

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
        sessionId: currentSessionId, // From the currently selected session
        name: shootingListForm.name.trim(),
        sku: shootingListForm.sku,
        barcode: shootingListForm.barcode,
        gender: shootingListForm.gender,
        size: shootingListForm.size,
        dimension: shootingListForm.dimension,
        arrival: shootingListForm.arrival,
        userId: shootingListForm.user, // Assuming your backend expects 'userId'
      };

      console.log("Sending shooting list payload:", payload); // For debugging

      const response = await axios.post(
        `${API_BASE_URL}/admin/createlist`, // Your backend API endpoint for creating a shooting list
        payload,
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        const newShootingList = response.data; // Assuming your API returns the created shooting list

        // After successfully creating a new shooting list, re-fetch sessions
        // to get the latest data including images for the new list.
        await fetchSessions();

        setOpenShootingModal(false); // Close the modal
        setShootingListForm({
          // Reset form after successful addition
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

    // Check if any files are selected
    if (newImage.files.length === 0) {
      setAlertDialogContent({
        title: "Validation Error",
        description: "Please select one or more image files.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }

    const shootingListId = sessions[sessionIdx].shootingLists[listIdx]._id;

    // Ensure we have a valid shootingListId
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
    formData.append("listId", shootingListId); // Backend expects 'listId'

    // Append each selected file to the FormData under the 'files' key
    newImage.files.forEach((file) => {
      formData.append("files", file); // Backend expects 'files' (plural)
    });
    console.log("this is the image list", formData);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/upload`, // Assuming this is your images upload endpoint
        formData,
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            // Axios automatically sets 'Content-Type': 'multipart/form-data' for FormData
          },
        }
      );

      // The backend controller returns an object with a 'data' array containing uploaded images.
      if (
        response.status === 201 ||
        (response.status === 200 &&
          response.data.data &&
          response.data.data.length > 0)
      ) {
        // After successful image upload, re-fetch sessions to get the latest data.
        await fetchSessions();

        // Reset modal state
        setImageModal({ open: false, sessionIdx: null, listIdx: null });
        setNewImage({ files: [] }); // Reset files array

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
              {/* This section is primarily for local preview before actual list creation/image upload */}
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

      {/* Add Image with Metadata Modal (Simplified for multiple uploads) */}
      <Dialog
        open={imageModal.open}
        onOpenChange={(val) => setImageModal({ ...imageModal, open: val })}
      >
        <DialogContent className="space-y-4 max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Images</DialogTitle> {/* Changed title */}
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="image-files">Image Files</Label>{" "}
            {/* Changed label */}
            <Input
              id="image-files" // Changed ID
              type="file"
              multiple // Allows multiple file selection
              accept="image/*"
              onChange={
                (e) =>
                  setNewImage({
                    ...newImage,
                    files: Array.from(e.target.files),
                  }) // Store all selected files
              }
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleImageUpload}>Upload</Button>{" "}
            {/* Renamed function for clarity */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sessions & Shooting Lists Display */}
      {sessions.length > 0 ? (
        sessions.map((session, sIdx) => (
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

              {/* Display "No shooting lists" if the array is empty */}
              {session.shootingLists.length === 0 ? (
                <div className="py-4 text-center text-gray-500">
                  No shooting lists for this session yet.
                </div>
              ) : (
                session.shootingLists.map((list, lIdx) => (
                  <div
                    key={list._id || lIdx} // Use list._id for a stable key if available
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
                        {/* <p className="text-sm text-gray-600">
                          Assigned to:{" "}
                          {fetchedUsers.find((u) => u._id === list.user)
                            ?.name || "Unknown User"}{" "}
                          (ID: {list.user})
                        </p> */}
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
                      {/* Render images fetched from the API */}
                      {list.images && list.images.length > 0 ? (
                        list.images.map((img, iIdx) => (
                          <div
                            key={img._id || iIdx} // Use image._id for a stable key
                            className="rounded-lg border p-2 bg-white"
                          >
                            {/* Assuming img.imageURL contains the direct URL from Cloudinary */}
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
