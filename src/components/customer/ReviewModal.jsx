import React, { useState } from "react";
import "@/assets/styles/components/customer/ReviewModal.css";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useLanguage } from "../../context/LanguageContext";

export default function ReviewModal({
  isOpen,
  onClose,
  order,
  onSubmit,
  onSubmitReview,
}) {
  const { isEn } = useLanguage();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState(() =>
    isEn ? ["Produce very fresh", "On-time pickup"] : ["Rau rất tươi", "Đúng hẹn"],
  );
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const quickTags = isEn
    ? [
        "Produce very fresh",
        "Friendly grower",
        "On-time pickup",
        "Carefully packed",
        "Accurate weight",
        "Fair price",
      ]
    : [
        "Rau rất tươi",
        "Chủ sạp thân thiện",
        "Đúng hẹn tại sạp",
        "Đóng gói cẩn thận",
        "Cân chuẩn đủ ký",
        "Giá hợp lý",
      ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fullComment =
      selectedTags.length > 0
        ? `[${selectedTags.join(", ")}] ${comment}`.trim()
        : comment;
    const submitHandler = onSubmit || onSubmitReview;
    if (submitHandler) {
      await submitHandler({
        orderId: order.orderId || order.id,
        productId:
          order.items && order.items.length > 0
            ? order.items[0].productId || order.items[0].id
            : null,
        rating,
        comment: fullComment,
      });
    }
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEn ? "Review Your Pickup Experience" : "Đánh Giá Trải Nghiệm Nhận Hàng"}
      subtitle={
        isEn
          ? `Order #${order.orderCode || order.id} at ${order.marketName || "morning market"}`
          : `Đơn hàng #${order.orderCode || order.id} tại ${order.marketName || "chợ phiên"}`
      }
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} className="ml-review-form">
        <div className="ml-review-stars-box">
          <label className="ml-review-stars-label">
            {isEn ? "Produce Quality & Stall Service:" : "Chất lượng nông sản & sạp hàng:"}
          </label>
          <div className="ml-stars-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`ml-star-btn ${star <= rating ? "active" : ""}`}
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
            <span className="ml-rating-text">
              {rating === 5 && (isEn ? "Excellent, produce is so fresh and delicious!" : "Tuyệt vời, rau củ rất tươi ngon!")}
              {rating === 4 && (isEn ? "Very satisfied, on time" : "Rất hài lòng, đúng hẹn")}
              {rating === 3 && (isEn ? "Average, acceptable" : "Bình thường, chấp nhận được")}
              {rating === 2 && (isEn ? "Needs quality improvement" : "Cần cải thiện chất lượng")}
              {rating === 1 && (isEn ? "Dissatisfied" : "Không hài lòng")}
            </span>
          </div>
        </div>

        <div className="ml-review-tags-section">
          <label className="ml-review-tags-label">
            {isEn ? "What did you like most:" : "Điểm bạn thích nhất:"}
          </label>
          <div className="ml-review-tags-cloud">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`ml-review-tag-chip ${selectedTags.includes(tag) ? "active" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {selectedTags.includes(tag) ? "✓ " : "+ "}
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-form-group">
          <label className="ml-form-label">
            {isEn ? "Share more feedback (optional):" : "Chia sẻ thêm cảm nhận của bạn (tùy chọn):"}
          </label>
          <textarea
            className="ml-review-textarea"
            rows={3}
            placeholder={isEn ? "Share about produce freshness, stall service, pickup convenience..." : "Chia sẻ về độ tươi ngọt của rau, thái độ của chủ sạp..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="ml-review-actions">
          <Button variant="ghost" onClick={onClose}>
            {isEn ? "Later" : "Để sau"}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon={<span>⭐</span>}
          >
            {isEn ? "Submit Review" : "Gửi đánh giá"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
