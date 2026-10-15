import assert from 'node:assert/strict';
import test from 'node:test';
import { validatePaymentReference } from '../src/finance.ts';

test('validatePaymentReference enforces reference on non-cash payments', () => {
  const validBank = validatePaymentReference({
    paymentMethod: 'bank_transfer',
    receiptReference: 'HBL-FT-99201',
    amount: 50000,
  });
  assert.equal(validBank.isValid, true);

  const invalidBank = validatePaymentReference({
    paymentMethod: 'bank_transfer',
    receiptReference: '',
    amount: 50000,
  });
  assert.equal(invalidBank.isValid, false);
  assert.match(invalidBank.error || '', /mandatory for bank transfer/i);

  const invalidZeroAmount = validatePaymentReference({
    paymentMethod: 'cash',
    amount: 0,
  });
  assert.equal(invalidZeroAmount.isValid, false);
  assert.match(invalidZeroAmount.error || '', /greater than zero/i);
});
