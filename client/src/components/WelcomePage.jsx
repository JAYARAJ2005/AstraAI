import React from "react";

export default function WelcomePage({ onLogin, onRegister }) {
  return (
    <div className="welcome-page">
      {/* Background Glow */}
      <div className="welcome-glow" aria-hidden="true"></div>

      <div className="welcome-content">

        {/* AstraAI Logo */}
        <div className="welcome-logo">
          <svg
            width="72"
            height="72"
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M28 2 L33 23 L54 28 L33 33 L28 54 L23 33 L2 28 L23 23 Z"
              fill="url(#astra-gradient)"
            />

            <defs>
              <linearGradient
                id="astra-gradient"
                x1="2"
                y1="2"
                x2="54"
                y2="54"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Project Name */}
        <h1 className="welcome-title">
          AstraAI
        </h1>

        {/* Tagline */}
        <p className="welcome-tagline">
          Your intelligent generative AI assistant
        </p>

        <p className="welcome-description">
          Ask questions, learn, code, and create with AstraAI.
        </p>

        {/* Buttons */}
        <div className="welcome-actions">

          <button
            className="welcome-btn welcome-btn-primary"
            onClick={onLogin}
          >
            Log in
          </button>

          <button
            className="welcome-btn welcome-btn-secondary"
            onClick={onRegister}
          >
            Create account
          </button>

        </div>

        {/* Small Footer */}
        <p className="welcome-footer">
          Powered by Generative AI
        </p>

      </div>
    </div>
  );
}