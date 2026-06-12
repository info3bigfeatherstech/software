import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import html2pdf from "html2pdf.js";
import BillInvoiceDocument from "../../Components/Billing/BillInvoiceDocument";
import { prepareBillForDocument } from "./billDocumentPrepare.service";
import { isBillAwaitingSync } from "./offlineBilling.service";

const mountBillDocument = (preparedBill) => {
  const host = document.createElement("div");
  host.className = "bill-print-host";
  host.style.cssText = "position:fixed;left:-10000px;top:0;z-index:-1;background:#fff;";
  document.body.appendChild(host);

  const root = createRoot(host);
  flushSync(() => {
    root.render(createElement(BillInvoiceDocument, { bill: preparedBill }));
  });

  const content = host.querySelector(".bill-invoice-doc");
  if (!content) {
    root.unmount();
    host.remove();
    throw new Error("Failed to render bill document");
  }

  return { host, root, content };
};

const cleanupMount = ({ host, root }) => {
  try {
    root.unmount();
  } catch {
    /* ignore */
  }
  host.remove();
};

const buildFilename = (bill) => {
  const num = bill.bill_number || bill.offline_bill_number || "invoice";
  return `invoice-${String(num).replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
};

export const printBillDocument = async (bill) => {
  const prepared = await prepareBillForDocument(bill);
  const mount = mountBillDocument(prepared);

  try {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      throw new Error("Pop-up blocked — allow pop-ups to print the bill");
    }

    printWindow.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8" />
<title>Invoice ${prepared.bill_number || ""}</title>
<style>${collectStyles()}</style>
</head><body>${mount.content.outerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  } finally {
    cleanupMount(mount);
  }
};

export const downloadBillPdfDocument = async (bill) => {
  const prepared = await prepareBillForDocument(bill);
  const mount = mountBillDocument(prepared);

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: buildFilename(prepared),
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(mount.content)
      .save();
  } finally {
    cleanupMount(mount);
  }
};

/** Inline bill invoice styles for print popup (avoids broken relative URLs). */
const collectStyles = () => {
  const sheets = [...document.styleSheets];
  let css = "";
  for (const sheet of sheets) {
    try {
      for (const rule of sheet.cssRules || []) {
        if (rule.cssText?.includes("bill-invoice-doc") || rule.cssText?.includes("bi-")) {
          css += `${rule.cssText}\n`;
        }
      }
    } catch {
      /* cross-origin stylesheets */
    }
  }
  if (!css.trim()) {
    return `@page { size: A4; margin: 10mm; }
.bill-invoice-doc { font-family: Helvetica, Arial, sans-serif; font-size: 8pt; color: #000; width: 190mm; margin: 0 auto; }
.bill-invoice-doc table { width: 100%; border-collapse: collapse; }
.bill-invoice-doc th, .bill-invoice-doc td { border: 0.5px solid #333; padding: 3px; text-align: center; font-size: 7.5pt; }`;
  }
  return css;
};

/**
 * Prefer server PDF when bill is synced and online; otherwise render client template (works offline).
 */
export const downloadBillPdfSmart = async (bill, { isOnline, triggerServerPdf } = {}) => {
  const awaitingSync = isBillAwaitingSync(bill);
  const serverBillId = bill.server_bill_id || (!awaitingSync && !bill.is_offline ? bill.bill_id : null);

  if (isOnline && serverBillId && typeof triggerServerPdf === "function") {
    try {
      const response = await triggerServerPdf(serverBillId).unwrap();
      const blob =
        response instanceof Blob
          ? response
          : response && typeof response === "object" && typeof response.size === "number"
            ? new Blob([response], { type: "application/pdf" })
            : null;
      if (blob && !blob.type.includes("json")) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = buildFilename(bill.server_bill_number ? bill : { bill_number: bill.bill_number || serverBillId });
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { source: "server" };
      }
    } catch (err) {
      console.warn("Server PDF failed, falling back to client template:", err);
    }
  }

  await downloadBillPdfDocument(bill);
  return { source: "client" };
};

export { prepareBillForDocument };
