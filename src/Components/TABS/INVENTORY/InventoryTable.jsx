
// src/Components/TABS/INVENTORY/InventoryTable.jsx
import React, { useState } from 'react';
import NetworkStockPanel from '../../shared/NetworkStockPanel';
import { isAdmin } from '../../roles';

const InventoryTable = ({ 
    products, 
    onEdit, 
    onDelete, 
    onStockAdjust,
    onPrintBarcode,
    selectedShop,
    showNetworkButton = false 
}) => {
    const [showStockAdjust, setShowStockAdjust] = useState(null);
    const [selectedProductForNetwork, setSelectedProductForNetwork] = useState(null);

    const handleStockAdjustClick = (product) => {
        setShowStockAdjust(product);
    };

    const handleStockUpdate = () => {
        const newStock = document.getElementById('newStock')?.value;
        if (newStock && showStockAdjust) {
            onStockAdjust(showStockAdjust, parseInt(newStock));
            setShowStockAdjust(null);
        }
    };

    return (
        <>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barcode/SKU</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Prices (MRP/Retail/Wholesale)</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">GST/HSN</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-12 text-center text-gray-400">
                                        No products found. Click "Add Product" to get started.
                                    </td>
                                </tr>
                            ) : (
                                products.map(product => {
                                    const isLowStock = product.stock <= product.lowStockAlert;
                                    const isOutOfStock = product.stock === 0;
                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="font-medium text-gray-800">{product.name}</p>
                                                    <p className="text-xs text-gray-400">{product.brand || 'No brand'} • {product.category}</p>
                                                    {product.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{product.description}</p>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 block w-fit mb-2">{product.barcode}</code>
                                                <div className="relative group w-fit">
                                                    <img
                                                        src={`https://barcode.tec-it.com/barcode.ashx?data=${product.barcode}&code=Code128&dpi=96&dataseparator=`}
                                                        alt="Barcode"
                                                        className="h-10 object-contain bg-white p-1 border rounded cursor-pointer hover:border-blue-500"
                                                        onClick={() => onPrintBarcode(product)}
                                                        title="Click to Print Barcode"
                                                    />
                                                    <button
                                                        onClick={() => onPrintBarcode(product)}
                                                        className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md flex items-center justify-center"
                                                        title="Print Barcode Label"
                                                    >
                                                        🖨️
                                                    </button>
                                                </div>
                                                {product.sku && <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-0.5 text-sm">
                                                    <p><span className="text-gray-500">MRP:</span> <span className="text-red-600 font-medium">₹{product.mrp}</span></p>
                                                    <p><span className="text-gray-500">Retail:</span> <span className="text-blue-600">₹{product.retail || product.mrp}</span></p>
                                                    <p><span className="text-gray-500">Wholesale:</span> <span className="text-green-600">₹{product.wholesale || product.mrp}</span></p>
                                                    {product.online && <p><span className="text-gray-500">Online:</span> <span className="text-purple-600">₹{product.online}</span></p>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-bold text-lg ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-500' : 'text-green-600'}`}>
                                                        {product.stock}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{product.unit}</span>
                                                    {isLowStock && (
                                                        <span className={`px-2 py-0.5 text-xs rounded-full ${isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                            {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleStockAdjustClick(product)}
                                                        className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                                                    >
                                                        Adjust
                                                    </button>
                                                </div>
                                                {isLowStock && !isOutOfStock && (
                                                    <p className="text-xs text-orange-500 mt-1">Alert at {product.lowStockAlert} units</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm">{product.gst}%</span>
                                                {product.hsn && <p className="text-xs text-gray-400 font-mono">HSN: {product.hsn}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${product.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {product.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => onEdit(product)} 
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => onDelete(product.id)} 
                                                        className="text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                    {showNetworkButton && (
                                                        <button
                                                            onClick={() => setSelectedProductForNetwork(product)}
                                                            className="text-purple-600 hover:text-purple-800 text-sm"
                                                        >
                                                            Network
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stock Adjustment Modal */}
            {showStockAdjust && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-96">
                        <h3 className="font-bold text-gray-800 text-lg mb-4">Adjust Stock: {showStockAdjust.name}</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Current Stock:</span>
                                <span className={`font-bold ${showStockAdjust.stock <= showStockAdjust.lowStockAlert ? 'text-red-600' : 'text-green-600'}`}>
                                    {showStockAdjust.stock} {showStockAdjust.unit}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Low Stock Alert:</span>
                                <span className="text-orange-600">{showStockAdjust.lowStockAlert} {showStockAdjust.unit}</span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Stock Quantity</label>
                                <input 
                                    type="number" 
                                    id="newStock" 
                                    defaultValue={showStockAdjust.stock} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button 
                                    onClick={() => setShowStockAdjust(null)} 
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleStockUpdate} 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Update Stock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Network Stock Panel Modal */}
            {selectedProductForNetwork && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 w-full max-w-3xl m-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b">
                            <h3 className="font-bold text-gray-800 text-xl">
                                Network Stock: {selectedProductForNetwork.name}
                            </h3>
                            <button 
                                onClick={() => setSelectedProductForNetwork(null)} 
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        <NetworkStockPanel 
                            productName={selectedProductForNetwork.name}
                            productId={selectedProductForNetwork.id}
                            excludeLocationId={selectedShop}
                            fullView={true}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default InventoryTable;