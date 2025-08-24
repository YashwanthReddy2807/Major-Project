import React, { useState, useEffect, useRef } from 'react';
import { transferFunds, getTransactions, changePin, getUserInfo } from '../api/api';

const Dashboard = ({ sessionToken, accountNumber, onLogout }) => {
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [sentTransactions, setSentTransactions] = useState([]);
  const [receivedTransactions, setReceivedTransactions] = useState([]);
  const [email, setEmail] = useState('');
  const [newPin, setNewPin] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // User info
  const [fullName, setFullName] = useState('');
  const [balance, setBalance] = useState('');

  // Webcam
  const videoRef = useRef(null);
  const [faceImageBase64, setFaceImageBase64] = useState('');

  // Fetch transactions
  const loadTransactions = async () => {
    setMessage('');
    try {
      const res = await getTransactions(sessionToken, accountNumber);
      const data = await res.json();
      if (res.ok) {
        setSentTransactions(data.sent || []);
        setReceivedTransactions(data.received || []);
      } else {
        setMessage(data.message || 'Failed to load transactions');
      }
    } catch {
      setMessage('Error loading transactions');
    }
  };

  // Fetch user info (name and balance)
  const loadUserInfo = async () => {
    try {
      const res = await getUserInfo(sessionToken, accountNumber);
      const data = await res.json();
      if (res.ok && data) {
        setFullName(data.name || '');
        setBalance(data.balance != null ? data.balance : '');
      } else {
        setFullName('');
        setBalance('');
      }
    } catch {
      setFullName('');
      setBalance('');
    }
  };

  useEffect(() => {
    if (sessionToken && accountNumber) {
      loadUserInfo();
      loadTransactions();
    }
    // eslint-disable-next-line
  }, [sessionToken, accountNumber]);

  // Webcam setup
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        setMessage('Unable to access webcam for face verification');
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Capture face
  const captureFaceImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setFaceImageBase64(dataUrl.split(',')[1]);
    setMessage('Face image captured. You can now transfer funds.');
  };

  // Transfer
  const handleTransfer = async () => {
    if (!faceImageBase64) {
      alert('Please capture your face image for verification');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await transferFunds(
        sessionToken,
        accountNumber,
        transferTo,
        transferAmount,
        faceImageBase64
      );
      const data = await res.json();
      let msg = '';
      if (res.ok && data) {
        if (data.body) {
          try {
            const parsedBody = JSON.parse(data.body);
            msg = parsedBody.message || 'Transfer successful';
          } catch {
            msg = data.message || 'Transfer successful';
          }
        } else {
          msg = data.message || 'Transfer successful';
        }
        alert(msg);
        setTransferTo('');
        setTransferAmount('');
        setFaceImageBase64('');
        await loadTransactions();
        await loadUserInfo(); // refresh balance
      } else {
        alert(data.message || 'Transfer failed');
      }
    } catch {
      alert('Transfer request failed');
    }
    setLoading(false);
  };

  // Change PIN
  const handleChangePin = async () => {
    if (!faceImageBase64) {
      alert('Please capture your face image for verification.');
      return;
    }
    if (!email || !newPin) {
      alert('Please enter your email and new PIN.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await changePin(email, newPin, faceImageBase64);
      const data = await res.json();
      let msg = 'PIN change failed';
      if (res.ok && data) {
        if (data.body) {
          try {
            const parsedBody = JSON.parse(data.body);
            msg = parsedBody.message || 'PIN changed successfully';
          } catch {
            msg = data.message || 'PIN changed successfully';
          }
        } else if (data.message) {
          msg = data.message;
        } else {
          msg = 'PIN changed successfully';
        }
      } else if (data.message) {
        msg = data.message;
      }
      alert(msg);
      if (res.ok) {
        setNewPin('');
        setFaceImageBase64('');
      }
    } catch {
      alert('PIN change request failed');
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Welcome, {fullName}</h2>
      <h4>
        Balance: <span style={{ color: 'green' }}>${balance}</span>
      </h4>

      <h4>Transfer Funds</h4>
      <input
        placeholder="To Account Number"
        value={transferTo}
        onChange={e => setTransferTo(e.target.value)}
        disabled={loading}
      />
      <input
        placeholder="Amount"
        type="number"
        min="1"
        value={transferAmount}
        onChange={e => setTransferAmount(e.target.value)}
        disabled={loading}
      />
      <div style={{ marginTop: '10px' }}>
        <video ref={videoRef} autoPlay width="320" height="240" />
        <br />
        <button onClick={captureFaceImage} disabled={loading}>
          Capture Face Image
        </button>
      </div>
      {faceImageBase64 && <p>Face image captured.</p>}
      <button
        onClick={handleTransfer}
        disabled={loading || !transferTo || !transferAmount}
      >
        Transfer
      </button>

      <h4>Sent Transactions</h4>
      <ul>
        {sentTransactions.length === 0 ? (
          <li>No sent transactions</li>
        ) : (
          sentTransactions.map(tx => (
            <li key={tx.transaction_id}>
              {tx.timestamp}: Sent → {tx.to_account} : ${tx.amount}
            </li>
          ))
        )}
      </ul>

      <h4>Received Transactions</h4>
      <ul>
        {receivedTransactions.length === 0 ? (
          <li>No received transactions</li>
        ) : (
          receivedTransactions.map(tx => (
            <li key={tx.transaction_id}>
              {tx.timestamp}: From {tx.from_account} → You : ${tx.amount}
            </li>
          ))
        )}
      </ul>

      <h4>Change PIN</h4>
      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={loading}
      />
      <input
        placeholder="New PIN"
        type="password"
        value={newPin}
        onChange={e => setNewPin(e.target.value)}
        disabled={loading}
      />
      <button
        onClick={handleChangePin}
        disabled={loading || !email || !newPin}
      >
        Change PIN
      </button>

      <button
        onClick={onLogout}
        style={{ marginTop: '20px', backgroundColor: 'red', color: 'white' }}
        disabled={loading}
      >
        Logout
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Dashboard;
