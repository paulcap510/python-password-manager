# Offline Password Manager

An offline, open-source password manager built as a desktop app using Python (PyWebview) for the backend and React (Vite) for the frontend. No cloud, no accounts, no network calls at runtime, and everything lives in a single encrypted file on your own machine.

## Features

### Security

- **Strong encryption at rest** — Argon2id key derivation (password → key) combined with AES-256-GCM authenticated encryption for the vault file.
- **Master password change** — re-encrypts the entire vault with a new key without ever exposing plaintext outside the app.
- **Auto-lock** — clears the encryption key from memory after a period of inactivity, requiring re-authentication. A manual "Lock Vault" action is also available at any time.
- **Failed-login rate limiting** — 5 failed unlock attempts trigger a time-based lockout that expires automatically (not a permanent counter-based block).
- **File permission hardening** — the vault file is restricted to owner-only read/write access (`chmod 0600`) on every save.
- **Clipboard auto-clear** — copied passwords are automatically wiped from the system clipboard after a short delay, implemented via Python's `pyperclip` rather than the browser Clipboard API (which blocks delayed writes that aren't tied to a direct user gesture).
- **Password strength feedback** — live strength scoring via `zxcvbn` (crackability-based, not naive character-class rules), shown as a color-coded bar and label.
- **Password generator** — generates cryptographically secure random passwords via Python's `secrets` module.
- **Duplicate-entry protection** — warns (client-side, live) and blocks (server-side, authoritative) adding a duplicate site/username pair.

### Vault management

- **Full entry management** — add, edit, and delete site/username/password entries.
- **Search** — live client-side filtering of entries by site or username.
- **Copy-to-clipboard and reveal-on-demand** for both usernames and passwords, so plaintext is never shown unless deliberately requested.
- **First-run detection** — the unlock screen automatically shows only the relevant action (Create Vault vs. Unlock) based on whether a vault already exists, rather than presenting both options at once.

## Interface

The frontend is a three-column layout inspired by common password manager conventions:

- **Left sidebar** — branding, navigation, a category list (currently a visual placeholder, see Known Limitations), and a manual "Lock Vault" action.
- **Center column** — a search bar, a hero banner with the primary actions (Add Entry, Generate Password, Lock Vault), and a scrollable list of vault entries.
- **Right panel** — a persistent detail view for the selected entry, showing its website, username, and password (masked by default, with reveal/copy controls and a live strength bar), plus inline
  editing and delete.

## Tech Stack

- **Backend:** Python, [PyWebview](https://pywebview.flowrl.com/), `cryptography` (AES-GCM), `argon2-cffi` (Argon2id), `zxcvbn`, `pyperclip`
- **Frontend:** React (Vite), plain CSS (custom properties for theming, no CSS framework), rendered in PyWebview's native webview. Built to a static bundle for fully offline operation. No dev server or network access required at runtime.

## Getting Started

```bash
git clone <your-repo-url>
cd pw-manager

# Backend
pip install -r requirements.txt

# Frontend (one-time build; requires Node/npm)
cd frontend
npm install
npm run build
cd ..

# Run the app
python main.py
```

On first launch, the app detects that no vault exists and presents a "Set up your vault" screen. Choose a strong master password. THERE IS NO PASSWORD RECOVERY. BE SURE TO STORE IT SOMEWHERE SAFE!! On subsequent launches, the app detects the existing vault and presents an "Unlock" screen instead.

## Security Model

This app is designed to protect your credentials **if the vault file itself is stolen or copied** without your master password, the file is computationally infeasible to decrypt.

It does **not**, and cannot, protect against:

- A keylogger or malware already running on your machine (which could capture your master password directly, or read process memory)
- A compromised operating system generally

This matches the threat model of essentially all local password managers: defending the data at rest, not the machine it runs on.

### Known limitations

- Python cannot wipe sensitive data from memory the way lower-level languages like Rust can. Deleting the in-memory key removes the reference, but the underlying bytes may briefly persist until garbage collection.
- Clipboard auto-clear only reliably fires while the app window retains focus, due to platform clipboard behavior.
- No built-in password recovery by design. There is no server, and therefore no way to recover a forgotten master password (same limitation as KeePass and similar offline tools).
- The sidebar's category list (Work/Personal/Finance/Secure Notes) is currently a visual placeholder showing honest zero counts. Categorization is not yet implemented as a real feature, and no entry can currently be assigned to a category.
- "Favorites" and "Settings" in the sidebar are likewise present in the UI but not yet functional.

## Roadmap / Possible Future Work

- Real category/favorites functionality (currently placeholder UI only, deliberately not backed by fabricated data)
- Per-entry notes field
- Last-modified timestamp tracking
- Separate authentication (`unlock`) from data retrieval into distinct API calls, for cleaner separation of concerns
- Atomic vault writes (write-to-temp + rename) for crash safety
- Export/import functionality
