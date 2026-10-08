import test from 'node:test';
import assert from 'node:assert/strict';
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
} from '../js/odds.js';

test('US to Decimal conversion', () => {
  // -110 US => 1 + 100/110 = 1.90909...
  assert.ok(Math.abs(usToDecimal(-110) - (1 + 100 / 110)) < 1e-9);
  // +100 US => 2.0
  assert.equal(usToDecimal(100), 2.0);
  // -100 US => 2.0
  assert.equal(usToDecimal(-100), 2.0);
  // +150 US => 2.5
  assert.equal(usToDecimal(150), 2.5);
  // -200 US => 1.5
  assert.equal(usToDecimal(-200), 1.5);
  // Invalid (0 or NaN)
  assert.equal(usToDecimal(0), null);
  assert.equal(usToDecimal(NaN), null);
});

test('Decimal to US conversion', () => {
  // 2.0 => +100
  assert.equal(decimalToUs(2.0), 100);
  // 2.5 => +150
  assert.equal(decimalToUs(2.5), 150);
  // 1.5 => -200
  assert.equal(decimalToUs(1.5), -200);
  // 1.9090909 => -110
  assert.equal(decimalToUs(1.9090909), -110);
  // Invalid <= 1
  assert.equal(decimalToUs(1.0), null);
  assert.equal(decimalToUs(0.5), null);
});

test('US to Probability conversion', () => {
  // +100 => 50% (0.5)
  assert.equal(usToProbability(100), 0.5);
  // -100 => 50% (0.5)
  assert.equal(usToProbability(-100), 0.5);
  // +150 => 100 / 250 = 0.4
  assert.equal(usToProbability(150), 0.4);
  // -110 => 110 / 210 ≈ 0.5238095
  assert.ok(Math.abs(usToProbability(-110) - 110 / 210) < 1e-9);
  // -200 => 200 / 300 = 2/3 ≈ 0.66666...
  assert.ok(Math.abs(usToProbability(-200) - 2 / 3) < 1e-9);
});

test('Probability to US conversion', () => {
  assert.equal(probabilityToUs(0.5), 100);
  assert.equal(probabilityToUs(0.4), 150);
  assert.equal(probabilityToUs(2 / 3), -200);
  assert.equal(probabilityToUs(110 / 210), -110);
});

test('Decimal and Probability bi-directional conversion', () => {
  assert.equal(decimalToProbability(2.0), 0.5);
  assert.equal(probabilityToDecimal(0.5), 2.0);
  assert.equal(decimalToProbability(2.5), 0.4);
  assert.equal(probabilityToDecimal(0.4), 2.5);
  assert.equal(decimalToProbability(1.0), null);
  assert.equal(probabilityToDecimal(0), null);
  assert.equal(probabilityToDecimal(1), null);
});

test('Fractional odds', () => {
  assert.equal(decimalToFractional(2.5), '3/2');
  assert.equal(decimalToFractional(2.0), '1/1');
  assert.equal(decimalToFractional(1.5), '1/2');
  assert.equal(decimalToFractional(1.90909), '10/11');
});

test('Payout calculations', () => {
  const res1 = calculatePayout(100, 2.5);
  assert.deepEqual(res1, { payout: 250, profit: 150 });

  const res2 = calculatePayout(50, 1.90909);
  assert.equal(res2.payout, 95.45);
  assert.equal(res2.profit, 45.45);
});

test('Formatting utilities', () => {
  assert.equal(formatUsOdds(150), '+150');
  assert.equal(formatUsOdds(-110), '-110');
  assert.equal(formatDecimalOdds(1.90909, 3), '1.909');
  assert.equal(formatProbability(0.5238, 3), '0.524');
  assert.equal(formatPercentage(0.5238, 1), '52.4%');
});
