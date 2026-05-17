// App.js

import React, { useState, useEffect } from "react";
import "./App.css";

import PotholeMap from "./PotholeMap";
import LiveCamera from "./LiveCamera";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

// Backend URL
const API_BASE = "https://laisa1-pothole-patrol-backend.hf.space";

// Local backend
// const API_BASE = "http://127.0.0.1:5000";

function App() {
  // Navigation
  const [currentPage, setCurrentPage] = useState("home");

  // Admin auth
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem("adminToken") || null
  );

  // Global stats
  const [globalStats, setGlobalStats] = useState({
    total: 0,
    pending: 0,
    fixed: 0,
  });

  // Refresh trigger for map
  const [mapRefreshKey, setMapRefreshKey] = useState(0);

  // Upload states
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Location
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");

  // Email notification
  const [email, setEmail] = useState("");

  // ---------------- FETCH GLOBAL STATS ----------------

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reports?page=1&limit=1`
      );

      const data = await response.json();

      if (response.ok) {
        setGlobalStats({
          total: data.metadata.total_reports,
          pending: data.metadata.total_pending,
          fixed: data.metadata.total_fixed,
        });
      }
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentPage, mapRefreshKey]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // ---------------- IMAGE SELECT ----------------

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResults(null);
  };

  // ---------------- LOCATION ----------------

  const getLocation = () => {
    setLocationStatus("Locating...");

    if (!navigator.geolocation) {
      setLocationStatus("Geolocation unsupported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setLocationStatus("📍 Location captured");
      },
      () => {
        setLocationStatus("❌ Location unavailable");
      }
    );
  };

  // ---------------- IMAGE UPLOAD ----------------

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", image);
      formData.append("source", "upload");

      if (location) {
        formData.append("latitude", location.lat);
        formData.append("longitude", location.lng);
      }

      if (email.trim()) {
        formData.append("email", email);
      }

      const response = await fetch(`${API_BASE}/api/detect`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      setResults(data);

      fetchStats();

      setMapRefreshKey((prev) => prev + 1);

      if (data.message) {
        alert("Report submitted successfully");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="App">

      {/* NAVBAR */}

      <nav className="navbar">

        <div
          className="nav-brand"
          onClick={() => setCurrentPage("home")}
        >
          <span>🚧</span>
          <h1>Pothole Patrol</h1>
        </div>

        <div className="nav-stats">
          <div>Total: {globalStats.total}</div>
          <div>Fixed: {globalStats.fixed}</div>
          <div>Pending: {globalStats.pending}</div>
        </div>

      </nav>

      <main className="main-content">

        {/* HOME */}

        {currentPage === "home" && (

          <div className="hero-section page-container">

            <h2>
              Making Roads <span>Safer</span> with AI
            </h2>

            <div className="circle-nav-grid">

              <div onClick={() => setCurrentPage("upload")}>
                📤 Manual Report
              </div>

              <div onClick={() => setCurrentPage("live")}>
                📷 Live Camera
              </div>

              <div onClick={() => setCurrentPage("map")}>
                🗺️ Map
              </div>

              <div onClick={() => setCurrentPage("admin")}>
                🔐 Admin
              </div>

            </div>

          </div>
        )}

        {/* UPLOAD PAGE */}

        {currentPage === "upload" && (

          <div className="page-container">

            <button onClick={() => setCurrentPage("home")}>
              ← Back
            </button>

            <div className="upload-section">

              <h2>Report Pothole</h2>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              <input
                type="email"
                placeholder="Enter email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button onClick={getLocation}>
                📍 Get Location
              </button>

              <p>{locationStatus}</p>

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: "100%" }}
                />
              )}

              <button
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Detect"}
              </button>

            </div>

            {results && (

              <div className="results-section">

                <h2>Results</h2>

                <h3>
                  Detected: {results.pothole_count}
                </h3>

                {results.output_image && (
                  <div>

                    <p>AI Detection</p>

                    <img
                      src={`data:image/jpeg;base64,${results.output_image}`}
                      alt="AI Detection"
                      style={{
                        width: "100%",
                        border: "2px dashed gold",
                      }}
                    />

                  </div>
                )}

                {results.image_url && (
                  <div>

                    <p>Uploaded Image</p>

                    <img
                      src={results.image_url}
                      alt="Uploaded"
                      style={{ width: "100%" }}
                    />

                  </div>
                )}

              </div>

            )}

          </div>

        )}

        {/* LIVE CAMERA */}

        {currentPage === "live" && (

          <LiveCamera
            onPotholeLogged={() => {
              fetchStats();
              setMapRefreshKey((prev) => prev + 1);
            }}
          />

        )}

        {/* MAP */}

        {currentPage === "map" && (

          <PotholeMap
            userLocation={location}
            refreshTrigger={mapRefreshKey}
          />

        )}

        {/* ADMIN */}

        {currentPage === "admin" && (

          <>
            {!adminToken ? (

              <AdminLogin
                onLoginSuccess={(token) => {
                  setAdminToken(token);
                  localStorage.setItem(
                    "adminToken",
                    token
                  );
                }}
              />

            ) : (

              <AdminDashboard token={adminToken} />

            )}
          </>

        )}

      </main>

    </div>
  );
}

export default App;