// TABS/INVENTORY/ProductShared/VariantModal.jsx

import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import {
  closeVariantModal,
  updateVariantForm,
  updateVariantAttribute,
  addVariantAttributeRow,
  removeVariantAttributeRow,
  setVariantErrors,
  clearVariantErrors,
  addVariantImages,
  removeVariantImage,
  replaceVariantImage,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productSlice";

export default function VariantModal({ variantForm, variantErrors, editingVariantIndex, onSaveOverride }) {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const replaceFileInputRef = useRef(null);
  const [pendingReplaceIndex, setPendingReplaceIndex] = React.useState(null);
  const [pendingReplaceIsExisting, setPendingReplaceIsExisting] = React.useState(null);
  const isEditing = editingVariantIndex !== null;

  const inputCls = (name) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${variantErrors?.[name] ? "border-red-400" : "border-gray-300"
    }`;

  const errorMsg = (name) =>
    variantErrors?.[name] ? <p className="text-xs text-red-500 mt-1">{variantErrors[name]}</p> : null;

  const field = (name) => ({
    value: variantForm[name] ?? "",
    onChange: (e) => dispatch(updateVariantForm({ [name]: e.target.value })),
  });

  // ── Image handling with Delete + Replace ────────────────────────────────────
  const getImageSrc = (img, isExisting, isNew) => {
    if (isExisting && img?.url) return img.url;
    if (isNew && img instanceof File) return URL.createObjectURL(img);
    if (typeof img === "string") return img;
    if (img?.url) return img.url;
    return "";
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      dispatch(addVariantImages(files));
    }
    e.target.value = "";
  };

  const handleReplaceClick = (index, isExisting, imageId = null) => {
    setPendingReplaceIndex(index);
    setPendingReplaceIsExisting(isExisting);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && pendingReplaceIndex !== null) {
      dispatch(replaceVariantImage({
        index: pendingReplaceIndex,
        isExisting: pendingReplaceIsExisting,
        imageId: pendingReplaceIsExisting ? variantForm.imagesToKeep?.[pendingReplaceIndex]?.image_id : null,
        file: file,
      }));
    }
    setPendingReplaceIndex(null);
    setPendingReplaceIsExisting(null);
    e.target.value = "";
  };

  const handleDelete = (index, isExisting, imageId = null) => {
    if (window.confirm("Delete this image?")) {
      dispatch(removeVariantImage({ index, isExisting, imageId }));
    }
  };

  const existingImages = variantForm.imagesToKeep || [];
  const newImages = variantForm.newImages || [];
  const allImages = [...existingImages, ...newImages];
  // Swap logic for primary image (index 0 = primary)
  const setPrimaryImage = (images, index) => {
    if (index === 0) return images;
    const reordered = [...images];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    return reordered;
  };

  const validate = () => {
    const errors = {};
    if (!variantForm.mrp) errors.mrp = "MRP is required";
    if (!variantForm.wholesale_price) errors.wholesale_price = "Wholesale price is required";
    if (!variantForm.retail_price) errors.retail_price = "Retail price is required";
    if (Number(variantForm.mrp) <= 0) errors.mrp = "MRP must be greater than 0";
    return errors;
  };

  const handleSave = () => {
    dispatch(clearVariantErrors());
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      dispatch(setVariantErrors(errors));
      return;
    }

    const variant = {
      variant_id: variantForm.variant_id,
      variant_code: variantForm.variant_code,
      system_barcode: variantForm.system_barcode,
      attributes: (variantForm.attributes || []).filter(a => a.key?.trim() && a.value?.trim()),
      mrp: Number(variantForm.mrp),
      wholesale_price: Number(variantForm.wholesale_price),
      retail_price: Number(variantForm.retail_price),
      online_price: variantForm.online_price ? Number(variantForm.online_price) : undefined,
      purchase_cost: variantForm.purchase_cost ? Number(variantForm.purchase_cost) : undefined,
      weight: variantForm.weight ? Number(variantForm.weight) : undefined,
      length: variantForm.length ? Number(variantForm.length) : undefined,
      width: variantForm.width ? Number(variantForm.width) : undefined,
      height: variantForm.height ? Number(variantForm.height) : undefined,
      low_stock_threshold: variantForm.low_stock_threshold ? Number(variantForm.low_stock_threshold) : 10,
      remarks: variantForm.remarks?.trim() || undefined,
      imagesToKeep: variantForm.imagesToKeep || [],
      imagesToDelete: variantForm.imagesToDelete || [],
      newImages: variantForm.newImages || [],
      is_active: variantForm.is_active !== false,
    };

    if (onSaveOverride) {
      onSaveOverride(variant);
      dispatch(closeVariantModal());
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 text-gray-700">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              {isEditing ? "Edit Variant" : "Add Variant"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Fill prices, attributes, and shipping for this variant
            </p>
          </div>
          <button onClick={() => dispatch(closeVariantModal())} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <span className="text-sm font-medium text-gray-700">Variant Active</span>
            <p className="text-xs text-gray-400 mt-0.5">Inactive variants won't show on website</p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(updateVariantForm({ is_active: !variantForm.is_active }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${variantForm.is_active !== false ? "bg-indigo-500" : "bg-gray-300"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${variantForm.is_active !== false ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attributes</label>
            <button
              type="button"
              onClick={() => dispatch(addVariantAttributeRow())}
              className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
            >
              + Add Row
            </button>
          </div>
          <div className="space-y-2">
            {(variantForm.attributes || [{ key: "", value: "" }]).map((attr, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={attr.key}
                  onChange={(e) => dispatch(updateVariantAttribute({ index: i, key: e.target.value, value: attr.value }))}
                  placeholder="e.g. Color"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={attr.value}
                  onChange={(e) => dispatch(updateVariantAttribute({ index: i, key: attr.key, value: e.target.value }))}
                  placeholder="e.g. Red"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {(variantForm.attributes || []).length > 1 && (
                  <button
                    type="button"
                    onClick={() => dispatch(removeVariantAttributeRow(i))}
                    className="text-red-400 hover:text-red-600 text-sm cursor-pointer px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prices</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">MRP <span className="text-red-500">*</span></label>
              <input type="number" {...field("mrp")} placeholder="₹" className={inputCls("mrp")} />
              {errorMsg("mrp")}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Wholesale Price <span className="text-red-500">*</span></label>
              <input type="number" {...field("wholesale_price")} placeholder="₹" className={inputCls("wholesale_price")} />
              {errorMsg("wholesale_price")}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Retail Price <span className="text-red-500">*</span></label>
              <input type="number" {...field("retail_price")} placeholder="₹" className={inputCls("retail_price")} />
              {errorMsg("retail_price")}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Online Price</label>
              <input type="number" {...field("online_price")} placeholder="₹" className={inputCls("online_price")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Cost</label>
              <input type="number" {...field("purchase_cost")} placeholder="₹" className={inputCls("purchase_cost")} />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Shipping <span className="text-gray-400 font-normal normal-case">(for e-commerce sync)</span>
          </p>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
              <input type="number" step="0.01" {...field("weight")} placeholder="0.25" className={inputCls("weight")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Length (cm)</label>
              <input type="number" {...field("length")} placeholder="30" className={inputCls("length")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Width (cm)</label>
              <input type="number" {...field("width")} placeholder="20" className={inputCls("width")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Height (cm)</label>
              <input type="number" {...field("height")} placeholder="5" className={inputCls("height")} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Low Stock Threshold</label>
            <input type="number" {...field("low_stock_threshold")} placeholder="10" className={inputCls("low_stock_threshold")} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
            <input {...field("remarks")} placeholder="Optional" className={inputCls("remarks")} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Images <span className="text-gray-400 font-normal normal-case">(optional — max 4)</span>
          </p>

          {allImages.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {allImages.map((img, i) => {
                const isExisting = i < existingImages.length;
                const imgSrc = getImageSrc(img, isExisting, !isExisting);
                const imageId = isExisting ? img.image_id : null;
                const isPrimary = i === 0;

                return (
                  <div key={isExisting ? imageId || i : `new-${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 group transition-all" style={{ borderColor: isPrimary ? '#F7A221' : '#e5e7eb' }}>
                    {/* Primary Badge */}
                    {isPrimary && (
                      <div className="absolute top-0 left-0 w-full bg-[#F7A221]/90 text-black text-[8px] font-bold text-center py-0.5 z-10">
                        PRIMARY
                      </div>
                    )}

                    <img src={imgSrc} alt={`v-img-${i}`} className="w-full h-full object-cover" />

                    {/* Overlay buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => {
                            const reordered = setPrimaryImage(allImages, i);
                            if (isExisting) {
                              const newKeep = setPrimaryImage(existingImages, i);
                              dispatch(updateVariantForm({ imagesToKeep: newKeep, newImages: newImages }));
                            } else {
                              const newIdx = i - existingImages.length;
                              const reorderedNew = setPrimaryImage(newImages, newIdx);
                              dispatch(updateVariantForm({ imagesToKeep: existingImages, newImages: reorderedNew }));
                            }
                          }}
                          className="px-1.5 py-0.5 bg-[#F7A221] text-black text-[9px] rounded font-medium hover:bg-[#e89510]"
                        >
                          Set Primary
                        </button>
                      )}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(i, isExisting, imageId)}
                          className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                          title="Delete image"
                        >
                          ×
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReplaceClick(i, isExisting, imageId)}
                          className="w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-blue-600"
                          title="Replace image"
                        >
                          ↻
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
          <input ref={replaceFileInputRef} type="file" accept="image/*" onChange={handleReplaceFileChange} className="hidden" />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={allImages.length >= 4}
            className="px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-40 transition-colors"
          >
            + Upload Images
          </button>
          <p className="text-xs text-gray-400 mt-1">Hover over image to see Delete (×) and Replace (↻) buttons</p>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button onClick={() => dispatch(closeVariantModal())} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">
            {isEditing ? "Update Variant" : "Save Variant"}
          </button>
        </div>

      </div>
    </div>
  );
}
// // TABS/INVENTORY/ProductShared/VariantModal.jsx
// //
// // Responsibility: Build variant objects in frontend before final product submit.
// // Does NOT call any API directly.
// // On Save → dispatches saveVariantToList → variant appears in ProductAddForm list.
// // On Edit → dispatches openVariantModalForEdit → pre-fills form → save updates list.
// // Image upload included — not required, no validation.
// // Supports onSaveOverride prop for EditProductModal (POST /products/:id/variants)

// import React, { useRef } from "react";
// import { useDispatch } from "react-redux";
// import {
//   closeVariantModal,
//   updateVariantForm,
//   updateVariantAttribute,
//   addVariantAttributeRow,
//   removeVariantAttributeRow,
//   saveVariantToList,
//   setVariantErrors,
//   clearVariantErrors,
// } from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productSlice";

// export default function VariantModal({ variantForm, variantErrors, editingVariantIndex, onSaveOverride }) {
//   const dispatch   = useDispatch();
//   const fileRef    = useRef(null);
//   const isEditing  = editingVariantIndex !== null;

//   const inputCls = (name) =>
//     `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//       variantErrors?.[name] ? "border-red-400" : "border-gray-300"
//     }`;

//   const errorMsg = (name) =>
//     variantErrors?.[name] ? <p className="text-xs text-red-500 mt-1">{variantErrors[name]}</p> : null;

//   const field = (name) => ({
//     value: variantForm[name] ?? "",
//     onChange: (e) => dispatch(updateVariantForm({ [name]: e.target.value })),
//   });

//   // ── Image handling ────────────────────────────────────────────────────────
//   const handleImageChange = (e) => {
//     const files    = Array.from(e.target.files || []);
//     const existing = variantForm.images || [];
//     dispatch(updateVariantForm({ images: [...existing, ...files].slice(0, 4) }));
//   };

//   const removeImage = (index) => {
//     const updated = (variantForm.images || []).filter((_, i) => i !== index);
//     dispatch(updateVariantForm({ images: updated }));
//   };

//   // ── Validation ────────────────────────────────────────────────────────────
//   const validate = () => {
//     const errors = {};
//     if (!variantForm.mrp)             errors.mrp             = "MRP is required";
//     if (!variantForm.wholesale_price) errors.wholesale_price = "Wholesale price is required";
//     if (!variantForm.retail_price)    errors.retail_price    = "Retail price is required";
//     if (Number(variantForm.mrp) <= 0) errors.mrp             = "MRP must be greater than 0";
//     return errors;
//   };

//   // ── Save to list or call override ─────────────────────────────────────────
//   const handleSave = () => {
//     dispatch(clearVariantErrors());
//     const errors = validate();
//     if (Object.keys(errors).length > 0) {
//       dispatch(setVariantErrors(errors));
//       return;
//     }

//     const variant = {
//       attributes:          (variantForm.attributes || []).filter(a => a.key?.trim() && a.value?.trim()),
//       mrp:                 Number(variantForm.mrp),
//       wholesale_price:     Number(variantForm.wholesale_price),
//       retail_price:        Number(variantForm.retail_price),
//       online_price:        variantForm.online_price ? Number(variantForm.online_price) : undefined,
//       purchase_cost:       variantForm.purchase_cost ? Number(variantForm.purchase_cost) : undefined,
//       weight:              variantForm.weight ? Number(variantForm.weight) : undefined,
//       length:              variantForm.length ? Number(variantForm.length) : undefined,
//       width:               variantForm.width  ? Number(variantForm.width)  : undefined,
//       height:              variantForm.height ? Number(variantForm.height) : undefined,
//       low_stock_threshold: variantForm.low_stock_threshold ? Number(variantForm.low_stock_threshold) : 10,
//       remarks:             variantForm.remarks?.trim() || undefined,
//       images:              variantForm.images || [],
//       is_active:           variantForm.is_active !== false,  // ← Active toggle value
//     };

//     // If onSaveOverride provided (edit mode), call it instead of Redux action
//     if (onSaveOverride) {
//       onSaveOverride(variant);
//       dispatch(closeVariantModal());
//     } else {
//       dispatch(saveVariantToList(variant));
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 text-gray-700">
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">

//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-base font-semibold text-gray-800">
//               {isEditing ? "Edit Variant" : "Add Variant"}
//             </h3>
//             <p className="text-xs text-gray-400 mt-0.5">
//               Fill prices, attributes, and shipping for this variant
//             </p>
//           </div>
//           <button onClick={() => dispatch(closeVariantModal())} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
//         </div>

//         {/* ── Active Status Toggle ────────────────────────────────────────── */}
//         <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
//           <div>
//             <span className="text-sm font-medium text-gray-700">Variant Active</span>
//             <p className="text-xs text-gray-400 mt-0.5">Inactive variants won't show on website</p>
//           </div>
//           <button
//             type="button"
//             onClick={() => dispatch(updateVariantForm({ is_active: !variantForm.is_active }))}
//             className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${variantForm.is_active !== false ? "bg-indigo-500" : "bg-gray-300"}`}
//           >
//             <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${variantForm.is_active !== false ? "translate-x-6" : "translate-x-1"}`} />
//           </button>
//         </div>

//         {/* ── Attributes ──────────────────────────────────────────────── */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attributes</label>
//             <button
//               type="button"
//               onClick={() => dispatch(addVariantAttributeRow())}
//               className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
//             >
//               + Add Row
//             </button>
//           </div>
//           <div className="space-y-2">
//             {(variantForm.attributes || [{ key: "", value: "" }]).map((attr, i) => (
//               <div key={i} className="flex gap-2 items-center">
//                 <input
//                   value={attr.key}
//                   onChange={(e) => dispatch(updateVariantAttribute({ index: i, key: e.target.value, value: attr.value }))}
//                   placeholder="e.g. Color"
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <input
//                   value={attr.value}
//                   onChange={(e) => dispatch(updateVariantAttribute({ index: i, key: attr.key, value: e.target.value }))}
//                   placeholder="e.g. Red"
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 {(variantForm.attributes || []).length > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => dispatch(removeVariantAttributeRow(i))}
//                     className="text-red-400 hover:text-red-600 text-sm cursor-pointer px-1"
//                   >
//                     ×
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ── Prices ──────────────────────────────────────────────────── */}
//         <div>
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prices</p>
//           <div className="grid grid-cols-2 gap-4">

//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">MRP <span className="text-red-500">*</span></label>
//               <input type="number" {...field("mrp")} placeholder="₹" className={inputCls("mrp")} />
//               {errorMsg("mrp")}
//             </div>

//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Wholesale Price <span className="text-red-500">*</span></label>
//               <input type="number" {...field("wholesale_price")} placeholder="₹" className={inputCls("wholesale_price")} />
//               {errorMsg("wholesale_price")}
//             </div>

//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Retail Price <span className="text-red-500">*</span></label>
//               <input type="number" {...field("retail_price")} placeholder="₹" className={inputCls("retail_price")} />
//               {errorMsg("retail_price")}
//             </div>

//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Online Price</label>
//               <input type="number" {...field("online_price")} placeholder="₹" className={inputCls("online_price")} />
//             </div>

//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Cost</label>
//               <input type="number" {...field("purchase_cost")} placeholder="₹" className={inputCls("purchase_cost")} />
//             </div>

//           </div>
//         </div>

//         {/* ── Shipping ────────────────────────────────────────────────── */}
//         <div>
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//             Shipping <span className="text-gray-400 font-normal normal-case">(for e-commerce sync)</span>
//           </p>
//           <div className="grid grid-cols-4 gap-3">
//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
//               <input type="number" step="0.01" {...field("weight")} placeholder="0.25" className={inputCls("weight")} />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Length (cm)</label>
//               <input type="number" {...field("length")} placeholder="30" className={inputCls("length")} />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Width (cm)</label>
//               <input type="number" {...field("width")} placeholder="20" className={inputCls("width")} />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Height (cm)</label>
//               <input type="number" {...field("height")} placeholder="5" className={inputCls("height")} />
//             </div>
//           </div>
//         </div>

//         {/* ── Settings ────────────────────────────────────────────────── */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Low Stock Threshold</label>
//             <input type="number" {...field("low_stock_threshold")} placeholder="10" className={inputCls("low_stock_threshold")} />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
//             <input {...field("remarks")} placeholder="Optional" className={inputCls("remarks")} />
//           </div>
//         </div>

//         {/* ── Images (optional) ───────────────────────────────────────── */}
//         <div>
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
//             Images <span className="text-gray-400 font-normal normal-case">(optional)</span>
//           </p>
//           {(variantForm.images || []).length > 0 && (
//             <div className="flex gap-2 flex-wrap mb-2">
//               {(variantForm.images || []).map((file, i) => (
//                 <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
//                   <img
//                     src={typeof file === "string" ? file : URL.createObjectURL(file)}
//                     alt={`v-img-${i}`}
//                     className="w-full h-full object-cover"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => removeImage(i)}
//                     className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//           <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
//           <button
//             type="button"
//             onClick={() => fileRef.current?.click()}
//             disabled={(variantForm.images || []).length >= 4}
//             className="px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-40"
//           >
//             + Upload Images
//           </button>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
//           <button onClick={() => dispatch(closeVariantModal())} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
//             Cancel
//           </button>
//           <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">
//             {isEditing ? "Update Variant" : "Save Variant"}
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }
// down code is right but upper code have toggle for active inactive
// // TABS/INVENTORY/ProductShared/VariantModal.jsx
// //
// // Responsibility: Build variant objects in frontend before final product submit.
// // Does NOT call any API directly.
// // On Save → dispatches saveVariantToList → variant appears in ProductAddForm list.
// // On Edit → dispatches openVariantModalForEdit → pre-fills form → save updates list.
// // Image upload included — not required, no validation.

// import React, { useRef } from "react";
// import { useDispatch } from "react-redux";
// import {
//   closeVariantModal,
//   updateVariantForm,
//   updateVariantAttribute,
//   addVariantAttributeRow,
//   removeVariantAttributeRow,
//   saveVariantToList,
//   setVariantErrors,
//   clearVariantErrors,
// } from "../../../../REDUX_FEATURES/REDUX_SLICES/Product_api/productSlice";

// export default function VariantModal({ variantForm, variantErrors, editingVariantIndex }) {
//   const dispatch   = useDispatch();
//   const fileRef    = useRef(null);
//   const isEditing  = editingVariantIndex !== null;

//   const inputCls = (name) =>
//     `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//       variantErrors?.[name] ? "border-red-400" : "border-gray-300"
//     }`;

//   const errorMsg = (name) =>
//     variantErrors?.[name] ? <p className="text-xs text-red-500 mt-1">{variantErrors[name]}</p> : null;

//   const field = (name) => ({
//     value: variantForm[name] ?? "",
//     onChange: (e) => dispatch(updateVariantForm({ [name]: e.target.value })),
//   });

//   // ── Image handling ────────────────────────────────────────────────────────
//   const handleImageChange = (e) => {
//     const files    = Array.from(e.target.files || []);
//     const existing = variantForm.images || [];
//     dispatch(updateVariantForm({ images: [...existing, ...files].slice(0, 4) }));
//   };

//   const removeImage = (index) => {
//     const updated = (variantForm.images || []).filter((_, i) => i !== index);
//     dispatch(updateVariantForm({ images: updated }));
//   };

//   // ── Validation ────────────────────────────────────────────────────────────
//   const validate = () => {
//     const errors = {};
//     if (!variantForm.mrp)             errors.mrp             = "MRP is required";
//     if (!variantForm.wholesale_price) errors.wholesale_price = "Wholesale price is required";
//     if (!variantForm.retail_price)    errors.retail_price    = "Retail price is required";
//     if (Number(variantForm.mrp) <= 0) errors.mrp             = "MRP must be greater than 0";
//     return errors;
//   };

//   // ── Save to list ──────────────────────────────────────────────────────────
//   const handleSave = () => {
//     dispatch(clearVariantErrors());
//     const errors = validate();
//     if (Object.keys(errors).length > 0) {
//       dispatch(setVariantErrors(errors));
//       return;
//     }

//     const variant = {
//       attributes:          (variantForm.attributes || []).filter(a => a.key?.trim() && a.value?.trim()),
//       mrp:                 Number(variantForm.mrp),
//       wholesale_price:     Number(variantForm.wholesale_price),
//       retail_price:        Number(variantForm.retail_price),
//       online_price:        variantForm.online_price ? Number(variantForm.online_price) : undefined,
//       purchase_cost:       variantForm.purchase_cost ? Number(variantForm.purchase_cost) : undefined,
//       weight:              variantForm.weight ? Number(variantForm.weight) : undefined,
//       length:              variantForm.length ? Number(variantForm.length) : undefined,
//       width:               variantForm.width  ? Number(variantForm.width)  : undefined,
//       height:              variantForm.height ? Number(variantForm.height) : undefined,
//       low_stock_threshold: variantForm.low_stock_threshold ? Number(variantForm.low_stock_threshold) : 10,
//       remarks:             variantForm.remarks?.trim() || undefined,
//       images:              variantForm.images || [],   // kept for post-create upload
//     };

//     dispatch(saveVariantToList(variant));
//   };

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 text-gray-700">
//       <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">

//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h3 className="text-base font-semibold text-gray-800">
//               {isEditing ? "Edit Variant" : "Add Variant"}
//             </h3>
//             <p className="text-xs text-gray-400 mt-0.5">
//               Fill prices and attributes for this variant
//             </p>
//           </div>
//           <button onClick={() => dispatch(closeVariantModal())} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer">✕</button>
//         </div>

//         {/* ── Attributes ──────────────────────────────────────────────── */}
//         <div>
//           <div className="flex items-center justify-between mb-2">
//             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attributes</label>
//             <button
//               type="button"
//               onClick={() => dispatch(addVariantAttributeRow())}
//               className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer font-medium"
//             >
//               + Add Row
//             </button>
//           </div>
//           <div className="space-y-2">
//             {(variantForm.attributes || [{ key: "", value: "" }]).map((attr, i) => (
//               <div key={i} className="flex gap-2 items-center">
//                 <input
//                   value={attr.key}
//                   onChange={(e) => dispatch(updateVariantAttribute({ index: i, key: e.target.value, value: attr.value }))}
//                   placeholder="e.g. Color"
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <input
//                   value={attr.value}
//                   onChange={(e) => dispatch(updateVariantAttribute({ index: i, key: attr.key, value: e.target.value }))}
//                   placeholder="e.g. Red"
//                   className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 {(variantForm.attributes || []).length > 1 && (
//                   <button
//                     type="button"
//                     onClick={() => dispatch(removeVariantAttributeRow(i))}
//                     className="text-red-400 hover:text-red-600 text-sm cursor-pointer px-1"
//                   >
//                     ×
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ── Prices ──────────────────────────────────────────────────── */}
//         <div>
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Prices</p>
//           <div className="grid grid-cols-2 gap-4">

//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">MRP <span className="text-red-500">*</span></label>
//               <input type="number" {...field("mrp")} placeholder="₹" className={inputCls("mrp")} />
//               {errorMsg("mrp")}
//             </div>

//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Wholesale Price <span className="text-red-500">*</span></label>
//               <input type="number" {...field("wholesale_price")} placeholder="₹" className={inputCls("wholesale_price")} />
//               {errorMsg("wholesale_price")}
//             </div>

//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Retail Price <span className="text-red-500">*</span></label>
//               <input type="number" {...field("retail_price")} placeholder="₹" className={inputCls("retail_price")} />
//               {errorMsg("retail_price")}
//             </div>

//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Online Price</label>
//               <input type="number" {...field("online_price")} placeholder="₹" className={inputCls("online_price")} />
//             </div>

//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Cost</label>
//               <input type="number" {...field("purchase_cost")} placeholder="₹" className={inputCls("purchase_cost")} />
//             </div>

//           </div>
//         </div>

//         {/* ── Shipping ────────────────────────────────────────────────── */}
//         <div>
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
//             Shipping <span className="text-gray-400 font-normal normal-case">(for e-commerce sync)</span>
//           </p>
//           <div className="grid grid-cols-4 gap-3">
//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Weight (kg)</label>
//               <input type="number" step="0.01" {...field("weight")} placeholder="0.25" className={inputCls("weight")} />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Length (cm)</label>
//               <input type="number" {...field("length")} placeholder="30" className={inputCls("length")} />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Width (cm)</label>
//               <input type="number" {...field("width")} placeholder="20" className={inputCls("width")} />
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-600 mb-1">Height (cm)</label>
//               <input type="number" {...field("height")} placeholder="5" className={inputCls("height")} />
//             </div>
//           </div>
//         </div>

//         {/* ── Settings ────────────────────────────────────────────────── */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Low Stock Threshold</label>
//             <input type="number" {...field("low_stock_threshold")} placeholder="10" className={inputCls("low_stock_threshold")} />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1">Remarks</label>
//             <input {...field("remarks")} placeholder="Optional" className={inputCls("remarks")} />
//           </div>
//         </div>

//         {/* ── Images (optional) ───────────────────────────────────────── */}
//         <div>
//           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
//             Images <span className="text-gray-400 font-normal normal-case">(optional)</span>
//           </p>
//           {(variantForm.images || []).length > 0 && (
//             <div className="flex gap-2 flex-wrap mb-2">
//               {(variantForm.images || []).map((file, i) => (
//                 <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
//                   <img
//                     src={typeof file === "string" ? file : URL.createObjectURL(file)}
//                     alt={`v-img-${i}`}
//                     className="w-full h-full object-cover"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => removeImage(i)}
//                     className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//           <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
//           <button
//             type="button"
//             onClick={() => fileRef.current?.click()}
//             disabled={(variantForm.images || []).length >= 4}
//             className="px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-40"
//           >
//             + Upload Images
//           </button>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
//           <button onClick={() => dispatch(closeVariantModal())} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
//             Cancel
//           </button>
//           <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer">
//             {isEditing ? "Update Variant" : "Save Variant"}
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }