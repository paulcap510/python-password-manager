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

VAULT_FILE = "vault.dat"
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


class Api:
    def _is_unlocked(self):
        return hasattr(self, "key")

    def create_vault(self, password):
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
        return {"message": "Vault created successfully", "entries": []}

    def unlock(self, password):
        try:
            with open(VAULT_FILE, "rb") as f:
                data = f.read()
        except FileNotFoundError:
            return {
                "message": "No vault found. Please create one first.",
                "entries": [],
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
            return {"message": "Unlocked", "entries": vault_data}
        except InvalidTag:
            return {"message": "Wrong password", "entries": []}

    def delete_entry(self, entry_id):
        if not self._is_unlocked():
            return {"message": "Please unlock the vault first", "entries": []}
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

        return {"message": "Entry deleted", "entries": self.entries}

    def edit_entry(self, entry_id, site=None, username=None, password=None):
        if not self._is_unlocked():
            return {"message": "Please unlock the vault first", "entries": []}
        for entry in self.entries:
            if entry["id"] == entry_id:
                if site is not None:
                    entry["site"] = site
                if username is not None:
                    entry["username"] = username
                if password is not None:
                    entry["password"] = password
                break

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

        return {"message": "Entry updated", "entries": self.entries}

    def add_entry(self, site, username, password):
        if not self._is_unlocked():
            return {"message": "Please unlock the vault first", "entries": []}

        #! This checks for identical usernames and websites only; addition to FE check
        for entry in self.entries:
            if entry["site"] == site and entry["username"] == username:
                return {
                    "message": "An entry for this site and username already exists",
                    "entries": self.entries,
                }

        entry_id = str(uuid.uuid4())
        self.entries.append(
            {"id": entry_id, "site": site, "username": username, "password": password}
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

        return {"message": f"Entry added with id {entry_id}", "entries": self.entries}

    def lock(self):
        if hasattr(self, "key"):
            del self.key
        if hasattr(self, "entries"):
            del self.entries
        return {"message": "Vault locked"}

    def copy_to_clipboard(self, text):
        pyperclip.copy(text)

        def clear_later():
            time.sleep(5)
            if pyperclip.paste() == text:
                pyperclip.copy("")

        threading.Thread(target=clear_later, daemon=True).start()
        return {"message": "Copied to clipboard"}


api = Api()
webview.create_window("Password Manager", "index.html", js_api=api)
webview.start()
