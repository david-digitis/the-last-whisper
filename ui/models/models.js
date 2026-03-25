const listEl = document.getElementById('models-list');

// Close button
document.getElementById('close-btn').addEventListener('click', () => {
  window.dikto.closeModels();
});

// Escape to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.dikto.closeModels();
});

async function loadModels() {
  const models = await window.dikto.listModels();
  listEl.innerHTML = '';

  models.forEach(model => {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.id = `model-${model.id}`;

    const barColor = (val) => val >= 70 ? 'green' : val >= 40 ? 'orange' : 'red';
    const sizeStr = (model.size / (1024 * 1024)).toFixed(0) + ' MB';

    let badge = '';
    if (model.active) {
      badge = '<span class="badge-active">ACTIVE</span>';
    } else if (model.installed) {
      badge = '<span class="badge-installed">Installed</span>';
    }

    card.innerHTML = `
      <div class="model-header">
        <span class="model-name">${model.name}</span>
        ${badge}
      </div>
      <div class="model-meta">${model.languages.join(', ')} | ${sizeStr}</div>
      <div class="bar-row">
        <span class="bar-label">Accuracy</span>
        <div class="bar-track"><div class="bar-fill ${barColor(model.precision)}" style="width:${model.precision}%"></div></div>
        <span class="bar-value">${model.precision}%</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">Speed</span>
        <div class="bar-track"><div class="bar-fill ${barColor(model.speed)}" style="width:${model.speed}%"></div></div>
        <span class="bar-value">${model.speed}%</span>
      </div>
      <div class="model-desc">${model.description}</div>
      <div class="model-actions" id="actions-${model.id}"></div>
    `;

    // Add action buttons via JS (not inline onclick)
    const actionsEl = card.querySelector('.model-actions');

    if (model.installed) {
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', async () => {
        await window.dikto.deleteModel(model.id);
        loadModels();
      });
      actionsEl.appendChild(delBtn);
    } else {
      const dlBtn = document.createElement('button');
      dlBtn.className = 'btn-download';
      dlBtn.textContent = `Download ${sizeStr}`;
      dlBtn.addEventListener('click', () => {
        startDownload(model.id, actionsEl);
      });
      actionsEl.appendChild(dlBtn);
    }

    listEl.appendChild(card);
  });
}

function startDownload(modelId, actionsEl) {
  actionsEl.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'progress-bar';
  wrapper.style.flex = '1';
  wrapper.innerHTML = `
    <div class="progress-track"><div class="progress-fill" id="progress-${modelId}"></div></div>
    <div class="progress-text" id="progress-text-${modelId}">Starting...</div>
  `;
  actionsEl.appendChild(wrapper);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-cancel';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => loadModels());
  actionsEl.appendChild(cancelBtn);

  window.dikto.downloadModel(modelId);
}

// Listen for download progress
if (window.dikto) {
  window.dikto.onDownloadProgress((event, modelId, percent, speedStr) => {
    const fill = document.getElementById(`progress-${modelId}`);
    const text = document.getElementById(`progress-text-${modelId}`);
    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${percent.toFixed(0)}% — ${speedStr}`;
  });

  window.dikto.onDownloadComplete((event, modelId) => {
    loadModels();
  });
}

loadModels();
