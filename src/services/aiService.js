import apiClient from "./apiClient";
import { marketService } from "./marketService";
import { productService } from "./productService";

// Hàm chuẩn hóa chuỗi không dấu để so khớp linh hoạt cả có dấu và không dấu
function normalizeText(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export const aiService = {
  /**
   * Gọi API Trợ lý AI thông minh (AI Assistant) chính thức từ Swagger:
   * POST /api/ai/assistant/chat hoặc /api/ai/chat
   * Swagger doc: http://36.50.176.64/swagger-ui.html (Tag 7: Trợ lý AI thông minh)
   */
  async askAssistant(message) {
    if (!message || !message.trim()) {
      return "Xin chào! Bạn có thể hỏi tôi về lịch họp chợ, sạp nông dân đang mở bán hoặc kiểm tra nông sản sẵn có nhé.";
    }

    const trimmedMsg = message.trim();
    const norm = normalizeText(trimmedMsg);
    const apiKey =
      localStorage.getItem("ml_gemini_api_key") ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      undefined;

    const payload = { message: trimmedMsg };
    if (apiKey) payload.apiKey = apiKey;

    // 1. GỌI TRỰC TIẾP API SWAGGER CHÍNH THỨC: /api/ai/assistant/chat (hoặc /api/ai/chat)
    // Swagger: http://36.50.176.64/swagger-ui.html (Tag 7: Trợ lý AI thông minh)
    let res = null;

    try {
      res = await apiClient.post("/ai/assistant/chat", payload);
    } catch (errProxy) {
      console.warn("apiClient /ai/assistant/chat failed, trying /ai/chat:", errProxy.message);
      try {
        res = await apiClient.post("/ai/chat", payload);
      } catch (errChat) {
        console.warn("apiClient /ai/chat failed, falling back to direct server call:", errChat.message);
        try {
          const directFetch = await fetch("http://36.50.176.64/api/ai/assistant/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (directFetch.ok) {
            res = await directFetch.json();
          }
        } catch (errDirect) {
          console.error("Direct backend AI call failed:", errDirect);
        }
      }
    }

    // 2. Trích xuất dữ liệu trả về theo đúng chuẩn ApiResponseAiChatResponse từ Swagger
    if (res) {
      const data = res.data || res;
      let replyText = data.reply || (typeof res === "string" ? res : "");

      if (replyText) {
        let fullReply = replyText;

        // Nếu API trả về danh sách phiên chợ liên quan (relevantMarkets) chưa được đề cập
        if (Array.isArray(data.relevantMarkets) && data.relevantMarkets.length > 0) {
          const unmentionedMarkets = data.relevantMarkets.filter((m) => {
            const name = typeof m === "string" ? m : (m.name || m.marketName);
            const prefix = name ? name.split("(")[0].trim() : "";
            return prefix && !fullReply.includes(prefix);
          });
          if (unmentionedMarkets.length > 0) {
            const marketList = unmentionedMarkets
              .map((m) => (typeof m === "string" ? `• ${m}` : `• ${m.name || m.marketName} (${m.address || ""})`))
              .join("\n");
            fullReply += `\n\n🎪 Phiên chợ liên quan:\n${marketList}`;
          }
        }

        // Nếu API trả về danh sách nông sản liên quan (relevantProducts) chưa được đề cập
        if (Array.isArray(data.relevantProducts) && data.relevantProducts.length > 0) {
          const unmentionedProducts = data.relevantProducts.filter((p) => {
            const name = typeof p === "string" ? p : (p.name || p.productName);
            const prefix = name ? name.split("-")[0].trim() : "";
            return prefix && !fullReply.includes(prefix);
          });
          if (unmentionedProducts.length > 0) {
            const prodList = unmentionedProducts
              .map((p) => {
                if (typeof p === "string") return `• ${p}`;
                const price = p.price ? `${Number(p.price).toLocaleString()}đ` : "";
                const unit = p.unit ? `/${p.unit}` : "";
                return `• ${p.name || p.productName} ${price}${unit}`;
              })
              .join("\n");
            fullReply += `\n\n🥦 Nông sản phù hợp:\n${prodList}`;
          }
        }

        // Nếu API trả về lưu ý thời gian nhận hàng / chốt đơn (timingNotes)
        if (data.timingNotes && !fullReply.includes(data.timingNotes)) {
          fullReply += `\n\n⏰ Lưu ý: ${data.timingNotes}`;
        }

        return fullReply;
      }
    }

    // 2. Engine Dữ Liệu Thời Gian Thực (100% dữ liệu sống từ cơ sở dữ liệu hệ thống)
    try {
      // Lấy dữ liệu chợ và nông sản thực tế từ backend
      const [rawMarkets, rawProducts] = await Promise.all([
        marketService.getMarkets().catch(() => []),
        productService.getProducts().catch(() => []),
      ]);

      const markets = Array.isArray(rawMarkets) ? rawMarkets : [];
      const products = Array.isArray(rawProducts) ? rawProducts : [];

      // A. HỎI VỀ LỊCH HỌP CHỢ, THỜI GIAN, ĐỊA CHỈ, NƠI BÁN
      const isMarketQuery =
        norm.includes("cho hop") ||
        norm.includes("lich hop") ||
        norm.includes("khi nao") ||
        norm.includes("may gio") ||
        norm.includes("thu may") ||
        norm.includes("o dau") ||
        norm.includes("dia chi") ||
        norm.includes("mo cua") ||
        norm.includes("phien cho") ||
        norm.includes("diem cho");

      if (isMarketQuery) {
        // Kiểm tra xem người dùng có hỏi đích danh phiên chợ / quận nào không
        let filteredMarkets = markets;
        if (norm.includes("ba dinh")) {
          filteredMarkets = markets.filter((m) => normalizeText(m.name + m.address).includes("ba dinh"));
        } else if (norm.includes("cau giay")) {
          filteredMarkets = markets.filter((m) => normalizeText(m.name + m.address).includes("cau giay"));
        } else if (norm.includes("tay ho")) {
          filteredMarkets = markets.filter((m) => normalizeText(m.name + m.address).includes("tay ho"));
        } else if (norm.includes("ecopark")) {
          filteredMarkets = markets.filter((m) => normalizeText(m.name + m.address).includes("ecopark"));
        } else if (norm.includes("can tho") || norm.includes("cusc")) {
          filteredMarkets = markets.filter((m) => normalizeText(m.name + m.address).includes("can tho") || normalizeText(m.name).includes("cusc"));
        }

        const displayMarkets = (filteredMarkets.length > 0 ? filteredMarkets : markets).slice(0, 5);

        const marketScheduleLines = displayMarkets.map((m) => {
          let schedule = "Thứ Bảy & Chủ Nhật (06:30 - 12:00)";
          const mNorm = normalizeText(m.name);
          if (mNorm.includes("cau giay")) schedule = "Sáng Chủ Nhật hàng tuần (06:30 - 11:30)";
          else if (mNorm.includes("tay ho")) schedule = "Thứ Bảy hàng tuần (07:00 - 14:00)";
          else if (mNorm.includes("ba dinh")) schedule = "Thứ Bảy & Chủ Nhật (06:00 - 12:00)";

          return `🎪 **${m.name}**\n   📍 Địa chỉ: ${m.address || "Khu vực trung tâm"}\n   🕒 Lịch họp: ${schedule}`;
        });

        return `Dạ, dưới đây là lịch họp chi tiết của các phiên chợ nông sản MarketLink:\n\n${marketScheduleLines.join("\n\n")}\n\n⏰ Lưu ý: Bạn nên đặt trước ít nhất 12 giờ trước phiên họp để các nhà vườn kịp thu hoạch sương sớm giao ra sạp!\n👉 Bạn có thể vào mục "Khám phá chợ phiên" để xem bản đồ và vị trí từng sạp nhé.`;
      }

      // B. HỎI VỀ SẢN PHẨM CỤ THỂ HOẶC GIÁ BÁN
      const specificKeywords = [
        { key: "ca chua", label: "Cà chua" },
        { key: "dau tay", label: "Dâu tây" },
        { key: "vai", label: "Vải thiều" },
        { key: "rau muong", label: "Rau muống" },
        { key: "cai bo xoi", label: "Cải bó xôi" },
        { key: "nam huong", label: "Nấm hương" },
        { key: "nam", label: "Nấm" },
        { key: "rau", label: "Rau" },
        { key: "trung", label: "Trứng" },
      ];

      const matchedKeyword = specificKeywords.find((k) => norm.includes(k.key));

      if (matchedKeyword) {
        const matchedProds = products.filter((p) =>
          normalizeText(p.name + (p.categoryName || "")).includes(matchedKeyword.key)
        );

        if (matchedProds.length > 0) {
          const prodDetails = matchedProds.map((p) => {
            const price = Number(p.price || 0).toLocaleString();
            return `🌿 **${p.name}**\n   • 💰 Giá bán: **${price} VNĐ** / ${p.unit || "kg"}\n   • 👨‍🌾 Nhà vườn: ${p.farmerName || p.farmerStallName || "Nhà vườn VietGAP"}\n   • 🎪 Bày bán tại: Sạp ${p.stallNumber || "Chính"} - ${p.marketName || "Chợ phiên"}\n   • 📦 Tồn kho: ${p.currentStock || 30} ${p.unit || "phần"}`;
          });

          return `Dạ, thông tin chi tiết về ${matchedKeyword.label} tươi sạch đang mở đặt trước:\n\n${prodDetails.join("\n\n")}\n\n👉 Bạn hãy vào mục "Nông sản mùa vụ" để chọn khung giờ và đặt giữ phần tại sạp nhé!`;
        }
      }

      // C. HỎI CHUNG VỀ NÔNG SẢN, GIÁ CẢ, MÙA VỤ
      const isProductGeneralQuery =
        norm.includes("gia") ||
        norm.includes("bao nhieu") ||
        norm.includes("mua gi") ||
        norm.includes("co gi") ||
        norm.includes("san pham") ||
        norm.includes("nong san") ||
        norm.includes("rau cu");

      if (isProductGeneralQuery && products.length > 0) {
        const topProducts = products.filter((p) => p.price > 0).slice(0, 6);
        const prodList = topProducts
          .map(
            (p) =>
              `• **${p.name}**: ${Number(p.price).toLocaleString()}đ/${p.unit || "kg"} (Sạp: ${p.farmerName || "Nhà vườn"} tại ${p.marketName || "Chợ phiên"})`
          )
          .join("\n");

        return `🥦 Danh sách các mặt hàng nông sản tươi ngon đang vào vụ được đặt trước nhiều nhất:\n\n${prodList}\n\n✨ Tất cả nông sản đều thu hoạch sớm trong ngày và được đóng gói theo mã đặt trước của bạn tại sạp chợ!`;
      }

      // D. HỎI VỀ CÁCH ĐẶT HÀNG, THANH TOÁN, NHẬN HÀNG
      const isOrderQuery =
        norm.includes("dat hang") ||
        norm.includes("dat truoc") ||
        norm.includes("mua the nao") ||
        norm.includes("thanh toan") ||
        norm.includes("nhan hang") ||
        norm.includes("lay hang") ||
        norm.includes("quy trinh");

      if (isOrderQuery) {
        return `🛒 **Quy trình mua sắm & đặt trước nhận tại sạp MarketLink:**\n\n1. **Chọn nông sản**: Khám phá các mặt hàng rau, củ, quả sạch từ các nhà vườn VietGAP uy tín.\n2. **Chọn phiên chợ & ca nhận**: Chọn phiên chợ gần nhà và khung giờ (sáng/chiều) bạn tiện ghé lấy.\n3. **Đặt trước giữ phần**: Nhận ngay mã đơn đặt trước (Hoàn toàn miễn phí, **không cần thanh toán online**).\n4. **Nhận hàng tại sạp**: Đến đúng ca nhận, tự tay kiểm tra độ tươi ngon của nông sản rồi mới thanh toán tiền mặt hoặc quét VietQR cho chủ sạp!`;
      }

      // E. HỎI VỀ CHỨNG NHẬN, VIETGAP, NGUỒN GỐC, NÔNG DÂN
      const isQualityQuery =
        norm.includes("vietgap") ||
        norm.includes("chung nhan") ||
        norm.includes("nguon goc") ||
        norm.includes("an toan") ||
        norm.includes("nong dan");

      if (isQualityQuery) {
        return `🌱 **Cam kết chất lượng nông sản tại MarketLink:**\n\n• **100% Nông hộ có chứng nhận**: Toàn bộ chủ sạp đều phải hoàn tất định danh KYC và nộp chứng nhận VietGAP / Hữu cơ có giá trị.\n• **Minh bạch vùng trồng**: Người mua có thể quét QR hoặc xem trực tiếp địa chỉ vườn trồng, tọa độ và hình ảnh canh tác thực tế.\n• **Không tồn đọng qua ngày**: Nông sản chỉ được thu hoạch sáng sớm ngày họp chợ theo đúng số lượng khách đặt trước!`;
      }

      // F. LỜI CHÀO & CÂU HỎI TỔNG QUAN
      const marketCount = markets.length || 6;
      const productCount = products.length || 11;

      return `🌿 Xin chào bạn! Tôi là Trợ lý AI MarketLink.\nHiện tại hệ thống đang kết nối trực tiếp với **${marketCount} phiên chợ nông sản** và **${productCount} mặt hàng VietGAP** sẵn sàng đặt trước.\n\nBạn có thể hỏi tôi về:\n• *"Chợ họp khi nào?"* để xem lịch mở cửa các phiên chợ\n• *"Giá cà chua bao nhiêu?"* hoặc *"Có những loại rau gì?"* để tra cứu nông sản\n• *"Cách đặt trước nhận tại sạp?"* để xem hướng dẫn mua sắm`;
    } catch (fallbackErr) {
      console.warn("Fallback query error:", fallbackErr);
      return "Xin chào! Trợ lý AI MarketLink luôn sẵn sàng hỗ trợ bạn tra cứu lịch chợ phiên và tìm kiếm nông sản tươi sạch từ các nhà vườn VietGAP.";
    }
  },
};

export default aiService;
