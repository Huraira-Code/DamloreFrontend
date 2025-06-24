"use client";

import { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import {
  UserPlus,
  Info,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
} from "lucide-react"; // Added CheckCircle2, XCircle for status icons
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription, // Added DialogDescription for more context in modals
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import API_BASE_URL from "@/API_BASE_URL"; // Import your API base URL
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");

  // State for custom alert/confirmation modals
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [alertDialogContent, setAlertDialogContent] = useState({
    title: "",
    description: "",
    type: "", // 'success' or 'error'
  });
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogContent, setConfirmDialogContent] = useState({
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // Placeholder for your API endpoint and Bearer Token
  // IMPORTANT: In a real application, these should be handled securely (e.g., environment variables, secure authentication flow)
  const BEARER_TOKEN = localStorage.getItem("token")
  // Function to fetch users from the API
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      });
      // Assuming the API returns an array of user objects directly
      console.log(response.data.users);
      setUsers(response.data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again.");
      setUsers([]); // Clear users on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  // Handles adding a new user
  const handleAddUser = async () => {
    if (!newUsername.trim() || !newPassword.trim() || !newEmail.trim()) {
      setAlertDialogContent({
        title: "Validation Error",
        description: "Please fill in all fields.",
        type: "error",
      });
      setIsAlertDialogOpen(true);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/signup`,
        {
          name: newUsername.trim(), // API expects 'name' for username
          password: newPassword.trim(),
          email: newEmail.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
            "Content-Type": "application/json", // Ensure content type is set
          },
        }
      );

      console.log("User added successfully:", response.data);

      // Clear form fields and close modal
      setNewUsername("");
      setNewPassword("");
      setNewEmail("");
      setIsAddUserModalOpen(false);

      await fetchUsers(); // Re-fetch users to reflect the new user

      setAlertDialogContent({
        title: "Success",
        description: "User added successfully!",
        type: "success",
      });
      setIsAlertDialogOpen(true);
    } catch (err) {
      console.error("Failed to add user:", err);
      let errorMessage = "Failed to add user. Please try again.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message; // Use specific error message from API if available
      }
      setAlertDialogContent({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
      setIsAlertDialogOpen(true);
    }
  };

  // Handles deleting a user
  const handleDeleteUser = (userId) => {
    setConfirmDialogContent({
      title: "Confirm Deletion",
      description:
        "Are you sure you want to delete this user? This action cannot be undone.",
      onConfirm: async () => {
        try {
          // In a real application, you would send a DELETE request to your API
          // await axios.delete(`${API_BASE_URL}/users/${userId}`, {
          //   headers: {
          //     Authorization: `Bearer ${BEARER_TOKEN}`,
          //   },
          // });

          // Simulate API success and then re-fetch
          console.log("Simulating API call for deleting user:", userId);
          await fetchUsers(); // Re-fetch users to reflect the deletion

          setAlertDialogContent({
            title: "Success",
            description: "User deleted successfully.",
            type: "success",
          });
          setIsAlertDialogOpen(true);
        } catch (err) {
          console.error("Failed to delete user:", err);
          setAlertDialogContent({
            title: "Error",
            description: "Failed to delete user. Please try again.",
            type: "error",
          });
          setIsAlertDialogOpen(true);
        } finally {
          setIsConfirmDialogOpen(false); // Close confirm dialog
        }
      },
    });
    setIsConfirmDialogOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Header section, similar to AssetApproval */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">User Management</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {users.length} users
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Manage application users</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4 px-4">
        {/* Action bar for adding users */}
        <div className="bg-white p-4 rounded-md border mb-4 shadow-sm flex justify-end">
          <Dialog
            open={isAddUserModalOpen}
            onOpenChange={setIsAddUserModalOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password" // Use type="password" for sensitive input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email" // Use type="email" for email input
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* User list table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-md border shadow-sm">
            <div className="loading loading-spinner loading-lg text-muted-foreground mb-4"></div>
            <div className="text-lg font-medium">Loading users...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-md border shadow-sm text-red-500">
            <XCircle className="h-12 w-12 mb-4" />
            <div className="text-lg font-medium mb-2">Error</div>
            <p className="text-sm">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchUsers}>
              Retry
            </Button>
          </div>
        ) : users.length > 0 ? (
          <div className="bg-white rounded-md border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user._id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    {/* IMPORTANT: Displaying passwords in plain text is highly insecure.
                        This is for demonstration purposes only. In a real application,
                        you would NOT display the actual password here. */}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="mr-2">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit user</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete user</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-md border shadow-sm">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <div className="text-lg font-medium mb-2">No users found</div>
            <p className="text-sm text-muted-foreground">
              Click "Add User" to create a new user.
            </p>
          </div>
        )}
      </div>

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

      {/* Custom Confirmation Dialog */}
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
    </div>
  );
}
