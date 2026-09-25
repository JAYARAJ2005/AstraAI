import React from "react";

function Settings({
  darkMode,
  onToggleDarkMode,
  onClearChat,
  onExportChat,
  onLogout,
  onClose,
}) {
  return (
    <div className="settings-overlay">

      {/* ======================================
          SETTINGS PANEL
      ====================================== */}

      <div className="settings-panel">

        {/* HEADER */}

        <div className="settings-header">

          <h2>
            ⚙️ Settings
          </h2>

          <button
            className="settings-close-btn"
            onClick={onClose}
            title="Close"
          >
            ×
          </button>

        </div>

        {/* ======================================
            SETTINGS CONTENT
        ====================================== */}

        <div className="settings-content">

          {/* DARK MODE */}

          <div className="settings-item">

            <div className="settings-item-info">

              <span className="settings-icon">
                {darkMode
                  ? "☀️"
                  : "🌙"}
              </span>

              <div>
                <div className="settings-item-title">
                  Dark Mode
                </div>

                <div className="settings-item-description">
                  {darkMode
                    ? "Dark theme is enabled"
                    : "Use dark theme"}
                </div>
              </div>

            </div>

            <button
              className={
                darkMode
                  ? "settings-toggle active"
                  : "settings-toggle"
              }
              onClick={
                onToggleDarkMode
              }
              aria-label="Toggle dark mode"
            >
              <span></span>
            </button>

          </div>

          {/* ==================================
              CLEAR CHAT
          ================================== */}

          <button
            className="settings-action-btn"
            onClick={onClearChat}
          >

            <span className="settings-action-icon">
              🧹
            </span>

            <span>
              Clear Current Chat
            </span>

          </button>

          {/* ==================================
              EXPORT CHAT
          ================================== */}

          <button
            className="settings-action-btn"
            onClick={onExportChat}
          >

            <span className="settings-action-icon">
              📥
            </span>

            <span>
              Export Chat
            </span>

          </button>

          {/* ==================================
              LOGOUT
          ================================== */}

          <button
            className="settings-action-btn logout-btn"
            onClick={onLogout}
          >

            <span className="settings-action-icon">
              🚪
            </span>

            <span>
              Logout
            </span>

          </button>

        </div>

      </div>

    </div>
  );
}

export default Settings;