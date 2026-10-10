import {
  CustomerTier,
  OrderPricingCalculation,
  PricingPriorityStep,
  TradeOffer,
  CustomerRecord,
} from '@candi/types';
import { INITIAL_PRICE_LIST } from './priceLists';
import { INITIAL_TRADE_OFFERS } from './tradeOffers';
import { INITIAL_CUSTOMER_SPECIFIC_PRICES } from './customerSpecificPrices';
import { INITIAL_CUSTOMER_TIERS } from './customerTiers';
import { CUSTOMERS_DATABASE } from './customers';

export interface PricingEvaluationParams {
  customerId: string;
  productId: string;
  quantity: number;
  asOfDate?: string; // YYYY-MM-DD, defaults to '2026-09-17'
  manualDiscountPct?: number;
  overrideReason?: string;
  isSupervisorApproved?: boolean;
}

export function evaluateOrderPricing(params: PricingEvaluationParams): OrderPricingCalculation {
  const {
    customerId,
    productId,
    quantity,
    asOfDate = '2026-09-17',
    manualDiscountPct = 0,
    overrideReason = '',
    isSupervisorApproved = false,
  } = params;

  // 1. Locate customer & tier
  const customer = CUSTOMERS_DATABASE.find((c: CustomerRecord) => c.id === customerId) || {
    id: customerId,
    name: 'Selected Retail Partner',
    tier: 'standard_retail' as CustomerTier,
    tierLabel: 'Standard Retail',
  };

  const customerTierDef = INITIAL_CUSTOMER_TIERS.find((t) => t.tierKey === customer.tier);
  const tierName = customerTierDef ? customerTierDef.name : customer.tierLabel || 'Standard Retail';

  // 2. Locate product price list
  const priceItem = INITIAL_PRICE_LIST.find((p) => p.productId === productId || p.id === productId);
  if (!priceItem) {
    throw new Error(`Product pricing not found for ID: ${productId}`);
  }

  const steps: PricingPriorityStep[] = [];
  let resolvedUnitPrice: number | null = null;
  let appliedSource: OrderPricingCalculation['appliedPriceSource'] = 'standard_price';
  let appliedSourceName = 'Wholesale Standard Catalog Price';

  // Helper date validator: checks if date is valid within range
  const isDateValid = (effDate: string, expDate: string) => {
    return asOfDate >= effDate && asOfDate <= expDate;
  };

  // ---------------------------------------------------------------
  // STEP 1: Customer-Specific Price
  // ---------------------------------------------------------------
  const customerSpecific = INITIAL_CUSTOMER_SPECIFIC_PRICES.find(
    (csp) =>
      csp.customerId === customerId &&
      (csp.productId === productId || csp.productId === priceItem.productId) &&
      csp.status === 'active' &&
      isDateValid(csp.effectiveDate, csp.expiryDate)
  );

  if (customerSpecific) {
    resolvedUnitPrice = customerSpecific.specialPrice;
    appliedSource = 'customer_specific';
    appliedSourceName = `Customer Contract (${customerSpecific.contractRef})`;
    steps.push({
      step: 1,
      levelName: 'Customer-Specific Price',
      isEvaluated: true,
      isMatched: true,
      resolvedPrice: customerSpecific.specialPrice,
      details: `Matched contract ${customerSpecific.contractRef} at special price of PKR ${customerSpecific.specialPrice.toLocaleString()} (Contract reason: ${customerSpecific.reason})`,
    });
  } else {
    // Check if there was an expired or non-matching specific price
    const expiredCSP = INITIAL_CUSTOMER_SPECIFIC_PRICES.find(
      (csp) =>
        csp.customerId === customerId &&
        (csp.productId === productId || csp.productId === priceItem.productId)
    );
    steps.push({
      step: 1,
      levelName: 'Customer-Specific Price',
      isEvaluated: true,
      isMatched: false,
      details: expiredCSP
        ? `Customer contract ${expiredCSP.contractRef} expired on ${expiredCSP.expiryDate} (Rejected under date covenants; cascaded).`
        : 'No customer-specific contract agreement found for this account.',
    });
  }

  // ---------------------------------------------------------------
  // STEP 2: Customer-Tier Price
  // ---------------------------------------------------------------
  const isTierPriceActive =
    priceItem.approvalStatus === 'approved' &&
    isDateValid(priceItem.effectiveDate, priceItem.expiryDate);

  if (!resolvedUnitPrice) {
    if (isTierPriceActive) {
      const tierKey = (customer.tier || 'standard_retail') as keyof typeof priceItem.tierPrices;
      const tierPrice = priceItem.tierPrices[tierKey];

      if (tierPrice && tierPrice > 0 && quantity >= priceItem.minQuantity) {
        resolvedUnitPrice = tierPrice;
        appliedSource = 'customer_tier';
        appliedSourceName = `${tierName} (MOQ ${priceItem.minQuantity} ${priceItem.packagingUnit}s)`;
        steps.push({
          step: 2,
          levelName: 'Customer-Tier Price',
          isEvaluated: true,
          isMatched: true,
          resolvedPrice: tierPrice,
          details: `Qualified for ${tierName} approved rate of PKR ${tierPrice.toLocaleString()} (Effective: ${priceItem.effectiveDate} to ${priceItem.expiryDate}).`,
        });
      } else if (quantity < priceItem.minQuantity) {
        steps.push({
          step: 2,
          levelName: 'Customer-Tier Price',
          isEvaluated: true,
          isMatched: false,
          details: `Order quantity (${quantity}) does not satisfy Tier MOQ requirement (${priceItem.minQuantity} ${priceItem.packagingUnit}s). Cascading to promotional or standard rate.`,
        });
      } else {
        steps.push({
          step: 2,
          levelName: 'Customer-Tier Price',
          isEvaluated: true,
          isMatched: false,
          details: `Standard retail tier rate applied (PKR ${priceItem.standardPrice.toLocaleString()}).`,
        });
      }
    } else {
      steps.push({
        step: 2,
        levelName: 'Customer-Tier Price',
        isEvaluated: true,
        isMatched: false,
        details: priceItem.isExpired || asOfDate > priceItem.expiryDate
          ? `Tier price list expired on ${priceItem.expiryDate}. Expired rates prohibited by governance controls.`
          : `Tier price list is in '${priceItem.approvalStatus}' status (not yet approved).`,
      });
    }
  } else {
    // Step 2 was bypassed because Step 1 took precedence
    steps.push({
      step: 2,
      levelName: 'Customer-Tier Price',
      isEvaluated: false,
      isMatched: false,
      details: 'Bypassed because Customer-Specific Price took priority.',
    });
  }

  // ---------------------------------------------------------------
  // STEP 3: Promotional Price / Trade Offer Eligibility
  // ---------------------------------------------------------------
  let tradeOfferApplied: TradeOffer | undefined = undefined;
  let tradeOfferDesc = '';
  let tradeOfferBonusQty = 0;
  let tradeOfferDiscountPct = 0;

  // Search trade offers for this product and tier
  const eligibleOffers = INITIAL_TRADE_OFFERS.filter((to) => {
    if (!to.isActive || to.approvalStatus !== 'approved') return false;
    if (!isDateValid(to.startDate, to.endDate)) return false;
    const isProdMatch = to.eligibleProductIds.includes(priceItem.productId);
    if (!isProdMatch) return false;

    const isTierMatch =
      to.eligibleTiers.includes('all') ||
      to.eligibleTiers.includes(customer.tier);
    if (!isTierMatch) return false;

    if (to.eligibleCustomerIds.length > 0 && !to.eligibleCustomerIds.includes(customerId)) {
      return false;
    }

    return quantity >= to.requiredQuantity;
  });

  if (eligibleOffers.length > 0) {
    // Take the best offer
    tradeOfferApplied = eligibleOffers[0];
    if (tradeOfferApplied.benefitType === 'discount_percentage' && tradeOfferApplied.discountPercentage) {
      tradeOfferDiscountPct = tradeOfferApplied.discountPercentage;
      tradeOfferDesc = `${tradeOfferApplied.name}: ${tradeOfferDiscountPct}% Promotional Trade Rebate`;
      // If Step 1 or 2 didn't resolve, or if trade offer replaces, promotional price can take precedence
      if (!resolvedUnitPrice) {
        resolvedUnitPrice = Math.round(priceItem.standardPrice * (1 - tradeOfferDiscountPct / 100));
        appliedSource = 'promotional_offer';
        appliedSourceName = `Promotional Offer: ${tradeOfferApplied.offerCode}`;
      }
    } else if (tradeOfferApplied.benefitType === 'bonus_quantity' && tradeOfferApplied.bonusQuantity) {
      const multiplier = Math.floor(quantity / tradeOfferApplied.requiredQuantity);
      tradeOfferBonusQty = (tradeOfferApplied.bonusQuantity || 1) * multiplier;
      tradeOfferDesc = `${tradeOfferApplied.name}: +${tradeOfferBonusQty} Free ${tradeOfferApplied.bonusProductName || 'Carton'}(s) Bonus`;
    }

    steps.push({
      step: 3,
      levelName: 'Promotional Price / Trade Offer',
      isEvaluated: true,
      isMatched: true,
      details: `Matched active scheme [${tradeOfferApplied.offerCode}] "${tradeOfferApplied.name}". Benefit: ${tradeOfferDesc} (Covenant: Order qty ${quantity} >= ${tradeOfferApplied.requiredQuantity}).`,
    });
  } else {
    // Check if any offer was rejected due to criteria
    const rejectedOffer = INITIAL_TRADE_OFFERS.find((to) =>
      to.eligibleProductIds.includes(priceItem.productId)
    );
    let rejectReason = 'No applicable promotional trade offer active for this SKU and account.';
    if (rejectedOffer) {
      if (!isDateValid(rejectedOffer.startDate, rejectedOffer.endDate)) {
        rejectReason = `Offer [${rejectedOffer.offerCode}] is outside active date window (${rejectedOffer.startDate} to ${rejectedOffer.endDate}).`;
      } else if (quantity < rejectedOffer.requiredQuantity) {
        rejectReason = `Offer [${rejectedOffer.offerCode}] requires MOQ of ${rejectedOffer.requiredQuantity} (Current: ${quantity}).`;
      } else if (
        !rejectedOffer.eligibleTiers.includes('all') &&
        !rejectedOffer.eligibleTiers.includes(customer.tier)
      ) {
        rejectReason = `Offer [${rejectedOffer.offerCode}] restricted to [${rejectedOffer.eligibleTiers.join(', ')}]. Customer is ${customer.tier}.`;
      }
    }
    steps.push({
      step: 3,
      levelName: 'Promotional Price / Trade Offer',
      isEvaluated: true,
      isMatched: false,
      details: rejectReason,
    });
  }

  // ---------------------------------------------------------------
  // STEP 4: Standard Price Fallback
  // ---------------------------------------------------------------
  if (!resolvedUnitPrice) {
    resolvedUnitPrice = priceItem.standardPrice;
    appliedSource = 'standard_price';
    appliedSourceName = 'Standard Base Catalog Price';
    steps.push({
      step: 4,
      levelName: 'Standard Price',
      isEvaluated: true,
      isMatched: true,
      resolvedPrice: priceItem.standardPrice,
      details: `Fallback to Standard Catalog Base Price of PKR ${priceItem.standardPrice.toLocaleString()} (No special contracts, tier discounts, or active promotions).`,
    });
  } else {
    steps.push({
      step: 4,
      levelName: 'Standard Price',
      isEvaluated: false,
      isMatched: false,
      details: `Bypassed because a higher priority pricing level (${appliedSourceName}) was applied.`,
    });
  }

  // ---------------------------------------------------------------
  // EXCEPTIONAL DISCOUNT CONTROLS & MANUAL OVERRIDES
  // ---------------------------------------------------------------
  const requiresSupervisorApproval = manualDiscountPct > 5.0 || (manualDiscountPct > 0 && !overrideReason.trim());
  let supervisorApprovalStatus: OrderPricingCalculation['supervisorApprovalStatus'] = 'none';
  let supervisorApprovedBy: string | undefined = undefined;

  if (requiresSupervisorApproval) {
    if (isSupervisorApproved) {
      supervisorApprovalStatus = 'approved';
      supervisorApprovedBy = 'Kashif Razzaq (Commercial Director)';
    } else {
      supervisorApprovalStatus = 'pending';
    }
  }

  // Calculate pricing components
  let effectiveUnitPrice = resolvedUnitPrice;

  // Apply promotional percentage rebate if applicable on unit price
  if (tradeOfferDiscountPct > 0) {
    effectiveUnitPrice = Math.round(effectiveUnitPrice * (1 - tradeOfferDiscountPct / 100));
  }

  // Apply manual discount override if approved or under threshold
  const isDiscountAllowed = !requiresSupervisorApproval || supervisorApprovalStatus === 'approved';
  const effectiveManualPct = isDiscountAllowed ? manualDiscountPct : 0;
  const manualDiscountAmount = Math.round(effectiveUnitPrice * (effectiveManualPct / 100));
  const finalUnitPrice = effectiveUnitPrice - manualDiscountAmount;

  const lineSubtotal = priceItem.standardPrice * quantity;
  const netLineTotal = finalUnitPrice * quantity;
  const totalDiscountAmount = lineSubtotal - netLineTotal;

  return {
    customerId,
    customerName: customer.name,
    customerTier: customer.tier,
    customerTierName: tierName,
    productId: priceItem.productId,
    sku: priceItem.sku,
    productName: priceItem.productName,
    quantity,
    packagingUnit: priceItem.packagingUnit,

    appliedPriceSource: appliedSource,
    appliedPriceSourceName: appliedSourceName,
    baseCatalogPrice: priceItem.standardPrice,
    resolvedUnitPrice,

    tradeOfferApplied,
    tradeOfferDescription: tradeOfferDesc,
    tradeOfferBonusQty,
    tradeOfferDiscountPct,

    manualDiscountPct,
    manualDiscountAmount,
    overrideReason,
    requiresSupervisorApproval,
    supervisorApprovalStatus,
    supervisorApprovedBy,

    finalUnitPrice,
    lineSubtotal,
    totalDiscountAmount,
    netLineTotal,

    steps,
  };
}
