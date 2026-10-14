"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Star,
  Search,
  Eye,
  MapPin,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Card from "/src/components/ui/Card";
import Button from "/src/components/ui/Button";
import ConfirmDialog from "/src/components/ui/ConfirmDialog";
import { useToast } from "/src/components/ui/Toast";
import { apiFetch, ApiError } from "/src/lib/api";
import {
  parseRatingScore,
  getFeedbackSubmitterName,
  getFeedbackInitials,
} from "/src/lib/feedbackTypes";
import type { FeedbackItem } from "/src/lib/feedbackTypes";
import FeedbackDetailModal from "/src/components/admin/feedback/FeedbackDetailModal";

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [deletingFeedback, setDeletingFeedback] = useState<FeedbackItem | null>(null);

  // Fetch feedback list
  const feedbackQuery = useQuery({
    queryKey: ["feedback"],
    queryFn: () => apiFetch<FeedbackItem[]>("/feedback"),
  });

  // Delete feedback mutation
  const deleteMutation = useMutation({
    mutationFn: (item: FeedbackItem) =>
      apiFetch<{ message: string }>(`/feedback?FeedbackId=${item.FeedbackId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      showToast({ variant: "success", message: "Feedback deleted successfully." });
      setDeletingFeedback(null);
      setSelectedFeedback(null);
    },
    onError: (err) => {
      showToast({
        variant: "error",
        message:
          err instanceof ApiError && typeof err.body === "string"
            ? err.body
            : "Failed to delete feedback.",
      });
      setDeletingFeedback(null);
    },
  });

  const feedbacks = useMemo(() => feedbackQuery.data ?? [], [feedbackQuery.data]);

  // KPI Calculations
  const totalResponses = feedbacks.length;

  const avgRating = useMemo(() => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, item) => acc + parseRatingScore(item.Usefull), 0);
    return (sum / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const actionableCount = useMemo(() => {
    return feedbacks.filter((item) => Boolean(item.ImprovedInFuture || item.AnyOtherComment)).length;
  }, [feedbacks]);

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      // Rating filter
      if (ratingFilter !== "all") {
        const score = parseRatingScore(item.Usefull);
        if (ratingFilter === "5" && score !== 5) return false;
        if (ratingFilter === "4" && score !== 4) return false;
        if (ratingFilter === "3" && score > 3) return false;
      }

      // Search filter
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const submitter = getFeedbackSubmitterName(item).toLowerCase();
      const sector = (item.SectorExperiance || "").toLowerCase();
      const location = (item.geoLocation || "").toLowerCase();
      const comment = (item.AnyOtherComment || "").toLowerCase();
      const improve = (item.ImprovedInFuture || "").toLowerCase();
      const sm = (item.UnderstandingSM || "").toLowerCase();

      return (
        submitter.includes(term) ||
        sector.includes(term) ||
        location.includes(term) ||
        comment.includes(term) ||
        improve.includes(term) ||
        sm.includes(term)
      );
    });
  }, [feedbacks, ratingFilter, search]);

  return (
    <div className="space-y-xl max-w-7xl mx-auto">
      {/* Page Header matching Stitch */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
        <div>
          <h1 className="text-h1-mobile md:text-h1 font-bold text-on-background">
            Learning Feedback
          </h1>
          <p className="text-body text-on-surface-variant mt-xs">
            Review student submissions, peer-led discussion insights, and course experience ratings.
          </p>
        </div>
      </div>

      {/* Stats Overview (Bento Grid matching Stitch) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Card 1: Total Responses */}
        <Card className="relative overflow-hidden p-lg group hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-start mb-md">
            <div>
              <p className="text-caption font-bold text-on-surface-variant uppercase tracking-wider">
                Total Responses
              </p>
              <p className="text-h1 font-black text-primary mt-xs">
                {feedbackQuery.isLoading ? "—" : totalResponses}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <p className="text-caption text-secondary font-semibold flex items-center gap-xs">
            <TrendingUp className="w-4 h-4" /> Comprehensive student feedback log
          </p>
        </Card>

        {/* Card 2: Average Rating */}
        <Card className="relative overflow-hidden p-lg group hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-start mb-md">
            <div>
              <p className="text-caption font-bold text-on-surface-variant uppercase tracking-wider">
                Average Rating
              </p>
              <div className="flex items-baseline gap-xs mt-xs">
                <span className="text-h1 font-black text-on-surface">
                  {feedbackQuery.isLoading ? "—" : avgRating}
                </span>
                <span className="text-h3 text-on-surface-variant font-bold">/ 5.0</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-[#FFC107] text-[#FFC107]" />
            </div>
          </div>
          <div className="flex gap-xs text-[#FFC107]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${
                  s <= Math.round(Number(avgRating))
                    ? "fill-[#FFC107] text-[#FFC107]"
                    : "text-outline/30"
                }`}
              />
            ))}
          </div>
        </Card>

        {/* Card 3: Actionable Suggestions */}
        <Card className="relative overflow-hidden p-lg group hover:-translate-y-0.5 transition-transform">
          <div className="flex justify-between items-start mb-md">
            <div>
              <p className="text-caption font-bold text-on-surface-variant uppercase tracking-wider">
                Course Suggestions
              </p>
              <p className="text-h1 font-black text-secondary mt-xs">
                {feedbackQuery.isLoading ? "—" : actionableCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <p className="text-caption text-on-surface-variant">
            Student ideas for future curriculum & whiteboard improvements
          </p>
        </Card>
      </div>

      {/* Toolbar: Search and Filter */}
      <Card className="p-md flex flex-col sm:flex-row gap-md items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-5 h-5 absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedback by student, sector, location, or comments..."
            className="w-full pl-11 pr-md py-sm bg-surface-container-low border border-outline/20 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-variant/60"
          />
        </div>

        <div className="flex items-center gap-sm w-full sm:w-auto">
          <span className="text-small font-medium text-on-surface-variant shrink-0">
            Rating:
          </span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-md py-sm rounded-xl bg-surface-container-low border border-outline/20 text-small text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars & Below</option>
          </select>
        </div>
      </Card>

      {/* Feedback List Container */}
      <Card className="p-0 overflow-hidden shadow-sm">
        {feedbackQuery.isLoading ? (
          <div className="p-2xl flex flex-col items-center justify-center gap-md">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-body text-on-surface-variant">Loading student feedback...</p>
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="p-4xl flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-lg text-outline">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-h2 font-bold text-on-surface mb-xs">
              {search || ratingFilter !== "all" ? "No matching feedback" : "No Feedback Received Yet"}
            </h3>
            <p className="text-body text-on-surface-variant max-w-md mb-xl">
              {search || ratingFilter !== "all"
                ? "Try adjusting your search terms or rating filters."
                : "Student submissions and learning responses will appear here as sessions complete."}
            </p>
            {(search || ratingFilter !== "all") && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setRatingFilter("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table View matching Stitch */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline/10 text-on-surface-variant font-semibold text-caption uppercase tracking-wider">
                    <th className="py-md px-lg">Submitter</th>
                    <th className="py-md px-lg">Location & Sector</th>
                    <th className="py-md px-lg">Rating</th>
                    <th className="py-md px-lg w-2/5">Key Feedback Preview</th>
                    <th className="py-md px-lg text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/10">
                  {filteredFeedbacks.map((item) => {
                    const submitterName = getFeedbackSubmitterName(item);
                    const initials = getFeedbackInitials(item);
                    const score = parseRatingScore(item.Usefull);
                    const previewText =
                      item.AnyOtherComment ||
                      item.ImprovedInFuture ||
                      item.UnderstandingSM ||
                      item.OwnBackExpUnderstandingStratMang ||
                      "Positive session reflection recorded.";

                    return (
                      <tr
                        key={item.FeedbackId}
                        onClick={() => setSelectedFeedback(item)}
                        className="hover:bg-surface-container-lowest transition-colors group cursor-pointer"
                      >
                        <td className="py-md px-lg">
                          <div className="flex items-center gap-md">
                            <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline/20 shrink-0">
                              {item.DisplayPic ? (
                                <img
                                  src={
                                    item.DisplayPic.startsWith("http")
                                      ? item.DisplayPic
                                      : `${process.env.NEXT_PUBLIC_API_URL}${item.DisplayPic}`
                                  }
                                  alt={submitterName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-small">
                                  {initials}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-body text-on-surface group-hover:text-primary transition-colors">
                                {submitterName}
                              </div>
                              <div className="text-caption text-on-surface-variant">
                                {item.Specialization || item.Education || "Student"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-md px-lg text-small text-on-surface-variant">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-on-surface flex items-center gap-xs">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              {item.geoLocation || "Global"}
                            </span>
                            <span className="text-caption text-on-surface-variant">
                              {item.SectorExperiance || "General Sector"}
                            </span>
                          </div>
                        </td>

                        <td className="py-md px-lg">
                          <div className="flex gap-xs text-[#FFC107]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= score
                                    ? "fill-[#FFC107] text-[#FFC107]"
                                    : "text-outline/30"
                                }`}
                              />
                            ))}
                          </div>
                        </td>

                        <td className="py-md px-lg text-small text-on-surface">
                          <p className="line-clamp-2 italic pr-lg">
                            &ldquo;{previewText}&rdquo;
                          </p>
                        </td>

                        <td className="py-md px-lg text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFeedback(item);
                            }}
                            className="p-sm rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View matching Stitch */}
            <div className="md:hidden flex flex-col divide-y divide-outline/10">
              {filteredFeedbacks.map((item) => {
                const submitterName = getFeedbackSubmitterName(item);
                const initials = getFeedbackInitials(item);
                const score = parseRatingScore(item.Usefull);
                const previewText =
                  item.AnyOtherComment ||
                  item.ImprovedInFuture ||
                  item.UnderstandingSM ||
                  "Positive session reflection recorded.";

                return (
                  <div
                    key={item.FeedbackId}
                    onClick={() => setSelectedFeedback(item)}
                    className="p-lg hover:bg-surface-container-lowest transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-sm">
                      <div className="flex items-center gap-sm">
                        <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-outline/20 shrink-0">
                          {item.DisplayPic ? (
                            <img
                              src={
                                item.DisplayPic.startsWith("http")
                                  ? item.DisplayPic
                                  : `${process.env.NEXT_PUBLIC_API_URL}${item.DisplayPic}`
                              }
                              alt={submitterName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-small">
                              {initials}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-body text-on-surface">
                            {submitterName}
                          </div>
                          <div className="text-caption text-on-surface-variant">
                            {item.geoLocation || "Global"} • {item.SectorExperiance || "Student"}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-xs text-[#FFC107]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= score
                                ? "fill-[#FFC107] text-[#FFC107]"
                                : "text-outline/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-small text-on-surface mb-md line-clamp-3 italic">
                      &ldquo;{previewText}&rdquo;
                    </p>

                    <div className="flex justify-between items-center text-primary text-small font-semibold">
                      <span>View Full Q&A</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Feedback Detail Slide-over / Modal */}
      <FeedbackDetailModal
        open={Boolean(selectedFeedback)}
        onClose={() => setSelectedFeedback(null)}
        item={selectedFeedback}
        onDelete={(item) => setDeletingFeedback(item)}
      />

      {/* Delete Feedback Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deletingFeedback)}
        onClose={() => setDeletingFeedback(null)}
        onConfirm={() => {
          if (deletingFeedback) {
            deleteMutation.mutate(deletingFeedback);
          }
        }}
        title="Delete Feedback Entry?"
        message="Are you sure you want to delete this feedback submission? This record will be permanently removed from the system."
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
      />
    </div>
  );
}
