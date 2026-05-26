// TABS/TRANSFERS/BulkTransferRequestsTab.jsx
// 
// Complete Bulk Transfer Requests - Create, Approve, Dispatch, Receive
// FIXED: Fetch details for view, dispatch, receive actions

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Plus, RefreshCw, Package, Truck, CheckCircle, XCircle, Ban, Eye, ClipboardList } from "lucide-react";
import { toast } from "react-toastify";
import { useGetWarehousesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Warehouse_api/warehouseApi";
import { useGetShopsQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Shop_api/shopApi";
import { useGetProductStocksQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";
import { useGetBulkTransferRequestsQuery, useCreateBulkTransferRequestMutation, useLazyGetBulkTransferRequestByIdQuery, generateBulkIdempotencyKey } from "../../../../REDUX_FEATURES/REDUX_SLICES/BulkTransfer_api/bulkTransferApi";
import {
    setStatusFilter,
    setCurrentPage,
    setPageSize,
    resetFilters,
    openCreateModal,
    closeCreateModal,
    updateCreateForm,
    addBulkItem,
    removeBulkItem,
    updateBulkItem,
    clearBulkItems,
    setCreateErrors,
    openApproveModal,
    openDispatchModal,
    openReceiveModal,
    openCancelModal,
    openViewModal,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/BulkTransfer_api/bulkTransferSlice";
import BulkActionModals from "./BulkActionModals";
import { CURRENT_USER } from "../../../roles";

const STATUS_BADGE = {
    REQUESTED: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-blue-100 text-blue-700",
    DISPATCHED: "bg-purple-100 text-purple-700",
    PARTIALLY_RECEIVED: "bg-orange-100 text-orange-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-gray-100 text-gray-500",
};

const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export default function BulkTransferRequestsTab() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { statusFilter, currentPage, pageSize, showCreateModal, createForm, createErrors } = useSelector((state) => state.bulkTransfer);
    
    const [searchTerm, setSearchTerm] = useState("");
    
    const userShopId = user?.shop_id || "";
    const userWarehouseId = user?.warehouse_id || "";
    const userRole = user?.role || "";
    
    const { data: warehousesData } = useGetWarehousesQuery({ page: 1, limit: 50, is_active: "true" });
    const { data: shopsData } = useGetShopsQuery({ page: 1, limit: 50, is_active: "true" });
    const { data: stocksData } = useGetProductStocksQuery({ page: 1, limit: 50, warehouse_id: createForm.from_warehouse_id || userWarehouseId });
    const { data: bulkRequestsData, isLoading, refetch } = useGetBulkTransferRequestsQuery({
        page: currentPage,
        limit: pageSize,
        status: statusFilter,
        to_shop_id: userShopId,
    });
    
    const [createBulkRequest] = useCreateBulkTransferRequestMutation();
    const [fetchBulkRequestDetail] = useLazyGetBulkTransferRequestByIdQuery();
    
    const warehouses = warehousesData?.warehouses || [];
    const shops = shopsData?.shops || [];
    const stocks = stocksData?.stocks || [];
    const requests = bulkRequestsData?.requests || [];
    const meta = bulkRequestsData?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
    
    const availableProducts = createForm.from_warehouse_id
        ? stocks.filter(s => s.warehouse_id === createForm.from_warehouse_id && s.quantity > 0)
        : [];
    
    const filteredProducts = availableProducts.filter(p =>
        p.variant?.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.variant?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Get available actions based on user role and request status
    const getAvailableActions = (request) => {
        const actions = [];
        const status = request.status;
        
        const requestFromWarehouseId = request.from_warehouse?.warehouse_id || request.from_warehouse_id;
        const requestToShopId = request.to_shop?.shop_id || request.to_shop_id;
        
        const isSourceWH = userWarehouseId && (requestFromWarehouseId === userWarehouseId);
        const isDestShop = userShopId && (requestToShopId === userShopId);
        const isSuperAdmin = userRole === "SUPER_ADMIN";
        
        // View details - always available
        actions.push({ type: "view", label: "View Details", icon: <Eye size={14} />, color: "text-gray-500" });
        
        if (status === "REQUESTED") {
            if (isSourceWH || isSuperAdmin) {
                actions.push({ type: "approve", label: "Approve", icon: <CheckCircle size={14} />, color: "text-green-600" });
                actions.push({ type: "reject", label: "Reject", icon: <XCircle size={14} />, color: "text-red-600" });
            }
            if (isDestShop || isSuperAdmin) {
                actions.push({ type: "cancel", label: "Cancel", icon: <Ban size={14} />, color: "text-gray-600" });
            }
        }
        
        if (status === "APPROVED") {
            if (isSourceWH || isSuperAdmin) {
                actions.push({ type: "dispatch", label: "Dispatch", icon: <Truck size={14} />, color: "text-blue-600" });
            }
            if (isDestShop || isSuperAdmin) {
                actions.push({ type: "cancel", label: "Cancel", icon: <Ban size={14} />, color: "text-gray-600" });
            }
        }
        
        if (status === "DISPATCHED" || status === "PARTIALLY_RECEIVED") {
            if (isDestShop || isSuperAdmin) {
                actions.push({ type: "receive", label: "Receive", icon: <Package size={14} />, color: "text-green-600" });
            }
        }
        
        return actions;
    };
    
    // FIXED: Handle all actions that need full details
    const handleAction = async (request, actionType) => {
        // Actions that need full details from detail API
        const needsDetail = ["view", "dispatch", "receive", "approve", "reject"].includes(actionType);
        
        if (needsDetail) {
            try {
                const fullRequest = await fetchBulkRequestDetail(request.bulk_request_id).unwrap();
                
                if (actionType === "view") {
                    dispatch(openViewModal(fullRequest));
                } else if (actionType === "approve") {
                    dispatch(openApproveModal(fullRequest));
                } else if (actionType === "reject") {
                    dispatch(openApproveModal(fullRequest));
                } else if (actionType === "dispatch") {
                    dispatch(openDispatchModal(fullRequest));
                } else if (actionType === "receive") {
                    dispatch(openReceiveModal(fullRequest));
                }
            } catch (err) {
                toast.error("Failed to load request details");
            }
        } else if (actionType === "cancel") {
            // Cancel doesn't need items, list data is enough
            dispatch(openCancelModal(request));
        }
    };
    
    const validateCreate = () => {
        const errors = {};
        if (!createForm.from_warehouse_id) errors.from_warehouse_id = "Source warehouse is required";
        if (!createForm.to_shop_id) errors.to_shop_id = "Destination shop is required";
        if (createForm.items.length === 0) errors.items = "At least one item is required";
        return errors;
    };
    
    const handleCreateSubmit = async () => {
        const errors = validateCreate();
        if (Object.keys(errors).length > 0) {
            dispatch(setCreateErrors(errors));
            toast.error("Please fix the errors");
            return;
        }
        
        const invalidItems = createForm.items.filter(item => !item.quantity || parseInt(item.quantity) <= 0);
        if (invalidItems.length > 0) {
            toast.error("Please enter valid quantity for all items");
            return;
        }
        
        try {
            const payload = {
                to_shop_id: createForm.to_shop_id,
                from_warehouse_id: createForm.from_warehouse_id,
                request_type: "WH_TO_SHOP",
                request_remarks: createForm.request_remarks?.trim() || null,
                items: createForm.items.map(item => ({
                    variant_id: item.variant_id,
                    quantity: parseInt(item.quantity),
                })),
            };
            
            await createBulkRequest({ idempotencyKey: generateBulkIdempotencyKey(), ...payload }).unwrap();
            toast.success("Bulk transfer request created successfully");
            dispatch(closeCreateModal());
            dispatch(clearBulkItems());
            refetch();
        } catch (err) {
            if (err?.data?.errors?.length) {
                const be = {};
                err.data.errors.forEach(({ field, message }) => { be[field] = message; });
                dispatch(setCreateErrors(be));
            } else {
                toast.error(err?.data?.message || "Failed to create bulk request");
            }
        }
    };
    
    const handleAddToCart = (stock) => {
        const existing = createForm.items.find(i => i.variant_id === stock.variant_id);
        if (existing) {
            toast.info("Item already added");
            return;
        }
        dispatch(addBulkItem({
            variant_id: stock.variant_id,
            product_name: stock.variant?.product?.name,
            sku: stock.variant?.sku,
            quantity: "",
            available_stock: stock.quantity,
        }));
    };
    
    const inputCls = (name, errors) => `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors?.[name] ? "border-red-400" : "border-gray-300"}`;
    
    return (
        <div className="space-y-5">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <ClipboardList size={22} className="text-indigo-600" />
                        Bulk Transfer Requests
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Create bulk requests with multiple items — Full workflow: Request → Approve → Dispatch → Receive → Complete
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => dispatch(openCreateModal())}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
                    >
                        <Plus size={16} /> New Bulk Request
                    </button>
                    <button onClick={() => refetch()} className="px-3 py-2 text-sm text-gray-600 border rounded-lg hover:bg-gray-50 flex items-center gap-1">
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
                    <p className="text-xs opacity-75">Total Requests</p>
                    <p className="text-3xl font-bold">{meta.total}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-md">
                    <p className="text-xs opacity-75">Pending (REQUESTED)</p>
                    <p className="text-3xl font-bold">{requests.filter(r => r.status === "REQUESTED").length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-md">
                    <p className="text-xs opacity-75">Dispatched</p>
                    <p className="text-3xl font-bold">{requests.filter(r => r.status === "DISPATCHED" || r.status === "PARTIALLY_RECEIVED").length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-md">
                    <p className="text-xs opacity-75">Completed</p>
                    <p className="text-3xl font-bold">{requests.filter(r => r.status === "COMPLETED").length}</p>
                </div>
            </div>
            
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex gap-3">
                    <select value={statusFilter} onChange={(e) => dispatch(setStatusFilter(e.target.value))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-48">
                        <option value="">All Status</option>
                        <option value="REQUESTED">REQUESTED</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="DISPATCHED">DISPATCHED</option>
                        <option value="PARTIALLY_RECEIVED">PARTIALLY_RECEIVED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <select value={pageSize} onChange={(e) => dispatch(setPageSize(Number(e.target.value)))} className="px-3 py-2 border border-gray-300 rounded-lg text-sm ml-auto">
                        {[10, 20, 50].map(s => <option key={s} value={s}>{s} per page</option>)}
                    </select>
                </div>
            </div>
            
            {/* Requests Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Request #</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">From WH</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">To Shop</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Items</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Total Qty</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {(isLoading) && (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                </td>
                            </tr>
                        )}
                        {!isLoading && requests.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">No bulk transfer requests found</td>
                            </tr>
                        )}
                        {!isLoading && requests.map((req) => {
                            const totalQty = req.total_quantity || 0;
                            const actions = getAvailableActions(req);
                            
                            return (
                                <tr key={req.bulk_request_id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{req.bulk_request_number}</td>
                                    <td className="px-4 py-3 text-xs text-gray-600">{req.from_warehouse?.warehouse_name || req.from_warehouse_id}</td>
                                    <td className="px-4 py-3 text-xs text-gray-600">{req.to_shop?.shop_name || req.to_shop_id}</td>
                                    <td className="px-4 py-3 text-center text-gray-500">{req.items_count || 0}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-700">{totalQty}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[req.status]}`}>
                                            {req.status?.replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-400">{fmtDate(req.requested_at || req.created_at)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1 flex-wrap">
                                            {actions.map((action) => (
                                                <button
                                                    key={action.type}
                                                    onClick={() => handleAction(req, action.type)}
                                                    className={`p-1.5 ${action.color} hover:bg-gray-100 rounded-lg transition-colors`}
                                                    title={action.label}
                                                >
                                                    {action.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-between items-center bg-white rounded-xl border border-gray-200 px-4 py-3">
                    <p className="text-sm text-gray-500">Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, meta.total)} of {meta.total}</p>
                    <div className="flex gap-2">
                        <button onClick={() => dispatch(setCurrentPage(currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50">Previous</button>
                        <span className="px-3 py-1 text-sm text-gray-600">{currentPage} / {meta.totalPages}</span>
                        <button onClick={() => dispatch(setCurrentPage(currentPage + 1))} disabled={currentPage === meta.totalPages} className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
                    </div>
                </div>
            )}
            
            {/* Create Bulk Request Modal - Keep existing */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto text-gray-700">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-gray-800">Create Bulk Transfer Request</h3>
                                <p className="text-xs text-gray-400">Add multiple products to a single request</p>
                            </div>
                            <button onClick={() => dispatch(closeCreateModal())} className="text-gray-400"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Source Warehouse <span className="text-red-500">*</span></label>
                                    <select 
                                        value={createForm.from_warehouse_id} 
                                        onChange={(e) => dispatch(updateCreateForm({ from_warehouse_id: e.target.value, items: [] }))} 
                                        className={inputCls("from_warehouse_id", createErrors)}
                                    >
                                        <option value="">Select warehouse</option>
                                        {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name} — {w.city}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Destination Shop <span className="text-red-500">*</span></label>
                                    <select 
                                        value={createForm.to_shop_id} 
                                        onChange={(e) => dispatch(updateCreateForm({ to_shop_id: e.target.value }))} 
                                        className={inputCls("to_shop_id", createErrors)}
                                    >
                                        <option value="">Select shop</option>
                                        {shops.map(s => <option key={s.shop_id} value={s.shop_id}>{s.shop_name} — {s.city}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            {createForm.from_warehouse_id && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">Add Products</label>
                                    <div className="relative mb-3">
                                        <input 
                                            type="text" 
                                            value={searchTerm} 
                                            onChange={(e) => setSearchTerm(e.target.value)} 
                                            placeholder="Search by product name or SKU..." 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 max-h-36 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50">
                                        {filteredProducts.length === 0 ? (
                                            <p className="col-span-3 text-center text-xs text-gray-400 py-2">No products available</p>
                                        ) : (
                                            filteredProducts.map(p => (
                                                <button 
                                                    key={p.stock_id} 
                                                    onClick={() => handleAddToCart(p)} 
                                                    className="text-left p-2 bg-white hover:bg-blue-50 border rounded-lg text-xs transition-colors"
                                                >
                                                    <p className="font-medium truncate">{p.variant?.product?.name}</p>
                                                    <p className="text-gray-400 text-xs">{p.variant?.sku}</p>
                                                    <p className="text-green-600">Stock: {p.quantity}</p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {createForm.items.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Items ({createForm.items.length})</p>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {createForm.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2 border rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{item.product_name}</p>
                                                    <p className="text-xs text-gray-400">{item.sku}</p>
                                                </div>
                                                <div className="w-24">
                                                    <input 
                                                        type="number" 
                                                        min="1" 
                                                        max={item.available_stock} 
                                                        value={item.quantity} 
                                                        onChange={(e) => dispatch(updateBulkItem({ index: idx, quantity: e.target.value }))} 
                                                        placeholder="Qty" 
                                                        className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                                    />
                                                </div>
                                                <button onClick={() => dispatch(removeBulkItem(idx))} className="text-red-500 text-xs hover:text-red-700">Remove</button>
                                            </div>
                                        ))}
                                    </div>
                                    {createErrors.items && <p className="text-xs text-red-500 mt-1">{createErrors.items}</p>}
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                                <textarea 
                                    value={createForm.request_remarks} 
                                    onChange={(e) => dispatch(updateCreateForm({ request_remarks: e.target.value }))} 
                                    rows={2} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" 
                                    placeholder="Monthly restock notes" 
                                />
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                            <button onClick={() => dispatch(closeCreateModal())} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                            <button 
                                onClick={handleCreateSubmit} 
                                disabled={createForm.items.length === 0} 
                                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                            >
                                Create Bulk Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Action Modals */}
            <BulkActionModals onSuccess={() => refetch()} />
        </div>
    );
}