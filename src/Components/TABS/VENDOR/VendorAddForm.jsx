// components/vendors/VendorAddForm.jsx
import React from "react";
import VendorFormBody from "./VendorFormBody";

export default function VendorAddForm({ formData, setFormData, onSave, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Add New Vendor</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          
          <VendorFormBody formData={formData} setFormData={setFormData} isEditing={false} />
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              Add Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}