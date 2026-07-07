/* ==========================================================================
   ClutchNLoc® Overdue Retie Formula Calculator
   Shared logic — used on both public page (after email unlock)
   and buyer-only /ODCalculator
   ==========================================================================
   THE FORMULA (matches the guide exactly):
     B = (W ÷ S) × P
   Where:
     W = Total weeks since last retie (NOT weeks past due)
     S = Standard interval (typically 4–6 weeks; extended standard 4–7)
     P = Current retie price
     B = Baseline charge (the TOTAL price, not an amount to add on top)
   ========================================================================== */

(function () {
  'use strict';

  const form         = document.getElementById('calc-form');
  const inputPrice   = document.getElementById('input-price');
  const inputInterval= document.getElementById('input-interval');
  const inputWeeks   = document.getElementById('input-weeks');
  const resultPanel  = document.getElementById('result');
  const resultValue  = document.getElementById('result-value');
  const resultBreakdown = document.getElementById('result-breakdown');
  const resetBtn     = document.getElementById('reset-btn');
  const errorMsg     = document.getElementById('error-msg');

  if (!form) return;

  function formatCurrency(value) {
    return '$' + value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function calculate(price, interval, weeks) {
    // The formula. Exactly as printed in the guide.
    return (weeks / interval) * price;
  }

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.hidden = false;
    }
  }

  function clearError() {
    if (errorMsg) {
      errorMsg.textContent = '';
      errorMsg.hidden = true;
    }
  }

  function showResult(baseline, price, interval, weeks) {
    resultValue.textContent = formatCurrency(baseline);
    resultBreakdown.innerHTML =
      '<code>(' + weeks + ' ÷ ' + interval + ') × ' + formatCurrency(price) +
      ' = ' + formatCurrency(baseline) + '</code>';

    resultPanel.hidden = false;
    // Force reflow to restart animation if already visible
    resultPanel.classList.remove('is-visible');
    void resultPanel.offsetWidth;
    resultPanel.classList.add('is-visible');

    // Scroll into view on mobile
    if (window.matchMedia('(max-width: 640px)').matches) {
      setTimeout(() => {
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 120);
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearError();

    const price    = parseFloat(inputPrice.value);
    const interval = parseFloat(inputInterval.value);
    const weeks    = parseFloat(inputWeeks.value);

    if (isNaN(price) || price <= 0) {
      showError('Enter a valid retie price greater than zero.');
      inputPrice.focus();
      return;
    }
    if (isNaN(interval) || interval <= 0) {
      showError('Enter a valid standard interval greater than zero.');
      inputInterval.focus();
      return;
    }
    if (isNaN(weeks) || weeks <= 0) {
      showError('Enter the total weeks since the last retie.');
      inputWeeks.focus();
      return;
    }
    if (weeks < interval) {
      showError('This client is within your standard interval, not overdue. The formula applies when weeks since last retie exceeds your standard interval.');
      return;
    }

    const baseline = calculate(price, interval, weeks);
    showResult(baseline, price, interval, weeks);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      resultPanel.hidden = true;
      resultPanel.classList.remove('is-visible');
      clearError();
      inputPrice.focus();
    });
  }

  // Live-clear errors when user starts fixing the input
  [inputPrice, inputInterval, inputWeeks].forEach(function (input) {
    input.addEventListener('input', clearError);
  });
})();
