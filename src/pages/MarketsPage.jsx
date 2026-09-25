import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MapPin, Calendar, Clock, Store, ChevronRight, Search,
  Navigation, Layers, Users, Zap, Filter, RefreshCw,
  CheckCircle2, AlertCircle, ArrowRight, Globe
} from 'lucide-react';
import { MarketMap } from '@/components/market/MarketMap';
import { marketsApi } from '@/services';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const DAY_LABELS = {
  1: { short: 'T2', full: 'Thứ Hai' },
  2: { short: 'T3', full: 'Thứ Ba' },
  3: { short: 'T4', full: 'Thứ Tư' },
  4: { short: 'T5', full: 'Thứ Năm' },
  5: { short: 'T6', full: 'Thứ Sáu' },
  6: { short: 'T7', full: 'Thứ Bảy' },
  7: { short: 'CN', full: 'Chủ Nhật' },
};

const formatTime = (t) => {
  if (!t) return '';
  if (typeof t === 'string') return t.slice(0, 5);
  if (typeof t === 'object' && t.hour !== undefined) {
    return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`;
  }
  return '';
};

const getTodayDayOfWeek = () => {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 7 : d;      // map to API: 1=Mon, 7=Sun
};

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div style={{
    padding: '22px', borderRadius: '16px',
    background: 'linear-gradient(160deg, #151d2a 0%, #111722 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
    animation: 'pulse 1.5s ease-in-out infinite',
  }}>
    <div style={{ height: '18px', background: '#1e2d3d', borderRadius: '6px', marginBottom: '10px', width: '70%' }} />
    <div style={{ height: '13px', background: '#1a2535', borderRadius: '4px', marginBottom: '8px', width: '90%' }} />
    <div style={{ height: '13px', background: '#1a2535', borderRadius: '4px', width: '60%' }} />
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────────────── */
export const MarketsPage = ({ onSelectMarketForShop = () => {} }) => {
  const [markets, setMarkets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [marketDetail, setMarketDetail] = useState(null); // full detail from /markets/{id}
  const [marketFarmers, setMarketFarmers] = useState([]);
  const [pickupSlots, setPickupSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(null); // null = all
  const [searchQuery, setSearchQuery] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [geofenceResult, setGeofenceResult] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [tab, setTab] = useState('info'); // info | farmers | slots
  const inputRef = useRef(null);

  /* ── Load all markets ───────────────────────────────────────────────────── */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await marketsApi.getAllMarkets();
        const valid = Array.isArray(list) ? list : [];
        setMarkets(valid);
        setFiltered(valid);
        if (valid.length > 0) selectMarket(valid[0]);
      } catch (err) {
        console.error('Failed to load markets:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ── Filter logic ───────────────────────────────────────────────────────── */
  useEffect(() => {
    let result = markets;
    if (activeDay !== null) {
      result = result.filter(m =>
        m.schedules?.some(s => s.dayOfWeek === activeDay)
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.address?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [markets, activeDay, searchQuery]);

  /* ── Select a market & load detail ─────────────────────────────────────── */
  const selectMarket = useCallback(async (market) => {
    setSelectedMarket(market);
    setMarketDetail(null);
    setMarketFarmers([]);
    setPickupSlots([]);
    setRouteInfo(null);
    setGeofenceResult(null);
    setTab('info');
    setDetailLoading(true);
    try {
      const [detailRes, farmersRes, slotsRes] = await Promise.allSettled([
        marketsApi.getMarketById(market.marketId),
        marketsApi.getMarketFarmers(market.marketId),
        marketsApi.getMarketPickupSlots(market.marketId),
      ]);
      if (detailRes.status === 'fulfilled') {
        const d = detailRes.value;
        setMarketDetail(d?.data || d);
      }
      if (farmersRes.status === 'fulfilled') {
        const f = farmersRes.value;
        setMarketFarmers(Array.isArray(f) ? f : (f?.data || []));
      }
      if (slotsRes.status === 'fulfilled') {
        const s = slotsRes.value;
        setPickupSlots(Array.isArray(s) ? s : (s?.data || []));
      }
    } catch (e) {
      console.error('Failed to load market detail:', e);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  /* ── Get user GPS & find route ──────────────────────────────────────────── */
  const handleGetRoute = () => {
    if (!selectedMarket) return;
    setRouteLoading(true);
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
        try {
          const route = await marketsApi.getNearestRoute({
            latitude, longitude,
            marketId: selectedMarket.marketId,
          });
          setRouteInfo(route?.data || route);
        } catch (err) {
          console.error('Route error:', err);
        } finally {
          setRouteLoading(false);
        }
      },
      () => {
        setRouteLoading(false);
        alert('Không thể lấy vị trí GPS của bạn. Vui lòng cho phép truy cập vị trí.');
      }
    );
  };

  /* ── Geofence check ─────────────────────────────────────────────────────── */
  const handleGeofenceCheck = () => {
    if (!selectedMarket) return;
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          const result = await marketsApi.simulateGeofence({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            targetMarketId: selectedMarket.marketId,
          });
          setGeofenceResult(result?.data || result);
        } catch (err) {
          console.error('Geofence error:', err);
        }
      },
      () => alert('Cần quyền GPS để kiểm tra Geofencing.')
    );
  };

  /* ── Refresh detail ─────────────────────────────────────────────────────── */
  const handleRefresh = () => {
    if (selectedMarket) selectMarket(selectedMarket);
  };

  const todayDay = getTodayDayOfWeek();
  const detail = marketDetail || selectedMarket;

  /* ─────────────────────────────────────────────────────────────────────────── */
  return (
    <div className="markets-page-root">

      {/* ── PAGE HEADER ── */}
      <div className="mkp-header">
        <div className="mkp-header-text">
          <span className="mkp-eyebrow">
            <Globe size={13} /> Geolocation &amp; Bản Đồ Chợ Phiên
          </span>
          <h1 className="mkp-title">
            Khám Phá Chợ Nông Sản
          </h1>
          <p className="mkp-subtitle">
            {markets.length} điểm chợ phiên hoạt động định kỳ — kết nối người tiêu dùng đô thị với nông trại hữu cơ VietGAP
          </p>
        </div>

        {/* Search */}
        <div className="mkp-search-bar" ref={inputRef}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Tìm chợ theo tên hoặc địa chỉ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="mkp-search-input"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>✕</button>
          )}
        </div>
      </div>

      {/* ── DAY FILTER TABS ── */}
      <div className="mkp-day-tabs">
        <button
          className={`mkp-day-tab ${activeDay === null ? 'active' : ''}`}
          onClick={() => setActiveDay(null)}
        >
          <Filter size={13} /> Tất cả
        </button>
        {[1,2,3,4,5,6,7].map(d => (
          <button
            key={d}
            className={`mkp-day-tab ${activeDay === d ? 'active' : ''} ${d === todayDay ? 'today' : ''}`}
            onClick={() => setActiveDay(activeDay === d ? null : d)}
          >
            {d === todayDay && <span className="mkp-today-dot" />}
            {DAY_LABELS[d].short}
          </button>
        ))}
        {activeDay !== null && filtered.length === 0 && (
          <span className="mkp-no-result-hint">Không có chợ họp ngày này</span>
        )}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="mkp-main-grid">

        {/* LEFT: Market list */}
        <aside className="mkp-list-col">
          <div className="mkp-list-header">
            <span>{filtered.length} điểm chợ</span>
            {loading && <span className="mkp-spinning"><RefreshCw size={13} /></span>}
          </div>

          <div className="mkp-list-scroll">
            {loading && markets.length === 0
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.map((m) => {
                  const isSelected = selectedMarket?.marketId === m.marketId;
                  const todaySchedule = m.schedules?.find(s => s.dayOfWeek === todayDay);
                  return (
                    <div
                      key={m.marketId}
                      onClick={() => selectMarket(m)}
                      className={`mkp-market-card ${isSelected ? 'selected' : ''}`}
                    >
                      {/* Image strip or gradient */}
                      {m.imageUrl ? (
                        <div className="mkp-card-img">
                          <img src={m.imageUrl} alt={m.name} loading="lazy" />
                          <div className="mkp-card-img-overlay" />
                        </div>
                      ) : (
                        <div className="mkp-card-img mkp-card-img-placeholder">
                          <Store size={24} color="#34d399" />
                        </div>
                      )}

                      <div className="mkp-card-body">
                        <div className="mkp-card-top">
                          <h4 className="mkp-card-name">{m.name}</h4>
                          <span className={`mkp-status-dot ${m.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                            {m.status === 'ACTIVE' ? 'Đang mở' : 'Tạm dừng'}
                          </span>
                        </div>

                        <p className="mkp-card-address">
                          <MapPin size={12} /> {m.address}
                        </p>

                        {/* Today schedule highlight */}
                        {todaySchedule ? (
                          <div className="mkp-card-today">
                            <CheckCircle2 size={12} color="#34d399" />
                            <span>Hôm nay: {formatTime(todaySchedule.openTime)} – {formatTime(todaySchedule.closeTime)}</span>
                          </div>
                        ) : m.schedules?.length > 0 ? (
                          <div className="mkp-card-schedule-dots">
                            {m.schedules.slice(0, 4).map(s => (
                              <span key={s.scheduleId || s.dayOfWeek} className={`mkp-dot ${s.dayOfWeek === todayDay ? 'today' : ''}`}>
                                {DAY_LABELS[s.dayOfWeek]?.short}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {isSelected && (
                          <div className="mkp-card-selected-cta">
                            <ArrowRight size={13} /> Đang xem chi tiết
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </aside>

        {/* RIGHT: Map + Detail */}
        <div className="mkp-right-col">

          {/* MAP */}
          <div className="mkp-map-wrapper">
            <MarketMap
              markets={filtered.length ? filtered : markets}
              selectedMarket={selectedMarket}
              onSelectMarket={selectMarket}
              height={typeof window !== 'undefined' && window.innerWidth <= 768 ? '280px' : '420px'}
            />

            {/* GPS action buttons overlay */}
            <div className="mkp-map-actions">
              <button
                className="mkp-map-btn"
                onClick={handleGetRoute}
                disabled={!selectedMarket || routeLoading}
                title="Tìm đường đến chợ này"
              >
                {routeLoading
                  ? <span className="mkp-spinning"><RefreshCw size={14} /></span>
                  : <Navigation size={14} />}
                <span>Tìm Đường</span>
              </button>
              <button
                className="mkp-map-btn mkp-map-btn-geo"
                onClick={handleGeofenceCheck}
                disabled={!selectedMarket}
                title="Kiểm tra bạn có đang trong vùng chợ không"
              >
                <Zap size={14} />
                <span>Geofence</span>
              </button>
            </div>
          </div>

          {/* Route info */}
          {routeInfo && (
            <div className="mkp-route-bar">
              <Navigation size={15} color="#34d399" />
              <span className="mkp-route-label">{routeInfo.marketName}</span>
              <div className="mkp-route-stats">
                <span>📍 {routeInfo.distanceKm?.toFixed(1) || '—'} km</span>
                <span>⏱ {routeInfo.durationMinutes ? `${Math.ceil(routeInfo.durationMinutes)} phút` : '—'}</span>
              </div>
            </div>
          )}

          {/* Geofence result */}
          {geofenceResult && (
            <div className={`mkp-geofence-bar ${geofenceResult.inGeofence ? 'in' : 'out'}`}>
              {geofenceResult.inGeofence
                ? <CheckCircle2 size={16} color="#34d399" />
                : <AlertCircle size={16} color="#f87171" />}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {geofenceResult.inGeofence ? '✅ Bạn đang trong vùng chợ!' : '🔴 Bạn chưa vào vùng chợ'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                  {geofenceResult.alertMessage || `Khoảng cách: ${geofenceResult.distanceMeters?.toFixed(0)}m`}
                </div>
              </div>
            </div>
          )}

          {/* ── DETAIL PANEL ── */}
          {selectedMarket && (
            <div className="mkp-detail-panel">

              {/* Detail header */}
              <div className="mkp-detail-head">
                <div>
                  <div className="mkp-detail-eyebrow">
                    <Store size={14} /> Thông tin điểm chợ
                  </div>
                  <h2 className="mkp-detail-name">
                    {detail?.name || selectedMarket.name}
                  </h2>
                  <p className="mkp-detail-addr">
                    <MapPin size={13} /> {detail?.address || selectedMarket.address}
                  </p>
                </div>
                <button className="mkp-refresh-btn" onClick={handleRefresh} title="Tải lại">
                  <RefreshCw size={14} className={detailLoading ? 'mkp-spinning' : ''} />
                </button>
              </div>

              {detail?.description && (
                <p className="mkp-detail-desc">{detail.description}</p>
              )}

              {/* Stats row */}
              <div className="mkp-stats-row">
                <div className="mkp-stat">
                  <Store size={16} color="#34d399" />
                  <div>
                    <div className="mkp-stat-val">
                      {detailLoading ? '—' : (detail?.activeFarmersCount ?? marketFarmers.length)}
                    </div>
                    <div className="mkp-stat-label">Sạp nông dân</div>
                  </div>
                </div>
                <div className="mkp-stat">
                  <Clock size={16} color="#fbbf24" />
                  <div>
                    <div className="mkp-stat-val">
                      {detailLoading ? '—' : pickupSlots.length}
                    </div>
                    <div className="mkp-stat-label">Ca nhận hàng</div>
                  </div>
                </div>
                <div className="mkp-stat">
                  <Calendar size={16} color="#818cf8" />
                  <div>
                    <div className="mkp-stat-val">
                      {(detail?.schedules || selectedMarket.schedules)?.length ?? '—'}
                    </div>
                    <div className="mkp-stat-label">Ngày họp/tuần</div>
                  </div>
                </div>
                <div className="mkp-stat">
                  <Layers size={16} color="#f472b6" />
                  <div>
                    <div className="mkp-stat-val" style={{
                      color: selectedMarket.status === 'ACTIVE' ? '#34d399' : '#f87171',
                      fontSize: '0.78rem', fontWeight: 700,
                    }}>
                      {selectedMarket.status === 'ACTIVE' ? 'Đang mở' : 'Tạm dừng'}
                    </div>
                    <div className="mkp-stat-label">Trạng thái</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mkp-tabs">
                {[
                  { id: 'info', label: 'Lịch Hoạt Động', icon: Calendar },
                  { id: 'farmers', label: `Sạp (${marketFarmers.length})`, icon: Users },
                  { id: 'slots', label: `Ca Nhận (${pickupSlots.length})`, icon: Clock },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`mkp-tab ${tab === t.id ? 'active' : ''}`}
                  >
                    <t.icon size={13} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="mkp-tab-content">
                {detailLoading ? (
                  <div className="mkp-loading-row">
                    <span className="mkp-spinning"><RefreshCw size={16} /></span>
                    <span>Đang tải dữ liệu...</span>
                  </div>
                ) : (
                  <>
                    {/* INFO TAB */}
                    {tab === 'info' && (
                      <div>
                        {(detail?.schedules || selectedMarket.schedules)?.length > 0 ? (
                          <div className="mkp-schedule-grid">
                            {(detail?.schedules || selectedMarket.schedules).map((sc, i) => {
                              const isToday = sc.dayOfWeek === todayDay;
                              return (
                                <div key={sc.scheduleId || i} className={`mkp-schedule-item ${isToday ? 'today' : ''}`}>
                                  <div className="mkp-schedule-day">
                                    {DAY_LABELS[sc.dayOfWeek]?.full}
                                    {isToday && <span className="mkp-today-badge">Hôm nay</span>}
                                  </div>
                                  <div className="mkp-schedule-time">
                                    {formatTime(sc.openTime)} – {formatTime(sc.closeTime)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="mkp-empty">Chưa có lịch họp chợ nào được cấu hình.</p>
                        )}
                      </div>
                    )}

                    {/* FARMERS TAB */}
                    {tab === 'farmers' && (
                      <div>
                        {marketFarmers.length === 0 ? (
                          <p className="mkp-empty">Chưa có sạp nông dân nào đăng ký tại điểm chợ này.</p>
                        ) : (
                          <div className="mkp-farmers-grid">
                            {marketFarmers.map((f, idx) => (
                              <div key={f.farmerId || idx} className="mkp-farmer-item">
                                <div className="mkp-farmer-avatar">
                                  {f.avatarUrl
                                    ? <img src={f.avatarUrl} alt={f.farmerName} />
                                    : <Store size={16} color="#34d399" />}
                                </div>
                                <div>
                                  <div className="mkp-farmer-name">{f.stallName || f.farmerName}</div>
                                  {f.stallNumber && (
                                    <div className="mkp-farmer-stall">Sạp {f.stallNumber}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SLOTS TAB */}
                    {tab === 'slots' && (
                      <div>
                        {pickupSlots.length === 0 ? (
                          <p className="mkp-empty">Chưa có khung giờ nhận hàng nào được thiết lập.</p>
                        ) : (
                          <div className="mkp-slots-grid">
                            {pickupSlots.map((slot) => (
                              <div key={slot.slotId} className="mkp-slot-card">
                                <Clock size={14} color="#fbbf24" />
                                <div className="mkp-slot-time">
                                  {slot.slotTimeRange || slot.timeRange || `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`}
                                </div>
                                {slot.maxOrdersCapacity && (
                                  <div className="mkp-slot-cap">Tối đa {slot.maxOrdersCapacity} đơn</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => onSelectMarketForShop(selectedMarket)}
                className="mkp-cta-btn"
              >
                <Store size={16} />
                <span>Mua Sắm &amp; Đặt Trước Nông Sản Tại Chợ Này</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;
