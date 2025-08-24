import React, { useState, useRef, useEffect } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import { continuousFaceVerify } from './api/api';
import CaptureFace from './components/CaptureFace';

function App() {
  // app step: 'register', 'login', 'dashboard'
  const [step, setStep] = useState('login'); // default to login
  const [sessionToken, setSessionToken] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [faceBase64, setFaceBase64] = useState('');
  const [message, setMessage] = useState('');

  const verifyIntervalRef = useRef(null);

  const startContinuousFaceVerification = (accountNum, token) => {
    if (verifyIntervalRef.current) {
      clearInterval(verifyIntervalRef.current);
    }

    verifyIntervalRef.current = setInterval(async () => {
      if (step !== 'dashboard') {
        clearInterval(verifyIntervalRef.current);
        return;
      }

      if (!faceBase64) {
        setMessage('Please capture face for continuous authentication.');
        return;
      }

      try {
        const res = await continuousFaceVerify(token, accountNum, faceBase64);
        const data = await res.json();

        if (!res.ok || !data.success) {
          alert('Unidentified user detected. Logging out...');
          handleLogout();
        }
      } catch (err) {
        console.error('Face verification error:', err);
        alert('Error in verification. Logging out...');
        handleLogout();
      }
    }, 15000);
  };

  const handleFaceCapture = (base64) => {
    setFaceBase64(base64);
    setMessage('Face captured for verification');
  };

  const handleRegistered = () => {
    setStep('login');
  };

  const handleLogin = (token, accountNum) => {
    console.log('App.handleLogin called with token:', token);
    setSessionToken(token);
    setAccountNumber(accountNum);
    setStep('dashboard');
    startContinuousFaceVerification(accountNum, token);
  };

  const handleLogout = () => {
    if (verifyIntervalRef.current) {
      clearInterval(verifyIntervalRef.current);
    }
    setStep('login');
    setSessionToken('');
    setAccountNumber('');
    setFaceBase64('');
    setMessage('');
  };

  useEffect(() => {
    return () => {
      if (verifyIntervalRef.current) {
        clearInterval(verifyIntervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Banking App with Facial Authentication</h2>

      {/* Navigation Buttons */}
      <div style={{ marginBottom: '15px', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '8px' }}>
        <button
          onClick={() => setStep('login')}
          disabled={step === 'login'}
          style={{ marginRight: '10px', padding: '10px 20px', cursor: step === 'login' ? 'not-allowed' : 'pointer' }}
        >
          Login
        </button>
        <button
          onClick={() => setStep('register')}
          disabled={step === 'register'}
          style={{ padding: '10px 20px', cursor: step === 'register' ? 'not-allowed' : 'pointer' }}
        >
          Register
        </button>
      </div>

      {/* Conditional Rendering Based on Current Step */}
      {step === 'register' && <RegisterForm onRegistered={handleRegistered} />}

      {step === 'login' && <LoginForm onLogin={handleLogin} />}

      {step === 'dashboard' && (
        <>
          <Dashboard
            sessionToken={sessionToken}
            accountNumber={accountNumber}
            onLogout={handleLogout}
          />
          <h4>Continuous Face Verification</h4>
          <CaptureFace onCapture={handleFaceCapture} />
          <p>{message}</p>
        </>
      )}
    </div>
  );
}

export default App;
