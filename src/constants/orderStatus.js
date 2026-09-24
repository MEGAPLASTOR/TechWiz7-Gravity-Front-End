export const ORDER_STATUS = {
  PLACED: 'PLACED',
  ACCEPTED: 'ACCEPTED',
  READY_FOR_PICKUP: 'READY_FOR_PICKUP',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_LABELS = {
  PLACED: 'Đã đặt trước',
  ACCEPTED: 'Nông dân tiếp nhận',
  READY_FOR_PICKUP: 'Sẵn sàng nhận hàng',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const ORDER_STATUS_DESCRIPTIONS = {
  PLACED: 'Đơn đặt trước đã gửi đến sạp nông dân, đang chờ chuẩn bị.',
  ACCEPTED: 'Nông dân đã xác nhận tồn kho và chuẩn bị đóng gói.',
  READY_FOR_PICKUP: 'Nông sản đã sẵn sàng tại quầy chợ, quý khách vui lòng đến nhận theo khung giờ.',
  COMPLETED: 'Đơn hàng đã được thanh toán trực tiếp và nhận hàng thành công.',
  CANCELLED: 'Đơn đặt trước đã bị hủy.',
};
