import { useEffect, useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

const STRENGTH_COLORS = ['#e85b64', '#f4ad32', '#f4ad32', '#39b95f', '#39b95f'];

function RightSideBar({ entry, onEntriesChange }) {
  const [revealed, setRevealed] = useState(false);
  const [passwordScore, setPasswordScore] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editSite, setEditSite] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    if (!entry) return;

    let cancelled = false;

    (async () => {
      const result = await window.pywebview.api.check_password_strength(
        entry.password,
      );

      if (!cancelled) {
        setPasswordScore(result.score);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entry]);

  const handleSave = async () => {
    const result = await window.pywebview.api.edit_entry(
      entry.id,
      editSite,
      editUsername,
      editPassword,
    );

    if (result.success) {
      onEntriesChange(result.entries);
      setRevealed(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${entry.site}"?`,
    );

    if (!confirmed) return;

    const result = await window.pywebview.api.delete_entry(entry.id);

    if (result.success) {
      onEntriesChange(result.entries);
    }
  };

  const handleCancel = () => {
    setEditSite(entry.site);
    setEditUsername(entry.username);
    setEditPassword(entry.password);
    setRevealed(false);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setEditSite(entry.site);
    setEditUsername(entry.username);
    setEditPassword(entry.password);
    setRevealed(false);
    setIsEditing(true);
  };

  if (!entry) {
    return (
      <div className="right-sidebar card">
        <p className="sidebar-empty-state">
          Select an entry to see its details here.
        </p>
      </div>
    );
  }

  return (
    <div className="right-sidebar card">
      <div className="sidebar-header">
        <div className="entry-icon">{entry.site.charAt(0).toUpperCase()}</div>

        <div>
          <h2>{entry.site}</h2>
          <p className="sidebar-subtext">{entry.username}</p>
        </div>
      </div>

      <div className="sidebar-field">
        <label>Website</label>

        {isEditing ? (
          <input
            type="text"
            className="entry-input"
            value={editSite}
            onChange={(e) => setEditSite(e.target.value)}
          />
        ) : (
          <div className="sidebar-field-box">
            <span>{entry.site}</span>

            <button
              type="button"
              className="icon-button"
              onClick={() => copyToClipboard(entry.site)}
            >
              📋
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-field">
        <label>Username</label>

        {isEditing ? (
          <input
            type="text"
            className="entry-input"
            value={editUsername}
            onChange={(e) => setEditUsername(e.target.value)}
          />
        ) : (
          <div className="sidebar-field-box">
            <span>{entry.username}</span>

            <button
              type="button"
              className="icon-button"
              onClick={() => copyToClipboard(entry.username)}
            >
              📋
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-field">
        <label>Password</label>

        {isEditing ? (
          <div className="sidebar-field-box">
            <input
              type={revealed ? 'text' : 'password'}
              className="entry-input"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />

            <button
              type="button"
              className="icon-button"
              onClick={() => setRevealed((current) => !current)}
            >
              {revealed ? 'Hide' : 'Show'}
            </button>
          </div>
        ) : (
          <div className="sidebar-field-box">
            <span className="password-value">
              {revealed ? entry.password : '••••••••'}
            </span>

            <button
              type="button"
              className="icon-button"
              onClick={() => setRevealed((current) => !current)}
            >
              {revealed ? 'Hide' : 'Show'}
            </button>

            <button
              type="button"
              className="icon-button"
              onClick={() => copyToClipboard(entry.password)}
            >
              📋
            </button>
          </div>
        )}

        {passwordScore !== null && (
          <div className="strength-bar-row">
            <div className="strength-bar-track">
              <div
                className="strength-bar-fill"
                style={{
                  width: `${(passwordScore + 1) * 20}%`,
                  backgroundColor: STRENGTH_COLORS[passwordScore],
                }}
              />
            </div>

            <span
              className="strength-bar-label"
              style={{
                color: STRENGTH_COLORS[passwordScore],
              }}
            >
              {STRENGTH_LABELS[passwordScore]}
            </span>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="sidebar-edit-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>

          <button type="button" className="button-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      ) : (
        <div className="sidebar-edit-actions">
          <button
            type="button"
            className="button-secondary"
            onClick={handleStartEditing}
          >
            Edit Entry
          </button>

          <button
            type="button"
            className="button-danger"
            onClick={handleDelete}
          >
            Delete Entry
          </button>
        </div>
      )}
    </div>
  );
}

export default RightSideBar;
