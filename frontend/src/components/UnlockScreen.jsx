import { useState } from 'react';

function UnlockScreen({ onEntriesChange, onOutput }) {
  const [masterPassword, setMasterPassword] = useState('');

  const handleCreateVault = async () => {
    const result = await window.pywebview.api.create_vault(masterPassword);
    onOutput(result.message);
    onEntriesChange(result.entries);
  };

  const handleUnlock = async () => {
    const result = await window.pywebview.api.unlock(masterPassword);
    onOutput(result.message);
    onEntriesChange(result.entries);
  };

  return (
    <>
      <div>
        <label htmlFor="master-password">Master Password:</label>
        <input
          type="password"
          id="master-password"
          placeholder="Master password"
          value={masterPassword}
          onChange={(e) => setMasterPassword(e.target.value)}
        />
      </div>

      <button type="button" onClick={handleCreateVault}>
        Create Vault
      </button>
      <button type="button" onClick={handleUnlock}>
        Unlock
      </button>
    </>
  );
}

export default UnlockScreen;
