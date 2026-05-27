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
          <span style={{ fontSize: '1.8rem' }}>🚧</span>
          <h1>Pothole Patrol</h1>
        </div>

        <div className="nav-stats">
          <div className="stat-badge total">Total: {globalStats.total}</div>
          <div className="stat-badge fixed">Fixed: {globalStats.fixed}</div>
          <div className="stat-badge pending">Pending: {globalStats.pending}</div>
        </div>

      </nav>

      <main className="main-content">

        {/* HOME */}

        {currentPage === "home" && (

          <div className="hero-section page-container">

            <h2>
              Making Roads <span>Safer</span> with AI
            </h2>
            <p>Our smart platform detects, maps, and reports road hazards in real-time. Choose a module below to get started.</p>

            <div className="circle-nav-grid">

              <div className="circle-btn-wrapper" onClick={() => setCurrentPage('upload')}>
                <div className="circle-btn"><span className="circle-icon">📤</span></div>
                <span className="circle-label">Manual Report</span>
              </div>

              <div className="circle-btn-wrapper" onClick={() => setCurrentPage('live')}>
                <div className="circle-btn"><span className="circle-icon">📷</span></div>
                <span className="circle-label">Live Dashcam</span>
              </div>
              <div className="circle-btn-wrapper" onClick={() => setCurrentPage('map')}>
                <div className="circle-btn"><span className="circle-icon">🗺️</span></div>
                <span className="circle-label">Smart Map</span>
              </div>
              <div className="circle-btn-wrapper" onClick={() => setCurrentPage('admin')}>
                <div className="circle-btn"><span className="circle-icon">🔐</span></div>
                <span className="circle-label">Authority Portal</span>
              </div>

            </div>

          
        

         {/* --------------------------------------------------- */}
            {/* NEW VIDEO SECTION */}
            {/* --------------------------------------------------- */}
            <div className="hero-video-container">
              {/* autoPlay, loop, muted, and playsInline ensure it plays automatically on both desktop and mobile without user interaction */}
              <video 
                className="promo-video" 
                autoPlay 
                loop 
                muted 
                playsInline
                controls // Adds play/pause buttons in case they want to watch it properly
              >
                {/* Points to the public/videos folder we created */}
                <source src="/Detect-ALERT-Drivesafe.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="hero-presentation-container">
              <iframe 
                src="https://prezi.com/p/embed/RImbgb22N3LvyiRRrFFX/" 
                id="iframe_container" 
                frameBorder="0" 
                webkitAllowFullScreen 
                mozAllowFullScreen 
                allowFullScreen 
                allow="autoplay; fullscreen" 
                title="Pothole Patrol System Design"
                className="promo-presentation"
              ></iframe>
            </div>
            {/* --------------------------------------------------- */}
          </div>
        )}

        {/* UPLOAD PAGE */}

        {currentPage === "upload" && (

          <div className="page-container">

            <button onClick={() => setCurrentPage("home")} style={{ marginBottom: '20px', 
            background: 'none', color: '#FFD700', border: '1px solid #FFD700', padding: '5px 15px', borderRadius: '4px', 
            cursor: 'pointer' }}>
              ← Back
            </button>

            <div className="upload-section">

              <h2>Report Pothole</h2>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />

              <input
                type="email"
                placeholder="Enter email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />


              <div style={{ margin: '15px 0' }}>
                <button onClick={getLocation} style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px' }}>📍 Get My Location</button>
                <p style={{ color: '#FFD700', margin: '10px 0' }}>{locationStatus}</p>
              </div>

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

              <div className="results-section" style={{ marginTop: '30px', padding: '20px', backgroundColor: '#1e1e1e', borderRadius: '12px', 
              border: '1px solid #333', boxShadow: '0 8px 16px rgba(0,0,0,0.5)', width: '100%', maxWidth: '600px' }}>
                <h2 style={{ color: '#FFD700', marginTop: 0, borderBottom: '1px solid #444', paddingBottom: '10px' }}>Detection Results</h2>
                
                <h3 style={{ margin: '15px 0' }}>
                  Status: {results.pothole_count > 0 
                    ? <span style={{ color: '#ff4d4d' }}>{results.pothole_count} Hazard(s) Detected</span> 
                    : <span style={{ color: '#4CAF50' }}>Road Clear</span>}
                </h3>

                {results.output_image && (
                  <div style={{ margin: '20px 0', textAlign: 'center' }}>
                    <p style={{ color: '#aaaaaa', margin: '0 0 5px 0', fontSize: '0.9rem' }}>AI Vision Output</p>
                    <img 
                      src={`data:image/jpeg;base64,${results.output_image}`} 
                      alt="AI Bounding Boxes" 
                      style={{ width: '100%', borderRadius: '8px', border: '2px dashed #FFD700' }}
                    />
                  </div>
                )}
                {/* Map through each individual pothole and display its stats! */}
                {results.pothole_count > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                    {results.detections.map((pothole, index) => {
                      
                      // 🧮 MATH LOGIC: Convert raw AI data into readable real-world units
                      const depthCm = (pothole.estimated_depth * 0.5).toFixed(1); 
                      const areaSqCm = ((pothole.area_pixels / 1000) * (depthCm / 10)).toFixed(1);
                      const confidencePercent = (pothole.confidence * 100).toFixed(0);

                      // Determine color based on severity
                      const severityColor = pothole.severity === 'Severe' ? '#ff4d4d' : pothole.severity === 'Medium' ? '#FFD700' : '#4CAF50';

                      return (
                        <div key={index} style={{ backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px', borderLeft: `5px solid ${severityColor}`, textAlign: 'left' }}>
                          <h4 style={{ margin: '0 0 10px 0', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Pothole #{index + 1}</span>
                            <span style={{ color: severityColor }}>{pothole.severity}</span>
                          </h4>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.95rem', color: '#dddddd' }}>
                            <div><strong>🎯 AI Confidence:</strong> {confidencePercent}%</div>
                            <div><strong>📏 Est. Depth:</strong> {depthCm} cm</div>
                            <div><strong>📐 Approx. Area:</strong> {areaSqCm} cm²</div>
                            {/* <div><strong>🛑 Action:</strong> {pothole.severity === 'Severe' ? 'Immediate' : 'Monitor'}</div> */}
                          </div>
                        </div>
                      );
                    })}
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

          <div className="page-container" style={{ width: '100%' }}>
            <button onClick={() => setCurrentPage('home')} style={{ marginBottom: '20px', background: 'none', color: '#FFD700', border: '1px solid #FFD700', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>
            <LiveCamera onPotholeLogged={() => {
              setMapRefreshKey(prev => prev + 1);
              fetchStats();
            }} />
          </div>

        )}

        {/* MAP */}

        {currentPage === "map" && (

          <div className="page-container" style={{ width: '100%', maxWidth: '1000px' }}>
            <button onClick={() => setCurrentPage('home')} style={{ marginBottom: '20px', background: 'none', color: '#FFD700', border: '1px solid #FFD700', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>
            <h2 style={{ color: '#FFD700', margin: 0 }}>City-Wide Pothole Map</h2>
            <PotholeMap userLocation={location} refreshTrigger={mapRefreshKey} />
          </div>

        )}

        {/* ADMIN */}

        {currentPage === "admin" && (

           <div className="page-container" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', width: '100%', maxWidth: '1100px' }}>
                <button onClick={() => setCurrentPage('home')} style={{ background: 'none', color: '#FFD700', border: '1px solid #FFD700', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>← Back to Home</button>
                
                {/* 🆕 NEW: Logout Button */}
                {adminToken && (
                  <button 
                    onClick={() => { setAdminToken(null); localStorage.removeItem('adminToken'); }} 
                    style={{ background: '#ff4d4d', color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                )}
            </div>

            {/* 🆕 NEW: Show Login if no token, otherwise show Dashboard */}
            {!adminToken ? (
              <AdminLogin onLoginSuccess={(token) => {
                setAdminToken(token);
                localStorage.setItem('adminToken', token);
              }} />
            ) : (
              <AdminDashboard token={adminToken} /> 
            )}
          </div>

        )}

      </main>

    </div>
  );
}

export default App;