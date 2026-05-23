// TABS/TRANSFERS/TransferShared/TransferCartTable.jsx
//
// Reusable cart table component for all transfer tabs

import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";

export default function TransferCartTable({ cart, onUpdateQuantity, onRemoveItem, readOnly = false }) {
    
    if (cart.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                No items added yet
            </div>
        );
    }
    
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Product</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Quantity</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Unit</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Available</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {cart.map((item) => (
                        <tr key={item.variant_id} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5">
                                <p className="font-medium text-gray-800">{item.product_name}</p>
                                {item.batch_number && (
                                    <p className="text-xs text-gray-400 font-mono mt-0.5">Batch: {item.batch_number}</p>
                                )}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                                {readOnly ? (
                                    <span className="font-semibold text-gray-700">{item.quantity}</span>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onUpdateQuantity(item.variant_id, item.quantity - 1)}
                                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-12 text-center font-semibold text-gray-700">{item.quantity}</span>
                                        <button
                                            onClick={() => onUpdateQuantity(item.variant_id, item.quantity + 1)}
                                            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                            disabled={item.quantity >= item.available_stock}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                )}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 text-xs">{item.unit}</td>
                            <td className="px-4 py-2.5">
                                <span className={`text-xs font-medium ${item.available_stock <= 10 ? "text-red-500" : "text-green-600"}`}>
                                    {item.available_stock} units
                                </span>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                                {!readOnly && (
                                    <button
                                        onClick={() => onRemoveItem(item.variant_id)}
                                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                        <td colSpan="5" className="px-4 py-2.5 text-right">
                            <span className="text-sm font-semibold text-gray-700">
                                Total Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}