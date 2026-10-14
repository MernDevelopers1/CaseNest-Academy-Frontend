"use client";

import { use, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Upload,
  Plus,
  FileText,
  Trash2,
  Pencil,
  Download,
  AlertCircle,
  Loader2,
  FileCheck,
  FolderOpen,
} from "lucide-react";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import IconButton from "/src/components/ui/IconButton";
import Modal from "/src/components/ui/Modal";
import Input from "/src/components/ui/Input";
import ConfirmDialog from "/src/components/ui/ConfirmDialog";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import {
  formatResourceDate,
  getFileIconName,
  getFileIconBadgeStyle,
  getResourceFileUrl,
} from "/src/lib/sessionTypes";
import type { Session, SessionResource } from "/src/lib/sessionTypes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SessionResourcesPage({ params }: PageProps) {
  const { id: sessionId } = use(params);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal & Edit State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<SessionResource | null>(null);
  const [deletingResource, setDeletingResource] = useState<SessionResource | null>(null);

  // Form State
  const [fileTitle, setFileTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Fetch Session Info
  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const data = await apiFetch<Session[]>(`/AddSession?SessionId=${sessionId}`);
      return data?.[0] ?? null;
    },
  });

  // 2. Fetch Resources for this Session
  const resourcesQuery = useQuery({
    queryKey: ["resources", sessionId],
    queryFn: () =>
      apiFetch<SessionResource[]>(`/Addresources?SessionId=${sessionId}`),
  });

  const session = sessionQuery.data;
  const resources = useMemo(() => resourcesQuery.data ?? [], [resourcesQuery.data]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingResource(null);
    setFileTitle("");
    setSelectedFile(null);
    setFormError(null);
    setModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (resource: SessionResource) => {
    setEditingResource(resource);
    setFileTitle(resource.FileTitle || "");
    setSelectedFile(null);
    setFormError(null);
    setModalOpen(true);
  };

  // File Upload & Resource Record Mutation
  const saveResourceMutation = useMutation({
    mutationFn: async () => {
      let finalPath = editingResource?.Path;
      let finalFileName = editingResource?.FileName;

      // If a new file is chosen, upload it first to /fileupload
      if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await apiFetch<{
          path: string;
          filename: string;
        }>("/fileupload", {
          method: "POST",
          body: formData,
        });

        finalPath = uploadRes.path;
        finalFileName = uploadRes.filename;
      }

      if (editingResource) {
        // Update existing resource
        return apiFetch<SessionResource>("/Addresources", {
          method: "PATCH",
          body: JSON.stringify({
            ResourceId: editingResource.ResourceId,
            SessionId: Number(sessionId),
            FileTitle: fileTitle.trim(),
            FileName: finalFileName,
            Path: finalPath,
          }),
        });
      }

      // Create new resource
      return apiFetch<SessionResource[]>("/Addresources", {
        method: "POST",
        body: JSON.stringify({
          SessionId: Number(sessionId),
          FileTitle: fileTitle.trim(),
          FileName: finalFileName,
          Path: finalPath,
        }),
      });
    },
    onSuccess: () => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ["resources", sessionId] });
      showToast({
        variant: "success",
        message: editingResource
          ? "Resource updated successfully."
          : "Resource uploaded and added successfully.",
      });
      setModalOpen(false);
    },
    onError: (err) => {
      setIsUploading(false);
      setFormError(
        err instanceof ApiError && typeof err.body === "string"
          ? err.body
          : "Failed to upload or save resource. Please check the file and try again.",
      );
    },
  });

  // Delete Resource Mutation
  const deleteMutation = useMutation({
    mutationFn: (resource: SessionResource) =>
      apiFetch<{ message: string }>(`/Addresources?Id=${resource.ResourceId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources", sessionId] });
      showToast({ variant: "success", message: "Resource deleted successfully." });
      setDeletingResource(null);
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to delete this resource. Please try again.",
      });
      setDeletingResource(null);
    },
  });

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Check size limit: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFormError("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
    setFormError(null);
    if (!fileTitle.trim()) {
      // Auto-suggest title based on filename
      const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setFileTitle(baseName.replace(/[_-]/g, " "));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle.trim()) {
      setFormError("Please provide a file title.");
      return;
    }
    if (!editingResource && !selectedFile) {
      setFormError("Please select or drop a file to upload.");
      return;
    }
    setFormError(null);
    saveResourceMutation.mutate();
  };

  return (
    <div className="space-y-xl max-w-6xl mx-auto">
      {/* Context Header & Breadcrumbs matching Stitch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div className="flex flex-col">
          <div className="flex items-center text-on-surface-variant text-small mb-xs gap-xs">
            <Link
              href="/admin/sessions"
              className="hover:text-primary transition-colors flex items-center gap-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sessions</span>
            </Link>
            <span className="text-outline">/</span>
            <span className="font-medium text-on-surface">
              {session?.SessionYear || "Year"} : {session?.SessionName || "Session"}
            </span>
          </div>
          <h1 className="text-h1-mobile md:text-h1 font-bold text-on-background">
            Session Resources
          </h1>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-sm shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Resources
        </Button>
      </div>

      {/* Resources Table Container */}
      <Card className="p-0 overflow-hidden shadow-sm">
        {resourcesQuery.isLoading ? (
          <div className="p-2xl flex flex-col items-center justify-center gap-md">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-body text-on-surface-variant">Loading resources...</p>
          </div>
        ) : resources.length === 0 ? (
          /* Empty State matching Stitch */
          <div className="p-4xl flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-lg text-outline">
              <FolderOpen className="w-10 h-10" />
            </div>
            <h3 className="text-h2 font-bold text-on-surface mb-xs">
              No resources added yet
            </h3>
            <p className="text-body text-on-surface-variant max-w-md mb-xl">
              Get started by adding syllabus, lecture slides, reading materials, or problem sets for this session.
            </p>
            <Button variant="primary" onClick={handleOpenAdd}>
              Upload First Resource
            </Button>
          </div>
        ) : (
          /* Resources Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline/10 text-on-surface-variant">
                  <th className="p-lg text-caption font-bold uppercase tracking-wider w-16">#</th>
                  <th className="p-lg text-caption font-bold uppercase tracking-wider">File Title</th>
                  <th className="p-lg text-caption font-bold uppercase tracking-wider">File Name</th>
                  <th className="p-lg text-caption font-bold uppercase tracking-wider">Added On</th>
                  <th className="p-lg text-caption font-bold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/10">
                {resources.map((resource, index) => {
                  const badgeStyle = getFileIconBadgeStyle(resource.FileName || "");
                  const fileUrl = getResourceFileUrl(resource.Path);

                  return (
                    <tr
                      key={resource.ResourceId}
                      className="hover:bg-surface-container-lowest transition-colors group"
                    >
                      <td className="p-lg text-body text-on-surface-variant font-medium">
                        {index + 1}
                      </td>
                      <td className="p-lg">
                        <div className="flex items-center gap-md">
                          <div
                            className={`w-10 h-10 rounded-xl ${badgeStyle.bg} ${badgeStyle.text} flex items-center justify-center shrink-0 font-medium`}
                          >
                            <span className="material-symbols-outlined text-[22px]">
                              {getFileIconName(resource.FileName)}
                            </span>
                          </div>
                          <span className="text-body font-semibold text-on-surface group-hover:text-primary transition-colors">
                            {resource.FileTitle}
                          </span>
                        </div>
                      </td>
                      <td className="p-lg text-small text-on-surface-variant">
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary hover:underline inline-flex items-center gap-xs max-w-xs truncate"
                          title={resource.FileName}
                        >
                          <Download className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{resource.FileName}</span>
                        </a>
                      </td>
                      <td className="p-lg text-small text-on-surface-variant whitespace-nowrap">
                        {formatResourceDate(resource.AddedOn)}
                      </td>
                      <td className="p-lg text-right">
                        <div className="flex items-center justify-end gap-xs">
                          <IconButton
                            label="Edit Resource"
                            icon={<Pencil className="w-4 h-4 text-secondary hover:text-primary transition-colors" />}
                            size="sm"
                            onClick={() => handleOpenEdit(resource)}
                          />
                          <IconButton
                            label="Delete Resource"
                            icon={<Trash2 className="w-4 h-4 text-error transition-colors" />}
                            size="sm"
                            onClick={() => setDeletingResource(resource)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Resource Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingResource ? "Edit Resource" : "Add Resource"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
          {formError && (
            <div className="bg-error-container text-on-error-container p-md rounded-xl flex items-start gap-sm border border-error/20">
              <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
              <p className="text-small font-medium">{formError}</p>
            </div>
          )}

          {/* File Title */}
          <div>
            <label className="block text-caption font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">
              File Title <span className="text-error">*</span>
            </label>
            <Input
              value={fileTitle}
              onChange={(e) => {
                setFileTitle(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="e.g. Midterm Study Guide or Course Syllabus"
              required
            />
          </div>

          {/* File Upload Drag-and-Drop Area matching Stitch */}
          <div>
            <label className="block text-caption font-semibold text-on-surface-variant uppercase tracking-wider mb-xs">
              {editingResource ? "Replace File (optional)" : "Upload File"}
              {!editingResource && <span className="text-error"> *</span>}
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files?.[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl p-xl flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed transition-all ${
                isDragOver
                  ? "border-primary bg-primary-fixed/20"
                  : selectedFile
                  ? "border-secondary bg-surface-container-low"
                  : "border-outline/30 hover:border-primary bg-surface-bright"
              }`}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center gap-xs">
                  <FileCheck className="w-10 h-10 text-secondary mb-xs" />
                  <p className="text-body font-semibold text-on-surface">{selectedFile.name}</p>
                  <p className="text-caption text-on-surface-variant">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                  </p>
                </div>
              ) : editingResource ? (
                <div className="flex flex-col items-center gap-xs">
                  <FileText className="w-10 h-10 text-primary mb-xs" />
                  <p className="text-body font-semibold text-on-surface">
                    Current: {editingResource.FileName}
                  </p>
                  <p className="text-caption text-on-surface-variant">
                    Click to replace with a new file (PDF, DOCX, PPTX, XLSX)
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-xs">
                  <Upload className="w-10 h-10 text-primary mb-xs" />
                  <p className="text-body font-semibold text-on-surface">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-caption text-on-surface-variant">
                    Accepted types: PDF, DOCX, PPTX, XLSX. Max size: 10MB.
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-sm pt-md border-t border-outline/10">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
              disabled={saveResourceMutation.isPending || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saveResourceMutation.isPending || isUploading}
            >
              {isUploading || saveResourceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-xs" />
                  Uploading...
                </>
              ) : editingResource ? (
                "Update Resource"
              ) : (
                "Upload Resource"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deletingResource)}
        onClose={() => setDeletingResource(null)}
        onConfirm={() => {
          if (deletingResource) {
            deleteMutation.mutate(deletingResource);
          }
        }}
        title={`Delete "${deletingResource?.FileTitle || ""}"?`}
        message="Are you sure you want to delete this resource? This file will be permanently removed from disk and cannot be undone."
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
