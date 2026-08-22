import os
import json
import webview
from argon2.low_level import hash_secret_raw, Type
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.exceptions import InvalidTag
import uuid

import pyperclip
import threading
import time

from zxcvbn import zxcvbn

import secrets
import string

VAULT_FILE = "vault.dat"

DEFAULT_SETTINGS = {
    "clipboard_clear_seconds": 5,
    "default_password_length": 16,
    "auto_lock_seconds": 20,
}
SETTINGS_FILE = "settings.json"

SALT_SIZE = 16
NONCE_SIZE = 12


def derive_key(password: str, salt: bytes) -> bytes:
    return hash_secret_raw(
        secret=password.encode(),
        salt=salt,
        time_cost=3,
        memory_cost=65536,
        parallelism=4,
        hash_len=32,
        type=Type.ID,
    )


def secure_file_permissions():
    os.chmod(VAULT_FILE, 0o600)


def load_settings(file_path=SETTINGS_FILE):
    if not os.path.exists(file_path):
        return DEFAULT_SETTINGS.copy()
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            saved_settings = json.load(file)
        return {**DEFAULT_SETTINGS, **saved_settings}
    except json.JSONDecodeError:
        return DEFAULT_SETTINGS.copy()


def save_settings(settings, file_path=SETTINGS_FILE):
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(settings, file, indent=2)


class Api:
    def __init__(self):
        self.settings = load_settings()

    def _is_unlocked(self):
        return hasattr(self, "key")

    def get_settings(self):
        return self.settings

    def change_master_password(self, password):

        if not self._is_unlocked():
            return {
                "message": "Please unlock the vault first",
                "entries": [],
                "success": False,
            }

        if not password:
            return {
                "message": "New master password cannot be empty",
                "entries": self.entries,
                "success": False,
            }

        salt = os.urandom(SALT_SIZE)
        key = derive_key(password, salt)
        new_plaintext = json.dumps(self.entries).encode()
        aesgcm = AESGCM(key)
        nonce = os.urandom(NONCE_SIZE)
        encrypted = aesgcm.encrypt(nonce, new_plaintext, None)

        with open(VAULT_FILE, "wb") as f:
            f.write(salt)
            f.write(nonce)
            f.write(encrypted)
        secure_file_permissions()

        self.key = key
        return {
            "message": "Master password changed successfully",
            "entries": self.entries,
            "success": True,
        }

    def create_vault(self, password):
        if not password:
            return {
                "message": "Master password cannot be empty",
                "entries": [],
                "success": False,
            }

        if os.path.exists(VAULT_FILE):
            return {
                "message": "A vault already exists. Please unlock instead.",
                "entries": [],
                "success": False,
            }

        salt = os.urandom(SALT_SIZE)
        key = derive_key(password, salt)
        empty_vault = json.dumps([]).encode()
        aesgcm = AESGCM(key)
        nonce = os.urandom(NONCE_SIZE)
        encrypted = aesgcm.encrypt(nonce, empty_vault, None)
        with open(VAULT_FILE, "wb") as f:
            f.write(salt)
            f.write(nonce)
            f.write(encrypted)
        secure_file_permissions()
        self.key = key
        self.entries = []
        self.failed_attempts = 0
        return {"message": "Vault created successfully", "entries": [], "success": True}

    def unlock(self, password):
        if hasattr(self, "lockout_until") and time.time() < self.lockout_until:
            remaining = int(self.lockout_until - time.time())
            return {
                "message": f"Too many failed attempts. Try again in {remaining} seconds.",
                "entries": [],
                "success": False,
            }

        if not password:
            return {
                "message": "Master password cannot be empty",
                "entries": [],
                "success": False,
            }

        try:
            with open(VAULT_FILE, "rb") as f:
                data = f.read()
        except FileNotFoundError:
            return {
                "message": "No vault found. Please create one first.",
                "entries": [],
                "success": False,
            }

        salt = data[:SALT_SIZE]
        nonce = data[SALT_SIZE : SALT_SIZE + NONCE_SIZE]
        encrypted = data[SALT_SIZE + NONCE_SIZE :]
        key = derive_key(password, salt)
        aesgcm = AESGCM(key)
        try:
            decrypted = aesgcm.decrypt(nonce, encrypted, None)
            vault_data = json.loads(decrypted)
            self.key = key
            self.entries = vault_data
            self.failed_attempts = 0
            return {"message": "Unlocked", "entries": vault_data, "success": True}
        except InvalidTag:
            self.failed_attempts = getattr(self, "failed_attempts", 0) + 1
            if self.failed_attempts >= 5:
                self.lockout_until = time.time() + 30
            return {"message": "Wrong password", "entries": [], "success": False}

    def delete_entry(self, entry_id):
        if not self._is_unlocked():
            return {
                "message": "Please unlock the vault first",
                "entries": [],
                "success": False,
            }

        if not any(entry["id"] == entry_id for entry in self.entries):
            return {
                "message": "Entry not found",
                "entries": self.entries,
                "success": False,
            }

        self.entries = [entry for entry in self.entries if entry["id"] != entry_id]

        aesgcm = AESGCM(self.key)
        nonce = os.urandom(NONCE_SIZE)
        new_plaintext = json.dumps(self.entries).encode()
        encrypted = aesgcm.encrypt(nonce, new_plaintext, None)

        with open(VAULT_FILE, "rb") as f:
            salt = f.read(SALT_SIZE)

        with open(VAULT_FILE, "wb") as f:
            f.write(salt)
            f.write(nonce)
            f.write(encrypted)
        secure_file_permissions()
        return {"message": "Entry deleted", "entries": self.entries, "success": True}

    def edit_entry(
        self,
        entry_id,
        site=None,
        username=None,
        password=None,
        category=None,
    ):
        if not self._is_unlocked():
            return {
                "message": "Please unlock the vault first",
                "entries": [],
                "success": False,
            }

        if site is not None and not site.strip():
            return {
                "message": "Site cannot be empty",
                "entries": self.entries,
                "success": False,
            }

        if username is not None and not username.strip():
            return {
                "message": "Username cannot be empty",
                "entries": self.entries,
                "success": False,
            }

        if password is not None and not password:
            return {
                "message": "Password cannot be empty",
                "entries": self.entries,
                "success": False,
            }

        # User chooses no category
        if category == "":
            category = None

        # Only validate a category if one is selected
        if category is not None and category not in [
            "Work",
            "Personal",
            "Finance",
            "Other",
        ]:
            return {
                "message": "Invalid category",
                "entries": self.entries,
                "success": False,
            }

        entry_found = False

        for entry in self.entries:
            if entry["id"] == entry_id:
                entry_found = True

                if site is not None:
                    entry["site"] = site

                if username is not None:
                    entry["username"] = username

                if password is not None:
                    entry["password"] = password

                entry["category"] = category

                break

        if not entry_found:
            return {
                "message": "Entry not found",
                "entries": self.entries,
                "success": False,
            }

        aesgcm = AESGCM(self.key)
        nonce = os.urandom(NONCE_SIZE)

        new_plaintext = json.dumps(self.entries).encode()
        encrypted = aesgcm.encrypt(nonce, new_plaintext, None)

        with open(VAULT_FILE, "rb") as f:
            salt = f.read(SALT_SIZE)

        with open(VAULT_FILE, "wb") as f:
            f.write(salt)
            f.write(nonce)
            f.write(encrypted)

        secure_file_permissions()

        return {
            "message": "Entry updated",
            "entries": self.entries,
            "success": True,
        }

    def add_entry(self, site, username, password, category=None):
        if not self._is_unlocked():
            return {
                "message": "Please unlock the vault first",
                "entries": [],
                "success": False,
            }

        if not site or not site.strip():
            return {
                "message": "Site cannot be empty",
                "entries": self.entries,
                "success": False,
            }
        if not username or not username.strip():
            return {
                "message": "Username cannot be empty",
                "entries": self.entries,
                "success": False,
            }
        if not password:
            return {
                "message": "Password cannot be empty",
                "entries": self.entries,
                "success": False,
            }
        if category == "":
            category = None

        #! This checks for identical usernames and websites only; addition to FE check
        for entry in self.entries:
            if entry["site"] == site and entry["username"] == username:
                return {
                    "message": "An entry for this site and username already exists",
                    "entries": self.entries,
                    "success": False,
                }

        entry_id = str(uuid.uuid4())
        self.entries.append(
            {
                "id": entry_id,
                "site": site,
                "username": username,
                "password": password,
                "category": category,
                "favorite": False,
            }
        )
        aesgcm = AESGCM(self.key)
        nonce = os.urandom(NONCE_SIZE)
        new_plaintext = json.dumps(self.entries).encode()
        encrypted = aesgcm.encrypt(nonce, new_plaintext, None)
        # * Python object (list/dict)  →  json.dumps()  →  JSON-formatted string  →  .encode()  →  raw bytes  →  aesgcm.encrypt()

        with open(VAULT_FILE, "rb") as f:
            salt = f.read(SALT_SIZE)

        with open(VAULT_FILE, "wb") as f:
            f.write(salt)
            f.write(nonce)
            f.write(encrypted)
        secure_file_permissions()
        return {
            "message": f"Entry added with id {entry_id}",
            "entries": self.entries,
            "success": True,
        }

    def lock(self):
        if hasattr(self, "key"):
            del self.key
        if hasattr(self, "entries"):
            del self.entries
        return {"message": "Vault locked"}

    def copy_to_clipboard(self, text):
        if not text:
            return {"message": "Nothing to copy"}

        pyperclip.copy(text)
        clear_seconds = self.settings["clipboard_clear_seconds"]

        def clear_later():
            time.sleep(clear_seconds)
            if pyperclip.paste() == text:
                pyperclip.copy("")

        threading.Thread(target=clear_later, daemon=True).start()
        return {"message": "Copied to clipboard"}

    def check_password_strength(self, password):
        if not password:
            return {"score": 0, "feedback": ""}

        result = zxcvbn(password)
        score = result["score"]
        warning = result["feedback"]["warning"]
        suggestions = result["feedback"]["suggestions"]

        feedback = warning if warning else (suggestions[0] if suggestions else "")

        return {"score": score, "feedback": feedback}

    def vault_exists(self):
        return {"exists": os.path.exists(VAULT_FILE)}

    def generate_password(self, length=16):
        try:
            length = int(length)
        except (TypeError, ValueError):
            length = 16
        length = max(8, min(length, 128))

        alphabet = string.ascii_letters + string.digits + "!@#$%^&*()-_=+"
        return {"password": "".join(secrets.choice(alphabet) for _ in range(length))}

    def update_setting(self, name, value):
        self.settings[name] = value
        save_settings(self.settings)

        return {
            "message": "Setting updated",
            "settings": self.settings,
            "success": True,
        }


api = Api()
webview.create_window(
    "Password Manager",
    "http://localhost:5173",
    js_api=api,
    width=1400,
    height=900,
    min_size=(1240, 700),
)  # webview.create_window("Password Manager", "index.html", js_api=api)
webview.start()
