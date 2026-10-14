"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  MessageSquare,
  Send,
  Trash2,
  ArrowUpDown,
  CheckSquare,
  Square,
  AlertCircle,
  FileText,
  Layers,
  Globe,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import {
  getUserDisplayName,
  getUserId,
  getUserDisplayPic,
} from "/src/lib/user";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import Heading from "/src/components/ui/Heading";
import Button from "/src/components/ui/Button";
import Card from "/src/components/ui/Card";
import StatusBadge from "/src/components/ui/StatusBadge";
import Avatar from "/src/components/ui/Avatar";
import ConfirmDialog from "/src/components/ui/ConfirmDialog";
import type {
  CaseStudy,
  CommentItem,
} from "/src/lib/caseStudyTypes";
import {
  getAttachmentUrl,
  getDisplayStatus,
  formatRelativeTime,
  formatDate,
} from "/src/lib/caseStudyTypes";
import {
  isStudyRead,
  toggleStudyRead,
} from "/src/lib/readStudies";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StudentDiscussionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const caseStudyId = Number(resolvedParams.id);

  const { user } = useAuthContext();
  const userId = getUserId(user);
  const userPic = getUserDisplayPic(user);
  const userName = getUserDisplayName(user);

  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [commentToDelete, setCommentToDelete] = useState<CommentItem | null>(null);
  const [isRead, setIsRead] = useState(() => isStudyRead(userId, caseStudyId));

  // Synchronize read status
  useEffect(() => {
    const handleReadChanged = () => {
      setIsRead(isStudyRead(userId, caseStudyId));
    };

    window.addEventListener("casenest:read-studies-changed", handleReadChanged);
    return () => {
      window.removeEventListener("casenest:read-studies-changed", handleReadChanged);
    };
  }, [userId, caseStudyId]);

  const handleToggleRead = () => {
    const next = toggleStudyRead(userId, caseStudyId);
    setIsRead(next);
  };

  // 1. Fetch case study details
  const caseStudyQuery = useQuery({
    queryKey: ["case-study-detail", caseStudyId],
    queryFn: async (): Promise<CaseStudy | null> => {
      const all = await apiFetch<CaseStudy[]>("/AllCaseStudy");
      const found = all.find((c) => Number(c.CaseStudyId) === caseStudyId);
      return found || null;
    },
    enabled: !isNaN(caseStudyId),
  });

  // 2. Fetch comments for this case study
  const commentsQuery = useQuery({
    queryKey: ["case-study-comments", caseStudyId],
    queryFn: () =>
      apiFetch<CommentItem[]>(`/AddComment?CaseStudyId=${caseStudyId}`),
    enabled: !isNaN(caseStudyId),
  });

  // 3. Post new comment mutation with validation
  const postCommentMutation = useMutation({
    mutationFn: (text: string) =>
      apiFetch<CommentItem[]>("/AddComment", {
        method: "POST",
        body: JSON.stringify({
          CaseStudyId: caseStudyId,
          UserId: userId,
          Comment: text.trim(),
        }),
      }),
    onSuccess: () => {
      setCommentText("");
      setCommentError(null);
      queryClient.invalidateQueries({
        queryKey: ["case-study-comments", caseStudyId],
      });
      showToast({
        variant: "success",
        message: "Your comment was posted successfully.",
      });
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to post comment. Please try again.",
      });
    },
  });

  // 4. Delete own comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      apiFetch<{ message: string }>(`/AddComment?CommentId=${commentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["case-study-comments", caseStudyId],
      });
      setCommentToDelete(null);
      showToast({
        variant: "success",
        message: "Comment deleted.",
      });
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to delete comment.",
      });
      setCommentToDelete(null);
    },
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    const trimmed = commentText.trim();
    if (!trimmed || trimmed.length < 2) {
      setCommentError("Comment must be at least 2 characters long.");
      return;
    }
    if (trimmed.length > 2000) {
      setCommentError("Comment cannot exceed 2000 characters.");
      return;
    }

    postCommentMutation.mutate(trimmed);
  };

  const caseStudy = caseStudyQuery.data;
  const status = caseStudy ? getDisplayStatus(caseStudy.Status) : "Pending";
  const authorName =
    caseStudy && [caseStudy.FirstName, caseStudy.LastName].filter(Boolean).join(" ")
      ? [caseStudy.FirstName, caseStudy.LastName].filter(Boolean).join(" ")
      : "Cohort Peer";

  const fileUrl = caseStudy ? getAttachmentUrl(caseStudy.AttachFile) : "#";

  // Parse summary or description
  let detailsText: string | null = null;
  if (caseStudy?.CaseStudyinfo) {
    try {
      const parsed =
        typeof caseStudy.CaseStudyinfo === "string"
          ? JSON.parse(caseStudy.CaseStudyinfo)
          : caseStudy.CaseStudyinfo;
      if (typeof parsed === "string") {
        detailsText = parsed;
      } else if (parsed && typeof parsed === "object") {
        detailsText =
          parsed.description ||
          parsed.info ||
          parsed.CaseStudyinfo ||
          JSON.stringify(parsed, null, 2);
      }
    } catch {
      detailsText = String(caseStudy.CaseStudyinfo);
    }
  }

  // Sorted comments
  const sortedComments = useMemo(() => {
    const list = [...(commentsQuery.data ?? [])];
    if (sortOrder === "newest") {
      return list.sort(
        (a, b) => Number(b.CommentId) - Number(a.CommentId)
      );
    }
    return list.sort(
      (a, b) => Number(a.CommentId) - Number(b.CommentId)
    );
  }, [commentsQuery.data, sortOrder]);

  return (
    <div className="flex flex-col gap-xl max-w-5xl mx-auto pb-3xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-md">
        <Link
          href="/student/discussion"
          className="text-caption font-medium text-primary hover:underline flex items-center gap-xs"
        >
          <ArrowLeft size={14} />
          <span>Back to Case Studies Directory</span>
        </Link>

        {caseStudy && (
          <button
            type="button"
            onClick={handleToggleRead}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-caption font-medium transition-colors ${
              isRead
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            }`}
          >
            {isRead ? (
              <>
                <CheckSquare size={14} className="text-emerald-500" />
                <span>Marked as Read</span>
              </>
            ) : (
              <>
                <Square size={14} />
                <span>Mark as Read</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Case Study Header Card */}
      {caseStudyQuery.isLoading ? (
        <div className="h-64 rounded-2xl bg-surface-container animate-pulse border border-outline-variant" />
      ) : !caseStudy ? (
        <Card className="p-xl text-center border border-outline-variant bg-surface">
          <AlertCircle size={36} className="text-error mx-auto mb-sm" />
          <p className="font-semibold text-on-surface">Case Study Not Found</p>
          <p className="text-caption text-on-surface-variant mt-xs">
            The requested paper may have been removed or is pending approval.
          </p>
          <Link href="/student/discussion">
            <Button variant="secondary" size="sm" className="mt-md">
              Return to Directory
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-xl border border-outline-variant bg-surface shadow-xs flex flex-col gap-lg">
          {/* Top Row: Author & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-md border-b border-outline-variant pb-md">
            <div className="flex items-center gap-md">
              <Avatar
                src={caseStudy.DisplayPic ?? undefined}
                name={authorName}
                size="md"
              />
              <div>
                <div className="flex items-center gap-xs">
                  <span className="font-semibold text-on-surface text-small">
                    {authorName}
                  </span>
                  {caseStudy.UserId === userId && (
                    <span className="text-caption font-semibold px-2 py-0.2 rounded bg-primary/10 text-primary">
                      You (Author)
                    </span>
                  )}
                </div>
                <p className="text-caption text-on-surface-variant">
                  {caseStudy.Specialization || caseStudy.Education || "Cohort Student"} • Submitted on {formatDate(caseStudy.SubmittedOn)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-xs">
              <StatusBadge status={status} size="sm" />

              {caseStudy.AttachFile && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Button variant="secondary" size="sm" className="gap-xs">
                    <Download size={15} />
                    Download Paper
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Title & Tags */}
          <div>
            <Heading as="h1" size="h3" className="text-on-surface break-words">
              {caseStudy.Title}
            </Heading>

            <div className="flex flex-wrap items-center gap-xs mt-sm text-caption text-on-surface-variant">
              {caseStudy.SessionName && (
                <span className="bg-surface-container px-2.5 py-1 rounded-md font-medium text-on-surface">
                  Session: {caseStudy.SessionName}
                </span>
              )}
              {caseStudy.Sector && (
                <span className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-md">
                  <Tag size={12} />
                  {caseStudy.Sector}
                </span>
              )}
              {(caseStudy.CountryName || caseStudy.CountryValue) && (
                <span className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-md">
                  <Globe size={12} />
                  {caseStudy.CountryName || caseStudy.CountryValue}
                </span>
              )}
            </div>
          </div>

          {/* Summary / Overview */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-low p-md flex flex-col gap-xs">
            <span className="text-caption font-bold uppercase text-primary flex items-center gap-xs">
              <FileText size={14} />
              Case Study Overview
            </span>
            <p className="text-small text-on-surface leading-relaxed whitespace-pre-wrap">
              {detailsText ||
                "No executive summary was provided for this case study. Download the full attached paper above to review the detailed analysis."}
            </p>
          </div>

          {caseStudy.ModelAndFramworkCoverd && (
            <div className="text-small">
              <span className="text-caption font-bold uppercase text-on-surface-variant flex items-center gap-xs">
                <Layers size={13} />
                Models & Frameworks Covered
              </span>
              <p className="text-on-surface font-medium mt-0.5">
                {caseStudy.ModelAndFramworkCoverd}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Discussion Thread Section */}
      <div className="flex flex-col gap-lg">
        {/* Comments Section Header */}
        <div className="flex items-center justify-between border-b border-outline-variant pb-sm">
          <div className="flex items-center gap-xs">
            <MessageSquare size={18} className="text-primary" />
            <Heading as="h2" size="h4" className="text-on-surface">
              Peer Discussion Thread
            </Heading>
            <span className="px-2 py-0.5 rounded-full text-caption font-bold bg-primary/10 text-primary">
              {commentsQuery.data?.length ?? 0}
            </span>
          </div>

          {/* Sort order toggle */}
          {(commentsQuery.data?.length ?? 0) > 1 && (
            <button
              type="button"
              onClick={() =>
                setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
              }
              className="text-caption font-medium text-on-surface-variant hover:text-on-surface flex items-center gap-xs"
            >
              <ArrowUpDown size={14} />
              <span>{sortOrder === "newest" ? "Newest first" : "Oldest first"}</span>
            </button>
          )}
        </div>

        {/* Comments List */}
        {commentsQuery.isLoading ? (
          <div className="flex flex-col gap-md">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-surface-container animate-pulse border border-outline-variant"
              />
            ))}
          </div>
        ) : sortedComments.length === 0 ? (
          <Card className="p-xl text-center border border-dashed border-outline-variant bg-surface">
            <MessageSquare size={32} className="text-on-surface-variant opacity-40 mx-auto mb-xs" />
            <p className="font-semibold text-on-surface">No comments yet</p>
            <p className="text-caption text-on-surface-variant max-w-sm mx-auto mt-0.5">
              Be the first to share your thoughts, ask questions about the methodology, or offer constructive peer feedback!
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-md">
            {sortedComments.map((comment) => {
              const isMe = comment.UserId === userId;
              const isTutor = comment.RoleId === 2;
              const isAuthor = caseStudy && comment.UserId === caseStudy.UserId;
              const commenterName =
                [comment.FirstName, comment.LastName].filter(Boolean).join(" ") ||
                (isMe ? "You" : `User #${comment.UserId}`);

              return (
                <Card
                  key={comment.CommentId}
                  className={`p-md border rounded-xl flex flex-col gap-xs ${
                    isTutor
                      ? "border-primary/40 bg-primary/5"
                      : isMe
                      ? "border-outline-variant bg-surface-container-low"
                      : "border-outline-variant bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between gap-sm">
                    <div className="flex items-center gap-sm">
                      <Avatar
                        src={comment.DisplayPic ?? undefined}
                        name={commenterName}
                        size="sm"
                      />
                      <div className="flex flex-wrap items-center gap-xs">
                        <span className="font-semibold text-small text-on-surface">
                          {commenterName}
                        </span>

                        {isTutor && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-caption font-bold bg-primary text-on-primary">
                            <ShieldCheck size={11} />
                            Tutor
                          </span>
                        )}

                        {isAuthor && !isTutor && (
                          <span className="px-2 py-0.2 rounded-full text-caption font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            Author
                          </span>
                        )}

                        {isMe && !isAuthor && (
                          <span className="text-caption font-semibold px-2 py-0.2 rounded bg-surface-container text-on-surface-variant">
                            You
                          </span>
                        )}

                        <span className="text-caption text-on-surface-variant">
                          • {formatRelativeTime(comment.AddedOn)}
                        </span>
                      </div>
                    </div>

                    {/* Own Comment Deletion */}
                    {isMe && (
                      <button
                        type="button"
                        onClick={() => setCommentToDelete(comment)}
                        className="text-on-surface-variant hover:text-error transition-colors p-1"
                        title="Delete your comment"
                        aria-label="Delete your comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="text-small text-on-surface leading-relaxed pl-10 whitespace-pre-wrap">
                    {comment.Comment}
                  </p>
                </Card>
              );
            })}
          </div>
        )}

        {/* Comment Composer */}
        <Card className="p-md border border-outline-variant bg-surface mt-md shadow-xs">
          <form onSubmit={handlePostComment} className="flex flex-col gap-sm">
            <div className="flex items-start gap-sm">
              <Avatar
                src={userPic}
                name={userName || "You"}
                size="sm"
                className="shrink-0 mt-1"
              />
              <div className="flex-1 flex flex-col gap-1">
                <textarea
                  value={commentText}
                  onChange={(e) => {
                    setCommentText(e.target.value);
                    if (commentError) setCommentError(null);
                  }}
                  rows={3}
                  maxLength={2000}
                  placeholder="Join the discussion... Share analysis, ask clarification questions, or suggest alternative strategies"
                  className={`w-full rounded-xl border bg-surface-container-low p-md text-small text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/50 resize-y ${
                    commentError
                      ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                      : "border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20"
                  }`}
                />
                <div className="flex items-center justify-between text-caption px-1">
                  {commentError ? (
                    <span className="text-error">{commentError}</span>
                  ) : (
                    <span className="text-on-surface-variant">
                      Participate constructively to foster cohort peer learning.
                    </span>
                  )}
                  <span className="text-on-surface-variant">
                    {commentText.trim().length} / 2000
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-xs">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={postCommentMutation.isPending}
                disabled={
                  postCommentMutation.isPending ||
                  commentText.trim().length < 2
                }
                className="gap-xs"
              >
                <Send size={14} />
                Post Comment
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Delete Comment Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        onConfirm={() => {
          if (commentToDelete) {
            deleteCommentMutation.mutate(commentToDelete.CommentId);
          }
        }}
        title="Delete Comment"
        message="Are you sure you want to delete your comment? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
