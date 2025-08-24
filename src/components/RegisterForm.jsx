import React, { useState, useRef, useEffect } from "react";
import { sendOtp, verifyOtp, captureFace } from "../api/api";

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log("Current step:", step);
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Unable to access camera: " + err.message);
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return null;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg").split(",")[1];
  };

  // STEP 1: Send OTP
  const handleSendOtp = async () => {
    if (!name || !email) {
      alert("Enter both name and email!");
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(name, email);
      const data = await res.json();
      const body = typeof data.body === "string" ? JSON.parse(data.body) : data.body;

      if (res.status === 200 && body.message === "OTP sent successfully") {
        alert("OTP sent! Check your email.");
        setStep(2);
      } else {
        alert(body.message || "Failed to send OTP");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      alert("Enter OTP!");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyOtp(email, otp);
      const data = await res.json();
      const body = typeof data.body === "string" ? JSON.parse(data.body) : data.body;

      if (res.status === 200 && body.success === true) {
        alert("OTP Verified!");
        setIsOtpVerified(true);
        setStep(3);
        startCamera();
      } else {
        alert(body.message || "OTP verification failed");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Capture Face and Register
  const handleCaptureFace = async () => {
    const faceImageBase64 = captureImage();
    if (!faceImageBase64) {
      alert("Could not capture face image!");
      return;
    }

    setLoading(true);
    try {
      const res = await captureFace(email, faceImageBase64);
      const data = await res.json();
      const body = typeof data.body === "string" ? JSON.parse(data.body) : data.body;

      if (res.status === 200 && body.account_number && body.pin) {
        alert(`Registration complete! Account: ${body.account_number}, PIN: ${body.pin}`);
        setStep(4);
      } else {
        alert(body.message || "Failed to register user");
      }
    } catch (err) {
      alert("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>User Registration</h2>

      {step === 1 && (
        <div className="step1">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSendOtp} disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="step2">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            disabled={isOtpVerified}
            onChange={(e) => setOtp(e.target.value)}
          />
          {!isOtpVerified && (
            <button onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="step3">
          <p>Align your face within the frame and click capture.</p>
          <video ref={videoRef} autoPlay playsInline width="400" height="300" />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <button onClick={handleCaptureFace} disabled={loading}>
            {loading ? "Registering..." : "Capture & Register"}
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="step4">
          <h3>✅ Registration Complete!</h3>
          <p>You can now log in with your account number and PIN.</p>
        </div>
      )}
    </div>
  );
};

export default Register;
