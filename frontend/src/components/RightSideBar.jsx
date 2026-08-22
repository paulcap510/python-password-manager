import { useEffect, useState } from 'react';
import { copyToClipboard } from '../utils/clipboard';
import { getCategoryInfo } from '../constants/categories';

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

const STRENGTH_COLORS = ['#e85b64', '#f4ad32', '#f4ad32', '#39b95f', '#39b95f'];

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

function RightSideBar({ entry, onEntriesChange }) {
  const [revealed, setRevealed] = useState(false);
  const [passwordScore, setPasswordScore] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editSite, setEditSite] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const categoryInfo = entry ? getCategoryInfo(entry.category) : null;

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
      editCategory,
    );

    if (result.success) {
      onEntriesChange(result.entries);
      setRevealed(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    const result = await window.pywebview.api.delete_entry(entry.id);

    if (result.success) {
      onEntriesChange(result.entries);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    setEditSite(entry.site);
    setEditUsername(entry.username);
    setEditPassword(entry.password);
    setEditCategory(entry.category);
    setRevealed(false);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setEditSite(entry.site);
    setEditUsername(entry.username);
    setEditPassword(entry.password);
    setEditCategory(entry.category);
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
    <>
      <div className="right-sidebar card">
        <div className="sidebar-header">
          <div className="entry-icon">{entry.site.charAt(0).toUpperCase()}</div>

          <div className="sidebar-header-content">
            <h2>{entry.site}</h2>

            {categoryInfo && (
              <span
                className="category-badge"
                style={{
                  '--category-bg': `var(${categoryInfo.bgVar})`,
                  '--category-color': `var(${categoryInfo.colorVar})`,
                }}
              >
                {entry.category}
              </span>
            )}
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

        {isEditing && (
          <div className="sidebar-field">
            <label>Category</label>

            <select
              className="entry-input"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Finance">Finance</option>
              <option value="Other">Other</option>
            </select>
          </div>
        )}

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
                aria-label={revealed ? 'Hide password' : 'Show password'}
              >
                {revealed ? <EyeClosedIcon /> : <EyeOpenIcon />}
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
                aria-label={revealed ? 'Hide password' : 'Show password'}
              >
                {revealed ? <EyeClosedIcon /> : <EyeOpenIcon />}
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

            <button
              type="button"
              className="button-primary"
              onClick={handleSave}
            >
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
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Entry
            </button>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="delete-modal card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon">!</div>

            <h2>Delete Entry?</h2>

            <p>
              Are you sure you want to delete <strong>{entry.site}</strong>?
            </p>

            <p className="delete-modal-warning">
              This action cannot be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="button-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RightSideBar;
