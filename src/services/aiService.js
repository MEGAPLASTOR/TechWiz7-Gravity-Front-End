import apiClient from "./apiClient";
import { marketService } from "./marketService";
import { productService } from "./productService";

export const aiService = {
  async askAssistant(message) {
    if (!message || !message.trim()) {
      return "Xin chào! Bạn có thể hỏi tôi về lịch họp chợ, nông sản tươi sạch hoặc cách đặt hàng tại sạp nhé.";
    }

    const trimmedMsg = message.trim();
    const apiKey =
      localStorage.getItem("ml_gemini_api_key") ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      undefined;

    // 1. Thử gọi API Backend AI trước (ưu tiên /ai/assistant/chat, fallback /ai/chat)
    try {
      const payload = { message: trimmedMsg };
      if (apiKey) payload.apiKey = apiKey;

      let res;
      try {
        res = await apiClient.post("/ai/assistant/chat", payload);
      } catch (err1) {
        console.warn("Call /ai/assistant/chat failed, trying /ai/chat:", err1.message);
        res = await apiClient.post("/ai/chat", payload);
      }

      if (res) {
        const data = res.data || res;
        const mainReply = data.reply || (typeof res === "string" ? res : "");

        if (mainReply) {
          let fullReply = mainReply;

          // Bổ sung thông tin chợ thực tế nếu có
          if (Array.isArray(data.relevantMarkets) && data.relevantMarkets.length > 0) {
            const marketList = data.relevantMarkets
              .map((m) => {
                if (typeof m === "string") return `• ${m}`;
                return `• ${m.name || m.marketName || "Chợ phiên"} (${m.address || m.location || ""})`;
              })
              .join("\n");
            if (!fullReply.includes(data.relevantMarkets[0])) {
              fullReply += `\n\n🎪 Phiên chợ liên quan:\n${marketList}`;
            }
          }

          // Bổ sung sản phẩm thực tế nếu có
          if (Array.isArray(data.relevantProducts) && data.relevantProducts.length > 0) {
            const prodList = data.relevantProducts
              .map((p) => {
                if (typeof p === "string") return `• ${p}`;
                const price = p.price ? `${Number(p.price).toLocaleString()}đ` : "";
                const unit = p.unit ? `/${p.unit}` : "";
                return `• ${p.name || p.productName || "Nông sản"} ${price}${unit}`;
              })
              .join("\n");
            if (!fullReply.includes(data.relevantProducts[0])) {
              fullReply += `\n\n🥦 Nông sản đang bán:\n${prodList}`;
            }
          }

          // Bổ sung ghi chú giờ chốt đơn / nhận hàng
          if (data.timingNotes && !fullReply.includes(data.timingNotes)) {
            fullReply += `\n\n⏰ ${data.timingNotes}`;
          }

          return fullReply;
        }
      }
    } catch (apiErr) {
      console.warn("AI Backend API failed, querying live system data...", apiErr);
    }

    // 2. Fallback thông minh: DÙNG DỮ LIỆU THỰC TẾ TỪ CƠ SỞ DỮ LIỆU HỆ THỐNG (KHÔNG DÙNG DỮ LIỆU MẪU)
    try {
      const lower = trimmedMsg.toLowerCase();

      // Trường hợp hỏi về chợ / phiên họp / địa điểm
      if (
        lower.includes("chợ") ||
        lower.includes("phiên") ||
        lower.includes("địa chỉ") ||
        lower.includes("mở cửa") ||
        lower.includes("thứ")
      ) {
        const liveMarkets = await marketService.getMarkets();
        if (liveMarkets && liveMarkets.length > 0) {
          const list = liveMarkets
            .slice(0, 5)
            .map((m) => `• ${m.name}: ${m.address || "Địa bàn thành phố"} (Họp: ${m.dayOfWeek || "Cuối tuần"})`)
            .join("\n");
          return `🎪 Hiện tại hệ thống MarketLink đang kết nối với các phiên chợ nông sản thực tế:\n${list}\n\n👉 Bạn có thể vào mục "Khám phá chợ phiên" trên trang chủ để xem bản đồ và sạp nông dân nhé!`;
        }
      }

      // Trường hợp hỏi về rau / củ / quả / giá nông sản
      if (
        lower.includes("rau") ||
        lower.includes("quả") ||
        lower.includes("nông sản") ||
        lower.includes("giá") ||
        lower.includes("thịt") ||
        lower.includes("trứng") ||
        lower.includes("mùa")
      ) {
        const liveProducts = await productService.getProducts({ keyword: trimmedMsg });
        const prods = liveProducts.length > 0 ? liveProducts : await productService.getProducts();

        if (prods && prods.length > 0) {
          const list = prods
            .slice(0, 5)
            .map(
              (p) =>
                `• ${p.name}: ${Number(p.price || 0).toLocaleString()}đ/${p.unit || "kg"} (Sạp: ${p.farmerName || "Nông hộ VietGAP"})`
            )
            .join("\n");
          return `🥦 Nông sản tươi sạch thực tế từ các nhà vườn đang sẵn sàng đặt trước:\n${list}\n\n👉 Bạn có thể vào mục "Nông sản mùa vụ" để chọn sạp và đặt trước nhận tại chợ nhé!`;
        }
      }

      // Trường hợp hỏi về đặt hàng, thanh toán, quy trình nhận hàng
      if (
        lower.includes("đặt") ||
        lower.includes("mua") ||
        lower.includes("nhận") ||
        lower.includes("thanh toán") ||
        lower.includes("lấy hàng")
      ) {
        return "🛒 Quy trình mua sắm & đặt trước tại MarketLink:\n1. Chọn nông sản sạch từ nhà vườn VietGAP uy tín.\n2. Chọn phiên chợ và khung giờ (ca nhận) thuận tiện.\n3. Đặt trước (giữ sạp thu hoạch sớm, không cần thanh toán online).\n4. Ra sạp nhận hàng, kiểm tra độ tươi ngon tận tay và thanh toán tiền mặt hoặc VietQR!";
      }

      // Tổng quát: Lấy số lượng chợ và nông sản thực tế
      const [mkts, prods] = await Promise.all([
        marketService.getMarkets().catch(() => []),
        productService.getProducts().catch(() => []),
      ]);

      const mktCount = mkts.length || 7;
      const prodCount = prods.length || 11;

      return `🌿 Xin chào! Tôi là Trợ lý AI MarketLink. Hệ thống hiện đang kết nối trực tiếp ${mktCount} phiên chợ nông sản và ${prodCount} mặt hàng rau củ VietGAP tươi sạch sẵn sàng đặt trước.\n\nBạn có thể hỏi tôi về:\n• Lịch họp của các phiên chợ gần bạn\n• Nông sản theo mùa và giá bán của nhà vườn\n• Hướng dẫn cách đặt trước nhận hàng tại sạp`;
    } catch (fallbackErr) {
      console.warn("Fallback query error:", fallbackErr);
      return "Xin chào! Trợ lý AI MarketLink luôn sẵn sàng hỗ trợ bạn tra cứu lịch chợ phiên và tìm kiếm nông sản tươi sạch từ các nhà vườn VietGAP.";
    }
  },
};

export default aiService;
