// TABS/WAREHOUSES/INVENTORY_STOCK/StockBulkActionBar.jsx
//
// Bulk operations for stock:
// - Bulk update location (zone, rack, position)
// - Bulk delete (hard delete with confirmation)

import React, { useState } from "react";
import { X, Move, Trash2, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import { 
    useBulkUpdateStocksMutation,
    useBulkDeleteStocksMutation,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Stock_api/stockApi";

export default function StockBulkActionBar({ selectedCount, selectedStockIds, onClearSelection, onSuccess }) {
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationData, setLocationData] = useState({ room_zone: "", rack_shelf: "", position: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [bulkUpdate] = useBulkUpdateStocksMutation();
    const [bulkDelete] = useBulkDeleteStocksMutation();

    const handleBulkDelete = async () => {
        if (!window.confirm(`⚠️ Delete ${selectedCount} stock record(s)?\n\nThis is a HARD DELETE. All selected stock records will be permanently removed.\nStock ledger entries will be created automatically.\n\nThis action cannot be undone.`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            await bulkDelete({ stock_ids: selectedStockIds }).unwrap();
            toast.success(`${selectedCount} stock record(s) deleted successfully`);
            onSuccess();
            onClearSelection();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to delete stocks");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkLocationUpdate = async () => {
        if (!locationData.room_zone && !locationData.rack_shelf && !locationData.position) {
            toast.warning("Please fill at least one location field");
            return;
        }

        setIsSubmitting(true);
        try {
            const items = selectedStockIds.map(stock_id => ({
                stock_id,
                ...(locationData.room_zone && { room_zone: locationData.room_zone }),
                ...(locationData.rack_shelf && { rack_shelf: locationData.rack_shelf }),
                ...(locationData.position && { position: locationData.position }),
            }));

            await bulkUpdate({ items }).unwrap();
            toast.success(`${selectedCount} stock record(s) location updated`);
            setShowLocationModal(false);
            setLocationData({ room_zone: "", rack_shelf: "", position: "" });
            onSuccess();
            onClearSelection();
        } catch (err) {
            toast.error(err?.data?.message || "Failed to update locations");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
                <div className="bg-gray-900 text-white rounded-full shadow-2xl px-6 py-3 flex items-center gap-4">
                    <span className="text-sm font-medium">
                        {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
                    </span>
                    <div className="w-px h-6 bg-gray-600" />
                    <button
                        onClick={() => setShowLocationModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition-colors"
                    >
                        <MapPin size={14} /> Update Location
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-full text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <Trash2 size={14} /> Delete Selected
                    </button>
                    <button
                        onClick={onClearSelection}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-full text-sm transition-colors"
                    >
                        <X size={14} /> Clear
                    </button>
                </div>
            </div>

            {/* Location Update Modal */}
            {showLocationModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black/40" />

                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                        
                        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-800">
                                Update Location for {selectedCount} Item{selectedCount !== 1 ? "s" : ""}
                            </h3>
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 text-gray-700">
                            <p className="text-xs text-gray-500">
                                Leave fields empty to keep current values
                            </p>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Zone</label>
                                <input
                                    value={locationData.room_zone}
                                    onChange={(e) => setLocationData({ ...locationData, room_zone: e.target.value })}
                                    placeholder="e.g., A"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Rack/Shelf</label>
                                <input
                                    value={locationData.rack_shelf}
                                    onChange={(e) => setLocationData({ ...locationData, rack_shelf: e.target.value })}
                                    placeholder="e.g., Shelf-12"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                                <input
                                    value={locationData.position}
                                    onChange={(e) => setLocationData({ ...locationData, position: e.target.value })}
                                    placeholder="e.g., Row-3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkLocationUpdate}
                                disabled={isSubmitting}
                                className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
                            >
                                {isSubmitting ? "Updating..." : "Update Locations"}
                            </button>
                        </div>

                    </div>
    </div>
</div>
            )}
        </>
    );
}