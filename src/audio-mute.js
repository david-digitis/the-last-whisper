// Coupe le son systeme pendant l'enregistrement, puis le retablit au relachement.
// Best-effort : tout echec est avale, la dictee n'est jamais impactee.
// Windows : helper mute.ps1 (Core Audio). Linux : pactl (PulseAudio/PipeWire).
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { log } = require('./logger');

const isWin = process.platform === 'win32';
const isLinux = process.platform === 'linux';
const ps1Path = path.join(__dirname, '..', 'mute.ps1');
// mute et unmute sont deux process PowerShell distincts : la liste des sorties
// qu'on a coupees transite par ce fichier (et sert aussi a reparer apres crash).
function statePath() {
  return path.join(app.getPath('userData'), 'mute-state.txt');
}

let mutedByUs = false;
// Serialise mute puis unmute : une dictee tres courte (unmute demande avant que
// le mute soit termine) restaure quand meme correctement.
let chain = Promise.resolve();

function runWin(action) {
  return new Promise((resolve) => {
    execFile('powershell',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', ps1Path, action, statePath()],
      { timeout: 5000, windowsHide: true },
      (err, stdout) => {
        if (err) { log(`[Mute] ${action} failed: ${err.message}`); return resolve(''); }
        resolve(String(stdout || '').trim());
      });
  });
}

function runPactl(args) {
  return new Promise((resolve) => {
    execFile('pactl', args, { timeout: 3000 }, (err, stdout) => {
      if (err) { log(`[Mute] pactl failed: ${err.message}`); return resolve(''); }
      resolve(String(stdout || '').trim());
    });
  });
}

// Coupe la sortie par defaut au debut de l'enregistrement (non bloquant).
function muteForRecording() {
  chain = chain.then(async () => {
    try {
      if (isWin) {
        const out = await runWin('mute');
        mutedByUs = out.includes('did-mute');
      } else if (isLinux) {
        const state = await runPactl(['get-sink-mute', '@DEFAULT_SINK@']);
        if (state.includes('no')) {
          await runPactl(['set-sink-mute', '@DEFAULT_SINK@', '1']);
          mutedByUs = true;
        }
      }
      if (mutedByUs) log('[Mute] Output muted for recording');
    } catch (e) { log(`[Mute] mute error: ${e.message}`); }
  });
  return chain;
}

// Retablit uniquement ce que nous avons coupe, au relachement (non bloquant).
function unmuteAfterRecording() {
  chain = chain.then(async () => {
    if (!mutedByUs) return;
    try {
      if (isWin) await runWin('unmute');
      else if (isLinux) await runPactl(['set-sink-mute', '@DEFAULT_SINK@', '0']);
      log('[Mute] Output restored');
    } catch (e) { log(`[Mute] unmute error: ${e.message}`); }
    finally { mutedByUs = false; }
  });
  return chain;
}

// Si Dikto a ete tue pendant une dictee, les sorties sont restees coupees :
// on les retablit au demarrage a partir du fichier d'etat laisse derriere.
function restorePendingMute() {
  if (!isWin) return;
  try {
    if (!fs.existsSync(statePath())) return;
    log('[Mute] Etat residuel detecte, restauration des sorties');
    mutedByUs = true;
    unmuteAfterRecording();
  } catch (e) { log(`[Mute] restore error: ${e.message}`); }
}

module.exports = { muteForRecording, unmuteAfterRecording, restorePendingMute };
