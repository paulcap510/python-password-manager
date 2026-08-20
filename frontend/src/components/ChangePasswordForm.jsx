import { useState } from 'react';

function ChangePasswordForm({ onEntriesChange, onOutput }) {
  const [newMasterPassword, setNewMasterPassword] = useState('');

  const handleChangePassword = async () => {
    const result = await window.pywebview.api.change_master_password(newMasterPassword);
    onOutput(result.message);
    setNewMasterPassword('');
    onEntriesChange(result.entries);
  };

  return (
    <>
      <h2>Change Master Password</h2>
      <div>
        <label htmlFor="new-master-password">New Master Password:</label>
        <input
          type="password"
          id="new-master-password"
          placeholder="New master password"
          value={newMasterPassword}
          onChange={(e) => setNewMasterPassword(e.target.value)}
        />
      </div>
      <button type="button" onClick={handleChangePassword}>
        Change Master Password
      </button>
    </>
  );
}

export default ChangePasswordForm;
