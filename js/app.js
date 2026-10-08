import {
  usToDecimal,
  decimalToUs,
  usToProbability,
  probabilityToUs,
  decimalToProbability,
  probabilityToDecimal,
  decimalToFractional,
  calculatePayout,
  formatUsOdds,
  formatDecimalOdds,
  formatProbability,
  formatPercentage
} from './odds.js';

// DOM Elements
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

const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');
const clearBtn = document.getElementById('clearBtn');
const presetButtons = document.querySelectorAll('.preset-chip');
const copyButtons = document.querySelectorAll('.copy-btn');

// Application state
let currentModel = {
  usOdds: -110,
  decimalOdds: 1.909090909,
  probability: 0.523809523
};

let activeInput = null;

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
 * Update the summary and payout calculations based on current model
 */
function updateCalculations() {
  const dec = currentModel.decimalOdds;
  const prob = currentModel.probability;

  if (dec && dec > 1) {
    // Overview metrics
    statDecimalFactor.textContent = `${formatDecimalOdds(dec, 3)}x`;
    const frac = decimalToFractional(dec);
    statFractional.textContent = frac || '—';
    
    // Stake / Payout
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
 * Sync all inputs from current model, skipping the currently focused input.
 */
function syncInputs(source) {
  if (source !== 'usOdds') {
    if (currentModel.usOdds !== null) {
      usOddsInput.value = formatUsOdds(currentModel.usOdds);
    } else {
      usOddsInput.value = '';
    }
  }

  if (source !== 'probability') {
    if (currentModel.probability !== null) {
      probInput.value = formatProbability(currentModel.probability, 3);
    } else {
      probInput.value = '';
    }
  }

  if (source !== 'decimalOdds') {
    if (currentModel.decimalOdds !== null) {
      decOddsInput.value = formatDecimalOdds(currentModel.decimalOdds, 3);
    } else {
      decOddsInput.value = '';
    }
  }

  updateCalculations();
}

/**
 * Handle input changes from US Odds
 */
function handleUsOddsChange() {
  const raw = usOddsInput.value.trim();
  if (raw === '' || raw === '+' || raw === '-') {
    setError(usOddsInput, usOddsError, false);
    return;
  }

  const num = parseFloat(raw);
  // US Odds cannot be 0, and in traditional betting are not between -100 and +100 (exclusive)
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

/**
 * Handle input changes from Probability
 */
function handleProbabilityChange() {
  const raw = probInput.value.trim();
  if (raw === '') {
    setError(probInput, probError, false);
    return;
  }

  let num = parseFloat(raw);
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

/**
 * Handle input changes from Decimal Odds
 */
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

/**
 * Set an explicit US Odds value (e.g. from preset chips)
 */
function setPresetUsOdds(val) {
  currentModel.usOdds = val;
  currentModel.decimalOdds = usToDecimal(val);
  currentModel.probability = usToProbability(val);

  setError(usOddsInput, usOddsError, false);
  setError(probInput, probError, false);
  setError(decOddsInput, decOddsError, false);

  syncInputs(null);
}

/**
 * Clear all inputs
 */
function clearAll() {
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
 * Show toast notification
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
 * Initialize event listeners
 */
function initEventListeners() {
  usOddsInput.addEventListener('input', () => handleUsOddsChange());
  probInput.addEventListener('input', () => handleProbabilityChange());
  decOddsInput.addEventListener('input', () => handleDecimalOddsChange());

  usOddsInput.addEventListener('focus', () => { activeInput = 'usOdds'; });
  probInput.addEventListener('focus', () => { activeInput = 'probability'; });
  decOddsInput.addEventListener('focus', () => { activeInput = 'decimalOdds'; });

  usOddsInput.addEventListener('blur', () => {
    activeInput = null;
    if (currentModel.usOdds !== null && !usOddsInput.classList.contains('is-invalid')) {
      usOddsInput.value = formatUsOdds(currentModel.usOdds);
    }
  });

  probInput.addEventListener('blur', () => {
    activeInput = null;
    if (currentModel.probability !== null && !probInput.classList.contains('is-invalid')) {
      probInput.value = formatProbability(currentModel.probability, 3);
    }
  });

  decOddsInput.addEventListener('blur', () => {
    activeInput = null;
    if (currentModel.decimalOdds !== null && !decOddsInput.classList.contains('is-invalid')) {
      decOddsInput.value = formatDecimalOdds(currentModel.decimalOdds, 3);
    }
  });

  stakeInput.addEventListener('input', updateCalculations);

  clearBtn.addEventListener('click', clearAll);

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const us = parseInt(btn.getAttribute('data-us'), 10);
      setPresetUsOdds(us);
    });
  });

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

// Initial start with -110 as default (matching the original Angular app's starting model `pu(-110)`)
initTheme();
initEventListeners();
setPresetUsOdds(-110);
