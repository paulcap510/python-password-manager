import { useEffect, useState } from 'react';

const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

const STRENGTH_COLORS = ['#e85b64', '#f4ad32', '#f4ad32', '#39b95f', '#39b95f'];

function OverviewPanel({ onClose, onSelectEntry, entries = [] }) {
  const [scoresState, setScoresState] = useState({
    entries: null,
    scoresById: {},
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const results = await Promise.all(
        entries.map(async (entry) => {
          const result = await window.pywebview.api.check_password_strength(
            entry.password,
          );
          return [entry.id, result.score];
        }),
      );

      if (!cancelled) {
        setScoresState({ entries, scoresById: Object.fromEntries(results) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entries]);

  const totalCount = entries.length;
  const favoritesCount = entries.filter(
    (entry) => entry.favorite === true,
  ).length;

  // Scores only apply once they were computed for this exact entries snapshot.
  const scoresLoaded = scoresState.entries === entries;
  const scoresById = scoresState.scoresById;

  const weakEntries = scoresLoaded
    ? entries.filter((entry) => scoresById[entry.id] <= 1)
    : [];

  const okayCount = scoresLoaded
    ? entries.filter((entry) => scoresById[entry.id] >= 2 && scoresById[entry.id] <= 3)
        .length
    : 0;

  const strongCount = scoresLoaded
    ? entries.filter((entry) => scoresById[entry.id] === 4).length
    : 0;

  const passwordGroups = {};
  entries.forEach((entry) => {
    if (!entry.password) return;
    if (!passwordGroups[entry.password]) passwordGroups[entry.password] = [];
    passwordGroups[entry.password].push(entry);
  });

  const reusedEntries = Object.values(passwordGroups)
    .filter((group) => group.length > 1)
    .flat();

  const handleSelect = (entry) => {
    onSelectEntry(entry.id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal card" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div>
            <h2>Vault Stats</h2>
            <p>A snapshot of what's stored in your vault.</p>
          </div>

          <button
            type="button"
            className="settings-close"
            onClick={onClose}
            aria-label="Close vault stats"
          >
            ×
          </button>
        </div>

        <div className="stats-summary-grid">
          <div className="stats-summary-card">
            <span className="stats-summary-value">{totalCount}</span>
            <span className="stats-summary-label">Total Entries</span>
          </div>

          <div className="stats-summary-card">
            <span className="stats-summary-value">{favoritesCount}</span>
            <span className="stats-summary-label">Favorites</span>
          </div>
        </div>

        <div className="settings-section">
          <h3>Security Health</h3>

          {!scoresLoaded ? (
            <p className="stats-empty">Scoring passwords…</p>
          ) : (
            <>
              <div className="stats-breakdown">
                <span style={{ color: STRENGTH_COLORS[0] }}>
                  {weakEntries.length} weak
                </span>
                <span aria-hidden="true">·</span>
                <span style={{ color: STRENGTH_COLORS[2] }}>
                  {okayCount} okay
                </span>
                <span aria-hidden="true">·</span>
                <span style={{ color: STRENGTH_COLORS[4] }}>
                  {strongCount} strong
                </span>
              </div>

              <div className="stats-flag-group">
                <div className="stats-flag-group-label">
                  Weak Passwords ({weakEntries.length})
                </div>

                {weakEntries.length === 0 ? (
                  <p className="stats-empty">No weak passwords found.</p>
                ) : (
                  <div className="stats-flag-list">
                    {weakEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className="stats-flag-row"
                        onClick={() => handleSelect(entry)}
                      >
                        <span className="stats-flag-info">
                          <span className="stats-flag-site">{entry.site}</span>
                          <span className="stats-flag-username">
                            {entry.username}
                          </span>
                        </span>

                        <span
                          className="stats-flag-badge"
                          style={{
                            '--flag-bg': `${STRENGTH_COLORS[scoresById[entry.id]]}22`,
                            '--flag-color': STRENGTH_COLORS[scoresById[entry.id]],
                          }}
                        >
                          {STRENGTH_LABELS[scoresById[entry.id]]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="stats-flag-group">
                <div className="stats-flag-group-label">
                  Reused Passwords ({reusedEntries.length})
                </div>

                {reusedEntries.length === 0 ? (
                  <p className="stats-empty">No reused passwords found.</p>
                ) : (
                  <div className="stats-flag-list">
                    {reusedEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        className="stats-flag-row"
                        onClick={() => handleSelect(entry)}
                      >
                        <span className="stats-flag-info">
                          <span className="stats-flag-site">{entry.site}</span>
                          <span className="stats-flag-username">
                            {entry.username}
                          </span>
                        </span>

                        <span
                          className="stats-flag-badge"
                          style={{
                            '--flag-bg': 'var(--primary-light)',
                            '--flag-color': 'var(--primary)',
                          }}
                        >
                          Used ×{passwordGroups[entry.password].length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OverviewPanel;
