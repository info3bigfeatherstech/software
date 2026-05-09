// utils/vendorValidation.js
import { VALIDATION_RULES, GSTIN_REGEX, PHONE_REGEX } from "../REDUX_FEATURES/REDUX_SLICES/Vendor_api/vendorConstants";

export const validateVendorForm = (formData, isEdit = false) => {
  const errors = {};

  // Company Name Validation
  if (!formData.company_name || formData.company_name.trim() === "") {
    errors.company_name = "Company name is required";
  } else if (formData.company_name.length < VALIDATION_RULES.company_name.min) {
    errors.company_name = `Company name must be at least ${VALIDATION_RULES.company_name.min} characters`;
  } else if (formData.company_name.length > VALIDATION_RULES.company_name.max) {
    errors.company_name = `Company name cannot exceed ${VALIDATION_RULES.company_name.max} characters`;
  }

  // Phone Validation
  if (!formData.phone || formData.phone.trim() === "") {
    errors.phone = "Phone number is required";
  } else {
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      errors.phone = `Phone number must be exactly ${VALIDATION_RULES.phone.length} digits`;
    }
  }

  // WhatsApp Validation (if provided)
  if (formData.whatsapp && formData.whatsapp.trim() !== "") {
    const cleanWhatsapp = formData.whatsapp.replace(/\D/g, '');
    if (!PHONE_REGEX.test(cleanWhatsapp)) {
      errors.whatsapp = `WhatsApp number must be exactly ${VALIDATION_RULES.whatsapp.length} digits`;
    }
  }

  // Email Validation (if provided)
  if (formData.email && formData.email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
  }

  // GST Number Validation (if provided)
  // if (formData.gst_number && formData.gst_number.trim() !== "") {
  //   const cleanGst = formData.gst_number.trim().toUpperCase();
  //   if (!GSTIN_REGEX.test(cleanGst)) {
  //     errors.gst_number = "Please enter a valid GSTIN (e.g., 27AAAAA1234A1Z)";
  //   }
  // }

  // Required Fields
  if (!formData.supply_city || formData.supply_city.trim() === "") {
    errors.supply_city = "Supply city is required";
  }

  if (!formData.business_type || formData.business_type.trim() === "") {
    errors.business_type = "Business type is required";
  }

  if (!formData.city || formData.city.trim() === "") {
    errors.city = "City is required";
  }

  // Length Validations for optional fields
  if (formData.contact_person && formData.contact_person.length > VALIDATION_RULES.contact_person.max) {
    errors.contact_person = `Contact person name cannot exceed ${VALIDATION_RULES.contact_person.max} characters`;
  }

  if (formData.vendor_type && formData.vendor_type.length > VALIDATION_RULES.vendor_type.max) {
    errors.vendor_type = `Vendor type cannot exceed ${VALIDATION_RULES.vendor_type.max} characters`;
  }

  if (formData.address && formData.address.length > VALIDATION_RULES.address.max) {
    errors.address = `Address cannot exceed ${VALIDATION_RULES.address.max} characters`;
  }

  if (formData.remarks && formData.remarks.length > VALIDATION_RULES.remarks.max) {
    errors.remarks = `Remarks cannot exceed ${VALIDATION_RULES.remarks.max} characters`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(0, 10);
};