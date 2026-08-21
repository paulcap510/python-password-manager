import { useState, useEffect } from 'react';

function EyeOpenIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SettingsModal({ onClose, autoLockSeconds, onAutoLockSecondsChange }) {
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [clipboardSeconds, setClipboardSeconds] = useState(5);
  const [passwordLength, setPasswordLength] = useState(16);
  const [message, setMessage] = useState('');
  const [showMasterPassword, setShowMasterPassword] = useState(false);

  useEffect(() => {
    window.pywebview.api.get_settings().then((settings) => {
      setClipboardSeconds(settings.clipboard_clear_seconds);
      setPasswordLength(settings.default_password_length);
    });
  }, []);
  const handleChangeMasterPassword = async () => {
    if (!newMasterPassword) {
      setMessage('Please enter a new master password.');
      return;
    }

    const result =
      await window.pywebview.api.change_master_password(newMasterPassword);

    setMessage(result.message);

    if (result.success) {
      setNewMasterPassword('');
      setShowMasterPassword(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal card" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div>
            <h2>Settings</h2>
            <p>Manage your vault preferences.</p>
          </div>

          <button
            type="button"
            className="settings-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="settings-section">
          <h3>Security</h3>

          <div className="settings-field">
            <label htmlFor="new-master-password">Change Master Password</label>

            <div className="settings-password-row">
              <input
                id="new-master-password"
                type={showMasterPassword ? 'text' : 'password'}
                className="entry-input"
                placeholder="Enter new master password"
                value={newMasterPassword}
                onChange={(e) => setNewMasterPassword(e.target.value)}
              />

              <button
                type="button"
                className="icon-button settings-visibility-button"
                onClick={() => setShowMasterPassword((current) => !current)}
                aria-label={
                  showMasterPassword ? 'Hide password' : 'Show password'
                }
              >
                {showMasterPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </button>
            </div>

            <button
              type="button"
              className="button-primary"
              onClick={handleChangeMasterPassword}
            >
              Update Password
            </button>
          </div>

          <div className="settings-field">
            <label htmlFor="auto-lock-time">Auto-lock vault after</label>

            <select
              id="auto-lock-time"
              value={autoLockSeconds}
              onChange={async (e) => {
                const newValue = Number(e.target.value);

                onAutoLockSecondsChange(newValue);

                await window.pywebview.api.update_setting(
                  'auto_lock_seconds',
                  newValue,
                );
              }}
            >
              <option value={20}>20 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={1800}>30 minutes</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Clipboard</h3>

          <div className="settings-field">
            <label htmlFor="clipboard-time">Clear copied passwords after</label>

            <select
              id="clipboard-time"
              value={clipboardSeconds}
              onChange={async (e) => {
                const newValue = Number(e.target.value);

                setClipboardSeconds(newValue);

                await window.pywebview.api.update_setting(
                  'clipboard_clear_seconds',
                  newValue,
                );
              }}
            >
              <option value={5}>5 seconds</option>
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Password Generator</h3>

          <div className="settings-field">
            <label htmlFor="password-length">Default password length</label>

            <input
              id="password-length"
              type="number"
              className="entry-input"
              min="8"
              max="128"
              value={passwordLength}
              onChange={async (e) => {
                const newValue = Number(e.target.value);

                setPasswordLength(newValue);

                await window.pywebview.api.update_setting(
                  'default_password_length',
                  newValue,
                );
              }}
            />
          </div>
        </div>

        <div className="settings-section settings-about">
          <h3>About</h3>

          <p>Password Vault</p>
          <span>Version 1.0.0</span>
        </div>

        {message && <p className="settings-message">{message}</p>}
      </div>
    </div>
  );
}

export default SettingsModal;
