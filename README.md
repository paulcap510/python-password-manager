# Offline Password Manager

A fully offline, open-source password manager built as a desktop app using
Python (PyWebview) and vanilla HTML/CSS/JS. No cloud, no accounts, no
network calls — everything lives in a single encrypted file on your own
machine.

## Features

- **Strong encryption at rest** — Argon2id key derivation (password → key)
  combined with AES-256-GCM authenticated encryption for the vault file.
- **Full entry management** — add, edit, and delete site/username/password
  entries, with a live-updating table UI.
- **Master password change** — re-encrypts the entire vault with a new key
  without ever exposing plaintext outside the app.
- **Auto-lock** — clears the encryption key from memory after a period of
  inactivity, requiring re-authentication.
- **Clipboard auto-clear** — copied passwords are automatically wiped from
  the system clipboard after a short delay (implemented via Python's
  `pyperclip`, since the browser Clipboard API blocks delayed writes that
  aren't tied to a direct user gesture).
- **Password strength feedback** — live strength scoring via `zxcvbn`
  (crackability-based, not naive character-class rules).
- **Password generator** — generates cryptographically secure random
  passwords via Python's `secrets` module.
- **Duplicate-entry protection** — warns (client-side, live) and blocks
  (server-side, authoritative) adding a duplicate site/username pair.
- **Failed-login rate limiting** — 5 failed unlock attempts trigger a
  30-second, time-based lockout.
- **File permission hardening** — the vault file is restricted to
  owner-only read/write access (`chmod 0600`) on every save.

## Tech Stack

- **Backend:** Python, [PyWebview](https://pywebview.flowrl.com/),
  `cryptography` (AES-GCM), `argon2-cffi` (Argon2id), `zxcvbn`,
  `pyperclip`
- **Frontend:** Plain HTML, CSS, and JavaScript (no framework), rendered
  in PyWebview's native webview

## Getting Started

```bash
git clone <your-repo-url>
cd pw-manager
pip install -r requirements.txt
python main.py
```

On first launch, create a vault with a strong master password. From then
on, unlock with that same password to access your saved entries.

## Security Model

This app is designed to protect your credentials **if the vault file
itself is stolen or copied** — without your master password, the file is
computationally infeasible to decrypt.

It does **not**, and cannot, protect against:

- A keylogger or malware already running on your machine (which could
  capture your master password directly, or read process memory)
- A compromised operating system generally

This matches the threat model of essentially all local password managers
— defending the data at rest, not the machine it runs on.

### Known limitations

- Python cannot deterministically wipe sensitive data from memory the
  way lower-level languages can; `del self.key` removes the reference,
  but the underlying bytes may briefly persist until garbage collection.
- Clipboard auto-clear only reliably fires while the app window retains
  focus, due to browser Clipboard API restrictions.
- No built-in password recovery — by design. There is no server, and
  therefore no way to recover a forgotten master password (same
  limitation as KeePass and similar offline tools).

## Roadmap / Possible Future Work

- Separate authentication (`unlock`) from data retrieval into distinct
  API calls, for cleaner separation of concerns
- Atomic vault writes (write-to-temp + rename) for crash safety
- Export/import functionality
- React-based frontend (in progress on a separate branch)
