// AdminLogin.js

import React, { useState } from "react";
import "./AdminLogin.css";

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
    <div className="login-container">

      <div className="login-card">

        <h2>
          Authority Login
        </h2>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleLogin
          }
          className="login-form"
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
          />

          <button
            type="submit"

            disabled={
              loading
            }
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