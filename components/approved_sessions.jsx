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

  const updateImageStatus = async (imageId, newStatus) => {
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
      fetchSessions(); // Refresh data
      setSelectedImage(null); // Close modal
      alert("Image status updated successfully.");
    } catch (err) {
      console.error("Failed to update image status:", err);
      alert("Error updating status.");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (loading) return <p>Loading sessions...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Delivered Shooting Sessions</h2>
      {sessions.length === 0 ? (
        <p>No sessions assigned to you.</p>
      ) : (
        <ul className="space-y-6">
          {sessions.map((session) => (
            <li key={session._id} className="p-4 border rounded shadow">
              <h3 className="text-lg font-bold mb-2">{session.name}</h3>

              {session.shootingListIDs
                ?.filter(
                  (list) =>
                    list.imageIDs?.filter((img) => img.status === "DELIVERED")
                      .length > 0
                )
                .map((list) => (
                  <div
                    key={list._id}
                    className="p-3 mb-4 border rounded bg-gray-50"
                  >
                    <p>
                      <strong>Shooting List:</strong> {list.name}
                    </p>
                    <p>
                      <strong>SKU:</strong> {list.sku}
                    </p>
                    <p>
                      <strong>Barcode:</strong> {list.barcode}
                    </p>
                    <p>
                      <strong>Gender:</strong> {list.gender}
                    </p>
                    <p>
                      <strong>Class:</strong> {list.merchandisingclass}
                    </p>
                    <p>
                      <strong>Asset Type:</strong> {list.assetypes}
                    </p>
                    <p>
                      <strong>Arrival:</strong> {list.arrival || "Not set"}
                    </p>

                    <div className="mt-3">
                      <strong>Delivered Images:</strong>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                        {list.imageIDs
                          .filter((img) => img.status === "DELIVERED")
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
                  </div>
                ))}
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
                <strong>Comments:</strong>
                {selectedImage.comments?.length > 0 ? (
                  <ul className="list-disc ml-6 mt-1">
                    {selectedImage.comments.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="ml-2 text-gray-500">No comments</p>
                )}
              </div>

              {/* Show buttons only if image is APPROVED (not needed here, just keeping for reference) */}
              {/* {selectedImage.status === "APPROVED" && (...) } */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
