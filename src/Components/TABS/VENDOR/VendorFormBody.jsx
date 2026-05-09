// components/vendors/VendorFormBody.jsx
import React from "react";

export default function VendorFormBody({ formData, setFormData, isEditing = false }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Company Name */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Company Name *</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">WhatsApp</label>
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Contact Person</label>
          <input
            type="text"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* GST Number */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">GST Number</label>
          <input
            type="text"
            name="gst_number"
            value={formData.gst_number}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Vendor Type */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Vendor Type</label>
          <input
            type="text"
            name="vendor_type"
            value={formData.vendor_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="e.g., Raw Material, Packaging"
          />
        </div>

        {/* Supply City */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Supply City *</label>
          <input
            type="text"
            name="supply_city"
            value={formData.supply_city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Business Type</label>
          <input
            type="text"
            name="business_type"
            value={formData.business_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="e.g., RETAILER, WHOLESALER"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
        </div>

        {/* Address */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>

        {/* Remarks */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 mb-1">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
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