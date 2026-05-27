// PotholeMap.js

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "./App.css";

// Production backend
const API_BASE =
  "https://laisa1-pothole-patrol-backend.hf.space";

// Local backend
// const API_BASE = "http://127.0.0.1:5000";


// ================= MARKER ICONS =================

const createIcon = (color) =>
  new L.Icon({
    iconUrl:
      `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,

    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],

    popupAnchor: [1, -34],

    shadowSize: [41, 41],
  });

const redIcon = createIcon("red");
const greenIcon =
  createIcon("green");
const yellowIcon =
  createIcon("gold");

const getMarkerIcon = (
  status
) => {
  if (status === "Fixed")
    return greenIcon;

  if (status === "Pending")
    return redIcon;

  return yellowIcon;
};


// ================= DISTANCE =================

const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {

  const R = 6371e3;

  const rad =
    Math.PI / 180;

  const dLat =
    (lat2 - lat1) * rad;

  const dLon =
    (lon2 - lon1) * rad;

  const a =
    Math.sin(dLat / 2) **
      2 +

    Math.cos(
      lat1 * rad
    ) *

      Math.cos(
        lat2 * rad
      ) *

      Math.sin(
        dLon / 2
      ) **
        2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};


// ================= MAP VIEW =================

function ChangeMapView({
  center,
  zoom,
}) {

  const map = useMap();

  map.setView(
    center,
    zoom
  );

  return null;
}


// ================= COMPONENT =================

const PotholeMap = ({
  userLocation,
  refreshTrigger,
}) => {

  const [
    reports,
    setReports,
  ] = useState([]);

  const [
    isDriving,
    setIsDriving,
  ] = useState(false);

  const [
    liveCarLocation,
    setLiveCarLocation,
  ] = useState(null);

  const [
    alertMessage,
    setAlertMessage,
  ] = useState(null);

  const warnedPotholes =
    useRef(
      new Set()
    );

  const alarmSound =
    useRef(
      new Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      )
    );


  // ================= FETCH REPORTS =================

  useEffect(() => {

    const fetchReports =
      async () => {

        try {

          const response =
            await fetch(

              `${API_BASE}/api/reports?page=1&limit=1000`
            );

          const data =
            await response.json();

          if (
            response.ok
          ) {
            setReports(
              data.reports
            );
          }

        } catch (error) {
          console.error(
            error
          );
        }
      };

    fetchReports();

  }, [refreshTrigger]);


  // ================= PROCESS REPORTS =================

  const processedReports =
    useMemo(() => {

      return reports.map(
        (report) => {

          if (
            !report.latitude ||
            !report.longitude
          )
            return report;

          let lat =
            report.latitude;

          let lng =
            report.longitude;

          // Fix swapped coordinates

          if (
            lat > 50 &&
            lng < 40
          ) {
            lat =
              report.longitude;

            lng =
              report.latitude;
          }

          return {

            ...report,

            realLat: lat,

            realLng: lng,

            displayLat:
              lat +
              (
                Math.random() -
                0.5
              ) *
                0.0004,

            displayLng:
              lng +
              (
                Math.random() -
                0.5
              ) *
                0.0004,
          };
        }
      );

    }, [reports]);


  // ================= DRIVING MODE =================

  useEffect(() => {

    let watchId;

    if (
      isDriving &&
      navigator.geolocation
    ) {

      watchId =
        navigator.geolocation.watchPosition(

          (position) => {

            const lat =
              position.coords
                .latitude;

            const lng =
              position.coords
                .longitude;

            setLiveCarLocation([
              lat,
              lng,
            ]);

            processedReports.forEach(
              (report) => {

                if (
                  report.status ===
                    "Fixed" ||

                  !report.realLat
                )
                  return;

                const distance =
                  calculateDistance(

                    lat,
                    lng,

                    report.realLat,

                    report.realLng
                  );

                if (

                  distance < 50 &&

                  !warnedPotholes.current.has(
                    report._id
                  )

                ) {

                  warnedPotholes.current.add(
                    report._id
                  );

                  alarmSound.current
                    .play()
                    .catch(
                      () => {}
                    );

                  setAlertMessage(

                    `⚠️ Hazard Ahead:
                     ${Math.round(
                       distance
                     )} m`

                  );

                  setTimeout(
                    () =>
                      setAlertMessage(
                        null
                      ),

                    5000
                  );
                }
              }
            );
          },

          (error) =>
            console.error(
              error
            ),

          {
            enableHighAccuracy:
              true,

            maximumAge: 0,
          }
        );
    }

    return () => {

      if (watchId) {

        navigator.geolocation.clearWatch(
          watchId
        );

      }

    };

  }, [
    isDriving,
    processedReports,
  ]);


  // ================= MAP CENTER =================

  const mapCenter =

    isDriving &&
    liveCarLocation

      ? liveCarLocation

      : userLocation

      ? [
          userLocation.lat,
          userLocation.lng,
        ]

      : [12.3059, 76.6086];


  // ================= UI =================

  return (

    <div className="map-wrapper" style={{ position: 'relative', width: '100%', marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
      <button
        className="drive-btn"

        onClick={() =>
          setIsDriving(
            !isDriving
          )
        }
      >

        {isDriving

          ? "🛑 Stop Driving"

          : "🚗 Start Driving"}

      </button>
      {isDriving && <span style={{ color: '#4CAF50', fontWeight: 'bold', animation: 'pulse 2s infinite' }}>📍 Live GPS Active</span>}
      </div>

      {alertMessage && (

        <div className="alert-box"style={{ position: 'absolute', top: '70px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ff4d4d', color: '#fff', padding: '15px 30px', borderRadius: '8px', zIndex: 1000, fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 8px 16px rgba(255, 77, 77, 0.4)', border: '2px solid #fff', textAlign: 'center', width: '80%', maxWidth: '400px' }}>
       

          {alertMessage}

        </div>

      )}

      <div className="map-container" style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #333' }}>
        

        <MapContainer

          center={mapCenter}

          zoom={15}

          style={{
            height:
              "100%",

            width:
              "100%",
          }}
        >

          <ChangeMapView
            center={
              mapCenter
            }

            zoom={
              isDriving
                ? 17
                : 14
            }
          />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {processedReports.map(
            (
              report,
              index
            ) => (

              report.displayLat && (

                <Marker

                  key={
                    report._id ||
                    index
                  }

                  position={[
                    report.displayLat,

                    report.displayLng,
                  ]}

                  icon={getMarkerIcon(
                    report.status
                  )}
                >

                  <Popup>

                    <strong>
                      Status:
                    </strong>

                    {
                      report.status
                    }

                    <br />

                    <strong>
                      Potholes:
                    </strong>

                    {
                      report.pothole_count
                    }

                    <br />

                    <strong>
                      Depth:
                    </strong>

                    {report.max_depth ||
                      "N/A"}

                  </Popup>

                </Marker>
              )
            )
          )}

          {isDriving &&
            liveCarLocation && (

            <CircleMarker
              center={
                liveCarLocation
              }

              radius={12}
            />

          )}

        </MapContainer>

      </div>

    </div>
  );
};

export default PotholeMap;