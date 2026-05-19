// TABS/WAREHOUSES/INWARDS/InwardShared/InwardItemsModal.jsx
//
// Responsibility: Manage InwardReceiptItems for a single inward.
//   POST   /inwards/:inwardId/items        — add item
//   PUT    /inwards/:inwardId/items/:itemId — edit item
//   DELETE /inwards/:inwardId/items/:itemId — delete item
//
// Only available when inward status is ARRIVED.
// Uses useGetInwardByIdQuery to get fresh items list.

import React from "react";
import { useDispatch, useSelector } from "react-redux";
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

export default function InwardItemsModal({
    selectedInward,
    itemForm,
    itemErrors,
    editingItemId,
}) {
    const dispatch = useDispatch();

    const [addItem, { isLoading: isAdding }] = useAddInwardItemMutation();
    const [updateItem, { isLoading: isUpdating }] = useUpdateInwardItemMutation();
    const [deleteItem, { isLoading: isDeleting }] = useDeleteInwardItemMutation();

    // Always fetch fresh items from backend
    const {
        data: inwardDetail,
        isLoading: detailLoading,
        refetch,
    } = useGetInwardByIdQuery(selectedInward?.inward_id, {
        skip: !selectedInward?.inward_id,
    });

    const items = inwardDetail?.items || [];

    const handleMapProduct = (item) => {
        // Open product selection modal
        // For now, prompt for product ID (you'll replace with actual product search)
        const productId = prompt(`Map "${item.item_name}" to product ID:`);
        if (productId) {
            // Call API to update mapped_product_id
            // PATCH /inwards/:inwardId/items/:itemId
            updateItem({
                inwardId: selectedInward.inward_id,
                inwardItemId: item.inward_item_id,
                mapped_product_id: productId,
            }).unwrap().then(() => {
                refetch();
            }).catch(err => {
                alert(err?.data?.message || "Failed to map product");
            });
        }
    };

    // ── Helpers ────────────────────────────────────────────────────────────────
    const inputCls = (name) =>
        `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${itemErrors?.[name] ? "border-red-400" : "border-gray-300"
        }`;

    const errorMsg = (name) =>
        itemErrors?.[name] ? (
            <p className="text-xs text-red-500 mt-1">{itemErrors[name]}</p>
        ) : null;

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = () => {
        const errors = {};
        if (!itemForm.item_name?.trim())
            errors.item_name = "Item name is required";
        if (!itemForm.quantity_received && itemForm.quantity_received !== 0)
            errors.quantity_received = "Quantity is required";
        else if (Number(itemForm.quantity_received) <= 0)
            errors.quantity_received = "Quantity must be greater than 0";
        if (itemForm.purchase_cost !== "" && Number(itemForm.purchase_cost) < 0)
            errors.purchase_cost = "Cost cannot be negative";
        return errors;
    };

    // ── Add Item ───────────────────────────────────────────────────────────────
    const handleAdd = async () => {
        dispatch(clearItemErrors());
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            dispatch(setItemErrors(errors));
            return;
        }

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
            dispatch(cancelEditItem()); // reset form back to empty
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

    // ── Update Item ────────────────────────────────────────────────────────────
    const handleUpdate = async () => {
        dispatch(clearItemErrors());
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            dispatch(setItemErrors(errors));
            return;
        }

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

    // ── Delete Item ────────────────────────────────────────────────────────────
    const handleDelete = async (inwardItemId, itemName) => {
        if (!window.confirm(`Remove "${itemName}" from this inward?`)) return;
        try {
            await deleteItem({
                inwardId: selectedInward.inward_id,
                inwardItemId,
            }).unwrap();
            refetch();
        } catch (err) {
            alert(err?.data?.message || "Failed to delete item");
        }
    };

    const isEditing = !!editingItemId;
    const isMutating = isAdding || isUpdating;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">
                            Received Items — {selectedInward?.inward_number}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Add all items received in this shipment
                        </p>
                    </div>
                    <button
                        onClick={() => { dispatch(closeItemsModal()); onClose(); }}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* ── Item Form (Add or Edit) ──────────────────────────────────────── */}
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        {isEditing ? "Edit Item" : "Add Item"}
                    </p>

                    {itemErrors?.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            <p className="text-sm text-red-600">{itemErrors.general}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-gray-700">

                        {/* Item Name */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Item Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={itemForm.item_name}
                                onChange={(e) => dispatch(updateItemForm({ item_name: e.target.value }))}
                                placeholder="e.g. Men T-Shirt Black"
                                className={inputCls("item_name")}
                            />
                            {errorMsg("item_name")}
                        </div>

                        {/* Variant Text */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Variant
                            </label>
                            <input
                                value={itemForm.variant_text}
                                onChange={(e) => dispatch(updateItemForm({ variant_text: e.target.value }))}
                                placeholder="e.g. Size M, Color Red"
                                className={inputCls("variant_text")}
                            />
                            {errorMsg("variant_text")}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Quantity Received <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={itemForm.quantity_received}
                                onChange={(e) => dispatch(updateItemForm({ quantity_received: e.target.value }))}
                                placeholder="e.g. 40"
                                className={inputCls("quantity_received")}
                            />
                            {errorMsg("quantity_received")}
                        </div>

                        {/* Purchase Cost */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Purchase Cost (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={itemForm.purchase_cost}
                                onChange={(e) => dispatch(updateItemForm({ purchase_cost: e.target.value }))}
                                placeholder="e.g. 220"
                                className={inputCls("purchase_cost")}
                            />
                            {errorMsg("purchase_cost")}
                        </div>

                        {/* Batch Number */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Batch Number
                            </label>
                            <input
                                value={itemForm.batch_number}
                                onChange={(e) => dispatch(updateItemForm({ batch_number: e.target.value }))}
                                placeholder="e.g. BATCH-M-BLK-01"
                                className={inputCls("batch_number")}
                            />
                            {errorMsg("batch_number")}
                        </div>

                        {/* Remarks */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Remarks
                            </label>
                            <input
                                value={itemForm.remarks}
                                onChange={(e) => dispatch(updateItemForm({ remarks: e.target.value }))}
                                placeholder="e.g. Physical count matched"
                                className={inputCls("remarks")}
                            />
                            {errorMsg("remarks")}
                        </div>

                    </div>

                    {/* Form Action Buttons */}
                    <div className="flex justify-end gap-2">
                        {isEditing && (
                            <button
                                onClick={() => dispatch(cancelEditItem())}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer"
                            >
                                Cancel Edit
                            </button>
                        )}
                        <button
                            onClick={isEditing ? handleUpdate : handleAdd}
                            disabled={isMutating}
                            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
                        >
                            {isMutating
                                ? isEditing ? "Updating…" : "Adding…"
                                : isEditing ? "Update Item" : "Add Item"}
                        </button>
                    </div>
                </div>

                {/* ── Items List ───────────────────────────────────────────────────── */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Items ({items.length})
                    </p>

                    {detailLoading && (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {!detailLoading && items.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                            No items added yet — use the form above
                        </div>
                    )}

                    {!detailLoading && items.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["#", "Item", "Variant", "Qty", "Cost", "Batch", "Mapped", ""].map((h) => (
                                            <th
                                                key={h}
                                                className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.map((item) => (
                                        <tr
                                            key={item.inward_item_id}
                                            className={`hover:bg-gray-50 transition-colors ${editingItemId === item.inward_item_id ? "bg-blue-50" : ""
                                                }`}
                                        >
                                            <td className="px-3 py-2.5 text-xs text-gray-400 font-mono">
                                                {item.line_no}
                                            </td>
                                            <td className="px-3 py-2.5 font-medium text-gray-800">
                                                {item.item_name}
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-gray-500">
                                                {item.variant_text || "—"}
                                            </td>
                                            <td className="px-3 py-2.5 font-semibold text-gray-700">
                                                {item.quantity_received}
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-gray-600">
                                                {item.purchase_cost != null ? `₹${item.purchase_cost}` : "—"}
                                            </td>
                                            <td className="px-3 py-2.5 text-xs font-mono text-gray-500">
                                                {item.batch_number || "—"}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                {item.mapped_product_id ? (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                        Mapped
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleMapProduct(item)}
                                                        className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium hover:bg-yellow-200 cursor-pointer"
                                                    >
                                                        Map to Product →
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => dispatch(startEditItem(item))}
                                                        className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.inward_item_id, item.item_name)}
                                                        disabled={isDeleting}
                                                        className="text-xs text-red-500 hover:text-red-700 cursor-pointer font-medium disabled:opacity-40"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer close */}
                <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button
                        onClick={() => { dispatch(closeItemsModal()); onClose(); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        Done
                    </button>
                </div>

            </div>
        </div>
    );
}

// // TABS/WAREHOUSES/INWARDS/InwardShared/InwardItemsModal.jsx
// //
// // Responsibility:
// //   - Show all items for an ARRIVED inward
// //   - Add new item (POST /inwards/:id/items)
// //   - Edit existing item (PUT /inwards/:id/items/:itemId)
// //   - Delete item (DELETE /inwards/:id/items/:itemId) with confirmation
// //   - Uses: itemForm / itemErrors / editingItemId from inwardSlice via props
// //   - Fetches fresh item list via useGetInwardByIdQuery — always fresh from server

// import React, { useState } from "react";
// import { useDispatch } from "react-redux";
// import {
//     closeItemsModal,
//     startEditItem,
//     cancelEditItem,
//     updateItemForm,
//     setItemErrors,
//     clearItemErrors,
//     setSubmitting,
// } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardSlice";
// import {
//     useGetInwardByIdQuery,
//     useAddInwardItemMutation,
//     useUpdateInwardItemMutation,
//     useDeleteInwardItemMutation,
// } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";

// // ── Field validation ──────────────────────────────────────────────────────────
// const validateItem = (form) => {
//     const errors = {};
//     if (!form.item_name?.trim()) errors.item_name = "Item name is required";
//     if (!form.quantity_received || Number(form.quantity_received) <= 0)
//         errors.quantity_received = "Quantity must be > 0";
//     if (!form.purchase_cost || Number(form.purchase_cost) < 0)
//         errors.purchase_cost = "Cost must be ≥ 0";
//     return errors;
// };

// export default function InwardItemsModal({
//     selectedInward,
//     itemForm,
//     itemErrors,
//     editingItemId,
//     onSave,
// }) {
//     const dispatch = useDispatch();
//     const inwardId = selectedInward?.inward_id;

//     // ── Fresh items from server ───────────────────────────────────────────────
//     const {
//         data: inwardDetail,
//         isLoading: detailLoading,
//         isFetching,
//     } = useGetInwardByIdQuery(inwardId, { skip: !inwardId });

//     const items = inwardDetail?.items || [];

//     // ── Mutations ─────────────────────────────────────────────────────────────
//     const [addItem, { isLoading: adding }] = useAddInwardItemMutation();
//     const [updateItem, { isLoading: updating }] = useUpdateInwardItemMutation();
//     const [deleteItem, { isLoading: deleting }] = useDeleteInwardItemMutation();

//     // ── Local delete confirmation ─────────────────────────────────────────────
//     const [confirmDeleteId, setConfirmDeleteId] = useState(null);

//     // ── Input helpers ─────────────────────────────────────────────────────────
//     const inputCls = (name) =>
//         `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${itemErrors?.[name] ? "border-red-400" : "border-gray-300"
//         }`;

//     const errorMsg = (name) =>
//         itemErrors?.[name] ? (
//             <p className="text-xs text-red-500 mt-0.5">{itemErrors[name]}</p>
//         ) : null;

//     // ── Submit item (add or edit) ─────────────────────────────────────────────
//     const handleSubmitItem = async () => {
//         dispatch(clearItemErrors());
//         const errors = validateItem(itemForm);
//         if (Object.keys(errors).length > 0) {
//             dispatch(setItemErrors(errors));
//             return;
//         }

//         dispatch(setSubmitting(true));
//         try {
//             const payload = {
//                 inwardId,
//                 item_name: itemForm.item_name.trim(),
//                 quantity_received: Number(itemForm.quantity_received),
//                 purchase_cost: Number(itemForm.purchase_cost),
//             };
//             if (itemForm.variant_text?.trim()) payload.variant_text = itemForm.variant_text.trim();
//             if (itemForm.batch_number?.trim()) payload.batch_number = itemForm.batch_number.trim();
//             if (itemForm.remarks?.trim()) payload.remarks = itemForm.remarks.trim();

//             if (editingItemId) {
//                 await updateItem({ ...payload, inwardItemId: editingItemId }).unwrap();
//             } else {
//                 await addItem(payload).unwrap();
//             }

//             dispatch(cancelEditItem());   // reset form back to add mode
//             onSave();
//         } catch (err) {
//             if (err?.data?.errors?.length) {
//                 const be = {};
//                 err.data.errors.forEach(({ field, message }) => { be[field] = message; });
//                 dispatch(setItemErrors(be));
//             } else {
//                 dispatch(setItemErrors({
//                     general: err?.data?.message || "Failed to save item",
//                 }));
//             }
//         } finally {
//             dispatch(setSubmitting(false));
//         }
//     };

//     // ── Delete item ───────────────────────────────────────────────────────────
//     const handleDelete = async (inwardItemId) => {
//         try {
//             await deleteItem({ inwardId, inwardItemId }).unwrap();
//             setConfirmDeleteId(null);
//             onSave();
//         } catch {
//             // error visible via RTK; could add toast here
//         }
//     };

//     const isMutating = adding || updating || deleting;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//             <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">

//                 {/* ── Header ───────────────────────────────────────────────── */}
//                 <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100">
//                     <div>
//                         <h3 className="text-base font-semibold text-gray-800">Manage Items</h3>
//                         <p className="text-xs text-gray-400 mt-0.5 font-mono">
//                             {selectedInward?.inward_number || inwardId}
//                         </p>
//                     </div>
//                     <button
//                         onClick={() => dispatch(closeItemsModal())}
//                         className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer mt-0.5"
//                     >
//                         ✕
//                     </button>
//                 </div>

//                 {/* ── Scrollable body ───────────────────────────────────────── */}
//                 <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">

//                     {/* ── Add / Edit Item Form ──────────────────────────────── */}
//                     <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
//                         <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                             {editingItemId ? "Edit Item" : "Add Item"}
//                         </p>

//                         {/* General error */}
//                         {itemErrors?.general && (
//                             <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
//                                 <p className="text-xs text-red-600">{itemErrors.general}</p>
//                             </div>
//                         )}

//                         <div className="grid grid-cols-2 gap-3">

//                             {/* Item Name */}
//                             <div className="col-span-2">
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

//                             {/* Variant */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Variant
//                                 </label>
//                                 <input
//                                     value={itemForm.variant_text}
//                                     onChange={(e) => dispatch(updateItemForm({ variant_text: e.target.value }))}
//                                     placeholder="e.g. Size M"
//                                     className={inputCls("variant_text")}
//                                 />
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
//                             </div>

//                             {/* Qty */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Qty Received <span className="text-red-500">*</span>
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

//                             {/* Cost */}
//                             <div>
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">
//                                     Purchase Cost (₹) <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="number"
//                                     min="0"
//                                     value={itemForm.purchase_cost}
//                                     onChange={(e) => dispatch(updateItemForm({ purchase_cost: e.target.value }))}
//                                     placeholder="e.g. 220"
//                                     className={inputCls("purchase_cost")}
//                                 />
//                                 {errorMsg("purchase_cost")}
//                             </div>

//                             {/* Remarks */}
//                             <div className="col-span-2">
//                                 <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
//                                 <input
//                                     value={itemForm.remarks}
//                                     onChange={(e) => dispatch(updateItemForm({ remarks: e.target.value }))}
//                                     placeholder="e.g. Physical count matched"
//                                     className={inputCls("remarks")}
//                                 />
//                             </div>
//                         </div>

//                         {/* Form action buttons */}
//                         <div className="flex items-center gap-2 justify-end pt-1">
//                             {editingItemId && (
//                                 <button
//                                     onClick={() => dispatch(cancelEditItem())}
//                                     className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
//                                 >
//                                     Cancel Edit
//                                 </button>
//                             )}
//                             <button
//                                 onClick={handleSubmitItem}
//                                 disabled={isMutating}
//                                 className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
//                             >
//                                 {isMutating
//                                     ? editingItemId ? "Saving…" : "Adding…"
//                                     : editingItemId ? "Save Changes" : "Add Item"
//                                 }
//                             </button>
//                         </div>
//                     </div>

//                     {/* ── Items Table ───────────────────────────────────────── */}
//                     <div>
//                         <div className="flex items-center justify-between mb-2">
//                             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                                 Received Items {isFetching && <span className="text-gray-300 font-normal">(refreshing…)</span>}
//                             </p>
//                             <p className="text-xs text-gray-400">{items.length} line{items.length !== 1 ? "s" : ""}</p>
//                         </div>

//                         {detailLoading ? (
//                             <div className="space-y-2">
//                                 {Array.from({ length: 3 }).map((_, i) => (
//                                     <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
//                                 ))}
//                             </div>
//                         ) : items.length === 0 ? (
//                             <div className="border border-dashed border-gray-200 rounded-xl px-5 py-8 text-center">
//                                 <p className="text-sm text-gray-400">No items added yet.</p>
//                                 <p className="text-xs text-gray-300 mt-1">Use the form above to add received items.</p>
//                             </div>
//                         ) : (
//                             <div className="border border-gray-100 rounded-xl overflow-hidden">
//                                 <table className="w-full text-xs">
//                                     <thead>
//                                         <tr className="bg-gray-50 border-b border-gray-100">
//                                             <th className="text-left px-4 py-2.5 font-medium text-gray-500">Item</th>
//                                             <th className="text-left px-4 py-2.5 font-medium text-gray-500">Variant</th>
//                                             <th className="text-left px-4 py-2.5 font-medium text-gray-500">Batch</th>
//                                             <th className="text-right px-4 py-2.5 font-medium text-gray-500">Qty</th>
//                                             <th className="text-right px-4 py-2.5 font-medium text-gray-500">Cost</th>
//                                             <th className="text-right px-4 py-2.5 font-medium text-gray-500">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-gray-50">
//                                         {items.map((item) => (
//                                             <tr
//                                                 key={item.inward_item_id}
//                                                 className={`transition-colors ${editingItemId === item.inward_item_id
//                                                     ? "bg-blue-50/60"
//                                                     : "hover:bg-gray-50/50"
//                                                     }`}
//                                             >
//                                                 <td className="px-4 py-2.5 text-gray-700 font-medium">
//                                                     {item.item_name}
//                                                 </td>
//                                                 <td className="px-4 py-2.5 text-gray-500">
//                                                     {item.variant_text || "—"}
//                                                 </td>
//                                                 <td className="px-4 py-2.5 text-gray-400 font-mono">
//                                                     {item.batch_number || "—"}
//                                                 </td>
//                                                 <td className="px-4 py-2.5 text-right text-gray-700">
//                                                     {item.quantity_received}
//                                                 </td>
//                                                 <td className="px-4 py-2.5 text-right text-gray-700">
//                                                     ₹{item.purchase_cost}
//                                                 </td>
//                                                 <td className="px-4 py-2.5 text-right">
//                                                     {confirmDeleteId === item.inward_item_id ? (
//                                                         // Inline delete confirmation
//                                                         <div className="flex items-center justify-end gap-1">
//                                                             <span className="text-red-500 text-xs mr-1">Delete?</span>
//                                                             <button
//                                                                 onClick={() => handleDelete(item.inward_item_id)}
//                                                                 disabled={deleting}
//                                                                 className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 cursor-pointer"
//                                                             >
//                                                                 Yes
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => setConfirmDeleteId(null)}
//                                                                 className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-100 cursor-pointer"
//                                                             >
//                                                                 No
//                                                             </button>
//                                                         </div>
//                                                     ) : (
//                                                         <div className="flex items-center justify-end gap-1.5">
//                                                             <button
//                                                                 onClick={() => dispatch(startEditItem(item))}
//                                                                 className="px-2.5 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
//                                                             >
//                                                                 Edit
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => setConfirmDeleteId(item.inward_item_id)}
//                                                                 className="px-2.5 py-1 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
//                                                             >
//                                                                 Delete
//                                                             </button>
//                                                         </div>
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* ── Footer ───────────────────────────────────────────────── */}
//                 <div className="flex justify-end px-6 py-4 border-t border-gray-100">
//                     <button
//                         onClick={() => dispatch(closeItemsModal())}
//                         className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
//                     >
//                         Done
//                     </button>
//                 </div>

//             </div>
//         </div>
//     );
// }