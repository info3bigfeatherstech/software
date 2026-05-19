// src/Components/TABS/INVENTORY/InventoryTab.jsx
import React, { useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_SHOPS } from '../../demoData';
import { CURRENT_USER, filterByLocation, filterLocationList, isAdmin } from '../../roles';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import InventoryTable from './InventoryTable';
import StatsCards from '../../shared/StatsCards';
import BulkUploadModal from './BulkUploadModal';
import CategoriesTab from "../../shared/CategoriesTab/CategoriesTab";
import { useGetCategoriesQuery } from "../../../REDUX_FEATURES/REDUX_SLICES/Category_api/categoryApi";
const STORAGE_KEYS = {
    PRODUCTS: 'vyapar_products',
    SHOPS: 'vyapar_shops'
};

const getData = (key, initialData) => {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
};

const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const InventoryTab = () => {
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(CURRENT_USER.locationId);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    const { data: categoriesData } = useGetCategoriesQuery({
        is_active: true,
        limit: 100
    });

    // Transform categories for the dropdown
    const categoryOptions = [
        { category_id: 'all', name: 'All Categories' },
        ...(categoriesData?.categories || [])
    ];

    useEffect(() => {
        const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const allShops = getData(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);

        const scopedProducts = isAdmin()
            ? allProducts.filter(p => (p.shopId === selectedShop) || (p.locationId === selectedShop))
            : filterByLocation(allProducts);

        setProducts(scopedProducts);
        setShops(filterLocationList(allShops));
    }, [selectedShop]);

    const generateBarcode = () => {
        const prefix = 'VYP';
        const shopCode = selectedShop.replace('SHP-', '');
        const timestamp = Date.now().toString().slice(-6);
        return `${prefix}-${shopCode}-${timestamp}`;
    };

    const handleAddProduct = (newProduct) => {
        const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        saveData(STORAGE_KEYS.PRODUCTS, [...allProducts, newProduct]);

        // Refresh view
        const updatedProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        setProducts(isAdmin()
            ? updatedProducts.filter(p => p.shopId === selectedShop || p.locationId === selectedShop)
            : filterByLocation(updatedProducts));
        alert('✅ New product added successfully!');
    };

    const handleEditProduct = (updatedProduct) => {
        const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const updated = allProducts.map(p =>
            p.id === updatedProduct.id ? updatedProduct : p
        );
        saveData(STORAGE_KEYS.PRODUCTS, updated);

        // Refresh view
        setProducts(isAdmin()
            ? updated.filter(p => p.shopId === selectedShop || p.locationId === selectedShop)
            : filterByLocation(updated));
        setEditingProduct(null);
        alert('✅ Product updated successfully!');
    };

    const handleDeleteProduct = (productId) => {
        if (window.confirm('⚠️ Are you sure you want to delete this product? This action cannot be undone.')) {
            const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
            const filtered = allProducts.filter(p => p.id !== productId);
            saveData(STORAGE_KEYS.PRODUCTS, filtered);
            setProducts(isAdmin()
                ? filtered.filter(p => p.shopId === selectedShop || p.locationId === selectedShop)
                : filterByLocation(filtered));
            alert('✅ Product deleted successfully');
        }
    };

    const handleStockAdjust = (product, newStock) => {
        const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const updated = allProducts.map(p =>
            p.id === product.id
                ? { ...p, stock: newStock, updatedAt: new Date().toISOString() }
                : p
        );
        saveData(STORAGE_KEYS.PRODUCTS, updated);
        setProducts(isAdmin()
            ? updated.filter(p => p.shopId === selectedShop || p.locationId === selectedShop)
            : filterByLocation(updated));
        alert(`✅ Stock updated to ${newStock} units`);
    };

    const handleBulkUpload = (newProducts) => {
        const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        saveData(STORAGE_KEYS.PRODUCTS, [...allProducts, ...newProducts]);

        // Refresh view
        const updatedProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        setProducts(isAdmin()
            ? updatedProducts.filter(p => p.shopId === selectedShop || p.locationId === selectedShop)
            : filterByLocation(updatedProducts));
    };

    const printBarcode = (product) => {
        const printWindow = window.open('', '_blank', 'width=400,height=400');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Barcode - ${product.barcode}</title>
                    <style>
                        body { text-align: center; font-family: sans-serif; padding-top: 50px; }
                        img { max-width: 100%; height: auto; margin-bottom: 10px; }
                        p { margin: 0; font-size: 14px; font-weight: bold; }
                        .sku { font-size: 12px; color: #555; }
                        @media print {
                            body { padding-top: 0; }
                        }
                    </style>
                </head>
                <body>
                    <p>${product.name}</p>
                    <img src="https://barcode.tec-it.com/barcode.ashx?data=${product.barcode}&code=Code128&dpi=96&dataseparator=" alt="Barcode" />
                    <p>${product.barcode}</p>
                    ${product.sku ? `<p class="sku">SKU: ${product.sku}</p>` : ''}
                    <p style="margin-top: 5px;">MRP: ₹${product.mrp}</p>
                    <script>
                        window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Filter products
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <StatsCards
                products={filteredProducts}
                selectedShopName={shops.find(s => s.id === selectedShop)?.name || selectedShop}
            />

            {/* Action Bar */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">📦 Inventory Management</h2>
                    {isAdmin() ? (
                        <select
                            value={selectedShop}
                            onChange={(e) => setSelectedShop(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                        >
                            {shops.map(shop => (
                                <option key={shop.id} value={shop.id}>{shop.name} - {shop.city}</option>
                            ))}
                        </select>
                    ) : (
                        <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
                            📍 {shops[0]?.name || CURRENT_USER.locationId}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowBulkUpload(true)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                    >
                        📤 Bulk Upload
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        + Add Product
                    </button>

                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                    >
                        📁 Add Category
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="🔍 Search by name, barcode, or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
                >
                    {categoryOptions.map(cat => (
                        <option key={cat.category_id} value={cat.category_id === 'all' ? 'all' : cat.category_id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Inventory Table */}
            <InventoryTable
                products={filteredProducts}
                onEdit={setEditingProduct}
                onDelete={handleDeleteProduct}
                onStockAdjust={handleStockAdjust}
                onPrintBarcode={printBarcode}
                selectedShop={selectedShop}
                showNetworkButton={isAdmin()}
            />

            {/* Modals */}
            <AddProductModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleAddProduct}
                selectedShop={selectedShop}
            // categories={categories}
            />

            <EditProductModal
                isOpen={!!editingProduct}
                onClose={() => setEditingProduct(null)}
                onSave={handleEditProduct}
                product={editingProduct}
            // categories={categories}
            />

            <BulkUploadModal
                isOpen={showBulkUpload}
                onClose={() => setShowBulkUpload(false)}
                onUpload={handleBulkUpload}
                selectedShop={selectedShop}
                generateBarcode={generateBarcode}
            />

            {showCategoryModal && (
                <CategoriesTab onClose={() => setShowCategoryModal(false)} />
            )}
        </div>
    );
};

export default InventoryTab;

// down code is good but we move to make seprate component based struture
// // src/Components/TABS/INVENTORY/InventoryTab.jsx
// import React, { useState, useEffect } from 'react';
// import { INITIAL_PRODUCTS, INITIAL_SHOPS } from '../../demoData';
// import { CURRENT_USER, filterByLocation, filterLocationList, isAdmin } from '../../roles';
// import NetworkStockPanel from '../../shared/NetworkStockPanel';

// const STORAGE_KEYS = {
//     PRODUCTS: 'vyapar_products',
//     SHOPS: 'vyapar_shops'
// };

// const getData = (key, initialData) => {
//     const stored = localStorage.getItem(key);
//     if (stored) return JSON.parse(stored);
//     localStorage.setItem(key, JSON.stringify(initialData));
//     return initialData;
// };

// const saveData = (key, data) => {
//     localStorage.setItem(key, JSON.stringify(data));
// };

// const InventoryTab = () => {
//     const [products, setProducts] = useState([]);
//     const [shops, setShops] = useState([]);
//     // Lock non-admins to their own locationId; admins can switch via dropdown
//     const [selectedShop, setSelectedShop] = useState(CURRENT_USER.locationId);
//     const [showAddForm, setShowAddForm] = useState(false);
//     const [showStockAdjust, setShowStockAdjust] = useState(null);
//     const [showBulkUpload, setShowBulkUpload] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [editingProduct, setEditingProduct] = useState(null);
//     const [selectedCategory, setSelectedCategory] = useState('all');

//     // Complete form data with ALL fields
//     const [formData, setFormData] = useState({
//         name: '',
//         description: '',
//         barcode: '',
//         sku: '',
//         // 4 Price Types
//         mrp: '',
//         wholesale: '',
//         retail: '',
//         online: '',
//         // GST & Tax
//         gst: '18',
//         hsn: '',
//         cess: '0',
//         // Inventory
//         stock: '0',
//         lowStockAlert: '10',
//         reorderQuantity: '50',
//         // Physical attributes
//         unit: 'Pcs',
//         weight: '',
//         brand: '',
//         category: 'FMCG',
//         // Status
//         isActive: true
//     });

//     // Categories for filter
//     const categories = ['all', 'FMCG', 'Grocery', 'Electronics', 'Dairy', 'Beverages', 'Snacks', 'Personal Care'];

//     useEffect(() => {
//         const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
//         const allShops    = getData(STORAGE_KEYS.SHOPS, INITIAL_SHOPS);

//         // Admin: filter by selectedShop dropdown. Others: filter by their own locationId.
//         // filterByLocation reads CURRENT_USER internally — no need to pass role around.
//         const scopedProducts = isAdmin()
//             ? allProducts.filter(p => (p.shopId === selectedShop) || (p.locationId === selectedShop))
//             : filterByLocation(allProducts);

//         setProducts(scopedProducts);
//         // Non-admins only see their own location in the selector
//         setShops(filterLocationList(allShops));
//     }, [selectedShop]);

//     const generateBarcode = () => {
//         const prefix = 'VYP';
//         const shopCode = selectedShop.replace('SHP-', '');
//         const timestamp = Date.now().toString().slice(-6);
//         return `${prefix}-${shopCode}-${timestamp}`;
//     };

//     const handleInputChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleSaveProduct = () => {
//         if (!formData.name || !formData.mrp) {
//             alert('❌ Please fill product name and MRP');
//             return;
//         }

//         const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

//         if (editingProduct) {
//             // Update existing product
//             const updated = allProducts.map(p =>
//                 p.id === editingProduct.id
//                     ? { ...p, ...formData, barcode: p.barcode, updatedAt: new Date().toISOString() }
//                     : p
//             );
//             saveData(STORAGE_KEYS.PRODUCTS, updated);
//             alert('✅ Product updated successfully!');
//         } else {
//             // Add new product
//             const newProduct = {
//                 id: `PRD-${Date.now()}`,
//                 ...formData,
//                 barcode: formData.barcode || generateBarcode(),
//                 shopId: selectedShop,
//                 createdAt: new Date().toISOString(),
//                 updatedAt: new Date().toISOString()
//             };
//             saveData(STORAGE_KEYS.PRODUCTS, [...allProducts, newProduct]);
//             alert('✅ New product added successfully!');
//         }

//         // Reset form
//         setFormData({
//             name: '', description: '', barcode: '', sku: '', mrp: '', wholesale: '', retail: '', online: '',
//             gst: '18', hsn: '', cess: '0', stock: '0', lowStockAlert: '10', reorderQuantity: '50',
//             unit: 'Pcs', weight: '', brand: '', category: 'FMCG', isActive: true
//         });
//         setEditingProduct(null);
//         setShowAddForm(false);

//         // Refresh view
//         const updatedProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
//         setProducts(isAdmin()
//             ? updatedProducts.filter(p => p.shopId === selectedShop || p.locationId === selectedShop)
//             : filterByLocation(updatedProducts));
//     };

//     const handleStockAdjust = (product, newStock) => {
//         const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
//         const updated = allProducts.map(p =>
//             p.id === product.id
//                 ? { ...p, stock: parseInt(newStock), updatedAt: new Date().toISOString() }
//                 : p
//         );
//         saveData(STORAGE_KEYS.PRODUCTS, updated);
//         setProducts(isAdmin()
//             ? updated.filter(p => p.shopId === selectedShop || p.locationId === selectedShop)
//             : filterByLocation(updated));
//         setShowStockAdjust(null);
//         alert(`✅ Stock updated to ${newStock} units`);
//     };

//     const handleDeleteProduct = (productId) => {
//         if (window.confirm('⚠️ Are you sure you want to delete this product? This action cannot be undone.')) {
//             const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
//             const filtered = allProducts.filter(p => p.id !== productId);
//             saveData(STORAGE_KEYS.PRODUCTS, filtered);
//             setProducts(isAdmin()
//                 ? filtered.filter(p => p.shopId === selectedShop || p.locationId === selectedShop)
//                 : filterByLocation(filtered));
//             alert('✅ Product deleted successfully');
//         }
//     };

//     const printBarcode = (product) => {
//         const printWindow = window.open('', '_blank', 'width=400,height=400');
//         printWindow.document.write(`
//             <html>
//                 <head>
//                     <title>Print Barcode - ${product.barcode}</title>
//                     <style>
//                         body { text-align: center; font-family: sans-serif; padding-top: 50px; }
//                         img { max-width: 100%; height: auto; margin-bottom: 10px; }
//                         p { margin: 0; font-size: 14px; font-weight: bold; }
//                         .sku { font-size: 12px; color: #555; }
//                         @media print {
//                             body { padding-top: 0; }
//                         }
//                     </style>
//                 </head>
//                 <body>
//                     <p>${product.name}</p>
//                     <img src="https://barcode.tec-it.com/barcode.ashx?data=${product.barcode}&code=Code128&dpi=96&dataseparator=" alt="Barcode" />
//                     <p>${product.barcode}</p>
//                     ${product.sku ? `<p class="sku">SKU: ${product.sku}</p>` : ''}
//                     <p style="margin-top: 5px;">MRP: ₹${product.mrp}</p>
//                     <script>
//                         window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }
//                     </script>
//                 </body>
//             </html>
//         `);
//         printWindow.document.close();
//     };

//     const handleEditProduct = (product) => {
//         setFormData({
//             name: product.name || '',
//             description: product.description || '',
//             barcode: product.barcode || '',
//             sku: product.sku || '',
//             mrp: product.mrp || '',
//             wholesale: product.wholesale || '',
//             retail: product.retail || '',
//             online: product.online || '',
//             gst: product.gst || '18',
//             hsn: product.hsn || '',
//             cess: product.cess || '0',
//             stock: product.stock || '0',
//             lowStockAlert: product.lowStockAlert || '10',
//             reorderQuantity: product.reorderQuantity || '50',
//             unit: product.unit || 'Pcs',
//             weight: product.weight || '',
//             brand: product.brand || '',
//             category: product.category || 'FMCG',
//             isActive: product.isActive !== undefined ? product.isActive : true
//         });
//         setEditingProduct(product);
//         setShowAddForm(true);
//     };

//     const handleBulkUpload = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         const reader = new FileReader();
//         reader.onload = (event) => {
//             try {
//                 const csvData = event.target.result;
//                 const rows = csvData.split('\n');
//                 const headers = rows[0].split(',');
//                 const newProducts = [];

//                 for (let i = 1; i < rows.length; i++) {
//                     const values = rows[i].split(',');
//                     if (values.length >= 5) {
//                         const newProduct = {
//                             id: `PRD-${Date.now()}-${i}`,
//                             name: values[0],
//                             mrp: values[1],
//                             retail: values[2] || values[1],
//                             wholesale: values[3] || values[1],
//                             stock: values[4] || '0',
//                             barcode: generateBarcode(),
//                             shopId: selectedShop,
//                             gst: '18',
//                             hsn: '',
//                             lowStockAlert: '10',
//                             unit: 'Pcs',
//                             category: 'FMCG',
//                             isActive: true,
//                             createdAt: new Date().toISOString()
//                         };
//                         newProducts.push(newProduct);
//                     }
//                 }

//                 const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
//                 saveData(STORAGE_KEYS.PRODUCTS, [...allProducts, ...newProducts]);
//                 setProducts([...products, ...newProducts]);
//                 alert(`✅ Successfully imported ${newProducts.length} products!`);
//                 setShowBulkUpload(false);
//             } catch (error) {
//                 alert('❌ Error parsing CSV file');
//             }
//         };
//         reader.readAsText(file);
//     };

//     // Filter products
//     const filteredProducts = products.filter(p => {
//         const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
//         const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
//         return matchesSearch && matchesCategory;
//     });

//     // Stats
//     const lowStockCount = products.filter(p => p.stock <= p.lowStockAlert).length;
//     const totalValue = products.reduce((sum, p) => sum + (p.stock * (p.mrp || 0)), 0);
//     const outOfStockCount = products.filter(p => p.stock === 0).length;

//     return (
//         <div className="space-y-6">
//             {/* Header with Stats */}
//             <div className="grid grid-cols-4 gap-4">
//                 <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
//                     <p className="text-xs opacity-80 uppercase tracking-wide">Total Products</p>
//                     <p className="text-2xl font-bold">{products.length}</p>
//                     <p className="text-xs opacity-70 mt-1">in {shops.find(s => s.id === selectedShop)?.name}</p>
//                 </div>
//                 <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
//                     <p className="text-xs opacity-80 uppercase tracking-wide">Low Stock Items</p>
//                     <p className="text-2xl font-bold text-red-100">{lowStockCount}</p>
//                     <p className="text-xs opacity-70 mt-1">{outOfStockCount} out of stock</p>
//                 </div>
//                 <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
//                     <p className="text-xs opacity-80 uppercase tracking-wide">Inventory Value</p>
//                     <p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
//                     <p className="text-xs opacity-70 mt-1">at MRP</p>
//                 </div>
//                 <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
//                     <p className="text-xs opacity-80 uppercase tracking-wide">Categories</p>
//                     <p className="text-2xl font-bold">{new Set(products.map(p => p.category)).size}</p>
//                     <p className="text-xs opacity-70 mt-1">unique types</p>
//                 </div>
//             </div>

//             {/* Action Bar */}
//             <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-4">
//                     <h2 className="text-xl font-bold text-gray-800">📦 Inventory Management</h2>

//                     {/* Admin: switchable dropdown. Non-admin: read-only badge. */}
//                     {isAdmin() ? (
//                         <select
//                             value={selectedShop}
//                             onChange={(e) => setSelectedShop(e.target.value)}
//                             className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
//                         >
//                             {shops.map(shop => (
//                                 <option key={shop.id} value={shop.id}>{shop.name} - {shop.city}</option>
//                             ))}
//                         </select>
//                     ) : (
//                         <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
//                             📍 {shops[0]?.name || CURRENT_USER.locationId}
//                         </span>
//                     )}
//                 </div>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={() => setShowBulkUpload(true)}
//                         className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
//                     >
//                         📤 Bulk Upload
//                     </button>
//                     <button
//                         onClick={() => {
//                             setShowAddForm(!showAddForm);
//                             setEditingProduct(null);
//                             setFormData({
//                                 name: '', description: '', barcode: '', sku: '', mrp: '', wholesale: '', retail: '', online: '',
//                                 gst: '18', hsn: '', cess: '0', stock: '0', lowStockAlert: '10', reorderQuantity: '50',
//                                 unit: 'Pcs', weight: '', brand: '', category: 'FMCG', isActive: true
//                             });
//                         }}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
//                     >
//                         + Add Product
//                     </button>
//                 </div>
//             </div>

//             {/* Search and Filter */}
//             <div className="flex gap-4">
//                 <div className="flex-1 relative">
//                     <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                     </svg>
//                     <input
//                         type="text"
//                         placeholder="🔍 Search by name, barcode, or SKU..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                     />
//                 </div>
//                 <select
//                     value={selectedCategory}
//                     onChange={(e) => setSelectedCategory(e.target.value)}
//                     className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
//                 >
//                     {categories.map(cat => (
//                         <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
//                     ))}
//                 </select>
//             </div>

//             {/* Add/Edit Product Form */}
//             {showAddForm && (
//                 <div className="bg-white border border-gray-200 text-gray-700 rounded-xl p-6 shadow-lg">
//                     <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
//                         {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
//                     </h3>
//                     <div className="grid grid-cols-4 gap-4">
//                         {/* Basic Info */}
//                         <div className="col-span-2">
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
//                             <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Maggi Noodles" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Brand</label>
//                             <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Nestle" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
//                             <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
//                                 {categories.filter(c => c !== 'all').map(cat => <option key={cat} value={cat}>{cat}</option>)}
//                             </select>
//                         </div>

//                         {/* Description */}
//                         <div className="col-span-4">
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
//                             <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Product description, features, etc." />
//                         </div>

//                         {/* Barcode & SKU */}
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Barcode</label>
//                             <input type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm" placeholder="Auto-generated" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">SKU (Stock Keeping Unit)</label>
//                             <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., MAG-001" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
//                             <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
//                                 <option value="Pcs">Pieces (Pcs)</option>
//                                 <option value="Kg">Kilogram (Kg)</option>
//                                 <option value="Gm">Gram (Gm)</option>
//                                 <option value="Ltr">Liter (Ltr)</option>
//                                 <option value="Box">Box</option>
//                                 <option value="Packet">Packet</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Weight (kg)</label>
//                             <input type="text" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0.5" />
//                         </div>

//                         {/* 4 Price Types */}
//                         <div className="col-span-4">
//                             <label className="block text-xs font-medium text-gray-700 mb-2">💰 Price Types</label>
//                             <div className="grid grid-cols-4 gap-4">
//                                 <div>
//                                     <label className="block text-xs text-gray-500">MRP (Max Retail Price) *</label>
//                                     <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} className="w-full px-3 py-2 border border-red-300 rounded-lg text-red-700 font-semibold" placeholder="₹" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs text-gray-500">Retail Price (Shop)</label>
//                                     <input type="number" name="retail" value={formData.retail} onChange={handleInputChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-blue-700" placeholder="₹" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs text-gray-500">Wholesale Price (Bulk)</label>
//                                     <input type="number" name="wholesale" value={formData.wholesale} onChange={handleInputChange} className="w-full px-3 py-2 border border-green-300 rounded-lg text-green-700" placeholder="₹" />
//                                 </div>
//                                 <div>
//                                     <label className="block text-xs text-gray-500">Online Price (E-comm)</label>
//                                     <input type="number" name="online" value={formData.online} onChange={handleInputChange} className="w-full px-3 py-2 border border-purple-300 rounded-lg text-purple-700" placeholder="₹" />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* GST & Tax */}
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">GST (%)</label>
//                             <select name="gst" value={formData.gst} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
//                                 <option value="0">0% (Exempt)</option>
//                                 <option value="5">5%</option>
//                                 <option value="12">12%</option>
//                                 <option value="18">18%</option>
//                                 <option value="28">28%</option>
//                             </select>
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">HSN Code</label>
//                             <input type="text" name="hsn" value={formData.hsn} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono" placeholder="6-digit code" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Cess (%)</label>
//                             <input type="text" name="cess" value={formData.cess} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="0" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
//                             <select name="isActive" value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
//                                 <option value="true">Active</option>
//                                 <option value="false">Inactive</option>
//                             </select>
//                         </div>

//                         {/* Inventory Settings */}
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Current Stock</label>
//                             <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Low Stock Alert</label>
//                             <input type="number" name="lowStockAlert" value={formData.lowStockAlert} onChange={handleInputChange} className="w-full px-3 py-2 border border-orange-300 rounded-lg" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-medium text-gray-700 mb-1">Reorder Quantity</label>
//                             <input type="number" name="reorderQuantity" value={formData.reorderQuantity} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
//                         </div>
//                     </div>

//                     <div className="flex justify-end gap-3 mt-6">
//                         <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">Cancel</button>
//                         <button onClick={handleSaveProduct} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Product</button>
//                     </div>
//                 </div>
//             )}

//             {/* Bulk Upload Modal */}
//             {showBulkUpload && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl p-6 w-96">
//                         <h3 className="font-bold text-lg mb-4">📤 Bulk Upload Products</h3>
//                         <p className="text-sm text-gray-600 mb-3">Upload CSV with columns: Name, MRP, Retail, Wholesale, Stock</p>
//                         <input type="file" accept=".csv" onChange={handleBulkUpload} className="w-full mb-4" />
//                         <div className="flex justify-end gap-3">
//                             <button onClick={() => setShowBulkUpload(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Products Table */}
//             <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-gray-50 border-b border-gray-200">
//                             <tr>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barcode/SKU</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Prices (MRP/Retail/Wholesale)</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">GST/HSN</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-100">
//                             {filteredProducts.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="7" className="px-4 py-12 text-center text-gray-400">
//                                         No products found. Click "Add Product" to get started.
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 filteredProducts.map(product => {
//                                     const isLowStock = product.stock <= product.lowStockAlert;
//                                     const isOutOfStock = product.stock === 0;
//                                     return (
//                                         <tr key={product.id} className="hover:bg-gray-50 transition-colors">
//                                             <td className="px-4 py-3">
//                                                 <div>
//                                                     <p className="font-medium text-gray-800">{product.name}</p>
//                                                     <p className="text-xs text-gray-400">{product.brand || 'No brand'} • {product.category}</p>
//                                                     {product.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{product.description}</p>}
//                                                 </div>
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700 block w-fit mb-2">{product.barcode}</code>
//                                                 <div className="relative group w-fit">
//                                                     <img
//                                                         src={`https://barcode.tec-it.com/barcode.ashx?data=${product.barcode}&code=Code128&dpi=96&dataseparator=`}
//                                                         alt="Barcode"
//                                                         className="h-10 object-contain bg-white p-1 border rounded cursor-pointer hover:border-blue-500"
//                                                         onClick={() => printBarcode(product)}
//                                                         title="Click to Print Barcode"
//                                                     />
//                                                     <button
//                                                         onClick={() => printBarcode(product)}
//                                                         className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md flex items-center justify-center"
//                                                         title="Print Barcode Label"
//                                                     >
//                                                         🖨️
//                                                     </button>
//                                                 </div>
//                                                 {product.sku && <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <div className="space-y-0.5 text-sm">
//                                                     <p><span className="text-gray-500">MRP:</span> <span className="text-red-600 font-medium">₹{product.mrp}</span></p>
//                                                     <p><span className="text-gray-500">Retail:</span> <span className="text-blue-600">₹{product.retail || product.mrp}</span></p>
//                                                     <p><span className="text-gray-500">Wholesale:</span> <span className="text-green-600">₹{product.wholesale || product.mrp}</span></p>
//                                                     {product.online && <p><span className="text-gray-500">Online:</span> <span className="text-purple-600">₹{product.online}</span></p>}
//                                                 </div>
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <div className="flex items-center gap-2">
//                                                     <span className={`font-bold text-lg ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-500' : 'text-green-600'}`}>
//                                                         {product.stock}
//                                                     </span>
//                                                     <span className="text-xs text-gray-400">{product.unit}</span>
//                                                     {isLowStock && (
//                                                         <span className={`px-2 py-0.5 text-xs rounded-full ${isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
//                                                             {isOutOfStock ? 'Out of Stock' : 'Low Stock'}
//                                                         </span>
//                                                     )}
//                                                     <button
//                                                         onClick={() => setShowStockAdjust(product)}
//                                                         className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
//                                                     >
//                                                         Adjust
//                                                     </button>
//                                                 </div>

//                                                 {/* Cross-location stock — NetworkStockPanel compact mode */}
//                                                 <div className="mt-2 pt-2 border-t border-gray-50">
//                                                     <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider mb-1">Network Stock</p>
//                                                     <NetworkStockPanel
//                                                         productName={product.name}
//                                                         compact
//                                                         excludeLocationId={selectedShop}
//                                                     />
//                                                 </div>

//                                                 {isLowStock && !isOutOfStock && (
//                                                     <p className="text-xs text-orange-500 mt-1">Alert at {product.lowStockAlert} units</p>
//                                                 )}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <span className="text-sm">{product.gst}%</span>
//                                                 {product.hsn && <p className="text-xs text-gray-400 font-mono">HSN: {product.hsn}</p>}
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <span className={`px-2 py-1 text-xs rounded-full ${product.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
//                                                     {product.isActive !== false ? 'Active' : 'Inactive'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-4 py-3">
//                                                 <div className="flex gap-2">
//                                                     <button onClick={() => handleEditProduct(product)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
//                                                     <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Stock Adjustment Modal */}
//             {showStockAdjust && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl p-6 w-96">
//                         <h3 className="font-bold text-gray-800 text-lg mb-4">Adjust Stock: {showStockAdjust.name}</h3>
//                         <div className="space-y-4">
//                             <div className="flex justify-between text-sm">
//                                 <span className="text-gray-500">Current Stock:</span>
//                                 <span className={`font-bold ${showStockAdjust.stock <= showStockAdjust.lowStockAlert ? 'text-red-600' : 'text-green-600'}`}>
//                                     {showStockAdjust.stock} {showStockAdjust.unit}
//                                 </span>
//                             </div>
//                             <div className="flex justify-between text-sm">
//                                 <span className="text-gray-500">Low Stock Alert:</span>
//                                 <span className="text-orange-600">{showStockAdjust.lowStockAlert} {showStockAdjust.unit}</span>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">New Stock Quantity</label>
//                                 <input type="number" id="newStock" defaultValue={showStockAdjust.stock} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
//                             </div>
//                             <div className="flex justify-end gap-3 pt-4">
//                                 <button onClick={() => setShowStockAdjust(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
//                                 <button onClick={() => handleStockAdjust(showStockAdjust, document.getElementById('newStock').value)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update Stock</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default InventoryTab;
// // TABS/INVENTORY/InventoryTab.jsx
// import React, { useState } from "react";
// import { INVENTORY_ITEMS, STOCK_ADJUSTMENTS } from "../../demoData";

// const InventoryTab = () => {
//     const [activeSection, setActiveSection] = useState("items");
//     const [search, setSearch] = useState("");
//     const [categoryFilter, setCategoryFilter] = useState("all");

//     const categories = ["all", ...new Set(INVENTORY_ITEMS.map(i => i.category))];

//     const filteredItems = INVENTORY_ITEMS.filter(i => {
//         const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.includes(search);
//         const matchCat = categoryFilter === "all" || i.category === categoryFilter;
//         return matchSearch && matchCat;
//     });

//     const lowStockItems = INVENTORY_ITEMS.filter(i => i.stock <= i.minStock);

//     return (
//         <div>
//             {/* Section toggle */}
//             <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
//                 {[
//                     { id: "items", label: "Stock Items" },
//                     { id: "adjustments", label: "Stock Adjustments" },
//                 ].map(s => (
//                     <button
//                         key={s.id}
//                         onClick={() => setActiveSection(s.id)}
//                         className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-all cursor-pointer ${activeSection === s.id
//                             ? "border-blue-500 text-blue-600 bg-blue-50"
//                             : "border-transparent text-gray-500 hover:text-gray-700"
//                             }`}
//                     >
//                         {s.label}
//                         {s.id === "items" && lowStockItems.length > 0 && (
//                             <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">{lowStockItems.length} low</span>
//                         )}
//                     </button>
//                 ))}
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-4 gap-4 mb-6">
//                 {[
//                     { label: "Total Items", value: INVENTORY_ITEMS.length },
//                     { label: "Low Stock", value: lowStockItems.length, color: "text-red-500" },
//                     { label: "Stock Value", value: "₹" + (INVENTORY_ITEMS.reduce((s, i) => s + i.stock * i.sellPrice, 0) / 100000).toFixed(1) + "L" },
//                     { label: "Categories", value: categories.length - 1 },
//                 ].map(s => (
//                     <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//                         <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
//                         <p className={`text-2xl font-semibold ${s.color || "text-gray-800"}`}>{s.value}</p>
//                     </div>
//                 ))}
//             </div>

//             {activeSection === "items" && (
//                 <>
//                     <div className="flex items-center gap-3 mb-4">
//                         <input
//                             type="text"
//                             placeholder="Search by name or SKU..."
//                             value={search}
//                             onChange={e => setSearch(e.target.value)}
//                             className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
//                         />
//                         <select
//                             value={categoryFilter}
//                             onChange={e => setCategoryFilter(e.target.value)}
//                             className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
//                         >
//                             {categories.map(c => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
//                         </select>
//                         <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
//                             + Add Item
//                         </button>
//                     </div>

//                     <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                         <table className="w-full text-sm">
//                             <thead className="bg-gray-50 border-b border-gray-100">
//                                 <tr>
//                                     {["Item", "SKU", "Category", "Unit", "Buy Price", "Sell Price", "Stock", "Min Stock", "Tax", "Status"].map(h => (
//                                         <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {filteredItems.map(i => {
//                                     const isLow = i.stock <= i.minStock;
//                                     return (
//                                         <tr key={i.id} className={`hover:bg-blue-50/40 cursor-pointer transition-colors ${isLow ? "bg-red-50/30" : ""}`}>
//                                             <td className="px-4 py-3">
//                                                 <div className="font-medium text-gray-800">{i.name}</div>
//                                                 <div className="text-xs text-gray-400">{i.id}</div>
//                                             </td>
//                                             <td className="px-4 py-3 font-mono text-xs text-gray-500">{i.sku}</td>
//                                             <td className="px-4 py-3">
//                                                 <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{i.category}</span>
//                                             </td>
//                                             <td className="px-4 py-3 text-gray-500 text-xs">{i.unit}</td>
//                                             <td className="px-4 py-3 text-gray-600">₹{i.buyPrice}</td>
//                                             <td className="px-4 py-3 font-medium text-gray-800">₹{i.sellPrice}</td>
//                                             <td className="px-4 py-3">
//                                                 <span className={`font-semibold ${isLow ? "text-red-500" : "text-gray-800"}`}>{i.stock}</span>
//                                             </td>
//                                             <td className="px-4 py-3 text-gray-400 text-xs">{i.minStock}</td>
//                                             <td className="px-4 py-3 text-gray-500 text-xs">{i.tax}%</td>
//                                             <td className="px-4 py-3">
//                                                 {isLow
//                                                     ? <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">Low stock</span>
//                                                     : <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">OK</span>
//                                                 }
//                                             </td>
//                                         </tr>
//                                     );
//                                 })}
//                             </tbody>
//                         </table>
//                     </div>
//                 </>
//             )}

//             {activeSection === "adjustments" && (
//                 <>
//                     <div className="flex items-center gap-3 mb-4">
//                         <input
//                             type="text"
//                             placeholder="Search adjustments..."
//                             className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
//                         />
//                         <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">
//                             + Add Adjustment
//                         </button>
//                     </div>

//                     <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                         <table className="w-full text-sm">
//                             <thead className="bg-gray-50 border-b border-gray-100">
//                                 <tr>
//                                     {["ID", "Item", "Date", "Type", "Qty Change", "Before", "After", "Reason"].map(h => (
//                                         <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {STOCK_ADJUSTMENTS.map(a => (
//                                     <tr key={a.id} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
//                                         <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.id}</td>
//                                         <td className="px-4 py-3 font-medium text-gray-800">{a.item}</td>
//                                         <td className="px-4 py-3 text-xs text-gray-500">{a.date}</td>
//                                         <td className="px-4 py-3">
//                                             <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.type === "damage" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
//                                                 {a.type}
//                                             </span>
//                                         </td>
//                                         <td className={`px-4 py-3 font-semibold ${a.qty < 0 ? "text-red-500" : "text-green-600"}`}>
//                                             {a.qty > 0 ? "+" : ""}{a.qty}
//                                         </td>
//                                         <td className="px-4 py-3 text-gray-500">{a.before}</td>
//                                         <td className="px-4 py-3 text-gray-800 font-medium">{a.after}</td>
//                                         <td className="px-4 py-3 text-xs text-gray-500">{a.reason}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default InventoryTab;