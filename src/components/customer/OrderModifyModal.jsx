import React, { useState, useEffect } from "react";
import "@/assets/styles/components/customer/OrderModifyModal.css";
import Modal from "../common/Modal";
import Button from "../common/Button";
import marketService from "../../services/marketService";
export default function OrderModifyModal({
  isOpen,
  onClose,
  order,
  onSave,
  onSaveModification,
}) {
  const [pickupDate, setPickupDate] = useState(() => order?.pickupDate || "");
  const [pickupSlotId, setPickupSlotId] = useState(() =>
    String(order?.slotId || ""),
  );
  const [note, setNote] = useState(() => order?.note || "");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (order) {
      setPickupDate(order.pickupDate || "");
      setPickupSlotId(String(order.slotId || ""));
      setNote(order.note || "");
      const marketId = order.marketId;
      if (!marketId) {
        setSlots([]);
        return;
      }
      marketService
        .getPickupSlots(marketId, order.farmerId)
        .then((data) => {
          setSlots(data || []);
        })
        .catch(() => {});
    }
  }, [order]);
  if (!order) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const saveHandler = onSave || onSaveModification;
    if (saveHandler) {
      await saveHandler(order.id, {
        pickupDate,
        slotId: Number(pickupSlotId),
        note,
      });
    }
    setLoading(false);
    onClose();
  };
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Điều Chỉnh Giờ Nhận Hàng"
      subtitle={`Đơn hàng #${order.orderCode || order.id} tại ${order.pickupMarket || order.marketName || "chợ phiên"}`}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} className="ml-modify-form">
        <div className="ml-modify-notice">
          ℹ️ Bạn có thể đổi ngày và ca nhận hàng trước thời hạn chốt đơn của
          nông dân.
        </div>

        <div className="ml-form-group">
          <label className="ml-form-label">Ngày bạn sẽ ra sạp nhận:</label>
          <input
            type="date"
            className="ml-form-input"
            value={pickupDate}
            min={minDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
          />
        </div>

        <div className="ml-form-group">
          <label className="ml-form-label">Chọn ca nhận hàng mới:</label>
          <div className="ml-slot-options">
            {slots.map((s) => {
              const sid = String(s.slotId || s.id);
              return (
                <label
                  key={sid}
                  className={`ml-slot-label ${pickupSlotId === sid ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="modify_slot"
                    checked={pickupSlotId === sid}
                    onChange={() => setPickupSlotId(sid)}
                  />
                  <span>
                    Ca {s.timeRange || `${s.startTime} - ${s.endTime}`}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="ml-form-group">
          <label className="ml-form-label">
            Cập nhật ghi chú cho nông dân:
          </label>
          <input
            type="text"
            className="ml-form-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="VD: Chuyển sang ca sáng sớm nhận giúp mình..."
          />
        </div>

        <div className="ml-modify-actions">
          <Button variant="ghost" onClick={onClose} type="button">
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
