// src/Components/TABS/INVENTORY/BulkUploadModal.jsx
import React, { useState } from 'react';

const BulkUploadModal = ({ isOpen, onClose, onUpload, selectedShop, generateBarcode }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (!file) {
            alert('Please select a CSV file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const csvData = event.target.result;
                const rows = csvData.split('\n');
                const headers = rows[0].split(',');
                const newProducts = [];

                for (let i = 1; i < rows.length; i++) {
                    const values = rows[i].split(',');
                    if (values.length >= 5 && values[0].trim()) {
                        const newProduct = {
                            id: `PRD-${Date.now()}-${i}`,
                            name: values[0].trim(),
                            mrp: values[1]?.trim() || '',
                            retail: values[2]?.trim() || values[1]?.trim() || '',
                            wholesale: values[3]?.trim() || values[1]?.trim() || '',
                            stock: values[4]?.trim() || '0',
                            barcode: generateBarcode(),
                            shopId: selectedShop,
                            locationId: selectedShop,
                            gst: '18',
                            hsn: '',
                            lowStockAlert: '10',
                            reorderQuantity: '50',
                            unit: 'Pcs',
                            category: 'FMCG',
                            isActive: true,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        newProducts.push(newProduct);
                    }
                }

                if (newProducts.length > 0) {
                    onUpload(newProducts);
                    alert(`✅ Successfully imported ${newProducts.length} products!`);
                    onClose();
                    setFile(null);
                } else {
                    alert('No valid products found in CSV');
                }
            } catch (error) {
                alert('❌ Error parsing CSV file');
            }
        };
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
                <h3 className="font-bold text-lg mb-4">📤 Bulk Upload Products</h3>
                <p className="text-sm text-gray-600 mb-3">
                    Upload CSV with columns: Name, MRP, Retail, Wholesale, Stock
                </p>
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange} 
                    className="w-full mb-4 border border-gray-300 rounded-lg p-2" 
                />
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => {
                            onClose();
                            setFile(null);
                        }} 
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpload} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Upload
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;