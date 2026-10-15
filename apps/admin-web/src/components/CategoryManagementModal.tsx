import React, { useState } from 'react';
import { Modal, Button, Input, Dropdown } from '@candi/ui';

export interface AdminCategory {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  displayOrder: number;
}

export interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: AdminCategory[];
  onUpdateCategories: (categories: AdminCategory[]) => void;
  productCountsByCategory: Record<string, number>;
  onReassignCategoryProducts: (fromCategoryName: string, toCategoryName: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'warning') => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
  categories,
  onUpdateCategories,
  productCountsByCategory,
  onReassignCategoryProducts,
  onShowToast,
}) => {
  // New Category Form State
  const [newIcon, setNewIcon] = useState('🍬');
  const [newName, setNewName] = useState('');

  // Inline editing state: categoryId -> { name, icon }
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');

  // Reassignment safety dialog state
  const [reassignCategory, setReassignCategory] = useState<AdminCategory | null>(null);
  const [reassignAction, setReassignAction] = useState<'deactivate' | 'delete'>('deactivate');
  const [targetCategoryName, setTargetCategoryName] = useState<string>('');

  const commonIcons = ['🍫', '🍬', '🍭', '🧇', '🐻', '🍯', '🌿', '🥛', '🍪', '🥨', '🥜', '🎁'];

  // Handle Add Category
  const handleAddCategory = () => {
    if (!newName.trim()) {
      onShowToast('Please provide a category name', 'warning');
      return;
    }
    const exists = categories.some((c) => c.name.toLowerCase() === newName.trim().toLowerCase());
    if (exists) {
      onShowToast('A category with this name already exists', 'warning');
      return;
    }

    const newCat: AdminCategory = {
      id: `cat-${Date.now()}`,
      name: newName.trim(),
      icon: newIcon.trim() || '🍬',
      isActive: true,
      displayOrder: categories.length + 1,
    };

    const updated = [...categories, newCat];
    onUpdateCategories(updated);
    setNewName('');
    setNewIcon('🍬');
    onShowToast(`Category "${newCat.name}" added successfully!`, 'success');
  };

  // Start Editing
  const startEdit = (cat: AdminCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon);
  };

  // Save Editing
  const saveEdit = (cat: AdminCategory) => {
    if (!editName.trim()) {
      onShowToast('Category name cannot be empty', 'warning');
      return;
    }

    const oldName = cat.name;
    const newCatName = editName.trim();
    const updated = categories.map((c) =>
      c.id === cat.id ? { ...c, name: newCatName, icon: editIcon.trim() || c.icon } : c
    );

    // If name changed, rename all products referencing old name
    if (oldName !== newCatName) {
      onReassignCategoryProducts(oldName, newCatName);
    }

    onUpdateCategories(updated);
    setEditingId(null);
    onShowToast(`Category "${newCatName}" updated!`, 'success');
  };

  // Reorder
  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const list = [...categories];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const reordered = list.map((c, i) => ({ ...c, displayOrder: i + 1 }));
    onUpdateCategories(reordered);
  };

  // Toggle Visibility with SKU check
  const handleToggleActive = (cat: AdminCategory) => {
    const assignedSkus = productCountsByCategory[cat.name] || 0;
    if (cat.isActive && assignedSkus > 0) {
      // Prompt admin to reassign products first
      setReassignCategory(cat);
      setReassignAction('deactivate');
      const otherActive = categories.find((c) => c.id !== cat.id && c.isActive);
      setTargetCategoryName(otherActive ? otherActive.name : '');
      return;
    }

    const updated = categories.map((c) =>
      c.id === cat.id ? { ...c, isActive: !c.isActive } : c
    );
    onUpdateCategories(updated);
    onShowToast(
      `Category "${cat.name}" is now ${cat.isActive ? 'Inactive' : 'Active'}`,
      'success'
    );
  };

  // Delete Category with SKU check
  const handleDeleteCategory = (cat: AdminCategory) => {
    const assignedSkus = productCountsByCategory[cat.name] || 0;
    if (assignedSkus > 0) {
      setReassignCategory(cat);
      setReassignAction('delete');
      const otherActive = categories.find((c) => c.id !== cat.id && c.isActive);
      setTargetCategoryName(otherActive ? otherActive.name : '');
      return;
    }

    const updated = categories.filter((c) => c.id !== cat.id);
    onUpdateCategories(updated);
    onShowToast(`Category "${cat.name}" removed`, 'success');
  };

  // Execute Reassignment & Proceed with Deactivate/Delete
  const handleConfirmReassign = () => {
    if (!reassignCategory || !targetCategoryName) {
      onShowToast('Please select a target category for reassignment', 'warning');
      return;
    }

    const fromName = reassignCategory.name;
    onReassignCategoryProducts(fromName, targetCategoryName);

    if (reassignAction === 'deactivate') {
      const updated = categories.map((c) =>
        c.id === reassignCategory.id ? { ...c, isActive: false } : c
      );
      onUpdateCategories(updated);
      onShowToast(
        `Reassigned SKUs to "${targetCategoryName}" and deactivated "${fromName}"`,
        'success'
      );
    } else {
      const updated = categories.filter((c) => c.id !== reassignCategory.id);
      onUpdateCategories(updated);
      onShowToast(
        `Reassigned SKUs to "${targetCategoryName}" and deleted "${fromName}"`,
        'success'
      );
    }

    setReassignCategory(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🏷️ Wholesale Category Management"
      maxWidth="720px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Reassignment Safety Prompt Dialog Overlay */}
        {reassignCategory && (
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1.5px solid #F59E0B',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#92400E' }}>
                Action Required: Reassign Assigned Products
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#78350F', margin: 0, lineHeight: 1.5 }}>
              Category <strong>{reassignCategory.icon} {reassignCategory.name}</strong> currently has{' '}
              <strong>{productCountsByCategory[reassignCategory.name] || 0} active SKU(s)</strong> assigned to it.
              Before it can be {reassignAction === 'deactivate' ? 'deactivated' : 'deleted'}, please choose a destination category for these products:
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '220px' }}>
                <Dropdown
                  label="Transfer Products To:"
                  value={targetCategoryName}
                  onChange={(e) => setTargetCategoryName(e.target.value)}
                  options={categories
                    .filter((c) => c.id !== reassignCategory.id && c.isActive)
                    .map((c) => ({
                      value: c.name,
                      label: `${c.icon} ${c.name} (${productCountsByCategory[c.name] || 0} SKUs)`,
                    }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', marginTop: '22px' }}>
                <Button variant="danger" onClick={handleConfirmReassign}>
                  Reassign & {reassignAction === 'deactivate' ? 'Deactivate' : 'Delete'}
                </Button>
                <Button variant="outline" onClick={() => setReassignCategory(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Category List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-smoky-black)', margin: 0 }}>
              Configured Categories ({categories.length})
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-olive-drab)' }}>
              {categories.filter((c) => c.isActive).length} active • Reorder or toggle visibility
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '340px',
              overflowY: 'auto',
              paddingRight: '4px',
            }}
          >
            {categories.map((cat, index) => {
              const skuCount = productCountsByCategory[cat.name] || 0;
              const isEditing = editingId === cat.id;

              return (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px solid var(--color-bone, #E2E8F0)',
                    backgroundColor: cat.isActive ? '#FFFFFF' : '#F8FAFC',
                    opacity: cat.isActive ? 1 : 0.7,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Left: Reorder arrows & Icon + Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    {/* Reorder Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveCategory(index, 'up')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: index === 0 ? 'not-allowed' : 'pointer',
                          opacity: index === 0 ? 0.3 : 0.8,
                          fontSize: '10px',
                          padding: '1px',
                          lineHeight: 1,
                        }}
                        title="Move Up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={index === categories.length - 1}
                        onClick={() => moveCategory(index, 'down')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: index === categories.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: index === categories.length - 1 ? 0.3 : 0.8,
                          fontSize: '10px',
                          padding: '1px',
                          lineHeight: 1,
                        }}
                        title="Move Down"
                      >
                        ▼
                      </button>
                    </div>

                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flex: 1 }}>
                        <input
                          type="text"
                          value={editIcon}
                          onChange={(e) => setEditIcon(e.target.value)}
                          style={{
                            width: '42px',
                            textAlign: 'center',
                            fontSize: '16px',
                            padding: '4px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-bone)',
                          }}
                        />
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          style={{
                            flex: 1,
                            padding: '6px 10px',
                            fontSize: '13px',
                            borderRadius: '4px',
                            border: '1px solid var(--color-bone)',
                          }}
                        />
                        <Button size="sm" onClick={() => saveEdit(cat)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px', lineHeight: 1 }}>{cat.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--color-smoky-black)' }}>
                            {cat.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>
                            Display Order: #{cat.displayOrder}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: SKU Count Badge & Controls */}
                  {!isEditing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* SKU Count Badge */}
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          backgroundColor: skuCount > 0 ? '#E0F2FE' : '#F1F5F9',
                          color: skuCount > 0 ? '#0369A1' : '#64748B',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {skuCount} {skuCount === 1 ? 'SKU' : 'SKUs'}
                      </span>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#2563EB',
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 6px',
                        }}
                      >
                        ✏️ Edit
                      </button>

                      {/* Toggle Active Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(cat)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full, 9999px)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          backgroundColor: cat.isActive ? '#DCFCE7' : '#FEE2E2',
                          color: cat.isActive ? '#15803D' : '#B91C1C',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94A3B8',
                          fontSize: '14px',
                          padding: '4px',
                        }}
                        title="Delete category"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Category Panel */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--color-bone, #E2E8F0)',
            padding: '16px',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-smoky-black)', marginBottom: '10px' }}>
            ➕ Create New Wholesale Category
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {/* Icon Picker / Input */}
            <div style={{ width: '80px' }}>
              <Input
                label="Icon"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                placeholder="🍫"
              />
            </div>

            {/* Name Input */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <Input
                label="Category Name"
                placeholder="e.g. Artisanal Chocolates, Lollipops..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <Button onClick={handleAddCategory}>
              Add Category
            </Button>
          </div>

          {/* Quick Emoji Recommendations */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-olive-drab)' }}>Quick icons:</span>
            {commonIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setNewIcon(icon)}
                style={{
                  background: 'none',
                  border: newIcon === icon ? '1.5px solid #0F172A' : '1px solid #CBD5E1',
                  borderRadius: '4px',
                  padding: '2px 5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
