import { useState } from 'react';

function SettingsModal({ onClose }) {
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [clipboardSeconds, setClipboardSeconds] = useState(5);
  const [passwordLength, setPasswordLength] = useState(16);
  const [message, setMessage] = useState('');

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

            <input
              id="new-master-password"
              type="password"
              className="entry-input"
              placeholder="Enter new master password"
              value={newMasterPassword}
              onChange={(e) => setNewMasterPassword(e.target.value)}
            />

            <button
              type="button"
              className="button-primary"
              onClick={handleChangeMasterPassword}
            >
              Update Password
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3>Clipboard</h3>

          <div className="settings-field">
            <label htmlFor="clipboard-time">Clear copied passwords after</label>

            <select
              id="clipboard-time"
              value={clipboardSeconds}
              onChange={(e) => setClipboardSeconds(Number(e.target.value))}
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
              onChange={(e) => setPasswordLength(Number(e.target.value))}
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
