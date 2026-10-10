import { describe, it } from 'node:test';
import assert from 'node:assert';
import type { GrossMarginReportRow, InventoryReportRow, SalesReportRow } from '@candi/types';

describe('Phase 3D: Advanced Management Reporting Reconciliations', () => {
  // Test 1: Sales Report Net Total Reconciliation
  it('strictly reconciles Net Sales = Gross Sales - Discounts - Returns', () => {
    const row: SalesReportRow = {
      dimensionId: 'cust-01',
      dimensionLabel: 'Al-Madina Super Store',
      ordersCount: 8,
      quantityUnits: 145,
      grossSalesPKR: 384000,
      discountsPKR: 30720,
      returnsPKR: 40000,
      netSalesPKR: 313280,
      sourceOrderIds: ['ORD-072', 'ORD-080'],
    };

    const calculatedNet = row.grossSalesPKR - row.discountsPKR - row.returnsPKR;
    assert.strictEqual(calculatedNet, row.netSalesPKR, 'Net sales must reconcile with ledger deductions');
  });

  // Test 2: Inventory Valuation Formula
  it('calculates inventory valuation as Current Stock * Unit Cost', () => {
    const item: Partial<InventoryReportRow> = {
      productName: 'Choco Dream Truffle Bites',
      currentStock: 48,
      unitCostPKR: 2400,
      stockValuationPKR: 115200,
    };

    const valuation = (item.currentStock || 0) * (item.unitCostPKR || 0);
    assert.strictEqual(valuation, item.stockValuationPKR);
  });

  // Test 3: Gross Margin Percentage Formula
  it('calculates gross margin percentage as (Net Revenue - COGS) / Net Revenue * 100', () => {
    const marginRow: GrossMarginReportRow = {
      periodLabel: 'September 2026',
      grossRevenuePKR: 1036000,
      discountsPKR: 70670,
      returnsPKR: 55000,
      netRevenuePKR: 910330,
      costOfGoodsSoldPKR: 682500,
      grossMarginPKR: 227830,
      grossMarginPct: 25.0,
    };

    const grossMargin = marginRow.netRevenuePKR - marginRow.costOfGoodsSoldPKR;
    assert.strictEqual(grossMargin, marginRow.grossMarginPKR);

    const marginPct = Number(((grossMargin / marginRow.netRevenuePKR) * 100).toFixed(1));
    assert.strictEqual(marginPct, marginRow.grossMarginPct);
  });
});
