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
    <div className="admin-dashboard" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>

      {/* HEADER */}

      <div className="dashboard-header" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', color: '#fff' }} >

        {/* 🆕 NEW: Header with the Download Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h2 style={{ color: '#FFD700', margin: 0 }}>Authority Dashboard</h2>
        <button 
          onClick={downloadPDF}
          style={{ backgroundColor: '#FFD700', color: '#121212', border: 'none', padding: '10px 20px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}
        >
          📄 Download PDF Report
        </button>
      </div>

      {/* STATS */}

      <div className="stats-grid" style={{ display: 'flex', gap: '20px', marginBottom: '30px', marginTop: '20px', flexWrap: 'wrap' }} >

        <div style={{ flex: '1 1 200px', backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
          <h3>Total Reports</h3>

          <p className="gold" style={{ fontSize: '2rem', color: '#FFD700', margin: 0 }}>
            {metadata.total_reports}
          </p>
        </div>

        <div style={{ flex: '1 1 200px', backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
          <h3>Potholes Fixed</h3>

          <p className="red" style={{ fontSize: '2rem', color: '#ff4d4d', margin: 0 }}>
            {metadata.total_pending}
          </p>
        </div>

        <div style={{ flex: '1 1 200px', backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px solid #333' }}>
          <h3>Potholes Fixed</h3>

          <p className="green" style={{ fontSize: '2rem', color: '#4CAF50', margin: 0 }}>
            {metadata.total_fixed}
          </p>
        </div>

      </div>

      {/* TABLE */}

      <div style={{ overflowX: 'auto', backgroundColor: '#1e1e1e', borderRadius: '8px', padding: '20px', border: '1px solid #333' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #444', color: '#aaaaaa' }}>
              <th style={{ padding: '12px' }}>Image</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Time</th>
              <th style={{ padding: '12px' }}>Potholes</th>
              <th style={{ padding: '12px' }}>Depth</th>
              <th style={{ padding: '12px' }}>Location</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>

          </thead>

          <tbody>

            {reports.map(
              (report) => (

              <tr key={report._id} style={{ borderBottom: '1px solid #333' }}>

                <td style={{ padding: '12px' }}>

                  {report.image_url ? (

                    <img
                      src={
                        report.image_url
                      }

                      alt="Pothole"

                      className=
                        "report-image"
                      style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #555' }}
                    />

                  ) : (
                    <span style={{ color: '#555', fontSize: '0.8rem' }}>No Image</span>
                  )}

                </td>

                <td>

                  {new Date(
                    report.reported_at
                  ).toLocaleDateString()}

                </td>

                <td style={{ padding: '12px' }}>

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

                    <option value="Pending">
                      Pending
                    </option>

                    <option value="In Progress">
                      In Progress
                    </option>

                    <option value="Fixed">
                      Fixed
                    </option>

                  </select>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      

        {/* PAGINATION */}

        <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #444' }}>

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

        <span style={{ color: '#aaaaaa' }}>

          Page<strong style={{ color: '#FFD700' }}> {
            metadata.current_page
          }</strong> of {
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
          disabled={currentPage === metadata.total_pages || metadata.total_pages === 0}
            style={{ padding: '8px 16px', backgroundColor: currentPage === metadata.total_pages || metadata.total_pages === 0 ? '#333' : '#FFD700', color: currentPage === metadata.total_pages || metadata.total_pages === 0 ? '#888' : '#121212', border: 'none', borderRadius: '4px', cursor: currentPage === metadata.total_pages || metadata.total_pages === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          
        >
          Next →
        </button>

      </div>
    </div>
    </div>
    </div>
  );
};

export default AdminDashboard;