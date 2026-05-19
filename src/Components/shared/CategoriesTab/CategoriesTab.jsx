import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Eye,
    EyeOff,
    Edit2,
    Trash2,
    Plus,
    ChevronDown,
    X,
    Search
} from "lucide-react";
import {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation
} from "../../../REDUX_FEATURES/REDUX_SLICES/Category_api/categoryApi";
import {
    openModal,
    closeModal,
    openEditModal,
    updateForm,
    setFormErrors,
    clearFormErrors,
    setSearch,
    setStatusFilter,
    setSubmitting
} from "../../../REDUX_FEATURES/REDUX_SLICES/Category_api/categorySlice";

export default function CategoriesTab({ onClose }) {
    const dispatch = useDispatch();
    const { showModal } = useSelector((state) => state.category);
    const {
        // showModal,
        editingCategory,
        formData,
        formErrors,
        isSubmitting,
        search,
        statusFilter
    } = useSelector((state) => state.category);

    // Get categories based on filters
    const { data, isLoading, refetch } = useGetCategoriesQuery({
        search: search || undefined,
        is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
        page: 1,
        limit: 100
    });
    useEffect(() => {
        if (!showModal) {
            dispatch(openModal());
        }
    }, []);
    const categories = data?.categories || [];

    // Get root categories for parent dropdown (categories with no parent)
    const rootCategories = categories.filter(cat => !cat.parent_id && cat.is_active);
    const handleClose = () => {
        dispatch(closeModal());
        if (onClose) onClose();
    };
    // Mutations
    const [createCategory] = useCreateCategoryMutation();
    const [updateCategory] = useUpdateCategoryMutation();
    const [deleteCategory] = useDeleteCategoryMutation();

    // Handle create/update
    const handleSubmit = async () => {
        // Validate
        const errors = {};
        if (!formData.name?.trim()) {
            errors.name = "Category name is required";
        } else if (formData.name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters";
        } else if (formData.name.trim().length > 120) {
            errors.name = "Name must be less than 120 characters";
        }

        if (formData.description?.length > 500) {
            errors.description = "Description must be less than 500 characters";
        }

        if (formData.remarks?.length > 500) {
            errors.remarks = "Remarks must be less than 500 characters";
        }

        if (Object.keys(errors).length > 0) {
            dispatch(setFormErrors(errors));
            return;
        }

        dispatch(setSubmitting(true));

        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description?.trim() || null,
                parent_id: formData.parent_id || null,
                remarks: formData.remarks?.trim() || null
            };

            if (editingCategory) {
                await updateCategory({ categoryId: editingCategory.category_id, ...payload }).unwrap();
            } else {
                await createCategory(payload).unwrap();
            }

            dispatch(closeModal());
            refetch();
        } catch (err) {
            if (err?.data?.errors) {
                const apiErrors = {};
                err.data.errors.forEach(({ field, message }) => {
                    apiErrors[field] = message;
                });
                dispatch(setFormErrors(apiErrors));
            } else if (err?.data?.message) {
                dispatch(setFormErrors({ general: err.data.message }));
            } else {
                dispatch(setFormErrors({ general: "Failed to save category" }));
            }
        } finally {
            dispatch(setSubmitting(false));
        }
    };

    // Toggle active status
    const handleToggleActive = async (category) => {
        try {
            await updateCategory({
                categoryId: category.category_id,
                is_active: !category.is_active
            }).unwrap();
            refetch();
        } catch (err) {
            alert(err?.data?.message || "Failed to update status");
        }
    };

    // Delete category
    const handleDelete = async (category) => {
        if (!confirm(`Are you sure you want to delete "${category.name}"?`)) return;

        try {
            await deleteCategory(category.category_id).unwrap();
            refetch();
        } catch (err) {
            alert(err?.data?.message || "Cannot delete category with active sub-categories or products");
        }
    };

    // Filter buttons
    const filterButtons = [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" }
    ];

    return (
        <div className="p-6">
            {/* Master Dropdown Button */}
            <div className="relative inline-block">
                {/* <button
                    onClick={() => document.getElementById("categoryDropdown").classList.toggle("hidden")}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                >
                    All Categories
                    <ChevronDown size={16} />
                </button> */}

                {/* Dropdown Menu */}
                <div id="categoryDropdown" className="hidden absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-2 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">All Categories</span>
                            <button
                                onClick={() => dispatch(openModal())}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-3 text-center text-gray-700 text-sm">Loading...</div>
                        ) : (
                            categories.map(cat => (
                                <div
                                    key={cat.category_id}
                                    className={`px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer ${!cat.is_active ? "opacity-50 blur-[0.5px]" : ""}`}
                                    onClick={() => {
                                        document.getElementById("categoryDropdown").classList.add("hidden");
                                    }}
                                >
                                    {cat.name}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Manage Categories Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex text-gray-700 items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">
                                {editingCategory ? "Edit Category" : "Manage Categories"}
                            </h2>
                            <button
                                onClick={handleClose}
                                className="p-1 hover:bg-gray-100 rounded"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* General Error */}
                            {formErrors?.general && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                                    {formErrors.general}
                                </div>
                            )}

                            {/* New Category Form */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="text-sm font-medium mb-3">New Category</h3>
                                <div className="space-y-3">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Category name (e.g. Electronics)"
                                            value={formData.name}
                                            onChange={(e) => dispatch(updateForm({ name: e.target.value }))}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
                                        />
                                        {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
                                    </div>
                                    <div>
                                        <textarea
                                            placeholder="Description (optional)"
                                            rows="2"
                                            value={formData.description}
                                            onChange={(e) => dispatch(updateForm({ description: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <select
                                            value={formData.parent_id || ""}
                                            onChange={(e) => dispatch(updateForm({ parent_id: e.target.value || null }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Root Category (No Parent)</option>
                                            {rootCategories.map(cat => (
                                                <option key={cat.category_id} value={cat.category_id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <textarea
                                            placeholder="Remarks (optional)"
                                            rows="1"
                                            value={formData.remarks}
                                            onChange={(e) => dispatch(updateForm({ remarks: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                                    </button>
                                </div>
                            </div>

                            {/* Existing Categories Table */}
                            <div>
                                <h3 className="text-sm font-medium mb-3">Existing Categories</h3>

                                {/* Filters */}
                                <div className="flex gap-2 mb-4">
                                    <div className="relative flex-1">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700" />
                                        <input
                                            type="text"
                                            placeholder="Search categories..."
                                            value={search}
                                            onChange={(e) => dispatch(setSearch(e.target.value))}
                                            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-1">
                                        {filterButtons.map(btn => (
                                            <button
                                                key={btn.value}
                                                onClick={() => dispatch(setStatusFilter(btn.value))}
                                                className={`px-3 py-1.5 text-xs rounded-lg ${statusFilter === btn.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
                                            >
                                                {btn.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-700">Name</th>
                                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-700">Description</th>
                                                <th className="text-left px-4 py-2 text-xs font-medium text-gray-700">Status</th>
                                                <th className="text-right px-4 py-2 text-xs font-medium text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-700">Loading...</td>
                                                </tr>
                                            ) : categories.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-700">No categories found</td>
                                                </tr>
                                            ) : (
                                                categories.map(cat => (
                                                    <tr
                                                        key={cat.category_id}
                                                        className={!cat.is_active ? "opacity-50 blur-[0.5px] bg-gray-50" : ""}
                                                    >
                                                        <td className="px-4 py-2 font-medium">{cat.name}</td>
                                                        <td className="px-4 py-2 text-gray-700 text-xs">{cat.description || "—"}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${cat.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                                {cat.is_active ? "Active" : "Inactive"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => dispatch(openEditModal(cat))}
                                                                    className="p-1.5 text-gray-700 hover:bg-gray-100 rounded"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleActive(cat)}
                                                                    className="p-1.5 text-gray-700 hover:bg-gray-100 rounded"
                                                                    title={cat.is_active ? "Deactivate" : "Activate"}
                                                                >
                                                                    {cat.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(cat)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={14} />
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
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end p-4 border-t border-gray-200">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}