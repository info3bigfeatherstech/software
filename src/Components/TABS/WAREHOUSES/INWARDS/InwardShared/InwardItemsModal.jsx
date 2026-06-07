import React, { useState, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
    useGetInwardByIdQuery,
    useAddInwardItemMutation,
    useUpdateInwardItemMutation,
    useDeleteInwardItemMutation,
} from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
import {
    closeItemsModal,
    startEditItem,
    cancelEditItem,
    updateItemForm,
    setItemErrors,
    clearItemErrors,
    setSubmitting,
} from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";
import InwardProductPickerModal from "./InwardProductPickerModal";

const S = {
    overlay: {
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
    },
    modal: {
        background: "#ffffff",
        borderRadius: "14px",
        width: "100%",
        maxWidth: "960px",
        margin: "0 16px",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        border: "0.5px solid rgba(0,0,0,0.08)",
    },
    head: {
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        padding: "16px 20px 12px",
        borderBottom: "0.5px solid #E5E7EB",
        background: "#ffffff",
        flexShrink: 0,
    },
    formulaBar: {
        display: "flex", alignItems: "center",
        borderBottom: "0.5px solid #E5E7EB",
        background: "#F9FAFB",
        flexShrink: 0,
        height: "30px",
    },
    toolbar: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "7px 14px",
        background: "#F3F4F6",
        borderBottom: "0.5px solid #E5E7EB",
        flexShrink: 0,
        gap: "8px",
    },
    sheetWrap: {
        overflowX: "auto",
        overflowY: "auto",
        flex: 1,
        minHeight: 0,
    },
    statusBar: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "5px 14px",
        background: "#F3F4F6",
        borderTop: "0.5px solid #E5E7EB",
        flexShrink: 0,
    },
    footer: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        borderTop: "0.5px solid #E5E7EB",
        background: "#ffffff",
        flexShrink: 0,
    },
};

const COL_WIDTHS = [36, 200, 130, 72, 90, 110, 110, 130, 100];

const COLUMNS = [
    { key: "_row", label: "", type: "rownum" },
    { key: "item_name", label: "Item Name", req: true, placeholder: "e.g. Men T-Shirt Black" },
    { key: "variant_text", label: "Variant", placeholder: "e.g. Size M / SKU" },
    { key: "quantity_received", label: "Qty", req: true, type: "number", placeholder: "0" },
    { key: "purchase_cost", label: "Cost (₹)", type: "number", placeholder: "0" },
    { key: "batch_number", label: "Batch No", placeholder: "BATCH-01" },
    { key: "remarks", label: "Remarks", placeholder: "Optional…" },
    { key: "_mapped", label: "Mapped", type: "mapped" },
    { key: "_actions", label: "Actions", type: "actions" },
];

const EMPTY_ROWS = 4;

export default function InwardItemsModal({
    selectedInward,
    itemForm,
    itemErrors,
    editingItemId,
    onClose,
}) {
    const dispatch = useDispatch();

    const [addItem, { isLoading: isAdding }] = useAddInwardItemMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateInwardItemMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteInwardItemMutation();

    const [pickerOpen, setPickerOpen] = useState(false);
    const [activeItem, setActiveItem] = useState(null);
    const [focusedCell, setFocusedCell] = useState(null);

    const {
        data: inwardDetail,
        isLoading: detailLoading,
        refetch,
    } = useGetInwardByIdQuery(selectedInward?.inward_id, {
        skip: !selectedInward?.inward_id,
    });

    const items = inwardDetail?.items || [];

    const validate = () => {
        const errors = {};
        if (!itemForm.item_name?.trim()) errors.item_name = "Item name is required";
        if (!itemForm.quantity_received && itemForm.quantity_received !== 0)
            errors.quantity_received = "Quantity is required";
        else if (Number(itemForm.quantity_received) <= 0)
            errors.quantity_received = "Quantity must be greater than 0";
        if (itemForm.purchase_cost !== "" && Number(itemForm.purchase_cost) < 0)
            errors.purchase_cost = "Cost cannot be negative";
        return errors;
    };

    const handleAdd = async () => {
        dispatch(clearItemErrors());
        const errors = validate();
        if (Object.keys(errors).length > 0) { dispatch(setItemErrors(errors)); return; }
        dispatch(setSubmitting(true));
        try {
            const payload = {
                inwardId: selectedInward.inward_id,
                item_name: itemForm.item_name.trim(),
                quantity_received: Number(itemForm.quantity_received),
            };
            if (itemForm.variant_text?.trim()) payload.variant_text = itemForm.variant_text.trim();
            if (itemForm.purchase_cost !== "") payload.purchase_cost = Number(itemForm.purchase_cost);
            if (itemForm.batch_number?.trim()) payload.batch_number = itemForm.batch_number.trim();
            if (itemForm.remarks?.trim()) payload.remarks = itemForm.remarks.trim();
            await addItem(payload).unwrap();
            dispatch(cancelEditItem());
            refetch();
        } catch (err) {
            if (err?.data?.errors?.length) {
                const be = {};
                err.data.errors.forEach(({ field, message }) => { be[field] = message; });
                dispatch(setItemErrors(be));
            } else {
                dispatch(setItemErrors({ general: err?.data?.message || "Failed to add item" }));
            }
        } finally {
            dispatch(setSubmitting(false));
        }
    };

    const handleUpdate = async () => {
        dispatch(clearItemErrors());
        const errors = validate();
        if (Object.keys(errors).length > 0) { dispatch(setItemErrors(errors)); return; }
        dispatch(setSubmitting(true));
        try {
            const payload = {
                inwardId: selectedInward.inward_id,
                inwardItemId: editingItemId,
                item_name: itemForm.item_name.trim(),
                quantity_received: Number(itemForm.quantity_received),
            };
            if (itemForm.variant_text?.trim()) payload.variant_text = itemForm.variant_text.trim();
            if (itemForm.purchase_cost !== "") payload.purchase_cost = Number(itemForm.purchase_cost);
            if (itemForm.batch_number?.trim()) payload.batch_number = itemForm.batch_number.trim();
            if (itemForm.remarks?.trim()) payload.remarks = itemForm.remarks.trim();
            await updateItem(payload).unwrap();
            dispatch(cancelEditItem());
            refetch();
        } catch (err) {
            if (err?.data?.errors?.length) {
                const be = {};
                err.data.errors.forEach(({ field, message }) => { be[field] = message; });
                dispatch(setItemErrors(be));
            } else {
                dispatch(setItemErrors({ general: err?.data?.message || "Failed to update item" }));
            }
        } finally {
            dispatch(setSubmitting(false));
        }
    };

    const handleDelete = async (inwardItemId, itemName) => {
        if (!window.confirm(`Remove "${itemName}" from this inward?`)) return;
        try {
            await deleteItem({ inwardId: selectedInward.inward_id, inwardItemId }).unwrap();
            refetch();
        } catch (err) {
            alert(err?.data?.message || "Failed to delete item");
        }
    };

    const handleOpenPicker = (item) => { setActiveItem(item); setPickerOpen(true); };

    const handleMappingSuccess = () => {
        setPickerOpen(false);
        setActiveItem(null);
        refetch();
    };

    const isEditing = !!editingItemId;
    const isMutating = isAdding || isUpdating;

    const totalQty = items.reduce((s, i) => s + (Number(i.quantity_received) || 0), 0);
    const totalCost = items.reduce((s, i) => s + (Number(i.purchase_cost) || 0) * (Number(i.quantity_received) || 0), 0);
    const unmapped = items.filter(i => !i.mapped_product_id).length;

    const formulaVal = focusedCell
        ? (itemForm[focusedCell] ?? "")
        : "";

    const fieldKeys = ["item_name", "variant_text", "quantity_received", "purchase_cost", "batch_number", "remarks"];

    const handleKeyDown = (e, currentKey) => {
        if (e.key === "Tab") {
            e.preventDefault();
            const idx = fieldKeys.indexOf(currentKey);
            if (e.shiftKey) {
                if (idx > 0) document.getElementById(`form-field-${fieldKeys[idx - 1]}`)?.focus();
            } else {
                if (idx < fieldKeys.length - 1) document.getElementById(`form-field-${fieldKeys[idx + 1]}`)?.focus();
                else { document.getElementById("form-field-item_name")?.focus(); }
            }
        }
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (isEditing) handleUpdate();
            else handleAdd();
        }
    };

    return (
        <>
            <div style={S.overlay}>
                <div style={S.modal}>

                    <div style={S.head}>
                        <div>
                            <div style={{ fontSize: "15px", fontWeight: 500, color: "#111827" }}>
                                Received Items — {selectedInward?.inward_number}
                            </div>
                            <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                                Click any cell to edit inline · Tab across columns · Enter to save row
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {unmapped > 0 && (
                                <span style={{
                                    display: "inline-flex", alignItems: "center", gap: "4px",
                                    fontSize: "11px", fontWeight: 500,
                                    background: "#FAEEDA", color: "#854F0B",
                                    border: "0.5px solid #FAC775", borderRadius: "6px",
                                    padding: "3px 9px",
                                }}>
                                    <svg style={{ width: "11px", height: "11px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    {unmapped} unmapped
                                </span>
                            )}
                            <button
                                onClick={() => { dispatch(closeItemsModal()); onClose(); }}
                                style={{
                                    width: "28px", height: "28px", borderRadius: "6px",
                                    border: "0.5px solid #E5E7EB", background: "#F9FAFB",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: "#6B7280", fontSize: "15px",
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <div style={S.formulaBar}>
                        <div style={{
                            width: "72px", minWidth: "72px", padding: "0 10px",
                            height: "30px", display: "flex", alignItems: "center",
                            fontSize: "11px", fontWeight: 500, color: "#6B7280",
                            borderRight: "0.5px solid #E5E7EB", fontFamily: "monospace",
                        }}>
                            {focusedCell ? focusedCell.toUpperCase().slice(0, 4) : "CELL"}
                        </div>
                        <div style={{
                            padding: "0 10px", display: "flex", alignItems: "center",
                            height: "30px", borderRight: "0.5px solid #E5E7EB",
                            color: "#9CA3AF", fontSize: "13px",
                        }}>
                            <i className="ti ti-function" />
                        </div>
                        <div style={{
                            flex: 1, padding: "0 12px", fontSize: "12px",
                            color: "#374151", fontFamily: "monospace",
                            display: "flex", alignItems: "center", height: "30px",
                        }}>
                            {String(formulaVal)}
                        </div>
                        {isEditing && (
                            <div style={{
                                padding: "0 10px", display: "flex", alignItems: "center",
                                height: "30px", borderLeft: "0.5px solid #E5E7EB",
                                fontSize: "11px", color: "#185FA5", fontWeight: 500, gap: "4px",
                            }}>
                                <svg style={{ width: "11px", height: "11px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editing row
                            </div>
                        )}
                    </div>

                    <div style={S.toolbar}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{
                                fontSize: "11px", color: "#6B7280",
                                paddingRight: "8px", borderRight: "0.5px solid #D1D5DB",
                                marginRight: "2px",
                            }}>
                                {items.length} {items.length === 1 ? "item" : "items"}
                            </span>
                            <TBtn
                                icon="M12 4v16m8-8H4"
                                label="Add row"
                                onClick={() => { dispatch(cancelEditItem()); document.getElementById("form-field-item_name")?.focus(); }}
                            />
                            <TBtn
                                icon="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                                label="Clear form"
                                onClick={() => dispatch(cancelEditItem())}
                            />
                        </div>
                        {itemErrors?.general && (
                            <span style={{ fontSize: "11px", color: "#DC2626", fontWeight: 500 }}>
                                ⚠ {itemErrors.general}
                            </span>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {isEditing && (
                                <button
                                    onClick={() => dispatch(cancelEditItem())}
                                    style={{
                                        height: "28px", padding: "0 10px", borderRadius: "6px",
                                        border: "0.5px solid #D1D5DB", background: "#ffffff",
                                        fontSize: "11px", fontWeight: 500, color: "#6B7280",
                                        cursor: "pointer",
                                    }}
                                >
                                    Cancel Edit
                                </button>
                            )}
                            <button
                                onClick={isEditing ? handleUpdate : handleAdd}
                                disabled={isMutating}
                                style={{
                                    height: "28px", padding: "0 12px", borderRadius: "6px",
                                    border: "none", background: isEditing ? "#185FA5" : "#185FA5",
                                    color: "#ffffff", fontSize: "11px", fontWeight: 500,
                                    cursor: isMutating ? "not-allowed" : "pointer",
                                    opacity: isMutating ? 0.65 : 1,
                                    display: "inline-flex", alignItems: "center", gap: "4px",
                                }}
                            >
                                <svg style={{ width: "12px", height: "12px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                                </svg>
                                {isMutating
                                    ? (isEditing ? "Updating…" : "Adding…")
                                    : (isEditing ? "Update Item" : "Add Item")}
                            </button>
                        </div>
                    </div>

                    <div style={S.sheetWrap}>
                        <div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain">
                        <table style={{
                            borderCollapse: "collapse", fontSize: "12px",
                            tableLayout: "fixed", width: "100%", minWidth: "920px",
                        }}>
                            <colgroup>
                                {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: `${w}px` }} />)}
                            </colgroup>
                            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                                <tr>
                                    {COLUMNS.map((col, ci) => (
                                        <th key={col.key} style={{
                                            padding: ci === 0 ? "7px 0" : "7px 8px",
                                            textAlign: ci === 0 ? "center" : "left",
                                            fontSize: "10px", fontWeight: 500,
                                            color: "#5F5E5A", letterSpacing: "0.05em",
                                            textTransform: "uppercase",
                                            background: "#E9E8E1",
                                            borderRight: "0.5px solid #D3D1C7",
                                            borderBottom: "2px solid #B4B2A9",
                                            whiteSpace: "nowrap", overflow: "hidden",
                                            userSelect: "none",
                                        }}>
                                            {col.label}
                                            {col.req && <span style={{ color: "#DC2626", marginLeft: "2px" }}>*</span>}
                                        </th>
                                    ))}
                                </tr>

                                <tr style={{ background: "#F0F9FF" }}>
                                    <td style={{
                                        textAlign: "center", fontSize: "10px", color: "#93C5FD",
                                        fontWeight: 500, background: "#DBEAFE",
                                        borderRight: "0.5px solid #BFDBFE",
                                        borderBottom: "0.5px solid #BFDBFE", padding: "0",
                                    }}>
                                        {isEditing ? "✎" : "★"}
                                    </td>
                                    {fieldKeys.map((key) => {
                                        const col = COLUMNS.find(c => c.key === key);
                                        const hasErr = !!itemErrors?.[key];
                                        return (
                                            <td key={key} style={{
                                                padding: 0,
                                                borderRight: "0.5px solid #BFDBFE",
                                                borderBottom: `0.5px solid ${hasErr ? "#FCA5A5" : "#BFDBFE"}`,
                                                background: hasErr ? "#FFF5F5" : "#F0F9FF",
                                            }}>
                                                <input
                                                    id={`form-field-${key}`}
                                                    type={col?.type === "number" ? "number" : "text"}
                                                    min={col?.type === "number" ? "0" : undefined}
                                                    step={key === "purchase_cost" ? "0.01" : undefined}
                                                    value={itemForm[key] ?? ""}
                                                    placeholder={col?.placeholder || ""}
                                                    onFocus={() => setFocusedCell(key)}
                                                    onBlur={() => setFocusedCell(null)}
                                                    onKeyDown={(e) => handleKeyDown(e, key)}
                                                    onChange={(e) => dispatch(updateItemForm({ [key]: e.target.value }))}
                                                    style={{
                                                        width: "100%", height: "30px",
                                                        border: "none", outline: "none",
                                                        padding: "0 8px", fontSize: "12px",
                                                        color: "#111827", background: "transparent",
                                                        fontFamily: "inherit",
                                                    }}
                                                    onFocusCapture={(e) => {
                                                        e.target.parentElement.style.boxShadow = "inset 0 0 0 2px #3B82F6";
                                                        setFocusedCell(key);
                                                    }}
                                                    onBlurCapture={(e) => {
                                                        e.target.parentElement.style.boxShadow = "none";
                                                        setFocusedCell(null);
                                                    }}
                                                />
                                                {hasErr && (
                                                    <div style={{
                                                        position: "absolute", bottom: "-18px", left: "8px",
                                                        fontSize: "10px", color: "#DC2626", whiteSpace: "nowrap",
                                                        zIndex: 3,
                                                    }}>
                                                        {itemErrors[key]}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                    <td style={{ borderBottom: "0.5px solid #BFDBFE", background: "#F0F9FF" }} />
                                    <td style={{ borderBottom: "0.5px solid #BFDBFE", background: "#F0F9FF" }} />
                                </tr>
                            </thead>
                            <tbody>
                                {detailLoading && (
                                    <tr>
                                        <td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: "32px", color: "#9CA3AF", fontSize: "12px" }}>
                                            <div style={{
                                                width: "20px", height: "20px", margin: "0 auto 8px",
                                                borderRadius: "50%", border: "2px solid #3B82F6",
                                                borderTopColor: "transparent",
                                                animation: "spin 0.7s linear infinite",
                                            }} />
                                            Loading items…
                                            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                                        </td>
                                    </tr>
                                )}

                                {!detailLoading && items.length === 0 && (
                                    <tr>
                                        <td colSpan={COLUMNS.length} style={{
                                            textAlign: "center", padding: "24px", color: "#9CA3AF",
                                            fontSize: "12px", borderBottom: "0.5px solid #F3F4F6",
                                        }}>
                                            No items yet — fill the blue row above and press Enter or click Add Item
                                        </td>
                                    </tr>
                                )}

                                {!detailLoading && items.map((item, rowIdx) => {
                                    const isEditRow = editingItemId === item.inward_item_id;
                                    const rowBg = isEditRow ? "#EFF6FF" : rowIdx % 2 === 0 ? "#ffffff" : "#FAFAFA";
                                    return (
                                        <tr
                                            key={item.inward_item_id}
                                            style={{ background: rowBg, cursor: "default" }}
                                            onMouseEnter={(e) => { if (!isEditRow) e.currentTarget.style.background = "#F5F9FF"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = rowBg; }}
                                        >
                                            <td style={{
                                                textAlign: "center", fontSize: "10px",
                                                color: isEditRow ? "#3B82F6" : "#9CA3AF",
                                                fontWeight: 500, background: isEditRow ? "#DBEAFE" : "#F1EFE8",
                                                borderRight: "0.5px solid #D3D1C7",
                                                borderBottom: "0.5px solid #E5E7EB",
                                            }}>
                                                {item.line_no}
                                            </td>

                                            <DataCell bold>{item.item_name}</DataCell>
                                            <DataCell muted>{item.variant_text || "—"}</DataCell>
                                            <DataCell bold>{item.quantity_received}</DataCell>
                                            <DataCell muted>{item.purchase_cost != null ? `₹${item.purchase_cost}` : "—"}</DataCell>
                                            <DataCell mono muted>{item.batch_number || "—"}</DataCell>
                                            <DataCell muted>{item.remarks || "—"}</DataCell>

                                            <td style={{ padding: "0 8px", borderRight: "0.5px solid #E5E7EB", borderBottom: "0.5px solid #E5E7EB" }}>
                                                {item.mapped_product_id ? (
                                                    <span
                                                        title={
                                                            item.mapped_variant?.sku
                                                                ? `${item.mapped_product?.name || "Product"} → ${item.mapped_variant.sku}`
                                                                : item.mapped_product?.name
                                                        }
                                                        style={{
                                                        display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: "1px",
                                                        fontSize: "10px", fontWeight: 500,
                                                        background: "#DCFCE7", color: "#15803D",
                                                        borderRadius: "10px", padding: "2px 8px",
                                                        border: "0.5px solid #BBF7D0",
                                                    }}>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                                            <svg style={{ width: "9px", height: "9px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Mapped
                                                        </span>
                                                        {item.mapped_variant?.sku && (
                                                            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#166534" }}>
                                                                {item.mapped_variant.sku}
                                                            </span>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenPicker(item)}
                                                        style={{
                                                            display: "inline-flex", alignItems: "center", gap: "3px",
                                                            fontSize: "10px", fontWeight: 500,
                                                            background: "#FAEEDA", color: "#854F0B",
                                                            borderRadius: "10px", padding: "2px 8px",
                                                            border: "0.5px solid #FAC775",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        Map →
                                                    </button>
                                                )}
                                            </td>

                                            <td style={{ padding: "0 8px", borderBottom: "0.5px solid #E5E7EB" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <button
                                                        onClick={() => dispatch(startEditItem(item))}
                                                        style={{
                                                            fontSize: "11px", color: "#2563EB",
                                                            background: "none", border: "none",
                                                            cursor: "pointer", fontWeight: 500, padding: 0,
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.inward_item_id, item.item_name)}
                                                        disabled={isDeleting}
                                                        style={{
                                                            fontSize: "11px", color: "#DC2626",
                                                            background: "none", border: "none",
                                                            cursor: isDeleting ? "not-allowed" : "pointer",
                                                            fontWeight: 500, padding: 0,
                                                            opacity: isDeleting ? 0.4 : 1,
                                                        }}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {!detailLoading && Array.from({ length: Math.max(0, EMPTY_ROWS - items.length) }).map((_, i) => (
                                    <tr key={`empty-${i}`} style={{ background: i % 2 === 0 ? "#ffffff" : "#FAFAFA" }}>
                                        <td style={{
                                            textAlign: "center", fontSize: "10px",
                                            color: "#D1D5DB", fontWeight: 500,
                                            background: "#F5F4EF",
                                            borderRight: "0.5px solid #D3D1C7",
                                            borderBottom: "0.5px solid #F3F4F6",
                                        }}>
                                            {items.length + i + 1}
                                        </td>
                                        {fieldKeys.map((k) => (
                                            <td key={k} style={{
                                                height: "32px", borderRight: "0.5px solid #F3F4F6",
                                                borderBottom: "0.5px solid #F3F4F6",
                                            }} />
                                        ))}
                                        <td style={{ borderBottom: "0.5px solid #F3F4F6" }} />
                                        <td style={{ borderBottom: "0.5px solid #F3F4F6" }} />
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>

                    <div style={S.statusBar}>
                        <span style={{ fontSize: "11px", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px" }}>
                            <svg style={{ width: "11px", height: "11px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tab → next cell &nbsp;·&nbsp; Enter → save &nbsp;·&nbsp; Click Edit on row to load it above
                        </span>
                        {items.length > 0 && (
                            <span style={{ fontSize: "11px", color: "#6B7280" }}>
                                Total qty: <strong style={{ color: "#111827" }}>{totalQty}</strong>
                                &nbsp;·&nbsp; Total value: <strong style={{ color: "#111827" }}>₹{totalCost.toLocaleString("en-IN")}</strong>
                            </span>
                        )}
                    </div>

                    <div style={S.footer}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {unmapped > 0 && (
                                <span style={{
                                    fontSize: "11px", color: "#854F0B",
                                    background: "#FAEEDA", border: "0.5px solid #FAC775",
                                    borderRadius: "6px", padding: "3px 9px", fontWeight: 500,
                                }}>
                                    ⚠ {unmapped} item{unmapped > 1 ? "s" : ""} not yet mapped
                                </span>
                            )}
                            {unmapped === 0 && items.length > 0 && (
                                <span style={{
                                    fontSize: "11px", color: "#15803D",
                                    background: "#DCFCE7", border: "0.5px solid #BBF7D0",
                                    borderRadius: "6px", padding: "3px 9px", fontWeight: 500,
                                }}>
                                    ✓ All items mapped
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => { dispatch(closeItemsModal()); onClose(); }}
                            style={{
                                height: "32px", padding: "0 16px", borderRadius: "8px",
                                border: "0.5px solid #D1D5DB", background: "#ffffff",
                                fontSize: "12px", fontWeight: 500, color: "#374151",
                                cursor: "pointer",
                            }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>

            {pickerOpen && activeItem && (
                <InwardProductPickerModal
                    item={activeItem}
                    inward={selectedInward}
                    onClose={() => { setPickerOpen(false); setActiveItem(null); }}
                    onSuccess={handleMappingSuccess}
                />
            )}
        </>
    );
}

function DataCell({ children, bold, muted, mono }) {
    return (
        <td style={{
            padding: "0 8px",
            height: "32px",
            borderRight: "0.5px solid #E5E7EB",
            borderBottom: "0.5px solid #E5E7EB",
            fontSize: "12px",
            fontWeight: bold ? 500 : 400,
            color: muted ? "#6B7280" : "#111827",
            fontFamily: mono ? "monospace" : "inherit",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
        }}>
            {children}
        </td>
    );
}

function TBtn({ icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            title={label}
            style={{
                display: "inline-flex", alignItems: "center", gap: "4px",
                height: "26px", padding: "0 9px", borderRadius: "5px",
                border: "0.5px solid #D1D5DB", background: "#ffffff",
                fontSize: "11px", fontWeight: 500, color: "#6B7280",
                cursor: "pointer",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
        >
            <svg style={{ width: "12px", height: "12px", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
            {label}
        </button>
    );
}

// CODE IS WORKING BUT UPPER CODE UI IS LIKE FOR EXEL 
// // TABS/WAREHOUSES/INWARDS/InwardShared/InwardItemsModal.jsx
// //
// // Responsibility: Manage InwardReceiptItems for a single inward.
// //   POST   /inwards/:inwardId/items        — add item
// //   PUT    /inwards/:inwardId/items/:itemId — edit item
// //   DELETE /inwards/:inwardId/items/:itemId — delete item
// //
// // Only available when inward status is ARRIVED.
// // Uses useGetInwardByIdQuery to get fresh items list.

// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import {
//     useGetInwardByIdQuery,
//     useAddInwardItemMutation,
//     useUpdateInwardItemMutation,
//     useDeleteInwardItemMutation,
// } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
// import {
//     closeItemsModal,
//     startEditItem,
//     cancelEditItem,
//     updateItemForm,
//     setItemErrors,
//     clearItemErrors,
//     setSubmitting,
// } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";
// import InwardProductPickerModal from "./InwardProductPickerModal";

// export default function InwardItemsModal({
//     selectedInward,
//     itemForm,
//     itemErrors,
//     editingItemId,
//     onClose,  // ✅ ADD THIS - was missing
// }) {
//     const dispatch = useDispatch();

//     const [addItem, { isLoading: isAdding }] = useAddInwardItemMutation();
//     const [updateItem, { isLoading: isUpdating }] = useUpdateInwardItemMutation();
//     const [deleteItem, { isLoading: isDeleting }] = useDeleteInwardItemMutation();

//     // ── Product Picker Modal State ──────────────────────────────────────────────
//     const [pickerOpen, setPickerOpen] = useState(false);
//     const [activeItem, setActiveItem] = useState(null);

//     // Always fetch fresh items from backend
//     const {
//         data: inwardDetail,
//         isLoading: detailLoading,
//         refetch,
//     } = useGetInwardByIdQuery(selectedInward?.inward_id, {
//         skip: !selectedInward?.inward_id,
//     });

//     const items = inwardDetail?.items || [];

//     // ── Helpers ────────────────────────────────────────────────────────────────
//     const inputCls = (name) =>
//         `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${itemErrors?.[name] ? "border-red-400" : "border-gray-300"
//         }`;

//     const errorMsg = (name) =>
//         itemErrors?.[name] ? (
//             <p className="text-xs text-red-500 mt-1">{itemErrors[name]}</p>
//         ) : null;

//     // ── Validation ─────────────────────────────────────────────────────────────
//     const validate = () => {
//         const errors = {};
//         if (!itemForm.item_name?.trim())
//             errors.item_name = "Item name is required";
//         if (!itemForm.quantity_received && itemForm.quantity_received !== 0)
//             errors.quantity_received = "Quantity is required";
//         else if (Number(itemForm.quantity_received) <= 0)
//             errors.quantity_received = "Quantity must be greater than 0";
//         if (itemForm.purchase_cost !== "" && Number(itemForm.purchase_cost) < 0)
//             errors.purchase_cost = "Cost cannot be negative";
//         return errors;
//     };

//     // ── Add Item ───────────────────────────────────────────────────────────────
//     const handleAdd = async () => {
//         dispatch(clearItemErrors());
//         const errors = validate();
//         if (Object.keys(errors).length > 0) {
//             dispatch(setItemErrors(errors));
//             return;
//         }

//         dispatch(setSubmitting(true));
//         try {
//             const payload = {
//                 inwardId: selectedInward.inward_id,
//                 item_name: itemForm.item_name.trim(),
//                 quantity_received: Number(itemForm.quantity_received),
//             };
//             if (itemForm.variant_text?.trim()) payload.variant_text = itemForm.variant_text.trim();
//             if (itemForm.purchase_cost !== "") payload.purchase_cost = Number(itemForm.purchase_cost);
//             if (itemForm.batch_number?.trim()) payload.batch_number = itemForm.batch_number.trim();
//             if (itemForm.remarks?.trim()) payload.remarks = itemForm.remarks.trim();

//             await addItem(payload).unwrap();
//             dispatch(cancelEditItem());
//             refetch();
//         } catch (err) {
//             if (err?.data?.errors?.length) {
//                 const be = {};
//                 err.data.errors.forEach(({ field, message }) => { be[field] = message; });
//                 dispatch(setItemErrors(be));
//             } else {
//                 dispatch(setItemErrors({ general: err?.data?.message || "Failed to add item" }));
//             }
//         } finally {
//             dispatch(setSubmitting(false));
//         }
//     };

//     // ── Update Item ────────────────────────────────────────────────────────────
//     const handleUpdate = async () => {
//         dispatch(clearItemErrors());
//         const errors = validate();
//         if (Object.keys(errors).length > 0) {
//             dispatch(setItemErrors(errors));
//             return;
//         }

//         dispatch(setSubmitting(true));
//         try {
//             const payload = {
//                 inwardId: selectedInward.inward_id,
//                 inwardItemId: editingItemId,
//                 item_name: itemForm.item_name.trim(),
//                 quantity_received: Number(itemForm.quantity_received),
//             };
//             if (itemForm.variant_text?.trim()) payload.variant_text = itemForm.variant_text.trim();
//             if (itemForm.purchase_cost !== "") payload.purchase_cost = Number(itemForm.purchase_cost);
//             if (itemForm.batch_number?.trim()) payload.batch_number = itemForm.batch_number.trim();
//             if (itemForm.remarks?.trim()) payload.remarks = itemForm.remarks.trim();

//             await updateItem(payload).unwrap();
//             dispatch(cancelEditItem());
//             refetch();
//         } catch (err) {
//             if (err?.data?.errors?.length) {
//                 const be = {};
//                 err.data.errors.forEach(({ field, message }) => { be[field] = message; });
//                 dispatch(setItemErrors(be));
//             } else {
//                 dispatch(setItemErrors({ general: err?.data?.message || "Failed to update item" }));
//             }
//         } finally {
//             dispatch(setSubmitting(false));
//         }
//     };

//     // ── Delete Item ────────────────────────────────────────────────────────────
//     const handleDelete = async (inwardItemId, itemName) => {
//         if (!window.confirm(`Remove "${itemName}" from this inward?`)) return;
//         try {
//             await deleteItem({
//                 inwardId: selectedInward.inward_id,
//                 inwardItemId,
//             }).unwrap();
//             refetch();
//         } catch (err) {
//             alert(err?.data?.message || "Failed to delete item");
//         }
//     };

//     // ── Open Product Picker ────────────────────────────────────────────────────
//     const handleOpenPicker = (item) => {
//         setActiveItem(item);
//         setPickerOpen(true);
//     };

//     // ── Handle Product Mapped Successfully ─────────────────────────────────────
//     const handleMappingSuccess = () => {
//         setPickerOpen(false);
//         setActiveItem(null);
//         refetch();
//     };

//     const isEditing = !!editingItemId;
//     const isMutating = isAdding || isUpdating;

//     return (
//         <>
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//                 <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">

//                     {/* Header */}
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <h3 className="text-base font-semibold text-gray-800">
//                                 Received Items — {selectedInward?.inward_number}
//                             </h3>
//                             <p className="text-xs text-gray-400 mt-0.5">
//                                 Add all items received in this shipment
//                             </p>
//                         </div>
//                         <button
//                             onClick={() => { dispatch(closeItemsModal()); onClose(); }}
//                             className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
//                         >
//                             ✕
//                         </button>
//                     </div>

//                     {/* ── Item Form (Add or Edit) ──────────────────────────────────────── */}
//                     <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
//                         <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                             {isEditing ? "Edit Item" : "Add Item"}
//                         </p>

//                         {itemErrors?.general && (
//                             <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
//                                 <p className="text-sm text-red-600">{itemErrors.general}</p>
//                             </div>
//                         )}

//                         <div className="grid grid-cols-2 gap-3 text-gray-700">

//                             {/* Item Name */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Item Name <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     value={itemForm.item_name}
//                                     onChange={(e) => dispatch(updateItemForm({ item_name: e.target.value }))}
//                                     placeholder="e.g. Men T-Shirt Black"
//                                     className={inputCls("item_name")}
//                                 />
//                                 {errorMsg("item_name")}
//                             </div>

//                             {/* Variant Text */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Variant
//                                 </label>
//                                 <input
//                                     value={itemForm.variant_text}
//                                     onChange={(e) => dispatch(updateItemForm({ variant_text: e.target.value }))}
//                                     placeholder="e.g. Size M, Color Red"
//                                     className={inputCls("variant_text")}
//                                 />
//                                 {errorMsg("variant_text")}
//                                 <p className="text-xs text-gray-400 mt-1">
//                                     Will auto-match to product's SKU or barcode
//                                 </p>
//                             </div>

//                             {/* Quantity */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Quantity Received <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="number"
//                                     min="1"
//                                     value={itemForm.quantity_received}
//                                     onChange={(e) => dispatch(updateItemForm({ quantity_received: e.target.value }))}
//                                     placeholder="e.g. 40"
//                                     className={inputCls("quantity_received")}
//                                 />
//                                 {errorMsg("quantity_received")}
//                             </div>

//                             {/* Purchase Cost */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Purchase Cost (₹)
//                                 </label>
//                                 <input
//                                     type="number"
//                                     min="0"
//                                     step="0.01"
//                                     value={itemForm.purchase_cost}
//                                     onChange={(e) => dispatch(updateItemForm({ purchase_cost: e.target.value }))}
//                                     placeholder="e.g. 220"
//                                     className={inputCls("purchase_cost")}
//                                 />
//                                 {errorMsg("purchase_cost")}
//                             </div>

//                             {/* Batch Number */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Batch Number
//                                 </label>
//                                 <input
//                                     value={itemForm.batch_number}
//                                     onChange={(e) => dispatch(updateItemForm({ batch_number: e.target.value }))}
//                                     placeholder="e.g. BATCH-M-BLK-01"
//                                     className={inputCls("batch_number")}
//                                 />
//                                 {errorMsg("batch_number")}
//                             </div>

//                             {/* Remarks */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Remarks
//                                 </label>
//                                 <input
//                                     value={itemForm.remarks}
//                                     onChange={(e) => dispatch(updateItemForm({ remarks: e.target.value }))}
//                                     placeholder="e.g. Physical count matched"
//                                     className={inputCls("remarks")}
//                                 />
//                                 {errorMsg("remarks")}
//                             </div>

//                         </div>

//                         {/* Form Action Buttons */}
//                         <div className="flex justify-end gap-2">
//                             {isEditing && (
//                                 <button
//                                     onClick={() => dispatch(cancelEditItem())}
//                                     className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
//                                 >
//                                     Cancel Edit
//                                 </button>
//                             )}
//                             <button
//                                 onClick={isEditing ? handleUpdate : handleAdd}
//                                 disabled={isMutating}
//                                 className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
//                             >
//                                 {isMutating
//                                     ? isEditing ? "Updating…" : "Adding…"
//                                     : isEditing ? "Update Item" : "Add Item"}
//                             </button>
//                         </div>
//                     </div>

//                     {/* ── Items List ───────────────────────────────────────────────────── */}
//                     <div>
//                         <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//                             Items ({items.length})
//                         </p>

//                         {detailLoading && (
//                             <div className="flex justify-center py-8">
//                                 <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                             </div>
//                         )}

//                         {!detailLoading && items.length === 0 && (
//                             <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
//                                 No items added yet — use the form above
//                             </div>
//                         )}

//                         {!detailLoading && items.length > 0 && (
//                             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                                 <table className="w-full text-sm">
//                                     <thead className="bg-gray-50">
//                                         <tr>
//                                             {["#", "Item", "Variant", "Qty", "Cost", "Batch", "Mapped", ""].map((h) => (
//                                                 <th
//                                                     key={h}
//                                                     className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
//                                                 >
//                                                     {h}
//                                                 </th>
//                                             ))}
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-gray-100">
//                                         {items.map((item) => (
//                                             <tr
//                                                 key={item.inward_item_id}
//                                                 className={`hover:bg-gray-50 transition-colors ${editingItemId === item.inward_item_id ? "bg-blue-50" : ""
//                                                     }`}
//                                             >
//                                                 <td className="px-3 py-2.5 text-xs text-gray-400 font-mono">
//                                                     {item.line_no}
//                                                 </td>
//                                                 <td className="px-3 py-2.5 font-medium text-gray-800">
//                                                     {item.item_name}
//                                                 </td>
//                                                 <td className="px-3 py-2.5 text-xs text-gray-500">
//                                                     {item.variant_text || "—"}
//                                                 </td>
//                                                 <td className="px-3 py-2.5 font-semibold text-gray-700">
//                                                     {item.quantity_received}
//                                                 </td>
//                                                 <td className="px-3 py-2.5 text-xs text-gray-600">
//                                                     {item.purchase_cost != null ? `₹${item.purchase_cost}` : "—"}
//                                                 </td>
//                                                 <td className="px-3 py-2.5 text-xs font-mono text-gray-500">
//                                                     {item.batch_number || "—"}
//                                                 </td>
//                                                 <td className="px-3 py-2.5">
//                                                     {item.mapped_product_id ? (
//                                                         <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                                                             Mapped
//                                                         </span>
//                                                     ) : (
//                                                         <button
//                                                             onClick={() => handleOpenPicker(item)}
//                                                             className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium hover:bg-yellow-200 cursor-pointer"
//                                                         >
//                                                             Map to Product →
//                                                         </button>
//                                                     )}
//                                                 </td>
//                                                 <td className="px-3 py-2.5">
//                                                     <div className="flex gap-2">
//                                                         <button
//                                                             onClick={() => dispatch(startEditItem(item))}
//                                                             className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
//                                                         >
//                                                             Edit
//                                                         </button>
//                                                         <button
//                                                             onClick={() => handleDelete(item.inward_item_id, item.item_name)}
//                                                             disabled={isDeleting}
//                                                             className="text-xs text-red-500 hover:text-red-700 cursor-pointer font-medium disabled:opacity-40"
//                                                         >
//                                                             Remove
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </div>

//                     {/* Footer close */}
//                     <div className="flex justify-end pt-2 border-t border-gray-100">
//                         <button
//                             onClick={() => { dispatch(closeItemsModal()); onClose(); }}
//                             className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
//                         >
//                             Done
//                         </button>
//                     </div>

//                 </div>
//             </div>

//             {/* Product Picker Modal */}
//             {pickerOpen && activeItem && (
//                 <InwardProductPickerModal
//                     item={activeItem}
//                     inward={selectedInward}
//                     onClose={() => {
//                         setPickerOpen(false);
//                         setActiveItem(null);
//                     }}
//                     onSuccess={handleMappingSuccess}
//                 />
//             )}
//         </>
//     );
// }

// // TABS/WAREHOUSES/INWARDS/InwardShared/InwardItemsModal.jsx
// //
// // Responsibility: Manage InwardReceiptItems for a single inward.
// //   POST   /inwards/:inwardId/items        — add item
// //   PUT    /inwards/:inwardId/items/:itemId — edit item
// //   DELETE /inwards/:inwardId/items/:itemId — delete item
// //
// // Only available when inward status is ARRIVED.
// // Uses useGetInwardByIdQuery to get fresh items list.

// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//     useGetInwardByIdQuery,
//     useAddInwardItemMutation,
//     useUpdateInwardItemMutation,
//     useDeleteInwardItemMutation,
// } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";
// import {
//     closeItemsModal,
//     startEditItem,
//     cancelEditItem,
//     updateItemForm,
//     setItemErrors,
//     clearItemErrors,
//     setSubmitting,
// } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";

// export default function InwardItemsModal({
//     selectedInward,
//     itemForm,
//     itemErrors,
//     editingItemId,
// }) {
//     const dispatch = useDispatch();

//     const [addItem, { isLoading: isAdding }] = useAddInwardItemMutation();
//     const [updateItem, { isLoading: isUpdating }] = useUpdateInwardItemMutation();
//     const [deleteItem, { isLoading: isDeleting }] = useDeleteInwardItemMutation();

//     // Always fetch fresh items from backend
//     const {
//         data: inwardDetail,
//         isLoading: detailLoading,
//         refetch,
//     } = useGetInwardByIdQuery(selectedInward?.inward_id, {
//         skip: !selectedInward?.inward_id,
//     });

//     const items = inwardDetail?.items || [];

//     const handleMapProduct = (item) => {
//         // Open product selection modal
//         // For now, prompt for product ID (you'll replace with actual product search)
//         const productId = prompt(`Map "${item.item_name}" to product ID:`);
//         if (productId) {
//             // Call API to update mapped_product_id
//             // PATCH /inwards/:inwardId/items/:itemId
//             updateItem({
//                 inwardId: selectedInward.inward_id,
//                 inwardItemId: item.inward_item_id,
//                 mapped_product_id: productId,
//             }).unwrap().then(() => {
//                 refetch();
//             }).catch(err => {
//                 alert(err?.data?.message || "Failed to map product");
//             });
//         }
//     };

//     // ── Helpers ────────────────────────────────────────────────────────────────
//     const inputCls = (name) =>
//         `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${itemErrors?.[name] ? "border-red-400" : "border-gray-300"
//         }`;

//     const errorMsg = (name) =>
//         itemErrors?.[name] ? (
//             <p className="text-xs text-red-500 mt-1">{itemErrors[name]}</p>
//         ) : null;

//     // ── Validation ─────────────────────────────────────────────────────────────
//     const validate = () => {
//         const errors = {};
//         if (!itemForm.item_name?.trim())
//             errors.item_name = "Item name is required";
//         if (!itemForm.quantity_received && itemForm.quantity_received !== 0)
//             errors.quantity_received = "Quantity is required";
//         else if (Number(itemForm.quantity_received) <= 0)
//             errors.quantity_received = "Quantity must be greater than 0";
//         if (itemForm.purchase_cost !== "" && Number(itemForm.purchase_cost) < 0)
//             errors.purchase_cost = "Cost cannot be negative";
//         return errors;
//     };

//     // ── Add Item ───────────────────────────────────────────────────────────────
//     const handleAdd = async () => {
//         dispatch(clearItemErrors());
//         const errors = validate();
//         if (Object.keys(errors).length > 0) {
//             dispatch(setItemErrors(errors));
//             return;
//         }

//         dispatch(setSubmitting(true));
//         try {
//             const payload = {
//                 inwardId: selectedInward.inward_id,
//                 item_name: itemForm.item_name.trim(),
//                 quantity_received: Number(itemForm.quantity_received),
//             };
//             if (itemForm.variant_text?.trim()) payload.variant_text = itemForm.variant_text.trim();
//             if (itemForm.purchase_cost !== "") payload.purchase_cost = Number(itemForm.purchase_cost);
//             if (itemForm.batch_number?.trim()) payload.batch_number = itemForm.batch_number.trim();
//             if (itemForm.remarks?.trim()) payload.remarks = itemForm.remarks.trim();

//             await addItem(payload).unwrap();
//             dispatch(cancelEditItem()); // reset form back to empty
//             refetch();
//         } catch (err) {
//             if (err?.data?.errors?.length) {
//                 const be = {};
//                 err.data.errors.forEach(({ field, message }) => { be[field] = message; });
//                 dispatch(setItemErrors(be));
//             } else {
//                 dispatch(setItemErrors({ general: err?.data?.message || "Failed to add item" }));
//             }
//         } finally {
//             dispatch(setSubmitting(false));
//         }
//     };

//     // ── Update Item ────────────────────────────────────────────────────────────
//     const handleUpdate = async () => {
//         dispatch(clearItemErrors());
//         const errors = validate();
//         if (Object.keys(errors).length > 0) {
//             dispatch(setItemErrors(errors));
//             return;
//         }

//         dispatch(setSubmitting(true));
//         try {
//             const payload = {
//                 inwardId: selectedInward.inward_id,
//                 inwardItemId: editingItemId,
//                 item_name: itemForm.item_name.trim(),
//                 quantity_received: Number(itemForm.quantity_received),
//             };
//             if (itemForm.variant_text?.trim()) payload.variant_text = itemForm.variant_text.trim();
//             if (itemForm.purchase_cost !== "") payload.purchase_cost = Number(itemForm.purchase_cost);
//             if (itemForm.batch_number?.trim()) payload.batch_number = itemForm.batch_number.trim();
//             if (itemForm.remarks?.trim()) payload.remarks = itemForm.remarks.trim();

//             await updateItem(payload).unwrap();
//             dispatch(cancelEditItem());
//             refetch();
//         } catch (err) {
//             if (err?.data?.errors?.length) {
//                 const be = {};
//                 err.data.errors.forEach(({ field, message }) => { be[field] = message; });
//                 dispatch(setItemErrors(be));
//             } else {
//                 dispatch(setItemErrors({ general: err?.data?.message || "Failed to update item" }));
//             }
//         } finally {
//             dispatch(setSubmitting(false));
//         }
//     };

//     // ── Delete Item ────────────────────────────────────────────────────────────
//     const handleDelete = async (inwardItemId, itemName) => {
//         if (!window.confirm(`Remove "${itemName}" from this inward?`)) return;
//         try {
//             await deleteItem({
//                 inwardId: selectedInward.inward_id,
//                 inwardItemId,
//             }).unwrap();
//             refetch();
//         } catch (err) {
//             alert(err?.data?.message || "Failed to delete item");
//         }
//     };

//     const isEditing = !!editingItemId;
//     const isMutating = isAdding || isUpdating;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">

//                 {/* Header */}
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <h3 className="text-base font-semibold text-gray-800">
//                             Received Items — {selectedInward?.inward_number}
//                         </h3>
//                         <p className="text-xs text-gray-400 mt-0.5">
//                             Add all items received in this shipment
//                         </p>
//                     </div>
//                     <button
//                         onClick={() => { dispatch(closeItemsModal()); onClose(); }}
//                         className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
//                     >
//                         ✕
//                     </button>
//                 </div>

//                 {/* ── Item Form (Add or Edit) ──────────────────────────────────────── */}
//                 <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
//                     <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
//                         {isEditing ? "Edit Item" : "Add Item"}
//                     </p>

//                     {itemErrors?.general && (
//                         <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
//                             <p className="text-sm text-red-600">{itemErrors.general}</p>
//                         </div>
//                     )}

//                     <div className="grid grid-cols-2 gap-3 text-gray-700">

//                         {/* Item Name */}
//                         <div>
//                             <label className="block text-xs font-medium text-gray-600 mb-1">
//                                 Item Name <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 value={itemForm.item_name}
//                                 onChange={(e) => dispatch(updateItemForm({ item_name: e.target.value }))}
//                                 placeholder="e.g. Men T-Shirt Black"
//                                 className={inputCls("item_name")}
//                             />
//                             {errorMsg("item_name")}
//                         </div>

//                         {/* Variant Text */}
//                         <div>
//                             <label className="block text-xs font-medium text-gray-600 mb-1">
//                                 Variant
//                             </label>
//                             <input
//                                 value={itemForm.variant_text}
//                                 onChange={(e) => dispatch(updateItemForm({ variant_text: e.target.value }))}
//                                 placeholder="e.g. Size M, Color Red"
//                                 className={inputCls("variant_text")}
//                             />
//                             {errorMsg("variant_text")}
//                         </div>

//                         {/* Quantity */}
//                         <div>
//                             <label className="block text-xs font-medium text-gray-600 mb-1">
//                                 Quantity Received <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="number"
//                                 min="1"
//                                 value={itemForm.quantity_received}
//                                 onChange={(e) => dispatch(updateItemForm({ quantity_received: e.target.value }))}
//                                 placeholder="e.g. 40"
//                                 className={inputCls("quantity_received")}
//                             />
//                             {errorMsg("quantity_received")}
//                         </div>

//                         {/* Purchase Cost */}
//                         <div>
//                             <label className="block text-xs font-medium text-gray-600 mb-1">
//                                 Purchase Cost (₹)
//                             </label>
//                             <input
//                                 type="number"
//                                 min="0"
//                                 step="0.01"
//                                 value={itemForm.purchase_cost}
//                                 onChange={(e) => dispatch(updateItemForm({ purchase_cost: e.target.value }))}
//                                 placeholder="e.g. 220"
//                                 className={inputCls("purchase_cost")}
//                             />
//                             {errorMsg("purchase_cost")}
//                         </div>

//                         {/* Batch Number */}
//                         <div>
//                             <label className="block text-xs font-medium text-gray-600 mb-1">
//                                 Batch Number
//                             </label>
//                             <input
//                                 value={itemForm.batch_number}
//                                 onChange={(e) => dispatch(updateItemForm({ batch_number: e.target.value }))}
//                                 placeholder="e.g. BATCH-M-BLK-01"
//                                 className={inputCls("batch_number")}
//                             />
//                             {errorMsg("batch_number")}
//                         </div>

//                         {/* Remarks */}
//                         <div>
//                             <label className="block text-xs font-medium text-gray-600 mb-1">
//                                 Remarks
//                             </label>
//                             <input
//                                 value={itemForm.remarks}
//                                 onChange={(e) => dispatch(updateItemForm({ remarks: e.target.value }))}
//                                 placeholder="e.g. Physical count matched"
//                                 className={inputCls("remarks")}
//                             />
//                             {errorMsg("remarks")}
//                         </div>

//                     </div>

//                     {/* Form Action Buttons */}
//                     <div className="flex justify-end gap-2">
//                         {isEditing && (
//                             <button
//                                 onClick={() => dispatch(cancelEditItem())}
//                                 className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
//                             >
//                                 Cancel Edit
//                             </button>
//                         )}
//                         <button
//                             onClick={isEditing ? handleUpdate : handleAdd}
//                             disabled={isMutating}
//                             className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
//                         >
//                             {isMutating
//                                 ? isEditing ? "Updating…" : "Adding…"
//                                 : isEditing ? "Update Item" : "Add Item"}
//                         </button>
//                     </div>
//                 </div>

//                 {/* ── Items List ───────────────────────────────────────────────────── */}
//                 <div>
//                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//                         Items ({items.length})
//                     </p>

//                     {detailLoading && (
//                         <div className="flex justify-center py-8">
//                             <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//                         </div>
//                     )}

//                     {!detailLoading && items.length === 0 && (
//                         <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
//                             No items added yet — use the form above
//                         </div>
//                     )}

//                     {!detailLoading && items.length > 0 && (
//                         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//                             <table className="w-full text-sm">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         {["#", "Item", "Variant", "Qty", "Cost", "Batch", "Mapped", ""].map((h) => (
//                                             <th
//                                                 key={h}
//                                                 className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
//                                             >
//                                                 {h}
//                                             </th>
//                                         ))}
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-100">
//                                     {items.map((item) => (
//                                         <tr
//                                             key={item.inward_item_id}
//                                             className={`hover:bg-gray-50 transition-colors ${editingItemId === item.inward_item_id ? "bg-blue-50" : ""
//                                                 }`}
//                                         >
//                                             <td className="px-3 py-2.5 text-xs text-gray-400 font-mono">
//                                                 {item.line_no}
//                                             </td>
//                                             <td className="px-3 py-2.5 font-medium text-gray-800">
//                                                 {item.item_name}
//                                             </td>
//                                             <td className="px-3 py-2.5 text-xs text-gray-500">
//                                                 {item.variant_text || "—"}
//                                             </td>
//                                             <td className="px-3 py-2.5 font-semibold text-gray-700">
//                                                 {item.quantity_received}
//                                             </td>
//                                             <td className="px-3 py-2.5 text-xs text-gray-600">
//                                                 {item.purchase_cost != null ? `₹${item.purchase_cost}` : "—"}
//                                             </td>
//                                             <td className="px-3 py-2.5 text-xs font-mono text-gray-500">
//                                                 {item.batch_number || "—"}
//                                             </td>
//                                             <td className="px-3 py-2.5">
//                                                 {item.mapped_product_id ? (
//                                                     <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                                                         Mapped
//                                                     </span>
//                                                 ) : (
//                                                     <button
//                                                         onClick={() => handleMapProduct(item)}
//                                                         className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium hover:bg-yellow-200 cursor-pointer"
//                                                     >
//                                                         Map to Product →
//                                                     </button>
//                                                 )}
//                                             </td>
//                                             <td className="px-3 py-2.5">
//                                                 <div className="flex gap-2">
//                                                     <button
//                                                         onClick={() => dispatch(startEditItem(item))}
//                                                         className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
//                                                     >
//                                                         Edit
//                                                     </button>
//                                                     <button
//                                                         onClick={() => handleDelete(item.inward_item_id, item.item_name)}
//                                                         disabled={isDeleting}
//                                                         className="text-xs text-red-500 hover:text-red-700 cursor-pointer font-medium disabled:opacity-40"
//                                                     >
//                                                         Remove
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer close */}
//                 <div className="flex justify-end pt-2 border-t border-gray-100">
//                     <button
//                         onClick={() => { dispatch(closeItemsModal()); onClose(); }}
//                         className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
//                     >
//                         Done
//                     </button>
//                 </div>

//             </div>
//         </div>
//     );
// }
