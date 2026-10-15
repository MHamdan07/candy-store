export function validatePaymentReference(params: {
  paymentMethod: string;
  receiptReference?: string;
  invoiceReference?: string;
  amount: number;
}): { isValid: boolean; error?: string } {
  if (params.amount <= 0) {
    return { isValid: false, error: 'Payment amount must be greater than zero.' };
  }

  if (params.paymentMethod === 'bank_transfer' || params.paymentMethod === 'cheque' || params.paymentMethod === 'pay_order') {
    if (!params.receiptReference || params.receiptReference.trim().length === 0) {
      return {
        isValid: false,
        error: `Receipt or transaction reference is mandatory for ${params.paymentMethod.replace('_', ' ')}.`,
      };
    }
  }

  return { isValid: true };
}
