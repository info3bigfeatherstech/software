import { useState } from "react";
import {
  Building2,
  Check,
  ChevronDown,
  CloudUpload,
  Info,
  MapPin,
  Upload,
  X,
} from "lucide-react";

const COLORS = [
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#64748b",
  "#ec4899",
  "#0ea5e9",
];

export default function CompanyDetails() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    businessName: "",
    phone: "",
    gstin: "",
    email: "",

    businessType: "Retail",
    category: "Grocery & FMCG",

    state: "Maharashtra",
    pincode: "421003",
    address:
      "MEHTA MART MHM, Block no 277/553, opp. tipcy-topcy society, Sambhaji Chowk, Ulhasnagar, Maharashtra 421004",

    color: "#10b981",
    signature: null,
    backup: null,
  });

  const [created, setCreated] = useState(false);

  const initials =
    form.businessName
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setCreated(true);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const StepItem = ({ number, title, subtitle, active, completed }) => (
    <div
      className={`flex flex-1 items-center gap-3 border-r border-slate-200 px-5 py-4 last:border-r-0`}
    >
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
          completed
            ? "border-[#16213e] bg-[#16213e] text-white"
            : active
            ? "border-[#16213e] text-[#16213e]"
            : "border-slate-300 text-slate-400"
        }`}
      >
        {completed ? <Check size={14} /> : number}
      </div>

      <div>
        <p
          className={`text-sm font-semibold ${
            active || completed
              ? "text-slate-800"
              : "text-slate-400"
          }`}
        >
          {title}
        </p>

        <p className="text-xs text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );

  const Input = ({
    label,
    placeholder,
    value,
    onChange,
    required,
    optional,
    type = "text",
  }) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {optional && (
          <span className="text-xs text-slate-400">
            {" "}
            (optional)
          </span>
        )}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-slate-300 bg-[#2d2d2d] px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-[#16213e]"
      />
    </div>
  );

  const SectionTitle = ({ children }) => (
    <div className="mb-5 mt-7 border-b border-slate-200 pb-2">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {children}
      </h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 ">
      <div className="mx-auto max-w-7xl bg-[#f8fafc] p-5 shadow-2xl">

        {/* HEADER */}
        <div className="overflow-hidden border border-slate-200 bg-white">

          {/* TOP NAV */}
          <div className="flex items-center justify-between bg-[#16213e] px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10 text-white">
                <Building2 size={20} />
              </div>

              <div>
                <h1 className="text-lg font-semibold text-white">
                  New company
                </h1>

                <p className="text-sm text-slate-300">
                  Inventory & Billing
                </p>
              </div>
            </div>

            <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-white transition hover:bg-white/10">
              <X size={18} />
            </button>
          </div>

          {/* STEPS */}
          <div className="flex border-b border-slate-200 bg-white">
            <StepItem
              number={1}
              title="Business details"
              subtitle="Name, GSTIN, Contact"
              active={step === 1}
              completed={step > 1}
            />

            <StepItem
              number={2}
              title="More details"
              subtitle="Type, Location, Address"
              active={step === 2}
              completed={step > 2}
            />

            <StepItem
              number={3}
              title="Review & Create"
              subtitle="Confirm and Finish"
              active={step === 3}
              completed={created}
            />
          </div>

          {/* CONTENT */}
          <div className="p-6">

            {/* STEP 1 */}
            {step === 1 && !created && (
              <>
                <div className="grid grid-cols-2 gap-5">
                  <Input
                    label="Business name"
                    required
                    placeholder="e.g. Mehta Mart"
                    value={form.businessName}
                    onChange={(e) =>
                      updateField("businessName", e.target.value)
                    }
                  />

                  <Input
                    label="Phone number"
                    required
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                  />

                  <Input
                    label="GSTIN"
                    optional
                    placeholder="27ACIPH6818F1ZK"
                    value={form.gstin}
                    onChange={(e) =>
                      updateField("gstin", e.target.value)
                    }
                  />

                  <Input
                    label="Email ID"
                    optional
                    placeholder="business@example.com"
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  15-character GST number — auto-validates
                </p>

                <SectionTitle>
                  Company Appearance
                </SectionTitle>

                <div className="grid grid-cols-2 gap-10">

                  {/* COLORS */}
                  <div>
                    <p className="mb-4 text-sm font-medium text-slate-700">
                      Brand colour
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {COLORS.map((color) => (
                        <button
                        type="button"
                          key={color}
                          onClick={() =>
                            updateField("color", color)
                          }
                          className={`h-10 w-10 rounded-full border-4 transition ${
                            form.color === color
                              ? "border-slate-900 scale-110"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-slate-400">
                      Used on the company avatar
                    </p>
                  </div>

                  {/* PREVIEW */}
                  <div>
                    <p className="mb-4 text-sm font-medium text-slate-700">
                      Preview
                    </p>

                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: form.color }}
                      >
                        {initials}
                      </div>

                      <div>
                        <p className="font-medium text-slate-700">
                          {form.businessName || "Company name"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <SectionTitle>
                  Signature
                </SectionTitle>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-10 text-center transition hover:bg-slate-50">
                  <Upload
                    size={22}
                    className="mb-3 text-slate-400"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    Click to upload signature
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PNG or JPG, max 2MB — printed on invoices
                  </p>

                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      updateField(
                        "signature",
                        e.target.files[0]
                      )
                    }
                  />
                </label>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && !created && (
              <>
                <SectionTitle>
                  Business Classification
                </SectionTitle>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Business type <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <select
                        value={form.businessType}
                        required
                        onChange={(e) =>
                          updateField(
                            "businessType",
                            e.target.value
                          )
                        }
                        className="w-full appearance-none rounded-md border border-slate-300 bg-[#2d2d2d] px-4 py-3 text-sm font-medium text-white outline-none"
                      >
                        <option>Retail</option>
                        <option>Wholesale</option>
                        <option>Manufacturing</option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Business category
                    </label>

                        <div className="relative">
                        <select
                        value={form.category}
                        onChange={(e) =>
                          updateField(
                            "category",
                            e.target.value
                          )
                        }
                        className="w-full appearance-none rounded-md border border-slate-300 bg-[#2d2d2d] px-4 py-3 text-sm font-medium text-white outline-none"
                      >
                        <option>Grocery & FMCG</option>
                        <option>Electronics</option>
                        <option>Fashion</option>
                      </select>

                      <ChevronDown
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <SectionTitle>
                  Location Details
                </SectionTitle>

                <div className="grid grid-cols-2 gap-5">
                  <Input
                    label="State"
                    required
                    value={form.state}
                    onChange={(e) =>
                      updateField("state", e.target.value)
                    }
                  />

                  <Input
                    label="Pincode"
                    required
                    value={form.pincode}
                    onChange={(e) =>
                      updateField(
                        "pincode",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="mt-5">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Business address <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    rows={4}
                    value={form.address}
                    required
                    onChange={(e) =>
                      updateField("address", e.target.value)
                    }
                    className="w-full rounded-md border border-slate-300 bg-[#2d2d2d] px-4 py-3 text-sm font-medium text-white outline-none"
                  />
                </div>

                <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                  <Info size={12} />
                  This address will appear on your invoices and bills
                </div>

                <SectionTitle>
                  Import Existing Data
                </SectionTitle>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center transition hover:bg-slate-50">
                  <CloudUpload
                    size={22}
                    className="mb-3 text-slate-400"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    Drag & drop or click to upload .vyp backup
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Migrates products, customers &
                    transactions
                  </p>

                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      updateField(
                        "backup",
                        e.target.files[0]
                      )
                    }
                  />
                </label>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && !created && (
              <>
                <SectionTitle>
                  Review Before Creating
                </SectionTitle>

                <div className="rounded-lg border border-slate-200 bg-white">

                  {/* TOP */}
                  <div className="flex items-center justify-between border-b border-slate-200 p-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white"
                        style={{
                          backgroundColor: form.color,
                        }}
                      >
                        {initials}
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                          {form.businessName || "Company"}
                        </h2>

                        <p className="text-sm text-slate-500">
                          {form.phone || "No phone"} •{" "}
                          {form.email || "No email"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <div className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600">
                        🏪 {form.businessType}
                      </div>

                      <div className="rounded-md border border-slate-200 px-3 py-1 text-sm text-slate-600">
                        📍 {form.state}
                      </div>
                    </div>
                  </div>

                  {/* GRID */}
                  <div className="grid grid-cols-2 border-b border-slate-200">

                    <div className="border-r border-slate-200 p-5">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                        GSTIN
                      </p>

                      <p className="font-medium text-slate-800">
                        {form.gstin || "—"}
                      </p>
                    </div>

                    <div className="p-5">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Business category
                      </p>

                      <p className="font-medium text-slate-800">
                        {form.category}
                      </p>
                    </div>

                    <div className="border-r border-t border-slate-200 p-5">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                        State
                      </p>

                      <p className="font-medium text-slate-800">
                        {form.state}
                      </p>
                    </div>

                    <div className="border-t border-slate-200 p-5">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Pincode
                      </p>

                      <p className="font-medium text-slate-800">
                        {form.pincode}
                      </p>
                    </div>

                    <div className="border-r border-t border-slate-200 p-5">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Brand colour
                      </p>

                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded"
                          style={{
                            backgroundColor: form.color,
                          }}
                        />

                        <span className="font-medium text-slate-800">
                          {form.color}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 p-5">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Signature
                      </p>

                      <p className="font-medium text-emerald-600">
                        {form.signature
                          ? "✓ Uploaded"
                          : "Not uploaded"}
                      </p>
                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div className="p-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Business address
                    </p>

                    <p className="font-medium leading-7 text-slate-800">
                      {form.address}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                  <Info size={18} />

                  <p className="text-sm leading-6">
                    All details can be edited anytime from
                    Company Settings after creation.
                    GSTIN and phone can be changed with OTP
                    verification.
                  </p>
                </div>
              </>
            )}

            {/* SUCCESS */}
            {created && (
              <div className="py-16 text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#16213e] text-white shadow-lg">
                  <Check size={40} />
                </div>

                <h2 className="mt-8 text-3xl font-bold text-slate-800">
                  {form.businessName || "Company"} is ready!
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-slate-500">
                  Your company has been created
                  successfully. Start by adding products,
                  customers, or your first invoice.
                </p>

                <div className="mt-10 flex justify-center gap-4">
                  <button className=" bg-[#16213e] px-7 py-4 font-semibold text-white transition hover:bg-[#0f172a]">
                    Open company
                  </button>

                  <button
                    onClick={() => {
                      setCreated(false);
                      setStep(1);
                    }}
                    className=" border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back to list
                  </button>
                </div>

                <div className="mt-14 rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white"
                        style={{
                          backgroundColor: form.color,
                        }}
                      >
                        {initials}
                      </div>

                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {form.businessName}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {form.phone} • {form.state} •{" "}
                          {form.businessType}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                      • Active
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          {!created && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-5">

              <p className="text-sm font-medium text-slate-500">
                Step {step} of 3
              </p>

              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={prevStep}
                    className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    Back
                  </button>
                )}

                <button
                  onClick={nextStep}
                  className=" bg-[#16213e] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f172a]"
                >
                  {step === 3
                    ? "Create company"
                    : "Continue"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}