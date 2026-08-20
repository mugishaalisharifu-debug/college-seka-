"use client";

import React, { useState, ChangeEvent } from "react";
import {
  Plus,
  Search,
  Trash2,
  Save,
  Pencil,
  Upload,
  ArrowLeft,
  ImageIcon,
} from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================
export interface LevelTeachingAssignment {
  levelOrClass: string;
  subjects: string[];
}

export type DepartmentType =
  | "Administration"
  | "Nursery"
  | "Primary"
  | "Lower Secondary"
  | "TVET"
  | "Accountant & Finance"
  | "Support";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: DepartmentType;
  bio: string;
  imageUrl: string;
  phone?: string;
  email?: string;
  levelsOrClasses?: string;
  courseOrSubject?: string;
  teachingAssignments?: LevelTeachingAssignment[];
}

const DEPARTMENTS: DepartmentType[] = [
  "Administration",
  "Nursery",
  "Primary",
  "Lower Secondary",
  "TVET",
  "Accountant & Finance",
  "Support",
];



// Fallback image path when none is uploaded or provided
const DEFAULT_AVATAR_PATH = "/images/staff/default-avatar.jpg";

// ==========================================
// MAIN CONTROLLER COMPONENT
// ==========================================
export default function TeachersDirectory() {
  const [viewMode, setViewMode] = useState<"list" | "add" | "edit">("list");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredStaff = staffList.filter((member) => {
    const matchesTab = activeTab === "All" || member.department === activeTab;
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleOpenAddPage = () => {
    setSelectedStaff(null);
    setViewMode("add");
  };

  const handleOpenEditPage = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setViewMode("edit");
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setStaffList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSaveStaff = (savedMember: StaffMember) => {
    setStaffList((prev) => {
      const exists = prev.some((item) => item.id === savedMember.id);
      if (exists) {
        return prev.map((item) => (item.id === savedMember.id ? savedMember : item));
      }
      return [savedMember, ...prev];
    });
    setViewMode("list");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-12 font-sans text-xs">
      <div className="max-w-5xl mx-auto">
        
        {/* DIRECTORY LIST VIEW */}
        {viewMode === "list" && (
          <div className="space-y-6">
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 bg-white dark:bg-zinc-900 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Staff Directory
                </h1>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Click the button to register a new teacher or edit existing profiles.
                </p>
              </div>

              <button
                onClick={handleOpenAddPage}
                className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Teacher / Staff
              </button>
            </div>

            {/* Search & Department Filters */}
            <div className="space-y-3">
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search staff by name or title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
                {["All", ...DEPARTMENTS].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                      activeTab === tab
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Teacher Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.length === 0 && (
                <div className="col-span-full py-16 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 space-y-3">
                  <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                    No staff records found. Data will load from the server.
                  </p>
                </div>
              )}
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs flex flex-col"
                >
                  <div className="relative w-full h-56 bg-zinc-200 dark:bg-zinc-800">
                    <img
                      src={staff.imageUrl || DEFAULT_AVATAR_PATH}
                      alt={staff.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <span className="px-2.5 py-0.5 w-fit rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-2">
                      {staff.department}
                    </span>

                    <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                      {staff.name}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                      {staff.role}
                    </p>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-3 mb-4">
                      {staff.bio}
                    </p>

                    <div className="mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenEditPage(staff)}
                        className="flex-1 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 text-zinc-700 dark:text-zinc-200 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff.id, staff.name)}
                        className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEPARATE ADD / EDIT FORM VIEW */}
        {(viewMode === "add" || viewMode === "edit") && (
          <StaffFormPage
            mode={viewMode}
            initialData={selectedStaff}
            onBack={() => setViewMode("list")}
            onSave={handleSaveStaff}
          />
        )}
      </div>
    </div>
  );
}

// ==========================================
// FORM PAGE WITH DIRECT IMAGE FILE UPLOADER
// ==========================================
interface StaffFormPageProps {
  mode: "add" | "edit";
  initialData: StaffMember | null;
  onBack: () => void;
  onSave: (staff: StaffMember) => void;
}

function StaffFormPage({ mode, initialData, onBack, onSave }: StaffFormPageProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [role, setRole] = useState(initialData?.role || "");
  const [department, setDepartment] = useState<DepartmentType>(
    initialData?.department || "TVET"
  );
  const [phone, setPhone] = useState(initialData?.phone || "");
  const email = initialData?.email || "";
  const [bio, setBio] = useState(initialData?.bio || "");
  const [levelsOrClasses, setLevelsOrClasses] = useState(
    initialData?.levelsOrClasses || ""
  );
  const [courseOrSubject, setCourseOrSubject] = useState(
    initialData?.courseOrSubject || ""
  );

  const [photoPreview, setPhotoPreview] = useState<string>(
    initialData?.imageUrl || DEFAULT_AVATAR_PATH
  );

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newOrUpdatedMember: StaffMember = {
      id: initialData
        ? initialData.id
        : name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4),
      name,
      role,
      department,
      phone: phone || undefined,
      email: email || undefined,
      bio,
      imageUrl: photoPreview || DEFAULT_AVATAR_PATH,
      levelsOrClasses: levelsOrClasses || undefined,
      courseOrSubject: courseOrSubject || undefined,
    };

    onSave(newOrUpdatedMember);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-md max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Staff Directory
        </button>

        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          {mode === "add" ? "Register New Teacher / Staff" : "Edit Staff Information"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* EASY PHOTO UPLOAD BUTTON */}
        <div className="p-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col items-center justify-center text-center space-y-3">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
            Teacher Profile Photo
          </label>

          {photoPreview ? (
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-sm">
              <img
                src={photoPreview}
                alt="Teacher Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-400">
              <ImageIcon className="w-10 h-10" />
            </div>
          )}

          <label className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            {photoPreview !== DEFAULT_AVATAR_PATH ? "Change Photo" : "Upload Photo File"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <p className="text-[11px] text-zinc-400">
            Click to upload a picture from your device.
          </p>
        </div>

        {/* INPUT FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Sina Gerard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Job Title / Role <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TVET Instructor"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Department <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value as DepartmentType)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+250 788 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Levels / Classes Taught
            </label>
            <input
              type="text"
              placeholder="e.g. Level 3, 4 & 5 SOD"
              value={levelsOrClasses}
              onChange={(e) => setLevelsOrClasses(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Subject Name
            </label>
            <input
              type="text"
              placeholder="e.g. Software Development"
              value={courseOrSubject}
              onChange={(e) => setCourseOrSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-zinc-900 dark:text-white"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Biography / Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Write a brief introduction about this teacher..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-600 dark:text-zinc-300 text-xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Teacher Profile
          </button>
        </div>
      </form>
    </div>
  );
}