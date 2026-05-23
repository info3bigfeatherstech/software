// TABS/WAREHOUSES/INWARDS/InwardShared/InwardProductPickerModal.jsx
//
// Responsibility: Allow user to search and select a product to map to an inward item
// Uses GET /products with warehouse_id filter
// Calls PUT /inwards/:inwardId/items/:itemId with mapped_product_id

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Search, X, Package, CheckCircle, AlertCircle } from "lucide-react";
import { useGetProductsQuery } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productApi";
import { useUpdateInwardItemMutation } from "../../../../../REDUX_FEATURES/REDUX_SLICES/Inward_api/inwardApi";

export default function InwardProductPickerModal({ item, inward, onClose, onSuccess }) {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [updateInwardItem] = useUpdateInwardItemMutation();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch products filtered by warehouse_id
    const {
        data: productsData,
        isLoading,
        isFetching,
        error: fetchError,
    } = useGetProductsQuery({
        page: 1,
        limit: 50,
        search: debouncedSearch,
        warehouse_id: inward.warehouse_id,
        is_active: "true",
    });

    const products = productsData?.products || [];

    const handleConfirmMapping = async () => {
        if (!selectedProductId) {
            setError("Please select a product");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await updateInwardItem({
                inwardId: inward.inward_id,
                inwardItemId: item.inward_item_id,
                mapped_product_id: selectedProductId,
            }).unwrap();

            onSuccess();
        } catch (err) {
            const status = err?.status;
            const message = err?.data?.message || "Failed to map product";

            if (status === 409) {
                if (message.includes("PRODUCT_WAREHOUSE_MISMATCH")) {
                    setError("This product belongs to a different warehouse. Cannot map.");
                } else if (message.includes("MAPPED_PRODUCT_NO_VARIANT")) {
                    setError("Product has no active variant. Please add a variant to this product first.");
                } else {
                    setError(message);
                }
            } else {
                setError(message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStockStatus = (product) => {
        // Product API doesn't return stock - stock is in separate product-stocks endpoint
        // For now, show "Check stock in Inventory Stock tab"
        return "View in Stock Tab";
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">Map to Product</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Select a product to map "{item.item_name}" to
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Context Strip - Shows current item being mapped */}
                <div className="bg-blue-50 border-b border-blue-100 px-5 py-3">
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <span className="text-xs text-blue-600 font-medium">Mapping Item:</span>
                            <p className="text-gray-800 font-medium mt-0.5">{item.item_name}</p>
                            {item.variant_text && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Variant: {item.variant_text}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-blue-600 font-medium">Quantity:</span>
                            <p className="text-gray-800 font-semibold">{item.quantity_received} units</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 border-t border-blue-100 pt-2">
                        ⚡ Backend will auto-match variant using SKU, product_code, or barcode from "{item.variant_text || "variant_text"}"
                    </p>
                </div>

                {/* Search Input */}
                <div className="p-5 border-b border-gray-100">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by product name, SKU, or barcode..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Showing products from warehouse: {inward.warehouse?.warehouse_name || inward.warehouse_id}
                    </p>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                                {error.includes("no active variant") && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Go to Products → Edit Product → Add a variant first
                                    </p>
                                )}
                                {error.includes("different warehouse") && (
                                    <p className="text-xs text-red-500 mt-1">
                                        This inward is for warehouse {inward.warehouse?.warehouse_name}. 
                                        Only products from this warehouse can be mapped.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Products List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-2">
                    {(isLoading || isFetching) && (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {!isLoading && !isFetching && products.length === 0 && (
                        <div className="text-center py-12">
                            <Package size={40} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm">No products found in this warehouse</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Try a different search term or add products first
                            </p>
                        </div>
                    )}

                    {products.map((product) => {
                        const isSelected = selectedProductId === product.product_id;
                        const primaryVariant = product.primary_variant || {};
                        const variantCode = primaryVariant.variant_code || product.product_code;
                        const sku = primaryVariant.sku || "";
                        const barcode = primaryVariant.system_barcode || "";

                        return (
                            <div
                                key={product.product_id}
                                onClick={() => setSelectedProductId(product.product_id)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-semibold text-gray-800">{product.name}</p>
                                            {product.brand_name && (
                                                <span className="text-xs text-gray-400">· {product.brand_name}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="font-mono">Code: {variantCode}</span>
                                            {sku && <span className="font-mono">SKU: {sku}</span>}
                                            {barcode && <span className="font-mono">Barcode: {barcode}</span>}
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                            <span className="text-red-600">MRP: ₹{product.mrp?.toLocaleString()}</span>
                                            <span className="text-green-600">Wholesale: ₹{product.wholesale_price?.toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            ⚡ Variant will be auto-matched using "{item.variant_text || product.name}"
                                        </p>
                                    </div>
                                    {isSelected && (
                                        <CheckCircle size={20} className="text-blue-500 shrink-0" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="border-t border-gray-100 p-5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmMapping}
                        disabled={!selectedProductId || isSubmitting}
                        className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition-all ${!selectedProductId || isSubmitting
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                    >
                        {isSubmitting ? "Mapping..." : "Confirm Mapping →"}
                    </button>
                </div>

            </div>
        </div>
    );
}