import React, { useState, useEffect } from 'react';
import * as Client from '@storacha/client';

function App() {
  const [email, setEmail] = useState('');
  const [client, setClient] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [status, setStatus] = useState('');

  // 1. Initialize Client & Login
  async function handleLogin() {
    setStatus('Sending verification email...');
    try {
      const myClient = await Client.create();
      await myClient.login(email);
      await myClient.setCurrentSpace(myClient.spaces()[0]?.did());
      
      setClient(myClient);
      setStatus('Logged in! Fetching files...');
      fetchUploads(myClient);
    } catch (err) {
      console.error(err);
      setStatus('Login failed. Check console.');
    }
  }

  // 2. Upload File
  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file || !client) return;

    setUploading(true);
    setStatus('Uploading to Storacha...');
    
    try {
      const cid = await client.uploadFile(file);
      setStatus(`Success! CID: ${cid.toString()}`);
      // Refresh list
      await fetchUploads(client);
    } catch (err) {
      console.error(err);
      setStatus('Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  // 3. List Files
  async function fetchUploads(currentClient) {
    if (!currentClient) return;
    try {
      const list = [];
      const res = await currentClient.capability.upload.list({ size: 10 });
      
      for (const item of res.results) {
        list.push({
          cid: item.root.toString(),
          url: `https://storacha.link/ipfs/${item.root.toString()}`
        });
      }
      setUploads(list);
    } catch (err) {
      console.error("Error fetching list:", err);
    }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      {/* PERSONALIZED TITLE HERE */}
      <h1>🚀 Jimak's Mini Storacha DApp</h1>
      
      {!client ? (
        <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <h3>Step 1: Connect</h3>
          <p>Enter your email to login (User Controlled Auth)</p>
          <input 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '8px', marginRight: '10px' }}
          />
          <button onClick={handleLogin} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Login / Signup
          </button>
        </div>
      ) : (
        <div style={{ border: '1px solid #4CAF50', padding: '1rem', borderRadius: '8px' }}>
          <h3>Step 2: Upload Data</h3>
          <p>Logged in as: <b>{email}</b></p>
          <input type="file" onChange={handleUpload} disabled={uploading} />
          {uploading && <p>⏳ Uploading... please wait</p>}
        </div>
      )}

      {status && <p style={{ backgroundColor: '#f0f0f0', padding: '10px', marginTop: '1rem' }}>📝 {status}</p>}

      {client && (
        <div style={{ marginTop: '2rem' }}>
          <h3>📂 Jimak's Recent Uploads</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {uploads.map((file, index) => (
              <li key={index} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                <a href={file.url} target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>
                  {file.cid.substring(0, 15)}...
                </a>
                <br/>
                <small style={{ color: '#666' }}>Gateway Link</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
