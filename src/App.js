import React, { useState } from "react";
import "./App.css";

function App() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");

  // This is still a stub. You’ll hook it to your backend in Step 3.
  const handleStartCall = async () => {
    if (!customerNumber.trim() || !prompt.trim()) return;
    setStatus("Calling backend to start outbound call…");

    try {
      const response = await fetch("http://localhost:4000/start-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, customerNumber }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Unknown error from server");
      }

      const data = await response.json();
      setStatus(`✅ Call initiated! Call ID: ${data.callId}`);
    } catch (err) {
      console.error("Error calling backend:", err);
      setStatus(`❌ Failed to start call: ${err.message}`);
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        Real Estate Voice Agent Dashboard
      </header>

      {/* Main content area: two columns */}
      <div className="main-content">
        {/* Left Panel: Actions + Status */}
        <div className="left-panel">
          <button
            className="start-button"
            onClick={handleStartCall}
            disabled={!customerNumber.trim() || !prompt.trim()}
          >
            Start Call
          </button>

          <div className="status-label">Status:</div>
          <div className="status-box">
            {status || "No call initiated yet."}
          </div>
        </div>

        {/* Right Panel: Prompt Input */}
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

      {/* Optional: a footer or extra information if you need it */}
      {/* <footer className="footer">© 2025 Real Estate Co.</footer> */}
    </div>
  );
}

export default App;
