// src/Components/TABS/INVENTORY/ProductFormBody.jsx
import React from 'react';

const ProductFormBody = ({ formData, setFormData, categories, isEditing = false }) => {
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? e.target.checked : value
        }));
    };

    return (
        <div className="grid grid-cols-4 gap-4">
            {/* Basic Info */}
            <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
                <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="e.g., Maggi Noodles" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
                <input 
                    type="text" 
                    name="brand" 
                    value={formData.brand} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="e.g., Nestle" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                    {categories.filter(c => c !== 'all').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Description */}
            <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    rows="2" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Product description, features, etc." 
                />
            </div>

            {/* Barcode & SKU */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Barcode</label>
                <input 
                    type="text" 
                    name="barcode" 
                    value={formData.barcode} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Auto-generated" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">SKU (Stock Keeping Unit)</label>
                <input 
                    type="text" 
                    name="sku" 
                    value={formData.sku} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="e.g., MAG-001" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                <select 
                    name="unit" 
                    value={formData.unit} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="Pcs">Pieces (Pcs)</option>
                    <option value="Kg">Kilogram (Kg)</option>
                    <option value="Gm">Gram (Gm)</option>
                    <option value="Ltr">Liter (Ltr)</option>
                    <option value="Box">Box</option>
                    <option value="Packet">Packet</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input 
                    type="text" 
                    name="weight" 
                    value={formData.weight} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="0.5" 
                />
            </div>

            {/* 4 Price Types */}
            <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">💰 Price Types</label>
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500">MRP (Max Retail Price)</label>
                        <input 
                            type="number" 
                            name="mrp" 
                            value={formData.mrp} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border border-red-300 rounded-lg text-red-700 font-semibold focus:ring-red-500 focus:border-red-500" 
                            placeholder="₹" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500">Retail Price (Shop)</label>
                        <input 
                            type="number" 
                            name="retail" 
                            value={formData.retail} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border border-blue-300 rounded-lg text-blue-700 focus:ring-blue-500 focus:border-blue-500" 
                            placeholder="₹" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500">Wholesale Price (Bulk)</label>
                        <input 
                            type="number" 
                            name="wholesale" 
                            value={formData.wholesale} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border border-green-300 rounded-lg text-green-700 focus:ring-green-500 focus:border-green-500" 
                            placeholder="₹" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500">Online Price (E-comm)</label>
                        <input 
                            type="number" 
                            name="online" 
                            value={formData.online} 
                            onChange={handleInputChange} 
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg text-purple-700 focus:ring-purple-500 focus:border-purple-500" 
                            placeholder="₹" 
                        />
                    </div>
                </div>
            </div>

            {/* GST & Tax */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">GST (%)</label>
                <select 
                    name="gst" 
                    value={formData.gst} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">HSN Code</label>
                <input 
                    type="text" 
                    name="hsn" 
                    value={formData.hsn} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="6-digit code" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cess (%)</label>
                <input 
                    type="text" 
                    name="cess" 
                    value={formData.cess} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="0" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select 
                    name="isActive" 
                    value={formData.isActive} 
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {/* Inventory Settings */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Current Stock</label>
                <input 
                    type="number" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Alert</label>
                <input 
                    type="number" 
                    name="lowStockAlert" 
                    value={formData.lowStockAlert} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" 
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Reorder Quantity</label>
                <input 
                    type="number" 
                    name="reorderQuantity" 
                    value={formData.reorderQuantity} 
                    onChange={handleInputChange} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                />
            </div>
        </div>
    );
};

export default ProductFormBody;