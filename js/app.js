import {
  usToDecimal,
  decimalToUs,
  usToProbability,
  probabilityToUs,
  decimalToProbability,
  probabilityToDecimal,
  decimalToFractional,
  calculatePayout,
  calculateVig,
  formatUsOdds,
  formatDecimalOdds,
  formatProbability,
  formatPercentage
} from './odds.js';

// DOM Elements - Converter Tab
const usOddsInput = document.getElementById('usOdds');
const probInput = document.getElementById('probability');
const decOddsInput = document.getElementById('decimalOdds');

const usOddsError = document.getElementById('usOddsError');
const probError = document.getElementById('probabilityError');
const decOddsError = document.getElementById('decimalOddsError');

const stakeInput = document.getElementById('stakeAmount');
const calcProfit = document.getElementById('calcProfit');
const calcPayout = document.getElementById('calcPayout');

const statPercentage = document.getElementById('statPercentage');
const statFractional = document.getElementById('statFractional');
const statDecimalFactor = document.getElementById('statDecimalFactor');

const clearBtn = document.getElementById('clearBtn');
const presetButtons = document.querySelectorAll('.preset-chip:not(.vig-preset-chip)');

// DOM Elements - Vig Tab
const vigOdds1Input = document.getElementById('vigOdds1');
const vigOdds2Input = document.getElementById('vigOdds2');
const vigOdds1Error = document.getElementById('vigOdds1Error');
const vigOdds2Error = document.getElementById('vigOdds2Error');

const vigPercentDisplay = document.getElementById('vigPercentDisplay');
const vigOverroundDisplay = document.getElementById('vigOverroundDisplay');
const vigMarkupDisplay = document.getElementById('vigMarkupDisplay');
const vigHoldDisplay = document.getElementById('vigHoldDisplay');

const fairP1Display = document.getElementById('fairP1Display');
const fairP2Display = document.getElementById('fairP2Display');
const origP1Display = document.getElementById('origP1Display');
const origP2Display = document.getElementById('origP2Display');
const fairUs1Display = document.getElementById('fairUs1Display');
const fairUs2Display = document.getElementById('fairUs2Display');

const vigPresetButtons = document.querySelectorAll('.vig-preset-chip');
const vigClearBtn = document.getElementById('vigClearBtn');

// Shared DOM Elements
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');
const copyButtons = document.querySelectorAll('.copy-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

// Converter State
let currentModel = {
  usOdds: -110,
  decimalOdds: 1.909090909,
  probability: 0.523809523
};

// Vig State (default -110 / -110)
let currentVigModel = {
  odds1: -110,
  odds2: -110
};

/**
 * Update error displays
 */
function setError(inputEl, errorEl, hasError) {
  if (hasError) {
    inputEl.classList.add('is-invalid');
    errorEl.classList.add('visible');
  } else {
    inputEl.classList.remove('is-invalid');
    errorEl.classList.remove('visible');
  }
}

/**
 * Update Converter calculations & metrics
 */
function updateCalculations() {
  const dec = currentModel.decimalOdds;
  const prob = currentModel.probability;

  if (dec && dec > 1) {
    statDecimalFactor.textContent = `${formatDecimalOdds(dec, 3)}x`;
    const frac = decimalToFractional(dec);
    statFractional.textContent = frac || '—';
    
    const stake = parseFloat(stakeInput.value);
    if (!isNaN(stake) && stake > 0) {
      const payoutInfo = calculatePayout(stake, dec);
      if (payoutInfo) {
        calcProfit.textContent = `$${payoutInfo.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        calcPayout.textContent = `$${payoutInfo.payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    } else {
      calcProfit.textContent = '$0.00';
      calcPayout.textContent = '$0.00';
    }
  } else {
    statDecimalFactor.textContent = '—';
    statFractional.textContent = '—';
    calcProfit.textContent = '$0.00';
    calcPayout.textContent = '$0.00';
  }

  if (prob && prob > 0 && prob < 1) {
    statPercentage.textContent = formatPercentage(prob, 1);
  } else {
    statPercentage.textContent = '—';
  }
}

/**
 * Sync Converter inputs from model
 */
function syncInputs(source) {
  if (source !== 'usOdds') {
    usOddsInput.value = currentModel.usOdds !== null ? formatUsOdds(currentModel.usOdds) : '';
  }

  if (source !== 'probability') {
    probInput.value = currentModel.probability !== null ? formatProbability(currentModel.probability, 3) : '';
  }

  if (source !== 'decimalOdds') {
    decOddsInput.value = currentModel.decimalOdds !== null ? formatDecimalOdds(currentModel.decimalOdds, 3) : '';
  }

  updateCalculations();
}

/**
 * Handlers for Converter Tab inputs
 */
function handleUsOddsChange() {
  const raw = usOddsInput.value.trim();
  if (raw === '' || raw === '+' || raw === '-') {
    setError(usOddsInput, usOddsError, false);
    return;
  }

  const num = parseFloat(raw);
  if (isNaN(num) || num === 0 || (num > -100 && num < 100)) {
    setError(usOddsInput, usOddsError, true);
    return;
  }

  setError(usOddsInput, usOddsError, false);
  currentModel.usOdds = num;
  currentModel.decimalOdds = usToDecimal(num);
  currentModel.probability = usToProbability(num);

  setError(probInput, probError, false);
  setError(decOddsInput, decOddsError, false);

  syncInputs('usOdds');
}

function handleProbabilityChange() {
  const raw = probInput.value.trim();
  if (raw === '') {
    setError(probInput, probError, false);
    return;
  }

  const num = parseFloat(raw);
  if (isNaN(num) || num <= 0 || num >= 1) {
    setError(probInput, probError, true);
    return;
  }

  setError(probInput, probError, false);
  currentModel.probability = num;
  currentModel.decimalOdds = probabilityToDecimal(num);
  currentModel.usOdds = probabilityToUs(num);

  setError(usOddsInput, usOddsError, false);
  setError(decOddsInput, decOddsError, false);

  syncInputs('probability');
}

function handleDecimalOddsChange() {
  const raw = decOddsInput.value.trim();
  if (raw === '') {
    setError(decOddsInput, decOddsError, false);
    return;
  }

  const num = parseFloat(raw);
  if (isNaN(num) || num <= 1) {
    setError(decOddsInput, decOddsError, true);
    return;
  }

  setError(decOddsInput, decOddsError, false);
  currentModel.decimalOdds = num;
  currentModel.probability = decimalToProbability(num);
  currentModel.usOdds = decimalToUs(num);

  setError(usOddsInput, usOddsError, false);
  setError(probInput, probError, false);

  syncInputs('decimalOdds');
}

function setPresetUsOdds(val) {
  currentModel.usOdds = val;
  currentModel.decimalOdds = usToDecimal(val);
  currentModel.probability = usToProbability(val);

  setError(usOddsInput, usOddsError, false);
  setError(probInput, probError, false);
  setError(decOddsInput, decOddsError, false);

  syncInputs(null);
}

function clearAllConverter() {
  currentModel = {
    usOdds: null,
    decimalOdds: null,
    probability: null
  };
  usOddsInput.value = '';
  probInput.value = '';
  decOddsInput.value = '';

  setError(usOddsInput, usOddsError, false);
  setError(probInput, probError, false);
  setError(decOddsInput, decOddsError, false);

  updateCalculations();
}

/**
 * Handlers for Vig Tab
 */
function parseUsOdds(inputEl, errorEl) {
  const raw = inputEl.value.trim();
  if (raw === '' || raw === '+' || raw === '-') {
    setError(inputEl, errorEl, false);
    return null;
  }
  const num = parseFloat(raw);
  if (isNaN(num) || num === 0 || (num > -100 && num < 100)) {
    setError(inputEl, errorEl, true);
    return null;
  }
  setError(inputEl, errorEl, false);
  return num;
}

function updateVigCalculations() {
  const o1 = currentVigModel.odds1;
  const o2 = currentVigModel.odds2;

  if (o1 === null || o2 === null) {
    vigPercentDisplay.textContent = '—%';
    vigOverroundDisplay.textContent = '—%';
    vigMarkupDisplay.textContent = '—';
    vigHoldDisplay.textContent = '—%';
    fairP1Display.textContent = '—';
    fairP2Display.textContent = '—';
    origP1Display.textContent = '—';
    origP2Display.textContent = '—';
    fairUs1Display.textContent = '—';
    fairUs2Display.textContent = '—';
    return;
  }

  const result = calculateVig(o1, o2);
  if (!result) return;

  // Primary Vig display (formatted as X.XX%)
  vigPercentDisplay.textContent = `${result.vig.toFixed(2)}%`;
  vigHoldDisplay.textContent = `${result.hold.toFixed(2)}%`;
  vigOverroundDisplay.textContent = `${result.overroundTotal.toFixed(2)}%`;
  vigMarkupDisplay.textContent = `${result.overroundMarkup >= 0 ? '+' : ''}${result.overroundMarkup.toFixed(2)}% margin`;

  fairP1Display.textContent = `${result.fairP1.toFixed(1)}%`;
  fairP2Display.textContent = `${result.fairP2.toFixed(1)}%`;
  origP1Display.textContent = `${result.p1.toFixed(1)}%`;
  origP2Display.textContent = `${result.p2.toFixed(1)}%`;

  fairUs1Display.textContent = result.fairUs1 !== null ? formatUsOdds(result.fairUs1) : '—';
  fairUs2Display.textContent = result.fairUs2 !== null ? formatUsOdds(result.fairUs2) : '—';
}

function handleVigInputsChange() {
  const val1 = parseUsOdds(vigOdds1Input, vigOdds1Error);
  const val2 = parseUsOdds(vigOdds2Input, vigOdds2Error);

  currentVigModel.odds1 = val1;
  currentVigModel.odds2 = val2;

  updateVigCalculations();
}

function setVigPresets(o1, o2) {
  currentVigModel.odds1 = o1;
  currentVigModel.odds2 = o2;

  vigOdds1Input.value = formatUsOdds(o1);
  vigOdds2Input.value = formatUsOdds(o2);

  setError(vigOdds1Input, vigOdds1Error, false);
  setError(vigOdds2Input, vigOdds2Error, false);

  updateVigCalculations();
}

function clearAllVig() {
  currentVigModel.odds1 = null;
  currentVigModel.odds2 = null;

  vigOdds1Input.value = '';
  vigOdds2Input.value = '';

  setError(vigOdds1Input, vigOdds1Error, false);
  setError(vigOdds2Input, vigOdds2Error, false);

  updateVigCalculations();
}

/**
 * Toast notification
 */
let toastTimeout = null;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('visible');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2000);
}

/**
 * Theme toggle management
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', currentTheme);

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

/**
 * Tab Navigation
 */
function initTabs() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPanelId = btn.getAttribute('aria-controls');

      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      tabPanels.forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.classList.add('active');
          panel.removeAttribute('hidden');
        } else {
          panel.classList.remove('active');
          panel.setAttribute('hidden', '');
        }
      });
    });
  });
}

/**
 * Event Listeners
 */
function initEventListeners() {
  // Converter inputs
  usOddsInput.addEventListener('input', handleUsOddsChange);
  probInput.addEventListener('input', handleProbabilityChange);
  decOddsInput.addEventListener('input', handleDecimalOddsChange);

  usOddsInput.addEventListener('blur', () => {
    if (currentModel.usOdds !== null && !usOddsInput.classList.contains('is-invalid')) {
      usOddsInput.value = formatUsOdds(currentModel.usOdds);
    }
  });

  probInput.addEventListener('blur', () => {
    if (currentModel.probability !== null && !probInput.classList.contains('is-invalid')) {
      probInput.value = formatProbability(currentModel.probability, 3);
    }
  });

  decOddsInput.addEventListener('blur', () => {
    if (currentModel.decimalOdds !== null && !decOddsInput.classList.contains('is-invalid')) {
      decOddsInput.value = formatDecimalOdds(currentModel.decimalOdds, 3);
    }
  });

  stakeInput.addEventListener('input', updateCalculations);
  clearBtn.addEventListener('click', clearAllConverter);

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const us = parseInt(btn.getAttribute('data-us'), 10);
      setPresetUsOdds(us);
    });
  });

  // Vig inputs
  vigOdds1Input.addEventListener('input', handleVigInputsChange);
  vigOdds2Input.addEventListener('input', handleVigInputsChange);

  vigOdds1Input.addEventListener('blur', () => {
    if (currentVigModel.odds1 !== null && !vigOdds1Input.classList.contains('is-invalid')) {
      vigOdds1Input.value = formatUsOdds(currentVigModel.odds1);
    }
  });

  vigOdds2Input.addEventListener('blur', () => {
    if (currentVigModel.odds2 !== null && !vigOdds2Input.classList.contains('is-invalid')) {
      vigOdds2Input.value = formatUsOdds(currentVigModel.odds2);
    }
  });

  vigPresetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const o1 = parseInt(btn.getAttribute('data-o1'), 10);
      const o2 = parseInt(btn.getAttribute('data-o2'), 10);
      setVigPresets(o1, o2);
    });
  });

  vigClearBtn.addEventListener('click', clearAllVig);

  // Copy Buttons
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const targetId = btn.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);
      if (targetInput && targetInput.value) {
        try {
          await navigator.clipboard.writeText(targetInput.value);
          showToast(`Copied ${targetInput.value} to clipboard`);
        } catch {
          targetInput.select();
          document.execCommand('copy');
          showToast(`Copied ${targetInput.value} to clipboard`);
        }
      }
    });
  });
}

// Initialization
initTheme();
initTabs();
initEventListeners();

// Initial states
setPresetUsOdds(-110);
setVigPresets(-110, -110);
