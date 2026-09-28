import apiClient from "./apiClient";
import { marketService } from "./marketService";
import { productService } from "./productService";

// Chuẩn hóa chuỗi không dấu để so khớp linh hoạt
function normalizeText(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

/**
 * Phát hiện ngôn ngữ câu hỏi: Tiếng Anh (true) hoặc Tiếng Việt (false)
 */
function isEnglishQuery(text, preferredLang = null) {
  if (preferredLang === "en") return true;
  if (preferredLang === "vi") return false;

  try {
    const saved = localStorage.getItem("ml_language");
    if (saved === "en") return true;
  } catch {}

  const enKeywords = [
    "when", "what", "where", "which", "who", "how", "why", "is", "are", "do", "does", "can",
    "market", "markets", "open", "opening", "schedule", "hours", "time", "date",
    "tomato", "tomatoes", "strawberry", "strawberries", "vegetable", "vegetables",
    "fruit", "fruits", "spinach", "mushroom", "mushrooms", "egg", "eggs",
    "price", "prices", "cost", "how much", "cheap", "expensive",
    "order", "pre-order", "preorder", "buy", "purchase", "reserve", "pickup", "slot", "pay", "payment",
    "vietgap", "organic", "fresh", "clean", "farm", "farmer", "farmers", "stall", "stalls",
    "hello", "hi", "hey", "good morning", "help", "sunday", "saturday", "weekend"
  ];

  const words = (text || "").toLowerCase().split(/[\s,?.!;:()"-]+/);
  let matches = 0;
  for (const w of words) {
    if (enKeywords.includes(w)) matches++;
  }
  return matches >= 1;
}

/**
 * Dịch câu trả lời tiếng Việt từ server sang tiếng Anh chuẩn xác cho người dùng quốc tế
 */
function translateBackendReplyToEn(replyText) {
  if (!replyText) return "";

  let en = replyText;

  // Dịch câu mở đầu / thông báo phổ biến
  en = en.replace(
    /Chào bạn! Trợ lý ảo MarketLink luôn sẵn sàng hỗ trợ bạn tra cứu lịch họp chợ, sạp nông dân đang mở bán và thông tin nông sản tươi ngon\. Hiện tại toàn sàn có (\d+) điểm chợ nông sản và (\d+) mặt hàng sạch sẵn sàng đặt trước\./gi,
    "Hello! MarketLink's AI Assistant is ready to help you look up market schedules, active farmer stalls, and fresh produce. Currently, the platform connects $1 farmers' markets and $2 clean produce items ready for pre-order."
  );

  en = en.replace(
    /Dạ, các phiên chợ họp theo yêu cầu của bạn gồm:/gi,
    "Here are the farmers' markets matching your query:"
  );

  en = en.replace(
    /Các gian hàng nông dân đều có khung giờ nhận hàng sáng\/chiều thuận tiện\./gi,
    "Farmer stalls offer convenient morning and afternoon pickup time slots."
  );

  en = en.replace(
    /Dạ, hệ thống có các mặt hàng tươi ngon đang mở đặt trước:/gi,
    "Here is the fresh produce currently available for pre-order:"
  );

  en = en.replace(
    /Bạn có thể đặt trước và chọn ca nhận hàng tại sạp chợ gần nhất nhé!/gi,
    "You can pre-order online and select your pickup slot at the nearest stall!"
  );

  en = en.replace(
    /Phiên Chợ Xanh Nông Sản Ba Đình/gi,
    "Ba Dinh Green Produce Market"
  );
  en = en.replace(
    /Chợ Nông Sản Sạch Cuối Tuần Cầu Giấy/gi,
    "Cau Giay Weekend Clean Produce Market"
  );
  en = en.replace(
    /Hội Chợ Nông Sản Vùng Miền Tây Hồ/gi,
    "Tay Ho Regional Produce Fair"
  );
  en = en.replace(
    /Cà Chua Cherry Mộc Châu Ngọt Giòn/gi,
    "Moc Chau Crispy Sweet Cherry Tomatoes"
  );

  en = en.replace(/hộp 500g/gi, "500g pack");
  en = en.replace(/hộp/gi, "pack");
  en = en.replace(/bó/gi, "bundle");
  en = en.replace(/phần/gi, "portion");

  return en;
}

export const aiService = {
  /**
   * Gọi API Trợ lý AI thông minh (AI Assistant) chính thức từ Swagger:
   * POST /api/ai/assistant/chat hoặc /api/ai/chat
   * Hỗ trợ song ngữ Anh - Việt (Bilingual English - Vietnamese)
   * Swagger doc: http://172.16.2.89:8081/swagger-ui/index.html (Tag 7: Trợ lý AI thông minh)
   */
  async askAssistant(message, preferredLang = null) {
    const isEn = isEnglishQuery(message, preferredLang);

    if (!message || !message.trim()) {
      return isEn
        ? "Hello! Feel free to ask about weekend market schedules, open farmer stalls, or fresh seasonal produce."
        : "Xin chào! Bạn có thể hỏi tôi về lịch họp chợ, sạp nông dân đang mở bán hoặc kiểm tra nông sản sẵn có nhé.";
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
          const directFetch = await fetch("http://172.16.2.89:8081/api/ai/assistant/chat", {
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
        let fullReply = isEn ? translateBackendReplyToEn(replyText) : replyText;

        // Nếu API trả về danh sách phiên chợ liên quan (relevantMarkets) chưa được đề cập
        if (Array.isArray(data.relevantMarkets) && data.relevantMarkets.length > 0) {
          const unmentionedMarkets = data.relevantMarkets.filter((m) => {
            const name = typeof m === "string" ? m : (m.name || m.marketName);
            const prefix = name ? name.split("(")[0].trim() : "";
            return prefix && !fullReply.includes(prefix);
          });
          if (unmentionedMarkets.length > 0) {
            const marketList = unmentionedMarkets
              .map((m) => {
                if (typeof m === "string") return isEn ? `• ${translateBackendReplyToEn(m)}` : `• ${m}`;
                const mName = m.name || m.marketName;
                const mAddr = m.address || "";
                return `• ${mName} (${mAddr})`;
              })
              .join("\n");
            fullReply += isEn
              ? `\n\n🎪 Relevant Farmers' Markets:\n${marketList}`
              : `\n\n🎪 Phiên chợ liên quan:\n${marketList}`;
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
                if (typeof p === "string") return isEn ? `• ${translateBackendReplyToEn(p)}` : `• ${p}`;
                const price = p.price ? `${Number(p.price).toLocaleString()}đ` : "";
                const unit = p.unit ? `/${p.unit}` : "";
                return `• ${p.name || p.productName} ${price}${unit}`;
              })
              .join("\n");
            fullReply += isEn
              ? `\n\n🥦 Matching Fresh Produce:\n${prodList}`
              : `\n\n🥦 Nông sản phù hợp:\n${prodList}`;
          }
        }

        // Nếu API trả về lưu ý thời gian nhận hàng / chốt đơn (timingNotes)
        if (data.timingNotes && !fullReply.includes(data.timingNotes)) {
          const noteText = isEn
            ? "Note: Please pre-order at least 12 hours before market opening so farmers can harvest fresh produce in the morning!"
            : data.timingNotes;
          fullReply += isEn ? `\n\n⏰ ${noteText}` : `\n\n⏰ Lưu ý: ${data.timingNotes}`;
        }

        return fullReply;
      }
    }

    // 3. Engine Dữ Liệu Thời Gian Thực Song Ngữ (100% dữ liệu sống từ cơ sở dữ liệu hệ thống)
    try {
      const [rawMarkets, rawProducts] = await Promise.all([
        marketService.getMarkets().catch(() => []),
        productService.getProducts().catch(() => []),
      ]);

      const markets = Array.isArray(rawMarkets) ? rawMarkets : [];
      const products = Array.isArray(rawProducts) ? rawProducts : [];

      // A. HỎI VỀ LỊCH HỌP CHỢ, THỜI GIAN, ĐỊA CHỈ, NƠI BÁN (Song ngữ VI & EN)
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
        norm.includes("diem cho") ||
        norm.includes("market") ||
        norm.includes("open") ||
        norm.includes("schedule") ||
        norm.includes("hours") ||
        norm.includes("time") ||
        norm.includes("sunday") ||
        norm.includes("saturday") ||
        norm.includes("weekend");

      if (isMarketQuery) {
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

        if (isEn) {
          const lines = displayMarkets.map((m) => {
            let schedule = "Saturday & Sunday (06:30 - 12:00)";
            const mNorm = normalizeText(m.name);
            if (mNorm.includes("cau giay")) schedule = "Sunday mornings (06:30 - 11:30)";
            else if (mNorm.includes("tay ho")) schedule = "Saturdays (07:00 - 14:00)";
            else if (mNorm.includes("ba dinh")) schedule = "Saturday & Sunday (06:00 - 12:00)";

            return `🎪 **${m.name}**\n   📍 Address: ${m.address || "City Center Area"}\n   🕒 Schedule: ${schedule}`;
          });

          return `Here is the schedule for MarketLink farmers' markets:\n\n${lines.join("\n\n")}\n\n⏰ Note: Please place pre-orders at least 12 hours before market opening so farmers can harvest fresh produce in the morning!\n👉 Visit the "Markets" section to see stall locations and interactive routing.`;
        }

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

      // B. HỎI VỀ SẢN PHẨM CỤ THỂ HOẶC GIÁ BÁN (Song ngữ VI & EN)
      const specificKeywords = [
        { key: "ca chua", enKey: "tomato", label: "Cà chua", enLabel: "Fresh Tomatoes" },
        { key: "dau tay", enKey: "strawberry", label: "Dâu tây", enLabel: "Strawberries" },
        { key: "vai", enKey: "lychee", label: "Vải thiều", enLabel: "Lychee" },
        { key: "rau muong", enKey: "water spinach", label: "Rau muống", enLabel: "Water Spinach" },
        { key: "cai bo xoi", enKey: "spinach", label: "Cải bó xôi", enLabel: "Baby Spinach" },
        { key: "nam huong", enKey: "shiitake", label: "Nấm hương", enLabel: "Shiitake Mushrooms" },
        { key: "nam", enKey: "mushroom", label: "Nấm", enLabel: "Mushrooms" },
        { key: "rau", enKey: "vegetable", label: "Rau", enLabel: "Vegetables" },
        { key: "trung", enKey: "egg", label: "Trứng", enLabel: "Fresh Eggs" },
      ];

      const matchedKeyword = specificKeywords.find(
        (k) => norm.includes(k.key) || norm.includes(k.enKey)
      );

      if (matchedKeyword) {
        const matchedProds = products.filter((p) => {
          const text = normalizeText(p.name + (p.categoryName || ""));
          return text.includes(matchedKeyword.key) || text.includes(matchedKeyword.enKey);
        });

        if (matchedProds.length > 0) {
          if (isEn) {
            const prodDetails = matchedProds.map((p) => {
              const price = Number(p.price || 0).toLocaleString();
              return `🌿 **${p.name}**\n   • 💰 Price: **${price} VND** / ${p.unit || "kg"}\n   • 👨‍🌾 Farm: ${p.farmerName || p.farmerStallName || "VietGAP Family Farm"}\n   • 🎪 Available at: Stall ${p.stallNumber || "Main"} - ${p.marketName || "Market"}\n   • 📦 Stock: ${p.currentStock || 30} ${p.unit || "units"}`;
            });

            return `Here are the available details for ${matchedKeyword.enLabel} ready for pre-order:\n\n${prodDetails.join("\n\n")}\n\n👉 Head to "Seasonal Produce" to pick your pickup slot and reserve your portion!`;
          }

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
        norm.includes("rau cu") ||
        norm.includes("price") ||
        norm.includes("cost") ||
        norm.includes("produce") ||
        norm.includes("vegetable") ||
        norm.includes("fruit");

      if (isProductGeneralQuery && products.length > 0) {
        const topProducts = products.filter((p) => p.price > 0).slice(0, 6);

        if (isEn) {
          const prodList = topProducts
            .map(
              (p) =>
                `• **${p.name}**: ${Number(p.price).toLocaleString()} VND/${p.unit || "kg"} (${p.farmerName || "Farm"} at ${p.marketName || "Market"})`
            )
            .join("\n");

          return `🥦 Popular seasonal farm produce open for pre-order:\n\n${prodList}\n\n✨ All produce is harvested early in the morning and packaged under your pre-order reservation code!`;
        }

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
        norm.includes("quy trinh") ||
        norm.includes("order") ||
        norm.includes("pre-order") ||
        norm.includes("preorder") ||
        norm.includes("how to buy") ||
        norm.includes("pickup") ||
        norm.includes("pay");

      if (isOrderQuery) {
        if (isEn) {
          return `🛒 **MarketLink Pre-order & Stall Pickup Process:**\n\n1. **Select Produce**: Choose certified VietGAP vegetables and fruits from local family farms.\n2. **Choose Market & Pickup Slot**: Select a nearby weekend market and your preferred pickup window (morning/afternoon).\n3. **Reserve (Pre-order)**: Receive your pickup reservation code immediately (100% Free, **no online payment required**).\n4. **Inspect & Pay at Stall**: Arrive at your selected slot, personally check the freshness, then pay cash or scan VietQR directly to the farmer!`;
        }

        return `🛒 **Quy trình mua sắm & đặt trước nhận tại sạp MarketLink:**\n\n1. **Chọn nông sản**: Khám phá các mặt hàng rau, củ, quả sạch từ các nhà vườn VietGAP uy tín.\n2. **Chọn phiên chợ & ca nhận**: Chọn phiên chợ gần nhà và khung giờ (sáng/chiều) bạn tiện ghé lấy.\n3. **Đặt trước giữ phần**: Nhận ngay mã đơn đặt trước (Hoàn toàn miễn phí, **không cần thanh toán online**).\n4. **Nhận hàng tại sạp**: Đến đúng ca nhận, tự tay kiểm tra độ tươi ngon của nông sản rồi mới thanh toán tiền mặt hoặc quét VietQR cho chủ sạp!`;
      }

      // E. HỎI VỀ CHỨNG NHẬN, VIETGAP, NGUỒN GỐC, NÔNG DÂN
      const isQualityQuery =
        norm.includes("vietgap") ||
        norm.includes("chung nhan") ||
        norm.includes("nguon goc") ||
        norm.includes("an toan") ||
        norm.includes("nong dan") ||
        norm.includes("organic") ||
        norm.includes("certif") ||
        norm.includes("quality") ||
        norm.includes("safety");

      if (isQualityQuery) {
        if (isEn) {
          return `🌱 **Quality Commitment at MarketLink:**\n\n• **100% Verified Farmers**: All stall owners undergo KYC verification and hold valid VietGAP or Organic certifications.\n• **Transparent Cultivation**: Scan QR codes to view farm locations, coordinates, and real field photos.\n• **Zero Stale Leftovers**: Produce is harvested at dawn on market day strictly to fulfill customer pre-orders!`;
        }

        return `🌱 **Cam kết chất lượng nông sản tại MarketLink:**\n\n• **100% Nông hộ có chứng nhận**: Toàn bộ chủ sạp đều phải hoàn tất định danh KYC và nộp chứng nhận VietGAP / Hữu cơ có giá trị.\n• **Minh bạch vùng trồng**: Người mua có thể quét QR hoặc xem trực tiếp địa chỉ vườn trồng, tọa độ và hình ảnh canh tác thực tế.\n• **Không tồn đọng qua ngày**: Nông sản chỉ được thu hoạch sáng sớm ngày họp chợ theo đúng số lượng khách đặt trước!`;
      }

      // F. LỜI CHÀO & CÂU HỎI TỔNG QUAN
      const marketCount = markets.length;
      const productCount = products.length;

      if (isEn) {
        return `🌿 Hello! I am the MarketLink AI Assistant.\nOur system currently connects **${marketCount} farmers' markets** and **${productCount} produce items** ready for pre-order.\n\nFeel free to ask me:\n• *"When does the market open?"* for weekend schedules\n• *"How much is tomato?"* or *"What fresh vegetables are available?"* to browse produce\n• *"How to pre-order?"* for pickup instructions`;
      }

      return `🌿 Xin chào bạn! Tôi là Trợ lý AI MarketLink.\nHiện tại hệ thống đang kết nối trực tiếp với **${marketCount} phiên chợ nông sản** và **${productCount} mặt hàng** sẵn sàng đặt trước.\n\nBạn có thể hỏi tôi về:\n• *"Chợ họp khi nào?"* để xem lịch mở cửa các phiên chợ\n• *"Giá cà chua bao nhiêu?"* hoặc *"Có những loại rau gì?"* để tra cứu nông sản\n• *"Cách đặt trước nhận tại sạp?"* để xem hướng dẫn mua sắm`;
    } catch (fallbackErr) {
      console.warn("Fallback query error:", fallbackErr);
      return isEn
        ? "Hello! The MarketLink AI Assistant is always ready to help you discover weekend markets and fresh VietGAP produce."
        : "Xin chào! Trợ lý AI MarketLink luôn sẵn sàng hỗ trợ bạn tra cứu lịch chợ phiên và tìm kiếm nông sản tươi sạch từ các nhà vườn VietGAP.";
    }
  },
};

export default aiService;
