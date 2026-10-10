import React, { useState } from 'react';
import { Card, Table, Badge, Button, Input, Dropdown, Modal, Alert } from '@candi/ui';
import {
  ConversationalVerificationRecord,
  ConversationalVerificationLineItem,
  TeleSalesCallOutcome,
  VerificationStatus,
  VerificationStage,
  PickingReleaseDetails,
} from '@candi/types';
import {
  INITIAL_VERIFICATION_RECORDS,
  calculateVerificationKpis,
} from '../../data/conversationalVerification';
import { PickingReleaseModal } from './PickingReleaseModal';
import { PrintablePickSlipModal } from './PrintablePickSlipModal';

export const ConversationalVerificationPage: React.FC = () => {
  const [records, setRecords] = useState<ConversationalVerificationRecord[]>(INITIAL_VERIFICATION_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<ConversationalVerificationRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'tele_sales' | 'awaiting_whatsapp' | 'verified' | 'released' | 'sla_breached'>('all');
  const [activeStageFilter, setActiveStageFilter] = useState<'ALL' | 1 | 2 | 3 | 4 | 5>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [detailModalTab, setDetailModalTab] = useState<'whatsapp' | 'call_desk' | 'line_items' | 'credit_signoff'>('whatsapp');

  // Multi-select for batch warehouse wave release
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Picking Release and Pick Slip Modals
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [ordersToRelease, setOrdersToRelease] = useState<ConversationalVerificationRecord[]>([]);
  const [isPickSlipModalOpen, setIsPickSlipModalOpen] = useState(false);
  const [pickSlipRecord, setPickSlipRecord] = useState<ConversationalVerificationRecord | null>(null);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Call Desk Form State
  const [callOutcome, setCallOutcome] = useState<TeleSalesCallOutcome>('voice_confirmed');
  const [callDuration, setCallDuration] = useState<number>(60);
  const [callNotes, setCallNotes] = useState<string>('');
  const [callbackTime, setCallbackTime] = useState<string>('Today, 02:00 PM');

  // In-Call Editable Line Items State
  const [editableLines, setEditableLines] = useState<ConversationalVerificationLineItem[]>([]);

  const kpis = calculateVerificationKpis(records);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  // Open detail modal and sync editable lines
  const handleOpenDetailModal = (record: ConversationalVerificationRecord) => {
    setSelectedRecord(record);
    setEditableLines(JSON.parse(JSON.stringify(record.lines)));
    if (record.currentStage === 3 || record.verificationStatus === 'escalated_telesales') {
      setDetailModalTab('call_desk');
    } else if (record.currentStage === 4) {
      setDetailModalTab('credit_signoff');
    } else {
      setDetailModalTab('whatsapp');
    }
    setCallNotes('');
  };

  // Update line item quantity live during call
  const handleQuantityChange = (lineId: string, delta: number) => {
    setEditableLines((prev) =>
      prev.map((item) => {
        if (item.id === lineId) {
          const newQty = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newQty,
            subtotal: newQty * item.unitPrice,
          };
        }
        return item;
      })
    );
  };

  const handleSaveLineAdjustments = () => {
    if (!selectedRecord) return;
    const newTotal = editableLines.reduce((acc, curr) => acc + curr.subtotal, 0);

    const updatedRecord: ConversationalVerificationRecord = {
      ...selectedRecord,
      lines: editableLines,
      totalAmount: newTotal,
      currentStage: 3,
      verificationStatus: 'changes_requested',
    };

    setRecords((prev) => prev.map((r) => (r.id === selectedRecord.id ? updatedRecord : r)));
    setSelectedRecord(updatedRecord);
    showNotification(`Order ${selectedRecord.orderNumber} quantities adjusted. New total: PKR ${newTotal.toLocaleString()}`);
  };

  // Simulate Inbound Customer WhatsApp actions
  const handleSimulateWhatsAppConfirm = () => {
    if (!selectedRecord) return;
    const timestamp = 'Just Now';
    const updatedMessages = [
      ...selectedRecord.whatsappMessages,
      {
        id: `msg-${Date.now()}`,
        timestamp,
        direction: 'inbound' as const,
        messageType: 'interactive_buttons' as const,
        body: '✅ Retailer tapped: [Confirm Order - Sab Theek Hai]',
        deliveryStatus: 'read' as const,
        interactivePayload: { buttonClicked: 'confirm' as const },
      },
    ];

    const updatedRecord: ConversationalVerificationRecord = {
      ...selectedRecord,
      verificationStatus: 'whatsapp_confirmed',
      currentStage: 4,
      isSlaBreached: false,
      priority: 'normal',
      verifiedAt: 'Today (Simulated Bot)',
      verifiedBy: 'WhatsApp Auto-Verify Bot',
      creditCheckPassed: true,
      whatsappMessages: updatedMessages,
    };

    setRecords((prev) => prev.map((r) => (r.id === selectedRecord.id ? updatedRecord : r)));
    setSelectedRecord(updatedRecord);
    setDetailModalTab('credit_signoff');
    showNotification(`Order ${selectedRecord.orderNumber} confirmed via WhatsApp! Advanced to Stage 4 (Credit & Sign-Off).`);
  };

  const handleSimulateWhatsAppChangeRequest = () => {
    if (!selectedRecord) return;
    const updatedMessages = [
      ...selectedRecord.whatsappMessages,
      {
        id: `msg-${Date.now()}`,
        timestamp: 'Just Now',
        direction: 'inbound' as const,
        messageType: 'customer_reply' as const,
        body: 'Bhai jaan 1 carton kam kardein, aur delivery kal subah 11 baje se pehle bhejein.',
        deliveryStatus: 'read' as const,
        interactivePayload: {
          buttonClicked: 'edit' as const,
          customerReplyText: 'Quantity adjustment requested via Urdu text',
        },
      },
    ];

    const updatedRecord: ConversationalVerificationRecord = {
      ...selectedRecord,
      verificationStatus: 'changes_requested',
      currentStage: 2,
      priority: 'urgent',
      whatsappMessages: updatedMessages,
    };

    setRecords((prev) => prev.map((r) => (r.id === selectedRecord.id ? updatedRecord : r)));
    setSelectedRecord(updatedRecord);
    setDetailModalTab('call_desk');
    showNotification(`Customer change request received. Order ${selectedRecord.orderNumber} routed to Tele-Sales desk.`);
  };

  const handleSendReminderPing = () => {
    if (!selectedRecord) return;
    const updatedMessages = [
      ...selectedRecord.whatsappMessages,
      {
        id: `msg-${Date.now()}`,
        timestamp: 'Just Now',
        direction: 'outbound' as const,
        messageType: 'reminder_ping' as const,
        body: 'Reminder: Muhtaram Shopkeeper, apka booking confirm karna zaroori hai. Dispatch route tayyar hai.',
        deliveryStatus: 'delivered' as const,
      },
    ];

    const updatedRecord: ConversationalVerificationRecord = {
      ...selectedRecord,
      whatsappMessages: updatedMessages,
    };

    setRecords((prev) => prev.map((r) => (r.id === selectedRecord.id ? updatedRecord : r)));
    setSelectedRecord(updatedRecord);
    showNotification(`Automated WhatsApp reminder template dispatched to ${selectedRecord.whatsappNumber}`);
  };

  // Tele-Sales Call Logging
  const handleSaveCallRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    const newCallLog = {
      id: `call-${Date.now()}`,
      timestamp: 'Just Now',
      agentId: 'agent-current',
      agentName: 'Zainab Bibi (Tele-Sales)',
      durationSeconds: Number(callDuration),
      outcome: callOutcome,
      notes: callNotes || 'Phone verification call completed.',
      callbackScheduledAt: callOutcome === 'customer_busy_callback' ? callbackTime : undefined,
    };

    let nextStatus: VerificationStatus = selectedRecord.verificationStatus;
    let nextStage: VerificationStage = selectedRecord.currentStage;
    let nextBreach = selectedRecord.isSlaBreached;

    if (callOutcome === 'voice_confirmed' || callOutcome === 'quantity_adjusted') {
      nextStatus = 'voice_verified';
      nextStage = 4;
      nextBreach = false;
    } else if (callOutcome === 'shop_closed_cancelled') {
      nextStatus = 'cancelled';
      nextBreach = false;
    } else if (callOutcome === 'customer_busy_callback') {
      nextStatus = 'escalated_telesales';
      nextStage = 3;
    }

    const updatedRecord: ConversationalVerificationRecord = {
      ...selectedRecord,
      callLogs: [newCallLog, ...selectedRecord.callLogs],
      verificationStatus: nextStatus,
      currentStage: nextStage,
      isSlaBreached: nextBreach,
      verifiedAt: nextStage === 4 ? 'Today, Just Now' : selectedRecord.verifiedAt,
      verifiedBy: nextStage === 4 ? 'Zainab Bibi (Tele-Sales)' : selectedRecord.verifiedBy,
      creditCheckPassed: nextStage === 4 ? true : selectedRecord.creditCheckPassed,
    };

    setRecords((prev) => prev.map((r) => (r.id === selectedRecord.id ? updatedRecord : r)));
    setSelectedRecord(updatedRecord);
    if (nextStage === 4) {
      setDetailModalTab('credit_signoff');
    }
    showNotification(`Call log saved. Order ${selectedRecord.orderNumber} advanced to Stage ${nextStage}.`);
  };

  // Direct Voice Verify Action
  const handleDirectVoiceVerify = (recordId: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              verificationStatus: 'voice_verified',
              currentStage: 4,
              isSlaBreached: false,
              priority: 'normal',
              verifiedAt: 'Today, Just Now',
              verifiedBy: 'Tele-Sales Agent',
              creditCheckPassed: true,
            }
          : r
      )
    );
    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: 'voice_verified',
              currentStage: 4,
              isSlaBreached: false,
              priority: 'normal',
              verifiedAt: 'Today, Just Now',
              verifiedBy: 'Tele-Sales Agent',
              creditCheckPassed: true,
            }
          : null
      );
    }
    showNotification(`Order voice-verified & approved! Moved to Stage 4 (Credit & Sign-Off).`);
  };

  // Stage 4 Credit Sign-Off -> Unlock Stage 5 Picking Release
  const handleSignOffToPickingRelease = (record: ConversationalVerificationRecord) => {
    const updatedRecord: ConversationalVerificationRecord = {
      ...record,
      currentStage: 4,
      creditCheckPassed: true,
      verifiedAt: record.verifiedAt || 'Today, Just Now',
      verifiedBy: record.verifiedBy || 'Credit Controller & Booker',
    };

    setRecords((prev) => prev.map((r) => (r.id === record.id ? updatedRecord : r)));
    setSelectedRecord(null);

    // Open Picking Release Modal directly for this order
    setOrdersToRelease([updatedRecord]);
    setIsReleaseModalOpen(true);
    showNotification(`Credit approved for ${record.orderNumber}! Select wave to release to warehouse floor.`);
  };

  // Trigger Single Order Picking Release Modal
  const handleOpenSingleReleaseModal = (record: ConversationalVerificationRecord) => {
    setOrdersToRelease([record]);
    setIsReleaseModalOpen(true);
  };

  // Trigger Bulk Batch Wave Release Modal
  const handleOpenBatchReleaseModal = () => {
    const selectedList = records.filter((r) => selectedOrderIds.includes(r.id));
    if (selectedList.length === 0) {
      showNotification('Please select at least one verified order to release.');
      return;
    }
    setOrdersToRelease(selectedList);
    setIsReleaseModalOpen(true);
  };

  // Commit Wave Release to Floor (Stage 5)
  const handleConfirmPickingRelease = (
    orders: ConversationalVerificationRecord[],
    releaseDetails: PickingReleaseDetails
  ) => {
    const orderIds = new Set(orders.map((o) => o.id));

    setRecords((prev) =>
      prev.map((r) => {
        if (orderIds.has(r.id)) {
          return {
            ...r,
            currentStage: 5,
            verificationStatus: 'released_for_picking',
            pickingRelease: {
              ...releaseDetails,
              manifestCode: `WPK-2026-${r.orderNumber.replace(/[^0-9]/g, '')}`,
            },
          };
        }
        return r;
      })
    );

    setIsReleaseModalOpen(false);
    setSelectedOrderIds([]);
    showNotification(
      `🎉 Wave Released! ${orders.length} order(s) authorized for warehouse floor on ${releaseDetails.waveName}. Pick slip generated.`
    );
  };

  // Open Printable Pick Slip
  const handleOpenPickSlip = (record: ConversationalVerificationRecord) => {
    setPickSlipRecord(record);
    setIsPickSlipModalOpen(true);
  };

  // Cancel order with audit
  const handleCancelOrder = (recordId: string) => {
    const reason = window.prompt('Enter cancellation reason (e.g. Retailer refused order, Duplicate entry):');
    if (!reason) return;

    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              verificationStatus: 'cancelled',
              cancellationReason: reason,
              isSlaBreached: false,
            }
          : r
      )
    );
    if (selectedRecord && selectedRecord.id === recordId) {
      setSelectedRecord((prev) =>
        prev
          ? {
              ...prev,
              verificationStatus: 'cancelled',
              cancellationReason: reason,
              isSlaBreached: false,
            }
          : null
      );
    }
    showNotification(`Order marked as Cancelled. Allocated warehouse stock released.`);
  };

  // Toggle selection for batch release
  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleSelectAll = (filtered: ConversationalVerificationRecord[]) => {
    const releasableIds = filtered
      .filter((r) => r.currentStage === 4 || r.verificationStatus === 'whatsapp_confirmed' || r.verificationStatus === 'voice_verified')
      .map((r) => r.id);

    if (selectedOrderIds.length >= releasableIds.length && releasableIds.length > 0) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(releasableIds);
    }
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    // Stage Filter
    if (activeStageFilter !== 'ALL' && r.currentStage !== activeStageFilter) {
      return false;
    }

    // Tab filter
    if (activeTab === 'tele_sales') {
      if (r.verificationStatus !== 'escalated_telesales' && r.verificationStatus !== 'changes_requested') {
        return false;
      }
    } else if (activeTab === 'awaiting_whatsapp') {
      if (r.verificationStatus !== 'whatsapp_pending' && r.verificationStatus !== 'whatsapp_delivered' && r.verificationStatus !== 'whatsapp_read') {
        return false;
      }
    } else if (activeTab === 'verified') {
      if (r.verificationStatus !== 'whatsapp_confirmed' && r.verificationStatus !== 'voice_verified') {
        return false;
      }
    } else if (activeTab === 'released') {
      if (r.verificationStatus !== 'released_for_picking' && r.verificationStatus !== 'picked') {
        return false;
      }
    } else if (activeTab === 'sla_breached') {
      if (!r.isSlaBreached) return false;
    }

    // Zone filter
    if (zoneFilter !== 'ALL' && r.deliveryZone !== zoneFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = r.orderNumber.toLowerCase().includes(q);
      const matchShop = r.businessName.toLowerCase().includes(q);
      const matchCust = r.customerName.toLowerCase().includes(q);
      const matchPhone = r.phoneNumber.includes(q) || r.whatsappNumber.includes(q);
      if (!matchNumber && !matchShop && !matchCust && !matchPhone) {
        return false;
      }
    }

    return true;
  });

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'released_for_picking':
        return <Badge status="delivered" label="📦 Released to Picking Floor" />;
      case 'picked':
        return <Badge status="delivered" label="✓ Warehouse Picked" />;
      case 'whatsapp_confirmed':
        return <Badge status="delivered" label="WhatsApp Confirmed" />;
      case 'voice_verified':
        return <Badge status="delivered" label="Voice Verified (Tele-Sales)" />;
      case 'escalated_telesales':
        return <Badge status="overdue" label="Escalated to Tele-Sales" />;
      case 'changes_requested':
        return <Badge status="partial" label="Changes Requested" />;
      case 'whatsapp_read':
        return <Badge status="pending" label="WhatsApp Read (Blue Ticks)" />;
      case 'whatsapp_delivered':
        return <Badge status="draft" label="WhatsApp Delivered" />;
      case 'whatsapp_pending':
        return <Badge status="draft" label="WhatsApp Sent" />;
      case 'cancelled':
        return <Badge status="cancelled" label="Order Cancelled" />;
      case 'unreachable':
        return <Badge status="overdue" label="Phone Unreachable" />;
      default:
        return <Badge status="draft" label={status} />;
    }
  };

  const renderStageMilestoneTrack = (stage: VerificationStage) => {
    const stageTitles = ['WA Sent', 'Bot Triage', 'Tele-Sales', 'Credit Sign', 'Picking'];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
        {[1, 2, 3, 4, 5].map((s) => {
          const isPassed = s < stage;
          const isCurrent = s === stage;
          const bg = isCurrent ? '#E11D48' : isPassed ? '#10B981' : '#E2E8F0';
          const textColor = isCurrent || isPassed ? '#FFFFFF' : '#64748B';

          return (
            <div
              key={s}
              title={`Stage ${s}: ${stageTitles[s - 1]}`}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: bg,
                color: textColor,
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isCurrent ? '2px solid #FDA4AF' : 'none',
              }}
            >
              {isPassed ? '✓' : s}
            </div>
          );
        })}
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', marginLeft: '4px' }}>
          Stage {stage}/5
        </span>
      </div>
    );
  };

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredRecords.filter((r) => r.currentStage === 4).length}
          onChange={() => toggleSelectAll(filteredRecords)}
          title="Select all verified orders for batch wave release"
          style={{ cursor: 'pointer' }}
        />
      ),
      render: (r: ConversationalVerificationRecord) => {
        const isReleasable = r.currentStage === 4 || r.verificationStatus === 'whatsapp_confirmed' || r.verificationStatus === 'voice_verified';
        return (
          <input
            type="checkbox"
            checked={selectedOrderIds.includes(r.id)}
            disabled={!isReleasable}
            onChange={() => toggleSelectOrder(r.id)}
            style={{ cursor: isReleasable ? 'pointer' : 'not-allowed' }}
          />
        );
      },
      width: '40px',
    },
    {
      header: 'Order & Booker',
      render: (r: ConversationalVerificationRecord) => (
        <div>
          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>{r.orderNumber}</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '3px', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                backgroundColor: '#F1F5F9',
                color: '#475569',
                padding: '1px 6px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              {r.orderSource.replace(/_/g, ' ')}
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>{r.orderCreatedAt}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Retailer & Business',
      render: (r: ConversationalVerificationRecord) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.businessName}</div>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            {r.customerName} • <span style={{ color: '#0284C7', fontWeight: 600 }}>{r.whatsappNumber}</span>
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            Khata: PKR {r.currentKhataBalance.toLocaleString()} / Limit: PKR {r.creditLimit.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Zone & Delivery',
      render: (r: ConversationalVerificationRecord) => (
        <div>
          <div style={{ fontWeight: 600, color: '#334155', fontSize: '12px' }}>{r.deliveryZone}</div>
          <div
            style={{
              fontSize: '11px',
              color: '#64748B',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '180px',
            }}
          >
            {r.deliveryAddress}
          </div>
        </div>
      ),
    },
    {
      header: 'Order Value & Volume',
      render: (r: ConversationalVerificationRecord) => (
        <div>
          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '13px' }}>
            PKR {r.totalAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {r.lines.reduce((sum, l) => sum + l.quantity, 0)} units ({r.lines.length} lines) • {r.paymentMethod.replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>
      ),
    },
    {
      header: '5-Stage Workflow & Status',
      render: (r: ConversationalVerificationRecord) => (
        <div>
          {getStatusBadge(r.verificationStatus)}
          {renderStageMilestoneTrack(r.currentStage)}
          <div style={{ marginTop: '4px', fontSize: '11px', fontWeight: 600 }}>
            {r.isSlaBreached ? (
              <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔴 <span>SLA Breached ({r.slaDeadline})</span>
              </span>
            ) : r.verificationStatus === 'released_for_picking' ? (
              <span style={{ color: '#059669' }}>
                🚀 Wave: {r.pickingRelease?.waveName ? r.pickingRelease.waveName.split(' - ')[0] : 'Assigned'}
              </span>
            ) : r.currentStage === 4 ? (
              <span style={{ color: '#059669' }}>✓ Verified • Ready for Picking</span>
            ) : (
              <span style={{ color: '#D97706' }}>⏱️ SLA: {r.slaDeadline}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Fulfillment & Actions',
      render: (r: ConversationalVerificationRecord) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenDetailModal(r)}
          >
            Open Desk
          </Button>

          {/* If Stage 4 (Verified): Direct Release to Floor Button */}
          {(r.currentStage === 4 || r.verificationStatus === 'whatsapp_confirmed' || r.verificationStatus === 'voice_verified') && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleOpenSingleReleaseModal(r)}
            >
              🚀 Release to Floor
            </Button>
          )}

          {/* If Stage 5 (Released): View Official Pick Slip */}
          {r.currentStage === 5 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenPickSlip(r)}
            >
              🖨️ Pick Slip
            </Button>
          )}

          {/* If Stage 3 (Escalation): Quick Voice Verify */}
          {r.currentStage === 3 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDirectVoiceVerify(r.id)}
            >
              Voice Verify
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {notification && (
        <Alert
          type="info"
          title="Conversational Engine Notification"
          onClose={() => setNotification(null)}
        >
          {notification}
        </Alert>
      )}

      {/* 5-STAGE INTERACTIVE WORKFLOW PIPELINE BAR */}
      <Card padding="md">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#E11D48', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                5-Stage Conversational Verification & Fulfillment Pipeline
              </span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                Order-to-Picking Lifecycle Engine
              </h3>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              Filter by Stage to manage operational queues:
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '10px',
            }}
          >
            {/* Stage 1 */}
            <div
              onClick={() => setActiveStageFilter(activeStageFilter === 1 ? 'ALL' : 1)}
              style={{
                backgroundColor: activeStageFilter === 1 ? '#EFF6FF' : '#F8FAFC',
                border: activeStageFilter === 1 ? '2px solid #3B82F6' : '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#3B82F6' }}>STAGE 1</span>
                <span
                  style={{
                    backgroundColor: '#DBEAFE',
                    color: '#1D4ED8',
                    padding: '1px 8px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {kpis.stage1Count}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                💬 WhatsApp Dispatch
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                Sent & read telemetry (30m SLA)
              </div>
            </div>

            {/* Stage 2 */}
            <div
              onClick={() => setActiveStageFilter(activeStageFilter === 2 ? 'ALL' : 2)}
              style={{
                backgroundColor: activeStageFilter === 2 ? '#F0FDF4' : '#F8FAFC',
                border: activeStageFilter === 2 ? '2px solid #10B981' : '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981' }}>STAGE 2</span>
                <span
                  style={{
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    padding: '1px 8px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {kpis.stage2Count}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                🤖 Retailer Bot Triage
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                One-tap confirm or change request
              </div>
            </div>

            {/* Stage 3 */}
            <div
              onClick={() => setActiveStageFilter(activeStageFilter === 3 ? 'ALL' : 3)}
              style={{
                backgroundColor: activeStageFilter === 3 ? '#FFFBEB' : '#F8FAFC',
                border: activeStageFilter === 3 ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B' }}>STAGE 3</span>
                <span
                  style={{
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    padding: '1px 8px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {kpis.stage3Count}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                📞 Tele-Sales Escalation
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                Voice calls & live carton adjuster
              </div>
            </div>

            {/* Stage 4 */}
            <div
              onClick={() => setActiveStageFilter(activeStageFilter === 4 ? 'ALL' : 4)}
              style={{
                backgroundColor: activeStageFilter === 4 ? '#FAF5FF' : '#F8FAFC',
                border: activeStageFilter === 4 ? '2px solid #8B5CF6' : '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#8B5CF6' }}>STAGE 4</span>
                <span
                  style={{
                    backgroundColor: '#EDE9FE',
                    color: '#6D28D9',
                    padding: '1px 8px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {kpis.stage4Count}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                🛡️ Credit & Sign-Off
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                Khata check & picking authorization
              </div>
            </div>

            {/* Stage 5 */}
            <div
              onClick={() => setActiveStageFilter(activeStageFilter === 5 ? 'ALL' : 5)}
              style={{
                backgroundColor: activeStageFilter === 5 ? '#F0FDF4' : '#F8FAFC',
                border: activeStageFilter === 5 ? '2px solid #059669' : '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>STAGE 5</span>
                <span
                  style={{
                    backgroundColor: '#D1FAE5',
                    color: '#065F46',
                    padding: '1px 8px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {kpis.stage5Count}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                🚀 Picking Release Engine
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                Wave allocation & printable pick slips
              </div>
            </div>
          </div>

          {activeStageFilter !== 'ALL' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                Showing only orders in <strong>Stage {activeStageFilter}</strong>.
              </span>
              <button
                onClick={() => setActiveStageFilter('ALL')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#E11D48',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear Stage Filter (Show All 5 Stages)
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* KPI Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
        }}
      >
        <Card padding="md">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Pending Verification
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
            {kpis.totalPendingOrders} Orders
          </div>
          <div style={{ fontSize: '12px', color: '#0284C7', fontWeight: 600, marginTop: '2px' }}>
            PKR {kpis.totalPendingValue.toLocaleString()} volume
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            WhatsApp Auto-Confirmed
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            {kpis.whatsappAutoConfirmRate}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
            {kpis.whatsappConfirmedCount} orders automated via Bot
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Ready for Picking
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#8B5CF6', marginTop: '6px' }}>
            {kpis.readyForPickingCount} Orders
          </div>
          <div style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: 600, marginTop: '2px' }}>
            Khata credit approved
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Released to Floor
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
            {kpis.releasedForPickingCount} Orders
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
            Active in warehouse waves
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            SLA Breached (&gt;30m)
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#DC2626', marginTop: '6px' }}>
            {kpis.slaBreachedCount} Orders
          </div>
          <div style={{ fontSize: '12px', color: '#DC2626', fontWeight: 600, marginTop: '2px' }}>
            Dispatch cut-off risk
          </div>
        </Card>
      </div>

      {/* Filter Tabs and Actions Bar */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
            <button
              onClick={() => setActiveTab('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'all' ? 700 : 500,
                backgroundColor: activeTab === 'all' ? '#0F172A' : '#F1F5F9',
                color: activeTab === 'all' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              All Orders ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('tele_sales')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'tele_sales' ? 700 : 500,
                backgroundColor: activeTab === 'tele_sales' ? '#D97706' : '#F1F5F9',
                color: activeTab === 'tele_sales' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              📞 Tele-Sales Escalations ({records.filter((r) => r.verificationStatus === 'escalated_telesales' || r.verificationStatus === 'changes_requested').length})
            </button>
            <button
              onClick={() => setActiveTab('awaiting_whatsapp')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'awaiting_whatsapp' ? 700 : 500,
                backgroundColor: activeTab === 'awaiting_whatsapp' ? '#0284C7' : '#F1F5F9',
                color: activeTab === 'awaiting_whatsapp' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              💬 Awaiting WhatsApp Reply ({records.filter((r) => r.verificationStatus === 'whatsapp_pending' || r.verificationStatus === 'whatsapp_delivered' || r.verificationStatus === 'whatsapp_read').length})
            </button>
            <button
              onClick={() => setActiveTab('verified')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'verified' ? 700 : 500,
                backgroundColor: activeTab === 'verified' ? '#8B5CF6' : '#F1F5F9',
                color: activeTab === 'verified' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🛡️ Ready for Picking Release ({kpis.readyForPickingCount})
            </button>
            <button
              onClick={() => setActiveTab('released')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'released' ? 700 : 500,
                backgroundColor: activeTab === 'released' ? '#059669' : '#F1F5F9',
                color: activeTab === 'released' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🚀 Released to Warehouse Floor ({kpis.releasedForPickingCount})
            </button>
            <button
              onClick={() => setActiveTab('sla_breached')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === 'sla_breached' ? 700 : 500,
                backgroundColor: activeTab === 'sla_breached' ? '#DC2626' : '#F1F5F9',
                color: activeTab === 'sla_breached' ? '#FFFFFF' : '#475569',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              🚨 SLA Breached ({kpis.slaBreachedCount})
            </button>
          </div>

          {/* Search, Zone Dropdown, and Batch Actions */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '12px', flex: '1 1 500px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 260px' }}>
                <Input
                  label="Search Order #, Retailer Name, or Phone"
                  placeholder="e.g. ORD-2026-101, Bilal, 0300..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ width: '220px' }}>
                <Dropdown
                  label="Delivery Territory Zone"
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Territory Zones' },
                    { value: 'Zone 1 - Nazimabad', label: 'Zone 1 - Nazimabad' },
                    { value: 'Zone 2 - Gulshan', label: 'Zone 2 - Gulshan' },
                    { value: 'Zone 3 - Saddar', label: 'Zone 3 - Saddar' },
                    { value: 'Zone 4 - Korangi', label: 'Zone 4 - Korangi' },
                    { value: 'Zone 5 - Clifton & DHA', label: 'Zone 5 - Clifton & DHA' },
                  ]}
                />
              </div>
            </div>

            {/* Batch Release and Utility Actions */}
            <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', flexWrap: 'wrap' }}>
              {selectedOrderIds.length > 0 && (
                <Button
                  variant="primary"
                  onClick={handleOpenBatchReleaseModal}
                >
                  🚀 Batch Release Wave ({selectedOrderIds.length} Selected)
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setZoneFilter('ALL');
                  setActiveTab('all');
                  setActiveStageFilter('ALL');
                  setSelectedOrderIds([]);
                }}
              >
                Reset Filters
              </Button>

              <Button
                variant="secondary"
                onClick={() => showNotification('Bulk automated reminder pings dispatched to awaiting WhatsApp orders.')}
              >
                Dispatched Bulk Reminders
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Queue Table */}
      <Card padding="lg">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Active Conversational Verification Queue ({filteredRecords.length})
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B' }}>
              Real-time multi-channel confirmation status. Verified orders are automatically routed to the Warehouse Picking Release Engine.
            </p>
          </div>
          {selectedOrderIds.length > 0 && (
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
              {selectedOrderIds.length} orders selected for wave release
            </div>
          )}
        </div>

        <Table
          columns={columns}
          data={filteredRecords}
          keyExtractor={(r) => r.id}
          emptyMessage="No orders found matching the filter criteria."
        />
      </Card>

      {/* DETAIL VERIFICATION DESK MODAL */}
      {selectedRecord && (
        <Modal
          isOpen={Boolean(selectedRecord)}
          onClose={() => setSelectedRecord(null)}
          title={`Verification Desk: ${selectedRecord.orderNumber} — ${selectedRecord.businessName}`}
          maxWidth="940px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelOrder(selectedRecord.id)}
                >
                  Cancel Order
                </Button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedRecord.currentStage < 4 && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleDirectVoiceVerify(selectedRecord.id)}
                  >
                    ✓ Voice Verify & Advance to Stage 4
                  </Button>
                )}
                {selectedRecord.currentStage === 4 && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSignOffToPickingRelease(selectedRecord)}
                  >
                    🚀 Release to Warehouse Floor (Stage 5)
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setSelectedRecord(null)}>
                  Close Desk
                </Button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Customer Summary Top Bar */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '14px 18px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>RETAIL STORE</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                  {selectedRecord.businessName}
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>{selectedRecord.customerName}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CONTACT CHANNELS</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '2px' }}>
                  <a
                    href={`tel:${selectedRecord.phoneNumber}`}
                    style={{
                      fontSize: '12px',
                      color: '#0284C7',
                      textDecoration: 'none',
                      fontWeight: 700,
                    }}
                  >
                    📞 Call {selectedRecord.phoneNumber}
                  </a>
                  <a
                    href={`https://wa.me/${selectedRecord.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '12px',
                      color: '#059669',
                      textDecoration: 'none',
                      fontWeight: 700,
                    }}
                  >
                    💬 WhatsApp Web
                  </a>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Zone: {selectedRecord.deliveryZone}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>KHATA CREDIT PROFILE</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  PKR {selectedRecord.currentKhataBalance.toLocaleString()}{' '}
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>
                    / {selectedRecord.creditLimit.toLocaleString()} limit
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                  Payment: {selectedRecord.paymentMethod.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CURRENT STATE</div>
                <div style={{ marginTop: '2px' }}>{getStatusBadge(selectedRecord.verificationStatus)}</div>
                <div style={{ fontSize: '11px', color: selectedRecord.isSlaBreached ? '#DC2626' : '#64748B', fontWeight: 600 }}>
                  {selectedRecord.slaDeadline}
                </div>
              </div>
            </div>

            {/* Modal Internal Navigation Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setDetailModalTab('whatsapp')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: detailModalTab === 'whatsapp' ? 700 : 500,
                  backgroundColor: detailModalTab === 'whatsapp' ? '#0F172A' : '#F1F5F9',
                  color: detailModalTab === 'whatsapp' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>💬 WhatsApp Bot Simulator</span>
                <span style={{ fontSize: '11px', backgroundColor: '#334155', padding: '1px 6px', borderRadius: '999px', color: '#FFF' }}>
                  {selectedRecord.whatsappMessages.length}
                </span>
              </button>

              <button
                onClick={() => setDetailModalTab('call_desk')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: detailModalTab === 'call_desk' ? 700 : 500,
                  backgroundColor: detailModalTab === 'call_desk' ? '#D97706' : '#F1F5F9',
                  color: detailModalTab === 'call_desk' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>📞 Tele-Sales Voice Desk</span>
                {selectedRecord.callLogs.length > 0 && (
                  <span style={{ fontSize: '11px', backgroundColor: '#92400E', padding: '1px 6px', borderRadius: '999px', color: '#FFF' }}>
                    {selectedRecord.callLogs.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setDetailModalTab('line_items')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: detailModalTab === 'line_items' ? 700 : 500,
                  backgroundColor: detailModalTab === 'line_items' ? '#0F172A' : '#F1F5F9',
                  color: detailModalTab === 'line_items' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>📝 In-Call Quantity Adjuster ({editableLines.length} SKUs)</span>
              </button>

              <button
                onClick={() => setDetailModalTab('credit_signoff')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: detailModalTab === 'credit_signoff' ? 700 : 500,
                  backgroundColor: detailModalTab === 'credit_signoff' ? '#8B5CF6' : '#F1F5F9',
                  color: detailModalTab === 'credit_signoff' ? '#FFFFFF' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>🛡️ Credit Gate & Stage 5 Release</span>
                {selectedRecord.currentStage >= 4 && (
                  <span style={{ fontSize: '11px', backgroundColor: '#059669', padding: '1px 6px', borderRadius: '999px', color: '#FFF' }}>
                    ✓ Ready
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: WhatsApp Conversation Simulator */}
            {detailModalTab === 'whatsapp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    backgroundColor: '#EFEAE2',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    maxHeight: '340px',
                    overflowY: 'auto',
                    border: '1px solid #D1D5DB',
                  }}
                >
                  {selectedRecord.whatsappMessages.map((msg) => {
                    const isOutbound = msg.direction === 'outbound';
                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isOutbound ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          backgroundColor: isOutbound ? '#D9FDD3' : '#FFFFFF',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          fontSize: '13px',
                          color: '#111827',
                          lineHeight: '1.4',
                          whiteSpace: 'pre-line',
                        }}
                      >
                        <div>{msg.body}</div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px',
                            fontSize: '10px',
                            color: '#6B7280',
                          }}
                        >
                          <span>{msg.timestamp}</span>
                          {isOutbound && (
                            <span>
                              {msg.deliveryStatus === 'read' ? '✓✓ (Blue)' : msg.deliveryStatus === 'delivered' ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Simulation Control Bar */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '6px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    Simulate Inbound WhatsApp Events:
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleSimulateWhatsAppConfirm}
                    >
                      Simulate "Confirm Order" Button
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleSimulateWhatsAppChangeRequest}
                    >
                      Simulate "Edit Qty" Request
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSendReminderPing}
                    >
                      Send Reminder Ping
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Tele-Sales Voice Desk */}
            {detailModalTab === 'call_desk' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <form
                  onSubmit={handleSaveCallRecord}
                  style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#92400E' }}>
                    📞 Log Active Tele-Sales Call with {selectedRecord.customerName}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <Dropdown
                        label="Call Outcome"
                        value={callOutcome}
                        onChange={(e) => setCallOutcome(e.target.value as TeleSalesCallOutcome)}
                        options={[
                          { value: 'voice_confirmed', label: '✅ Voice Confirmed & Approved' },
                          { value: 'quantity_adjusted', label: '✏️ Quantity Adjusted Live' },
                          { value: 'customer_busy_callback', label: '⏱️ Shopkeeper Busy / Callback Needed' },
                          { value: 'price_dispute', label: '⚠️ Rate or Discount Dispute' },
                          { value: 'wrong_number', label: '📵 Unreachable / Wrong Number' },
                          { value: 'shop_closed_cancelled', label: '❌ Shop Closed / Order Cancelled' },
                        ]}
                      />
                    </div>

                    <div>
                      <Input
                        label="Call Duration (Seconds)"
                        type="number"
                        value={String(callDuration)}
                        onChange={(e) => setCallDuration(Number(e.target.value))}
                      />
                    </div>

                    {callOutcome === 'customer_busy_callback' && (
                      <div>
                        <Input
                          label="Scheduled Callback Time"
                          value={callbackTime}
                          onChange={(e) => setCallbackTime(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                      Call Conversation Notes & Verification Record
                    </label>
                    <textarea
                      rows={3}
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                      placeholder="e.g. Spoke directly with Bilal bhai. Verified 3 cartons Choco bites, 2 cartons wafers. Approved payment terms as COD."
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button type="submit" size="sm" variant="primary">
                      Save Call Record & Update Status
                    </Button>
                  </div>
                </form>

                {/* Call History Timeline */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                    Call Attempt History ({selectedRecord.callLogs.length})
                  </h4>
                  {selectedRecord.callLogs.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                      No calls logged yet for this order. Use the form above to record customer conversation.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedRecord.callLogs.map((log) => (
                        <div
                          key={log.id}
                          style={{
                            padding: '10px 14px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                              {log.agentName} • <span style={{ color: '#0284C7' }}>{log.outcome.replace(/_/g, ' ')}</span>
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>
                              {log.timestamp} ({log.durationSeconds}s)
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#334155' }}>{log.notes}</div>
                          {log.callbackScheduledAt && (
                            <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>
                              Callback Scheduled: {log.callbackScheduledAt}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: In-Call Quantity Adjuster */}
            {detailModalTab === 'line_items' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Modify carton quantities live during phone verification if the customer requests changes or godown space constraints arise.
                </div>

                <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <tr>
                        <th style={{ padding: '8px 12px' }}>Product SKU</th>
                        <th style={{ padding: '8px 12px' }}>Unit</th>
                        <th style={{ padding: '8px 12px' }}>Unit Rate</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>Quantity Adjustment</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editableLines.map((line) => (
                        <tr key={line.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0F172A' }}>
                            {line.skuName}
                            {line.tradeSchemeApplied && (
                              <div style={{ fontSize: '10px', color: '#059669', fontWeight: 500 }}>
                                Scheme: {line.tradeSchemeApplied}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{line.unit}</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>PKR {line.unitPrice.toLocaleString()}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(line.id, -1)}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '4px',
                                  border: '1px solid #CBD5E1',
                                  backgroundColor: '#F8FAFC',
                                  cursor: 'pointer',
                                  fontWeight: 800,
                                }}
                              >
                                -
                              </button>
                              <span style={{ fontWeight: 800, minWidth: '24px', textAlign: 'center', fontSize: '13px' }}>
                                {line.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(line.id, 1)}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '4px',
                                  border: '1px solid #CBD5E1',
                                  backgroundColor: '#F8FAFC',
                                  cursor: 'pointer',
                                  fontWeight: 800,
                                }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                            PKR {line.subtotal.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                  <Button size="sm" variant="primary" onClick={handleSaveLineAdjustments}>
                    Save Quantity Adjustments
                  </Button>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>Recalculated Order Total:</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                      PKR {editableLines.reduce((acc, curr) => acc + curr.subtotal, 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Stage 4 Credit Gate & Picking Release Sign-Off */}
            {detailModalTab === 'credit_signoff' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    backgroundColor: '#F5F3FF',
                    border: '1px solid #DDD6FE',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#5B21B6' }}>
                      🛡️ Stage 4: 360° Khata Credit Control & Governance Gate
                    </div>
                    <Badge status="delivered" label="Credit Check Passed" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #E9D5FF' }}>
                      <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>CURRENT KHATA BALANCE</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                        PKR {selectedRecord.currentKhataBalance.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #E9D5FF' }}>
                      <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>ORDER INVOICE TOTAL</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#E11D48' }}>
                        PKR {selectedRecord.totalAmount.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #E9D5FF' }}>
                      <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>AUTHORIZED CREDIT LIMIT</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>
                        PKR {selectedRecord.creditLimit.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid #E9D5FF' }}>
                      <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>REMAINING CREDIT HEADROOM</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#0284C7' }}>
                        PKR {Math.max(0, selectedRecord.creditLimit - (selectedRecord.currentKhataBalance + (selectedRecord.paymentMethod === 'credit' ? selectedRecord.totalAmount : 0))).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Utilization Progress Bar */}
                  <div>
                    {(() => {
                      const totalExposure = selectedRecord.currentKhataBalance + (selectedRecord.paymentMethod === 'credit' ? selectedRecord.totalAmount : 0);
                      const pct = Math.min(100, Math.round((totalExposure / (selectedRecord.creditLimit || 1)) * 100));
                      const barColor = pct > 90 ? '#DC2626' : pct > 70 ? '#F59E0B' : '#10B981';

                      return (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600, color: '#4B5563' }}>Credit Exposure Utilization: {pct}%</span>
                            <span style={{ fontWeight: 700, color: barColor }}>
                              {pct > 90 ? 'High Exposure' : 'Normal Risk Tolerance'}
                            </span>
                          </div>
                          <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: '999px' }} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: '1.4' }}>
                    Payment Mode: <strong>{selectedRecord.paymentMethod.replace(/_/g, ' ').toUpperCase()}</strong>.
                    Customer account is verified with no past defaults. Signing off authorizes immediate inclusion in warehouse picking waves.
                  </div>
                </div>

                {/* Direct Action Card */}
                <div
                  style={{
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#065F46' }}>
                      Ready to Authorize Warehouse Floor Picking?
                    </div>
                    <div style={{ fontSize: '12px', color: '#047857' }}>
                      Assign wave and warehouse picker to lock inventory and generate physical pick slip.
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => handleSignOffToPickingRelease(selectedRecord)}
                  >
                    🚀 Advance to Stage 5 & Select Wave
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* MODAL 1: PICKING RELEASE CONFIGURATION MODAL */}
      <PickingReleaseModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        orders={ordersToRelease}
        onConfirmRelease={handleConfirmPickingRelease}
      />

      {/* MODAL 2: PRINTABLE PICK SLIP MODAL */}
      <PrintablePickSlipModal
        isOpen={isPickSlipModalOpen}
        onClose={() => setIsPickSlipModalOpen(false)}
        record={pickSlipRecord}
      />
    </div>
  );
};
