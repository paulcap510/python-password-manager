export async function copyToClipboard(text) {
  await window.pywebview.api.copy_to_clipboard(text);

  setTimeout(async () => {
    try {
      const currentClipboard = await navigator.clipboard.readText();
      if (currentClipboard === text) {
        await navigator.clipboard.writeText('');
      }
    } catch (err) {}
  }, 15000); // set at 15 seconds
}
