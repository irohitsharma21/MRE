// src/App.js
import React, { useState } from "react";
import { Room } from "livekit-client";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [lkRoom, setLkRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleButtonClick = async () => {
    if (!isConnected) {
      if (!prompt.trim()) return;
      setStatus("📞 Creating room and joining…");

      try {
        // 1) Generate unique roomName & userId
        const roomName = `mre-${Date.now()}`;
        const userId = `mre-user-${Date.now()}`;

        // 2) Build query string for token request
        const query = new URLSearchParams({
          room: roomName,
          user: userId,
          prompt: prompt,
        }).toString();

        // 3) Call the GCP token server
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}?${query}`,
          { method: "GET" }
        );
        if (!response.ok) {
          const errJson = await response.json();
          throw new Error(errJson.error || "Unknown server error");
        }

        // 4) Parse returned JSON and extract the LiveKit token
        const { token: userToken } = await response.json();
        setStatus(`🎉 Joining room: ${roomName}…`);

        // 5) Create a new Room instance and connect
        const room = new Room();
        await room.connect(
          process.env.REACT_APP_LIVEKIT_WS_HOST,
          userToken,
          { room: roomName }
        );

        // 6) Save the Room instance in state for later disconnection
        setLkRoom(room);
        setIsConnected(true);
        setStatus(`✅ Connected to room: ${roomName}`);

        // 7) Publish the local microphone
        await room.localParticipant.setMicrophoneEnabled(true);
      } catch (err) {
        console.error("Error starting call:", err);
        setStatus(`❌ Failed to join: ${err.message}`);
      }
    } else {
      // END CALL logic
      if (lkRoom) {
        lkRoom.disconnect();
        setLkRoom(null);
      }
      setIsConnected(false);
      setStatus("✋ You have left the room.");
    }
  };

  return (
    <div className="container">
      <header className="header">Real Estate Voice Agent Dashboard</header>
      <div className="main-content">
        <div className="left-panel">
          <button
            className="start-button"
            onClick={handleButtonClick}
            disabled={!prompt.trim()}
          >
            {isConnected ? "End Call" : "Start Call"}
          </button>
          <div className="status-label">Status:</div>
          <div className="status-box">
            {status || "No call initiated yet."}
          </div>
        </div>
        <div className="right-panel">
          <label htmlFor="promptArea" className="prompt-label">
            Enter custom prompt for the agent:
          </label>
          <textarea
            id="promptArea"
            className="prompt-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your detailed prompt here…"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
