import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Upload, FileText, Archive, CheckCircle, AlertTriangle,
  XCircle, ChevronDown, ChevronRight, X, Download,
  ArrowLeft, ArrowRight, Loader2, Package, RefreshCw,
} from "lucide-react";
import {
  setStep, setImageMode, setCsvFileMeta, setZipFileMeta,
  setPreviewData, setCsvError, setResult, setImportError,
  setExpandedRow, setResultTab, resetBulkUpload,
} from "../../../../REDUX_FEATURES/REDUX_SLICES/BulkUpload_api/bulkUploadSlice";
import AxiosInstance from "../../../../SERVICES/AxiosInstance";

// ─── tiny helpers ────────────────────────────────────────────────────────────
const fmt = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const STEPS = [
  { key: "upload",    label: "CSV"     },
  { key: "preview",   label: "Preview" },
  { key: "zip",       label: "Images"  },
  { key: "importing", label: "Import"  },
  { key: "result",    label: "Done"    },
];

const REQUIRED_COLS = [
  "name","product_code","mrp","wholesale_price",
  "retail_price","hsn_code","gst_percent","gst_type","unit_of_measure",
];

// ─── component ───────────────────────────────────────────────────────────────
const BulkUploadTab = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const {
    step, imageMode, csvFileMeta, zipFileMeta,
    previewData, csvError, result, importError,
    expandedRow, resultTab,
  } = useSelector((s) => s.bulkUpload);

  const csvFileRef  = useRef(null);
  const zipFileRef  = useRef(null);
  const prevStepRef = useRef(step);

  const [csvDrag, setCsvDrag]         = useState(false);
  const [zipDrag, setZipDrag]         = useState(false);
  const [importPct, setImportPct]     = useState(0);
  const [csvPct, setCsvPct]           = useState(0);
  const [importPhase, setImportPhase] = useState(0); // 0 uploading 1 processing 2 finalizing

  // auto-set mode
  useEffect(() => { dispatch(setImageMode("zip")); }, []);

  // toast on result
  useEffect(() => {
    if (prevStepRef.current !== "result" && step === "result" && result) {
      const created  = result.created  || 0;
      const failed   = result.failed?.length   || 0;
      const warnings = result.warnings?.length || 0;
      if (failed && !created)      toast.error(`Import failed — ${failed} product(s) could not be created`);
      else if (failed)             toast.warning(`${created} created · ${failed} failed`, { autoClose: 6000 });
      else if (warnings)           toast.success(`${created} imported with ${warnings} warning(s)`);
      else                         toast.success(`${created} product(s) imported successfully`);
    }
    prevStepRef.current = step;
  }, [step, result]);

  // progress animation
  useEffect(() => {
    let raf, t0;
    const run = (ts) => {
      if (!t0) t0 = ts;
      const el = ts - t0;
      const p  = Math.min(91, (el / 2400) * 100);
      if      (step === "importing") { setImportPct(Math.floor(p)); setImportPhase(el < 900 ? 0 : el < 1800 ? 1 : 2); }
      else if (step === "preview")   setCsvPct(Math.floor(p));
      if (p < 91) raf = requestAnimationFrame(run);
    };
    if (step === "importing" || step === "preview") { t0 = null; raf = requestAnimationFrame(run); }
    else { setImportPct(0); setCsvPct(0); }
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [step]);

  // ── file handlers ──────────────────────────────────────────────────────────
  const onCsvPick = (file) => {
    if (!file?.name.endsWith(".csv")) { dispatch(setCsvError("Only .csv files accepted")); return; }
    csvFileRef.current = file;
    dispatch(setCsvFileMeta({ name: file.name, size: file.size }));
    dispatch(setCsvError(null));
  };
  const onZipPick = (file) => {
    if (!file?.name.endsWith(".zip")) return;
    zipFileRef.current = file;
    dispatch(setZipFileMeta({ name: file.name, size: file.size }));
  };

  // ── API calls ──────────────────────────────────────────────────────────────
  const handlePreview = async () => {
    if (!csvFileRef.current) { dispatch(setCsvError("Please select a CSV file")); return; }
    dispatch(setStep("preview")); dispatch(setPreviewData(null)); dispatch(setCsvError(null)); setCsvPct(0);
    try {
      const fd = new FormData(); fd.append("file", csvFileRef.current);
      const res = await AxiosInstance.post("/products/bulk/csv?preview=true", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setCsvPct(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
      });
      dispatch(setPreviewData(res.data.data?.preview));
    } catch (err) {
      dispatch(setCsvError(err.response?.data?.message || "Preview failed"));
      dispatch(setStep("upload"));
    }
  };

  const handleImport = async () => {
    if (!csvFileRef.current) return;
    dispatch(setStep("importing")); dispatch(setResult(null)); dispatch(setImportError(null)); setImportPct(0);
    try {
      const fd = new FormData(); fd.append("file", csvFileRef.current);
      if (zipFileRef.current) fd.append("imagesZip", zipFileRef.current);
      const res = await AxiosInstance.post("/products/bulk/csv", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setImportPct(e.total ? Math.round((e.loaded / e.total) * 100) : 0),
      });
      dispatch(setResult(res.data.data)); dispatch(setStep("result"));
    } catch (err) {
      dispatch(setImportError(err.response?.data?.message || "Import failed"));
      dispatch(setStep("upload"));
    }
  };

  const downloadFailedReport = async () => {
    try {
      const res = await AxiosInstance.get("/products/bulk/failed-report", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url; a.download = "failed_products.csv";
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch { toast.error("Failed to download report"); }
  };

  const downloadSample = () => {
    const hdr = ["name","product_code","mrp","wholesale_price","retail_price","hsn_code","gst_percent","gst_type","unit_of_measure","quantity","title","description","brand_name","online_price","weight","length","width","height","vendor_name","category_name","sub_category_name","remarks"];
    const row = ["Cotton T-Shirt","TSHIRT-001","999","599","799","61091000","18","IGST","PCS","100","Premium Cotton T-Shirt","High quality cotton","Nike","899","200","30","20","5","Nike Vendor","Apparel","T-Shirts","Summer collection"];
    const blob = new Blob([[hdr,row].map(r=>r.join(",")).join("\n")], { type:"text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "sample_bulk_upload.csv";
    document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url);
    toast.success("Sample CSV downloaded");
  };

  if (!isOpen) return null;

  const stepIdx     = STEPS.findIndex(s => s.key === step);
  const phaseLabels = ["Uploading files…","Processing products…","Uploading images to cloud…"];
  const phaseKeys   = ["Uploading","Processing","Finalizing"];

  // ── shared atoms ───────────────────────────────────────────────────────────
  const DropZone = ({ hasFile, fileMeta, drag, onDragOver, onDragLeave, onDrop, onClick, inputId, accept, onInput, icon: Icon, label, sub }) => (
    <div
      onClick={onClick}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
      className={[
        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10 px-6 select-none",
        hasFile
          ? "border-green-600/60 bg-green-900/10"
          : drag
            ? "border-[#F7A221]/80 bg-[#F7A221]/5"
            : "border-slate-600/50 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/70",
      ].join(" ")}
    >
      <input type="file" accept={accept} id={inputId} className="hidden" onChange={onInput} />
      {hasFile ? (
        <>
          <CheckCircle size={32} className="text-green-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-200">{fileMeta.name}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{fmt(fileMeta.size)}</p>
          </div>
          <p className="text-xs text-slate-600">Click to replace</p>
        </>
      ) : (
        <>
          <div className={["p-3 rounded-lg", drag ? "bg-[#F7A221]/15" : "bg-slate-700/60"].join(" ")}>
            <Icon size={22} className={drag ? "text-[#F7A221]" : "text-slate-400"} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
          </div>
        </>
      )}
    </div>
  );

  const ProgressBar = ({ pct, color = "bg-[#F7A221]" }) => (
    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );

  const NavRow = ({ onBack, onNext, nextLabel, nextDisabled, nextDanger = false }) => (
    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
      {onBack
        ? <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"><ArrowLeft size={14} /> Back</button>
        : <div />}
      {onNext && (
        <button
          onClick={onNext} disabled={nextDisabled}
          className={[
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer",
            nextDisabled ? "opacity-40 cursor-not-allowed bg-slate-700 text-slate-400"
              : "bg-[#F7A221] text-slate-900 hover:bg-[#e8920d] active:scale-95",
          ].join(" ")}
        >
          {nextLabel} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        {/* backdrop */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        {/* modal */}
       <div className="relative bg-white border border-slate-200 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh]">

  {/* ── Header ────────────────────────────────────────────────────── */}
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-white">
    <div className="flex items-center gap-3">
      <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200">
        <Package size={16} className="text-[#F7A221]" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Bulk Product Import</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          CSV + ZIP images · row errors don't interrupt the import
        </p>
      </div>
    </div>

    <button
      onClick={onClose}
      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
    >
      <X size={16} />
    </button>
  </div>

  {/* ── Step bar ──────────────────────────────────────────────────── */}
  <div className="px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-white">
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i < stepIdx;
        const active = i === stepIdx;

        return (
          <React.Fragment key={s.key}>
            <div
              className="flex flex-col items-center gap-1"
              style={{ minWidth: 48 }}
            >
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                  done
                    ? "bg-green-100 border border-green-300"
                    : active
                    ? "bg-[#F7A221]/10 border border-[#F7A221]/40"
                    : "bg-slate-100 border border-slate-200",
                ].join(" ")}
              >
                {done ? (
                  <CheckCircle size={13} className="text-green-600" />
                ) : (
                  <span
                    className={[
                      "text-xs font-bold",
                      active ? "text-[#F7A221]" : "text-slate-500",
                    ].join(" ")}
                  >
                    {i + 1}
                  </span>
                )}
              </div>

              <span
                className={[
                  "text-[10px] font-medium tracking-wide uppercase",
                  active
                    ? "text-[#F7A221]"
                    : done
                    ? "text-green-600"
                    : "text-slate-500",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div
                className={[
                  "flex-1 h-px mx-1 mb-4 transition-all duration-400",
                  done ? "bg-green-300" : "bg-slate-200",
                ].join(" ")}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>

  {/* ── Content ───────────────────────────────────────────────────── */}
  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white text-slate-900">
    
    {/* Example white card */}
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">
        Upload CSV file
      </p>

      <p className="text-xs text-slate-500 mt-1">
        All product data goes in the CSV.
      </p>
    </div>

    {/* Example table */}
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <span className="text-xs text-slate-600 font-medium">
          25 rows parsed
        </span>
      </div>

      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 sticky top-0">
          <tr className="border-b border-slate-200">
            {["#", "Name", "Code", "Status"].map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td className="px-3 py-2 text-slate-500">1</td>
            <td className="px-3 py-2 text-slate-900 font-medium">
              Product Name
            </td>
            <td className="px-3 py-2 text-slate-600">TSHIRT-001</td>
            <td className="px-3 py-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-100 border border-green-200 rounded-full px-2 py-0.5">
                <CheckCircle size={9} /> Valid
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* Buttons */}
    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
      <button className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 border border-slate-300 hover:border-slate-400 transition-colors cursor-pointer">
        Cancel
      </button>

      <button className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#F7A221] text-white hover:bg-[#e8920d] transition-colors cursor-pointer">
        Continue
      </button>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default BulkUploadTab;
// down code is working but dont need two modes 
// // TABS/INVENTORY/BulkUploadTab.jsx
// import React, { useState, useRef, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import {
//   setStep,
//   setImageMode,
//   setCsvFileMeta,
//   setZipFileMeta,
//   setPreviewData,
//   setCsvError,
//   setResult,
//   setImportError,
//   setExpandedRow,
//   setResultTab,
//   resetBulkUpload,
// } from "../../../../REDUX_FEATURES/REDUX_SLICES/BulkUpload_api/bulkUploadSlice";
// import AxiosInstance from "../../../../SERVICES/AxiosInstance";

// const BulkUploadTab = ({ isOpen, onClose }) => {
//   const dispatch = useDispatch();
//   const {
//     step,
//     imageMode,
//     csvFileMeta,
//     zipFileMeta,
//     previewData,
//     csvError,
//     result,
//     importError,
//     expandedRow,
//     resultTab,
//   } = useSelector((state) => state.bulkUpload);

//   // Local refs for actual File objects
//   const csvFileRef = useRef(null);
//   const zipFileRef = useRef(null);
//   const [localImportPct, setLocalImportPct] = useState(0);
//   const [localCsvPct, setLocalCsvPct] = useState(0);
//   const prevStepRef = useRef(step);

//   // Toast on step transition to result
//   useEffect(() => {
//     if (prevStepRef.current !== "result" && step === "result" && result) {
//       const { created = 0, failed = [], warnings = [] } = result;
//       const hasWarnings = warnings && warnings.length > 0;
//       const hasFailures = failed && failed.length > 0;

//       if (hasFailures && created === 0) {
//         toast.error(`Import failed: ${failed.length} product(s) failed`);
//       } else if (hasFailures) {
//         toast.warning(
//           `${created} product(s) created, ${failed.length} failed. Download report for details.`,
//           { autoClose: 5000 }
//         );
//       } else if (hasWarnings) {
//         toast.success(`${created} product(s) created with ${warnings.length} warning(s)`);
//       } else {
//         toast.success(`${created} product(s) created successfully!`);
//       }
//     }
//     prevStepRef.current = step;
//   }, [step, result]);

//   // Simulate progress animation
//   useEffect(() => {
//     let rafId;
//     let startTime;
//     const duration = 2000;

//     const animate = (timestamp) => {
//       if (!startTime) startTime = timestamp;
//       const elapsed = timestamp - startTime;
//       const progress = Math.min(95, (elapsed / duration) * 100);

//       if (step === "importing") {
//         setLocalImportPct(Math.floor(progress));
//         if (progress < 95) {
//           rafId = requestAnimationFrame(animate);
//         }
//       } else if (step === "preview") {
//         setLocalCsvPct(Math.floor(progress));
//         if (progress < 95) {
//           rafId = requestAnimationFrame(animate);
//         }
//       }
//     };

//     if (step === "importing" || step === "preview") {
//       startTime = null;
//       rafId = requestAnimationFrame(animate);
//     } else {
//       setLocalImportPct(0);
//       setLocalCsvPct(0);
//     }

//     return () => {
//       if (rafId) cancelAnimationFrame(rafId);
//     };
//   }, [step]);

//   const handleCsvSelect = (file) => {
//     csvFileRef.current = file;
//     dispatch(setCsvFileMeta({ name: file.name, size: file.size }));
//     dispatch(setCsvError(null));
//   };

//   const handleZipSelect = (file) => {
//     zipFileRef.current = file;
//     dispatch(setZipFileMeta({ name: file.name, size: file.size }));
//   };

//   const handlePreview = async () => {
//     if (!csvFileRef.current) {
//       dispatch(setCsvError("Please select a CSV file"));
//       return;
//     }

//     dispatch(setStep("preview"));
//     dispatch(setPreviewData(null));
//     dispatch(setCsvError(null));
//     setLocalCsvPct(0);

//     try {
//       const formData = new FormData();
//       formData.append("file", csvFileRef.current);

//       const response = await AxiosInstance.post("/products/bulk/csv?preview=true", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (e) => {
//           const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
//           setLocalCsvPct(pct);
//         },
//       });

//       // Store the preview data from API response
//       dispatch(setPreviewData(response.data.data?.preview));
//       dispatch(setStep("preview"));

//       if (imageMode === "zip") {
//         dispatch(setStep("zip"));
//       }
//     } catch (error) {
//       dispatch(setCsvError(error.response?.data?.message || "Preview failed"));
//       dispatch(setStep("upload"));
//     }
//   };

//   const handleImport = async () => {
//     if (!csvFileRef.current) return;

//     dispatch(setStep("importing"));
//     dispatch(setResult(null));
//     dispatch(setImportError(null));
//     setLocalImportPct(0);

//     try {
//       const formData = new FormData();
//       formData.append("file", csvFileRef.current);
//       if (imageMode === "zip" && zipFileRef.current) {
//         formData.append("imagesZip", zipFileRef.current);
//       }

//       const response = await AxiosInstance.post("/products/bulk/csv", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (e) => {
//           const pct = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
//           setLocalImportPct(pct);
//         },
//       });

//       dispatch(setResult(response.data.data));
//       dispatch(setStep("result"));
//     } catch (error) {
//       dispatch(setImportError(error.response?.data?.message || "Import failed"));
//       dispatch(setStep("upload"));
//     }
//   };

//   const downloadFailedReport = async () => {
//     try {
//       const response = await AxiosInstance.get("/products/bulk/failed-report", {
//         responseType: "blob",
//       });
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "failed_products.csv");
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       toast.success("Report downloaded successfully");
//     } catch (error) {
//       toast.error("Failed to download report");
//     }
//   };

//   const downloadSampleCsv = () => {
//     const headers = [
//       "name", "product_code", "mrp", "wholesale_price", "retail_price",
//       "hsn_code", "gst_percent", "gst_type", "unit_of_measure", "quantity",
//       "title", "description", "brand_name", "online_price", "weight",
//       "length", "width", "height", "vendor_name", "category_name",
//       "sub_category_name", "remarks"
//     ];

//     const sampleRow = [
//       "Cotton T-Shirt", "TSHIRT-001", "999", "599", "799",
//       "61091000", "18", "IGST", "PCS", "100",
//       "Premium Cotton T-Shirt", "High quality cotton", "Nike", "899",
//       "200", "30", "20", "5", "Nike Vendor", "Apparel", "T-Shirts", "Summer collection"
//     ];

//     const csvContent = [headers.join(","), sampleRow.join(",")].join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", "sample_bulk_upload.csv");
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);
//     toast.success("Sample CSV downloaded");
//   };

//   // Status Badge Component
//   const StatusBadge = ({ status, hasErrors }) => {
//     if (hasErrors) {
//       return (
//         <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-red-900/50 text-red-400 border-red-700">
//           Invalid
//         </span>
//       );
//     }
//     return (
//       <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-green-900/50 text-green-400 border-green-700">
//         Valid
//       </span>
//     );
//   };

//   // Progress Bar Component
//   const ProgressBar = ({ pct, color = "bg-[#F7A221]" }) => (
//     <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
//       <div
//         className={`h-2 rounded-full transition-all duration-500 ${color}`}
//         style={{ width: `${Math.min(100, pct)}%` }}
//       />
//     </div>
//   );

//   if (!isOpen) return null;

//   // Calculate step index for step indicator
//   const stepOrder = ["mode", "upload", "preview", "zip", "importing", "result"];
//   const currentStepIdx = stepOrder.indexOf(step);
  
//   // Steps for display
//   const displaySteps = imageMode === "zip" 
//     ? ["Mode", "CSV", "Preview", "ZIP", "Import", "Result"]
//     : ["Mode", "CSV", "Preview", "Import", "Result"];

//   // Get tab counts for result view
//   const getTabCounts = () => {
//     if (!result?.products) return { all: 0, success: 0, warnings: 0, failed: 0 };
//     return {
//       all: result.products.length,
//       success: result.products.filter(p => p.status === "success").length,
//       warnings: result.products.filter(p => p.status === "saved_with_warnings").length,
//       failed: result.products.filter(p => p.status === "failed").length,
//     };
//   };

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex items-center justify-center min-h-screen px-4 py-8">
//         <div className="fixed inset-0 bg-black bg-opacity-75" onClick={onClose} />

//         <div className="relative bg-slate-900 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 border border-slate-700">
//           {/* Header */}
//           <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-900 z-10 pb-4">
//             <div>
//               <h2 className="text-2xl font-bold text-white">Bulk Upload Products</h2>
//               <p className="text-sm text-slate-400 mt-1">Import products from CSV file</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-slate-400 hover:text-white transition-colors text-2xl"
//             >
//               ✕
//             </button>
//           </div>

//           {/* Step Indicator */}
//           {step !== "mode" && (
//             <div className="flex mb-8">
//               {displaySteps.map((label, idx) => {
//                 const isActive = idx === currentStepIdx;
//                 const isCompleted = idx < currentStepIdx;
//                 return (
//                   <div key={idx} className="flex items-center flex-1">
//                     <div className="flex flex-col items-center flex-1">
//                       <div
//                         className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
//                           ${isActive ? "bg-[#F7A221] text-black" : 
//                             isCompleted ? "bg-green-500 text-white" : "bg-slate-700 text-slate-400"}
//                         `}
//                       >
//                         {isCompleted ? "✓" : idx + 1}
//                       </div>
//                       <span className={`text-xs mt-2 ${isActive ? "text-[#F7A221]" : isCompleted ? "text-green-400" : "text-slate-500"}`}>
//                         {label}
//                       </span>
//                     </div>
//                     {idx < displaySteps.length - 1 && (
//                       <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-slate-700"}`} />
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Mode Selection */}
//           {step === "mode" && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-white">Select Upload Mode</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <button
//                   onClick={() => {
//                     dispatch(setImageMode("csv_only"));
//                     dispatch(setStep("upload"));
//                   }}
//                   className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700 hover:border-[#F7A221] transition-all group"
//                 >
//                   <div className="text-4xl mb-3">📄</div>
//                   <div className="text-white font-medium group-hover:text-[#F7A221]">CSV Only</div>
//                   <div className="text-sm text-slate-400 mt-1">Product data only, no images</div>
//                 </button>
//                 <button
//                   onClick={() => {
//                     dispatch(setImageMode("zip"));
//                     dispatch(setStep("upload"));
//                   }}
//                   className="p-6 bg-slate-800 rounded-lg border-2 border-slate-700 hover:border-[#F7A221] transition-all group"
//                 >
//                   <div className="text-4xl mb-3">📦</div>
//                   <div className="text-white font-medium group-hover:text-[#F7A221]">CSV + ZIP Images</div>
//                   <div className="text-sm text-slate-400 mt-1">Products with image folders</div>
//                 </button>
//               </div>
//               <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
//                 <strong className="text-white">Required columns:</strong> name, product_code, mrp, wholesale_price, 
//                 retail_price, hsn_code, gst_percent, gst_type, unit_of_measure, quantity
//               </div>
//             </div>
//           )}

//           {/* Upload CSV */}
//           {step === "upload" && (
//             <div className="space-y-4">
//               <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-[#F7A221] transition-all">
//                 <input
//                   type="file"
//                   accept=".csv"
//                   onChange={(e) => handleCsvSelect(e.target.files[0])}
//                   className="hidden"
//                   id="csv-upload"
//                 />
//                 <label htmlFor="csv-upload" className="cursor-pointer block">
//                   <div className="text-5xl mb-3">📊</div>
//                   <div className="text-white mb-2 text-lg">
//                     {csvFileMeta ? csvFileMeta.name : "Click or drag to upload CSV"}
//                   </div>
//                   <div className="text-sm text-slate-400">
//                     CSV files only · Max 10MB
//                   </div>
//                 </label>
//               </div>

//               {csvError && (
//                 <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
//                   ⚠️ {csvError}
//                 </div>
//               )}

//               <div className="flex justify-between">
//                 <button
//                   onClick={() => dispatch(setStep("mode"))}
//                   className="px-5 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
//                 >
//                   ← Back
//                 </button>
//                 <button
//                   onClick={handlePreview}
//                   disabled={!csvFileMeta}
//                   className="px-6 py-2 bg-[#F7A221] rounded-lg text-black font-semibold hover:bg-[#e89510] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Preview CSV →
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Preview Results */}
//           {step === "preview" && previewData && (
//             <div className="space-y-4">
//               {/* Stats Summary */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center">
//                   <div className="text-3xl font-bold text-green-400">{previewData.valid || 0}</div>
//                   <div className="text-sm text-green-400 mt-1">Valid Products</div>
//                 </div>
//                 <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center">
//                   <div className="text-3xl font-bold text-red-400">{previewData.invalid || 0}</div>
//                   <div className="text-sm text-red-400 mt-1">Invalid Products</div>
//                 </div>
//               </div>

//               {/* Preview Table */}
//               <div className="bg-slate-800 rounded-lg overflow-hidden">
//                 <div className="flex justify-between items-center p-4 border-b border-slate-700">
//                   <h3 className="text-white font-semibold">Product Preview</h3>
//                   <button
//                     onClick={downloadSampleCsv}
//                     className="text-sm text-[#F7A221] hover:underline"
//                   >
//                     Download Sample CSV
//                   </button>
//                 </div>
//                 <div className="max-h-96 overflow-y-auto">
//                   <table className="w-full">
//                     <thead className="bg-slate-700 sticky top-0">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-slate-300">Product Name</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-slate-300">Variants</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-slate-300">Images</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-slate-300">Status</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-slate-700">
//                       {previewData.rows?.map((row, idx) => (
//                         <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
//                           <td className="px-4 py-3 text-sm text-white">{row.name}</td>
//                           <td className="px-4 py-3 text-sm text-slate-300">{row.variants_count}</td>
//                           <td className="px-4 py-3 text-sm">
//                             {row.has_images ? (
//                               <span className="text-green-400">✓ Has Images</span>
//                             ) : (
//                               <span className="text-yellow-400">⚠ No Images</span>
//                             )}
//                           </td>
//                           <td className="px-4 py-3">
//                             <StatusBadge hasErrors={row.errors?.length > 0} />
//                             {row.errors?.length > 0 && (
//                               <div className="mt-1 text-xs text-red-400">
//                                 {row.errors.map((err, i) => (
//                                   <div key={i}>• {err}</div>
//                                 ))}
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               <div className="flex justify-between">
//                 <button
//                   onClick={() => dispatch(setStep("upload"))}
//                   className="px-5 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
//                 >
//                   ← Back
//                 </button>
//                 <button
//                   onClick={() => {
//                     if (imageMode === "zip") {
//                       dispatch(setStep("zip"));
//                     } else {
//                       handleImport();
//                     }
//                   }}
//                   disabled={previewData.valid === 0}
//                   className="px-6 py-2 bg-[#F7A221] rounded-lg text-black font-semibold hover:bg-[#e89510] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {imageMode === "zip" ? "Next: Upload ZIP →" : "Import Products →"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* ZIP Upload */}
//           {step === "zip" && (
//             <div className="space-y-4">
//               <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
//                 <p className="text-blue-300 text-sm">
//                   📋 Ready to import <strong>{previewData?.valid || 0}</strong> product(s). 
//                   Now upload the ZIP file containing product images.
//                 </p>
//               </div>

//               <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-[#F7A221] transition-all">
//                 <input
//                   type="file"
//                   accept=".zip"
//                   onChange={(e) => handleZipSelect(e.target.files[0])}
//                   className="hidden"
//                   id="zip-upload"
//                 />
//                 <label htmlFor="zip-upload" className="cursor-pointer block">
//                   <div className="text-5xl mb-3">🗜️</div>
//                   <div className="text-white mb-2 text-lg">
//                     {zipFileMeta ? zipFileMeta.name : "Click or drag to upload ZIP"}
//                   </div>
//                   <div className="text-sm text-slate-400">
//                     ZIP should contain folders named by product_code with images inside
//                   </div>
//                 </label>
//               </div>

//               <div className="bg-slate-800 rounded-lg p-4">
//                 <p className="text-sm font-semibold text-white mb-2">📁 ZIP Structure Example:</p>
//                 <pre className="bg-slate-900 p-3 rounded text-xs text-slate-400 font-mono">
// {`images.zip
// ├── 6767-1/          ← product_code folder
// │   ├── front.jpg
// │   └── back.jpg
// ├── 6767-2/
// │   └── image.jpg
// └── 6767-3/
//     └── main.png`}
//                 </pre>
//               </div>

//               {importError && (
//                 <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
//                   ⚠️ {importError}
//                 </div>
//               )}

//               <div className="flex justify-between">
//                 <button
//                   onClick={() => dispatch(setStep("preview"))}
//                   className="px-5 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
//                 >
//                   ← Back
//                 </button>
//                 <button
//                   onClick={handleImport}
//                   disabled={!zipFileMeta}
//                   className="px-6 py-2 bg-[#F7A221] rounded-lg text-black font-semibold hover:bg-[#e89510] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Import {previewData?.valid || 0} Products →
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Importing Progress */}
//           {step === "importing" && (
//             <div className="py-12 text-center space-y-4">
//               <div className="text-6xl animate-bounce">⚡</div>
//               <p className="text-xl font-semibold text-white">Importing Products...</p>
//               <p className="text-sm text-slate-400">
//                 {imageMode === "zip" 
//                   ? "Extracting ZIP, matching product codes, uploading images..."
//                   : "Creating products and saving to database..."}
//               </p>
//               <div className="max-w-md mx-auto space-y-2">
//                 <ProgressBar pct={localImportPct} />
//                 <p className="text-sm text-slate-400">{localImportPct}% completed</p>
//               </div>
//               <p className="text-xs text-slate-500">Please do not close this window</p>
//             </div>
//           )}

//           {/* Result */}
//           {step === "result" && result && (
//             <div className="space-y-4">
//               {/* Stats Cards */}
//               <div className="grid grid-cols-4 gap-3">
//                 <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 text-center">
//                   <div className="text-2xl font-bold text-blue-400">{result.created || 0}</div>
//                   <div className="text-xs text-blue-400 mt-1">Created</div>
//                 </div>
//                 <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-center">
//                   <div className="text-2xl font-bold text-green-400">{result.updated || 0}</div>
//                   <div className="text-xs text-green-400 mt-1">Updated</div>
//                 </div>
//                 <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 text-center">
//                   <div className="text-2xl font-bold text-yellow-400">{result.warnings?.length || 0}</div>
//                   <div className="text-xs text-yellow-400 mt-1">Warnings</div>
//                 </div>
//                 <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-center">
//                   <div className="text-2xl font-bold text-red-400">{result.failed?.length || 0}</div>
//                   <div className="text-xs text-red-400 mt-1">Failed</div>
//                 </div>
//               </div>

//               {/* Success Message */}
//               {result.failed?.length === 0 && (
//                 <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-center">
//                   <p className="text-green-400 text-sm">✅ All products imported successfully!</p>
//                 </div>
//               )}

//               {/* Warnings Section */}
//               {result.warnings?.length > 0 && (
//                 <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
//                   <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Warnings</h4>
//                   <div className="space-y-1 max-h-32 overflow-y-auto">
//                     {result.warnings.map((warning, idx) => (
//                       <div key={idx} className="text-sm text-yellow-300">
//                         • {warning.product}: {warning.message}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Failed Section */}
//               {result.failed?.length > 0 && (
//                 <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
//                   <h4 className="text-red-400 font-semibold mb-2">❌ Failed Products</h4>
//                   <div className="space-y-1 max-h-32 overflow-y-auto">
//                     {result.failed.map((fail, idx) => (
//                       <div key={idx} className="text-sm text-red-300">
//                         • {fail.product}: {fail.error}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex justify-between gap-3">
//                 {result.failed?.length > 0 && (
//                   <button
//                     onClick={downloadFailedReport}
//                     className="px-5 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors"
//                   >
//                     Download Failed Report
//                   </button>
//                 )}
//                 <div className="flex gap-3 ml-auto">
//                   <button
//                     onClick={() => {
//                       dispatch(resetBulkUpload());
//                     }}
//                     className="px-5 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition-colors"
//                   >
//                     Upload Another
//                   </button>
//                   <button
//                     onClick={() => {
//                       dispatch(resetBulkUpload());
//                       onClose();
//                     }}
//                     className="px-6 py-2 bg-[#F7A221] rounded-lg text-black font-semibold hover:bg-[#e89510] transition-colors"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BulkUploadTab;
