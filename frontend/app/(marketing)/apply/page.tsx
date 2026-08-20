"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Camera,
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  CLASS_LEVEL_OPTIONS,
  TVET_TRADES,
  getClassLevel,
  getRequiredDocuments,
  type EducationCategory,
} from "@/lib/application-documents";
import api from "@/lib/api";
import axios from "axios";

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  classLevel: string;
  trade: string;
  previousSchool: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  residentialAddress: string;
  relationship: string;
}

const CATEGORY_ORDER: EducationCategory[] = [
  "Nursery",
  "Primary",
  "Lower Secondary",
  "TVET",
];

const INITIAL_FORM: FormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  classLevel: "",
  trade: "",
  previousSchool: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  residentialAddress: "",
  relationship: "",
};

function educationLevelToScope(category: EducationCategory | undefined): string {
  switch (category) {
    case "Nursery":
      return "NURSERY";
    case "Primary":
      return "PRIMARY";
    case "Lower Secondary":
      return "LOWER SECONDARY";
    case "TVET":
      return "TVET";
    default:
      return "PRIMARY";
  }
}

export default function ApplyPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>("");
  const [referenceCode, setReferenceCode] = useState<string>("");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [uploads, setUploads] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedLevel = getClassLevel(formData.classLevel);
  const requiredDocuments = useMemo(
    () => getRequiredDocuments(formData.classLevel),
    [formData.classLevel],
  );
  const isTvet = selectedLevel?.category === "TVET";

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setValidationError("");
    setFormData((prev) => {
      if (name === "classLevel") {
        const nextCategory = getClassLevel(value)?.category;
        return {
          ...prev,
          classLevel: value,
          trade: nextCategory === "TVET" ? prev.trade : "",
        };
      }
      return { ...prev, [name]: value };
    });

    if (name === "classLevel") {
      setUploads({});
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploads((prev) => ({ ...prev, [key]: file }));
    setValidationError("");
  };

  const handleRemoveFile = (key: string) => {
    setUploads((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateStep = (step: number): string => {
    if (step === 1) {
      if (
        !formData.firstName.trim() ||
        !formData.lastName.trim() ||
        !formData.dateOfBirth ||
        !formData.gender ||
        !formData.classLevel
      ) {
        return "Please fill in all required fields marked with an asterisk (*).";
      }
      if (isTvet && !formData.trade) {
        return "Please select the trade or training program you are applying for.";
      }
      return "";
    }

    if (step === 2) {
      if (
        !formData.parentName.trim() ||
        !formData.parentPhone.trim() ||
        !formData.residentialAddress.trim() ||
        !formData.relationship
      ) {
        return "Please complete all required parent contact details.";
      }
      return "";
    }

    if (step === 3) {
      const missing = requiredDocuments.filter(
        (doc) => !doc.optional && !uploads[doc.key],
      );
      if (missing.length > 0) {
        return `Missing required document(s): ${missing
          .map((doc) => doc.label)
          .join(", ")}.`;
      }
      return "";
    }

    return "";
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    setValidationError(error);
    if (!error) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setValidationError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateStep(1) || validateStep(2) || validateStep(3);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);
    setValidationError("");
    try {
      const payload = new window.FormData();
      payload.append("firstName", formData.firstName.trim());
      payload.append("lastName", formData.lastName.trim());
      payload.append("dateOfBirth", formData.dateOfBirth);
      payload.append("gender", formData.gender);
      payload.append("educationLevel", educationLevelToScope(selectedLevel?.category));
      payload.append("appliedClass", selectedLevel?.label || formData.classLevel);
      payload.append("tradeName", formData.trade);
      payload.append("previousSchool", formData.previousSchool);
      payload.append("parentName", formData.parentName.trim());
      payload.append("parentPhone", formData.parentPhone.trim());
      payload.append("parentEmail", formData.parentEmail.trim());
      payload.append("residentialDescription", formData.residentialAddress.trim());
      payload.append("relationship", formData.relationship);

      Object.entries(uploads).forEach(([key, file]) => {
        payload.append(key, file);
      });

      const res = await api.post<{ referenceCode: string }>("/applications", payload);
      setReferenceCode(res.data.referenceCode);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : "Could not submit the application. Please try again.";
      setValidationError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewApplication = () => {
    setFormData(INITIAL_FORM);
    setUploads({});
    setReferenceCode("");
    setValidationError("");
    setCurrentStep(1);
  };

  return (
    <main className="min-h-screen pt-28 md:pt-36 pb-16 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* STEP PROGRESS INDICATOR */}
        {!referenceCode && (
          <div className="flex items-center justify-center gap-3 mb-10">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    currentStep === step
                      ? "bg-emerald-700 text-white shadow-md scale-105"
                      : currentStep > step
                        ? "bg-emerald-800 text-white"
                        : " text-amber-950 dark:text-zinc-400"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`h-0.5 w-8 sm:w-12 transition-colors duration-300 ${
                      currentStep > step
                        ? "bg-emerald-700"
                        : "bg-[#e8dfd1] dark:bg-zinc-800"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* MAIN FORM CARD */}
        <div className=" rounded-3xl border border-amber-900/10 dark:border-zinc-800 p-6 md:p-10 shadow-sm">
          {!referenceCode ? (
            <form onSubmit={handleSubmit}>
              {/* STEP 1: STUDENT INFORMATION */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white border-b border-amber-900/10 dark:border-zinc-800 pb-4">
                    Student Information
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Gender *
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Class / Level Applied For *
                    </label>
                    <select
                      name="classLevel"
                      value={formData.classLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                    >
                      <option value="">Select Class / Level</option>
                      {CATEGORY_ORDER.map((category) => (
                        <optgroup key={category} label={category}>
                          {CLASS_LEVEL_OPTIONS.filter(
                            (option) => option.category === category,
                          ).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    {selectedLevel && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                        {requiredDocuments.filter((doc) => !doc.optional).length}{" "}
                        required document(s) for {selectedLevel.label}:{" "}
                        {requiredDocuments
                          .filter((doc) => !doc.optional)
                          .map((doc) => doc.label)
                          .join(", ")}
                        .
                      </p>
                    )}
                  </div>

                  {isTvet && (
                    <div>
                      <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Trade / Training Program *
                      </label>
                      <select
                        name="trade"
                        value={formData.trade}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                      >
                        <option value="">Select Trade</option>
                        {TVET_TRADES.map((trade) => (
                          <option key={trade} value={trade}>
                            {trade}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Previous School (if any)
                    </label>
                    <input
                      type="text"
                      name="previousSchool"
                      value={formData.previousSchool}
                      onChange={handleInputChange}
                      placeholder="Enter previous school name"
                      className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                    />
                  </div>

                  {validationError && (
                    <div className="p-4 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                    >
                      Next: Parent Info
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: PARENT / GUARDIAN INFORMATION */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white border-b border-amber-900/10 dark:border-zinc-800 pb-4">
                    Parent / Guardian Information
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      placeholder="Enter parent or guardian full name"
                      className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleInputChange}
                        placeholder="+250 788 000 000"
                        className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleInputChange}
                        placeholder="parent@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Residential Address *
                    </label>
                    <textarea
                      name="residentialAddress"
                      value={formData.residentialAddress}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="District, Sector, Cell, Village"
                      className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Relationship to Student *
                    </label>
                    <select
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-amber-900/15 dark:border-zinc-700  text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 transition-all text-sm"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Guardian">Guardian</option>
                      <option value="Other">Other Relative</option>
                    </select>
                  </div>

                  {validationError && (
                    <div className="p-4 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 rounded-xl border border-amber-900/20 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-[#f3edd1] dark:hover:bg-zinc-800 font-semibold text-sm transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                    >
                      Next: Documents
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: REQUIRED DOCUMENTS */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-sans text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                      Required Documents
                    </h2>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Documents required for{" "}
                      <strong className="text-emerald-800 dark:text-emerald-400">
                        {selectedLevel?.label}
                      </strong>
                      . Accepted formats: JPG, PNG, PDF.
                    </p>
                  </div>

                  {requiredDocuments.map((doc) => {
                    const uploaded = uploads[doc.key];
                    const isPhoto = doc.key === "passportPhoto";
                    return (
                      <div
                        key={doc.key}
                        className="p-5 rounded-2xl border border-amber-900/10 dark:border-zinc-700 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                              {isPhoto ? (
                                <Camera className="w-5 h-5" />
                              ) : (
                                <FileText className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                                {doc.label} {doc.optional ? "" : "*"}
                              </h4>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {doc.description}
                              </p>
                            </div>
                          </div>
                          {uploaded ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                            </span>
                          ) : (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
                                doc.optional
                                  ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                                  : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                              }`}
                            >
                              {doc.optional ? "Optional" : "× Required"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex-1 border-2 border-dashed border-amber-900/20 dark:border-zinc-700 rounded-xl p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-100/30 dark:hover:bg-zinc-700/30 transition-all text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            <UploadCloud className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                            <span>
                              {uploaded
                                ? uploaded.name
                                : `Click to upload ${doc.label.toLowerCase()}`}
                            </span>
                            <input
                              type="file"
                              accept={doc.accept}
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, doc.key)}
                            />
                          </label>
                          {uploaded && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(doc.key)}
                              aria-label={`Remove ${doc.label}`}
                              className="p-2.5 rounded-xl border border-amber-900/20 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {validationError && (
                    <div className="p-4 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 rounded-xl border border-amber-900/20 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-[#f3edd1] dark:hover:bg-zinc-800 font-semibold text-sm transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                    >
                      Next: Review
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & SUBMIT */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white border-b border-amber-900/10 dark:border-zinc-800 pb-4">
                    Review Application
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#fcf8f2] dark:bg-zinc-800/50 border border-amber-900/10 dark:border-zinc-700 space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                        Student Details
                      </h4>
                      <p className="text-base font-semibold text-zinc-900 dark:text-white">
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        Level: {selectedLevel?.label} | DOB:{" "}
                        {formData.dateOfBirth} | Gender: {formData.gender}
                      </p>
                      {formData.trade && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-300">
                          Trade: {formData.trade}
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-[#fcf8f2] dark:bg-zinc-800/50 border border-amber-900/10 dark:border-zinc-700 space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                        Parent / Guardian
                      </h4>
                      <p className="text-base font-semibold text-zinc-900 dark:text-white">
                        {formData.parentName} ({formData.relationship})
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300">
                        Phone: {formData.parentPhone} | Email:{" "}
                        {formData.parentEmail || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fcf8f2] dark:bg-zinc-800/50 border border-amber-900/10 dark:border-zinc-700 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                      Uploaded Documents
                    </h4>
                    <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                      {requiredDocuments.map((doc) => (
                        <li key={doc.key}>
                          • {doc.label}:{" "}
                          {uploads[doc.key]?.name ?? "Not provided"}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-900/10 text-xs text-zinc-700 dark:text-zinc-300">
                    By clicking &quot;Submit Application&quot;, you confirm that
                    all information supplied is accurate and truthful.
                  </div>

                  {validationError && (
                    <div className="p-4 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 rounded-xl border border-amber-900/20 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-[#f3edd1] dark:hover:bg-zinc-800 font-semibold text-sm transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            /* SUCCESS CONFIRMATION STATE */
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-serif text-3xl font-bold text-zinc-900 dark:text-white">
                Application Submitted Successfully!
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
                Thank you for applying to College fondation Sina Gerard.{" "}
                {formData.firstName} {formData.lastName} has been registered for{" "}
                {selectedLevel?.label} with {Object.keys(uploads).length}{" "}
                document(s) attached. Your reference code is{" "}
                <strong className="text-emerald-800 dark:text-emerald-400">
                  {referenceCode}
                </strong>
                .
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/application-result"
                  className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-md"
                >
                  View Admission Results
                </Link>
                <button
                  type="button"
                  onClick={handleStartNewApplication}
                  className="px-6 py-3 rounded-xl border border-amber-900/20 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-[#f3edd1] dark:hover:bg-zinc-800 font-semibold text-sm transition-all cursor-pointer"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
