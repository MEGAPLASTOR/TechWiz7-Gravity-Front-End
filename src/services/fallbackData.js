import snapshot from "../data/backendSnapshot.json";

// Lấy danh sách đơn hàng đã lưu từ LocalStorage để tương tác mượt mà
function getStoredOrders() {
  try {
    const raw = localStorage.getItem("ml_stored_orders");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      orderId: 901,
      orderCode: "ORD-7821",
      customerName: "Nguyễn Nhựt Quang",
      customerPhone: "0912345678",
      marketId: 201,
      marketName: "Phiên Chợ Nông Sản Sạch Hà Nội #01",
      stallName: "Vườn Rau Hữu Cơ Ba Vì - Sạp 01",
      pickupDate: "2026-09-30",
      pickupSlotName: "Ca sáng (06:00 - 08:30)",
      status: "READY_FOR_PICKUP",
      totalPrice: 185000,
      createdAt: "2026-09-28T08:30:00",
      items: [
        {
          productId: 1001,
          name: "Cà Chua Beef Hữu Cơ Mộc Châu",
          quantity: 2,
          unitPrice: 45000,
          totalPrice: 90000,
        },
        {
          productId: 1002,
          name: "Dâu Tây Giống New Zealand Mộc Châu",
          quantity: 1,
          unitPrice: 95000,
          totalPrice: 95000,
        },
      ],
    },
    {
      orderId: 902,
      orderCode: "ORD-6512",
      customerName: "Trần Thị Mai",
      customerPhone: "0987654321",
      marketId: 202,
      marketName: "Phiên Chợ Nông Sản Sạch TP. Hồ Chí Minh #02",
      stallName: "Nông Trại Bến Tre - Sạp 02",
      pickupDate: "2026-09-29",
      pickupSlotName: "Ca sáng (06:00 - 08:30)",
      status: "COMPLETED",
      totalPrice: 160000,
      createdAt: "2026-09-27T10:15:00",
      items: [
        {
          productId: 1008,
          name: "Xoài Cát Chu Cao Lãnh Bao Trái",
          quantity: 2,
          unitPrice: 60000,
          totalPrice: 120000,
        },
      ],
    },
  ];
}

function saveOrder(order) {
  const current = getStoredOrders();
  const updated = [order, ...current];
  try {
    localStorage.setItem("ml_stored_orders", JSON.stringify(updated));
  } catch {}
  return order;
}

export function getFallbackData(cleanEndpoint, method = "GET", body = null) {
  const urlPath = cleanEndpoint.startsWith("/") ? cleanEndpoint : `/${cleanEndpoint}`;
  const [pathOnly, queryString] = urlPath.split("?");
  const queryParams = new URLSearchParams(queryString || "");

  // 1. Markets list & details
  if (pathOnly === "/markets") {
    let list = [...(snapshot.markets || [])];
    const search = (queryParams.get("search") || "").toLowerCase().trim();
    const city = queryParams.get("city");
    if (search) {
      list = list.filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(search)) ||
          (m.address && m.address.toLowerCase().includes(search)),
      );
    }
    if (city && city !== "all") {
      list = list.filter((m) => m.address && m.address.includes(city));
    }
    return list;
  }

  // Market by ID
  const marketMatch = pathOnly.match(/^\/markets\/(\d+)$/);
  if (marketMatch) {
    const id = Number(marketMatch[1]);
    const found = snapshot.markets.find((m) => m.marketId === id);
    return found || snapshot.markets[0];
  }

  // Market farmers
  const marketFarmersMatch = pathOnly.match(/^\/markets\/(\d+)\/farmers$/);
  if (marketFarmersMatch) {
    const marketId = Number(marketFarmersMatch[1]);
    const stalls = snapshot.stalls.filter((s) => s.marketId === marketId);
    if (stalls.length > 0) return stalls;
    return snapshot.stalls.slice(0, 5);
  }

  // Market pickup slots
  if (pathOnly.includes("/pickup-slots")) {
    return [
      {
        slotId: 1,
        slotName: "Ca sáng (06:00 - 08:30)",
        startTime: "06:00",
        endTime: "08:30",
        status: "AVAILABLE",
      },
      {
        slotId: 2,
        slotName: "Ca trưa (09:00 - 11:30)",
        startTime: "09:00",
        endTime: "11:30",
        status: "AVAILABLE",
      },
      {
        slotId: 3,
        slotName: "Ca chiều (15:00 - 18:00)",
        startTime: "15:00",
        endTime: "18:00",
        status: "AVAILABLE",
      },
    ];
  }

  // Stalls list
  if (pathOnly === "/markets/stalls") {
    let list = [...(snapshot.stalls || [])];
    const marketId = queryParams.get("marketId");
    if (marketId && marketId !== "all") {
      const filtered = list.filter((s) => String(s.marketId) === String(marketId));
      if (filtered.length > 0) return filtered;
    }
    return list;
  }

  // 2. Products list & details
  if (pathOnly === "/products") {
    let list = [...(snapshot.products || [])];
    const keyword = (queryParams.get("keyword") || queryParams.get("search") || "").toLowerCase().trim();
    const catId = queryParams.get("categoryId");
    if (keyword) {
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(keyword)) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(keyword)) ||
          (p.farmerStallName && p.farmerStallName.toLowerCase().includes(keyword)),
      );
    }
    if (catId && catId !== "all") {
      list = list.filter((p) => String(p.categoryId) === String(catId));
    }
    return list;
  }

  const productMatch = pathOnly.match(/^\/products\/(\d+)$/);
  if (productMatch) {
    const id = Number(productMatch[1]);
    const found = snapshot.products.find((p) => p.productId === id);
    return found || snapshot.products[0];
  }

  // 3. Categories
  if (pathOnly === "/categories") {
    return snapshot.categories || [];
  }

  // 4. Announcements
  if (pathOnly === "/announcements") {
    return snapshot.announcements || [];
  }

  // 5. Auth operations
  if (pathOnly === "/auth/login" && method === "POST") {
    const email = body?.email || "user@marketlink.vn";
    const isAdmin = email.toLowerCase().includes("admin");
    const isFarmer = email.toLowerCase().includes("farmer");
    const role = isAdmin ? "ROLE_ADMIN" : isFarmer ? "ROLE_FARMER" : "ROLE_CUSTOMER";
    return {
      accessToken: "mock_jwt_session_" + Date.now(),
      token: "mock_jwt_session_" + Date.now(),
      roles: [role],
      role: role.replace("ROLE_", ""),
      userId: 101,
      email: email,
      fullName: body?.fullName || email.split("@")[0] || "Nguyễn Nhựt Quang",
      phoneNumber: "0912345678",
    };
  }

  if (pathOnly === "/auth/register" && method === "POST") {
    const role = body?.role === "FARMER" ? "ROLE_FARMER" : "ROLE_CUSTOMER";
    return {
      accessToken: "mock_jwt_reg_" + Date.now(),
      token: "mock_jwt_reg_" + Date.now(),
      roles: [role],
      role: role.replace("ROLE_", ""),
      userId: 102,
      email: body?.email || "newuser@marketlink.vn",
      fullName: body?.fullName || "Thành Viên Mới",
      phoneNumber: body?.phoneNumber || "0912345678",
    };
  }

  if (pathOnly === "/auth/verification/send-otp") {
    return { success: true, message: "Mã OTP xác thực đã được gửi thành công!" };
  }

  if (pathOnly === "/auth/verification/verify-otp" || pathOnly === "/auth/reset-password") {
    return { success: true, message: "Xác thực và đặt lại mật khẩu thành công!" };
  }

  // 6. Orders
  if (pathOnly === "/orders" && method === "POST") {
    const newOrder = {
      orderId: Date.now(),
      orderCode: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      status: "PLACED",
      createdAt: new Date().toISOString(),
      pickupDate: body?.pickupDate || new Date().toISOString().split("T")[0],
      note: body?.note || "Đặt trước qua sàn MarketLink",
      totalPrice:
        body?.items?.reduce((sum, it) => sum + (it.price || 50000) * (it.quantity || 1), 0) || 120000,
      items: body?.items || [],
      marketName: "Phiên Chợ Nông Sản Sạch Hà Nội #01",
      customerName: localStorage.getItem("ml_name") || "Khách Hàng MarketLink",
    };
    saveOrder(newOrder);
    return newOrder;
  }

  if (pathOnly === "/orders/my-orders" || pathOnly === "/orders") {
    return getStoredOrders();
  }

  // 7. Admin Metrics & Moderation
  if (pathOnly.includes("/admin/metrics") || pathOnly.includes("/admin/dashboard")) {
    return {
      totalFarmers: snapshot.stalls.length,
      totalCustomers: 450,
      totalMarkets: snapshot.markets.length,
      totalOrders: 1280,
      totalRevenue: 285400000,
      pendingKycCount: 3,
    };
  }

  // 8. Notifications
  if (pathOnly.includes("/notifications")) {
    return [
      {
        id: 1,
        title: "Đơn hàng #ORD-7821 sẵn sàng!",
        message: "Chủ sạp đã chuẩn bị xong nông sản. Hẹn gặp bạn tại chợ sáng mai để nhận hàng.",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // 9. AI chat
  if (pathOnly.includes("/ai/assistant/chat") || pathOnly.includes("/ai/chat")) {
    return {
      reply:
        "Xin chào quý khách! Tôi là trợ lý AI MarketLink. Hệ thống hiện có hơn 100 phiên chợ và nông sản sạch đạt chuẩn VietGAP & OCOP. Quý khách muốn tìm kiếm chợ gần nhất hay loại nông sản nào hôm nay?",
      relevantMarkets: snapshot.markets.slice(0, 3),
      relevantProducts: snapshot.products.slice(0, 3),
    };
  }

  return undefined;
}

export default { getFallbackData };
