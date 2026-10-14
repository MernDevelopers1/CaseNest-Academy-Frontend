"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  MessageSquare,
  Send,
  Trash2,
  User,
  ArrowUpDown,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { useAuthContext } from "/src/components/AuthProvider";
import { getUserDisplayName } from "/src/lib/user";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import Heading from "/src/components/ui/Heading";
import Text from "/src/components/ui/Text";
import Button from "/src/components/ui/Button";
import Card from "/src/components/ui/Card";
import StatusBadge from "/src/components/ui/StatusBadge";
import Avatar from "/src/components/ui/Avatar";
import Modal from "/src/components/ui/Modal";
import type {
  CaseStudy,
  CaseStudyStatus,
  CommentItem,
} from "/src/lib/caseStudyTypes";
import {
  getAttachmentUrl,
  getDisplayStatus,
  formatRelativeTime,
} from "/src/lib/caseStudyTypes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TutorDiscussionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const caseStudyId = Number(resolvedParams.id);

  const { user } = useAuthContext();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [commentToDelete, setCommentToDelete] = useState<CommentItem | null>(null);

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
    queryFn: () => apiFetch<CommentItem[]>(`/AddComment?CaseStudyId=${caseStudyId}`),
    enabled: !isNaN(caseStudyId),
  });

  // 3. Post new comment mutation
  const postCommentMutation = useMutation({
    mutationFn: (text: string) =>
      apiFetch<CommentItem[]>("/AddComment", {
        method: "POST",
        body: JSON.stringify({
          CaseStudyId: caseStudyId,
          UserId: user?.id,
          Comment: text.trim(),
        }),
      }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["case-study-comments", caseStudyId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-data"] });
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

  // 4. Delete comment mutation (moderation)
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      apiFetch(`/AddComment?CommentId=${commentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      setCommentToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["case-study-comments", caseStudyId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-data"] });
      showToast({
        variant: "success",
        message: "Comment was deleted.",
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
    },
  });

  // 5. Update case study status mutation
  const statusMutation = useMutation({
    mutationFn: (Status: CaseStudyStatus) =>
      apiFetch<{ success: boolean }>("/CaseStudyStatus", {
        method: "PATCH",
        body: JSON.stringify({ CaseStudyId: caseStudyId, Status }),
      }),
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["case-study-detail", caseStudyId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-case-studies"] });
      queryClient.invalidateQueries({ queryKey: ["all-case-study"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-dashboard-data"] });
      showToast({
        variant: "success",
        message:
          newStatus === "Approved"
            ? "Case study approved and visible to students."
            : "Case study marked as rejected.",
      });
    },
    onError: () => {
      showToast({
        variant: "error",
        message: "Failed to update case study status.",
      });
    },
  });

  const study = caseStudyQuery.data;
  const rawComments = useMemo(() => commentsQuery.data ?? [], [commentsQuery.data]);

  const comments = useMemo(() => {
    return [...rawComments].sort((a, b) => {
      const timeA = a.AddedOn ? new Date(a.AddedOn).getTime() : a.CommentId;
      const timeB = b.AddedOn ? new Date(b.AddedOn).getTime() : b.CommentId;
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [rawComments, sortOrder]);

  const handlePost = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentText.trim() || postCommentMutation.isPending) return;
    postCommentMutation.mutate(commentText);
  };

  const authorName = study
    ? [study.FirstName, study.LastName].filter(Boolean).join(" ") || "Student"
    : "Author";
  const status = study ? getDisplayStatus(study.Status) : "Pending";
  const attachmentUrl = study ? getAttachmentUrl(study.AttachFile) : "#";

  return (
    <div className="flex flex-col gap-lg max-w-[1024px] mx-auto w-full pb-32">
      {/* Back button */}
      <div>
        <Link
          href="/tutor/discussions"
          className="inline-flex items-center gap-xs text-primary font-semibold text-small hover:underline"
        >
          <ArrowLeft size={16} />
          Return to Discussions
        </Link>
      </div>

      {/* Case Study Header Card */}
      {caseStudyQuery.isLoading ? (
        <div className="h-48 w-full animate-pulse rounded-xl border border-outline-variant bg-surface-container-low" />
      ) : !study ? (
        <Card padding="lg" className="text-center p-xl">
          <AlertCircle size={40} className="mx-auto mb-sm text-error" />
          <Heading as="h3" size="h4" className="text-on-surface">
            Case Study Not Found
          </Heading>
          <Text size="small" className="mt-xs text-on-surface-variant">
            The requested case study could not be located.
          </Text>
          <Link href="/tutor/discussions" className="inline-block mt-md">
            <Button variant="secondary" size="sm">
              Back to Discussions
            </Button>
          </Link>
        </Card>
      ) : (
        <section className="bg-surface border border-outline-variant rounded-xl p-lg md:p-xl shadow-sm flex flex-col gap-lg">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-md">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-xs mb-xs">
                <span className="bg-secondary-container text-on-secondary-container text-caption font-semibold px-md py-xs rounded-full">
                  Session: {study.SessionName || `#${study.SessionId}`}
                </span>
                <span className="text-on-surface-variant text-caption flex items-center gap-xs">
                  <User size={13} /> {authorName}
                </span>
                <StatusBadge status={status} />
              </div>

              <Heading as="h1" size="h2" className="text-primary mt-xs">
                {study.Title}
              </Heading>

              {study.ModelAndFramworkCoverd && (
                <p className="font-body text-body text-on-surface-variant mt-sm">
                  {study.ModelAndFramworkCoverd}
                </p>
              )}
            </div>

            <div className="flex flex-wrap md:flex-col gap-xs shrink-0 items-start md:items-end">
              {study.AttachFile && (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Button variant="secondary" size="sm" className="gap-xs">
                    <Download size={16} />
                    Study Materials
                  </Button>
                </a>
              )}

              {/* Status Action Buttons directly in discussion */}
              {status !== "Approved" && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => statusMutation.mutate("Approved")}
                  loading={statusMutation.isPending}
                  className="gap-xs"
                >
                  <Check size={14} />
                  Approve Study
                </Button>
              )}
              {status === "Approved" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => statusMutation.mutate("Rejected")}
                  loading={statusMutation.isPending}
                  className="gap-xs text-error border-error/50 hover:bg-error-container"
                >
                  <X size={14} />
                  Reject Study
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Thread Header & Sort Controls */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-sm mt-md">
        <div className="flex items-center gap-sm">
          <Heading as="h2" size="h4" className="text-primary">
            Discussion Thread ({comments.length})
          </Heading>
        </div>

        <button
          type="button"
          onClick={() =>
            setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
          }
          className="flex items-center gap-xs rounded-lg px-md py-xs text-small font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <ArrowUpDown size={15} />
          <span>{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
        </button>
      </div>

      {/* Comments Thread List */}
      {commentsQuery.isLoading ? (
        <div className="flex flex-col gap-md">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-lg border border-outline-variant bg-surface-container-low"
            />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <Card padding="lg" className="text-center p-xl">
          <MessageSquare size={40} className="mx-auto mb-sm text-on-surface-variant opacity-40" />
          <Heading as="h3" size="h4" className="text-on-surface">
            No comments yet
          </Heading>
          <Text size="small" className="mt-xs text-on-surface-variant">
            Be the first to start the discussion or share feedback on this case study.
          </Text>
        </Card>
      ) : (
        <div className="flex flex-col gap-lg">
          {comments.map((comment) => {
            const commenterName =
              [comment.FirstName, comment.LastName].filter(Boolean).join(" ") || "Participant";
            const isTutorOrAuthor =
              comment.RoleId === 2 ||
              (user?.id && comment.UserId === user.id) ||
              (study?.UserId && comment.UserId === study.UserId);

            return (
              <article key={comment.CommentId} className="flex gap-md group">
                <Avatar
                  src={comment.DisplayPic ?? undefined}
                  name={commenterName}
                  size="md"
                  className="shrink-0 mt-1"
                />

                <div className="flex-1 rounded-lg rounded-tl-none border border-outline-variant bg-surface p-md shadow-sm transition-shadow hover:shadow">
                  <div className="flex items-start justify-between gap-sm mb-xs">
                    <div>
                      <div className="flex items-center gap-xs flex-wrap">
                        <span className="font-semibold text-small text-on-surface">
                          {commenterName}
                        </span>

                        {isTutorOrAuthor && (
                          <span className="rounded-full bg-primary px-sm py-[2px] text-[10px] font-semibold text-on-primary">
                            Author / Tutor
                          </span>
                        )}
                      </div>

                      <span className="text-caption text-on-surface-variant">
                        {formatRelativeTime(comment.AddedOn)}
                      </span>
                    </div>

                    {/* Tutor Delete Moderation Button */}
                    <button
                      type="button"
                      onClick={() => setCommentToDelete(comment)}
                      title="Delete Comment (Tutor Moderation)"
                      className="rounded p-xs text-on-surface-variant opacity-0 transition-all hover:bg-error-container hover:text-on-error-container group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="text-body text-on-surface leading-relaxed whitespace-pre-wrap">
                    {comment.Comment}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Sticky Comment Composer */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-outline-variant bg-surface/95 backdrop-blur-md p-md md:p-lg shadow-[0_-4px_16px_rgba(43,9,87,0.06)]">
        <form
          onSubmit={handlePost}
          className="max-w-[1024px] mx-auto flex items-end gap-md"
        >
          <div className="hidden sm:block shrink-0">
            <Avatar
              src={typeof user?.DisplayPic === "string" ? user.DisplayPic : null}
              name={getUserDisplayName(user) || "Tutor"}
              size="md"
            />
          </div>

          <div className="flex-1">
            <textarea
              id="comment-input"
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  handlePost();
                }
              }}
              placeholder="Join the discussion or leave feedback... (Ctrl+Enter to post)"
              className="w-full resize-none rounded-lg border border-outline-variant bg-surface-container-lowest px-md py-sm text-body text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={!commentText.trim() || postCommentMutation.isPending}
            loading={postCommentMutation.isPending}
            className="gap-xs shrink-0 self-end h-11 px-lg"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Post</span>
          </Button>
        </form>
      </div>

      {/* Delete Comment Confirm Dialog */}
      <Modal
        open={Boolean(commentToDelete)}
        onClose={() => setCommentToDelete(null)}
        title="Delete Comment"
        size="sm"
      >
        <div className="flex flex-col gap-lg">
          <Text size="body" className="text-on-surface">
            Are you sure you want to delete this comment? This action cannot be undone.
          </Text>

          {commentToDelete && (
            <div className="rounded-lg bg-surface-container-low p-md border border-outline-variant text-small text-on-surface-variant italic">
              &ldquo;{commentToDelete.Comment}&rdquo;
            </div>
          )}

          <div className="flex justify-end gap-sm pt-md border-t border-outline-variant">
            <Button
              variant="secondary"
              onClick={() => setCommentToDelete(null)}
              disabled={deleteCommentMutation.isPending}
              className="border-transparent hover:bg-surface-container"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                commentToDelete && deleteCommentMutation.mutate(commentToDelete.CommentId)
              }
              loading={deleteCommentMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
