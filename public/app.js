(() => {
  const dialog = document.getElementById('help-dialog');
  const openButtons = document.querySelectorAll('[data-help]');
  let trigger = null;
  for (const button of openButtons) {
    button.addEventListener('click', () => {
      trigger = button;
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  }
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    trigger?.focus();
  });
})();
