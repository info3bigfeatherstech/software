// src/Components/TABS/INVENTORY/EditProductModal.jsx
import React, { useState, useEffect } from 'react';
import ProductFormBody from './ProductFormBody';

const EditProductModal = ({ isOpen, onClose, onSave, product, categories }) => {
    const [formData, setFormData] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                barcode: product.barcode || '',
                sku: product.sku || '',
                mrp: product.mrp || '',
                wholesale: product.wholesale || '',
                retail: product.retail || '',
                online: product.online || '',
                gst: product.gst || '18',
                hsn: product.hsn || '',
                cess: product.cess || '0',
                stock: product.stock || '0',
                lowStockAlert: product.lowStockAlert || '10',
                reorderQuantity: product.reorderQuantity || '50',
                unit: product.unit || 'Pcs',
                weight: product.weight || '',
                brand: product.brand || '',
                category: product.category || 'FMCG',
                isActive: product.isActive !== undefined ? product.isActive : true
            });
        }
    }, [product]);

    const handleSave = () => {
        const updatedProduct = {
            ...product,
            ...formData,
            updatedAt: new Date().toISOString()
        };
        onSave(updatedProduct);
        onClose();
    };

    if (!isOpen || !formData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 w-full max-w-5xl m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-4 border-b">
                    <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
                        ✏️ Edit Product: {product.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>

                <ProductFormBody 
                    formData={formData}
                    setFormData={setFormData}
                    categories={categories}
                    isEditing={true}
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
                        Update Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;