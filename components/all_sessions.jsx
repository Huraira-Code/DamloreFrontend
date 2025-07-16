"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "@/API_BASE_URL";
export default function AllSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const fetchSessions = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/user/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSessions(response.data.shootingSession);
      console.log("Fetched sessions:", response.data.shootingSession);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.msg ||
          "Something went wrong while fetching sessions."
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSessions(); // call it from inside useEffect
  }, []);

  const updateImageStatus = async (imageId, newStatus, comment) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/user/rejectImage/${imageId}`,
        { status: newStatus, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Refresh the sessions after status update
      fetchSessions();
      setSelectedImage(false); // Close the modal after update
      alert("Image status updated successfully.");
    } catch (err) {
      console.error("Failed to update image status:", err);
      alert("Error updating status.");
    }
  };

  const updateImageSuccessStatus = async (imageId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/user/send/${imageId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Refresh the sessions after status update
      fetchSessions();
      setSelectedImage(false); // Close the modal after update
      alert("Image status updated successfully.");
    } catch (err) {
      console.error("Failed to update image status:", err);
      alert("Error updating status.");
    }
  };

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">All Shooting Sessions</h2>
      {sessions.length === 0 ? (
        <p>No sessions assigned to you.</p>
      ) : (
        <ul className="space-y-6">
          {sessions.map((session) => (
            <li key={session._id} className="p-4 border rounded shadow">
              <h3 className="text-lg font-bold mb-2">{session.name}</h3>

              <div
                key={session._id}
                className="p-3 mb-4 border rounded bg-gray-50"
              >
                <p>
                  <strong>Barcode:</strong> {session.barcode}
                </p>
                <p>
                  <strong>Gender:</strong> {session.gender}
                </p>
                <p>
                  <strong>Class:</strong> {session.merchandisingclass}
                </p>
                <p>
                  <strong>Asset Type:</strong> {session.assetypes}
                </p>
                <p>
                  <strong>Arrival:</strong> {session.arrival || "Not set"}
                </p>

                {session.imageIDs?.length > 0 && (
                  <div className="mt-3">
                    <strong>Images:</strong>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                      {session.imageIDs
                        .filter(
                          (img) =>
                            img.status === "READY" ||
                            img.status === "IN PROGRESS" ||
                            img.status === "DELIVERED"
                        )
                        .map((img) => (
                          <div
                            key={img._id}
                            className="text-center cursor-pointer"
                            onClick={() => setSelectedImage(img)}
                          >
                            <img
                              src={img.imageURL}
                              alt="session"
                              className="w-full h-32 object-cover rounded hover:scale-105 transition-transform"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                              {img.status}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-2xl relative"
            onClick={(e) => e.stopPropagation()} // prevent closing on content click
            style={{ height: "90%", overflowY: "scroll" }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-xl font-bold text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
            <img
              src={selectedImage.imageURL}
              alt="Full"
              className="w-full h-80 object-contain mb-4 rounded"
            />
            <div className="space-y-2 text-sm">
              <p>
                <strong>Status:</strong> {selectedImage.status}
              </p>
              <p>
                <strong>SKU:</strong> {selectedImage.sku}
              </p>
              <p>
                <strong>Barcode:</strong> {selectedImage.barcode}
              </p>
              <p>
                <strong>Gender:</strong> {selectedImage.gender}
              </p>
              <p>
                <strong>Class:</strong> {selectedImage.merchandisingclass}
              </p>
              <p>
                <strong>Asset Type:</strong> {selectedImage.assetypes}
              </p>
              <p>
                <strong>Arrival:</strong> {selectedImage.arrival || "Not set"}
              </p>
              <div>
                {selectedImage.versionHistory?.length > 0 && (
                  <div className="mt-4">
                    <strong className="block text-sm font-semibold mb-1">
                      Comments History:
                    </strong>
                    <ul className="list-disc ml-6 space-y-1 text-sm text-gray-700">
                      {selectedImage.versionHistory
                        .sort((a, b) => a.versionNumber - b.versionNumber) // Optional: sort by versionNumber
                        .map((version, idx) => (
                          <li key={idx}>
                            V{version.versionNumber}:{" "}
                            {version.reason || "No comment"}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {/* Add Comment Input */}
                <div className="mt-2">
                  <label className="block text-sm font-semibold">Comment</label>
                  <textarea
                    placeholder="Add a comment before rejecting..."
                    value={selectedImage.comment || ""}
                    onChange={(e) =>
                      setSelectedImage({
                        ...selectedImage,
                        comment: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded text-sm"
                    rows={3}
                  ></textarea>
                </div>
              </div>

              {/* Action Buttons: only if status is READY and comment exists */}
              {selectedImage.status === "READY" && (
                <div className="mt-4 flex justify-center gap-2">
                  <button
                    onClick={() =>
                      updateImageSuccessStatus(selectedImage._id, "DELIVERED")
                    }
                    className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600"
                  >
                    Mark as Delivered
                  </button>

                  {/* Only show Reject if comment exists */}
                  {selectedImage.comment?.trim() && (
                    <button
                      onClick={() =>
                        updateImageStatus(
                          selectedImage._id,
                          "IN PROGRESS",
                          selectedImage.comment
                        )
                      }
                      className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
