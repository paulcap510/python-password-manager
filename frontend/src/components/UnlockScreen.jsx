import { useEffect, useState } from 'react';

function UnlockScreen({ onEntriesChange, onUnlockedChange }) {
  const [masterPassword, setMasterPassword] = useState('');
  const [vaultExists, setVaultExists] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    window.pywebview.api.vault_exists().then((result) => {
      if (!cancelled) setVaultExists(result.exists);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreateVault = async () => {
    const result = await window.pywebview.api.create_vault(masterPassword);
    setMasterPassword('');
    if (result.success) {
      setErrorMessage('');
      onEntriesChange(result.entries);
      onUnlockedChange(true);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleUnlock = async () => {
    const result = await window.pywebview.api.unlock(masterPassword);
    setMasterPassword('');
    if (result.success) {
      setErrorMessage('');
      onEntriesChange(result.entries);
      onUnlockedChange(true);
    } else {
      setErrorMessage(result.message);
    }
  };

  if (vaultExists === null) {
    return <div className="unlock-screen card" />;
  }

  const handleSubmit = vaultExists ? handleUnlock : handleCreateVault;

  return (
    <div className="unlock-screen card">
      <div className="unlock-icon-badge" aria-hidden="true">
        🔒
      </div>

      <div className="unlock-heading">
        <p className="unlock-app-label">Password Vault</p>
        <h2>{vaultExists ? 'Welcome back' : 'Set up your vault'}</h2>
        <p className="unlock-subcopy">
          {vaultExists ? 'Unlock your vault' : 'Create a master password'}
        </p>
      </div>

      <div className="unlock-field">
        <label htmlFor="master-password">Master Password</label>
        <div className="unlock-input-wrapper">
          <span className="unlock-input-icon" aria-hidden="true">
            🔒
          </span>
          <input
            type="password"
            id="master-password"
            className="entry-input unlock-password-input"
            placeholder="Master password"
            value={masterPassword}
            onChange={(e) => {
              setMasterPassword(e.target.value);
              setErrorMessage('');
            }}
          />
        </div>
      </div>

      <div className="unlock-actions">
        <button
          type="button"
          className="button-primary unlock-submit"
          onClick={handleSubmit}
        >
          {vaultExists ? 'Unlock' : 'Create Vault'}
        </button>
      </div>

      {errorMessage && (
        <p className="unlock-error" role="alert">
          <span aria-hidden="true">⚠️</span> {errorMessage}
        </p>
      )}

      <p className="unlock-trust-copy">
        Your data is encrypted locally and never leaves your device.
      </p>
    </div>
  );
}

export default UnlockScreen;
