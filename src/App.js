import React, { useState, useEffect } from "react";
import { Room } from "livekit-client";    // <-- import Room instead of connect
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [room, setRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleButtonClick = async () => {
    if (!isConnected) {
      // ---- Start Call ----
      if (!prompt.trim()) return;
      setStatus("📞 Creating room and joining…");

      try {
        // 1) Request backend to create room & return roomName + userToken
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/start-call`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
          }
        );

        if (!response.ok) {
          const errJson = await response.json();
          throw new Error(errJson.error || "Unknown server error");
        }

        const { roomName, userToken } = await response.json();
        setStatus(`🎉 Joining room: ${roomName}…`);

        // 2) Connect to LiveKit room with the returned token
        const lkRoom = await Room.connect(
          process.env.REACT_APP_LIVEKIT_WS_HOST,
          userToken,
          { room: roomName }
        );
        setRoom(lkRoom);
        setIsConnected(true);
        setStatus(`✅ Connected to room: ${roomName}`);

        // 3) Publish local microphone track
        await lkRoom.localParticipant.setMicrophoneEnabled(true);
      } catch (err) {
        console.error("Error starting call:", err);
        setStatus(`❌ Failed to join: ${err.message}`);
      }
    } else {
      // ---- End Call ----
      if (room) {
        room.disconnect();
        setRoom(null);
      }
      setIsConnected(false);
      setStatus("✋ You have left the room.");
    }
  };

  // Clean up if component unmounts
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        Real Estate Voice Agent Dashboard
      </header>

      {/* Main content */}
      <div className="main-content">
        {/* Left Panel */}
        <div className="left-panel">
          <button
            className={`call-button ${isConnected ? "end" : "start"}`}
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

        {/* Right Panel */}
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
            disabled={isConnected}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
