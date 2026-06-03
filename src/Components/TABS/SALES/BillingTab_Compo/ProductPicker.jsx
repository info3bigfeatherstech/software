// TABS/SALES/BillingTab_Compo/ProductPicker.jsx
//
// Product grid for billing - shows products from shop-stocks API
// Single variant → add directly, multiple variants → open picker
// FIXED: Quantity increment on multiple scans, garbage barcode filtering
// UPDATED: Default price_type to "SPECIAL" to match backend
// FIXED: Using special_price instead of retail_price

import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useGetShopStocksQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockApi";
import { addToCart, updateCartQty } from "../../../../REDUX_FEATURES/REDUX_SLICES/Billing_api/billingSlice";
import BarcodeScanner from "./BarcodeScanner";
import { useLazyGetProductByBarcodeQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productApi";
import { toast } from "react-toastify";
import {
    buildBillingCartItem,
    formatGstPercentLabel,
    resolveProductGstPercent,
    resolveProductGstType,
    toBillingNumber,
} from "../../../../utils/billingCart.utils";

// Valid barcode pattern: alphanumeric, dash, underscore, min 3 chars
const isValidBarcode = (barcode) => {
    if (!barcode || typeof barcode !== 'string') return false;
    if (barcode.length < 3) return false;
    // Allow alphanumeric, dash, underscore, colon (EAN-13 uses numbers only)
    return /^[a-zA-Z0-9\-_:]+$/.test(barcode);
};

export default function ProductPicker({ shop_id, cart = [] }) {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [showScanner, setShowScanner] = useState(false);
    const [triggerBarcodeSearch] = useLazyGetProductByBarcodeQuery();
    const lastScanTimeRef = useRef(0);
    const lastSuccessfulBarcodeRef = useRef(null);

    const { data, isLoading, isFetching, refetch } = useGetShopStocksQuery({
        shop_id,
        limit: 100,
    });

    const stocks = data?.stocks || [];

    // Handle barcode scan result - WITH QUANTITY INCREMENT ON SAME PRODUCT
    const handleBarcodeScan = async (barcode) => {
        // Debounce: ignore scans within 500ms
        const now = Date.now();
        if (now - lastScanTimeRef.current < 500) {
            console.log("Ignoring duplicate scan within 500ms");
            return;
        }
        lastScanTimeRef.current = now;

        // Validate barcode format
        if (!isValidBarcode(barcode)) {
            console.warn("Invalid barcode ignored:", barcode);
            return; // Silently ignore garbage scans
        }

        try {
            const result = await triggerBarcodeSearch(barcode).unwrap();
            if (result) {
                // Check if product already exists in cart
                const existingItem = cart.find(item => item.variant_id === result.variant_id);
                
                if (existingItem) {
                    // INCREMENT QUANTITY - don't add duplicate
                    const newQuantity = existingItem.quantity + 1;
                    dispatch(updateCartQty({ 
                        variant_id: result.variant_id, 
                        quantity: newQuantity 
                    }));
                    toast.success(`${result.name} quantity increased to ${newQuantity}`);
                } else {
                    const cartItem = buildBillingCartItem({
                        variant_id: result.variant_id,
                        product_name: result.name,
                        system_barcode: result.system_barcode || barcode,
                        special_price: result.special_price,
                        wholesale_price: result.wholesale_price,
                        mrp: result.mrp,
                        online_price: result.online_price,
                        retail_price: result.special_price,
                        gst_percent: result.gst_percent,
                        gst_type: result.gst_type,
                        quantity_available: result.stock_available ?? 999999,
                    });
                    dispatch(addToCart(cartItem));
                    toast.success(`${result.name} added to cart`);
                }
                lastSuccessfulBarcodeRef.current = barcode;
            } else {
                console.warn("Product not found for barcode:", barcode);
            }
        } catch (err) {
            // Silently fail for garbage scans - don't show error toast
            console.warn("Barcode search failed for:", barcode, err?.status);
        }
    };

    // Filter products client-side
    const filteredStocks = stocks.filter((stock) => {
        const term = searchTerm.toLowerCase();
        const productName = stock.variant?.product?.name?.toLowerCase() || "";
        const barcode = stock.variant?.system_barcode?.toLowerCase() || "";
        const sku = stock.variant?.sku?.toLowerCase() || "";
        return productName.includes(term) || barcode.includes(term) || sku.includes(term);
    });

    const handleProductClick = (stock) => {
        const variant = stock.variant;
        const product = variant?.product;
        
        // Check if product already exists in cart
        const existingItem = cart.find(item => item.variant_id === variant.variant_id);
        
        if (existingItem) {
            // INCREMENT QUANTITY
            const newQuantity = existingItem.quantity + 1;
            dispatch(updateCartQty({ 
                variant_id: variant.variant_id, 
                quantity: newQuantity 
            }));
            toast.success(`${product?.name} quantity increased to ${newQuantity}`);
        } else {
            const cartItem = buildBillingCartItem({
                variant_id: variant.variant_id,
                product_name: product?.name || "Unknown",
                system_barcode: variant.system_barcode,
                special_price: variant.special_price,
                wholesale_price: variant.wholesale_price,
                mrp: variant.mrp,
                online_price: variant.online_price,
                retail_price: variant.special_price,
                gst_percent: resolveProductGstPercent(product),
                gst_type: resolveProductGstType(product),
                quantity_available: stock.quantity_available,
            });
            dispatch(addToCart(cartItem));
            toast.success(`${product?.name} added to cart`);
        }
    };

    if (isLoading || isFetching) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Barcode Scanner */}
            <BarcodeScanner
                products={[]}
                onProductFound={handleBarcodeScan}
                showScanner={showScanner}
                setShowScanner={setShowScanner}
                disabled={false}
            />

            {/* Search Input */}
            <div className="relative mb-3">
                <input
                    type="text"
                    placeholder="🔍 Search by product name, barcode, or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500"
                />
            </div>

            {/* Refresh button for stock */}
            <button
                onClick={() => refetch()}
                className="text-xs text-blue-500 text-right mb-2 hover:text-blue-700"
            >
                ↻ Refresh stock
            </button>

            {/* Product Grid */}
            <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 pr-1">
                {filteredStocks.length === 0 ? (
                    <div className="col-span-3 text-center text-gray-400 py-8">
                        No products found in this shop
                    </div>
                ) : (
                    filteredStocks.map((stock) => {
                        const variant = stock.variant;
                        const product = variant?.product;
                        const stockQty = toBillingNumber(stock.quantity_available);
                        const lowStockThreshold = toBillingNumber(stock.low_stock_threshold);
                        const isLowStock = stockQty <= lowStockThreshold && stockQty > 0;
                        const isOutOfStock = stockQty === 0;
                        const gstLabel = formatGstPercentLabel(resolveProductGstPercent(product));

                        return (
                            <button
                                key={stock.shop_stock_id}
                                onClick={() => handleProductClick(stock)}
                                disabled={isOutOfStock}
                                className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between h-24 ${
                                    isOutOfStock
                                        ? "opacity-50 bg-gray-50 border-gray-200 cursor-not-allowed"
                                        : "bg-white border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer"
                                }`}
                            >
                                <p className="font-medium text-sm text-gray-800 line-clamp-2">
                                    {product?.name || "Unknown"}
                                </p>
                                {gstLabel && (
                                    <p className="text-[10px] font-medium text-indigo-700 mt-0.5">
                                        GST {gstLabel}
                                    </p>
                                )}
                                <div className="mt-auto flex justify-between items-end w-full">
                                    <div>
                                        <p className="text-xs text-gray-500 font-mono">
                                            {variant?.system_barcode?.slice(-6) || "—"}
                                        </p>
                                        <p className="font-bold text-blue-600">
                                            ₹{toBillingNumber(variant.special_price).toFixed(2)}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                            isOutOfStock
                                                ? "bg-gray-100 text-gray-500"
                                                : isLowStock
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                        }`}
                                    >
                                        {isOutOfStock ? "Out" : stockQty} left
                                    </span>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
// down code is old use upper code they have update prices handling 
// // TABS/SALES/BillingTab_Compo/ProductPicker.jsx
// //
// // Product grid for billing - shows products from shop-stocks API
// // Single variant → add directly, multiple variants → open picker
// // FIXED: Quantity increment on multiple scans, garbage barcode filtering

// import React, { useState, useRef } from "react";
// import { useDispatch } from "react-redux";
// import { useGetShopStocksQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/ShopStock_api/shopStockApi";
// import { addToCart, updateCartQty } from "../../../../REDUX_FEATURES/REDUX_SLICES/Billing_api/billingSlice";
// import BarcodeScanner from "./BarcodeScanner";
// import { useLazyGetProductByBarcodeQuery } from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productApi";
// import { toast } from "react-toastify";

// const toNumber = (value, defaultValue = 0) => {
//     const num = Number(value);
//     return isNaN(num) ? defaultValue : num;
// };

// // Valid barcode pattern: alphanumeric, dash, underscore, min 3 chars
// const isValidBarcode = (barcode) => {
//     if (!barcode || typeof barcode !== 'string') return false;
//     if (barcode.length < 3) return false;
//     // Allow alphanumeric, dash, underscore, colon (EAN-13 uses numbers only)
//     return /^[a-zA-Z0-9\-_:]+$/.test(barcode);
// };

// export default function ProductPicker({ shop_id, cart = [] }) {
//     const dispatch = useDispatch();
//     const [searchTerm, setSearchTerm] = useState("");
//     const [showScanner, setShowScanner] = useState(false);
//     const [triggerBarcodeSearch] = useLazyGetProductByBarcodeQuery();
//     const lastScanTimeRef = useRef(0);
//     const lastSuccessfulBarcodeRef = useRef(null);

//     const { data, isLoading, isFetching, refetch } = useGetShopStocksQuery({
//         shop_id,
//         limit: 100,
//     });

//     const stocks = data?.stocks || [];

//     // Handle barcode scan result - WITH QUANTITY INCREMENT ON SAME PRODUCT
//     const handleBarcodeScan = async (barcode) => {
//         // Debounce: ignore scans within 500ms
//         const now = Date.now();
//         if (now - lastScanTimeRef.current < 500) {
//             console.log("Ignoring duplicate scan within 500ms");
//             return;
//         }
//         lastScanTimeRef.current = now;

//         // Validate barcode format
//         if (!isValidBarcode(barcode)) {
//             console.warn("Invalid barcode ignored:", barcode);
//             return; // Silently ignore garbage scans
//         }

//         try {
//             const result = await triggerBarcodeSearch(barcode).unwrap();
//             if (result) {
//                 // Check if product already exists in cart
//                 const existingItem = cart.find(item => item.variant_id === result.variant_id);
                
//                 if (existingItem) {
//                     // INCREMENT QUANTITY - don't add duplicate
//                     const newQuantity = existingItem.quantity + 1;
//                     dispatch(updateCartQty({ 
//                         variant_id: result.variant_id, 
//                         quantity: newQuantity 
//                     }));
//                     toast.success(`${result.name} quantity increased to ${newQuantity}`);
//                 } else {
//                     // Add new item to cart
//                     const cartItem = {
//                         variant_id: result.variant_id,
//                         product_name: result.name,
//                         system_barcode: result.system_barcode || barcode,
//                         quantity: 1,
//                         price_type: "RETAIL",
//                         unit_price: toNumber(result.retail_price),
//                         retail_price: toNumber(result.retail_price),
//                         wholesale_price: toNumber(result.wholesale_price),
//                         mrp: toNumber(result.mrp),
//                         online_price: toNumber(result.online_price),
//                         gst_percent: toNumber(result.gst_percent),
//                         quantity_available: 999999,
//                         line_total: toNumber(result.retail_price),
//                         gst_amount: (toNumber(result.retail_price) * toNumber(result.gst_percent)) / 100,
//                     };
//                     dispatch(addToCart(cartItem));
//                     toast.success(`${result.name} added to cart`);
//                 }
//                 lastSuccessfulBarcodeRef.current = barcode;
//             } else {
//                 console.warn("Product not found for barcode:", barcode);
//             }
//         } catch (err) {
//             // Silently fail for garbage scans - don't show error toast
//             console.warn("Barcode search failed for:", barcode, err?.status);
//         }
//     };

//     // Filter products client-side
//     const filteredStocks = stocks.filter((stock) => {
//         const term = searchTerm.toLowerCase();
//         const productName = stock.variant?.product?.name?.toLowerCase() || "";
//         const barcode = stock.variant?.system_barcode?.toLowerCase() || "";
//         const sku = stock.variant?.sku?.toLowerCase() || "";
//         return productName.includes(term) || barcode.includes(term) || sku.includes(term);
//     });

//     const handleProductClick = (stock) => {
//         const variant = stock.variant;
//         const product = variant?.product;
        
//         // Check if product already exists in cart
//         const existingItem = cart.find(item => item.variant_id === variant.variant_id);
        
//         if (existingItem) {
//             // INCREMENT QUANTITY
//             const newQuantity = existingItem.quantity + 1;
//             dispatch(updateCartQty({ 
//                 variant_id: variant.variant_id, 
//                 quantity: newQuantity 
//             }));
//             toast.success(`${product?.name} quantity increased to ${newQuantity}`);
//         } else {
//             // Add new item
//             const cartItem = {
//                 variant_id: variant.variant_id,
//                 product_name: product?.name || "Unknown",
//                 system_barcode: variant.system_barcode,
//                 quantity: 1,
//                 price_type: "RETAIL",
//                 unit_price: toNumber(variant.retail_price),
//                 retail_price: toNumber(variant.retail_price),
//                 wholesale_price: toNumber(variant.wholesale_price),
//                 mrp: toNumber(variant.mrp),
//                 online_price: toNumber(variant.online_price),
//                 gst_percent: toNumber(variant.gst_percent),
//                 quantity_available: toNumber(stock.quantity_available),
//                 line_total: toNumber(variant.retail_price),
//                 gst_amount: (toNumber(variant.retail_price) * toNumber(variant.gst_percent)) / 100,
//             };
//             dispatch(addToCart(cartItem));
//             toast.success(`${product?.name} added to cart`);
//         }
//     };

//     if (isLoading || isFetching) {
//         return (
//             <div className="flex justify-center py-12">
//                 <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//             </div>
//         );
//     }

//     return (
//         <div className="h-full flex flex-col">
//             {/* Barcode Scanner */}
//             <BarcodeScanner
//                 products={[]}
//                 onProductFound={handleBarcodeScan}
//                 showScanner={showScanner}
//                 setShowScanner={setShowScanner}
//                 disabled={false}
//             />

//             {/* Search Input */}
//             <div className="relative mb-3">
//                 <input
//                     type="text"
//                     placeholder="🔍 Search by product name, barcode, or SKU..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500"
//                 />
//             </div>

//             {/* Refresh button for stock */}
//             <button
//                 onClick={() => refetch()}
//                 className="text-xs text-blue-500 text-right mb-2 hover:text-blue-700"
//             >
//                 ↻ Refresh stock
//             </button>

//             {/* Product Grid */}
//             <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 pr-1">
//                 {filteredStocks.length === 0 ? (
//                     <div className="col-span-3 text-center text-gray-400 py-8">
//                         No products found in this shop
//                     </div>
//                 ) : (
//                     filteredStocks.map((stock) => {
//                         const variant = stock.variant;
//                         const product = variant?.product;
//                         const stockQty = toNumber(stock.quantity_available);
//                         const lowStockThreshold = toNumber(stock.low_stock_threshold);
//                         const isLowStock = stockQty <= lowStockThreshold && stockQty > 0;
//                         const isOutOfStock = stockQty === 0;

//                         return (
//                             <button
//                                 key={stock.shop_stock_id}
//                                 onClick={() => handleProductClick(stock)}
//                                 disabled={isOutOfStock}
//                                 className={`text-left p-3 rounded-lg border transition-all flex flex-col justify-between h-24 ${
//                                     isOutOfStock
//                                         ? "opacity-50 bg-gray-50 border-gray-200 cursor-not-allowed"
//                                         : "bg-white border-gray-200 hover:border-blue-500 hover:shadow-md cursor-pointer"
//                                 }`}
//                             >
//                                 <p className="font-medium text-sm text-gray-800 line-clamp-2">
//                                     {product?.name || "Unknown"}
//                                 </p>
//                                 <div className="mt-auto flex justify-between items-end w-full">
//                                     <div>
//                                         <p className="text-xs text-gray-500 font-mono">
//                                             {variant?.system_barcode?.slice(-6) || "—"}
//                                         </p>
//                                         <p className="font-bold text-blue-600">
//                                             ₹{toNumber(variant.retail_price).toFixed(2)}
//                                         </p>
//                                     </div>
//                                     <span
//                                         className={`text-xs px-1.5 py-0.5 rounded font-medium ${
//                                             isOutOfStock
//                                                 ? "bg-gray-100 text-gray-500"
//                                                 : isLowStock
//                                                 ? "bg-red-100 text-red-700"
//                                                 : "bg-green-100 text-green-700"
//                                         }`}
//                                     >
//                                         {isOutOfStock ? "Out" : stockQty} left
//                                     </span>
//                                 </div>
//                             </button>
//                         );
//                     })
//                 )}
//             </div>
//         </div>
//     );
// }