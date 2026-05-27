// AdminLogin.js

import React, { useState } from "react";
import "./App.css";

// Production backend
const API_BASE =
  "https://laisa1-pothole-patrol-backend.hf.space";

// Local backend
// const API_BASE = "http://127.0.0.1:5000";

const AdminLogin = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= LOGIN =================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            formData
          ),
        }
      );

      const data =
        await response.json();

      if (response.ok) {
        onLoginSuccess(
          data.token
        );
      } else {
        setError(
          data.message ||
            "Login failed"
        );
      }
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= INPUT =================

  const handleChange = (e) => {
    setFormData({
      ...formData,

      [e.target.name]:
        e.target.value,
    });
  };

  // ================= UI =================

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '2px solid #FFD700', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>

      <div className="login-card"style={{ maxWidth: '400px', margin: '60px auto', padding: '30px', backgroundColor: '#1e1e1e', borderRadius: '12px', border: '2px solid #FFD700', textAlign: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
      

        <h2 style={{ color: '#FFD700', marginBottom: '20px' }}>
          Authority Login
        </h2>

        {error && (
          <div className="error-box" style={{ color: '#ff4d4d', marginBottom: '15px', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleLogin
          }
          className="login-form" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
        >

          <input
            type="email"
            name="email"

            placeholder=
              "Admin Email"

            value={
              formData.email
            }

            onChange={
              handleChange
            }

            required
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#333', color: '#fff', fontSize: '1rem' }}
        
          />

          <input
            type="password"
            name="password"

            placeholder=
              "Password"

            value={
              formData.password
            }

            onChange={
              handleChange
            }

            required
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #555', backgroundColor: '#333', color: '#fff', fontSize: '1rem' }}
        
          />

          <button
            type="submit"

            disabled={
              loading
            }
            style={{ padding: '12px', backgroundColor: '#FFD700', color: '#121212', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '10px' }}
        
          >
            {loading
              ? "Verifying..."
              : "Secure Login"}
          </button>

        </form>

      </div>

    </div>
  );
};

export default AdminLogin;