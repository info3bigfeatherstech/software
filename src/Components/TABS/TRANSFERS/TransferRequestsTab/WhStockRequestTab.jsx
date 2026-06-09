import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Package, Send } from "lucide-react";
import { toast } from "../../../shared/ToastConfig";
import { useGetWarehousesQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Warehouse_api/warehouseApi";
import { useLazyGetPeerStockCatalogQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/WarehousePeerCatalog_api/warehousePeerCatalogApi";
import {
    useCreateBulkTransferRequestMutation,
    generateBulkIdempotencyKey,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/BulkTransfer_api/bulkTransferApi";
import VariantCatalogPicker from "./TransferRequestShared/VariantCatalogPicker";

const MODE_OPTIONS = [
    { value: "existing", label: "Existing at your warehouse", desc: "Variants you already hold — restock from peer WH" },
    { value: "new", label: "New at your warehouse", desc: "Not yet in your warehouse — request from peer" },
];

export default function WhStockRequestTab() {
    const { user } = useSelector((state) => state.auth);
    const userWarehouseId = user?.warehouse_id || "";

    const [catalogMode, setCatalogMode] = useState("existing");
    const [sourceWarehouseId, setSourceWarehouseId] = useState("");
    const [search, setSearch] = useState("");
    const [selection, setSelection] = useState({});
    const [remarks, setRemarks] = useState("");

    const { data: warehousesData } = useGetWarehousesQuery({ page: 1, limit: 50, is_active: "true" });
    const [fetchCatalog, { data: catalogData, isFetching: catalogLoading }] = useLazyGetPeerStockCatalogQuery();
    const [createBulkRequest, { isLoading: submitting }] = useCreateBulkTransferRequestMutation();

    const peerWarehouses = useMemo(
        () =>
            (warehousesData?.warehouses || []).filter((w) => w.warehouse_id !== userWarehouseId),
        [warehousesData, userWarehouseId]
    );

    const myWarehouseLabel = useMemo(() => {
        const mine = (warehousesData?.warehouses || []).find((w) => w.warehouse_id === userWarehouseId);
        return mine ? `${mine.warehouse_name} — ${mine.city}` : "Your warehouse";
    }, [warehousesData, userWarehouseId]);

    useEffect(() => {
        if (!sourceWarehouseId || !userWarehouseId) return;
        fetchCatalog({
            destWarehouseId: userWarehouseId,
            from_warehouse_id: sourceWarehouseId,
            mode: catalogMode,
            search: search.trim(),
            page: 1,
            limit: 100,
        });
    }, [sourceWarehouseId, catalogMode, userWarehouseId, search, fetchCatalog]);

    const catalogProducts = useMemo(() => {
        return (catalogData?.products || []).map((p) => ({
            ...p,
            variants: (p.variants || []).map((v) => ({
                ...v,
                warehouse_available: v.warehouse_available,
                shop_available: v.dest_available,
            })),
        }));
    }, [catalogData]);

    const handleSelectionChange = (variantId, patch) => {
        setSelection((prev) => ({ ...prev, [variantId]: { ...prev[variantId], ...patch } }));
    };

    const handleSelectAllProduct = (product, selectAll) => {
        setSelection((prev) => {
            const next = { ...prev };
            for (const v of product.variants || []) {
                if (!v.selectable) continue;
                if (selectAll) {
                    next[v.variant_id] = {
                        selected: true,
                        quantity: String(v.suggested_quantity || Math.min(1, v.warehouse_available)),
                        product_name: product.name,
                        sku: v.sku,
                        product_code: v.product_code,
                        available_stock: v.warehouse_available,
                    };
                } else {
                    next[v.variant_id] = { ...next[v.variant_id], selected: false };
                }
            }
            return next;
        });
    };

    const cartItems = useMemo(
        () =>
            Object.entries(selection)
                .filter(([, s]) => s.selected)
                .map(([variantId, s]) => ({
                    variant_id: variantId,
                    product_name: s.product_name,
                    sku: s.sku,
                    product_code: s.product_code,
                    quantity: s.quantity,
                    available_stock: s.available_stock,
                })),
        [selection]
    );

    const handleSubmit = async () => {
        if (!sourceWarehouseId) {
            toast.error("Select a source warehouse");
            return;
        }
        if (!userWarehouseId) {
            toast.error("Warehouse not linked to your account");
            return;
        }
        const invalid = cartItems.filter(
            (i) =>
                !i.quantity ||
                parseInt(i.quantity, 10) <= 0 ||
                parseInt(i.quantity, 10) > i.available_stock
        );
        if (!cartItems.length) {
            toast.error("Select at least one variant");
            return;
        }
        if (invalid.length) {
            toast.error("Enter valid quantity for each variant (within source warehouse stock)");
            return;
        }

        try {
            await createBulkRequest({
                idempotencyKey: generateBulkIdempotencyKey(),
                request_type: "WH_TO_WH",
                from_warehouse_id: sourceWarehouseId,
                to_warehouse_id: userWarehouseId,
                request_remarks:
                    remarks.trim() || `${catalogMode === "new" ? "New" : "Existing"} peer warehouse stock request`,
                items: cartItems.map((i) => ({
                    variant_id: i.variant_id,
                    quantity: parseInt(i.quantity, 10),
                })),
            }).unwrap();
            toast.success("Bulk WH→WH request created");
            setSelection({});
            setRemarks("");
            fetchCatalog({
                destWarehouseId: userWarehouseId,
                from_warehouse_id: sourceWarehouseId,
                mode: catalogMode,
                search: search.trim(),
                page: 1,
                limit: 100,
            });
        } catch (err) {
            toast.error(err?.data?.message || "Failed to create request");
        }
    };

    if (!userWarehouseId) {
        return (
            <div className="p-6 text-sm text-gray-500 bg-white rounded-xl border border-gray-200">
                Link a warehouse to your account to request stock from peer warehouses.
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Request Stock from Another Warehouse</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                    Bulk request to <span className="font-medium text-gray-600">{myWarehouseLabel}</span> — pick variants (partial selection supported)
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MODE_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                            setCatalogMode(opt.value);
                            setSelection({});
                        }}
                        className={`text-left p-4 rounded-xl border transition-colors ${
                            catalogMode === opt.value
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                        <p className="font-medium text-sm">{opt.label}</p>
                        <p className={`text-xs mt-1 ${catalogMode === opt.value ? "text-gray-300" : "text-gray-400"}`}>
                            {opt.desc}
                        </p>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Destination (your warehouse)</label>
                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700">
                            {myWarehouseLabel}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">
                            Source warehouse <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={sourceWarehouseId}
                            onChange={(e) => {
                                setSourceWarehouseId(e.target.value);
                                setSelection({});
                            }}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        >
                            <option value="">Select peer warehouse</option>
                            {peerWarehouses.map((w) => (
                                <option key={w.warehouse_id} value={w.warehouse_id}>
                                    {w.warehouse_name} — {w.city}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Search products</label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Name, code, SKU..."
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        disabled={!sourceWarehouseId}
                    />
                </div>

                {sourceWarehouseId && (
                    <VariantCatalogPicker
                        products={catalogProducts}
                        selection={selection}
                        onSelectionChange={handleSelectionChange}
                        onSelectAllProduct={handleSelectAllProduct}
                        isLoading={catalogLoading}
                        emptyMessage={
                            catalogMode === "new"
                                ? "No new variants with stock at the selected warehouse."
                                : "No existing variants to restock from this warehouse."
                        }
                    />
                )}
            </div>

            {cartItems.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Package size={16} /> Request cart ({cartItems.length} variants)
                    </h3>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows={2}
                        placeholder="Remarks (optional)"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Send size={14} />
                        {submitting ? "Submitting..." : "Submit bulk WH→WH request"}
                    </button>
                </div>
            )}
        </div>
    );
}
