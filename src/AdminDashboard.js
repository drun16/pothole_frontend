// AdminDashboard.js

import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BASE =
  "https://laisa1-pothole-patrol-backend.hf.space";

// Local backend
// const API_BASE = "http://127.0.0.1:5000";

const AdminDashboard = ({ token }) => {
  const [reports, setReports] = useState([]);

  const [metadata, setMetadata] = useState({
    current_page: 1,
    total_pages: 1,
    total_reports: 0,
    total_pending: 0,
    total_fixed: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);

  // ================= FETCH REPORTS =================

  const fetchReports = async (page = 1) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/reports?page=${page}&limit=10`
      );

      const data = await response.json();

      if (response.ok) {
        setReports(data.reports);
        setMetadata(data.metadata);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  // ================= STATUS UPDATE =================

  const handleStatusChange = async (
    reportId,
    status
  ) => {
    try {
      await fetch(
        `${API_BASE}/api/reports/${reportId}/status`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      fetchReports(currentPage);

    } catch (error) {
      console.error(error);
    }
  };

  // ================= PDF EXPORT =================

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "Pothole Patrol Report",
      14,
      15
    );

    doc.setFontSize(10);

    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      14,
      22
    );

    const tableRows = reports.map(
      (report) => [
        new Date(
          report.reported_at
        ).toLocaleDateString(),

        new Date(
          report.reported_at
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),

        report.pothole_count,

        report.max_depth || "--",

        report.latitude
          ? `${report.latitude.toFixed(
              4
            )}, ${report.longitude.toFixed(
              4
            )}`
          : "Unknown",

        report.status,
      ]
    );

    autoTable(doc, {
      startY: 30,

      head: [[
        "Date",
        "Time",
        "Potholes",
        "Depth",
        "Location",
        "Status",
      ]],

      body: tableRows,

      theme: "grid",

      headStyles: {
        fillColor: [255, 215, 0],
        textColor: [0, 0, 0],
      },
    });

    doc.save(
      "Pothole_Report.pdf"
    );
  };

  // ================= UI =================

  return (
    <div className="admin-dashboard">

      {/* HEADER */}

      <div className="dashboard-header">

        <h2>
          Authority Dashboard
        </h2>

        <button
          className="pdf-btn"
          onClick={downloadPDF}
        >
          📄 Download PDF
        </button>

      </div>

      {/* STATS */}

      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Reports</h3>

          <p className="gold">
            {metadata.total_reports}
          </p>
        </div>

        <div className="stat-card">
          <h3>Pending</h3>

          <p className="red">
            {metadata.total_pending}
          </p>
        </div>

        <div className="stat-card">
          <h3>Fixed</h3>

          <p className="green">
            {metadata.total_fixed}
          </p>
        </div>

      </div>

      {/* TABLE */}

      <div className="table-container">

        <table>

          <thead>

            <tr>
              <th>Image</th>
              <th>Date</th>
              <th>Time</th>
              <th>Potholes</th>
              <th>Depth</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>

          <tbody>

            {reports.map(
              (report) => (

              <tr key={report._id}>

                <td>

                  {report.image_url ? (

                    <img
                      src={
                        report.image_url
                      }

                      alt="Pothole"

                      className=
                        "report-image"
                    />

                  ) : (
                    "No Image"
                  )}

                </td>

                <td>

                  {new Date(
                    report.reported_at
                  ).toLocaleDateString()}

                </td>

                <td>

                  {new Date(
                    report.reported_at
                  ).toLocaleTimeString(
                    [],
                    {
                      hour:
                        "2-digit",

                      minute:
                        "2-digit",
                    }
                  )}

                </td>

                <td>
                  {
                    report.pothole_count
                  }
                </td>

                <td>
                  {
                    report.max_depth ||
                    "--"
                  }
                </td>

                <td>

                  {report.latitude
                    ? `${report.latitude.toFixed(
                        4
                      )},
                       ${report.longitude.toFixed(
                        4
                      )}`
                    : "Unknown"}

                </td>

                <td
                  className={
                    report.status ===
                    "Fixed"
                      ? "green"
                      : "red"
                  }
                >
                  {report.status}
                </td>

                <td>

                  <select
                    value={
                      report.status
                    }

                    onChange={(e) =>
                      handleStatusChange(
                        report._id,
                        e.target.value
                      )
                    }
                  >

                    <option>
                      Pending
                    </option>

                    <option>
                      In Progress
                    </option>

                    <option>
                      Fixed
                    </option>

                  </select>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      <div className="pagination">

        <button
          onClick={() =>
            setCurrentPage(
              (prev) =>
                Math.max(
                  prev - 1,
                  1
                )
            )
          }
        >
          ← Previous
        </button>

        <span>

          Page {
            metadata.current_page
          } of {
            metadata.total_pages
          }

        </span>

        <button
          onClick={() =>
            setCurrentPage(
              (prev) =>
                Math.min(
                  prev + 1,

                  metadata.total_pages
                )
            )
          }
        >
          Next →
        </button>

      </div>

    </div>
  );
};

export default AdminDashboard;