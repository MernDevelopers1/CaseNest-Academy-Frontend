"use client";

import {
  Star,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Trash2,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import Modal from "/src/components/ui/Modal";
import Button from "/src/components/ui/Button";
import {
  parseRatingScore,
  getFeedbackSubmitterName,
  getFeedbackInitials,
} from "/src/lib/feedbackTypes";
import type { FeedbackItem } from "/src/lib/feedbackTypes";

export interface FeedbackDetailModalProps {
  open: boolean;
  onClose: () => void;
  item: FeedbackItem | null;
  onDelete?: (item: FeedbackItem) => void;
}

export default function FeedbackDetailModal({
  open,
  onClose,
  item,
  onDelete,
}: FeedbackDetailModalProps) {
  if (!item) return null;

  const submitterName = getFeedbackSubmitterName(item);
  const initials = getFeedbackInitials(item);
  const rating = parseRatingScore(item.Usefull);

  return (
    <Modal open={open} onClose={onClose} title="Feedback Details" size="lg">
      <div className="flex flex-col gap-lg">
        {/* Submitter Info Card */}
        <div className="bg-surface-container-low rounded-2xl border border-outline/20 p-lg flex flex-col sm:flex-row items-start sm:items-center gap-md">
          <div className="w-14 h-14 rounded-2xl bg-surface-container overflow-hidden border border-outline/20 shrink-0">
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
              <div className="w-full h-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-h4">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-h3 font-bold text-on-surface truncate">
              {submitterName}
            </h3>
            <p className="text-small text-on-surface-variant truncate">
              {item.Specialization || item.Education || "Student"} • {item.Age || "Age —"} • {item.Gender || "Gender —"}
            </p>

            <div className="flex flex-wrap gap-xs mt-sm">
              {item.geoLocation && (
                <span className="inline-flex items-center gap-xs px-sm py-0.5 rounded-full bg-primary-fixed/30 text-primary text-caption font-semibold">
                  <MapPin className="w-3 h-3" />
                  {item.geoLocation}
                </span>
              )}
              {item.SectorExperiance && (
                <span className="inline-flex items-center gap-xs px-sm py-0.5 rounded-full bg-secondary-fixed/30 text-secondary text-caption font-semibold">
                  <Briefcase className="w-3 h-3" />
                  {item.SectorExperiance}
                </span>
              )}
              {item.Experience && (
                <span className="inline-flex items-center gap-xs px-sm py-0.5 rounded-full bg-tertiary-fixed/30 text-tertiary text-caption font-semibold">
                  <Calendar className="w-3 h-3" />
                  {item.Experience}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Feedback Sections */}
        <div className="space-y-md">
          {/* Overall Rating */}
          <div className="bg-surface rounded-xl border border-outline/20 p-lg shadow-xs">
            <h4 className="text-caption font-bold text-on-surface-variant uppercase tracking-wider mb-xs">
              Overall Experience & Rating
            </h4>
            <div className="flex items-center gap-md">
              <div className="flex gap-xs text-[#FFC107]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= rating ? "fill-[#FFC107] text-[#FFC107]" : "text-outline/30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-h3 font-bold text-on-surface">
                {rating} / 5
              </span>
              <span className="text-small text-on-surface-variant italic">
                ({item.Usefull || "Useful"})
              </span>
            </div>
          </div>

          {/* Strategic Management Understanding */}
          {(item.UnderstandingSM || item.OwnBackExpUnderstandingStratMang) && (
            <div className="bg-surface rounded-xl border border-outline/20 p-lg shadow-xs space-y-sm">
              <h4 className="text-caption font-bold text-primary uppercase tracking-wider flex items-center gap-xs">
                <TrendingUp className="w-4 h-4" />
                Strategic Management Understanding
              </h4>
              {item.UnderstandingSM && (
                <div>
                  <p className="text-small font-semibold text-on-surface">
                    Did this session improve your understanding of topics related to Strategic Management?
                  </p>
                  <p className="text-body text-on-surface-variant mt-0.5">
                    {item.UnderstandingSM}
                  </p>
                </div>
              )}
              {item.OwnBackExpUnderstandingStratMang && (
                <div className="pt-sm border-t border-outline/10">
                  <p className="text-small font-semibold text-on-surface">
                    Did using your own background experience help you understand Strategic Management better?
                  </p>
                  <p className="text-body text-on-surface-variant mt-0.5">
                    {item.OwnBackExpUnderstandingStratMang}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Classroom Learning & Peer Sharing */}
          {(item.BackExpInClass || item.LearnFromOther) && (
            <div className="bg-surface rounded-xl border border-outline/20 p-lg shadow-xs space-y-sm">
              <h4 className="text-caption font-bold text-secondary uppercase tracking-wider flex items-center gap-xs">
                <MessageSquare className="w-4 h-4" />
                Peer-Led Discussion & Classroom Exchange
              </h4>
              {item.BackExpInClass && (
                <div>
                  <p className="text-small font-semibold text-on-surface">
                    Did you like talking about your background experience in the classroom?
                  </p>
                  <p className="text-body text-on-surface-variant mt-0.5">
                    {item.BackExpInClass}
                  </p>
                </div>
              )}
              {item.LearnFromOther && (
                <div className="pt-sm border-t border-outline/10">
                  <p className="text-small font-semibold text-on-surface">
                    Did you learn from other people and their background experiences?
                  </p>
                  <p className="text-body text-on-surface-variant mt-0.5">
                    {item.LearnFromOther}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Integration & Future Learning */}
          {item.ExpInYourLearn && (
            <div className="bg-surface rounded-xl border border-outline/20 p-lg shadow-xs">
              <h4 className="text-caption font-bold text-on-surface-variant uppercase tracking-wider mb-xs">
                Building Experience into Course Learning
              </h4>
              <p className="text-body text-on-surface-variant">
                {item.ExpInYourLearn}
              </p>
            </div>
          )}

          {/* Areas for Improvement */}
          {item.ImprovedInFuture && (
            <div className="bg-surface rounded-xl border border-outline/20 p-lg shadow-xs border-l-4 border-l-secondary">
              <h4 className="text-caption font-bold text-on-surface uppercase tracking-wider mb-xs">
                Areas for Future Improvement
              </h4>
              <p className="text-body text-on-surface-variant">
                {item.ImprovedInFuture}
              </p>
            </div>
          )}

          {/* General Comments */}
          {item.AnyOtherComment && (
            <div className="bg-surface rounded-xl border border-outline/20 p-lg shadow-xs">
              <h4 className="text-caption font-bold text-on-surface-variant uppercase tracking-wider mb-xs">
                Additional Comments
              </h4>
              <p className="text-body text-on-surface-variant italic">
                &ldquo;{item.AnyOtherComment}&rdquo;
              </p>
            </div>
          )}

          {/* Academic & Background Breakdown */}
          <div className="bg-surface-container-low rounded-xl border border-outline/20 p-md grid grid-cols-2 sm:grid-cols-4 gap-md text-caption">
            <div>
              <span className="font-semibold text-on-surface-variant block">Formal Education</span>
              <span className="text-on-surface font-medium">{item.EducationYears || "—"} Years</span>
            </div>
            <div>
              <span className="font-semibold text-on-surface-variant block">Experience</span>
              <span className="text-on-surface font-medium">{item.Experience || "—"}</span>
            </div>
            <div>
              <span className="font-semibold text-on-surface-variant block">Used Exp Before</span>
              <span className="text-on-surface font-medium">{item.UseExpBefore || "—"}</span>
            </div>
            <div>
              <span className="font-semibold text-on-surface-variant block">Research Permission</span>
              <span className="text-on-surface font-medium">{item.Permission || "Granted"}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-sm pt-md border-t border-outline/10">
          <div>
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(item)}
                className="flex items-center gap-xs"
              >
                <Trash2 className="w-4 h-4" />
                Delete Feedback
              </Button>
            )}
          </div>

          <div className="flex items-center gap-sm w-full sm:w-auto justify-end">
            {item.Email && (
              <a
                href={`mailto:${item.Email}?subject=Regarding Your Feedback on CaseNest Academy`}
                className="inline-flex items-center gap-xs px-lg py-sm rounded-xl border border-outline/30 text-primary hover:bg-primary-container/10 text-small font-semibold transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Submitter
              </a>
            )}
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
