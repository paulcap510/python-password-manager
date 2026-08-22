import { useEffect, useRef, useState } from 'react';
import UnlockScreen from './components/UnlockScreen';
import AddEntryForm from './components/AddEntryForm';
import EntryTable from './components/EntryTable';
import RightSideBar from './components/RightSideBar';
import SidebarNav from './components/SidebarNav';
import SettingsModal from './components/SettingsModal';
import OverviewPanel from './components/OverviewPanel';
import './App.css';
import heroImage from './assets/hero-safe.png';

function App() {
  const [currentEntries, setCurrentEntries] = useState([]);
  const [output, setOutput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeForm, setActiveForm] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [autoLockSeconds, setAutoLockSeconds] = useState(20);
  const searchInputRef = useRef(null);

  // overview
  const [showOverview, setShowOverview] = useState(false);

  const [activeFilter, setActiveFilter] = useState('all');

  const filteredEntries = currentEntries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      entry.site.toLowerCase().includes(query) ||
      entry.username.toLowerCase().includes(query);
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'favorites' && entry.favorite === true) ||
      entry.category === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const selectedEntry =
    currentEntries.find((entry) => entry.id === selectedEntryId) ??
    (isUnlocked ? currentEntries[0] : undefined) ??
    null;

  useEffect(() => {
    window.pywebview.api.get_settings().then((settings) => {
      setAutoLockSeconds(settings.auto_lock_seconds);
    });
  }, []);

  useEffect(() => {
    let lockTimer = null;

    const resetLockTimer = () => {
      if (lockTimer) clearTimeout(lockTimer);
      lockTimer = setTimeout(async () => {
        await window.pywebview.api.lock();
        setCurrentEntries([]);
        setIsUnlocked(false);
        setSelectedEntryId(null);
        setOutput('Vault auto-locked due to inactivity');
      }, autoLockSeconds * 1000);
    };

    document.addEventListener('click', resetLockTimer);
    document.addEventListener('keydown', resetLockTimer);
    resetLockTimer();

    return () => {
      document.removeEventListener('click', resetLockTimer);
      document.removeEventListener('keydown', resetLockTimer);
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, [autoLockSeconds]);

  // const handleEditEntry = (entry) => {
  //   setSelectedEntryId(entry.id);
  //   setEditRequestId((id) => id + 1);
  // };

  const handleLock = async () => {
    await window.pywebview.api.lock();
    setCurrentEntries([]);
    setIsUnlocked(false);
    setSelectedEntryId(null);
  };

  return (
    <div className="app-shell">
      {!isUnlocked && (
        <div className="unlock-view">
          <UnlockScreen
            onEntriesChange={setCurrentEntries}
            onOutput={setOutput}
            onUnlockedChange={(unlocked) => {
              setIsUnlocked(unlocked);
              if (unlocked) setOutput('');
            }}
          />
        </div>
      )}

      {isUnlocked && (
        <>
          <div className="app-layout">
            <SidebarNav
              entries={currentEntries}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onOpenOverview={() => setShowOverview((current) => !current)}
              overviewActive={showOverview}
              onLock={handleLock}
              onOpenSettings={() =>
                setActiveForm(activeForm === 'settings' ? null : 'settings')
              }
              settingsActive={activeForm === 'settings'}
            />

            <div className="center-column">
              <div className="search-bar-row">
                <div className="search-input-wrapper">
                  <span className="search-icon" aria-hidden="true">
                    🔍
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="entry-input search-input"
                    placeholder="Search vault..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="icon-button search-clear-button"
                      onClick={() => {
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div
                className="hero-card"
                style={{ backgroundImage: `url(${heroImage})` }}
              >
                <div className="hero-actions">
                  <button
                    type="button"
                    className="button-primary"
                    onClick={() =>
                      setActiveForm(activeForm === 'add' ? null : 'add')
                    }
                  >
                    <span aria-hidden="true">➕</span> Add Entry
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() =>
                      setActiveForm(activeForm === 'add' ? null : 'add')
                    }
                  >
                    <span aria-hidden="true">🪄</span> Generate Password
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={handleLock}
                  >
                    <span aria-hidden="true">🔒</span> Lock Vault
                  </button>
                </div>
              </div>

              {activeForm === 'add' && (
                <AddEntryForm
                  entries={currentEntries}
                  onEntriesChange={setCurrentEntries}
                  onOutput={setOutput}
                  onSuccessClose={() => setActiveForm(null)}
                />
              )}

              <div className="main-content card">
                <h2 className="section-heading">
                  Entries{' '}
                  <span className="section-count">
                    ({filteredEntries.length})
                  </span>
                </h2>
                <div id="entriesList">
                  {searchQuery && filteredEntries.length === 0 ? (
                    <p className="empty-state-message">
                      No entries match '{searchQuery}'
                    </p>
                  ) : (
                    <EntryTable
                      entries={filteredEntries}
                      onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
                      onEntriesChange={setCurrentEntries}
                    />
                  )}
                </div>
              </div>
            </div>

            <RightSideBar
              entry={selectedEntry}
              onEntriesChange={setCurrentEntries}
            />
          </div>
          {activeForm === 'settings' && (
            <SettingsModal
              onClose={() => setActiveForm(null)}
              autoLockSeconds={autoLockSeconds}
              onAutoLockSecondsChange={setAutoLockSeconds}
            />
          )}

          {showOverview && (
            <OverviewPanel
              onClose={() => setShowOverview(false)}
              onSelectEntry={(entryId) => {
                setSelectedEntryId(entryId);
                setShowOverview(false);
              }}
              entries={currentEntries}
            />
          )}
        </>
      )}

      <p id="output">{output}</p>
    </div>
  );
}

export default App;
