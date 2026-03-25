const sourceTextEl = document.getElementById('source-text');
const actionsRow = document.getElementById('actions');
const resultAreaEl = document.getElementById('result-area');
const resultTextEl = document.getElementById('result-text');
const loadingEl = document.getElementById('loading');

let sourceText = '';
let resultText = '';

function fitWindow() {
  // Fixed size — no dynamic resize
}

// ─── Load action buttons dynamically ─────────────────────────

async function loadActions() {
  if (!window.dikto) return;
  const actions = await window.dikto.getActions();
  actionsRow.innerHTML = '';

  actions.forEach(a => {
    const btn = document.createElement('button');
    btn.className = 'action-btn' + (a.builtin ? ' builtin' : '');
    btn.dataset.action = a.id;
    btn.textContent = a.label;
    btn.addEventListener('click', () => onActionClick(btn, a.id));
    actionsRow.appendChild(btn);
  });
}

async function onActionClick(btn, actionId) {
  actionsRow.querySelectorAll('.action-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  resultAreaEl.classList.add('hidden');
  loadingEl.classList.remove('hidden');
  loadingEl.textContent = 'Gemini...';

  try {
    const result = await window.dikto.sendOverlayAction(sourceText, actionId);
    resultText = result;
    resultTextEl.textContent = result;
    loadingEl.classList.add('hidden');
    resultAreaEl.classList.remove('hidden');
    fitWindow();
  } catch (err) {
    loadingEl.textContent = 'Error: ' + err.message;
    fitWindow();
  }
}

loadActions();

// ─── Receive text from main process ──────────────────────────

if (window.dikto) {
  window.dikto.onOverlayText((event, text) => {
    sourceText = text;
    sourceTextEl.textContent = text;
    resultAreaEl.classList.add('hidden');
    loadingEl.classList.add('hidden');
    actionsRow.querySelectorAll('.action-btn').forEach(b => b.classList.remove('selected'));
    // Reload actions (may have changed)
    loadActions().then(fitWindow);
  });
}

// ─── Close ───────────────────────────────────────────────────

document.getElementById('close-btn').addEventListener('click', () => {
  if (window.dikto) window.dikto.closeOverlay();
});

document.getElementById('backdrop').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    if (window.dikto) window.dikto.closeOverlay();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && window.dikto) window.dikto.closeOverlay();
});

// ─── Result buttons ──────────────────────────────────────────

document.getElementById('copy-btn').addEventListener('click', () => {
  if (window.dikto && resultText) {
    window.dikto.copyToClipboard(resultText);
  }
});

document.getElementById('insert-btn').addEventListener('click', () => {
  if (window.dikto && resultText) {
    window.dikto.insertText(resultText);
  }
});
