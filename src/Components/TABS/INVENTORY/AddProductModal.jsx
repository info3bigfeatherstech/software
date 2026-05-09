// src/Components/TABS/INVENTORY/AddProductModal.jsx
import React, { useState } from 'react';
import ProductFormBody from './ProductFormBody';

const AddProductModal = ({ isOpen, onClose, onSave, selectedShop, categories }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        barcode: '',
        sku: '',
        mrp: '',
        wholesale: '',
        retail: '',
        online: '',
        gst: '18',
        hsn: '',
        cess: '0',
        stock: '0',
        lowStockAlert: '10',
        reorderQuantity: '50',
        unit: 'Pcs',
        weight: '',
        brand: '',
        category: 'FMCG',
        isActive: true
    });

    const generateBarcode = () => {
        const prefix = 'VYP';
        const shopCode = selectedShop.replace('SHP-', '');
        const timestamp = Date.now().toString().slice(-6);
        return `${prefix}-${shopCode}-${timestamp}`;
    };

    const handleSave = () => {
        const newProduct = {
            id: `PRD-${Date.now()}`,
            ...formData,
            barcode: formData.barcode || generateBarcode(),
            shopId: selectedShop,
            locationId: selectedShop,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        onSave(newProduct);
        onClose();
        // Reset form
        setFormData({
            name: '',
            description: '',
            barcode: '',
            sku: '',
            mrp: '',
            wholesale: '',
            retail: '',
            online: '',
            gst: '18',
            hsn: '',
            cess: '0',
            stock: '0',
            lowStockAlert: '10',
            reorderQuantity: '50',
            unit: 'Pcs',
            weight: '',
            brand: '',
            category: 'FMCG',
            isActive: true
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 w-full max-w-5xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b">
                    <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                        ➕ Add New Product
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                
                <ProductFormBody 
                    formData={formData}
                    setFormData={setFormData}
                    categories={categories}
                    isEditing={false}
                />

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t sticky bottom-0 bg-white">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Save Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;