// TABS/INVENTORY/ProductShared/ProductAddForm.jsx

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useCreateProductMutation,
  useCreateProductWithImagesMutation,
  useUploadVariantImagesMutation,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productApi";
import {
  closeAddForm,
  updateFormData,
  setFormErrors,
  clearFormErrors,
  openVariantModal,
  openVariantModalForEdit,
  removeVariantFromList,
  setSubmitting,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productSlice";
import ProductFormBody from "./ProductFormBody";
import VariantModal from "./VariantModal";

// Helper to check if any images exist (product-level or any variant)
const hasAnyImages = (formData, variants) => {
  const productHasImages = (formData.newImages || []).length > 0;
  const variantHasImages = (variants || []).some(v => (v.newImages || []).length > 0);
  return productHasImages || variantHasImages;
};

// ── Build complete variants array (main variant + extra variants) ─────────────
const buildCompleteVariantsArray = (formData, extraVariants) => {
  const mainVariant = {
    attributes: [],
    mrp: Number(formData.mrp),
    wholesale_price: Number(formData.wholesale_price),
    retail_price: Number(formData.retail_price),
    online_price: formData.online_price ? Number(formData.online_price) : undefined,
    purchase_cost: formData.purchase_cost ? Number(formData.purchase_cost) : undefined,
    weight: formData.weight ? Number(formData.weight) : undefined,
    length: formData.length ? Number(formData.length) : undefined,
    width: formData.width ? Number(formData.width) : undefined,
    height: formData.height ? Number(formData.height) : undefined,
    low_stock_threshold: formData.low_stock_threshold ? Number(formData.low_stock_threshold) : 10,
    remarks: formData.remarks?.trim() || undefined,
    is_active: formData.is_active !== false,
  };
  
  const cleanedExtraVariants = extraVariants.map(({ newImages, imagesToKeep, imagesToDelete, ...rest }) => rest);
  
  return [mainVariant, ...cleanedExtraVariants];
};

// Build Base Payload (same for JSON or FormData)
const buildBasePayload = (formData, extraVariants) => {
  const base = {
    product_code: formData.product_code.trim().toUpperCase(),
    name: formData.name.trim(),
    title: formData.title?.trim() || undefined,
    primary_vendor_id: formData.primary_vendor_id,
    category_id: formData.category_id,
    hsn_code: formData.hsn_code.trim(),
    gst_percent: Number(formData.gst_percent),
    gst_type: formData.gst_type,
    unit_of_measure: formData.unit_of_measure,
  };
  
  if (formData.description?.trim())  base.description = formData.description.trim();
  if (formData.brand_name?.trim())   base.brand_name = formData.brand_name.trim();
  if (formData.remarks?.trim())      base.remarks = formData.remarks.trim();
  base.is_active = formData.is_active;
  
  base.variants = buildCompleteVariantsArray(formData, extraVariants);
  
  return base;
};

// Build FormData for multipart request
const buildMultipartFormData = (formData, extraVariants, basePayload) => {
  const multipartForm = new FormData();
  
  multipartForm.append("data", JSON.stringify(basePayload));
  
  const productImages = formData.newImages || [];
  productImages.forEach((file) => {
    if (file instanceof File) {
      multipartForm.append("variant_images_0", file);
    }
  });
  
  extraVariants.forEach((variant, idx) => {
    const variantIndex = idx + 1;
    const variantImages = variant.newImages || [];
    variantImages.forEach((img) => {
      if (img instanceof File) {
        multipartForm.append(`variant_images_${variantIndex}`, img);
      }
    });
  });
  
  return multipartForm;
};

export default function ProductAddForm({ formData, formErrors, variants, showVariantModal, variantForm, variantErrors, editingVariantIndex, onSave }) {
  const dispatch = useDispatch();
  const [createProductJson, { isLoading: isLoadingJson }] = useCreateProductMutation();
  const [createProductMulti, { isLoading: isLoadingMulti }] = useCreateProductWithImagesMutation();
  const [uploadVariantImages] = useUploadVariantImagesMutation();
  
  const isLoading = isLoadingJson || isLoadingMulti;

  const validate = () => {
    const errors = {};
    if (!formData.product_code?.trim())      errors.product_code = "Product code is required";
    if (!formData.name?.trim())              errors.name = "Product name is required";
    if (!formData.primary_vendor_id)         errors.primary_vendor_id = "Vendor is required";
    if (!formData.category_id)               errors.category_id = "Category is required";
    if (!formData.hsn_code?.trim())          errors.hsn_code = "HSN code is required";
    if (!formData.unit_of_measure)           errors.unit_of_measure = "Unit of measure is required";
    if (!formData.mrp || Number(formData.mrp) <= 0)
      errors.mrp = "MRP is required and must be > 0";
    if (!formData.wholesale_price || Number(formData.wholesale_price) <= 0)
      errors.wholesale_price = "Wholesale price is required";
    if (!formData.retail_price || Number(formData.retail_price) <= 0)
      errors.retail_price = "Retail price is required";
    return errors;
  };

  const handleSave = async () => {
    dispatch(clearFormErrors());
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      dispatch(setFormErrors(errors));
      return;
    }

    dispatch(setSubmitting(true));
    
    try {
      const basePayload = buildBasePayload(formData, variants);
      const hasImages = hasAnyImages(formData, variants);
      
      let created;
      
      if (hasImages) {
        const multipartForm = buildMultipartFormData(formData, variants, basePayload);
        created = await createProductMulti({ formData: multipartForm }).unwrap();
      } else {
        created = await createProductJson(basePayload).unwrap();
      }
      
      if (!hasImages && ((formData.newImages || []).length > 0 || variants.some(v => (v.newImages || []).length > 0))) {
        const productImages = formData.newImages || [];
        if (productImages.length > 0 && created?.variants?.[0]?.variant_id) {
          const fd = new FormData();
          productImages.forEach(f => {
            if (f instanceof File) fd.append("images", f);
          });
          await uploadVariantImages({
            productId: created.product_id,
            variantId: created.variants[0].variant_id,
            formData: fd,
          }).unwrap().catch(() => {});
        }
        
        if (variants.length > 0) {
          for (let i = 0; i < variants.length; i++) {
            const imgs = variants[i].newImages || [];
            const variantId = created?.variants?.[i + 1]?.variant_id;
            if (imgs.length > 0 && variantId) {
              const fd = new FormData();
              imgs.forEach(img => {
                if (img instanceof File) fd.append("images", img);
              });
              await uploadVariantImages({
                productId: created.product_id,
                variantId,
                formData: fd,
              }).unwrap().catch(() => {});
            }
          }
        }
      }
      
      onSave();
    } catch (err) {
      if (err?.data?.errors?.length) {
        const be = {};
        err.data.errors.forEach(({ field, message }) => { be[field] = message; });
        dispatch(setFormErrors(be));
      } else {
        dispatch(setFormErrors({ general: err?.data?.message || "Failed to create product" }));
      }
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 p-6 space-y-6 max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Add New Product</h3>
              <p className="text-xs text-gray-400 mt-0.5">Fill product details — add extra variants below</p>
            </div>
            <button onClick={() => dispatch(closeAddForm())} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
          </div>

          {formErrors?.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <p className="text-sm text-red-600">{formErrors.general}</p>
            </div>
          )}

          <ProductFormBody
            formData={formData}
            onChange={(data) => dispatch(updateFormData(data))}
            formErrors={formErrors}
          />

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Extra Variants</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Prices above = Variant 0 (default). Add more variants here.
                </p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(openVariantModal())}
                className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 cursor-pointer"
              >
                + Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
                No extra variants — product will be created as single variant
              </div>
            ) : (
              <div className="space-y-2">
                {variants.map((v, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-gray-500">V{i + 1}</span>
                      <div>
                        {v.attributes?.length > 0 && (
                          <p className="text-xs font-medium text-gray-700">
                            {v.attributes.map(a => `${a.key}: ${a.value}`).join(", ")}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">
                          MRP ₹{v.mrp} · WS ₹{v.wholesale_price} · Retail ₹{v.retail_price}
                        </p>
                        {v.weight && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Shipping: {v.weight}kg · {v.length}x{v.width}x{v.height}cm
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => dispatch(openVariantModalForEdit({ index: i }))}
                        className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch(removeVariantFromList(i))}
                        className="text-xs text-red-500 hover:text-red-700 cursor-pointer font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => dispatch(closeAddForm())} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? "Creating…" : `Create Product${variants.length > 0 ? ` (${variants.length + 1} variants)` : ""}`}
            </button>
          </div>

        </div>
      </div>

      {showVariantModal && (
        <VariantModal
          variantForm={variantForm}
          variantErrors={variantErrors}
          editingVariantIndex={editingVariantIndex}
        />
      )}
    </>
  );
}


// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   useCreateProductMutation,
//   useCreateProductWithImagesMutation,
//   useUploadVariantImagesMutation,
// } from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productApi";
// import {
//   closeAddForm,
//   updateFormData,
//   setFormErrors,
//   clearFormErrors,
//   openVariantModal,
//   openVariantModalForEdit,
//   removeVariantFromList,
//   setSubmitting,
// } from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productSlice";
// import ProductFormBody from "./ProductFormBody";
// import VariantModal from "./VariantModal";

// // Helper to check if any images exist (product-level or any variant)
// const hasAnyImages = (formData, variants) => {
//   if ((formData.images || []).length > 0) return true;
//   return (variants || []).some(v => (v.images || []).length > 0);
// };

// // Build FormData for multipart request
// const buildMultipartFormData = (formData, variants, basePayload) => {
//   const multipartForm = new FormData();
  
//   // Add the JSON data field
//   multipartForm.append("data", JSON.stringify(basePayload));
  
//   // Add product-level images (variant index 0)
//   const productImages = formData.images || [];
//   productImages.forEach((file) => {
//     if (file instanceof File) {
//       multipartForm.append("variant_images_0", file);
//     } else if (file?.file instanceof File) {
//       multipartForm.append("variant_images_0", file.file);
//     }
//   });
  
//   // Add variant images (index 1, 2, 3...)
//   (variants || []).forEach((variant, idx) => {
//     const variantIndex = idx + 1; // variant 0 = product, variant 1+ = extra
//     const variantImages = variant.images || [];
//     variantImages.forEach((img) => {
//       if (img instanceof File) {
//         multipartForm.append(`variant_images_${variantIndex}`, img);
//       } else if (img?.file instanceof File) {
//         multipartForm.append(`variant_images_${variantIndex}`, img.file);
//       }
//     });
//   });
  
//   return multipartForm;
// };

// export default function ProductAddForm({ formData, formErrors, variants, showVariantModal, variantForm, variantErrors, editingVariantIndex, onSave }) {
//   const dispatch = useDispatch();
//   const [createProductJson, { isLoading: isLoadingJson }] = useCreateProductMutation();
//   const [createProductMulti, { isLoading: isLoadingMulti }] = useCreateProductWithImagesMutation();
//   const [uploadVariantImages] = useUploadVariantImagesMutation();
  
//   const isLoading = isLoadingJson || isLoadingMulti;

//   // ── Validation ─────────────────────────────────────────────────────────────
//   const validate = () => {
//     const errors = {};
//     if (!formData.product_code?.trim())      errors.product_code = "Product code is required";
//     if (!formData.name?.trim())              errors.name = "Product name is required";
//     if (!formData.primary_vendor_id)         errors.primary_vendor_id = "Vendor is required";
//     if (!formData.category_id)               errors.category_id = "Category is required";
//     if (!formData.hsn_code?.trim())          errors.hsn_code = "HSN code is required";
//     if (!formData.unit_of_measure)           errors.unit_of_measure = "Unit of measure is required";
//     if (!formData.mrp || Number(formData.mrp) <= 0)
//       errors.mrp = "MRP is required and must be > 0";
//     if (!formData.wholesale_price || Number(formData.wholesale_price) <= 0)
//       errors.wholesale_price = "Wholesale price is required";
//     if (!formData.retail_price || Number(formData.retail_price) <= 0)
//       errors.retail_price = "Retail price is required";
//     return errors;
//   };

//   // ── Build Base Payload (same for JSON or FormData) ────────────────────────
//   const buildBasePayload = () => {
//     const base = {
//       product_code: formData.product_code.trim().toUpperCase(),
//       name: formData.name.trim(),
//       primary_vendor_id: formData.primary_vendor_id,
//       category_id: formData.category_id,
//       hsn_code: formData.hsn_code.trim(),
//       gst_percent: Number(formData.gst_percent),
//       gst_type: formData.gst_type,
//       unit_of_measure: formData.unit_of_measure,
//       mrp: Number(formData.mrp),
//       wholesale_price: Number(formData.wholesale_price),
//       retail_price: Number(formData.retail_price),
//     };
    
//     if (formData.description?.trim())  base.description = formData.description.trim();
//     if (formData.brand_name?.trim())   base.brand_name = formData.brand_name.trim();
//     if (formData.online_price)         base.online_price = Number(formData.online_price);
//     if (formData.purchase_cost)        base.purchase_cost = Number(formData.purchase_cost);
//     if (formData.remarks?.trim())      base.remarks = formData.remarks.trim();
//     base.is_active = formData.is_active;
    
//     // Multi-variant: attach variants array (strip images — handled separately)
//     if (variants.length > 0) {
//       base.variants = variants.map(({ images, ...rest }) => rest);
//     }
    
//     return base;
//   };

//   // ── Submit ─────────────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     dispatch(clearFormErrors());
//     const errors = validate();
//     if (Object.keys(errors).length > 0) {
//       dispatch(setFormErrors(errors));
//       return;
//     }

//     dispatch(setSubmitting(true));
    
//     try {
//       const basePayload = buildBasePayload();
//       const hasImages = hasAnyImages(formData, variants);
      
//       let created;
      
//       if (hasImages) {
//         // ── Use Multipart (images in same request) ────────────────────────
//         const multipartForm = buildMultipartFormData(formData, variants, basePayload);
//         created = await createProductMulti({ formData: multipartForm }).unwrap();
//       } else {
//         // ── Use JSON only ──────────────────────────────────────────────────
//         created = await createProductJson(basePayload).unwrap();
//       }
      
//       // ── If we used JSON-only but have images (should not happen), upload separately
//       if (!hasImages && (formData.images?.length > 0 || variants.some(v => v.images?.length > 0))) {
//         // Upload images for product-level (variant 0 / first variant)
//         const productImages = formData.images || [];
//         if (productImages.length > 0 && created?.variants?.[0]?.variant_id) {
//           const fd = new FormData();
//           productImages.forEach(f => {
//             const file = f instanceof File ? f : f?.file;
//             if (file instanceof File) fd.append("images", file);
//           });
//           await uploadVariantImages({
//             productId: created.product_id,
//             variantId: created.variants[0].variant_id,
//             formData: fd,
//           }).unwrap().catch(() => {});
//         }
        
//         // Upload images for extra variants
//         if (variants.length > 0) {
//           for (let i = 0; i < variants.length; i++) {
//             const imgs = variants[i].images || [];
//             const variantId = created?.variants?.[i]?.variant_id;
//             if (imgs.length > 0 && variantId) {
//               const fd = new FormData();
//               imgs.forEach(img => {
//                 const file = img instanceof File ? img : img?.file;
//                 if (file instanceof File) fd.append("images", file);
//               });
//               await uploadVariantImages({
//                 productId: created.product_id,
//                 variantId,
//                 formData: fd,
//               }).unwrap().catch(() => {});
//             }
//           }
//         }
//       }
      
//       onSave();
//     } catch (err) {
//       if (err?.data?.errors?.length) {
//         const be = {};
//         err.data.errors.forEach(({ field, message }) => { be[field] = message; });
//         dispatch(setFormErrors(be));
//       } else {
//         dispatch(setFormErrors({ general: err?.data?.message || "Failed to create product" }));
//       }
//     } finally {
//       dispatch(setSubmitting(false));
//     }
//   };

//   return (
//     <>
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//         <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 p-6 space-y-6 max-h-[90vh] overflow-y-auto">

//           {/* Header */}
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-base font-semibold text-gray-800">Add New Product</h3>
//               <p className="text-xs text-gray-400 mt-0.5">Fill product details — add extra variants below</p>
//             </div>
//             <button onClick={() => dispatch(closeAddForm())} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
//           </div>

//           {/* General error */}
//           {formErrors?.general && (
//             <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
//               <p className="text-sm text-red-600">{formErrors.general}</p>
//             </div>
//           )}

//           {/* Form Body */}
//           <ProductFormBody
//             formData={formData}
//             onChange={(data) => dispatch(updateFormData(data))}
//             formErrors={formErrors}
//           />

//           {/* ── Variants Section ──────────────────────────────────────────── */}
//           <div className="border-t border-gray-100 pt-4">
//             <div className="flex items-center justify-between mb-3">
//               <div>
//                 <p className="text-sm font-semibold text-gray-700">Extra Variants</p>
//                 <p className="text-xs text-gray-400 mt-0.5">
//                   Prices above = Variant 0 (default). Add more variants here.
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => dispatch(openVariantModal())}
//                 className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 cursor-pointer"
//               >
//                 + Add Variant
//               </button>
//             </div>

//             {/* Variants list */}
//             {variants.length === 0 ? (
//               <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
//                 No extra variants — product will be created as single variant
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {variants.map((v, i) => (
//                   <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
//                     <div className="flex items-center gap-4">
//                       <span className="text-xs font-mono text-gray-500">V{i + 1}</span>
//                       <div>
//                         {v.attributes?.length > 0 && (
//                           <p className="text-xs font-medium text-gray-700">
//                             {v.attributes.map(a => `${a.key}: ${a.value}`).join(", ")}
//                           </p>
//                         )}
//                         <p className="text-xs text-gray-500 mt-0.5">
//                           MRP ₹{v.mrp} · WS ₹{v.wholesale_price} · Retail ₹{v.retail_price}
//                         </p>
//                       </div>
//                     </div>
//                     <div className="flex gap-3">
//                       <button
//                         type="button"
//                         onClick={() => dispatch(openVariantModalForEdit({ index: i }))}
//                         className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => dispatch(removeVariantFromList(i))}
//                         className="text-xs text-red-500 hover:text-red-700 cursor-pointer font-medium"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Actions */}
//           <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
//             <button onClick={() => dispatch(closeAddForm())} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               disabled={isLoading}
//               className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
//             >
//               {isLoading ? "Creating…" : `Create Product${variants.length > 0 ? ` (${variants.length + 1} variants)` : ""}`}
//             </button>
//           </div>

//         </div>
//       </div>

//       {/* VariantModal rendered at z-60 so it sits above this modal */}
//       {showVariantModal && (
//         <VariantModal
//           variantForm={variantForm}
//           variantErrors={variantErrors}
//           editingVariantIndex={editingVariantIndex}
//         />
//       )}
//     </>
//   );
// }