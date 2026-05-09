// components/vendors/VendorTable.jsx
import React, { useState } from "react";
import { Eye, Edit, Power, Trash2 } from "lucide-react";
import { useDeleteVendorMutation } from "../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorApi";

export default function VendorTable({ vendors, onEdit, onView, onToggleActive, isLoading }) {
  const [deleteVendor, { isLoading: isDeleting }] = useDeleteVendorMutation();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.company_name}? This will deactivate the vendor.`)) {
      setDeletingId(vendor.vendor_id);
      try {
        await deleteVendor(vendor.vendor_id).unwrap();
        alert("✅ Vendor deactivated successfully!");
        onToggleActive(); // Refresh the list
      } catch (error) {
        console.error("Delete error:", error);
        alert(error.data?.message || "Failed to deactivate vendor");
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">GST Number</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-10 text-center text-gray-400">
                  No vendors found
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor.vendor_id} className={`hover:bg-gray-50 transition-colors ${!vendor.is_active ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{vendor.vendor_id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{vendor.company_name}</p>
                    <p className="text-xs text-gray-400">{vendor.contact_person || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="text-gray-600">{vendor.phone}</p>
                    <p className="text-gray-400">{vendor.email || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{vendor.city || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{vendor.gst_number || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{vendor.business_type || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vendor.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {vendor.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(vendor)}
                        className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onView(vendor)}
                        className="p-1 text-gray-600 hover:text-gray-800 cursor-pointer"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor)}
                        disabled={isDeleting && deletingId === vendor.vendor_id}
                        className={`p-1 cursor-pointer ${vendor.is_active ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"} disabled:opacity-50`}
                        title={vendor.is_active ? "Deactivate" : "Activate"}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// upper code have api integration 
// // components/vendors/VendorTable.jsx
// import React from "react";
// import { Eye, Edit, Power } from "lucide-react";

// export default function VendorTable({ vendors, onEdit, onView, onToggleActive }) {
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//       <table className="w-full text-sm">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor ID</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Name</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">GST Number</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Business Type</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
//             <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-100">
//           {vendors.length === 0 ? (
//             <tr>
//               <td colSpan="8" className="px-4 py-10 text-center text-gray-400">
//                 No vendors found
//               </td>
//             </tr>
//           ) : (
//             vendors.map((vendor) => (
//               <tr key={vendor.vendor_id} className={`hover:bg-gray-50 transition-colors ${!vendor.is_active ? "opacity-60" : ""}`}>
//                 <td className="px-4 py-3 text-xs font-mono text-gray-500">{vendor.vendor_id}</td>
//                 <td className="px-4 py-3">
//                   <p className="font-medium text-gray-800">{vendor.company_name}</p>
//                   <p className="text-xs text-gray-400">{vendor.contact_person || "—"}</p>
//                 </td>
//                 <td className="px-4 py-3 text-xs">
//                   <p className="text-gray-600">{vendor.phone}</p>
//                   <p className="text-gray-400">{vendor.email || "—"}</p>
//                 </td>
//                 <td className="px-4 py-3 text-gray-600">{vendor.city || "—"}</td>
//                 <td className="px-4 py-3 font-mono text-xs text-gray-500">{vendor.gst_number || "—"}</td>
//                 <td className="px-4 py-3">
//                   <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{vendor.business_type || "—"}</span>
//                 </td>
//                 <td className="px-4 py-3">
//                   <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${vendor.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
//                     {vendor.is_active ? "Active" : "Inactive"}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3">
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => onEdit(vendor)}
//                       className="p-1 text-blue-600 hover:text-blue-800 cursor-pointer"
//                       title="Edit"
//                     >
//                       <Edit size={16} />
//                     </button>
//                     <button
//                       onClick={() => onView(vendor)}
//                       className="p-1 text-gray-600 hover:text-gray-800 cursor-pointer"
//                       title="View Details"
//                     >
//                       <Eye size={16} />
//                     </button>
//                     <button
//                       onClick={() => onToggleActive(vendor)}
//                       className={`p-1 cursor-pointer ${vendor.is_active ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}`}
//                       title={vendor.is_active ? "Deactivate" : "Activate"}
//                     >
//                       <Power size={16} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }