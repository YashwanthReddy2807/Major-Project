const API_BASE = 'https://thco57zmak.execute-api.us-east-1.amazonaws.com/dev';

// STEP 1: Send OTP (includes name + email)
export async function sendOtp(name, email) {
  return fetch(`${API_BASE}/register/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });
}

// STEP 2: Verify OTP
export async function verifyOtp(email, otp) {
  return fetch(`${API_BASE}/register/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
}

// STEP 3: Capture Face (after OTP verified)
export async function captureFace(email, faceImageBase64) {
  return fetch(`${API_BASE}/register/capture-face`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, face_image_base64: faceImageBase64 })
  });
}

// Existing login, transfer, transaction, etc. remain unchanged
export async function loginUser(accountNumber, pin, faceImageBase64) {
  return fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account_number: accountNumber, pin, face_image_base64: faceImageBase64 })
  });
}

export async function transferFunds(sessionToken, fromAccount, toAccount, amount, faceImageBase64) {
  return fetch(`${API_BASE}/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionToken}`, // assuming bearer token
    },
    body: JSON.stringify({
      from_account: fromAccount,
      to_account: toAccount,
      amount,
      face_image_base64: faceImageBase64  // send face image base64 string
    }),
  });
}

export async function getTransactions(sessionToken, accountNumber) {
  return fetch(`${API_BASE}/transactions?AccountNumber=${accountNumber}`, {
    headers: { Authorization: sessionToken }
  });
}


export async function changePin(email, newPin) {
  return fetch(`${API_BASE}/settings/change-pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, new_pin: newPin }),
  });
}

export async function continuousFaceVerify(sessionToken, accountNumber, faceImageBase64) {
  return fetch(`${API_BASE}/session/face-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: sessionToken },
    body: JSON.stringify({ account_number: accountNumber, face_image_base64: faceImageBase64 })
  });
}
 // replace with your API Gateway URL
export async function getUserInfo(sessionToken, AccountNumber) {
  return fetch(`${API_BASE}/user-info?AccountNumber=${AccountNumber}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': sessionToken,
    }
  });
}


// (transferFunds, getTransactions, changePin stay same)
