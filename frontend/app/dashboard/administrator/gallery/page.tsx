"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Camera,
  ImageIcon,
  ShieldCheck,
  Plus,
  Trash2,
  X,
  Upload,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-helpers";

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  date: string;
  published: boolean;
}

const CATEGORIES = [
  { key: "campus", label: "Campus" },
  { key: "academics", label: "Academics" },
  { key: "tvet", label: "TVET Workshops" },
  { key: "sports", label: "Sports" },
  { key: "events", label: "Events" },
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AdministratorGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState("all");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0].key,
    imageUrl: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [imagePreview, setImagePreview] = useState("");

  // ------------------------------------------------------------
  // LOAD GALLERY
  // ------------------------------------------------------------

  const loadItems = async () => {
    setIsLoading(true);

    try {
      const res = await api.get<GalleryItem[]>("/admin/gallery");

      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Gallery loading error:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load gallery photos."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    if (typeof window !== "undefined" && window.location.search.includes("action=add")) {
      setShowModal(true);
    }
  }, []);

  // ------------------------------------------------------------
  // RESET FORM
  // ------------------------------------------------------------

  const resetForm = () => {
    setSelectedFile(null);
    setImagePreview("");

    setForm({
      title: "",
      category: CATEGORIES[0].key,
      imageUrl: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // ------------------------------------------------------------
  // OPEN MODAL
  // ------------------------------------------------------------

  const openUploadModal = () => {
    resetForm();
    setShowModal(true);
  };

  // ------------------------------------------------------------
  // CLOSE MODAL
  // ------------------------------------------------------------

  const closeUploadModal = () => {
    if (isUploading) return;

    setShowModal(false);
    resetForm();
  };

  // ------------------------------------------------------------
  // FILE VALIDATION
  // ------------------------------------------------------------

  const validateImageFile = (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(
        "Invalid image format. Only JPG, PNG, and WebP are allowed."
      );

      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        "Image is too large. Maximum allowed size is 5MB."
      );

      return false;
    }

    return true;
  };

  // ------------------------------------------------------------
  // FILE SELECT
  // ------------------------------------------------------------

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!validateImageFile(file)) {
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    // If a local file is selected, clear the URL.
    setForm((previous) => ({
      ...previous,
      imageUrl: "",
    }));

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        setImagePreview(result);
      }
    };

    reader.onerror = () => {
      toast.error("Unable to preview the selected image.");
      setSelectedFile(null);
      setImagePreview("");
    };

    reader.readAsDataURL(file);
  };

  // ------------------------------------------------------------
  // IMAGE URL CHANGE
  // ------------------------------------------------------------

  const handleImageUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.trimStart();

    setForm((previous) => ({
      ...previous,
      imageUrl: value,
    }));

    // If URL is being used, remove local file.
    if (value) {
      setSelectedFile(null);
      setImagePreview(value);
    } else {
      setImagePreview("");
    }
  };

  // ------------------------------------------------------------
  // UPLOAD
  // ------------------------------------------------------------

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploading) return;

    const title = form.title.trim();
    const imageUrl = form.imageUrl.trim();

    // Validate title
    if (!title) {
      toast.error("Please enter a photo title.");
      return;
    }

    // Validate category
    const validCategory = CATEGORIES.some(
      (category) => category.key === form.category
    );

    if (!validCategory) {
      toast.error("Please select a valid gallery category.");
      return;
    }

    // Validate date
    if (!form.date) {
      toast.error("Please select an upload date.");
      return;
    }

    // Must have either a file or URL.
    if (!selectedFile && !imageUrl) {
      toast.error(
        "Please select an image file or provide an image URL."
      );
      return;
    }

    // Validate selected file again before upload.
    if (selectedFile && !validateImageFile(selectedFile)) {
      return;
    }

    // Basic URL validation when using URL.
    if (!selectedFile && imageUrl) {
      try {
        const parsedUrl = new URL(imageUrl);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          toast.error(
            "Please provide a valid HTTP or HTTPS image URL."
          );
          return;
        }
      } catch {
        toast.error("Please provide a valid image URL.");
        return;
      }
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("category", form.category);
      formData.append("date", form.date);

      // IMPORTANT:
      // Backend should receive uploaded image as "file".
      if (selectedFile) {
        formData.append("file", selectedFile, selectedFile.name);
      }

      // Only send imageUrl when no local file was selected.
      if (!selectedFile && imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      console.log("Uploading gallery photo:", {
        title,
        category: form.category,
        date: form.date,
        fileName: selectedFile?.name ?? null,
        fileType: selectedFile?.type ?? null,
        fileSize: selectedFile?.size ?? null,
        imageUrl: selectedFile ? null : imageUrl,
      });

      /*
       * IMPORTANT:
       * Do NOT manually set Content-Type to application/json.
       *
       * Axios/browser will generate the multipart boundary
       * automatically when FormData is used.
       */
      const response = await api.post(
        "/admin/gallery",
        formData,
        {
          headers: {
            "Content-Type": undefined,
          },
        }
      );

      console.log(
        "Gallery upload successful:",
        response.data
      );

      toast.success(
        "Photo uploaded successfully!"
      );

      setShowModal(false);
      resetForm();

      await loadItems();
    } catch (error: any) {
      console.error(
        "========================================"
      );
      console.error("GALLERY UPLOAD FAILED");
      console.error(
        "Status:",
        error?.response?.status
      );
      console.error(
        "Response:",
        error?.response?.data
      );
      console.error(
        "Message:",
        error?.message
      );
      console.error(
        "========================================"
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to upload the gallery photo."
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ------------------------------------------------------------
  // DELETE
  // ------------------------------------------------------------

  const handleDelete = async (id: string) => {
    if (deletingId || togglingId) return;

    const confirmed = window.confirm(
      "Delete this photo from the gallery?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await api.delete(`/admin/gallery/${id}`);

      toast.success("Photo deleted successfully.");

      await loadItems();
    } catch (error) {
      console.error("Gallery delete error:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to delete the photo."
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ------------------------------------------------------------
  // TOGGLE PUBLISH
  // ------------------------------------------------------------

  const togglePublish = async (id: string) => {
    if (deletingId || togglingId) return;

    setTogglingId(id);

    try {
      await api.patch(
        `/admin/gallery/${id}/toggle-publish`
      );

      toast.success(
        "Publication status updated."
      );

      await loadItems();
    } catch (error) {
      console.error(
        "Gallery publish toggle error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update publication status."
        )
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ------------------------------------------------------------
  // FILTER
  // ------------------------------------------------------------

  const filteredItems =
    selectedCategoryFilter === "all"
      ? items
      : items.filter(
          (item) =>
            item.category === selectedCategoryFilter
        );

  const publishedCount = items.filter(
    (item) => item.published
  ).length;

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Media Asset Management
            </p>

            <h1 className="mt-1 font-sans text-2xl font-bold text-zinc-900 dark:text-white">
              Campus Photo Gallery
            </h1>
          </div>

          <button
            type="button"
            onClick={openUploadModal}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Upload Photo
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
            <span>Total Gallery Photos</span>
            <ImageIcon className="h-4 w-4 text-emerald-700" />
          </div>

          <div className="mt-3 text-2xl font-serif font-bold text-zinc-900 dark:text-white">
            {isLoading ? "..." : items.length}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
            <span>Live on Portal</span>
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
          </div>

          <div className="mt-3 text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400">
            {isLoading ? "..." : publishedCount}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
            <span>Active Categories</span>
            <Camera className="h-4 w-4 text-emerald-700" />
          </div>

          <div className="mt-3 text-2xl font-serif font-bold text-zinc-900 dark:text-white">
            {CATEGORIES.length}
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-emerald-900/10 pb-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={() =>
            setSelectedCategoryFilter("all")
          }
          className={`shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            selectedCategoryFilter === "all"
              ? "bg-emerald-700 text-white"
              : "bg-amber-900/5 text-zinc-600 hover:bg-amber-900/10 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          All Photos
        </button>

        {CATEGORIES.map((category) => (
          <button
            type="button"
            key={category.key}
            onClick={() =>
              setSelectedCategoryFilter(
                category.key
              )
            }
            className={`shrink-0 cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              selectedCategoryFilter ===
              category.key
                ? "bg-emerald-700 text-white"
                : "bg-amber-900/5 text-zinc-600 hover:bg-amber-900/10 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* GALLERY */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-700" />
          <span className="text-xs font-bold">
            Loading photo gallery...
          </span>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const isDeletingThis =
              deletingId === item.id;

            const isTogglingThis =
              togglingId === item.id;

            return (
              <div
                key={item.id}
                className={`group relative h-64 overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100 shadow-xs transition-opacity dark:border-zinc-800 dark:bg-zinc-900 sm:h-72 ${
                  isDeletingThis
                    ? "pointer-events-none opacity-50"
                    : "opacity-100"
                }`}
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-zinc-400">
                    <ImageIcon className="mb-2 h-10 w-10 opacity-50" />
                    <span className="text-xs font-bold uppercase">
                      No Image Uploaded
                    </span>
                  </div>
                )}

                {/* CONTROLS */}
                <div className="absolute right-3 top-3 z-10 flex gap-1.5">
                  <button
                    type="button"
                    disabled={
                      isTogglingThis ||
                      isDeletingThis
                    }
                    onClick={() =>
                      togglePublish(item.id)
                    }
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-bold shadow-md transition-all disabled:cursor-not-allowed ${
                      item.published
                        ? "bg-emerald-700 text-white"
                        : "bg-amber-500 text-white"
                    } ${
                      isTogglingThis
                        ? "opacity-75"
                        : ""
                    }`}
                  >
                    {isTogglingThis ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : item.published ? (
                      "Published"
                    ) : (
                      "Hidden"
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={
                      isDeletingThis ||
                      isTogglingThis
                    }
                    onClick={() =>
                      handleDelete(item.id)
                    }
                    className="cursor-pointer rounded-xl bg-rose-600/90 p-1.5 text-white shadow-md transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Delete Photo"
                  >
                    {isDeletingThis ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* DETAILS */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent p-5 opacity-90 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    {item.category}
                  </span>

                  <h3 className="line-clamp-2 text-base font-bold leading-snug text-white">
                    {item.title}
                  </h3>

                  <span className="mt-1 text-[10px] font-mono text-zinc-400">
                    {item.date}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-emerald-900/10 py-12 text-center dark:border-zinc-800">
              <p className="text-xs text-zinc-500">
                No photo items found in this category filter.
              </p>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs"
          onClick={closeUploadModal}
        >
          <div
            className="my-8 w-full max-w-md space-y-4 rounded-3xl border border-emerald-900/10 bg-white p-6 shadow-2xl dark:bg-zinc-900"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-emerald-900/10 pb-3">
              <h2 className="font-serif text-xl font-bold text-zinc-900 dark:text-white">
                Upload New Gallery Photo
              </h2>

              <button
                type="button"
                disabled={isUploading}
                onClick={closeUploadModal}
                className="cursor-pointer rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-50 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleAdd}
              className="space-y-4 text-xs"
            >
              {/* FILE */}
              <div className="space-y-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300">
                  Select Image File (JPG, PNG,
                  WebP ≤ 5MB)
                </label>

                <div
                  className={`relative overflow-hidden rounded-2xl border-2 border-dashed border-emerald-900/20 bg-emerald-900/5 p-4 text-center dark:border-zinc-700 dark:bg-zinc-800/40 ${
                    isUploading
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      <Image
                        src={imagePreview}
                        alt="Upload Preview"
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, 448px"
                        className="object-cover"
                        onError={() => {
                          if (
                            !selectedFile
                          ) {
                            setImagePreview(
                              ""
                            );
                            toast.error(
                              "Unable to load this image URL."
                            );
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 py-6">
                      <Upload className="h-8 w-8 text-emerald-700" />

                      <p className="font-medium text-zinc-600 dark:text-zinc-400">
                        Click to upload photo
                        from computer
                      </p>

                      <p className="text-[10px] text-zinc-500">
                        JPG, PNG, or WebP up to
                        5MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    disabled={isUploading}
                    onChange={
                      handleFileChange
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  />
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-[10px] dark:bg-emerald-950/30">
                    <span className="max-w-[75%] truncate font-medium text-emerald-800 dark:text-emerald-300">
                      {selectedFile.name}
                    </span>

                    <span className="text-zinc-500">
                      {(
                        selectedFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </span>
                  </div>
                )}
              </div>

              {/* URL */}
              <div>
                <label className="mb-1 flex items-center gap-1 font-bold text-zinc-700 dark:text-zinc-300">
                  <LinkIcon className="h-3.5 w-3.5 text-emerald-700" />
                  Or Image URL
                </label>

                <input
                  type="url"
                  disabled={
                    isUploading ||
                    !!selectedFile
                  }
                  value={form.imageUrl}
                  onChange={
                    handleImageUrlChange
                  }
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 font-medium text-zinc-900 focus:border-emerald-600 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />

                {selectedFile && (
                  <p className="mt-1 text-[10px] text-zinc-500">
                    Remove the selected file
                    before using an image URL.
                  </p>
                )}
              </div>

              {/* TITLE */}
              <div>
                <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                  Photo Title *
                </label>

                <input
                  type="text"
                  required
                  maxLength={150}
                  disabled={isUploading}
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Science Fair Exhibition"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 font-bold text-zinc-900 focus:border-emerald-600 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              {/* CATEGORY + DATE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                    Category
                  </label>

                  <select
                    disabled={isUploading}
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category:
                          e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 font-bold focus:border-emerald-600 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {CATEGORIES.map(
                      (category) => (
                        <option
                          key={category.key}
                          value={
                            category.key
                          }
                        >
                          {category.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-zinc-700 dark:text-zinc-300">
                    Upload Date
                  </label>

                  <input
                    type="date"
                    disabled={isUploading}
                    value={form.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 font-medium focus:border-emerald-600 focus:outline-none disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 border-t border-emerald-900/10 pt-3">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={closeUploadModal}
                  className="cursor-pointer rounded-xl border border-zinc-200 px-4 py-2.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}