// src/Components/demoData.js
// Complete initial mock data for BizPro system

// ============================================
// PRODUCTS MASTER
// ============================================
export const INITIAL_PRODUCTS = [
    {
        id: 'PRD-001',
        name: 'Maggi Noodles',
        description: '2-minute instant noodles',
        barcode: 'VYP-001-001',
        sku: 'MAG-001',
        mrp: 14,
        retail: 13,
        wholesale: 11.50,
        online: 12.50,
        gst: 18,
        hsn: '19023010',
        cess: 0,
        stock: 45,
        lowStockAlert: 20,
        reorderQuantity: 100,
        unit: 'Pcs',
        weight: 0.07,
        brand: 'Nestle',
        category: 'FMCG',
        shopId: 'SHP-001',
        locationId: 'SHP-001',
        locationType: 'SHOP',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
    },
    {
        id: 'PRD-002',
        name: 'Pepsi 500ml',
        description: 'Cold drink beverage',
        barcode: 'VYP-001-002',
        sku: 'PEP-001',
        mrp: 45,
        retail: 40,
        wholesale: 35,
        online: 38,
        gst: 18,
        hsn: '22021010',
        cess: 12,
        stock: 30,
        lowStockAlert: 15,
        reorderQuantity: 50,
        unit: 'Bottle',
        weight: 0.5,
        brand: 'PepsiCo',
        category: 'Beverages',
        shopId: 'SHP-001',
        locationId: 'SHP-001',
        locationType: 'SHOP',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
    },
    {
        id: 'PRD-003',
        name: 'Parle G 500g',
        description: 'Glucose biscuits',
        barcode: 'VYP-001-003',
        sku: 'PAR-001',
        mrp: 50,
        retail: 45,
        wholesale: 40,
        online: 42,
        gst: 5,
        hsn: '19053100',
        cess: 0,
        stock: 8,
        lowStockAlert: 20,
        reorderQuantity: 100,
        unit: 'Packet',
        weight: 0.5,
        brand: 'Parle',
        category: 'Snacks',
        shopId: 'SHP-001',
        locationId: 'SHP-001',
        locationType: 'SHOP',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
    },
    {
        id: 'PRD-004',
        name: 'Amul Butter',
        description: 'Salted butter 500g',
        barcode: 'VYP-001-004',
        sku: 'AMU-001',
        mrp: 60,
        retail: 55,
        wholesale: 48,
        online: 52,
        gst: 12,
        hsn: '04051000',
        cess: 0,
        stock: 12,
        lowStockAlert: 15,
        reorderQuantity: 50,
        unit: 'Pcs',
        weight: 0.5,
        brand: 'Amul',
        category: 'Dairy',
        shopId: 'SHP-001',
        locationId: 'SHP-001',
        locationType: 'SHOP',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
    },
    {
        id: 'PRD-005',
        name: 'Fortune Oil 1L',
        description: 'Sunflower refined oil',
        barcode: 'VYP-001-005',
        sku: 'FOR-001',
        mrp: 120,
        retail: 110,
        wholesale: 98,
        online: 105,
        gst: 5,
        hsn: '15121910',
        cess: 0,
        stock: 25,
        lowStockAlert: 10,
        reorderQuantity: 40,
        unit: 'Bottle',
        weight: 1,
        brand: 'Adani Wilmar',
        category: 'Grocery',
        shopId: 'SHP-001',
        locationId: 'SHP-001',
        locationType: 'SHOP',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
    },
    // Products for Shop 2 (Connaught Place)
    {
        id: 'PRD-006',
        name: 'Maggi Noodles',
        description: '2-minute instant noodles',
        barcode: 'VYP-002-001',
        sku: 'MAG-002',
        mrp: 14,
        retail: 14,
        wholesale: 11.50,
        online: 12.50,
        gst: 18,
        hsn: '19023010',
        cess: 0,
        stock: 30,
        lowStockAlert: 20,
        reorderQuantity: 100,
        unit: 'Pcs',
        weight: 0.07,
        brand: 'Nestle',
        category: 'FMCG',
        shopId: 'SHP-002',
        locationId: 'SHP-002',
        locationType: 'SHOP',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
    },
    {
        id: 'PRD-007',
        name: 'Pepsi 500ml',
        description: 'Cold drink beverage',
        barcode: 'VYP-002-002',
        sku: 'PEP-002',
        mrp: 45,
        retail: 42,
        wholesale: 35,
        online: 38,
        gst: 18,
        hsn: '22021010',
        cess: 12,
        stock: 20,
        lowStockAlert: 15,
        reorderQuantity: 50,
        unit: 'Bottle',
        weight: 0.5,
        brand: 'PepsiCo',
        category: 'Beverages',
        shopId: 'SHP-002',
        locationId: 'SHP-002',
        locationType: 'SHOP',
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
    },
    // Products for Warehouse 1 (Delhi Main Warehouse)
    {
        id: 'PRD-008',
        name: 'iPhone 15 Case (Batch A)',
        description: 'Premium silicon case',
        barcode: 'VYP-WH1-001',
        sku: 'IPH-CASE-15',
        mrp: 999,
        retail: 499,
        wholesale: 200,
        online: 450,
        gst: 18,
        hsn: '39269099',
        cess: 0,
        stock: 500,
        lowStockAlert: 100,
        reorderQuantity: 1000,
        unit: 'Pcs',
        weight: 0.05,
        brand: 'Generic',
        category: 'Accessories',
        shopId: 'WH-001',
        locationId: 'WH-001',
        locationType: 'WAREHOUSE',
        isActive: true,
        createdAt: '2024-05-01',
        updatedAt: '2024-05-01'
    },
    // Products for Warehouse 2 (Gurgaon Warehouse)
    {
        id: 'PRD-009',
        name: 'Samsung Galaxy S24 Cover',
        description: 'Hard shell protective cover',
        barcode: 'VYP-WH2-001',
        sku: 'SAM-COVER-S24',
        mrp: 799,
        retail: 399,
        wholesale: 180,
        online: 350,
        gst: 18,
        hsn: '39269099',
        cess: 0,
        stock: 320,
        lowStockAlert: 80,
        reorderQuantity: 500,
        unit: 'Pcs',
        weight: 0.04,
        brand: 'Generic',
        category: 'Accessories',
        shopId: 'WH-002',
        locationId: 'WH-002',
        locationType: 'WAREHOUSE',
        isActive: true,
        createdAt: '2024-05-01',
        updatedAt: '2024-05-01'
    },
    {
        id: 'PRD-010',
        name: 'USB-C Fast Charger 65W',
        description: 'GaN charger, universal compatibility',
        barcode: 'VYP-WH2-002',
        sku: 'USB-CHR-65W',
        mrp: 1499,
        retail: 999,
        wholesale: 650,
        online: 899,
        gst: 18,
        hsn: '85044010',
        cess: 0,
        stock: 210,
        lowStockAlert: 50,
        reorderQuantity: 200,
        unit: 'Pcs',
        weight: 0.15,
        brand: 'Baseus',
        category: 'Electronics',
        shopId: 'WH-002',
        locationId: 'WH-002',
        locationType: 'WAREHOUSE',
        isActive: true,
        createdAt: '2024-05-02',
        updatedAt: '2024-05-02'
    },
    {
        id: 'PRD-011',
        name: 'Wireless Earbuds TWS',
        description: 'Bluetooth 5.3, 30hr battery',
        barcode: 'VYP-WH2-003',
        sku: 'TWS-EAR-001',
        mrp: 2499,
        retail: 1499,
        wholesale: 950,
        online: 1299,
        gst: 18,
        hsn: '85183000',
        cess: 0,
        stock: 12,
        lowStockAlert: 30,
        reorderQuantity: 100,
        unit: 'Pcs',
        weight: 0.08,
        brand: 'boAt',
        category: 'Electronics',
        shopId: 'WH-002',
        locationId: 'WH-002',
        locationType: 'WAREHOUSE',
        isActive: true,
        createdAt: '2024-05-02',
        updatedAt: '2024-05-02'
    }
];

// ============================================
// VENDORS (Suppliers)
// ============================================
export const INITIAL_VENDORS = [
    {
        id: 'VND-001',
        name: 'Nestle India Ltd.',
        gst: '07AAACN1234A1Z',
        phone: '9876543210',
        email: 'orders@nestle.com',
        city: 'Delhi',
        address: 'Nestle House, Delhi',
        contactPerson: 'Rajesh Sharma',
        isActive: true
    },
    {
        id: 'VND-002',
        name: 'PepsiCo India',
        gst: '07AAACP5678B2Z',
        phone: '9876543211',
        email: 'sales@pepsico.com',
        city: 'Gurgaon',
        address: 'PepsiCo Park, Gurgaon',
        contactPerson: 'Amit Verma',
        isActive: true
    },
    {
        id: 'VND-003',
        name: 'Parle Products',
        gst: '07AAAPP9012C3Z',
        phone: '9876543212',
        email: 'orders@parle.com',
        city: 'Mumbai',
        address: 'Parle House, Mumbai',
        contactPerson: 'Sneha Mehta',
        isActive: true
    },
    {
        id: 'VND-004',
        name: 'Amul Dairy',
        gst: '07AAAAM3456D4Z',
        phone: '9876543213',
        email: 'sales@amul.com',
        city: 'Anand',
        address: 'Amul Dairy Complex',
        contactPerson: 'Sunil Patel',
        isActive: true
    },
    {
        id: 'VND-005',
        name: 'Adani Wilmar',
        gst: '07AAAAW7890E5Z',
        phone: '9876543214',
        email: 'fortune@adani.com',
        city: 'Ahmedabad',
        address: 'Adani House, Ahmedabad',
        contactPerson: 'Vikram Singh',
        isActive: true
    }
];

// ============================================
// SHOPS / SALES OFFICES
// ============================================
export const INITIAL_SHOPS = [
    {
        id: 'SHP-001',
        name: 'Karol Bagh Store',
        city: 'Delhi',
        address: 'Main Market, Karol Bagh, Delhi-110005',
        phone: '011-23567890',
        gstNumbers: ['07AAACS1234A1Z', '07AAACS5678B2Z'],
        bankAccounts: [
            { bank: 'SBI', accountNo: '12345678901', ifsc: 'SBIN0001234' },
            { bank: 'HDFC', accountNo: '98765432109', ifsc: 'HDFC0005678' }
        ],
        manager: 'Ramesh Gupta',
        isActive: true
    },
    {
        id: 'SHP-002',
        name: 'Connaught Place Store',
        city: 'Delhi',
        address: 'Block A, Connaught Place, Delhi-110001',
        phone: '011-23456789',
        gstNumbers: ['07AAACP9012C3Z'],
        bankAccounts: [
            { bank: 'ICICI', accountNo: '45678901234', ifsc: 'ICIC0001234' }
        ],
        manager: 'Priya Singh',
        isActive: true
    },
    {
        id: 'SHP-003',
        name: 'Rajouri Garden Store',
        city: 'Delhi',
        address: 'J Block Market, Rajouri Garden, Delhi-110027',
        phone: '011-25478901',
        gstNumbers: ['07AAACR3456D4Z'],
        bankAccounts: [
            { bank: 'Axis', accountNo: '78901234567', ifsc: 'UTIB0001234' }
        ],
        manager: 'Vikram Sharma',
        isActive: true
    }
];

// ============================================
// PURCHASE HISTORY
// ============================================
export const INITIAL_PURCHASES = [
    {
        id: 'PUR-001',
        vendorId: 'VND-001',
        vendorBillNo: 'INV-2024-001',
        shopId: 'SHP-001',
        date: '2024-01-15',
        items: [
            { productId: 'PRD-001', quantity: 100, cost: 10, total: 1000 }
        ],
        total: 1000,
        status: 'completed'
    },
    {
        id: 'PUR-002',
        vendorId: 'VND-002',
        vendorBillNo: 'INV-2024-002',
        shopId: 'SHP-001',
        date: '2024-01-20',
        items: [
            { productId: 'PRD-002', quantity: 50, cost: 30, total: 1500 }
        ],
        total: 1500,
        status: 'completed'
    },
    {
        id: 'PUR-003',
        vendorId: 'VND-003',
        vendorBillNo: 'INV-2024-003',
        shopId: 'SHP-002',
        date: '2024-01-25',
        items: [
            { productId: 'PRD-006', quantity: 100, cost: 10, total: 1000 }
        ],
        total: 1000,
        status: 'completed'
    }
];

// ============================================
// BILLS / INVOICES (Sales)
// ============================================
export const INITIAL_BILLS = [
    {
        id: 'BILL-001',
        billNumber: 'INV-2024-001',
        shopId: 'SHP-001',
        customerMobile: '9876543210',
        customerName: 'Rajesh Kumar',
        subtotal: 96,
        gstAmount: 17.28,
        total: 113.28,
        originalTotal: 113.28,
        creditApplied: 0,
        paymentMethod: 'cash',
        date: '2024-01-15',
        time: '10:30 AM',
        items: [
            { productId: 'PRD-001', name: 'Maggi Noodles', qty: 2, price: 13, gst: 18, total: 26 },
            { productId: 'PRD-002', name: 'Pepsi 500ml', qty: 1, price: 40, gst: 18, total: 40 },
            { productId: 'PRD-003', name: 'Parle G 500g', qty: 3, price: 10, gst: 5, total: 30 }
        ]
    },
    {
        id: 'BILL-002',
        billNumber: 'INV-2024-002',
        shopId: 'SHP-001',
        customerMobile: '9876543211',
        customerName: 'Sneha Singh',
        subtotal: 150,
        gstAmount: 27,
        total: 177,
        originalTotal: 177,
        creditApplied: 0,
        paymentMethod: 'upi',
        date: '2024-01-16',
        time: '02:15 PM',
        items: [
            { productId: 'PRD-004', name: 'Amul Butter', qty: 2, price: 55, gst: 12, total: 110 },
            { productId: 'PRD-005', name: 'Fortune Oil 1L', qty: 1, price: 110, gst: 5, total: 110 }
        ]
    },
    {
        id: 'BILL-003',
        billNumber: 'INV-2024-003',
        shopId: 'SHP-002',
        customerMobile: '9876543212',
        customerName: 'Amit Verma',
        subtotal: 56,
        gstAmount: 10.08,
        total: 66.08,
        originalTotal: 66.08,
        creditApplied: 0,
        paymentMethod: 'card',
        date: '2024-01-17',
        time: '11:45 AM',
        items: [
            { productId: 'PRD-006', name: 'Maggi Noodles', qty: 4, price: 14, gst: 18, total: 56 }
        ]
    }
];

// ============================================
// CREDIT NOTES (NEW - Returns)
// ============================================
export const INITIAL_CREDIT_NOTES = [
    // Example 1: Active credit note
    {
        id: 'CN-001',
        originalBillId: 'BILL-001',
        shopId: 'SHP-001',
        customerMobile: '9876543210',
        customerName: 'Rajesh Kumar',
        amount: 26.00,
        items: [
            { productId: 'PRD-001', name: 'Maggi Noodles', qty: 2, price: 13, total: 26 }
        ],
        redeemed: false,
        redeemedAt: null,
        redeemedAtShop: null,
        redeemedAtBill: null,
        createdAt: '2024-01-20',
        reason: 'Expired product',
        photoUrl: null
    },
    // Example 2: Another active credit note
    {
        id: 'CN-002',
        originalBillId: 'BILL-002',
        shopId: 'SHP-001',
        customerMobile: '9876543211',
        customerName: 'Sneha Singh',
        amount: 55.00,
        items: [
            { productId: 'PRD-004', name: 'Amul Butter', qty: 1, price: 55, total: 55 }
        ],
        redeemed: false,
        redeemedAt: null,
        redeemedAtShop: null,
        redeemedAtBill: null,
        createdAt: '2024-01-21',
        reason: 'Customer changed mind',
        photoUrl: null
    },
    // Example 3: Already redeemed credit note
    {
        id: 'CN-003',
        originalBillId: 'BILL-003',
        shopId: 'SHP-002',
        customerMobile: '9876543212',
        customerName: 'Amit Verma',
        amount: 56.00,
        items: [
            { productId: 'PRD-006', name: 'Maggi Noodles', qty: 4, price: 14, total: 56 }
        ],
        redeemed: true,
        redeemedAt: '2024-01-25',
        redeemedAtShop: 'SHP-001',
        redeemedAtBill: 'BILL-005',
        createdAt: '2024-01-22',
        reason: 'Damaged packaging',
        photoUrl: null
    }
];

// ============================================
// CUSTOMERS
// ============================================
export const INITIAL_CUSTOMERS = [
    {
        id: 'CUST-001',
        name: 'Rajesh Kumar',
        mobile: '9876543210',
        totalPurchases: 2500,
        lastPurchase: '2024-01-15',
        address: 'Green Park, Delhi',
        createdAt: '2024-01-01'
    },
    {
        id: 'CUST-002',
        name: 'Sneha Singh',
        mobile: '9876543211',
        totalPurchases: 1800,
        lastPurchase: '2024-01-16',
        address: 'Model Town, Delhi',
        createdAt: '2024-01-02'
    },
    {
        id: 'CUST-003',
        name: 'Amit Verma',
        mobile: '9876543212',
        totalPurchases: 3200,
        lastPurchase: '2024-01-17',
        address: 'Rohini, Delhi',
        createdAt: '2024-01-03'
    },
    // Wholesale Customers
    {
        id: 'WH-001',
        name: 'M/s Sharma Distributors',
        mobile: '9988776655',
        gst: '07AAACS1234A1Z',
        address: 'Sadar Bazaar, Delhi',
        creditLimit: 500000,
        outstanding: 125000,
        totalPurchases: 450000,
        lastPurchase: '2024-01-15',
        type: 'wholesale'
    },
    {
        id: 'WH-002',
        name: 'Gupta Traders',
        mobile: '9988776644',
        gst: '07AAACG5678B2Z',
        address: 'Chandni Chowk, Delhi',
        creditLimit: 300000,
        outstanding: 45000,
        totalPurchases: 255000,
        lastPurchase: '2024-01-14',
        type: 'wholesale'
    },
    {
        id: 'WH-003',
        name: 'Singh Wholesale',
        mobile: '9988776633',
        gst: '07AAACS9012C3Z',
        address: 'Lajpat Nagar, Delhi',
        creditLimit: 200000,
        outstanding: 0,
        totalPurchases: 120000,
        lastPurchase: '2024-01-10',
        type: 'wholesale'
    }
];

// ============================================
// TRANSFERS (Stock Movement)
// ============================================
export const INITIAL_TRANSFERS = [
    {
        id: 'TR-001',
        transferNumber: 'TRF-2024-001',
        shopId: 'SHP-001',
        fromShopId: 'SHP-001',
        toShopId: 'SHP-002',
        items: [
            { productId: 'PRD-001', name: 'Maggi Noodles', quantity: 20, unit: 'Pcs' }
        ],
        status: 'completed',
        requestedBy: 'Ramesh Gupta',
        approvedBy: 'Super Admin',
        createdAt: '2024-01-10',
        completedAt: '2024-01-10',
        reason: 'Shop B running low'
    },
    {
        id: 'TR-002',
        transferNumber: 'TRF-2024-002',
        shopId: 'SHP-002',
        fromShopId: 'SHP-002',
        toShopId: 'SHP-003',
        items: [
            { productId: 'PRD-006', name: 'Maggi Noodles', quantity: 15, unit: 'Pcs' }
        ],
        status: 'pending',
        requestedBy: 'Priya Singh',
        approvedBy: null,
        createdAt: '2024-01-18',
        completedAt: null,
        reason: 'Stock redistribution'
    }
];

// ============================================
// WHOLESALE ORDERS
// ============================================
export const INITIAL_WHOLESALE_ORDERS = [
    {
        id: 'WO-001',
        orderNumber: 'WH-2024-001',
        customerId: 'WH-001',
        customerName: 'M/s Sharma Distributors',
        shopId: 'SHP-001',
        date: '2024-01-10',
        items: [
            { productId: 'PRD-001', name: 'Maggi Noodles', quantity: 500, price: 11.50, gst: 18, total: 5750 },
            { productId: 'PRD-002', name: 'Pepsi 500ml', quantity: 200, price: 35, gst: 18, total: 7000 }
        ],
        subtotal: 12750,
        gstAmount: 2295,
        total: 15045,
        status: 'completed',
        paymentStatus: 'unpaid'
    },
    {
        id: 'WO-002',
        orderNumber: 'WH-2024-002',
        customerId: 'WH-002',
        customerName: 'Gupta Traders',
        shopId: 'SHP-001',
        date: '2024-01-15',
        items: [
            { productId: 'PRD-003', name: 'Parle G 500g', quantity: 300, price: 40, gst: 5, total: 12000 },
            { productId: 'PRD-005', name: 'Fortune Oil 1L', quantity: 100, price: 98, gst: 5, total: 9800 }
        ],
        subtotal: 21800,
        gstAmount: 1090,
        total: 22890,
        status: 'completed',
        paymentStatus: 'paid'
    }
];

// ============================================
// DASHBOARD STATS (Computed or mock)
// ============================================
export const DASHBOARD_STATS = {
    totalSalesToday: 15250,
    totalSalesMonth: 452000,
    profitMonth: 140120,
    activeCustomers: 156,
    totalCustomers: 234,
    totalSuppliers: 38,
    lowStockItems: 4
};

export const MONTHLY_SALES = [
    { month: 'Jan', sales: 125000 },
    { month: 'Feb', sales: 135000 },
    { month: 'Mar', sales: 142000 },
    { month: 'Apr', sales: 152000 }
];

export const SALES_INVOICES = [
    { id: 'INV-001', customer: 'Rajesh Kumar', date: '2024-01-15', amount: 113.28, paid: 113.28, status: 'paid' },
    { id: 'INV-002', customer: 'Sneha Singh', date: '2024-01-16', amount: 177.00, paid: 100.00, status: 'partial' },
    { id: 'INV-003', customer: 'Amit Verma', date: '2024-01-17', amount: 66.08, paid: 0, status: 'unpaid' },
    { id: 'INV-004', customer: 'M/s Sharma Distributors', date: '2024-01-10', amount: 15045, paid: 0, status: 'overdue' },
    { id: 'INV-005', customer: 'Gupta Traders', date: '2024-01-15', amount: 22890, paid: 22890, status: 'paid' }
];

export const INVENTORY_ITEMS = [
    { id: 'PRD-001', name: 'Maggi Noodles', sku: 'MAG-001', stock: 45, minStock: 20 },
    { id: 'PRD-002', name: 'Pepsi 500ml', sku: 'PEP-001', stock: 30, minStock: 15 },
    { id: 'PRD-003', name: 'Parle G 500g', sku: 'PAR-001', stock: 8, minStock: 20 },
    { id: 'PRD-004', name: 'Amul Butter', sku: 'AMU-001', stock: 12, minStock: 15 }
];

// ============================================
// USERS (For role-based access)
// ============================================
export const INITIAL_USERS = [
    {
        id: 'USR-001',
        name: 'Super Admin',
        email: 'admin@vyapar.com',
        phone: '9999999999',
        role: 'SUPER_ADMIN',
        shopId: null,
        warehouseId: null,
        isActive: true,
        createdAt: '2024-01-01'
    },
    {
        id: 'USR-002',
        name: 'Ramesh Gupta',
        email: 'ramesh@karolbagh.com',
        phone: '8888888888',
        role: 'SHOP_OWNER',
        shopId: 'SHP-001',
        warehouseId: null,
        isActive: true,
        createdAt: '2024-01-01'
    },
    {
        id: 'USR-003',
        name: 'Priya Singh',
        email: 'priya@cp.com',
        phone: '7777777777',
        role: 'SHOP_OWNER',
        shopId: 'SHP-002',
        warehouseId: null,
        isActive: true,
        createdAt: '2024-01-01'
    },
    {
        id: 'USR-004',
        name: 'Billing Staff Karol Bagh',
        email: 'billing@karolbagh.com',
        phone: '6666666666',
        role: 'BILLING_STAFF',
        shopId: 'SHP-001',
        warehouseId: null,
        isActive: true,
        createdAt: '2024-01-01'
    }
];

// ============================================
// WAREHOUSES (For warehouse management)
// ============================================
export const INITIAL_WAREHOUSES = [
    {
        id: 'WH-001',
        name: 'Delhi Main Warehouse',
        city: 'Delhi',
        address: 'Okhla Industrial Area, Delhi',
        manager: 'Vikram Singh',
        rooms: ['Ground Floor', 'First Floor', 'Cold Storage'],
        racks: ['A1-A10', 'B1-B10', 'C1-C10'],
        isActive: true
    },
    {
        id: 'WH-002',
        name: 'Gurgaon Warehouse',
        city: 'Gurgaon',
        address: 'Udyog Vihar, Gurgaon',
        manager: 'Rajesh Nair',
        rooms: ['Section A', 'Section B'],
        racks: ['R1-R5', 'R6-R10'],
        isActive: true
    }
];

// ============================================
// STOCK LEDGER (For all stock movements)
// ============================================
export const INITIAL_STOCK_LEDGER = [
    {
        id: 'LEDGER-001',
        productId: 'PRD-001',
        movementType: 'PURCHASE',
        fromLocation: null,
        toLocation: 'SHP-001',
        quantity: 100,
        batchNumber: 'BATCH-001',
        createdAt: '2024-01-15',
        referenceId: 'PUR-001'
    },
    {
        id: 'LEDGER-002',
        productId: 'PRD-001',
        movementType: 'SALE',
        fromLocation: 'SHP-001',
        toLocation: null,
        quantity: 2,
        createdAt: '2024-01-15',
        referenceId: 'BILL-001'
    },
    {
        id: 'LEDGER-003',
        productId: 'PRD-001',
        movementType: 'TRANSFER',
        fromLocation: 'SHP-001',
        toLocation: 'SHP-002',
        quantity: 20,
        createdAt: '2024-01-10',
        referenceId: 'TR-001'
    }
];
export const GST_SUMMARY = {
    period: "April 2025",
    salesTaxCollected: { "5%": 8200, "12%": 15400, "18%": 21800, "28%": 6900 },
    purchaseTaxPaid: { "5%": 5100, "12%": 9800, "18%": 13400, "28%": 4200 },
    itcAvailable: 32500,
    gstPayable: 19800,
};

export const CATEGORY_SALES = [
    { category: "Grains", amount: 68000, percent: 24 },
    { category: "Beverages", amount: 54000, percent: 19 },
    { category: "Dairy", amount: 42000, percent: 15 },
    { category: "Snacks", amount: 38000, percent: 14 },
    { category: "Oils", amount: 31000, percent: 11 },
    { category: "Spices", amount: 25000, percent: 9 },
    { category: "Others", amount: 20000, percent: 7 },
];

export const PROFIT_LOSS = {
    revenue: 278000,
    cogs: 168000,
    grossProfit: 110000,
    expenses: [
        { label: "Staff salary", amount: 12000 },
        { label: "Rent", amount: 8000 },
        { label: "Electricity", amount: 2400 },
        { label: "Transport", amount: 4200 },
        { label: "Misc", amount: 1800 },
    ],
    totalExpenses: 28400,
    netProfit: 81600,
};

// export const GST_SUMMARY = {
//     period: "April 2025",
//     salesTaxCollected: { "5%": 8200, "12%": 15400, "18%": 21800, "28%": 6900 },
//     purchaseTaxPaid: { "5%": 5100, "12%": 9800, "18%": 13400, "28%": 4200 },
//     itcAvailable: 32500,
//     gstPayable: 19800,
// };


// export const INVENTORY_ITEMS = [
//     { id: "ITM-001", name: "Basmati Rice 5kg", category: "Grains", sku: "GRN-001", unit: "Bag", buyPrice: 280, sellPrice: 340, stock: 145, minStock: 50, tax: 5 },
//     { id: "ITM-002", name: "Toor Dal 1kg", category: "Pulses", sku: "PLS-001", unit: "Packet", buyPrice: 95, sellPrice: 120, stock: 320, minStock: 100, tax: 5 },
//     { id: "ITM-003", name: "Sunflower Oil 1L", category: "Oils", sku: "OIL-001", unit: "Bottle", buyPrice: 140, sellPrice: 175, stock: 88, minStock: 40, tax: 12 },
//     { id: "ITM-004", name: "Surf Excel 500g", category: "Detergent", sku: "DET-001", unit: "Pack", buyPrice: 95, sellPrice: 118, stock: 12, minStock: 30, tax: 18 },
//     { id: "ITM-005", name: "Amul Butter 500g", category: "Dairy", sku: "DRY-001", unit: "Pack", buyPrice: 230, sellPrice: 270, stock: 54, minStock: 25, tax: 12 },
//     { id: "ITM-006", name: "Coca-Cola 2L", category: "Beverages", sku: "BEV-001", unit: "Bottle", buyPrice: 65, sellPrice: 85, stock: 200, minStock: 80, tax: 28 },
//     { id: "ITM-007", name: "Red Chilli Powder 200g", category: "Spices", sku: "SPC-001", unit: "Packet", buyPrice: 55, sellPrice: 72, stock: 175, minStock: 60, tax: 5 },
//     { id: "ITM-008", name: "Colgate Toothpaste 150g", category: "Personal", sku: "PER-001", unit: "Piece", buyPrice: 72, sellPrice: 92, stock: 8, minStock: 30, tax: 18 },
//     { id: "ITM-009", name: "Bournvita 1kg", category: "Beverages", sku: "BEV-002", unit: "Tin", buyPrice: 380, sellPrice: 450, stock: 42, minStock: 20, tax: 18 },
//     { id: "ITM-010", name: "Haldiram Mixture 400g", category: "Snacks", sku: "SNK-001", unit: "Pack", buyPrice: 88, sellPrice: 110, stock: 96, minStock: 40, tax: 12 },
//     { id: "ITM-011", name: "Dettol Soap 75g", category: "Personal", sku: "PER-002", unit: "Piece", buyPrice: 38, sellPrice: 50, stock: 230, minStock: 80, tax: 18 },
//     { id: "ITM-012", name: "Parle-G 800g", category: "Snacks", sku: "SNK-002", unit: "Pack", buyPrice: 52, sellPrice: 68, stock: 310, minStock: 100, tax: 12 },
// ];




// export const SALES_INVOICES = [
//     { id: "INV-2025-001", customer: "Ravi Sharma", customerId: "C001", date: "2025-04-18", dueDate: "2025-05-18", amount: 18500, paid: 18500, status: "paid", items: 4, paymentMode: "UPI" },
//     { id: "INV-2025-002", customer: "Global Mart", customerId: "C007", date: "2025-04-22", dueDate: "2025-05-22", amount: 72000, paid: 0, status: "unpaid", items: 12, paymentMode: null },
//     { id: "INV-2025-003", customer: "Suresh Traders", customerId: "C003", date: "2025-04-10", dueDate: "2025-04-25", amount: 45000, paid: 0, status: "overdue", items: 8, paymentMode: null },
//     { id: "INV-2025-004", customer: "Kewal & Sons", customerId: "C005", date: "2025-04-15", dueDate: "2025-05-15", amount: 31000, paid: 15000, status: "partial", items: 6, paymentMode: "Bank Transfer" },
//     { id: "INV-2025-005", customer: "Priya Mehta", customerId: "C002", date: "2025-04-20", dueDate: "2025-05-20", amount: 9400, paid: 9400, status: "paid", items: 3, paymentMode: "Cash" },
//     { id: "INV-2025-006", customer: "Nexus Wholesale", customerId: "C009", date: "2025-04-21", dueDate: "2025-05-21", amount: 110000, paid: 0, status: "unpaid", items: 20, paymentMode: null },
//     { id: "INV-2025-007", customer: "Anita Verma", customerId: "C006", date: "2025-04-12", dueDate: "2025-05-12", amount: 8500, paid: 0, status: "unpaid", items: 2, paymentMode: null },
//     { id: "INV-2025-008", customer: "Pooja Kirana", customerId: "C010", date: "2025-04-17", dueDate: "2025-05-17", amount: 3200, paid: 3200, status: "paid", items: 1, paymentMode: "UPI" }
// ];
// ── REPORTS / ANALYTICS DATA ──────────────────────────────────────────────────
// export const MONTHLY_SALES = [
//     { month: "Nov", sales: 210000, purchase: 155000, profit: 55000 },
//     { month: "Dec", sales: 285000, purchase: 198000, profit: 87000 },
//     { month: "Jan", sales: 198000, purchase: 145000, profit: 53000 },
//     { month: "Feb", sales: 230000, purchase: 168000, profit: 62000 },
//     { month: "Mar", sales: 312000, purchase: 220000, profit: 92000 },
//     { month: "Apr", sales: 278000, purchase: 192000, profit: 86000 },
// ];


// // ─────────────────────────────────────────────────────────────────────────────
// // demoData.js — Single source of truth for all fake/demo data
// // Replace individual arrays with real API calls later — nothing else changes.
// // ─────────────────────────────────────────────────────────────────────────────

// // ── CUSTOMERS ────────────────────────────────────────────────────────────────
// export const CUSTOMERS = [
//     { id: "C001", name: "Ravi Sharma", phone: "9876543210", city: "Delhi", email: "ravi@email.com", totalBusiness: 148500, outstanding: 12000, lastPurchase: "2025-04-18", status: "active", gstin: "07AABCS1429B1ZB" },
//     { id: "C002", name: "Priya Mehta", phone: "9812345678", city: "Mumbai", email: "priya@email.com", totalBusiness: 92400, outstanding: 0, lastPurchase: "2025-04-20", status: "active", gstin: "27AADCM2134N1ZK" },
//     { id: "C003", name: "Suresh Traders", phone: "9901234567", city: "Bangalore", email: "suresh@email.com", totalBusiness: 310000, outstanding: 45000, lastPurchase: "2025-04-10", status: "active", gstin: "29AAECS6754R1ZP" },
//     { id: "C004", name: "Fatima Noor", phone: "9823456789", city: "Hyderabad", email: "fatima@email.com", totalBusiness: 67000, outstanding: 0, lastPurchase: "2025-03-28", status: "inactive", gstin: null },
//     { id: "C005", name: "Kewal & Sons", phone: "9756432100", city: "Jaipur", email: "kewal@email.com", totalBusiness: 214000, outstanding: 31000, lastPurchase: "2025-04-15", status: "active", gstin: "08AACCK4521B1ZM" },
//     { id: "C006", name: "Anita Verma", phone: "9644321098", city: "Pune", email: "anita@email.com", totalBusiness: 55000, outstanding: 8500, lastPurchase: "2025-04-12", status: "active", gstin: null },
//     { id: "C007", name: "Global Mart", phone: "9700123456", city: "Chennai", email: "global@email.com", totalBusiness: 498000, outstanding: 72000, lastPurchase: "2025-04-22", status: "active", gstin: "33AABCG1234D1ZA" },
//     { id: "C008", name: "Deepak Retailers", phone: "9888234567", city: "Lucknow", email: "deepak@email.com", totalBusiness: 39000, outstanding: 0, lastPurchase: "2025-04-01", status: "inactive", gstin: null },
//     { id: "C009", name: "Nexus Wholesale", phone: "9911223344", city: "Ahmedabad", email: "nexus@email.com", totalBusiness: 725000, outstanding: 110000, lastPurchase: "2025-04-21", status: "active", gstin: "24AACCN5678G1ZQ" },
//     { id: "C010", name: "Pooja Kirana", phone: "9845098450", city: "Nagpur", email: "pooja@email.com", totalBusiness: 28000, outstanding: 3200, lastPurchase: "2025-04-17", status: "active", gstin: null },
// ];

// // ── SALES INVOICES ────────────────────────────────────────────────────────────
// export const SALES_INVOICES = [
//     { id: "INV-2025-001", customer: "Ravi Sharma", customerId: "C001", date: "2025-04-18", dueDate: "2025-05-18", amount: 18500, paid: 18500, status: "paid", items: 4, paymentMode: "UPI" },
//     { id: "INV-2025-002", customer: "Global Mart", customerId: "C007", date: "2025-04-22", dueDate: "2025-05-22", amount: 72000, paid: 0, status: "unpaid", items: 12, paymentMode: null },
//     { id: "INV-2025-003", customer: "Suresh Traders", customerId: "C003", date: "2025-04-10", dueDate: "2025-04-25", amount: 45000, paid: 0, status: "overdue", items: 8, paymentMode: null },
//     { id: "INV-2025-004", customer: "Kewal & Sons", customerId: "C005", date: "2025-04-15", dueDate: "2025-05-15", amount: 31000, paid: 15000, status: "partial", items: 6, paymentMode: "Bank Transfer" },
//     { id: "INV-2025-005", customer: "Priya Mehta", customerId: "C002", date: "2025-04-20", dueDate: "2025-05-20", amount: 9400, paid: 9400, status: "paid", items: 3, paymentMode: "Cash" },
//     { id: "INV-2025-006", customer: "Nexus Wholesale", customerId: "C009", date: "2025-04-21", dueDate: "2025-05-21", amount: 110000, paid: 0, status: "unpaid", items: 20, paymentMode: null },
//     { id: "INV-2025-007", customer: "Anita Verma", customerId: "C006", date: "2025-04-12", dueDate: "2025-05-12", amount: 8500, paid: 0, status: "unpaid", items: 2, paymentMode: null },
//     { id: "INV-2025-008", customer: "Pooja Kirana", customerId: "C010", date: "2025-04-17", dueDate: "2025-05-17", amount: 3200, paid: 3200, status: "paid", items: 1, paymentMode: "UPI" },
// ];

// // ── WHOLESALE ORDERS ──────────────────────────────────────────────────────────
// export const WHOLESALE_ORDERS = [
//     { id: "WO-001", party: "Nexus Wholesale", date: "2025-04-21", items: 20, totalQty: 450, amount: 110000, discount: 12, margin: 18, status: "confirmed", deliveryDate: "2025-04-28" },
//     { id: "WO-002", party: "Global Mart", date: "2025-04-22", items: 12, totalQty: 280, amount: 72000, discount: 10, margin: 15, status: "processing", deliveryDate: "2025-04-30" },
//     { id: "WO-003", party: "Suresh Traders", date: "2025-04-10", items: 8, totalQty: 160, amount: 45000, discount: 8, margin: 20, status: "dispatched", deliveryDate: "2025-04-14" },
//     { id: "WO-004", party: "Kewal & Sons", date: "2025-04-15", items: 6, totalQty: 90, amount: 31000, discount: 5, margin: 22, status: "confirmed", deliveryDate: "2025-04-25" },
//     { id: "WO-005", party: "Metro Distributors", date: "2025-04-19", items: 15, totalQty: 320, amount: 89000, discount: 15, margin: 12, status: "pending", deliveryDate: "2025-05-02" },
// ];

// // ── RETURNS ───────────────────────────────────────────────────────────────────
// export const RETURNS = [
//     { id: "RET-001", originalInv: "INV-2025-001", customer: "Ravi Sharma", date: "2025-04-20", items: 1, amount: 2200, reason: "Damaged product", status: "approved", creditNote: "CN-001" },
//     { id: "RET-002", originalInv: "INV-2025-003", customer: "Suresh Traders", date: "2025-04-14", items: 2, amount: 8000, reason: "Wrong item sent", status: "pending", creditNote: null },
//     { id: "RET-003", originalInv: "INV-2025-005", customer: "Priya Mehta", date: "2025-04-22", items: 1, amount: 1500, reason: "Customer changed mind", status: "rejected", creditNote: null },
//     { id: "RET-004", originalInv: "INV-2025-004", customer: "Kewal & Sons", date: "2025-04-18", items: 3, amount: 12000, reason: "Quality issue", status: "approved", creditNote: "CN-002" },
// ];

// // ── PURCHASE ORDERS ───────────────────────────────────────────────────────────
// export const PURCHASE_ORDERS = [
//     { id: "PO-001", supplier: "Hindustan Foods Ltd", date: "2025-04-20", dueDate: "2025-05-05", items: 8, amount: 85000, paid: 85000, status: "received", paymentMode: "Bank Transfer" },
//     { id: "PO-002", supplier: "Agro Fresh Pvt Ltd", date: "2025-04-18", dueDate: "2025-05-03", items: 5, amount: 42000, paid: 0, status: "ordered", paymentMode: null },
//     { id: "PO-003", supplier: "Star Beverages", date: "2025-04-15", dueDate: "2025-04-30", items: 12, amount: 67000, paid: 30000, status: "partial", paymentMode: "Cheque" },
//     { id: "PO-004", supplier: "Clean Home Products", date: "2025-04-10", dueDate: "2025-04-20", items: 6, amount: 28000, paid: 0, status: "overdue", paymentMode: null },
//     { id: "PO-005", supplier: "Spice Route India", date: "2025-04-22", dueDate: "2025-05-07", items: 9, amount: 55000, paid: 55000, status: "received", paymentMode: "UPI" },
//     { id: "PO-006", supplier: "Premier Dairy Co.", date: "2025-04-21", dueDate: "2025-05-06", items: 4, amount: 19000, paid: 0, status: "ordered", paymentMode: null },
// ];

// // ── SUPPLIERS ─────────────────────────────────────────────────────────────────
// export const SUPPLIERS = [
//     { id: "S001", name: "Hindustan Foods Ltd", phone: "9711001122", city: "Delhi", email: "hfl@email.com", totalPurchased: 420000, outstanding: 0, gstin: "07AABHF1234C1ZP", status: "active" },
//     { id: "S002", name: "Agro Fresh Pvt Ltd", phone: "9822334455", city: "Pune", email: "agro@email.com", totalPurchased: 195000, outstanding: 42000, gstin: "27AABAG5678D1ZR", status: "active" },
//     { id: "S003", name: "Star Beverages", phone: "9933445566", city: "Bangalore", email: "star@email.com", totalPurchased: 310000, outstanding: 37000, gstin: "29AACSS4321E1ZM", status: "active" },
//     { id: "S004", name: "Clean Home Products", phone: "9844556677", city: "Ahmedabad", email: "clean@email.com", totalPurchased: 88000, outstanding: 28000, gstin: "24AABCC7890F1ZN", status: "inactive" },
//     { id: "S005", name: "Spice Route India", phone: "9955667788", city: "Chennai", email: "spice@email.com", totalPurchased: 240000, outstanding: 0, gstin: "33AACSR2345G1ZA", status: "active" },
//     { id: "S006", name: "Premier Dairy Co.", phone: "9066778899", city: "Jaipur", email: "dairy@email.com", totalPurchased: 126000, outstanding: 19000, gstin: "08AABCP6789H1ZB", status: "active" },
// ];

// // ── INVENTORY / ITEMS ─────────────────────────────────────────────────────────
// export const INVENTORY_ITEMS = [
//     { id: "ITM-001", name: "Basmati Rice 5kg", category: "Grains", sku: "GRN-001", unit: "Bag", buyPrice: 280, sellPrice: 340, stock: 145, minStock: 50, tax: 5 },
//     { id: "ITM-002", name: "Toor Dal 1kg", category: "Pulses", sku: "PLS-001", unit: "Packet", buyPrice: 95, sellPrice: 120, stock: 320, minStock: 100, tax: 5 },
//     { id: "ITM-003", name: "Sunflower Oil 1L", category: "Oils", sku: "OIL-001", unit: "Bottle", buyPrice: 140, sellPrice: 175, stock: 88, minStock: 40, tax: 12 },
//     { id: "ITM-004", name: "Surf Excel 500g", category: "Detergent", sku: "DET-001", unit: "Pack", buyPrice: 95, sellPrice: 118, stock: 12, minStock: 30, tax: 18 },
//     { id: "ITM-005", name: "Amul Butter 500g", category: "Dairy", sku: "DRY-001", unit: "Pack", buyPrice: 230, sellPrice: 270, stock: 54, minStock: 25, tax: 12 },
//     { id: "ITM-006", name: "Coca-Cola 2L", category: "Beverages", sku: "BEV-001", unit: "Bottle", buyPrice: 65, sellPrice: 85, stock: 200, minStock: 80, tax: 28 },
//     { id: "ITM-007", name: "Red Chilli Powder 200g", category: "Spices", sku: "SPC-001", unit: "Packet", buyPrice: 55, sellPrice: 72, stock: 175, minStock: 60, tax: 5 },
//     { id: "ITM-008", name: "Colgate Toothpaste 150g", category: "Personal", sku: "PER-001", unit: "Piece", buyPrice: 72, sellPrice: 92, stock: 8, minStock: 30, tax: 18 },
//     { id: "ITM-009", name: "Bournvita 1kg", category: "Beverages", sku: "BEV-002", unit: "Tin", buyPrice: 380, sellPrice: 450, stock: 42, minStock: 20, tax: 18 },
//     { id: "ITM-010", name: "Haldiram Mixture 400g", category: "Snacks", sku: "SNK-001", unit: "Pack", buyPrice: 88, sellPrice: 110, stock: 96, minStock: 40, tax: 12 },
//     { id: "ITM-011", name: "Dettol Soap 75g", category: "Personal", sku: "PER-002", unit: "Piece", buyPrice: 38, sellPrice: 50, stock: 230, minStock: 80, tax: 18 },
//     { id: "ITM-012", name: "Parle-G 800g", category: "Snacks", sku: "SNK-002", unit: "Pack", buyPrice: 52, sellPrice: 68, stock: 310, minStock: 100, tax: 12 },
// ];

// // ── STOCK ADJUSTMENTS ─────────────────────────────────────────────────────────
// export const STOCK_ADJUSTMENTS = [
//     { id: "ADJ-001", item: "Surf Excel 500g", itemId: "ITM-004", date: "2025-04-20", type: "damage", qty: -8, reason: "Water damage in storage", before: 20, after: 12 },
//     { id: "ADJ-002", item: "Colgate Toothpaste 150g", itemId: "ITM-008", date: "2025-04-18", type: "damage", qty: -5, reason: "Expired stock removed", before: 13, after: 8 },
//     { id: "ADJ-003", item: "Basmati Rice 5kg", itemId: "ITM-001", date: "2025-04-15", type: "addition", qty: +50, reason: "Stock correction after audit", before: 95, after: 145 },
//     { id: "ADJ-004", item: "Sunflower Oil 1L", itemId: "ITM-003", date: "2025-04-12", type: "damage", qty: -10, reason: "Leakage during transit", before: 98, after: 88 },
// ];

// // ── PARTIES (both suppliers and customers combined view) ──────────────────────
// export const PARTIES = [
//     ...CUSTOMERS.map(c => ({ ...c, type: "customer", balance: c.outstanding > 0 ? -c.outstanding : 0 })),
//     ...SUPPLIERS.map(s => ({ ...s, type: "supplier", balance: s.outstanding > 0 ? s.outstanding : 0 })),
// ];

// // ── REPORTS / ANALYTICS DATA ──────────────────────────────────────────────────
// export const MONTHLY_SALES = [
//     { month: "Nov", sales: 210000, purchase: 155000, profit: 55000 },
//     { month: "Dec", sales: 285000, purchase: 198000, profit: 87000 },
//     { month: "Jan", sales: 198000, purchase: 145000, profit: 53000 },
//     { month: "Feb", sales: 230000, purchase: 168000, profit: 62000 },
//     { month: "Mar", sales: 312000, purchase: 220000, profit: 92000 },
//     { month: "Apr", sales: 278000, purchase: 192000, profit: 86000 },
// ];

// export const CATEGORY_SALES = [
//     { category: "Grains", amount: 68000, percent: 24 },
//     { category: "Beverages", amount: 54000, percent: 19 },
//     { category: "Dairy", amount: 42000, percent: 15 },
//     { category: "Snacks", amount: 38000, percent: 14 },
//     { category: "Oils", amount: 31000, percent: 11 },
//     { category: "Spices", amount: 25000, percent: 9 },
//     { category: "Others", amount: 20000, percent: 7 },
// ];

// export const DASHBOARD_STATS = {
//     totalSalesToday: 28400,
//     totalSalesMonth: 278000,
//     totalPurchaseMonth: 192000,
//     profitMonth: 86000,
//     pendingPayments: 285700,
//     overdueInvoices: 2,
//     lowStockItems: 4,
//     totalCustomers: CUSTOMERS.length,
//     activeCustomers: CUSTOMERS.filter(c => c.status === "active").length,
//     totalSuppliers: SUPPLIERS.length,
// };

// // ── REPORT SUMMARIES ──────────────────────────────────────────────────────────
// export const PROFIT_LOSS = {
//     revenue: 278000,
//     cogs: 168000,
//     grossProfit: 110000,
//     expenses: [
//         { label: "Staff salary", amount: 12000 },
//         { label: "Rent", amount: 8000 },
//         { label: "Electricity", amount: 2400 },
//         { label: "Transport", amount: 4200 },
//         { label: "Misc", amount: 1800 },
//     ],
//     totalExpenses: 28400,
//     netProfit: 81600,
// };

// export const GST_SUMMARY = {
//     period: "April 2025",
//     salesTaxCollected: { "5%": 8200, "12%": 15400, "18%": 21800, "28%": 6900 },
//     purchaseTaxPaid: { "5%": 5100, "12%": 9800, "18%": 13400, "28%": 4200 },
//     itcAvailable: 32500,
//     gstPayable: 19800,
// };