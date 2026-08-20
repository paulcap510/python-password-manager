import { useState } from 'react';

function ChangePasswordForm({ onEntriesChange, onOutput, onSuccessClose }) {
  const [newMasterPassword, setNewMasterPassword] = useState('');

  const handleChangePassword = async () => {
    const result =
      await window.pywebview.api.change_master_password(newMasterPassword);
    onOutput(result.message);
    setNewMasterPassword('');
    if (result.success) {
      onEntriesChange(result.entries);
      onSuccessClose?.();
    }
  };

  return (
    <div className="change-password-form card">
      <h2>Change Master Password</h2>
      <div className="form-field">
        <label htmlFor="new-master-password">New Master Password:</label>
        <input
          type="password"
          id="new-master-password"
          className="entry-input"
          placeholder="New master password"
          value={newMasterPassword}
          onChange={(e) => setNewMasterPassword(e.target.value)}
        />
      </div>
      <button
        type="button"
        className="button-primary"
        onClick={handleChangePassword}
      >
        Change Master Password
      </button>
    </div>
  );
}

export default ChangePasswordForm;
