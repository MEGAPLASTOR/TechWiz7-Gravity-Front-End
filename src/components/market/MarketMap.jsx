import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Layers, Globe, Navigation, Compass } from 'lucide-react';
import { APP_CONFIG } from '@/constants/appConfig';

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
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const tileLayerRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState('satellite');

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
      mapInstanceRef.current = map;
    }
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

  // Update Markers & View
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

        // Popup with modern dark card design
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
            <span>✨ Chọn điểm nhận này</span>
          </button>
        `;

        popupContent.querySelector(`#btn-select-map-${m.marketId}`)?.addEventListener('click', () => {
          onSelectMarket(m);
        });

        marker.bindPopup(popupContent, { maxWidth: 280 });
        marker.on('click', () => {
          onSelectMarket(m);
        });

        markersGroup.addLayer(marker);
      });

      // Fit bounds if markers exist and no single market selected
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
  }, [markets, selectedMarket, onSelectMarket]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    if (markersGroupRef.current && markersGroupRef.current.getLayers().length > 0) {
      mapInstanceRef.current.fitBounds(markersGroupRef.current.getBounds().pad(0.25));
    } else {
      mapInstanceRef.current.setView(APP_CONFIG.DEFAULT_CENTER, APP_CONFIG.DEFAULT_ZOOM);
    }
  };

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
          top: '14px',
          left: '14px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          padding: '8px 14px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#34d399',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(52, 211, 153, 0.35)',
        }}
      >
        <MapPin size={16} color="#34d399" />
        <span style={{ color: '#f8fafc' }}>Bản Đồ Vệ Tinh Điểm Chợ</span>
        <span
          style={{
            background: 'rgba(16, 185, 129, 0.2)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '999px',
            fontWeight: 700,
          }}
        >
          {markets.length} Điểm
        </span>
      </div>

      {/* Map Layer Mode Switcher (Google Satellite / Streets / Terrain) */}
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '14px',
          zIndex: 400,
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(12px)',
          padding: '4px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
      `}</style>
    </div>
  );
};
