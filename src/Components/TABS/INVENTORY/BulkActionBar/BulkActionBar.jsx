import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { CheckSquare, Square, Trash2, Power, PowerOff, X } from "lucide-react";
import { clearSelectedProducts } from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productSlice";

export default function BulkActionBar({ 
  selectedCount, 
  selectedProductIds,
  onBulkAction 
}) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [actionType, setActionType] = useState(null);

  const handleAction = async (action) => {
    if (selectedCount === 0) {
      toast.warning("No products selected");
      return;
    }

    const confirmMessages = {
      activate: `Activate ${selectedCount} product(s)?`,
      archive: `Archive ${selectedCount} product(s)? This will soft delete them.`,
    };

    if (!window.confirm(confirmMessages[action])) return;

    setActionType(action);
    try {
      await onBulkAction(action, selectedProductIds);
      dispatch(clearSelectedProducts());
      setIsOpen(false);
      
      const successMessages = {
        activate: `${selectedCount} product(s) activated successfully`,
        archive: `${selectedCount} product(s) archived successfully`,
      };
      toast.success(successMessages[action]);
    } catch (error) {
      toast.error(error?.data?.message || `Failed to ${action} products`);
    } finally {
      setActionType(null);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 px-4 py-3 flex items-center gap-4">
        {/* Selected count */}
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-blue-400" />
          <span className="text-sm font-medium">
            {selectedCount} product{selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="w-px h-6 bg-gray-700" />

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Bulk Actions
            <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute bottom-full mb-2 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <button
                  onClick={() => handleAction("activate")}
                  disabled={actionType === "activate"}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  <Power size={16} />
                  Activate
                </button>
                <div className="border-t border-gray-100" />
                <button
                  onClick={() => handleAction("archive")}
                  disabled={actionType === "archive"}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Archive
                </button>
              </div>
            </>
          )}
        </div>

        {/* Clear selection button */}
        <button
          onClick={() => dispatch(clearSelectedProducts())}
          className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
          title="Clear selection"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}