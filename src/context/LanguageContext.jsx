import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

export const translations = {
  vi: {
    // Brand
    brandName: "MarketLink",
    brandTagline: "Nông sản chợ phiên",
    brandTaglineLong: "Nông sản sạch từ vườn đến chợ",

    // Navigation
    navHome: "Trang chủ",
    navMarkets: "Chợ phiên",
    navProducts: "Nông sản",
    navStalls: "Gian hàng",
    navOrders: "Đơn hàng",
    navDashboard: "Cá nhân",

    // Farmer Nav
    navFarmerDashboard: "Tổng quan",
    navFarmerOrders: "Đơn đặt",
    navFarmerInventory: "Kho hàng",
    navFarmerStall: "Gian hàng",
    navFarmerReviews: "Đánh giá",

    // Admin Nav
    navAdminDashboard: "Bảng điều hành",
    navAdminMarkets: "Quản lý chợ",
    navAdminUsers: "Người dùng",
    navAdminOrders: "Đơn toàn sàn",
    navAdminContent: "Kiểm duyệt",
    navViewMarket: "Xem chợ",

    // Header Actions
    selectLocation: "Chọn khu vực của bạn:",
    cartTitle: "Giỏ đặt trước",
    cartEmpty: "Chưa có sản phẩm nào trong giỏ",
    login: "Đăng nhập",
    register: "Đăng ký",
    logout: "Đăng xuất tài khoản",
    themeToggleLight: "Chuyển sang giao diện sáng",
    themeToggleDark: "Chuyển sang giao diện tối",
    languageToggle: "Chuyển sang Tiếng Anh (EN)",

    // Roles
    roleGuest: "Khách vãng lai",
    roleCustomer: "Khách hàng",
    roleFarmer: "Nông dân (Chủ sạp)",
    roleAdmin: "Quản trị viên",

    // Hero Section
    heroBadge: "Sàn Nông Sản Địa Phương Đặt Trước",
    heroTitle1: "Nông Sản Tươi Từ Vườn,",
    heroTitle2: "Đặt Trước & Nhận Tại Chợ Sáng",
    heroDesc:
      "Kết nối trực tiếp người tiêu dùng với các nhà vườn tâm huyết. Đặt trước để sạp giữ phần rau củ ngon nhất, ra chợ kiểm tra độ tươi giòn rồi mới thanh toán tiền mặt hoặc chuyển khoản tại sạp.",
    heroBtnProducts: "🌾 Khám Phá Nông Sản",
    heroBtnMarkets: "🎪 Xem Các Phiên Chợ",
    heroStatMarkets: "Chợ phiên cuối tuần",
    heroStatProducts: "Nông sản thu hoạch sớm",
    heroStatPay: "Thanh toán tại sạp",
    heroBadgeCut: "Cắt lúc 4h30 sáng",
    heroBadgeCutSub: "Tươi giòn nguyên sương sớm",
    heroBadgeCert: "VietGAP & Hữu cơ",
    heroBadgeCertSub: "Kiểm định nguồn gốc rõ ràng",

    // Trust Strip
    trustHarvest: "Hái Trong Ngày",
    trustHarvestDesc: "Rau củ tươi vừa rời cành sáng sớm",
    trustDirect: "Trực Tiếp Từ Nhà Vườn",
    trustDirectDesc: "Không qua thương lái trung gian",
    trustInspect: "Kiểm Tra Tại Sạp",
    trustInspectDesc: "Ưng ý độ tươi mới gửi tiền thanh toán",
    trustPreorder: "Đặt Trước Giữ Chỗ",
    trustPreorderDesc: "Không lo hết hàng vào giờ cao điểm",

    // How It Works
    howSubtitle: "Quy trình đơn giản & an tâm",
    howTitle: "Cách Thức Đặt Trước & Nhận Hàng Tại Chợ",
    howDesc:
      "Không vận chuyển lưu kho dài ngày, nông sản đi thẳng từ luống vườn đến giỏ xách của bạn.",
    howStep1Badge: "Bước 1",
    howStep1Title: "Chọn sạp & đặt trước",
    howStep1Desc:
      "Xem lượng nông sản dự kiến hái cho phiên chợ tới. Chọn món bạn thích và giữ chỗ trước khi sạp đầy đơn.",
    howStep2Badge: "Bước 2",
    howStep2Title: "Hẹn giờ ra chợ lấy",
    howStep2Desc:
      "Chọn ca nhận hàng (sáng sớm 06:30 - 08:30 hoặc 08:30 - 10:30) để người bán đóng gói sẵn phần riêng cho bạn.",
    howStep3Badge: "Bước 3",
    howStep3Title: "Kiểm tra & trả tiền tại sạp",
    howStep3Desc:
      "Ghé sạp tận mắt ngắm rau quả tươi giòn, hài lòng mới gửi tiền mặt hoặc quét VietQR. Thảnh thơi dạo chợ phiên!",

    // Markets Section on Home
    marketsSubtitle: "Điểm hẹn cuối tuần",
    marketsTitle: "Các Phiên Chợ Đang Nhận Đặt Trước",
    marketsDesc: "Tìm phiên chợ nông sản gần nhà bạn để ghé mua sắm cuối tuần này.",
    marketsViewAll: "Xem tất cả chợ",
    marketsAllAreas: "Tất cả khu vực",

    // Seasonal Products Section
    prodsSubtitle: "Thu hoạch sớm hôm nay",
    prodsTitle: "Nông Sản Sạch Mùa Vụ Đang Mở Đặt Trước",
    prodsDesc:
      "Được nông dân cam kết thu hoạch trước phiên họp chợ 4-6 tiếng. Đặt trước để sạp giữ phần cho bạn!",
    prodsSearchPlaceholder: "Tìm tên rau, củ, quả, tên sạp hoặc phiên chợ...",
    prodsQuickSearchLabel: "Gợi ý tìm nhanh:",
    prodsFilterAll: "Tất cả nông sản",
    prodsFilterVeg: "Rau ăn lá",
    prodsFilterRoot: "Củ & Quả",
    prodsFilterFruit: "Trái cây",
    prodsFilterMushroom: "Nấm & Thảo mộc",
    prodsFilterSpecialty: "Đặc sản",
    prodsEmptyTitle: "Không tìm thấy nông sản phù hợp",
    prodsEmptyDesc: "Thử tìm với từ khóa khác hoặc bấm nút bên dưới để xem toàn bộ sản phẩm.",
    prodsEmptyReset: "Xem tất cả nông sản",

    // ProductCard & MarketCard
    addToCart: "Đặt trước",
    addedToCart: "Đã chọn",
    outOfStock: "Hết hàng",
    inStock: "Còn lại:",
    pickupAt: "Nhận tại:",
    restocking: "Sạp sẽ bổ sung vào phiên sau",
    verifiedMarket: "Đã kiểm duyệt",
    stallsCountLabel: "gian hàng nông dân",
    btnScheduleMap: "Xem lịch & sơ đồ",
    btnBrowseStalls: "Xem sạp & đặt món",
    organicTag: "Hữu cơ",

    // Footer
    footerDesc:
      "MarketLink là nền tảng số hóa chợ nông sản địa phương, kết nối những người nông dân tâm huyết với cư dân đô thị, mang lại bữa ăn lành mạnh và giữ trọn nét đẹp văn hóa chợ phiên truyền thống.",
    footerHeadCustomer: "Dành cho khách hàng",
    footerHeadFarmer: "Dành cho nông dân",
    footerHeadMarkets: "Chợ phiên nổi bật",
    footerLinkFindMarket: "Tìm chợ nông sản gần đây",
    footerLinkOrganicVeg: "Rau củ hữu cơ theo mùa",
    footerLinkHowItWorks: "Cách thức đặt trước & nhận tại sạp",
    footerLinkStallList: "Danh sách sạp nông dân uy tín",
    footerLinkRegisterStall: "Đăng ký mở sạp bán tại chợ",
    footerLinkVerification: "Quy trình xác thực nông sản sạch",
    footerLinkSupport: "Chính sách hỗ trợ nông hộ nhỏ lẻ",
    footerLinkCalendar: "Lịch đăng ký chợ phiên cuối tuần",
    footerPrivacy: "Chính sách bảo mật",
    footerTerms: "Điều khoản sử dụng",
    footerContact: "Liên hệ hỗ trợ",
    footerCopyright:
      "© 2026 MarketLink Platform. Dự án số hóa nông sản TechWiz 7. Bảo lưu mọi quyền.",
    footerHeadquarters: "Trụ sở: Tòa nhà TechWiz, Hà Nội",

    // AI Chatbot UI
    aiTitle: "Trợ lý AI Nông Sản",
    aiSubtitle: "Trực tuyến • Sẵn sàng hỗ trợ",
    aiWelcome:
      "Xin chào! Tôi là Trợ lý AI của MarketLink 🌿. Bạn muốn tìm chợ nông sản họp hôm nay, hay cần gợi ý rau củ tươi sạch từ nông dân?",
    aiPlaceholder: "Hỏi về chợ, nông sản, giá bán...",
    aiError:
      "Xin lỗi bạn, trợ lý tạm thời gặp sự cố kết nối. Bạn có thể xem danh mục nông sản trực tiếp trên website nhé!",
    aiPrompt1: "Chợ nào mở vào sáng Thứ 7?",
    aiPrompt2: "Rau hữu cơ nào đang vào vụ?",
    aiPrompt3: "Cách đặt trước nhận tại sạp?",

    // Products Page
    productsSubtitle: "Duyệt Nông Sản Tươi Sạch",
    productsTitle: "Đặt Trước Nông Sản Theo Mùa",
    productsDesc: "Thu hoạch sớm trong ngày họp chợ. Chọn sạp, giữ chỗ trước và nhận hàng tươi ngon tận tay!",
    productsSearchPlaceholder: "Tìm theo tên cải bó xôi, dâu tây, tên sạp...",
    productsFilterCardTitle: "Bộ Lọc Tìm Kiếm",
    productsFilterReset: "Xóa lọc",
    productsFilterCategory: "Danh mục sản phẩm",
    productsFilterAllCats: "🌿 Tất cả danh mục",
    productsFilterMarket: "Điểm họp chợ phiên",
    productsFilterAllMarkets: "Tất cả các chợ",
    productsFilterMaxPrice: "Mức giá tối đa:",
    productsCountPrefix: "Hiển thị",
    productsCountSuffix: "sản phẩm sẵn sàng đặt trước",
    productsSortLabel: "Sắp xếp:",
    productsSortStock: "Tồn kho sẵn sàng",
    productsSortPriceAsc: "Giá từ thấp đến cao",
    productsSortPriceDesc: "Giá từ cao xuống thấp",
    productsNoResults: "Không tìm thấy sản phẩm phù hợp",
    productsNoResultsMatch: "Không tìm thấy sản phẩm khớp với",
    productsNoResultsDesc: "Hãy thử bấm vào các gợi ý nông sản phổ biến hoặc xem các sản phẩm sẵn sàng đặt trước bên dưới.",
    productsEmptyResetBtn: "↺ Xem tất cả nông sản",
    productsFeaturedBadge: "🔥 NÔNG SẢN NỔI BẬT",
    productsFeaturedTitle: "Gợi Ý Nông Sản Sẵn Sàng Đặt Trước",
    productsFeaturedSub: "Các mặt hàng tươi ngon được nhiều khách đi chợ lựa chọn:",

    // Markets Page
    marketsPageSubtitle: "Mạng Lưới Chợ Phiên",
    marketsPageTitle: "Khám Phá Các Điểm Chợ Nông Sản Sạch",
    marketsPageDesc: "Tìm các chợ phiên họp định kỳ gần nơi bạn sinh sống, xem lịch họp sạp và lộ trình đi lại thuận tiện nhất.",
    marketsTabGrid: "⊞ Danh sách sạp",
    marketsTabMap: "🗺️ Bản đồ & Định vị",
    marketsSearchPlaceholder: "Tìm theo tên chợ, quận/huyện, tên đường...",
    marketsCityFilter: "Thành phố:",
    marketsCityAll: "Tất cả",
    marketsEmptyTitle: "Không tìm thấy chợ phiên phù hợp",
    marketsEmptyMatch: "Không tìm thấy chợ phiên khớp với",
    marketsEmptyDesc: "Thử tìm kiếm với từ khóa khác hoặc chuyển sang khu vực 'Tất cả'.",
    marketsEmptyResetBtn: "↺ Xem tất cả chợ",
    marketsFeaturedBadge: "⭐ CHỢ PHIÊN TIÊU BIỂU",
    marketsFeaturedTitle: "Gợi Ý Các Phiên Chợ Nổi Bật Cho Bạn",
    marketsFeaturedSub: "Các điểm chợ nông sản sạch họp định kỳ mỗi cuối tuần:",

    // Stalls Page
    stallsPageSubtitle: "Danh Bạ Sạp Nông Dân",
    stallsPageTitle: "Kết Nối Trực Tiếp Với Nhà Vườn & Nông Hộ",
    stallsPageDesc: "Xem thông tin nguồn gốc, chứng nhận VietGAP, lịch mở bán và các nông sản tươi được thu hái trong ngày.",
    stallsBackToList: "← Quay lại danh sách gian hàng",
    stallsSearchPlaceholder: "Tìm tên chủ sạp, nông trại, mã sạp, đặc sản...",
    stallsMarketFilter: "Lọc theo chợ:",
    stallsMarketAll: "Tất cả các phiên chợ",
    stallsSpecialtyFilter: "Chuyên canh:",
    stallsCertFilter: "Chứng nhận:",
    stallsCertAll: "Tất cả chứng nhận",
    stallsSortRating: "Đánh giá cao nhất",
    stallsSortProds: "Nhiều sản phẩm nhất",
    stallsSortCode: "Theo mã sạp (A-Z)",
    stallsFavSaved: "Đã lưu sạp yêu thích",
    stallsFavSave: "Lưu sạp này",
    stallsInfoTitle: "🎪 Thông tin sạp tại chợ",
    stallsStallCodeLabel: "Vị trí sạp:",
    stallsScheduleLabel: "Lịch họp:",
    stallsFarmAddressLabel: "Nhà vườn tại:",
    stallsRatingLabel: "Đánh giá:",
    stallsCertTitle: "🌿 Tiêu chuẩn & Cam kết",
    stallsCertVerified: "Đã xác thực giấy chứng nhận nông nghiệp",
    stallsCertOrganicDesc: "Cam kết không sử dụng thuốc trừ sâu hóa học và phân bón vô cơ độc hại.",
    stallsBioTitle: "📖 Câu chuyện nhà vườn",
    stallsProductsTitle: "🌾 Nông Sản Đang Mở Đặt Trước",
    stallsReviewsTitle: "⭐ Đánh Giá Từ Khách Đi Chợ",

    // Cart Drawer
    cartDrawerTitle: "Giỏ Nông Sản Đặt Trước",
    cartDrawerSubtitle: "loại nông sản đã chọn",
    cartEmptyTitle: "Giỏ hàng của bạn đang rỗng",
    cartEmptyDesc: "Hãy khám phá các sạp nông dân gần bạn và đặt trước để giữ phần rau củ ngon nhất cho buổi chợ sớm!",
    cartBrowseBtn: "Duyệt nông sản ngay",
    cartSectionLabelItems: "Nông sản thu hoạch sớm từ nhà vườn",
    cartSectionLabelPickup: "Thông tin nhận hàng tại chợ",
    cartMarketLabel: "Điểm chợ bạn sẽ đến lấy hàng:",
    cartDateLabel: "Ngày bạn sẽ ghé chợ:",
    cartSlotLabel: "Chọn ca nhận hàng (khung giờ ghé sạp):",
    cartSlotLoading: "Đang tải ca...",
    cartSlotItem: "Ca",
    cartNoteLabel: "Ghi chú gửi người bán (nếu có):",
    cartNotePlaceholder: "VD: Nhặt giúp bó rau non, đóng riêng từng túi...",
    cartCashPledgeTitle: "Thanh toán trực tiếp tại sạp chợ",
    cartCashPledgeDesc: "Khi ra chợ nhận hàng, bạn được tận mắt kiểm tra độ tươi ngon rồi mới thanh toán tiền mặt hoặc quét mã VietQR cho chủ sạp.",
    cartSubtotal: "Tổng tiền tạm tính:",
    cartConfirmOrder: "Xác nhận đặt trước",
    cartLoginToOrder: "Đăng nhập để đặt trước",
    cartPledgeGuarantee: "🌿 Không cần thẻ ngân hàng • Giữ nông sản tươi tới khi bạn đến",
    cartDeleteTip: "Xóa món này",

    // Product Detail Modal
    prodModalFarmerStall: "Thuộc sạp",
    prodModalOrganicBadge: "🌿 Hữu cơ kiểm định",
    prodModalCutoff: "Chốt đơn trước phiên",
    prodModalHarvestTime: "Thời điểm cắt:",
    prodModalPickupLocation: "Điểm nhận hàng:",
    prodModalStockStatus: "Tình trạng kho:",
    prodModalSoldOut: "Đã hết hàng cho phiên này",
    prodModalInStock: "Còn",
    prodModalDescTitle: "Mô tả nông sản:",
    prodModalQtyLabel: "Số lượng đặt:",
    prodModalOrderBtn: "Đặt trước",
    prodModalSoldOutBtn: "Tạm hết hàng",
    prodModalGuarantee: "✓ Nhận tại sạp chợ • Kiểm tra độ tươi trước khi trả tiền mặt",

    // Market Detail Modal
    marketModalHours: "Giờ họp:",
    marketModalDays: "Ngày họp:",
    marketModalDistance: "Khoảng cách:",
    marketModalAmenities: "Tiện ích tại chợ:",
    marketModalRouteTitle: "Chỉ đường tới chợ:",
    marketModalStartNav: "Xem trên Google Maps",
    marketModalGeofenceAlert: "🔔 Bạn đã đến gần cổng chợ! Đang chuẩn bị giỏ nông sản.",
    marketModalViewStallsBtn: "Xem sạp & đặt món",

    // Auth Modal
    authLoginTitle: "Đăng Nhập MarketLink",
    authLoginSubtitle: "Đặt trước nông sản tươi và nhận tại sạp",
    authRegisterTitle: "Đăng Ký Tài Khoản",
    authRegisterSubtitle: "Trở thành người mua hoặc nông dân mở sạp",
    authRoleCustomer: "Khách đi chợ",
    authRoleFarmer: "Nông dân mở sạp",
    authEmail: "Địa chỉ Email",
    authEmailPlaceholder: "vidu@gmail.com",
    authPassword: "Mật khẩu",
    authPasswordPlaceholder: "Tối thiểu 6 ký tự",
    authConfirmPassword: "Xác nhận mật khẩu",
    authFullName: "Họ và tên",
    authFullNamePlaceholder: "Nguyễn Văn A",
    authPhone: "Số điện thoại",
    authPhonePlaceholder: "0912 345 678",
    authLoginSubmit: "Đăng nhập ngay",
    authRegisterSubmit: "Hoàn tất đăng ký",
    authForgotPassword: "Quên mật khẩu?",
    authNoAccount: "Chưa có tài khoản?",
    authHasAccount: "Đã có tài khoản?",
    authSwitchRegister: "Đăng ký ngay",
    authSwitchLogin: "Đăng nhập",

    // Customer Orders Page
    ordersTitle: "Đơn Đặt Trước Nông Sản",
    ordersSubtitle: "Theo dõi các đơn nông sản hẹn nhận tại chợ",
    ordersTabAll: "Tất cả đơn",
    ordersTabPlaced: "Chờ xác nhận",
    ordersTabReady: "Sẵn sàng lấy tại sạp",
    ordersTabCompleted: "Đã nhận",
    ordersTabCancelled: "Đã hủy",
    ordersSearchPlaceholder: "Tìm mã đơn, tên nông sản, sạp...",
    ordersEmpty: "Chưa có đơn đặt trước nào",
    ordersEmptyDesc: "Khám phá các phiên chợ và đặt giữ rau quả tươi ngon ngay hôm nay!",
    ordersActionCancel: "Hủy đơn",
    ordersActionModify: "Đổi giờ nhận",
    ordersActionReview: "Đánh giá sạp",
    ordersActionQr: "Mã nhận hàng QR",

    // Common
    preOrder: "Đặt trước",
    pickupSlot: "Khung giờ nhận hàng",
    viewDetails: "Xem chi tiết",
    searchPlaceholder: "Tìm kiếm phiên chợ, nông sản sạch, tên nông hộ...",
    priceUnit: "VNĐ",
    statusActive: "Đang mở",
    statusClosed: "Đã đóng",
    verifiedVietgap: "Chứng nhận VietGAP",
    cleanHarvest: "Thu hoạch sáng sớm",

    // Customer Dashboard
    dashUserGreeting: "Tài khoản khách hàng",
    dashEditProfileBtn: "Chỉnh sửa hồ sơ",
    dashOrderHistoryBtn: "Lịch sử đơn hàng",
    dashMyReviewsBtn: "Đánh giá của tôi",
    dashBrowseMoreBtn: "Đặt thêm nông sản",
    dashMetricPickup: "Đơn hẹn lấy tại chợ",
    dashMetricCompleted: "Đã nhận & thanh toán",
    dashMetricSaved: "Nông dân & món đã lưu",
    dashMetricFamily: "Thành viên nhóm gia đình",
    dashOrdersUnit: "Đơn",
    dashItemsUnit: "Mục",
    dashMembersUnit: "Người",
    dashNoMembers: "Chưa có",
    dashUpcomingTitle: "ĐƠN NÔNG SẢN ĐẶT TRƯỚC SẮP TỚI",
    dashUpcomingPickupDate: "Ngày nhận:",
    dashUpcomingMorningSlot: "Ca sáng",
    dashUpcomingOrderCode: "Mã đơn:",
    dashUpcomingStatus: "Trạng thái:",
    dashUpcomingReady: "Sẵn sàng tại sạp",
    dashUpcomingHarvesting: "Đang thu hoạch & đóng gói",
    dashUpcomingOwner: "Chủ sạp:",
    dashUpcomingTotal: "Tổng thanh toán:",
    dashUpcomingPayHint: "(Thanh toán tại sạp khi nhận hàng).",
    dashUpcomingQrBtn: "Xem mã lấy hàng QR",
    dashTabSavedFarms: "Sạp nông dân đã lưu",
    dashTabFavProducts: "Nông sản yêu thích",
    dashTabFamily: "Gia đình đi chợ",
    dashTabProfile: "Cài đặt hồ sơ & địa chỉ",
    dashNoSavedFarms: "Chưa có nhà vườn yêu thích nào",
    dashNoSavedFarmsDesc: "Khi ghé các sạp nông dân ưng ý, hãy nhấn nút yêu thích để theo dõi lịch họp chợ của họ.",
    dashDiscoverFarmsBtn: "Khám phá nhà vườn",
    dashViewStallBtn: "Xem sạp",
    dashRemoveFavBtn: "Bỏ lưu",
    dashNoFavProds: "Chưa có nông sản lưu sẵn",
    dashNoFavProdsDesc: "Hãy lưu các loại rau quả mùa vụ bạn muốn đặt trước để dễ dàng thêm vào giỏ khi chợ họp.",
    dashBrowseProdsBtn: "Duyệt nông sản tươi",
    dashFamilyTitle: "Nhóm Gia Đình Đi Chợ Chung (Family Account)",
    dashFamilyDesc: "Tính năng đặc biệt cho phép các thành viên trong gia đình cùng xem đơn đặt trước, cùng nhận thông báo khi nông sản đã sẵn sàng tại sạp, và bất kỳ ai cũng có thể xuất trình mã QR để nhận rau củ giúp nhau.",
    dashFamilyMembersTitle: "Thành viên trong nhóm",
    dashFamilyLeaveBtn: "Rời nhóm",
    dashFamilyLeaderBadge: "Chủ nhóm",
    dashFamilyNoMembers: "Bạn chưa liên kết tài khoản gia đình nào.",
    dashFamilyNoMembersHelp: "Hãy gửi lời mời bằng email hoặc nhập mã lời mời bạn nhận được ở khung bên phải!",
    dashFamilyInviteTitle: "Mời người thân vào nhóm",
    dashFamilyEmailLabel: "Email thành viên muốn mời:",
    dashFamilySendInviteBtn: "Gửi lời mời tham gia",
    dashFamilyTokenTitle: "Bạn có mã token lời mời gia đình?",
    dashFamilyTokenPlaceholder: "Nhập mã token lời mời...",
    dashFamilyJoinBtn: "Gia nhập",
    dashFamilyPendingTitle: "Lời mời đang chờ",
    dashFamilySentTo: "Gửi tới:",
    dashFamilyCopyToken: "Sao chép",
    dashProfileTitle: "Cài đặt hồ sơ & địa chỉ nhận hàng",
    dashProfileDesc: "Quản lý thông tin tài khoản, ảnh đại diện và địa chỉ nhận hàng nông sản tại các phiên chợ",
    dashProfileOpenModalBtn: "✏️ Chỉnh sửa hồ sơ (Mở hộp thoại)",
    dashProfileMemberBadge: "Khách hàng thành viên",
    dashProfileEmailLabel: "Email tài khoản:",
    dashProfilePhoneLabel: "Số điện thoại liên hệ:",
    dashProfileAddressLabel: "Địa chỉ nhận hàng mặc định:",
    dashProfileNotProvided: "Chưa cập nhật",
    dashProfileNoAddress: "Chưa thiết lập địa chỉ",
    dashProfileQuickTitle: "📝 Cập nhật nhanh thông tin:",
    dashProfileFullNameLabel: "Họ và tên của bạn:",
    dashProfilePhoneHelp: "Số điện thoại liên hệ (để nông dân liên hệ khi có rau):",
    dashProfileSaveBtn: "Lưu thay đổi hồ sơ",
    dashProfileChangeAvatarBtn: "🖼️ Đổi ảnh đại diện (Mở hộp thoại)",
    dashPasswordTitle: "Đổi mật khẩu tài khoản",
    dashPasswordCurrent: "Mật khẩu hiện tại:",
    dashPasswordNew: "Mật khẩu mới:",
    dashPasswordConfirm: "Nhập lại mật khẩu mới:",
    dashPasswordSubmit: "Cập nhật mật khẩu mới",
    dashModalEditTitle: "✏️ Chỉnh sửa hồ sơ & Ảnh đại diện",
    dashModalEditSubtitle: "Cập nhật họ và tên, số điện thoại, địa chỉ nhận hàng và hình ảnh đại diện của bạn",
    dashModalAvatarLabel: "Ảnh đại diện tài khoản (Avatar):",
    dashModalAvatarHelp: "Tải lên ảnh chân dung cá nhân (JPG, PNG, WebP) hoặc dán đường dẫn ảnh trực tiếp",
    dashModalFixedEmail: "Email tài khoản (Cố định):",
    dashModalAddressHelp: "Địa chỉ này sẽ được dùng để tự động điền khi bạn đặt mua nông sản tại các sạp chợ.",
    dashModalCancel: "Hủy bỏ",
    dashModalSaving: "Đang lưu...",

    // Footer
    footerDesc: "MarketLink là nền tảng số hóa chợ nông sản địa phương, kết nối những người nông dân tâm huyết với cư dân đô thị, mang lại bữa ăn lành mạnh và giữ trọn nét đẹp văn hóa chợ phiên truyền thống.",
    footerHeadquarters: "Trụ sở: Tòa nhà TechWiz, Hà Nội",
    footerHeadCustomer: "Dành cho khách hàng",
    footerLinkFindMarket: "Tìm chợ nông sản gần đây",
    footerLinkOrganicVeg: "Rau củ hữu cơ theo mùa",
    footerLinkHowItWorks: "Cách thức đặt trước & nhận tại sạp",
    footerLinkStallList: "Danh sách sạp nông dân uy tín",
    footerHeadFarmer: "Dành cho nông dân",
    footerLinkRegisterStall: "Đăng ký mở sạp bán tại chợ",
    footerLinkVerification: "Quy trình xác thực nông sản sạch",
    footerLinkSupport: "Chính sách hỗ trợ nông hộ nhỏ lẻ",
    footerLinkCalendar: "Lịch đăng ký chợ phiên cuối tuần",
    footerHeadMarkets: "Chợ phiên nổi bật",
    footerCopyright: "© 2026 MarketLink Platform. Dự án số hóa nông sản TechWiz 7. Bảo lưu mọi quyền.",
    footerPrivacy: "Chính sách bảo mật",
    footerTerms: "Điều khoản sử dụng",
    footerContact: "Liên hệ hỗ trợ",
  },

  en: {
    // Brand
    brandName: "MarketLink",
    brandTagline: "Farmers' Market Produce",
    brandTaglineLong: "Fresh Farm Produce From Garden to Market",

    // Navigation
    navHome: "Home",
    navMarkets: "Markets",
    navProducts: "Produce",
    navStalls: "Stalls",
    navOrders: "Orders",
    navDashboard: "Account",

    // Farmer Nav
    navFarmerDashboard: "Dashboard",
    navFarmerOrders: "Orders",
    navFarmerInventory: "Inventory",
    navFarmerStall: "My Stall",
    navFarmerReviews: "Reviews",

    // Admin Nav
    navAdminDashboard: "Admin Hub",
    navAdminMarkets: "Markets",
    navAdminUsers: "Users",
    navAdminOrders: "Platform Orders",
    navAdminContent: "Moderation",
    navViewMarket: "View Market",

    // Header Actions
    selectLocation: "Select your region:",
    cartTitle: "Pre-order Cart",
    cartEmpty: "Your pre-order cart is empty",
    login: "Log In",
    register: "Register",
    logout: "Log Out",
    themeToggleLight: "Switch to Light Theme",
    themeToggleDark: "Switch to Dark Theme",
    languageToggle: "Switch to Vietnamese (VI)",

    // Roles
    roleGuest: "Guest Visitor",
    roleCustomer: "Customer",
    roleFarmer: "Farmer (Stall Owner)",
    roleAdmin: "Administrator",

    // Hero Section
    heroBadge: "Local Farmers' Pre-order Market",
    heroTitle1: "Fresh Harvest From Local Farms,",
    heroTitle2: "Pre-order & Pick Up at Weekend Markets",
    heroDesc:
      "Directly connecting mindful shoppers with dedicated family farms. Pre-order fresh produce to reserve the morning harvest, inspect at the market stall, and pay on the spot.",
    heroBtnProducts: "🌾 Explore Produce",
    heroBtnMarkets: "🎪 View Weekend Markets",
    heroStatMarkets: "Weekend Farmers' Markets",
    heroStatProducts: "Early Morning Harvests",
    heroStatPay: "Pay at Market Stall",
    heroBadgeCut: "Harvested 4:30 AM",
    heroBadgeCutSub: "Crisp & dew-fresh harvest",
    heroBadgeCert: "VietGAP & Organic",
    heroBadgeCertSub: "Verified farm traceability",

    // Trust Strip
    trustHarvest: "Same-Day Harvest",
    trustHarvestDesc: "Picked fresh at dawn on market day",
    trustDirect: "Direct From Family Farms",
    trustDirectDesc: "Zero middlemen or broker markups",
    trustInspect: "Inspect at Stall",
    trustInspectDesc: "Pay only after checking fresh quality",
    trustPreorder: "Guaranteed Reservation",
    trustPreorderDesc: "No worry of sellouts during rush hours",

    // How It Works
    howSubtitle: "Simple & Transparent Process",
    howTitle: "How Pre-ordering & Stall Pickup Works",
    howDesc:
      "No long warehousing or cold storage. Produce goes directly from farm beds straight to your shopping bag.",
    howStep1Badge: "Step 1",
    howStep1Title: "Select Produce & Pre-order",
    howStep1Desc:
      "Browse expected harvest quantities for the upcoming market. Pick your favorites and reserve before quotas fill up.",
    howStep2Badge: "Step 2",
    howStep2Title: "Schedule Pickup Window",
    howStep2Desc:
      "Select your pickup time (early 06:30 - 08:30 or 08:30 - 10:30) so the farmer packages a personalized fresh bag for you.",
    howStep3Badge: "Step 3",
    howStep3Title: "Inspect & Pay at Stall",
    howStep3Desc:
      "Visit the stall, inspect crisp freshness firsthand, then pay cash or scan VietQR. Enjoy your morning market stroll!",

    // Markets Section on Home
    marketsSubtitle: "Weekend Gatherings",
    marketsTitle: "Farmers' Markets Accepting Pre-orders",
    marketsDesc: "Find a local farmers' market near your neighborhood to visit this weekend.",
    marketsViewAll: "View All Markets",
    marketsAllAreas: "All Regions",

    // Seasonal Products Section
    prodsSubtitle: "Fresh Harvest Today",
    prodsTitle: "Seasonal Clean Produce Ready for Pre-order",
    prodsDesc:
      "Farmers guarantee harvest just 4-6 hours before market gates open. Pre-order to guarantee your portion!",
    prodsSearchPlaceholder: "Search by vegetable, fruit, stall name, or market...",
    prodsQuickSearchLabel: "Popular suggestions:",
    prodsFilterAll: "All Produce",
    prodsFilterVeg: "Leafy Greens",
    prodsFilterRoot: "Roots & Veggies",
    prodsFilterFruit: "Fresh Fruits",
    prodsFilterMushroom: "Mushrooms & Herbs",
    prodsFilterSpecialty: "Specialties",
    prodsEmptyTitle: "No matching produce found",
    prodsEmptyDesc: "Try searching with different keywords or click below to view all items.",
    prodsEmptyReset: "View all produce",

    // ProductCard & MarketCard
    addToCart: "Pre-order",
    addedToCart: "Selected",
    outOfStock: "Sold Out",
    inStock: "Stock:",
    pickupAt: "Pickup at:",
    restocking: "Restocking for next market session",
    verifiedMarket: "Verified",
    stallsCountLabel: "farmer stalls",
    btnScheduleMap: "Schedule & Map",
    btnBrowseStalls: "Browse Stalls",
    organicTag: "Organic",

    // Footer
    footerDesc:
      "MarketLink is a digital platform for local farmers' markets, bridging mindful farmers with urban residents for fresh healthy meals and sustainable community markets.",
    footerHeadCustomer: "For Shoppers",
    footerHeadFarmer: "For Farmers",
    footerHeadMarkets: "Featured Markets",
    footerLinkFindMarket: "Find Nearest Markets",
    footerLinkOrganicVeg: "Seasonal Organic Produce",
    footerLinkHowItWorks: "How Pre-ordering Works",
    footerLinkStallList: "Verified Farm Stalls",
    footerLinkRegisterStall: "Register a Market Stall",
    footerLinkVerification: "Farm Verification Process",
    footerLinkSupport: "Smallholder Farm Support",
    footerLinkCalendar: "Weekend Market Calendar",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Use",
    footerContact: "Contact Support",
    footerCopyright:
      "© 2026 MarketLink Platform. TechWiz 7 Digital Agriculture Project. All rights reserved.",
    footerHeadquarters: "Headquarters: TechWiz Tower, Hanoi",

    // AI Chatbot UI
    aiTitle: "Farm AI Assistant",
    aiSubtitle: "Online • Ready to help",
    aiWelcome:
      "Hello! I am MarketLink's AI Assistant 🌿. Are you looking for upcoming farmers' markets, seasonal fresh vegetables, or stall pickup info?",
    aiPlaceholder: "Ask about markets, produce, prices, pre-order...",
    aiError:
      "Sorry, the assistant is temporarily experiencing connection issues. You can browse produce directly on the website!",
    aiPrompt1: "Which market opens on Saturday morning?",
    aiPrompt2: "What organic produce is in season?",
    aiPrompt3: "How does pre-order pickup work?",

    // Products Page
    productsSubtitle: "Browse Clean Farm Produce",
    productsTitle: "Pre-order Seasonal Produce",
    productsDesc: "Harvested early on market morning. Pick your stall, reserve ahead, and receive fresh crisp produce directly into your basket!",
    productsSearchPlaceholder: "Search baby spinach, strawberries, stall name...",
    productsFilterCardTitle: "Search Filters",
    productsFilterReset: "Clear Filters",
    productsFilterCategory: "Produce Categories",
    productsFilterAllCats: "🌿 All Categories",
    productsFilterMarket: "Market Locations",
    productsFilterAllMarkets: "All Markets",
    productsFilterMaxPrice: "Max Price:",
    productsCountPrefix: "Showing",
    productsCountSuffix: "produce items ready for pre-order",
    productsSortLabel: "Sort by:",
    productsSortStock: "Available Stock",
    productsSortPriceAsc: "Price: Low to High",
    productsSortPriceDesc: "Price: High to Low",
    productsNoResults: "No matching produce found",
    productsNoResultsMatch: "No produce matching",
    productsNoResultsDesc: "Try clicking on popular suggestions or browse available produce below.",
    productsEmptyResetBtn: "↺ View all produce",
    productsFeaturedBadge: "🔥 FEATURED HARVEST",
    productsFeaturedTitle: "Recommended Produce for Pre-order",
    productsFeaturedSub: "Fresh favorites chosen by weekend market shoppers:",

    // Markets Page
    marketsPageSubtitle: "Farmers' Market Network",
    marketsPageTitle: "Explore Local Farmers' Markets",
    marketsPageDesc: "Find recurring weekend markets near your neighborhood, view stall operating schedules, and plan your fastest route.",
    marketsTabGrid: "⊞ Stall Directory",
    marketsTabMap: "🗺️ Map & GPS Navigation",
    marketsSearchPlaceholder: "Search by market name, district, street...",
    marketsCityFilter: "City:",
    marketsCityAll: "All",
    marketsEmptyTitle: "No matching markets found",
    marketsEmptyMatch: "No markets matching",
    marketsEmptyDesc: "Try searching with different terms or switch to 'All' areas.",
    marketsEmptyResetBtn: "↺ View all markets",
    marketsFeaturedBadge: "⭐ FEATURED MARKETS",
    marketsFeaturedTitle: "Recommended Markets for You",
    marketsFeaturedSub: "Recurring clean produce markets taking place every weekend:",

    // Stalls Page
    stallsPageSubtitle: "Farmer Stall Directory",
    stallsPageTitle: "Connect Directly With Mindful Growers",
    stallsPageDesc: "Discover farm origins, VietGAP certifications, opening schedules, and fresh morning harvests.",
    stallsBackToList: "← Back to stall directory",
    stallsSearchPlaceholder: "Search grower, farm name, stall code, specialty...",
    stallsMarketFilter: "Filter by market:",
    stallsMarketAll: "All Farmers' Markets",
    stallsSpecialtyFilter: "Specialty:",
    stallsCertFilter: "Certification:",
    stallsCertAll: "All Certifications",
    stallsSortRating: "Top Rated",
    stallsSortProds: "Most Products",
    stallsSortCode: "By Stall Code (A-Z)",
    stallsFavSaved: "Favorited Stall",
    stallsFavSave: "Favorite This Stall",
    stallsInfoTitle: "🎪 Stall Market Information",
    stallsStallCodeLabel: "Stall Code:",
    stallsScheduleLabel: "Schedule:",
    stallsFarmAddressLabel: "Farm Address:",
    stallsRatingLabel: "Rating:",
    stallsCertTitle: "🌿 Standards & Commitments",
    stallsCertVerified: "Verified agricultural certificates",
    stallsCertOrganicDesc: "Committed to zero harmful chemical pesticides and zero toxic fertilizers.",
    stallsBioTitle: "📖 Farm Story",
    stallsProductsTitle: "🌾 Open for Pre-order",
    stallsReviewsTitle: "⭐ Customer Reviews",

    // Cart Drawer
    cartDrawerTitle: "Pre-order Fresh Basket",
    cartDrawerSubtitle: "produce items selected",
    cartEmptyTitle: "Your basket is empty",
    cartEmptyDesc: "Explore local farmer stalls and pre-order to reserve the freshest morning greens!",
    cartBrowseBtn: "Browse Produce Now",
    cartSectionLabelItems: "Early morning harvest from local growers",
    cartSectionLabelPickup: "Market Pickup Information",
    cartMarketLabel: "Market where you will pick up:",
    cartDateLabel: "Date you will visit the market:",
    cartSlotLabel: "Select pickup time slot:",
    cartSlotLoading: "Loading slots...",
    cartSlotItem: "Slot",
    cartNoteLabel: "Notes for the farmer (optional):",
    cartNotePlaceholder: "E.g., Please pick tender bunches, pack separately...",
    cartCashPledgeTitle: "Pay directly at the market stall",
    cartCashPledgeDesc: "When picking up at the stall, you inspect crisp freshness firsthand before paying cash or scanning VietQR to the grower.",
    cartSubtotal: "Estimated Total:",
    cartConfirmOrder: "Confirm Pre-order",
    cartLoginToOrder: "Log In to Pre-order",
    cartPledgeGuarantee: "🌿 No bank card required • Fresh harvest reserved until you arrive",
    cartDeleteTip: "Remove this item",

    // Product Detail Modal
    prodModalFarmerStall: "From stall",
    prodModalOrganicBadge: "🌿 Certified Organic",
    prodModalCutoff: "Order cutoff tonight",
    prodModalHarvestTime: "Harvest Time:",
    prodModalPickupLocation: "Pickup Location:",
    prodModalStockStatus: "Stock Status:",
    prodModalSoldOut: "Sold out for this market session",
    prodModalInStock: "Remaining:",
    prodModalDescTitle: "Produce Description:",
    prodModalQtyLabel: "Pre-order Quantity:",
    prodModalOrderBtn: "Pre-order",
    prodModalSoldOutBtn: "Temporarily Sold Out",
    prodModalGuarantee: "✓ Pick up at stall • Inspect fresh quality before paying cash",

    // Market Detail Modal
    marketModalHours: "Operating Hours:",
    marketModalDays: "Operating Days:",
    marketModalDistance: "Distance:",
    marketModalAmenities: "Market Amenities:",
    marketModalRouteTitle: "Route to Market:",
    marketModalStartNav: "Navigate in Google Maps",
    marketModalGeofenceAlert: "🔔 You're near the market entrance! Your produce basket is ready.",
    marketModalViewStallsBtn: "Browse Stalls & Pre-order",

    // Auth Modal
    authLoginTitle: "Log In to MarketLink",
    authLoginSubtitle: "Pre-order fresh produce and pick up at the stall",
    authRegisterTitle: "Create an Account",
    authRegisterSubtitle: "Join as a market shopper or register as a farmer",
    authRoleCustomer: "Market Shopper",
    authRoleFarmer: "Farmer (Stall Owner)",
    authEmail: "Email Address",
    authEmailPlaceholder: "example@gmail.com",
    authPassword: "Password",
    authPasswordPlaceholder: "Minimum 6 characters",
    authConfirmPassword: "Confirm Password",
    authFullName: "Full Name",
    authFullNamePlaceholder: "John Doe",
    authPhone: "Phone Number",
    authPhonePlaceholder: "0912 345 678",
    authLoginSubmit: "Log In Now",
    authRegisterSubmit: "Complete Registration",
    authForgotPassword: "Forgot password?",
    authNoAccount: "Don't have an account?",
    authHasAccount: "Already have an account?",
    authSwitchRegister: "Register now",
    authSwitchLogin: "Log In",

    // Customer Orders Page
    ordersTitle: "Pre-order History",
    ordersSubtitle: "Track your fresh produce reservations for market pickup",
    ordersTabAll: "All Orders",
    ordersTabPlaced: "Awaiting Confirmation",
    ordersTabReady: "Ready for Pickup",
    ordersTabCompleted: "Picked Up",
    ordersTabCancelled: "Cancelled",
    ordersSearchPlaceholder: "Search order code, produce, stall...",
    ordersEmpty: "No pre-orders found",
    ordersEmptyDesc: "Explore weekend markets and reserve fresh dew-picked produce today!",
    ordersActionCancel: "Cancel Order",
    ordersActionModify: "Change Pickup Time",
    ordersActionReview: "Review Stall",
    ordersActionQr: "Pickup QR Code",

    // Common
    preOrder: "Pre-order",
    pickupSlot: "Pickup Time Slot",
    viewDetails: "View Details",
    searchPlaceholder: "Search markets, organic produce, farm stalls...",
    priceUnit: "VND",
    statusActive: "Open",
    statusClosed: "Closed",
    verifiedVietgap: "VietGAP Certified",
    cleanHarvest: "Early Morning Harvest",

    // Customer Dashboard
    dashUserGreeting: "Customer Account",
    dashEditProfileBtn: "Edit Profile",
    dashOrderHistoryBtn: "Order History",
    dashMyReviewsBtn: "My Reviews",
    dashBrowseMoreBtn: "Browse More Produce",
    dashMetricPickup: "Awaiting pickup at market",
    dashMetricCompleted: "Picked up & paid",
    dashMetricSaved: "Saved farms & produce",
    dashMetricFamily: "Family group members",
    dashOrdersUnit: "Orders",
    dashItemsUnit: "Items",
    dashMembersUnit: "Members",
    dashNoMembers: "None yet",
    dashUpcomingTitle: "UPCOMING PRE-ORDERED PRODUCE",
    dashUpcomingPickupDate: "Pickup date:",
    dashUpcomingMorningSlot: "Morning slot",
    dashUpcomingOrderCode: "Order code:",
    dashUpcomingStatus: "Status:",
    dashUpcomingReady: "Ready at stall",
    dashUpcomingHarvesting: "Harvesting & packing",
    dashUpcomingOwner: "Stall owner:",
    dashUpcomingTotal: "Total due:",
    dashUpcomingPayHint: "(Pay at stall upon pickup).",
    dashUpcomingQrBtn: "View QR Pickup Pass",
    dashTabSavedFarms: "Saved Farmer Stalls",
    dashTabFavProducts: "Favorite Produce",
    dashTabFamily: "Family Group",
    dashTabProfile: "Profile & Address",
    dashNoSavedFarms: "No saved farms yet",
    dashNoSavedFarmsDesc: "When you visit a farmer stall you like, bookmark them to track their market schedule.",
    dashDiscoverFarmsBtn: "Discover Farms",
    dashViewStallBtn: "View Stall",
    dashRemoveFavBtn: "Remove",
    dashNoFavProds: "No saved produce items",
    dashNoFavProdsDesc: "Save the seasonal fruits and vegetables you want to pre-order to easily add them to your cart on market days.",
    dashBrowseProdsBtn: "Browse Fresh Produce",
    dashFamilyTitle: "Family Market Group (Shared Account)",
    dashFamilyDesc: "A shared group enabling family members to view pre-orders, receive alerts when fresh produce is ready at the stall, and use pickup QR passes for each other.",
    dashFamilyMembersTitle: "Group Members",
    dashFamilyLeaveBtn: "Leave Group",
    dashFamilyLeaderBadge: "Group Leader",
    dashFamilyNoMembers: "You haven't linked a family account yet.",
    dashFamilyNoMembersHelp: "Send an email invitation or enter an invitation token you received on the right!",
    dashFamilyInviteTitle: "Invite Family Member",
    dashFamilyEmailLabel: "Invitee Email Address:",
    dashFamilySendInviteBtn: "Send Group Invitation",
    dashFamilyTokenTitle: "Have a family invitation code?",
    dashFamilyTokenPlaceholder: "Enter invitation token...",
    dashFamilyJoinBtn: "Join Group",
    dashFamilyPendingTitle: "Pending Invitations",
    dashFamilySentTo: "Sent to:",
    dashFamilyCopyToken: "Copy",
    dashProfileTitle: "Profile Settings & Pickup Address",
    dashProfileDesc: "Manage account information, avatar and default pickup address for market sessions",
    dashProfileOpenModalBtn: "✏️ Edit Profile (Modal)",
    dashProfileMemberBadge: "Verified Customer",
    dashProfileEmailLabel: "Account Email:",
    dashProfilePhoneLabel: "Contact Phone:",
    dashProfileAddressLabel: "Default Pickup/Delivery Address:",
    dashProfileNotProvided: "Not provided",
    dashProfileNoAddress: "No address set",
    dashProfileQuickTitle: "📝 Quick Information Update:",
    dashProfileFullNameLabel: "Your Full Name:",
    dashProfilePhoneHelp: "Contact phone number (for farmers to reach you on harvest day):",
    dashProfileSaveBtn: "Save Profile Changes",
    dashProfileChangeAvatarBtn: "🖼️ Change Avatar (Modal)",
    dashPasswordTitle: "Change Account Password",
    dashPasswordCurrent: "Current Password:",
    dashPasswordNew: "New Password:",
    dashPasswordConfirm: "Confirm New Password:",
    dashPasswordSubmit: "Update Password",
    dashModalEditTitle: "✏️ Edit Profile & Avatar",
    dashModalEditSubtitle: "Update your full name, phone number, address and profile avatar",
    dashModalAvatarLabel: "Profile Picture (Avatar):",
    dashModalAvatarHelp: "Upload portrait photo (JPG, PNG, WebP) or paste image URL directly",
    dashModalFixedEmail: "Account Email (Fixed):",
    dashModalAddressHelp: "This address will be automatically populated when placing market pre-orders.",
    dashModalCancel: "Cancel",
    dashModalSaving: "Saving...",

    // Footer
    footerDesc: "MarketLink is a digital platform connecting local passionate farmers with urban residents, providing healthy produce while preserving traditional farmers' market culture.",
    footerHeadquarters: "Headquarters: TechWiz Building, Hanoi",
    footerHeadCustomer: "For Customers",
    footerLinkFindMarket: "Find Nearby Farmers' Markets",
    footerLinkOrganicVeg: "Seasonal Organic Produce",
    footerLinkHowItWorks: "How to Pre-order & Pick Up at Stall",
    footerLinkStallList: "Directory of Trusted Stalls",
    footerHeadFarmer: "For Farmers",
    footerLinkRegisterStall: "Register Market Stall",
    footerLinkVerification: "Clean Produce Verification",
    footerLinkSupport: "Smallholder Farm Support",
    footerLinkCalendar: "Weekend Market Schedule",
    footerHeadMarkets: "Featured Markets",
    footerCopyright: "© 2026 MarketLink Platform. TechWiz 7 Digital Agriculture Project. All rights reserved.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerContact: "Support Contact",
  },
};

/**
 * Hàm dịch tự động tên sản phẩm sang tiếng Anh nếu đang bật chế độ English
 */
export function localizeProduceName(name, isEn) {
  if (!name || !isEn) return name;

  const dictionary = {
    "Cà Chua Cherry Mộc Châu Ngọt Giòn": "Moc Chau Sweet Cherry Tomatoes",
    "Cà Chua Cherry Mộc Châu": "Moc Chau Cherry Tomatoes",
    "Dâu Tây Hana Đà Lạt Tuyển Chọn": "Da Lat Hana Strawberries",
    "Dâu Tây Mộc Châu Hái Sớm": "Fresh Moc Chau Strawberries",
    "Rau Muống Tiến Vua Sạch": "Crisp Clean Water Spinach",
    "Rau Muống Nước Hữu Cơ Ba Vì": "Ba Vi Organic Water Spinach",
    "Cải Bó Xôi Hữu Cơ Ba Vì": "Ba Vi Organic Baby Spinach",
    "Nấm Hương Rừng Sa Pa Tươi": "Sa Pa Fresh Shiitake Mushrooms",
    "Vải Thiều Thanh Hà Chính Gốc": "Authentic Thanh Ha Lychee",
    "Vải Thiều Lục Ngạn Hái Cành": "Luc Ngan Fresh Branch Lychee",
    "Bưởi Da Xanh Bến Tre Loại 1": "Ben Tre Grade 1 Green Pomelo",
    "Trứng Gà Ta Thả Vườn Đồi Ba Vì": "Ba Vi Free-Range Farm Eggs",
    "Gạo Lúa Tôm Sóc Trăng ST25": "Soc Trang ST25 Shrimp-Rice",
    "Mật Ong Hoa Rừng Tự Nhiên Sa Pa": "Sa Pa Natural Wildflower Honey",
    "Hành Lá & Rau Mùi Thơm Vườn Quê": "Fresh Countryside Scallions & Herbs",
    "Cà chua Cherry": "Cherry Tomatoes",
    "Dưa chuột bao tử": "Baby Cucumbers",
    "Cà rốt tím": "Purple Carrots",
    "Ớt chuông mini": "Mini Bell Peppers",
    "Nấm hương rừng": "Forest Shiitake",
    "Nấm tuyết": "Snow Fungus",
    "Mật ong rừng": "Wild Honey",
    "Thảo quả khô": "Dried Cardamom",
    "Dâu tây Hana": "Hana Strawberries",
    "Bông Atiso tươi": "Fresh Artichoke Flower",
    "Phúc bồn tử": "Raspberries",
    "Xà lách thủy canh": "Hydroponic Lettuce",
    "Nông sản sạch": "Clean Farm Produce",
    "Nông sản mùa vụ": "Seasonal Farm Produce",
  };

  if (dictionary[name]) return dictionary[name];

  let res = name;
  res = res.replace(/Cà Chua Cherry/gi, "Cherry Tomatoes");
  res = res.replace(/Cà chua/gi, "Tomatoes");
  res = res.replace(/Dâu Tây/gi, "Strawberries");
  res = res.replace(/Rau Muống/gi, "Water Spinach");
  res = res.replace(/Cải Bó Xôi/gi, "Baby Spinach");
  res = res.replace(/Cải ngọt/gi, "Choy Sum");
  res = res.replace(/Mồng tơi/gi, "Malabar Spinach");
  res = res.replace(/Nấm Hương/gi, "Shiitake Mushrooms");
  res = res.replace(/Hữu Cơ/gi, "Organic");
  res = res.replace(/Nông Trại/gi, "Farm");
  res = res.replace(/Nhà vườn/gi, "Farm");
  res = res.replace(/Sạp/gi, "Stall");
  res = res.replace(/Phiên Chợ/gi, "Market");
  res = res.replace(/Hội Chợ/gi, "Fair");
  res = res.replace(/Vườn Rau/gi, "Farm Garden");
  return res;
}

/**
 * Hàm dịch danh mục sản phẩm sang tiếng Anh
 */
export function localizeCategoryName(catName, isEn) {
  if (!catName || !isEn) return catName;
  const dict = {
    "Rau Lá Hữu Cơ": "Organic Leafy Greens",
    "Rau ăn lá": "Leafy Greens",
    "Rau": "Greens",
    "Củ & Quả Tươi Sạch": "Fresh Roots & Veggies",
    "Củ & Quả": "Roots & Fruits",
    "Củ": "Roots & Fruits",
    "Trái Cây Bản Địa": "Local Fresh Fruits",
    "Trái Cây": "Fresh Fruits",
    "Trái cây": "Fresh Fruits",
    "Nấm & Thảo Dược": "Mushrooms & Herbs",
    "Nấm & Thảo mộc": "Mushrooms & Herbs",
    "Nấm": "Mushrooms & Herbs",
    "Đặc sản": "Specialties",
    "Nông sản mùa vụ": "Seasonal Farm Produce",
    "Nông Sản Tươi Sạch": "Fresh Farm Produce",
  };
  return dict[catName] || catName;
}

/**
 * Hàm dịch tên chợ sang tiếng Anh
 */
export function localizeMarketName(marketName, isEn) {
  if (!marketName || !isEn) return marketName;
  const dict = {
    "Phiên Chợ Xanh Nông Sản Ba Đình": "Ba Dinh Green Produce Market",
    "Chợ Nông Sản Sạch Cuối Tuần Cầu Giấy": "Cau Giay Weekend Clean Market",
    "Hội Chợ Nông Sản Vùng Miền Tây Hồ": "Tay Ho Regional Produce Fair",
    "Phiên Chợ Hữu Cơ Thảo Điền EcoMarket": "Thao Dien EcoMarket",
    "Chợ Phiên Nông Nghiệp Xanh Ecopark": "Ecopark Green Agricultural Market",
    "Chợ Nông Sản Cần Thơ CUSC": "Can Tho CUSC Farmers' Market",
    "Phiên Chợ Nông Sản": "Farmers' Market",
    "Chợ Tây Hồ": "Tay Ho Market",
    "Chợ Ba Đình": "Ba Dinh Market",
  };
  if (dict[marketName]) return dict[marketName];
  let res = marketName;
  res = res.replace(/Phiên Chợ/gi, "Market");
  res = res.replace(/Chợ Phiên/gi, "Market");
  res = res.replace(/Chợ/gi, "Market");
  res = res.replace(/Hội Chợ/gi, "Fair");
  return res;
}

/**
 * Hàm dịch tên nông trại, sạp sang tiếng Anh
 */
export function localizeStallName(name, isEn) {
  if (!name || !isEn) return name;
  const dict = {
    "Sạp Rau Củ Hữu Cơ Ba Vì": "Ba Vi Organic Veggie Stall",
    "Sạp Cà Chua & Dâu Mộc Châu": "Moc Chau Tomato & Berry Stall",
    "Sạp Nấm & Thảo Dược Tây Bắc": "Northwest Mushroom & Herb Stall",
    "Sạp Trái Cây & Nông Sản Đà Lạt": "Da Lat Fruit & Produce Stall",
    "Nông Trại Hữu Cơ Ba Vì": "Ba Vi Organic Farm",
    "Vườn Rau Sinh Thái Mộc Châu": "Moc Chau Ecological Farm",
    "HTX Dược Liệu & Nấm Sạch Sa Pa": "Sa Pa Clean Herbs & Mushroom Co-op",
    "Hợp Tác Xã Dược Liệu & Nấm Sạch Sa Pa": "Sa Pa Clean Herbs & Mushroom Co-op",
    "Nông Sản Sạch Đà Lạt Farm": "Da Lat Clean Farm Produce",
    "Bác Ba Nông Dân Ba Vì": "Uncle Ba (Ba Vi Farmer)",
    "Cô Mộc Châu Xanh": "Ms. Green Moc Chau",
    "Chị Lan Sa Pa Xanh": "Ms. Lan Green Sa Pa",
    "Anh Tuấn Đà Lạt": "Mr. Tuan Da Lat",
    "Nông Trại Thành Viên": "Member Farm",
    "Sạp Tiêu Chuẩn": "Standard Stall",
    "Sạp nông dân": "Farmer Stall",
    "Nhà vườn hữu cơ": "Organic Farm",
    "Nông dân thành viên": "Member Farmer",
    "Khách Hàng MarketLink": "MarketLink Customer",
  };
  if (dict[name]) return dict[name];
  let res = name;
  res = res.replace(/Nông Trại Hữu Cơ/gi, "Organic Farm");
  res = res.replace(/Nông Trại/gi, "Farm");
  res = res.replace(/Nhà Vườn/gi, "Farm");
  res = res.replace(/Nhà vườn/gi, "Farm");
  res = res.replace(/Sạp/gi, "Stall");
  return res;
}

/**
 * Dịch ngày hoạt động
 */
export function localizeOperatingDays(days, isEn) {
  if (!days || !isEn) return days;
  if (days.includes("Thứ 7 & Chủ Nhật") || days.includes("Thứ Bảy & Chủ Nhật")) {
    return "Sat & Sun";
  }
  if (days.includes("Chủ Nhật hàng tuần")) {
    return "Every Sunday";
  }
  if (days.includes("Thứ 7 hàng tuần")) {
    return "Every Saturday";
  }
  return days;
}

export function localizeUnit(unit, isEn) {
  if (!unit || !isEn) return unit;
  const unitDict = {
    "hộp 500g": "500g pack",
    "hộp": "pack",
    "bó": "bundle",
    "kg": "kg",
    "túi 5kg": "5kg bag",
    "hũ 500ml": "500ml jar",
    "vỉ 10 quả": "pack of 10",
    "trái": "fruit",
    "phần": "portion",
  };
  return unitDict[unit] || unit;
}

export const LanguageContext = createContext({
  language: "vi",
  isEn: false,
  toggleLanguage: () => {},
  setLanguage: () => {},
  t: (key) => key,
  localizeProduceName: (name) => name,
  localizeCategoryName: (name) => name,
  localizeMarketName: (name) => name,
  localizeStallName: (name) => name,
  localizeOperatingDays: (days) => days,
  localizeUnit: (unit) => unit,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      return localStorage.getItem("ml_language") || "vi";
    } catch {
      return "vi";
    }
  });

  const setLanguage = (lang) => {
    const validLang = lang === "en" ? "en" : "vi";
    setLanguageState(validLang);
    try {
      localStorage.setItem("ml_language", validLang);
      document.documentElement.lang = validLang;
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const isEn = language === "en";

  const t = useMemo(() => {
    return (key, fallback = "") => {
      const dict = translations[language] || translations.vi;
      return dict[key] !== undefined ? dict[key] : (fallback || key);
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      isEn,
      toggleLanguage,
      setLanguage,
      t,
      localizeProduceName: (name) => localizeProduceName(name, isEn),
      localizeCategoryName: (name) => localizeCategoryName(name, isEn),
      localizeMarketName: (name) => localizeMarketName(name, isEn),
      localizeStallName: (name) => localizeStallName(name, isEn),
      localizeOperatingDays: (days) => localizeOperatingDays(days, isEn),
      localizeUnit: (unit) => localizeUnit(unit, isEn),
    }),
    [language, isEn, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;

