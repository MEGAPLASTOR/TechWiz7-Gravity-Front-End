import React, { useState, useEffect } from "react";
import "@/assets/styles/pages/customer/CustomerReviewsPage.css";
import customerService from "../../services/customerService";
import Button from "../../components/common/Button";
import { useLanguage } from "../../context/LanguageContext";

export default function CustomerReviewsPage({ onNavigate }) {
  const { isEn, localizeProduceName } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const list = await customerService.getMyReviews();
      let rawList = [];
      if (Array.isArray(list)) rawList = list;
      else if (list && Array.isArray(list.data)) rawList = list.data;
      setReviews(
        rawList.map((r) => ({
          reviewId: r.reviewId || r.id,
          orderId: r.orderId,
          rating: r.rating || 5,
          comment: r.comment || "",
          productName: r.productName || "",
          stallName: r.stallName || (isEn ? "Farmer Stall" : "Sạp nông dân"),
          farmerName: r.farmerName || (isEn ? "Farmer" : "Nông dân"),
          farmerReply: r.farmerReply || "",
          farmerReplyAt: r.farmerReplyAt
            ? String(r.farmerReplyAt).replace("T", " ").substring(0, 16)
            : "",
          createdAt: r.createdAt
            ? String(r.createdAt).replace("T", " ").substring(0, 10)
            : (isEn ? "Recently" : "Gần đây"),
          isHidden: r.isHidden === true,
        })),
      );
    } catch (err) {
      console.warn("Error loading my reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const renderStars = (rating) => {
    const full = Math.min(Math.max(Math.round(rating), 1), 5);
    return "★".repeat(full) + "☆".repeat(5 - full);
  };

  return (
    <div className="ml-my-reviews-page">
      <div className="ml-my-reviews-banner">
        <div className="ml-container">
          <span className="ml-section-subtitle">{isEn ? "Review History" : "Lịch Sử Đánh Giá"}</span>
          <h1 className="ml-my-reviews-title">{isEn ? "My Reviews" : "Đánh Giá Của Tôi"}</h1>
          <p className="ml-my-reviews-subtitle">
            {isEn
              ? "Review the feedback and ratings you submitted for farmer stalls after picking up at weekend markets."
              : "Xem lại các đánh giá bạn đã gửi cho sạp nông dân sau khi nhận hàng tại chợ phiên."}
          </p>
        </div>
      </div>

      <div className="ml-container">
        {loading && (
          <div className="ml-my-reviews-loading">
            {isEn ? "Loading review history..." : "Đang tải lịch sử đánh giá..."}
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="ml-card ml-my-reviews-empty">
            <span className="ml-my-reviews-empty-icon">⭐</span>
            <h3>{isEn ? "You haven't submitted any reviews yet" : "Bạn chưa gửi đánh giá nào"}</h3>
            <p>
              {isEn
                ? "After picking up fresh produce at the market stall, submit a review to help other shoppers discover great farms!"
                : "Sau khi nhận hàng thành công tại sạp chợ, hãy gửi đánh giá để giúp các khách hàng khác tìm được sạp tốt!"}
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate && onNavigate("orders")}
            >
              {isEn ? "View my pre-orders" : "Xem đơn hàng của tôi"}
            </Button>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="ml-my-reviews-list">
            <div className="ml-my-reviews-summary">
              <span className="ml-reviews-count-badge">
                {reviews.length} {isEn ? "reviews" : "đánh giá"}
              </span>
              <span className="ml-reviews-avg-score">
                {isEn ? "Average rating: " : "Điểm trung bình: "}
                <strong>
                  {(
                    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                  ).toFixed(1)}{" "}
                  / 5.0
                </strong>
              </span>
            </div>

            {reviews.map((rev) => (
              <div
                key={rev.reviewId}
                className={`ml-card ml-my-rev-card ${rev.isHidden ? "hidden-review" : ""}`}
              >
                {rev.isHidden && (
                  <div className="ml-rev-hidden-notice">
                    {isEn
                      ? "This review has been hidden by an administrator due to community policy."
                      : "Đánh giá này đã bị quản trị viên ẩn do vi phạm chính sách"}
                  </div>
                )}

                <div className="ml-my-rev-header">
                  <div className="ml-my-rev-meta">
                    <span className="ml-my-rev-stall">
                      🏪 {rev.stallName}
                    </span>
                    {rev.productName && (
                      <span className="ml-my-rev-product">
                        {" "}
                        • 🥬 {localizeProduceName(rev.productName)}
                      </span>
                    )}
                    <span className="ml-my-rev-date">
                      {" "}
                      • 📅 {rev.createdAt}
                    </span>
                  </div>
                  <div className="ml-my-rev-stars">
                    {renderStars(rev.rating)}
                  </div>
                </div>

                <p className="ml-my-rev-comment">"{rev.comment}"</p>

                {rev.farmerReply ? (
                  <div className="ml-my-rev-reply-box">
                    <div className="ml-my-rev-reply-author">
                      👨‍🌾{" "}
                      <strong>
                        {isEn ? `Response from ${rev.farmerName}:` : `Phản hồi từ ${rev.farmerName}:`}
                      </strong>
                    </div>
                    <p className="ml-my-rev-reply-text">{rev.farmerReply}</p>
                    {rev.farmerReplyAt && (
                      <span className="ml-my-rev-reply-time">
                        {isEn ? "Replied at: " : "Đã trả lời lúc: "}{rev.farmerReplyAt}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="ml-my-rev-no-reply">
                    {isEn ? "The grower has not responded to this review yet." : "Nông dân chưa phản hồi đánh giá này"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
