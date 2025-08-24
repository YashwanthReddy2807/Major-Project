import React, { useState } from 'react';
import { loginUser } from '../api/api';
import CaptureFace from './CaptureFace';

const LoginForm = ({ onLogin }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [pin, setPin] = useState('');
  const [faceBase64, setFaceBase64] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFaceCapture = (base64) => {
    setFaceBase64(base64);
    setMessage('Face captured');
  };

  const handleLogin = async () => {
    if (!faceBase64) {
      alert('Please capture your face image.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await loginUser(accountNumber, pin, faceBase64);
      const rawData = await res.json();

      // Parse the nested JSON string from the body field
      let data = {};
      try {
        data = JSON.parse(rawData.body);
      } catch (e) {
        console.error('Error parsing nested JSON body:', e);
      }

      if (res.ok && data.message === 'Login successful') {
        onLogin(data.session_token, accountNumber);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Network or server error');
    }
    setLoading(false);
  };

  return (
    <div>
      <h3>User Login</h3>
      <input
        placeholder="Account Number"
        value={accountNumber}
        onChange={e => setAccountNumber(e.target.value)}
        disabled={loading}
      />
      <input
        placeholder="PIN"
        type="password"
        value={pin}
        onChange={e => setPin(e.target.value)}
        disabled={loading}
      />
      <CaptureFace onCapture={handleFaceCapture} />
      <button
        onClick={handleLogin}
        disabled={loading || !accountNumber || !pin || !faceBase64}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <p>{message}</p>
    </div>
  );
};

export default LoginForm;
