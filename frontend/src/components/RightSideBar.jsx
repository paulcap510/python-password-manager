import { useEffect, useState } from 'react';

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['#e85b64', '#f4ad32', '#f4ad32', '#39b95f', '#39b95f'];

import { copyToClipboard } from '../utils/clipboard';

function RightSideBar({ entry }) {
  const [revealed, setRevealed] = useState(false);
  const [passwordScore, setPasswordScore] = useState(null);

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
      </div>

      <div className="sidebar-field">
        <label>Username</label>
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
      </div>

      <div className="sidebar-field">
        <label>Password</label>
        <div className="sidebar-field-box">
          <span>{revealed ? entry.password : '••••••••'}</span>

          <button
            type="button"
            className="icon-button"
            onClick={() => setRevealed(!revealed)}
          >
            {revealed ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="icon-button"
            onClick={() => copyToClipboard(entry.password)}
          >
            📋
          </button>
        </div>

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
              style={{ color: STRENGTH_COLORS[passwordScore] }}
            >
              {STRENGTH_LABELS[passwordScore]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default RightSideBar;
