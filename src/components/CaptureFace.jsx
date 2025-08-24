import React, { useRef } from 'react';
import Webcam from 'react-webcam';

const CaptureFace = ({ onCapture }) => {
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const base64 = imageSrc.split(',')[1]; // strip data URL prefix
      onCapture(base64);
    }
  };

  return (
    <div>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={350}
        videoConstraints={{ facingMode: "user" }}
      />
      <button onClick={capture}>Capture Face</button>
    </div>
  );
};

export default CaptureFace;
