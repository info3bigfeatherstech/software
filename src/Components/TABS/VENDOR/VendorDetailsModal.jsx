// components/vendors/VendorDetailsModal.jsx
import React from "react";
import { X } from "lucide-react";

export default function VendorDetailsModal({ vendor, onClose }) {
  if (!vendor) return null;

  const InfoRow = ({ label, value }) => (
    <div className="border-b border-gray-100 pb-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black bg-opacity-50" />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Vendor Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Vendor ID" value={vendor.vendor_id} />
            <InfoRow label="Company Name" value={vendor.company_name} />
            <InfoRow label="Contact Person" value={vendor.contact_person} />
            <InfoRow label="Phone" value={vendor.phone} />
            <InfoRow label="WhatsApp" value={vendor.whatsapp} />
            <InfoRow label="Email" value={vendor.email} />
            <InfoRow label="GST Number" value={vendor.gst_number} />
            <InfoRow label="Vendor Type" value={vendor.vendor_type} />
            <InfoRow label="Supply City" value={vendor.supply_city} />
            <InfoRow label="Business Type" value={vendor.business_type} />
            <InfoRow label="City" value={vendor.city} />
            <InfoRow label="Address" value={vendor.address} />
            <InfoRow label="Status" value={vendor.is_active ? "Active" : "Inactive"} />
            <InfoRow label="Created At" value={vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : "—"} />
            <InfoRow label="Updated At" value={vendor.updated_at ? new Date(vendor.updated_at).toLocaleDateString() : "—"} />
            <InfoRow label="Remarks" value={vendor.remarks} />
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

// upper code have api integration 
// // components/vendors/VendorDetailsModal.jsx
// import React from "react";
// import { X } from "lucide-react";

// export default function VendorDetailsModal({ vendor, onClose }) {
//   if (!vendor) return null;

//   const InfoRow = ({ label, value }) => (
//     <div className="border-b border-gray-100 pb-3">
//       <p className="text-xs text-gray-500 mb-1">{label}</p>
//       <p className="text-sm text-gray-800 font-medium">{value || "—"}</p>
//     </div>
//   );

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
//           <h3 className="text-lg font-semibold text-gray-800">Vendor Details</h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-6 space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <InfoRow label="Vendor ID" value={vendor.vendor_id} />
//             <InfoRow label="Company Name" value={vendor.company_name} />
//             <InfoRow label="Contact Person" value={vendor.contact_person} />
//             <InfoRow label="Phone" value={vendor.phone} />
//             <InfoRow label="WhatsApp" value={vendor.whatsapp} />
//             <InfoRow label="Email" value={vendor.email} />
//             <InfoRow label="GST Number" value={vendor.gst_number} />
//             <InfoRow label="Vendor Type" value={vendor.vendor_type} />
//             <InfoRow label="Supply City" value={vendor.supply_city} />
//             <InfoRow label="Business Type" value={vendor.business_type} />
//             <InfoRow label="City" value={vendor.city} />
//             <InfoRow label="Address" value={vendor.address} />
//             <InfoRow label="Status" value={vendor.is_active ? "Active" : "Inactive"} />
//             <InfoRow label="Outstanding" value={`₹${(vendor.outstanding || 0).toLocaleString()}`} />
//             <InfoRow label="Total Purchased" value={`₹${(vendor.total_purchased || 0).toLocaleString()}`} />
//             <InfoRow label="Created At" value={vendor.created_at} />
//             <InfoRow label="Updated At" value={vendor.updated_at} />
//             <InfoRow label="Remarks" value={vendor.remarks} className="col-span-2" />
//           </div>
//         </div>

//         <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }