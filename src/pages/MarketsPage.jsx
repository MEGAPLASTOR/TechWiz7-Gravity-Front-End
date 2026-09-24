import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Store, ChevronRight } from 'lucide-react';
import { MarketMap } from '@/components/market/MarketMap';
import { marketsApi } from '@/api/markets.api';

export const MarketsPage = ({ onSelectMarketForShop = () => {} }) => {
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [marketFarmers, setMarketFarmers] = useState([]);
  const [pickupSlots, setPickupSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarkets() {
      try {
        const list = await marketsApi.getAllMarkets();
        const validList = Array.isArray(list) ? list : [];
        setMarkets(validList);
        if (validList.length > 0) {
          handleSelectMarket(validList[0]);
        }
      } catch (err) {
        console.error('Error loading markets from API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMarkets();
  }, []);

  const handleSelectMarket = async (market) => {
    setSelectedMarket(market);
    try {
      const [farmersRes, slotsRes] = await Promise.allSettled([
        marketsApi.getMarketFarmers(market.marketId),
        marketsApi.getMarketPickupSlots(market.marketId),
      ]);
      if (farmersRes.status === 'fulfilled') {
        const fList = Array.isArray(farmersRes.value) ? farmersRes.value : farmersRes.value?.data || [];
        setMarketFarmers(fList);
      }
      if (slotsRes.status === 'fulfilled') {
        const sList = Array.isArray(slotsRes.value) ? slotsRes.value : slotsRes.value?.data || [];
        setPickupSlots(sList);
      }
    } catch (e) {
      console.error('Failed to load market farmers/slots:', e);
    }
  };

  const getDayName = (dayOfWeek) => {
    switch (dayOfWeek) {
      case 1: return 'Chủ Nhật';
      case 2: return 'Thứ Hai';
      case 3: return 'Thứ Ba';
      case 4: return 'Thứ Tư';
      case 5: return 'Thứ Năm';
      case 6: return 'Thứ Sáu';
      case 7: return 'Thứ Bảy';
      default: return `Thứ ${dayOfWeek}`;
    }
  };

  return (
    <div className="container markets-container">
      <div className="markets-header">
        <div className="markets-tag">
          Định vị Geolocation & Chợ Phiên
        </div>
        <h1 className="markets-title">
          Danh Sách Chợ Nông Sản Địa Phương ({markets.length})
        </h1>
        <p className="markets-desc">
          Mạng lưới các điểm chợ phiên hoạt động vào cuối tuần tại Hà Nội và TP.HCM, kết nối người tiêu dùng đô thị với nông trại hữu cơ.
        </p>
      </div>

      <div className="markets-layout-grid">
        <div className="markets-list-col">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Các Điểm Chợ Trên Hệ Thống
          </h3>

          {markets.map((m) => {
            const isSelected = selectedMarket?.marketId === m.marketId;
            return (
              <div
                key={m.marketId}
                onClick={() => handleSelectMarket(m)}
                className={`market-item-card ${isSelected ? 'selected' : ''}`}
              >
                <div className="market-item-header">
                  <h4 className="market-item-title">
                    {m.name}
                  </h4>
                  <span className={`market-status-pill ${m.status === 'ACTIVE' ? 'market-status-active' : 'market-status-inactive'}`}>
                    {m.status === 'ACTIVE' ? 'Đang Mở Sạp' : 'Tạm Dừng'}
                  </span>
                </div>

                <div className="market-info-line">
                  <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <span>{m.address}</span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '14px' }}>
                  {m.description || 'Không gian chợ phiên giao lưu nông sản sạch gia đình'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
                    GPS: {m.latitude?.toFixed(4)}, {m.longitude?.toFixed(4)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 700 }}>
                    <span>Chi tiết</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <MarketMap
            markets={markets}
            selectedMarket={selectedMarket}
            onSelectMarket={handleSelectMarket}
            height="360px"
          />

          {selectedMarket && (
            <div className="market-detail-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                <Store size={18} />
                <span>Thông tin điểm chợ đã chọn</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                {selectedMarket.name}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                📍 {selectedMarket.address}
              </p>

              {selectedMarket.schedules && selectedMarket.schedules.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                    Lịch Hoạt Động Định Kỳ
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedMarket.schedules.map((sc) => (
                      <div key={sc.scheduleId} className="market-schedule-pill">
                        <Calendar size={14} />
                        <span>{getDayName(sc.dayOfWeek)}: {sc.openTime} - {sc.closeTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                  Sạp Nông Dân Bán Tại Chợ Này ({marketFarmers.length})
                </h4>
                {marketFarmers.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Hiện chưa có sạp nông dân nào đăng ký cho điểm chợ này trên máy chủ.
                  </p>
                ) : (
                  <div className="market-farmers-grid">
                    {marketFarmers.map((f, idx) => (
                      <div key={idx} className="market-farmer-card">
                        <Store size={14} color="var(--primary)" />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {f.stallName || f.farmerName}
                        </span>
                        {f.stallNumber && (
                          <span style={{ fontSize: '10px', background: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: '4px' }}>
                            {f.stallNumber}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                  Khung Giờ Đón Khách (Pickup Slots từ API: {pickupSlots.length})
                </h4>
                {pickupSlots.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    Điểm chợ này hiện chưa có khung giờ đón khách nào được cấu hình trên máy chủ.
                  </p>
                ) : (
                  <div className="market-slots-grid">
                    {pickupSlots.map((slot) => (
                      <div key={slot.slotId} className="market-slot-item">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Clock size={14} />
                          <span>{slot.timeRange}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Tối đa {slot.maxOrdersCapacity} đơn
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
