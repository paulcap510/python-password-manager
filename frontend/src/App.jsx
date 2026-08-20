import { useEffect, useState } from 'react';
import UnlockScreen from './components/UnlockScreen';
import AddEntryForm from './components/AddEntryForm';
import EntryTable from './components/EntryTable';
import ChangePasswordForm from './components/ChangePasswordForm';
import './App.css';

function App() {
  const [currentEntries, setCurrentEntries] = useState([]);
  const [output, setOutput] = useState('');

  //! Lock timer to lock the screen after inactivity — set to 10 sec for testing
  useEffect(() => {
    let lockTimer = null;

    const resetLockTimer = () => {
      if (lockTimer) clearTimeout(lockTimer);
      lockTimer = setTimeout(async () => {
        await window.pywebview.api.lock();
        setCurrentEntries([]);
        setOutput('Vault auto-locked due to inactivity');
      }, 10000);
    };

    document.addEventListener('click', resetLockTimer);
    document.addEventListener('keydown', resetLockTimer);

    return () => {
      document.removeEventListener('click', resetLockTimer);
      document.removeEventListener('keydown', resetLockTimer);
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, []);

  return (
    <>
      <h1>Password Manager</h1>

      <UnlockScreen onEntriesChange={setCurrentEntries} onOutput={setOutput} />

      <AddEntryForm
        entries={currentEntries}
        onEntriesChange={setCurrentEntries}
        onOutput={setOutput}
      />

      <ChangePasswordForm onEntriesChange={setCurrentEntries} onOutput={setOutput} />

      <h2>Entries</h2>
      <div id="entriesList">
        <EntryTable entries={currentEntries} onEntriesChange={setCurrentEntries} />
      </div>

      <p id="output">{output}</p>
    </>
  );
}

export default App;
