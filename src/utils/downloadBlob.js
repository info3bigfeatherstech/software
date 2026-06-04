/**
 * Trigger browser download from an Axios/RTK blob response.
 * @param {Blob} blob
 * @param {string} filename
 */
export const downloadBlobFile = (blob, filename) => {
    if (!blob || typeof blob.size !== "number") {
        throw new Error("Invalid file response");
    }
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
};

export const CHALLAN_READY_STATUSES = new Set([
    "DISPATCHED",
    "IN_TRANSIT",
    "PARTIALLY_RECEIVED",
    "RECEIVED",
    "COMPLETED",
]);
