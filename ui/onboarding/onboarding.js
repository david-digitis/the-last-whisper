const apiKeyInput = document.getElementById('apiKey');
const micSelect = document.getElementById('micSelect');
const apiStatus = document.getElementById('apiStatus');

// Populate mic list on load
if (window.dikto) {
  window.dikto.onMicList((event, devices) => {
    micSelect.innerHTML = '';
    devices.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.deviceId;
      opt.textContent = d.label;
      micSelect.appendChild(opt);
    });
  });
}

function goToStep(n) {
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.remove('active');
    if (i < n - 1) s.classList.add('done');
  });
  const step = document.getElementById(`step${n}`);
  if (step) step.classList.add('active');
}

function saveApiKey() {
  const key = apiKeyInput.value.trim();
  if (!key) {
    apiStatus.textContent = 'Entrez une cle API';
    apiStatus.className = 'status error';
    return;
  }
  if (window.dikto) {
    window.dikto.onboardingSaveApiKey(key);
  }
  apiStatus.textContent = 'Cle enregistree';
  apiStatus.className = 'status ok';
  setTimeout(() => goToStep(2), 500);
}

function skipApiKey() {
  goToStep(2);
}

function saveMic() {
  const deviceId = micSelect.value;
  if (window.dikto && deviceId) {
    window.dikto.onboardingSaveMic(deviceId);
  }
  goToStep(3);
}

function finish() {
  console.log('[Onboarding] finish() called, window.dikto =', !!window.dikto);
  try {
    if (window.dikto) {
      window.dikto.onboardingDone();
      console.log('[Onboarding] onboardingDone() sent');
    }
  } catch (err) {
    console.error('[Onboarding] finish error:', err.message);
  }
}

// Button event listeners (inline onclick blocked by CSP)
document.getElementById('btn-save-api').addEventListener('click', saveApiKey);
document.getElementById('btn-skip-api').addEventListener('click', skipApiKey);
document.getElementById('btn-save-mic').addEventListener('click', saveMic);
document.getElementById('btn-finish').addEventListener('click', finish);

// Enter key on API input
apiKeyInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveApiKey();
});
