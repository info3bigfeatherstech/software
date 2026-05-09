// features/vendors/vendorConstants.js

export const BUSINESS_TYPES = [
    { value: 'RETAILER', label: 'Retailer' },
    { value: 'WHOLESALER', label: 'Wholesaler' },
    { value: 'IMPORTER', label: 'Importer' },
    { value: 'EXPORTER', label: 'Exporter' },
    { value: 'DISTRIBUTOR', label: 'Distributor' }
  ];
  
  export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
  
  export const DEFAULT_PAGE_SIZE = 10;
  
  export const VALIDATION_RULES = {
    company_name: {
      min: 2,
      max: 200,
      required: true
    },
    phone: {
      length: 10,
      required: true
    },
    whatsapp: {
      length: 10,
      required: false
    },
    contact_person: {
      max: 100
    },
    vendor_type: {
      max: 50
    },
    address: {
      max: 500
    },
    remarks: {
      max: 500
    }
  };
  
  export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  
  export const PHONE_REGEX = /^\d{10}$/;