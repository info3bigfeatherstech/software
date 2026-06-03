import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Package } from "lucide-react";

/**
 * Product-grouped variant picker with checkboxes and per-variant quantity.
 * @param {object} props
 * @param {Array} props.products - catalog products[]
 * @param {Record<string, { selected: boolean, quantity: string }>} props.selection - keyed by variant_id
 * @param {function} props.onSelectionChange - (variantId, patch) => void
 * @param {function} [props.onSelectAllProduct] - (product, selectAll: boolean) => void
 */
export default function VariantCatalogPicker({
    products = [],
    selection = {},
    onSelectionChange,
    onSelectAllProduct,
    isLoading = false,
    emptyMessage = "No products found for this warehouse and mode.",
}) {
    const [expanded, setExpanded] = useState({});

    const toggleExpand = (productId) => {
        setExpanded((prev) => ({ ...prev, [productId]: !prev[productId] }));
    };

    const totalSelected = useMemo(
        () => Object.values(selection).filter((s) => s.selected).length,
        [selection]
    );

    if (isLoading) {
        return (
            <div className="text-center py-8 text-sm text-gray-400 border border-gray-200 rounded-lg bg-gray-50">
                Loading catalog...
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="text-center py-8 text-sm text-gray-400 border border-gray-200 rounded-lg bg-gray-50">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <p className="text-xs text-gray-500">
                {totalSelected} variant(s) selected — expand a product to pick specific variants
            </p>
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-80 overflow-y-auto bg-white">
                {products.map((product) => {
                    const isOpen = expanded[product.product_id];
                    const variants = product.variants || [];
                    const selectedInProduct = variants.filter(
                        (v) => selection[v.variant_id]?.selected
                    ).length;
                    const allSelected =
                        variants.length > 0 && selectedInProduct === variants.length;

                    return (
                        <div key={product.product_id}>
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100">
                                <button
                                    type="button"
                                    onClick={() => toggleExpand(product.product_id)}
                                    className="p-0.5 text-gray-500"
                                >
                                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                                <Package size={14} className="text-gray-400 shrink-0" />
                                <button
                                    type="button"
                                    onClick={() => toggleExpand(product.product_id)}
                                    className="flex-1 text-left min-w-0"
                                >
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-gray-400 font-mono">
                                        {product.product_code} · {variants.length} variant(s)
                                        {selectedInProduct > 0 && (
                                            <span className="text-blue-600 ml-1">
                                                · {selectedInProduct} selected
                                            </span>
                                        )}
                                    </p>
                                </button>
                                {onSelectAllProduct && (
                                    <button
                                        type="button"
                                        onClick={() => onSelectAllProduct(product, !allSelected)}
                                        className="text-xs text-blue-600 hover:underline shrink-0"
                                    >
                                        {allSelected ? "Clear" : "All"}
                                    </button>
                                )}
                            </div>
                            {isOpen && (
                                <div className="px-3 py-2 space-y-2 bg-white">
                                    {variants.map((v) => {
                                        const sel = selection[v.variant_id] || {
                                            selected: false,
                                            quantity: "",
                                        };
                                        const maxQty = v.warehouse_available ?? 0;
                                        return (
                                            <div
                                                key={v.variant_id}
                                                className="flex flex-wrap items-center gap-3 py-1.5 border-b border-gray-50 last:border-0"
                                            >
                                                <label className="flex items-center gap-2 flex-1 min-w-[200px] cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!sel.selected}
                                                        disabled={!v.selectable}
                                                        onChange={(e) =>
                                                            onSelectionChange(v.variant_id, {
                                                                selected: e.target.checked,
                                                                quantity:
                                                                    e.target.checked && !sel.quantity
                                                                        ? String(
                                                                              v.suggested_quantity ||
                                                                                  Math.min(1, maxQty)
                                                                          )
                                                                        : sel.quantity,
                                                                product_name: product.name,
                                                                sku: v.sku,
                                                                product_code: v.product_code,
                                                                available_stock: maxQty,
                                                            })
                                                        }
                                                        className="w-4 h-4 rounded border-gray-300"
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                        <span className="font-mono text-xs text-gray-500">
                                                            {v.product_code}
                                                        </span>
                                                        {" · "}
                                                        {v.sku}
                                                    </span>
                                                </label>
                                                <span className="text-xs text-gray-400">
                                                    WH: {maxQty}
                                                    {v.shop_available > 0 && (
                                                        <span> · Shop: {v.shop_available}</span>
                                                    )}
                                                </span>
                                                {sel.selected && (
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        max={maxQty}
                                                        value={sel.quantity}
                                                        onChange={(e) =>
                                                            onSelectionChange(v.variant_id, {
                                                                quantity: e.target.value,
                                                            })
                                                        }
                                                        className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg"
                                                        placeholder="Qty"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
