/**
 * status.js
 * Polls /api/status/bitget every 30 seconds and updates any element with
 * data-role="status-dot" and data-role="status-text" on the page.
 */
(function () {
  const POLL_INTERVAL_MS = 30000;
  const ENDPOINT = '/api/status/bitget';

  function setIndicator(connected, message) {
    const dots = document.querySelectorAll('[data-role="status-dot"]');
    const texts = document.querySelectorAll('[data-role="status-text"]');
    const times = document.querySelectorAll('[data-role="status-time"]');

    dots.forEach((dot) => {
      dot.classList.remove('status-dot--green', 'status-dot--red', 'status-dot--pending');
      dot.classList.add(connected ? 'status-dot--green' : 'status-dot--red');
    });

    texts.forEach((el) => {
      el.textContent = connected ? 'Connected to Bitget' : 'Disconnected from Bitget';
    });

    times.forEach((el) => {
      el.textContent = `Last checked: ${new Date().toLocaleTimeString()}`;
    });

    if (message && !connected) {
      console.warn('[Bitget status]', message);
    }
  }

  async function checkStatus() {
    try {
      const res = await fetch(ENDPOINT, { cache: 'no-store' });
      const data = await res.json();
      setIndicator(Boolean(data.connected), data.message);
    } catch (err) {
      setIndicator(false, err.message);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    setInterval(checkStatus, POLL_INTERVAL_MS);
  });
})();
