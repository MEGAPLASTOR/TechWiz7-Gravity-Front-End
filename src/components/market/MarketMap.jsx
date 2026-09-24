import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { APP_CONFIG } from '@/constants/appConfig';

export const MarketMap = ({
  markets = [],
  selectedMarket = null,
  onSelectMarket = () => {},
  height = '420px',
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const initialCenter = selectedMarket
        ? [selectedMarket.latitude, selectedMarket.longitude]
        : APP_CONFIG.DEFAULT_CENTER;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: APP_CONFIG.DEFAULT_ZOOM,
        zoomControl: false,
        attributionControl: false,
      });

      // Add zoom control top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Clean, light, modern CartoDB Positron / OSM tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      markersGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear existing markers
    markersGroup.clearLayers();

    // Custom 3D Pin Icon
    const createCustomIcon = (market, isSelected) => {
      return L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            position: relative;
            cursor: pointer;
            transform: translate(-50%, -100%);
            transition: transform 0.2s ease;
          ">
            <div style="
              width: ${isSelected ? '44px' : '36px'};
              height: ${isSelected ? '44px' : '36px'};
              border-radius: 50% 50% 50% 0;
              background: ${isSelected ? '#ea580c' : '#15803d'};
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 10px 20px rgba(0,0,0,0.25);
              border: 3px solid #ffffff;
            ">
              <span style="
                transform: rotate(45deg);
                font-size: ${isSelected ? '20px' : '16px'};
              ">🛒</span>
            </div>
            <div style="
              position: absolute;
              bottom: -18px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(255,255,255,0.92);
              backdrop-filter: blur(4px);
              padding: 2px 8px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 700;
              color: #0f172a;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.15);
              border: 1px solid #e2e8f0;
            ">
              ${market.name.split(' ')[0]} ${market.name.split(' ')[1] || ''}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });
    };

    if (markets.length > 0) {
      markets.forEach((m) => {
        if (!m.latitude || !m.longitude) return;

        const isSelected = selectedMarket?.marketId === m.marketId;
        const marker = L.marker([m.latitude, m.longitude], {
          icon: createCustomIcon(m, isSelected),
        });

        // Popup content
        const popupContent = document.createElement('div');
        popupContent.style.fontFamily = 'var(--font-sans)';
        popupContent.style.padding = '8px 4px';
        popupContent.innerHTML = `
          <div style="font-weight: 700; font-size: 14px; color: #15803d; margin-bottom: 4px;">
            ${m.name}
          </div>
          <div style="font-size: 12px; color: #475569; margin-bottom: 8px; line-height: 1.4;">
            📍 ${m.address}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 10px;">
            ${m.description || 'Chợ phiên nông sản tươi sạch định kỳ hàng tuần'}
          </div>
          <button id="btn-select-${m.marketId}" style="
            width: 100%;
            background: #15803d;
            color: #ffffff;
            font-size: 12px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          ">
            Chọn điểm nhận tại đây
          </button>
        `;

        popupContent.querySelector(`#btn-select-${m.marketId}`)?.addEventListener('click', () => {
          onSelectMarket(m);
        });

        marker.bindPopup(popupContent, { maxWidth: 260 });
        marker.on('click', () => {
          onSelectMarket(m);
        });

        markersGroup.addLayer(marker);
      });

      // Fit bounds if markers exist and no single market selected
      if (!selectedMarket && markets.length > 1) {
        try {
          map.fitBounds(markersGroup.getBounds().pad(0.2));
        } catch (e) {
          // ignore
        }
      } else if (selectedMarket) {
        map.setView([selectedMarket.latitude, selectedMarket.longitude], 14, { animate: true });
      }
    }

    return () => {
      // Map stays alive across renders
    };
  }, [markets, selectedMarket, onSelectMarket]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--border-light)',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* Floating Info Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 400,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
          padding: '8px 14px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#15803d',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <MapPin size={16} color="#15803d" />
        <span>Bản Đồ Điểm Chợ & Sạp Nông Dân</span>
        <span style={{
          background: '#dcfce7',
          color: '#166534',
          fontSize: '0.75rem',
          padding: '2px 8px',
          borderRadius: '999px',
          marginLeft: '4px',
        }}>
          {markets.length} Điểm Chợ
        </span>
      </div>
    </div>
  );
};
