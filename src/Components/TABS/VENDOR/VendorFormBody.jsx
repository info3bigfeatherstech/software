// components/vendors/VendorFormBody.jsx
import React from "react";
import { BUSINESS_TYPES } from "../../../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorConstants";

export default function VendorFormBody({ formData, setFormData, errors = {}, isEditing = false }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for phone fields - only numbers
    const newValue =
      name === "phone" || name === "whatsapp"
        ? value.replace(/\D/g, "").slice(0, 10)
        : type === "checkbox"
          ? checked
          : value;

    // Always pass a plain object so Redux receives serializable payloads.
    setFormData({ [name]: newValue });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-gray-700">
        {/* Company Name */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.company_name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.company_name && (
            <p className="text-xs text-red-500 mt-1">{errors.company_name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="10 digits"
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">WhatsApp</label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            placeholder="10 digits (optional)"
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.whatsapp ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.whatsapp && (
            <p className="text-xs text-red-500 mt-1">{errors.whatsapp}</p>
          )}
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Contact Person</label>
          <input
            type="text"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.contact_person ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.contact_person && (
            <p className="text-xs text-red-500 mt-1">{errors.contact_person}</p>
          )}
        </div>

        {/* GST Number */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">GST Number</label>
          <input
            type="text"
            name="gst_number"
            value={formData.gst_number}
            onChange={handleChange}
            placeholder="e.g., 27AAAAA1234A1Z"
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.gst_number ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.gst_number && (
            <p className="text-xs text-red-500 mt-1">{errors.gst_number}</p>
          )}
        </div>

        {/* Vendor Type */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Vendor Type</label>
          <input
            type="text"
            name="vendor_type"
            value={formData.vendor_type}
            onChange={handleChange}
            placeholder="e.g., Raw Material, Packaging"
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.vendor_type ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.vendor_type && (
            <p className="text-xs text-red-500 mt-1">{errors.vendor_type}</p>
          )}
        </div>

        {/* Supply City */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Supply City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="supply_city"
            value={formData.supply_city}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.supply_city ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.supply_city && (
            <p className="text-xs text-red-500 mt-1">{errors.supply_city}</p>
          )}
        </div>

        {/* Business Type - Dropdown */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Business Type <span className="text-red-500">*</span>
          </label>
          <select
            name="business_type"
            value={formData.business_type}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.business_type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Business Type</option>
            {BUSINESS_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.business_type && (
            <p className="text-xs text-red-500 mt-1">{errors.business_type}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.city && (
            <p className="text-xs text-red-500 mt-1">{errors.city}</p>
          )}
        </div>

        {/* Address */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.address && (
            <p className="text-xs text-red-500 mt-1">{errors.address}</p>
          )}
        </div>

        {/* Remarks */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows="2"
            className={`w-full px-3 py-2 border rounded-lg text-sm ${
              errors.remarks ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.remarks && (
            <p className="text-xs text-red-500 mt-1">{errors.remarks}</p>
          )}
        </div>

        {/* Is Active */}
        <div className="col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Active Vendor</span>
          </label>
        </div>
      </div>
    </div>
  );
}
// uppe code have api intgration so use upper code 

// // components/vendors/VendorFormBody.jsx
// import React from "react";

// export default function VendorFormBody({ formData, setFormData, isEditing = false }) {
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value
//     }));
//   };

//   return (
//     <div className="space-y-4">
//       <div className="grid grid-cols-2 gap-4">
//         {/* Company Name */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">Company Name *</label>
//           <input
//             type="text"
//             name="company_name"
//             value={formData.company_name}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//             required
//           />
//         </div>

//         {/* Phone */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">Phone *</label>
//           <input
//             type="tel"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//             required
//           />
//         </div>

//         {/* Email */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//           />
//         </div>

//         {/* WhatsApp */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">WhatsApp</label>
//           <input
//             type="tel"
//             name="whatsapp"
//             value={formData.whatsapp}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//           />
//         </div>

//         {/* Contact Person */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">Contact Person</label>
//           <input
//             type="text"
//             name="contact_person"
//             value={formData.contact_person}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//           />
//         </div>

//         {/* GST Number */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">GST Number</label>
//           <input
//             type="text"
//             name="gst_number"
//             value={formData.gst_number}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//           />
//         </div>

//         {/* Vendor Type */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">Vendor Type</label>
//           <input
//             type="text"
//             name="vendor_type"
//             value={formData.vendor_type}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//             placeholder="e.g., Raw Material, Packaging"
//           />
//         </div>

//         {/* Supply City */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">Supply City *</label>
//           <input
//             type="text"
//             name="supply_city"
//             value={formData.supply_city}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//             required
//           />
//         </div>

//         {/* Business Type */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">Business Type</label>
//           <input
//             type="text"
//             name="business_type"
//             value={formData.business_type}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//             placeholder="e.g., RETAILER, WHOLESALER"
//           />
//         </div>

//         {/* City */}
//         <div>
//           <label className="block text-xs text-gray-500 mb-1">City *</label>
//           <input
//             type="text"
//             name="city"
//             value={formData.city}
//             onChange={handleChange}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//             required
//           />
//         </div>

//         {/* Address */}
//         <div className="col-span-2">
//           <label className="block text-xs text-gray-500 mb-1">Address</label>
//           <textarea
//             name="address"
//             value={formData.address}
//             onChange={handleChange}
//             rows="2"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//           />
//         </div>

//         {/* Remarks */}
//         <div className="col-span-2">
//           <label className="block text-xs text-gray-500 mb-1">Remarks</label>
//           <textarea
//             name="remarks"
//             value={formData.remarks}
//             onChange={handleChange}
//             rows="2"
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//           />
//         </div>

//         {/* Is Active */}
//         <div className="col-span-2">
//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               name="is_active"
//               checked={formData.is_active}
//               onChange={handleChange}
//               className="rounded border-gray-300"
//             />
//             <span className="text-sm text-gray-700">Active Vendor</span>
//           </label>
//         </div>
//       </div>
//     </div>
//   );
// }