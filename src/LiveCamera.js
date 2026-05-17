// LiveCamera.js

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";

import Webcam from "react-webcam";

import "./App.css";

// Production backend
const API_BASE =
  "https://laisa1-pothole-patrol-backend.hf.space";

// Local backend
// const API_BASE = "http://127.0.0.1:5000";

const LiveCamera = ({
  onPotholeLogged,
}) => {

  const webcamRef =
    useRef(null);

  const [
    isDetecting,
    setIsDetecting,
  ] = useState(false);

  const [
    liveResults,
    setLiveResults,
  ] = useState(null);

  const [
    liveLocation,
    setLiveLocation,
  ] = useState(null);

  // ================= GPS =================

  useEffect(() => {

    let watchId;

    if (
      isDetecting &&
      navigator.geolocation
    ) {

      watchId =
        navigator.geolocation.watchPosition(

          (position) => {

            setLiveLocation({
              lat:
                position.coords
                  .latitude,

              lng:
                position.coords
                  .longitude,
            });

          },

          (error) => {
            console.error(
              "GPS Error:",
              error
            );
          },

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

  }, [isDetecting]);

  // ================= DETECTION =================

  const captureAndDetect =
    useCallback(
      async () => {

        if (
          !webcamRef.current
        )
          return;

        const imageSrc =
          webcamRef.current.getScreenshot();

        if (!imageSrc)
          return;

        try {

          const imageResponse =
            await fetch(
              imageSrc
            );

          const blob =
            await imageResponse.blob();

          const formData =
            new FormData();

          formData.append(
            "file",
            blob,
            `live_pothole_${Date.now()}.jpg`
          );

          formData.append(
            "source",
            "live"
          );

          if (
            liveLocation
          ) {

            formData.append(
              "latitude",
              liveLocation.lat
            );

            formData.append(
              "longitude",
              liveLocation.lng
            );
          }

          const response =
            await fetch(

              `${API_BASE}/api/detect`,

              {
                method:
                  "POST",

                body:
                  formData,
              }
            );

          const data =
            await response.json();

          setLiveResults(
            data
          );

          if (
            data.saved_to_db &&
            data.pothole_count >
              0
          ) {

            onPotholeLogged?.();

          }

        } catch (error) {

          console.error(
            "Detection Error:",
            error
          );

        }
      },

      [
        liveLocation,
        onPotholeLogged,
      ]
    );

  // ================= AUTO SCAN =================

  useEffect(() => {

    if (
      !isDetecting
    )
      return;

    const interval =
      setInterval(
        captureAndDetect,
        2500
      );

    return () =>
      clearInterval(
        interval
      );

  }, [
    isDetecting,
    captureAndDetect,
  ]);

  // ================= UI =================

  return (

    <div className="live-camera">

      <h2>
        📷 Live AI Scanner
      </h2>

      <p
        className={
          liveLocation
            ? "gps-active"
            : "gps-wait"
        }
      >

        {liveLocation

          ? `📍 GPS:
             ${liveLocation.lat.toFixed(
               4
             )},
             ${liveLocation.lng.toFixed(
               4
             )}`

          : "⚠️ Waiting for GPS..."}

      </p>

      <div className="camera-box">

        <Webcam
          ref={webcamRef}

          audio={false}

          screenshotFormat=
            "image/jpeg"

          width="100%"

          videoConstraints={{
            facingMode:
              "environment",
          }}
        />

      </div>

      <button

        className={
          isDetecting
            ? "stop-btn"
            : "start-btn"
        }

        onClick={() =>
          setIsDetecting(
            !isDetecting
          )
        }
      >

        {isDetecting

          ? "🛑 Stop Scanner"

          : "🟢 Start Scanner"}

      </button>

      {isDetecting &&
        liveResults && (

        <div className="status-box">

          <h3

            className={
              liveResults.pothole_count >
              0

                ? "danger"

                : "safe"
            }
          >

            Live Status:

            {liveResults
              .pothole_count >
            0

              ? ` ${liveResults.pothole_count}
                 Pothole(s)
                 Detected`

              : " Road Clear"}

          </h3>

        </div>

      )}

    </div>
  );
};

export default LiveCamera;