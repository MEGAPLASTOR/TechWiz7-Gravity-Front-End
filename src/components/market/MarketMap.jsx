import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { MapPin, Layers, Globe, Navigation, Compass, ExternalLink, X, RefreshCw, AlertCircle } from 'lucide-react';
import { APP_CONFIG } from '@/constants/appConfig';
import { marketsApi } from '@/services/markets.service';

// Google Maps Tile configurations
const MAP_LAYERS = {
  satellite: {
    name: 'Vệ Tinh Google',
    url: 'https://{s}.google.com/vt/lyrs=y&hl=vi&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps Vệ Tinh',
  },
  streets: {
    name: 'Bản Đồ Phố',
    url: 'https://{s}.google.com/vt/lyrs=m&hl=vi&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps',
  },
  terrain: {
    name: 'Địa Hình',
    url: 'https://{s}.google.com/vt/lyrs=p&hl=vi&x={x}&y={y}&z={z}',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps',
  },
};

export const MarketMap = ({
  markets = [],
  selectedMarket = null,
  onSelectMarket = () => {},
  height = '420px',
  routeInfo = null,
  userLocation = null,
  onGetRoute = null,
  onClearRoute = null,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routeGroupRef = useRef(null);
  const tileLayerRef = useRef(null);

  const onSelectMarketRef = useRef(onSelectMarket);
  onSelectMarketRef.current = onSelectMarket;

  const onGetRouteRef = useRef(onGetRoute);
  onGetRouteRef.current = onGetRoute;

  const [activeLayer, setActiveLayer] = useState('satellite');
  const [internalRoute, setInternalRoute] = useState(null);
  const [internalUserLoc, setInternalUserLoc] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const [routingError, setRoutingError] = useState(null);

  // Active route is either passed as prop or fetched internally
  const currentRoute = routeInfo || internalRoute;
  const currentUserLoc = userLocation || internalUserLoc;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = selectedMarket?.latitude && selectedMarket?.longitude
        ? [selectedMarket.latitude, selectedMarket.longitude]
        : APP_CONFIG.DEFAULT_CENTER;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: APP_CONFIG.DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: false,
      });

      // Add Zoom Control at top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      // Add initial tile layer (Satellite Hybrid)
      const layerConfig = MAP_LAYERS.satellite;
      const tileLayer = L.tileLayer(layerConfig.url, {
        maxZoom: layerConfig.maxZoom,
        subdomains: layerConfig.subdomains,
        attribution: layerConfig.attribution,
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      markersGroupRef.current = L.featureGroup().addTo(map);
      routeGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Layer switching (Satellite vs Streets vs Terrain)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const map = mapInstanceRef.current;
    const config = MAP_LAYERS[activeLayer];

    map.removeLayer(tileLayerRef.current);
    const newTileLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: config.subdomains,
      attribution: config.attribution,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [activeLayer]);

  // Route Fetcher function (called from popup or map action)
  const fetchRouteToMarket = useCallback(async (market) => {
    if (!market || !market.latitude || !market.longitude) return;
    setRoutingLoading(true);
    setRoutingError(null);

    // Call external handler if parent provided one
    if (typeof onGetRouteRef.current === 'function') {
      try {
        await onGetRouteRef.current(market);
      } catch (e) {
        console.error('External getRoute error:', e);
      } finally {
        setRoutingLoading(false);
      }
      return;
    }

    // Otherwise handle internally via navigator.geolocation & marketsApi
    if (!navigator.geolocation) {
      setRoutingError('Trình duyệt không hỗ trợ Geolocation GPS.');
      setRoutingLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setInternalUserLoc({ latitude, longitude });

        try {
          const res = await marketsApi.getNearestRoute({
            latitude,
            longitude,
            marketId: market.marketId,
          });
          const data = res?.data || res;
          setInternalRoute({
            ...data,
            targetMarket: market,
            userLocation: { latitude, longitude },
          });
        } catch (err) {
          console.error('Routing API error:', err);
          setRoutingError('Không thể lấy lộ trình OSRM. Bạn có thể mở Google Maps dẫn đường bên dưới.');
        } finally {
          setRoutingLoading(false);
        }
      },
      (geoErr) => {
        console.warn('Geolocation denied or failed:', geoErr);
        setRoutingLoading(false);
        setRoutingError('Không thể lấy vị trí GPS hiện tại. Vui lòng cho phép quyền truy cập vị trí trên thiết bị.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  // Update Route Polyline & User Marker Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !routeGroupRef.current) return;
    const map = mapInstanceRef.current;
    const routeGroup = routeGroupRef.current;

    // Clear previous route layers
    routeGroup.clearLayers();

    if (!currentRoute) return;

    // Normalize coordinates & geometry
    const geometry = currentRoute.routeGeometry || currentRoute.geometry || [];
    const originLat = currentRoute.originLatitude ?? currentUserLoc?.latitude;
    const originLng = currentRoute.originLongitude ?? currentUserLoc?.longitude;
    const destLat = currentRoute.marketLatitude ?? selectedMarket?.latitude;
    const destLng = currentRoute.marketLongitude ?? selectedMarket?.longitude;

    // Draw Polyline if geometry has points
    let polylineCoords = [];
    if (Array.isArray(geometry) && geometry.length >= 2) {
      polylineCoords = geometry;
    } else if (originLat && originLng && destLat && destLng) {
      // Straight-line fallback if OSRM geometry is empty
      polylineCoords = [
        [originLat, originLng],
        [destLat, destLng],
      ];
    }

    if (polylineCoords.length >= 2) {
      // Glowing outer shadow line
      const glowLine = L.polyline(polylineCoords, {
        color: '#0284c7',
        weight: 9,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Neon cyan foreground route line
      const mainLine = L.polyline(polylineCoords, {
        color: '#38bdf8',
        weight: 4.5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '10, 6',
      });

      routeGroup.addLayer(glowLine);
      routeGroup.addLayer(mainLine);
    }

    // Add User GPS Beacon Marker
    if (originLat && originLng) {
      const userIcon = L.divIcon({
        className: 'custom-user-gps-beacon',
        html: `
          <div style="
            position: relative;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              position: absolute;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: rgba(14, 165, 233, 0.28);
              border: 1.5px solid rgba(56, 189, 248, 0.6);
              animation: userGpsPulse 2s infinite ease-out;
            "></div>
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #0ea5e9;
              border: 3px solid #ffffff;
              box-shadow: 0 0 14px rgba(14, 165, 233, 0.9);
            "></div>
            <div style="
              position: absolute;
              bottom: -22px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(15, 23, 42, 0.95);
              backdrop-filter: blur(8px);
              color: #38bdf8;
              font-size: 11px;
              font-weight: 800;
              padding: 2px 8px;
              border-radius: 999px;
              white-space: nowrap;
              border: 1px solid #0284c7;
              box-shadow: 0 4px 10px rgba(0,0,0,0.6);
            ">
              Vị trí của bạn
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const userMarker = L.marker([originLat, originLng], {
        icon: userIcon,
        zIndexOffset: 1500,
      });

      userMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; font-weight: 700; color: #38bdf8; padding: 4px;">
          📍 Điểm xuất phát của bạn
        </div>
      `);

      routeGroup.addLayer(userMarker);
    }

    // Auto-fit bounds to include both user and route
    try {
      const bounds = routeGroup.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.22), { animate: true, duration: 0.8 });
      }
    } catch (e) {
      console.warn('Could not fit route bounds:', e);
    }
  }, [currentRoute, currentUserLoc, selectedMarket]);

  // Update Market Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear existing markers
    markersGroup.clearLayers();

    // Create marker icon
    const createCustomIcon = (market, isSelected) => {
      const pinColor = isSelected ? '#ea580c' : '#10b981';
      const shadowColor = isSelected ? 'rgba(234, 88, 12, 0.6)' : 'rgba(16, 185, 129, 0.6)';
      const size = isSelected ? 46 : 38;

      return L.divIcon({
        className: 'custom-satellite-pin',
        html: `
          <div style="
            position: relative;
            cursor: pointer;
            transform: translate(-50%, -100%);
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            filter: drop-shadow(0 8px 16px ${shadowColor});
          ">
            <!-- Pulsing ring if selected -->
            ${isSelected ? `
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 60px;
                height: 60px;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                border: 2px solid #ea580c;
                animation: mapPulse 2s infinite ease-out;
                pointer-events: none;
              "></div>
            ` : ''}

            <!-- Pin Head -->
            <div style="
              width: ${size}px;
              height: ${size}px;
              border-radius: 50% 50% 50% 0;
              background: linear-gradient(135deg, ${pinColor}, ${isSelected ? '#c2410c' : '#059669'});
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 14px rgba(0,0,0,0.6);
            ">
              <span style="
                transform: rotate(45deg);
                font-size: ${isSelected ? '20px' : '16px'};
              ">🛒</span>
            </div>

            <!-- Name Tag Below Pin -->
            <div style="
              position: absolute;
              bottom: -22px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(15, 23, 42, 0.94);
              backdrop-filter: blur(8px);
              padding: 3px 10px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 700;
              color: #ffffff;
              white-space: nowrap;
              border: 1px solid ${isSelected ? '#f97316' : 'rgba(52, 211, 153, 0.6)'};
              box-shadow: 0 4px 12px rgba(0,0,0,0.7);
              letter-spacing: 0.2px;
            ">
              ${market.name || 'Điểm Chợ'}
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });
    };

    if (markets.length > 0) {
      markets.forEach((m) => {
        if (!m.latitude || !m.longitude) return;

        const isSelected = selectedMarket?.marketId === m.marketId;
        const marker = L.marker([m.latitude, m.longitude], {
          icon: createCustomIcon(m, isSelected),
          zIndexOffset: isSelected ? 1000 : 100,
        });

        // Popup with modern dark card design & Route Button
        const popupContent = document.createElement('div');
        popupContent.style.fontFamily = 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)';
        popupContent.style.padding = '8px 4px';
        popupContent.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #10b981;
              box-shadow: 0 0 8px #10b981;
            "></span>
            <div style="font-weight: 800; font-size: 15px; color: #34d399; line-height: 1.2;">
              ${m.name}
            </div>
          </div>
          <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 6px; line-height: 1.4; display: flex; align-items: flex-start; gap: 4px;">
            <span>📍</span>
            <span>${m.address}</span>
          </div>
          ${m.description ? `
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px; line-height: 1.4; background: rgba(255,255,255,0.04); padding: 6px 8px; border-radius: 6px;">
              ${m.description}
            </div>
          ` : ''}

          <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
            <button id="btn-route-map-${m.marketId}" style="
              width: 100%;
              background: linear-gradient(135deg, #0ea5e9, #0284c7);
              color: #ffffff;
              font-size: 12px;
              font-weight: 700;
              padding: 9px 12px;
              border-radius: 8px;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              box-shadow: 0 4px 14px rgba(14, 165, 233, 0.4);
              transition: all 0.2s;
            ">
              <span>🧭 Chỉ đường tới chợ này</span>
            </button>

            <button id="btn-select-map-${m.marketId}" style="
              width: 100%;
              background: linear-gradient(135deg, #10b981, #059669);
              color: #ffffff;
              font-size: 12px;
              font-weight: 700;
              padding: 9px 12px;
              border-radius: 8px;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
              transition: all 0.2s;
            ">
              <span>✨ Xem chi tiết sạp hàng</span>
            </button>
          </div>
        `;

        popupContent.querySelector(`#btn-select-map-${m.marketId}`)?.addEventListener('click', () => {
          onSelectMarketRef.current?.(m);
        });

        popupContent.querySelector(`#btn-route-map-${m.marketId}`)?.addEventListener('click', () => {
          onSelectMarketRef.current?.(m);
          fetchRouteToMarket(m);
        });

        marker.bindPopup(popupContent, { maxWidth: 280 });
        marker.on('click', () => {
          onSelectMarketRef.current?.(m);
        });

        markersGroup.addLayer(marker);
      });

      // Fit bounds if markers exist and no single market selected and no active route
      if (!currentRoute) {
        if (!selectedMarket && markets.length > 1) {
          try {
            map.fitBounds(markersGroup.getBounds().pad(0.25));
          } catch {
            // ignore
          }
        } else if (selectedMarket?.latitude && selectedMarket?.longitude) {
          map.setView([selectedMarket.latitude, selectedMarket.longitude], 15, { animate: true });
        }
      }
    }
  }, [markets, selectedMarket, currentRoute, fetchRouteToMarket]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    if (markersGroupRef.current && markersGroupRef.current.getLayers().length > 0) {
      mapInstanceRef.current.fitBounds(markersGroupRef.current.getBounds().pad(0.25));
    } else {
      mapInstanceRef.current.setView(APP_CONFIG.DEFAULT_CENTER, APP_CONFIG.DEFAULT_ZOOM);
    }
  };

  const handleClearRoute = () => {
    setInternalRoute(null);
    setInternalUserLoc(null);
    setRoutingError(null);
    if (routeGroupRef.current) {
      routeGroupRef.current.clearLayers();
    }
    if (typeof onClearRoute === 'function') {
      onClearRoute();
    }
    handleResetView();
  };

  // Google Maps fallback navigation URL
  const destinationCoords = selectedMarket?.latitude && selectedMarket?.longitude
    ? `${selectedMarket.latitude},${selectedMarket.longitude}`
    : currentRoute?.marketLatitude && currentRoute?.marketLongitude
    ? `${currentRoute.marketLatitude},${currentRoute.marketLongitude}`
    : '';

  const originCoords = currentUserLoc?.latitude && currentUserLoc?.longitude
    ? `${currentUserLoc.latitude},${currentUserLoc.longitude}`
    : '';

  const googleMapsUrl = destinationCoords
    ? originCoords
      ? `https://www.google.com/maps/dir/?api=1&origin=${originCoords}&destination=${destinationCoords}&travelmode=driving`
      : `https://www.google.com/maps/dir/?api=1&destination=${destinationCoords}`
    : '#';

  const routeDistance = currentRoute?.distanceKilometers ?? currentRoute?.distanceKm ?? null;
  const routeDuration = currentRoute?.estimatedMinutes ?? currentRoute?.durationMinutes ?? null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(52, 211, 153, 0.25)',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Floating Info Header Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(12px)',
          padding: '6px 12px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.82rem',
          fontWeight: 700,
          color: '#34d399',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(52, 211, 153, 0.35)',
          maxWidth: 'calc(100% - 70px)',
          flexWrap: 'wrap',
        }}
      >
        <MapPin size={15} color="#34d399" />
        <span style={{ color: '#f8fafc', whiteSpace: 'nowrap' }}>Bản Đồ Điểm Chợ</span>
        <span
          style={{
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            fontSize: '0.72rem',
            padding: '2px 7px',
            borderRadius: '999px',
            fontWeight: 700,
          }}
        >
          {markets.length} Điểm
        </span>
      </div>

      {/* FLOATING ACTIVE ROUTE DETAILS OVERLAY */}
      {currentRoute && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '12px',
            right: '12px',
            maxWidth: '460px',
            zIndex: 450,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            borderRadius: '14px',
            padding: '12px 14px',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.8), 0 0 20px rgba(14, 165, 233, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeInSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Navigation size={15} color="#38bdf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                Lộ Trình Chỉ Đường
              </span>
            </div>
            <button
              onClick={handleClearRoute}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#94a3b8',
                borderRadius: '6px',
                padding: '3px 6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
              }}
              title="Đóng chỉ đường"
            >
              <X size={13} />
              <span>Đóng</span>
            </button>
          </div>

          <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 700, lineHeight: 1.3 }}>
            {currentRoute.marketName || selectedMarket?.name || 'Điểm chợ đã chọn'}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
            {routeDistance !== null && (
              <span style={{ color: '#34d399', fontWeight: 700 }}>
                📍 {Number(routeDistance).toFixed(1)} km
              </span>
            )}
            {routeDuration !== null && (
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                ⏱️ ~{Math.ceil(Number(routeDuration))} phút lái xe
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '8px 12px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)',
              }}
            >
              <ExternalLink size={13} />
              <span>Mở Google Maps Dẫn Đường</span>
            </a>
          </div>
        </div>
      )}

      {/* ROUTING ERROR BANNER */}
      {routingError && (
        <div
          style={{
            position: 'absolute',
            top: '56px',
            left: '12px',
            right: '12px',
            maxWidth: '460px',
            zIndex: 450,
            background: 'rgba(239, 68, 68, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '10px 14px',
            border: '1px solid rgba(254, 202, 202, 0.5)',
            color: '#ffffff',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{routingError}</span>
          </div>
          <button
            onClick={() => setRoutingError(null)}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* QUICK ROUTE BUTTON (TOP-RIGHT UNDER CONTROLS) */}
      {selectedMarket && !currentRoute && (
        <button
          onClick={() => fetchRouteToMarket(selectedMarket)}
          disabled={routingLoading}
          style={{
            position: 'absolute',
            top: '12px',
            right: '54px',
            zIndex: 400,
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '10px',
            padding: '7px 12px',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: routingLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 14px rgba(14, 165, 233, 0.5)',
            transition: 'all 0.2s',
          }}
          title={`Tìm đường đến ${selectedMarket.name}`}
        >
          {routingLoading ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : (
            <Navigation size={13} />
          )}
          <span>{routingLoading ? 'Đang dò đường...' : 'Chỉ Đường'}</span>
        </button>
      )}

      {/* Map Layer Mode Switcher (Google Satellite / Streets / Terrain) */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(12px)',
          padding: '4px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          maxWidth: 'calc(100% - 24px)',
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveLayer('satellite')}
          style={{
            background: activeLayer === 'satellite' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
            color: activeLayer === 'satellite' ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            boxShadow: activeLayer === 'satellite' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none',
          }}
        >
          <Globe size={13} />
          <span>🛰️ Vệ Tinh</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveLayer('streets')}
          style={{
            background: activeLayer === 'streets' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
            color: activeLayer === 'streets' ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            boxShadow: activeLayer === 'streets' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none',
          }}
        >
          <Layers size={13} />
          <span>🗺️ Bản Đồ Phố</span>
        </button>

        <button
          type="button"
          onClick={handleResetView}
          title="Xem toàn bộ các điểm chợ"
          style={{
            background: 'transparent',
            color: '#94a3b8',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 8px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#34d399')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
        >
          <Compass size={14} />
        </button>
      </div>

      <style>{`
        @keyframes mapPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.6);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.6);
            opacity: 0;
          }
        }
        @keyframes userGpsPulse {
          0% {
            transform: scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.0);
            opacity: 0;
          }
        }
        @keyframes fadeInSlideDown {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
