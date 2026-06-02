
// components/vendors/VendorEditForm.jsx
import React, { useState } from "react";
import { useUpdateVendorMutation } from "../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorApi";
import VendorFormBody from "./VendorFormBody";
import { validateVendorForm } from "../../../utils/vendorValidation";

export default function VendorEditForm({ formData, setFormData, onSave, onCancel, selectedVendor, formErrors, setFormErrors }) {
  const [updateVendor, { isLoading }] = useUpdateVendorMutation();
  const [serverError, setServerError] = useState("");

  const handleSave = async () => {
    // Validate form
    const { isValid, errors } = validateVendorForm(formData, true);
    
    if (!isValid) {
      setFormErrors(errors);
      return;
    }

    try {
      // Format phone numbers
      const payload = {
        vendorId: selectedVendor.vendor_id,
        ...formData,
        phone: formData.phone.replace(/\D/g, ''),
        whatsapp: formData.whatsapp ? formData.whatsapp.replace(/\D/g, '') : undefined,
      };

      const result = await updateVendor(payload).unwrap();
      
      if (result) {
        alert("✅ Vendor updated successfully!");
        onSave();
      }
    } catch (error) {
      console.error("Update vendor error:", error);
      if (error.data?.message) {
        setServerError(error.data.message);
      } else if (error.data?.errors) {
        const backendErrors = {};
        error.data.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setFormErrors(backendErrors);
      } else {
        setServerError("Failed to update vendor. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black bg-opacity-50" />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Edit Vendor</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}
          
          <VendorFormBody 
            formData={formData} 
            setFormData={setFormData} 
            errors={formErrors}
            isEditing={true} 
          />
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Update Vendor"}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
// upper code have api integration 
// // components/vendors/VendorEditForm.jsx
// import React from "react";
// import VendorFormBody from "./VendorFormBody";

// export default function VendorEditForm({ formData, setFormData, onSave, onCancel }) {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold text-gray-800">Edit Vendor</h3>
//             <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
//           </div>
          
//           <VendorFormBody formData={formData} setFormData={setFormData} isEditing={true} />
          
//           <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
//             <button
//               onClick={onCancel}
//               className="px-4 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={onSave}
//               className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
//             >
//               Update Vendor
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }