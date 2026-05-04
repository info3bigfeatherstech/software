// src/Components/TABS/SALES/WholesaleTab.jsx
import React, { useState, useEffect } from 'react';

const STORAGE_KEYS = {
    PRODUCTS: 'vyapar_products',
    BILLS: 'vyapar_bills',
    CUSTOMERS: 'vyapar_customers',
    SHOPS: 'vyapar_shops',
    WHOLESALE_ORDERS: 'vyapar_wholesale_orders'
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

// Initial wholesale customers
const INITIAL_WHOLESALE_CUSTOMERS = [
    { id: 'WH-001', name: 'M/s Sharma Distributors', mobile: '9988776655', gst: '07AAACS1234A1Z', address: 'Sadar Bazaar, Delhi', creditLimit: 500000, outstanding: 125000 },
    { id: 'WH-002', name: 'Gupta Traders', mobile: '9988776644', gst: '07AAACG5678B2Z', address: 'Chandni Chowk, Delhi', creditLimit: 300000, outstanding: 45000 },
    { id: 'WH-003', name: 'Singh Wholesale', mobile: '9988776633', gst: '07AAACS9012C3Z', address: 'Lajpat Nagar, Delhi', creditLimit: 200000, outstanding: 0 },
];

const INITIAL_PRODUCTS = [
    { id: 'PRD-001', name: 'Maggi Noodles', barcode: 'VYP-001', mrp: 14, retail: 13, wholesale: 11.50, gst: 18, stock: 45, lowStockAlert: 20, unit: 'Pcs', shopId: 'SHP-001' },
    { id: 'PRD-002', name: 'Pepsi 500ml', barcode: 'VYP-002', mrp: 45, retail: 40, wholesale: 35, gst: 18, stock: 30, lowStockAlert: 15, unit: 'Bottle', shopId: 'SHP-001' },
    { id: 'PRD-003', name: 'Parle G 500g', barcode: 'VYP-003', mrp: 50, retail: 45, wholesale: 40, gst: 5, stock: 8, lowStockAlert: 20, unit: 'Packet', shopId: 'SHP-001' },
    { id: 'PRD-004', name: 'Amul Butter', barcode: 'VYP-004', mrp: 60, retail: 55, wholesale: 48, gst: 12, stock: 12, lowStockAlert: 15, unit: 'Pcs', shopId: 'SHP-001' },
    { id: 'PRD-005', name: 'Fortune Oil 1L', barcode: 'VYP-005', mrp: 120, retail: 110, wholesale: 98, gst: 5, stock: 25, lowStockAlert: 10, unit: 'Bottle', shopId: 'SHP-001' },
];

const WholesaleTab = () => {
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState('SHP-001');
    const [wholesaleCustomers, setWholesaleCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [cart, setCart] = useState([]);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('new_order'); // new_order, customers, orders
    const [searchTerm, setSearchTerm] = useState('');
    
    // Customer form data
    const [customerForm, setCustomerForm] = useState({
        name: '',
        mobile: '',
        gst: '',
        address: '',
        creditLimit: '',
        outstanding: '0'
    });

    useEffect(() => {
        const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const allShops = getData(STORAGE_KEYS.SHOPS, []);
        const allWholesaleCustomers = getData(STORAGE_KEYS.CUSTOMERS, INITIAL_WHOLESALE_CUSTOMERS);
        const allOrders = getData(STORAGE_KEYS.WHOLESALE_ORDERS, []);
        
        setProducts(allProducts.filter(p => p.shopId === selectedShop));
        setShops(allShops);
        setWholesaleCustomers(allWholesaleCustomers.filter(c => c.id?.startsWith('WH-')));
        setOrders(allOrders);
    }, [selectedShop]);

    // Add to cart with wholesale price
    const addToCart = (product) => {
        const existing = cart.find(c => c.productId === product.id);
        const wholesalePrice = product.wholesale || product.retail * 0.85;
        
        if (existing) {
            setCart(cart.map(c => 
                c.productId === product.id 
                    ? { ...c, quantity: c.quantity + 1, total: (c.quantity + 1) * wholesalePrice }
                    : c
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                quantity: 1,
                price: wholesalePrice,
                mrp: product.mrp,
                gst: product.gst,
                unit: product.unit,
                total: wholesalePrice
            }]);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        const item = cart.find(c => c.productId === productId);
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(cart.map(c => 
            c.productId === productId 
                ? { ...c, quantity: parseInt(newQuantity), total: parseInt(newQuantity) * c.price }
                : c
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(c => c.productId !== productId));
    };

    const calculateSubtotal = () => cart.reduce((sum, c) => sum + c.total, 0);
    const calculateGST = () => cart.reduce((sum, c) => sum + (c.total * c.gst / 100), 0);
    const calculateTotal = () => calculateSubtotal() + calculateGST();

    // Save wholesale order
    const saveWholesaleOrder = () => {
        if (!selectedCustomer) {
            alert('❌ Please select a wholesale customer');
            return;
        }
        if (cart.length === 0) {
            alert('❌ Please add items to order');
            return;
        }

        const allProducts = getData(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        const allCustomers = getData(STORAGE_KEYS.CUSTOMERS, INITIAL_WHOLESALE_CUSTOMERS);
        const allOrders = getData(STORAGE_KEYS.WHOLESALE_ORDERS, []);

        // Update stock
        const updatedProducts = allProducts.map(p => {
            const cartItem = cart.find(c => c.productId === p.id);
            if (cartItem && p.shopId === selectedShop) {
                const newStock = p.stock - cartItem.quantity;
                if (newStock < 0) {
                    alert(`❌ Insufficient stock for ${p.name}`);
                    return p;
                }
                return { ...p, stock: newStock };
            }
            return p;
        });
        saveData(STORAGE_KEYS.PRODUCTS, updatedProducts);

        // Update customer outstanding
        const orderTotal = calculateTotal();
        const updatedCustomers = allCustomers.map(c => 
            c.id === selectedCustomer.id 
                ? { ...c, outstanding: (c.outstanding || 0) + orderTotal }
                : c
        );
        saveData(STORAGE_KEYS.CUSTOMERS, updatedCustomers);

        // Save order
        const newOrder = {
            id: `WO-${Date.now()}`,
            orderNumber: `WH-${Date.now().toString().slice(-8)}`,
            customerId: selectedCustomer.id,
            customerName: selectedCustomer.name,
            shopId: selectedShop,
            date: new Date().toISOString().split('T')[0],
            items: cart.map(c => ({
                productId: c.productId,
                name: c.name,
                quantity: c.quantity,
                price: c.price,
                gst: c.gst,
                total: c.total
            })),
            subtotal: calculateSubtotal(),
            gstAmount: calculateGST(),
            total: orderTotal,
            status: 'pending',
            paymentStatus: 'unpaid'
        };
        
        saveData(STORAGE_KEYS.WHOLESALE_ORDERS, [...allOrders, newOrder]);
        
        // Reset
        setCart([]);
        setSelectedCustomer(null);
        setShowOrderSummary(false);
        setProducts(updatedProducts.filter(p => p.shopId === selectedShop));
        setOrders([...allOrders, newOrder]);
        
        alert(`✅ Wholesale Order Created!\n\nOrder #: ${newOrder.orderNumber}\nCustomer: ${selectedCustomer.name}\nTotal: ₹${orderTotal.toLocaleString()}\n\nStock updated. Order saved.`);
    };

    // Add new wholesale customer
    const addWholesaleCustomer = () => {
        if (!customerForm.name || !customerForm.mobile) {
            alert('❌ Please fill customer name and mobile');
            return;
        }
        
        const allCustomers = getData(STORAGE_KEYS.CUSTOMERS, INITIAL_WHOLESALE_CUSTOMERS);
        const newCustomer = {
            id: `WH-${Date.now()}`,
            ...customerForm,
            outstanding: parseInt(customerForm.outstanding) || 0,
            creditLimit: parseInt(customerForm.creditLimit) || 0,
            createdAt: new Date().toISOString()
        };
        
        saveData(STORAGE_KEYS.CUSTOMERS, [...allCustomers, newCustomer]);
        setWholesaleCustomers([...wholesaleCustomers, newCustomer]);
        setCustomerForm({ name: '', mobile: '', gst: '', address: '', creditLimit: '', outstanding: '0' });
        setShowCustomerForm(false);
        alert('✅ Wholesale customer added successfully!');
    };

    // Update payment status
    const updatePaymentStatus = (orderId, status) => {
        const allOrders = getData(STORAGE_KEYS.WHOLESALE_ORDERS, []);
        const updatedOrders = allOrders.map(o => 
            o.id === orderId ? { ...o, paymentStatus: status, paidAt: status === 'paid' ? new Date().toISOString() : null } : o
        );
        saveData(STORAGE_KEYS.WHOLESALE_ORDERS, updatedOrders);
        setOrders(updatedOrders);
        
        // Update customer outstanding
        const order = updatedOrders.find(o => o.id === orderId);
        if (status === 'paid') {
            const allCustomers = getData(STORAGE_KEYS.CUSTOMERS, INITIAL_WHOLESALE_CUSTOMERS);
            const updatedCustomers = allCustomers.map(c => 
                c.id === order.customerId 
                    ? { ...c, outstanding: Math.max(0, (c.outstanding || 0) - order.total) }
                    : c
            );
            saveData(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
            setWholesaleCustomers(updatedCustomers.filter(c => c.id?.startsWith('WH-')));
        }
        
        alert(`✅ Payment status updated to ${status.toUpperCase()}`);
    };

    // Filter products
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter customers
    const filteredCustomers = wholesaleCustomers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.mobile.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">� wholesale Wholesale Management</h2>
                    <select 
                        value={selectedShop} 
                        onChange={(e) => setSelectedShop(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
                    >
                        {shops.map(shop => (
                            <option key={shop.id} value={shop.id}>{shop.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 border-b border-gray-200">
                <button 
                    onClick={() => { setActiveTab('new_order'); setCart([]); setSelectedCustomer(null); }}
                    className={`px-6 py-2.5 text-sm font-medium transition-all ${activeTab === 'new_order' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    🆕 New Wholesale Order
                </button>
                <button 
                    onClick={() => setActiveTab('customers')}
                    className={`px-6 py-2.5 text-sm font-medium transition-all ${activeTab === 'customers' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    👥 Wholesale Customers
                </button>
                <button 
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-2.5 text-sm font-medium transition-all ${activeTab === 'orders' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    📦 Order History
                </button>
            </div>

            {/* TAB 1: New Wholesale Order */}
            {activeTab === 'new_order' && (
                <div className="grid grid-cols-2 gap-6">
                    {/* Left: Customer Selection + Products */}
                    <div className="space-y-4">
                        {/* Customer Selection */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                    <span className="text-green-600">🏢</span> Select Wholesale Customer
                                </h3>
                                <button 
                                    onClick={() => setShowCustomerForm(true)}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                                >
                                    + New Customer
                                </button>
                            </div>
                            
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search customer by name or mobile..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                                />
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {filteredCustomers.map(customer => (
                                        <div 
                                            key={customer.id}
                                            onClick={() => setSelectedCustomer(customer)}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                                selectedCustomer?.id === customer.id 
                                                    ? 'bg-green-50 border-green-300 shadow-sm' 
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex justify-between">
                                                <p className="font-medium text-gray-800">{customer.name}</p>
                                                <p className="text-sm text-gray-500">{customer.mobile}</p>
                                            </div>
                                            <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                                <span>GST: {customer.gst || 'Not registered'}</span>
                                                <span>Credit Limit: ₹{(customer.creditLimit || 0).toLocaleString()}</span>
                                                <span className={customer.outstanding > (customer.creditLimit * 0.8) ? 'text-red-600' : 'text-orange-600'}>
                                                    Outstanding: ₹{(customer.outstanding || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="text-blue-600">📦</span> Products (Wholesale Price)
                            </h3>
                            <input 
                                type="text" 
                                placeholder="🔍 Search products..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                            />
                            <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock === 0}
                                        className={`text-left p-3 rounded-lg border transition-all ${
                                            product.stock === 0 
                                                ? 'opacity-50 bg-gray-100 cursor-not-allowed' 
                                                : 'hover:bg-green-50 hover:border-green-300 cursor-pointer'
                                        }`}
                                    >
                                        <p className="font-medium text-sm text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">MRP: <span className="line-through text-red-400">₹{product.mrp}</span></p>
                                        <p className="text-sm font-bold text-green-600">Wholesale: ₹{product.wholesale || (product.retail * 0.85).toFixed(2)}</p>
                                        <p className={`text-xs mt-1 ${product.stock <= product.lowStockAlert ? 'text-red-500' : 'text-gray-500'}`}>
                                            Stock: {product.stock} {product.unit}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Cart */}
                    <div className="bg-white text-gray-700 border border-gray-200 rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="text-green-600">🛒</span> Wholesale Order Cart
                        </h3>

                        {selectedCustomer && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm font-medium text-green-800">Selling to: {selectedCustomer.name}</p>
                                <p className="text-xs text-green-600">Credit Available: ₹{((selectedCustomer.creditLimit || 0) - (selectedCustomer.outstanding || 0)).toLocaleString()}</p>
                            </div>
                        )}

                        {/* Cart Items */}
                        <div className="max-h-96 overflow-y-auto mb-4">
                            {cart.length === 0 ? (
                                <div className="text-center text-gray-400 py-12">
                                    <p className="text-4xl mb-2">🛒</p>
                                    <p className="text-sm">No items in order</p>
                                    <p className="text-xs">Select products from the left panel</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Product</th>
                                            <th className="px-3 py-2 text-center">Qty</th>
                                            <th className="px-3 py-2 text-right">Price</th>
                                            <th className="px-3 py-2 text-right">Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map(item => (
                                            <tr key={item.productId} className="border-t">
                                                <td className="px-3 py-2">
                                                    <p className="font-medium text-xs">{item.name}</p>
                                                    <p className="text-xs text-gray-400">GST: {item.gst}%</p>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button 
                                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                            className="w-6 h-6 bg-gray-100 rounded hover:bg-gray-200"
                                                        >-</button>
                                                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                            className="w-6 h-6 bg-gray-100 rounded hover:bg-gray-200"
                                                        >+</button>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-right text-sm">₹{item.price}</td>
                                                <td className="px-3 py-2 text-right font-semibold text-sm">₹{item.total}</td>
                                                <td className="px-3 py-2">
                                                    <button onClick={() => removeFromCart(item.productId)} className="text-red-500 text-xs">✕</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Totals */}
                        {cart.length > 0 && (
                            <>
                                <div className="border-t pt-3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span>₹{calculateSubtotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">GST ({cart.reduce((s, c) => s + (c.gst * c.total / 100), 0).toFixed(0)}%):</span>
                                        <span>₹{calculateGST().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>ORDER TOTAL:</span>
                                        <span className="text-green-600">₹{calculateTotal().toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <button 
                                        onClick={saveWholesaleOrder}
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                                    >
                                        💾 Create Wholesale Order & Deduct Stock
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: Wholesale Customers */}
            {activeTab === 'customers' && (
                <div className="space-y-4">
                    {/* Customer Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                            <p className="text-xs opacity-80">Total Wholesale Customers</p>
                            <p className="text-2xl font-bold">{wholesaleCustomers.length}</p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                            <p className="text-xs opacity-80">Total Outstanding</p>
                            <p className="text-2xl font-bold">₹{wholesaleCustomers.reduce((s, c) => s + (c.outstanding || 0), 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                            <p className="text-xs opacity-80">Total Credit Limit</p>
                            <p className="text-2xl font-bold">₹{wholesaleCustomers.reduce((s, c) => s + (c.creditLimit || 0), 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-800">Wholesale Customer Directory</h3>
                            <button onClick={() => setShowCustomerForm(true)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">+ Add Customer</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Mobile</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">GST</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Credit Limit</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Outstanding</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {wholesaleCustomers.map(customer => {
                                        const creditUsedPercent = ((customer.outstanding || 0) / (customer.creditLimit || 1)) * 100;
                                        return (
                                            <tr key={customer.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-gray-800">{customer.name}</p>
                                                    <p className="text-xs text-gray-400">{customer.address?.slice(0, 30)}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm">{customer.mobile}</td>
                                                <td className="px-6 py-4 text-sm font-mono">{customer.gst || '-'}</td>
                                                <td className="px-6 py-4 text-right font-medium">₹{(customer.creditLimit || 0).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`font-semibold ${(customer.outstanding || 0) > (customer.creditLimit || 0) * 0.8 ? 'text-red-600' : 'text-orange-600'}`}>
                                                        ₹{(customer.outstanding || 0).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-32">
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div className={`h-2 rounded-full ${creditUsedPercent > 80 ? 'bg-red-500' : creditUsedPercent > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{width: `${Math.min(creditUsedPercent, 100)}%`}}></div>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-1">{creditUsedPercent.toFixed(0)}% used</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: Order History */}
            {activeTab === 'orders' && (
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-800">Wholesale Order History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Order #</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Items</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Payment</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.length === 0 ? (
                                        <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400">No wholesale orders yet</td></tr>
                                    ) : (
                                        orders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{order.orderNumber}</code>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">{order.customerName}</td>
                                                <td className="px-6 py-4 text-sm">{order.date}</td>
                                                <td className="px-6 py-4 text-right">{order.items.reduce((s, i) => s + i.quantity, 0)} units</td>
                                                <td className="px-6 py-4 text-right font-bold text-green-600">₹{order.total.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 
                                                        order.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' : 
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {order.paymentStatus !== 'paid' && (
                                                        <button 
                                                            onClick={() => updatePaymentStatus(order.id, 'paid')}
                                                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Customer Modal */}
            {showCustomerForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-96">
                        <h3 className="font-bold text-gray-800 text-lg mb-4">➕ Add Wholesale Customer</h3>
                        <div className="space-y-3">
                            <input type="text" placeholder="Company/Business Name *" value={customerForm.name} onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                            <input type="text" placeholder="Mobile Number *" value={customerForm.mobile} onChange={(e) => setCustomerForm({...customerForm, mobile: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                            <input type="text" placeholder="GST Number" value={customerForm.gst} onChange={(e) => setCustomerForm({...customerForm, gst: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                            <textarea placeholder="Address" value={customerForm.address} onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows="2"></textarea>
                            <input type="number" placeholder="Credit Limit (₹)" value={customerForm.creditLimit} onChange={(e) => setCustomerForm({...customerForm, creditLimit: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowCustomerForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                            <button onClick={addWholesaleCustomer} className="px-4 py-2 bg-green-600 text-white rounded-lg">Add Customer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WholesaleTab;
// // TABS/SALES/WholesaleTab.jsx
// import React, { useState } from "react";
// import { WHOLESALE_ORDERS } from "../../demoData";

// const statusColors = {
//     confirmed: "bg-green-100 text-green-700",
//     processing: "bg-blue-100 text-blue-700",
//     dispatched: "bg-purple-100 text-purple-700",
//     pending: "bg-yellow-100 text-yellow-700",
// };

// const WholesaleTab = () => {
//     const [search, setSearch] = useState("");

//     const filtered = WHOLESALE_ORDERS.filter(o =>
//         o.party.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
//     );

//     const totalAmount = filtered.reduce((s, o) => s + o.amount, 0);

//     return (
//         <div>
//             {/* Stats */}
//             <div className="grid grid-cols-4 gap-4 mb-6">
//                 {[
//                     { label: "Total Orders", value: WHOLESALE_ORDERS.length },
//                     { label: "Total Value", value: "₹" + (WHOLESALE_ORDERS.reduce((s, o) => s + o.amount, 0) / 100000).toFixed(2) + "L" },
//                     { label: "Avg Discount", value: (WHOLESALE_ORDERS.reduce((s, o) => s + o.discount, 0) / WHOLESALE_ORDERS.length).toFixed(1) + "%" },
//                     { label: "Pending Orders", value: WHOLESALE_ORDERS.filter(o => o.status === "pending").length },
//                 ].map(s => (
//                     <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
//                         <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
//                         <p className="text-2xl font-semibold text-gray-800">{s.value}</p>
//                     </div>
//                 ))}
//             </div>

//             {/* Search + actions */}
//             <div className="flex items-center gap-3 mb-4">
//                 <input
//                     type="text"
//                     placeholder="Search by party or order ID..."
//                     value={search}
//                     onChange={e => setSearch(e.target.value)}
//                     className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
//                 />
//                 <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
//                     + New Wholesale Order
//                 </button>
//             </div>

//             {/* Table */}
//             <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
//                 <table className="w-full text-sm">
//                     <thead className="bg-gray-50 border-b border-gray-100">
//                         <tr>
//                             {["Order ID", "Party", "Date", "Items", "Qty", "Discount", "Amount", "Delivery", "Status"].map(h => (
//                                 <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-50">
//                         {filtered.map(o => (
//                             <tr key={o.id} className="hover:bg-blue-50/40 cursor-pointer transition-colors">
//                                 <td className="px-4 py-3 font-mono text-xs text-gray-600">{o.id}</td>
//                                 <td className="px-4 py-3 font-medium text-gray-800">{o.party}</td>
//                                 <td className="px-4 py-3 text-gray-500 text-xs">{o.date}</td>
//                                 <td className="px-4 py-3 text-gray-600 text-center">{o.items}</td>
//                                 <td className="px-4 py-3 text-gray-600 text-center">{o.totalQty}</td>
//                                 <td className="px-4 py-3 text-orange-500 font-medium">{o.discount}%</td>
//                                 <td className="px-4 py-3 font-semibold text-gray-800">₹{o.amount.toLocaleString()}</td>
//                                 <td className="px-4 py-3 text-xs text-gray-500">{o.deliveryDate}</td>
//                                 <td className="px-4 py-3">
//                                     <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[o.status]}`}>
//                                         {o.status}
//                                     </span>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//                 {filtered.length === 0 && (
//                     <div className="py-12 text-center text-gray-400 text-sm">No wholesale orders found</div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default WholesaleTab;