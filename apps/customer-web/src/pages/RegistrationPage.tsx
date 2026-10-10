import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Button, Dropdown, Alert, Logo, Badge } from '@candi/ui';
import { useAuth } from '@candi/auth';

export const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateCustomerAccount, updateProfile } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [customerType, setCustomerType] = useState<'retailer' | 'sub_wholesaler'>('retailer');

  // Business info
  const [fullName, setFullName] = useState('Kamran Siddiqui');
  const [businessName, setBusinessName] = useState('Al-Madina Confectionery & Mini Mart');
  const [whatsapp, setWhatsapp] = useState(user?.phone || '0300 3333333');
  const [city, setCity] = useState('Karachi');
  const [area, setArea] = useState('Gulshan Block 4');

  // Address
  const [addressLabel, setAddressLabel] = useState('Main Shop');
  const [recipientName, setRecipientName] = useState('Kamran Siddiqui');
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '0300 3333333');
  const [addressLine, setAddressLine] = useState('Shop 4, Plot C-12, Commercial Market, Near Disco Bakery');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Unload between 10am to 5pm. Deliver to counter.');

  // Location / GPS Pin
  const [coordinates, setCoordinates] = useState('24.9180° N, 67.0971° E (Map Pin Confirmed)');
  const [gpsStatus, setGpsStatus] = useState<'granted' | 'manual'>('granted');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setError(null);
    if (step === 1 && !customerType) {
      setError('Please select your business tier');
      return;
    }
    if (step === 2 && (!fullName || !businessName || !city || !area)) {
      setError('Please complete all required business fields');
      return;
    }
    if (step === 3 && (!addressLabel || !recipientName || !recipientPhone || !addressLine)) {
      setError('Please enter your primary delivery address details');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await updateProfile({
      fullName,
      phone: user?.phone || '+923003333333',
    });

    await updateCustomerAccount({
      customerType,
      businessName,
      whatsappNumber: whatsapp,
      status: 'pending_review',
    });

    setIsLoading(false);
    navigate('/account/status');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'var(--font-family-base)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Logo size="md" variant="confectionery" />
          <h1
            style={{
              fontFamily: 'var(--font-family-base)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--color-smoky-black)',
              marginTop: '12px',
            }}
          >
            Business Account Registration
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--color-olive-drab)', marginTop: '4px' }}>
            Step {step} of 5 — {step === 1 && 'Select Customer Type'}
            {step === 2 && 'Business Details'}
            {step === 3 && 'Delivery Address'}
            {step === 4 && 'Map Location Pin'}
            {step === 5 && 'Review & Submit'}
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            marginBottom: '24px',
          }}
        >
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: s <= step ? 'var(--color-promo-crimson)' : 'var(--color-bone)',
                transition: 'background-color var(--transition-fast)',
              }}
            />
          ))}
        </div>

        <Card padding="lg" style={{ border: '1.5px solid var(--color-bone)' }}>
          {error && (
            <div style={{ marginBottom: '16px' }}>
              <Alert type="danger">{error}</Alert>
            </div>
          )}

          {/* STEP 1: CUSTOMER TYPE */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                Select Your Business Type
              </h3>

              <div
                onClick={() => setCustomerType('retailer')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${customerType === 'retailer' ? 'var(--color-promo-crimson)' : 'var(--color-bone)'}`,
                  backgroundColor: customerType === 'retailer' ? 'var(--color-promo-pink)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                    🏪 Retailer / Shop Owner
                  </div>
                  {customerType === 'retailer' && <Badge status="approved" label="SELECTED" />}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-olive-drab)', marginTop: '4px' }}>
                  For general stores, bakeries, supermarkets, and kiosks purchasing wholesale stock for direct resale.
                </p>
              </div>

              <div
                onClick={() => setCustomerType('sub_wholesaler')}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${customerType === 'sub_wholesaler' ? 'var(--color-promo-crimson)' : 'var(--color-bone)'}`,
                  backgroundColor: customerType === 'sub_wholesaler' ? 'var(--color-promo-pink)' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                    📦 Sub-Wholesaler / Bulk Buyer
                  </div>
                  {customerType === 'sub_wholesaler' && <Badge status="approved" label="SELECTED" />}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--color-olive-drab)', marginTop: '4px' }}>
                  For wholesale businesses purchasing in carton master quantities and supplying other retail shops.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS DETAILS */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                Business Details
              </h3>

              <Input
                label="Full Name of Contact Person"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kamran Siddiqui"
              />

              <Input
                label="Shop / Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Al-Madina Confectionery"
              />

              <Input
                label="WhatsApp Number for Order Confirmation"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="0300 1234567"
                helperText="Orders and invoices will be sent to this WhatsApp number."
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Karachi"
                />
                <Input
                  label="Area / Locality"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Gulshan Block 4"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PRIMARY DELIVERY ADDRESS */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                Primary Delivery Address
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="Address Label"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  placeholder="e.g. Main Shop, Branch 2"
                />
                <Input
                  label="Recipient Name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>

              <Input
                label="Recipient Phone Number"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />

              <Input
                label="Complete Street Address"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Shop number, building, street, landmark"
              />

              <Input
                label="Delivery Instructions (Optional)"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                placeholder="e.g. Deliver between 10am to 5pm"
              />
            </div>
          )}

          {/* STEP 4: MAP LOCATION PIN */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                Exact Delivery Location Pin
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
                Helps Candi delivery riders navigate directly to your shop counter without repeated calls.
              </p>

              {/* Mock Map View */}
              <div
                style={{
                  height: '220px',
                  backgroundColor: '#E5E3DF',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-bone)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* Visual Map Grid Pattern */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage:
                      'linear-gradient(#D0CCC3 1px, transparent 1px), linear-gradient(90deg, #D0CCC3 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    opacity: 0.5,
                  }}
                />

                {/* Animated Pin */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '36px',
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                      animation: 'candi-bounce 1s infinite alternate',
                    }}
                  >
                    📍
                  </div>
                  <div
                    style={{
                      backgroundColor: 'var(--color-smoky-black)',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '11px',
                      fontWeight: 700,
                      marginTop: '-4px',
                    }}
                  >
                    {businessName || 'Your Shop Counter'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setGpsStatus('granted');
                    setCoordinates('24.9180° N, 67.0971° E (Current GPS Detected)');
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-bone)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  🎯 Detect GPS Location
                </button>
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'var(--color-surface-muted)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ color: 'var(--color-olive-drab)' }}>Saved Coordinates:</span>
                <strong style={{ color: 'var(--color-success)' }}>{coordinates}</strong>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
                Note: If location permission is denied, your manual street address will be used for delivery.
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW & SUBMIT */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-smoky-black)' }}>
                Review Your Information
              </h3>

              <div
                style={{
                  backgroundColor: 'var(--color-surface-muted)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '13px',
                }}
              >
                <div>
                  <strong>Customer Tier:</strong>{' '}
                  <Badge status={customerType} label={customerType.toUpperCase()} />
                </div>
                <div>
                  <strong>Shop Name:</strong> {businessName}
                </div>
                <div>
                  <strong>Contact Person:</strong> {fullName}
                </div>
                <div>
                  <strong>WhatsApp:</strong> {whatsapp}
                </div>
                <div>
                  <strong>Delivery Address:</strong> {addressLine}, {area}, {city}
                </div>
                <div>
                  <strong>GPS Location:</strong> {coordinates}
                </div>
              </div>

              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--color-warning-bg)',
                  border: '1px solid var(--color-warning-border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--color-warning)',
                }}
              >
                ℹ️ Upon submission, your account starts with <strong>pending_review</strong>. Our wholesale team will verify your business details within 24 hours.
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={handleBack}>
                ← Back
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button type="button" variant="primary" onClick={handleNext}>
                Continue →
              </Button>
            ) : (
              <Button
                type="button"
                variant="promo"
                size="lg"
                isLoading={isLoading}
                onClick={handleSubmit}
              >
                Submit Registration ✓
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
