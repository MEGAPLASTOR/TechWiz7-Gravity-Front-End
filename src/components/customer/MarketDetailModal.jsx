import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import "@/assets/styles/components/customer/MarketDetailModal.css";
import "leaflet/dist/leaflet.css";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import Button from "../common/Button";
import L from "leaflet";
import {
  notificationService,
  playNotificationChime,
} from "../../services/notificationService";
import { useLanguage } from "../../context/LanguageContext";
import { getMarketOperatingStatus } from "../../utils/marketUtils";

export default function MarketDetailModal({
  isOpen,
  onClose,
  market,
  onViewStalls,
  initialTab = "schedule",
}) {
  const { t, isEn, localizeMarketName, localizeOperatingDays } = useLanguage();
  const [activeTab, setActiveTab] = useState(initialTab);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const polylineRef = useRef(null);
  const userMarkerRef = useRef(null);
  const marketMarkerRef = useRef(null);
  const geofenceCircleRef = useRef(null);

  const {
    id,
    marketId,
    name = "Chợ Phiên",
    address = "",
    city = "",
    distance = "",
    operatingDays = "",
    operatingHours = "",
    stallsCount = 0,
    description = "",
    imageUrl = "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=700&q=80",
    amenities = [],
    latitude,
    longitude,
  } = market || {};

  // Standard market coords (defaults to CUSC Cần Thơ if missing)
  const mLat = Number(market?.latitude ?? latitude ?? 10.033592);
  const mLon = Number(market?.longitude ?? longitude ?? 105.779754);

  const opStatus = useMemo(() => {
    return getMarketOperatingStatus(market, isEn);
  }, [market, isEn]);

  // Initialize user position near the market by default (~1.2 km away)
  const [userPos, setUserPos] = useState({
    lat: Number((mLat + 0.009).toFixed(5)),
    lon: Number((mLon + 0.009).toFixed(5)),
    label: isEn ? "Nearby location (~1.2 km)" : "Vị trí lân cận (~1.2 km)",
  });

  const [routeData, setRouteData] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [geofenceTriggered, setGeofenceTriggered] = useState(false);
  const [farmerAlertMsg, setFarmerAlertMsg] = useState(null);
  const [gpsNotice, setGpsNotice] = useState(null);
  const [showChromeHelp, setShowChromeHelp] = useState(false);
  const [copiedFlag, setCopiedFlag] = useState(false);

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setUserPos({
        lat: Number((mLat + 0.009).toFixed(5)),
        lon: Number((mLon + 0.009).toFixed(5)),
        label: isEn ? "Nearby location (~1.2 km)" : "Vị trí lân cận (~1.2 km)",
      });
      setGpsNotice(null);
      setShowChromeHelp(false);
    }
  }, [isOpen, initialTab, mLat, mLon, isEn]);

  const getHaversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return (
      Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10
    );
  };

  // IP Geolocation fallback when hardware GPS is blocked by browser (HTTP origin / permissions)
  const fetchIpLocation = async () => {
    try {
      const isHttps = window.location.protocol === "https:";
      if (isHttps) {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        if (data?.success && data.latitude && data.longitude) {
          return {
            lat: Number(data.latitude),
            lon: Number(data.longitude),
            city: data.city || data.region || "Việt Nam",
          };
        }
      } else {
        const res = await fetch("http://ip-api.com/json/");
        const data = await res.json();
        if (data?.status === "success" && data.lat && data.lon) {
          return {
            lat: Number(data.lat),
            lon: Number(data.lon),
            city: data.city || data.regionName || "Việt Nam",
          };
        }
      }
    } catch (err) {
      console.warn("fetchIpLocation warning:", err);
    }
    return null;
  };

  const calculateRoute = useCallback(async (uLat, uLon) => {
    setLoadingRoute(true);
    setGeofenceTriggered(false);
    setFarmerAlertMsg(null);
    try {
      const distKm = getHaversineKm(uLat, uLon, mLat, mLon);
      const estMins = Math.max(2, Math.ceil(distKm * 2.5));
      try {
        const osrmRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${uLon},${uLat};${mLon},${mLat}?overview=full&geometries=geojson&steps=true`,
        );
        const data = await osrmRes.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const osrmDist = Math.round((route.distance / 1000) * 10) / 10;
          const osrmMins = Math.ceil(route.duration / 60);
          const coords = route.geometry.coordinates.map((pt) => [pt[1], pt[0]]);
          const steps = (route.legs[0]?.steps || [])
            .map(
              (s) =>
                `Đi ${s.name ? `vào ${s.name}` : "tiếp tục"} (${Math.round(s.distance)} m)`,
            )
            .filter(Boolean);

          const isNear = osrmDist <= 0.35;
          setRouteData({
            distanceKm: osrmDist,
            minutes: osrmMins,
            coords,
            steps,
            inGeofence: isNear,
            googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLon}&destination=${mLat},${mLon}`,
          });

          if (isNear) {
            setGeofenceTriggered(true);
            setFarmerAlertMsg(
              isEn
                ? `🔔 Chime to Farmers: Customer arrived at market gate! Preparing your fresh basket.`
                : `🔔 Chuông báo Nông Dân: Khách hàng đang ở cổng chợ! Đang chuẩn bị giỏ rau củ.`,
            );
            playNotificationChime();
            try {
              notificationService.showBrowserNotification(
                `📍 Chào mừng đến ${name}!`,
                {
                  body: `Bạn đang ở trong phạm vi 300m quanh chợ. Đơn hàng đã sẵn sàng nhận tại quầy!`,
                  tag: `geofence-${market?.marketId || market?.id || "m"}`,
                },
              );
            } catch {}
          }
          return;
        }
      } catch (err) {
        console.warn("OSRM routing fallback to direct line:", err);
      }

      const isNear = distKm <= 0.35;
      setRouteData({
        distanceKm: distKm,
        minutes: estMins,
        coords: [
          [uLat, uLon],
          [mLat, mLon],
        ],
        steps: [
          `Đi thẳng theo trục đường chính tới ${name}`,
          `Đến cổng chợ tại ${address}`,
        ],
        inGeofence: isNear,
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLon}&destination=${mLat},${mLon}`,
      });

      if (isNear) {
        setGeofenceTriggered(true);
        setFarmerAlertMsg(
          isEn
            ? `🔔 Chime to Farmers: Customer arrived at market gate! Preparing your fresh basket.`
            : `🔔 Chuông báo Nông Dân: Khách hàng đang ở cổng chợ! Đang chuẩn bị giỏ rau củ.`,
        );
        playNotificationChime();
        try {
          notificationService.showBrowserNotification(
            `📍 Chào mừng đến ${name}!`,
            {
              body: `Bạn đang ở trong phạm vi 300m quanh chợ. Đơn hàng đã sẵn sàng nhận tại quầy!`,
              tag: `geofence-${market?.marketId || market?.id || "m"}`,
            },
          );
        } catch {}
      }
    } finally {
      setLoadingRoute(false);
    }
  }, [mLat, mLon, name, address, isEn, market]);

  // Clean up leaflet map safely
  const cleanupMap = useCallback(() => {
    if (leafletMap.current) {
      try {
        leafletMap.current.remove();
      } catch (err) {
        console.debug("Map removal note:", err);
      }
      leafletMap.current = null;
    }
    userMarkerRef.current = null;
    marketMarkerRef.current = null;
    polylineRef.current = null;
    geofenceCircleRef.current = null;
  }, []);

  // Map initialization & tab lifecycle
  useEffect(() => {
    if (!isOpen || activeTab !== "map") {
      cleanupMap();
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      if (!isMounted || !mapRef.current) return;

      // Handle map container re-use
      if (mapRef.current._leaflet_id) {
        delete mapRef.current._leaflet_id;
      }

      if (!leafletMap.current && mapRef.current) {
        const map = L.map(mapRef.current).setView([mLat, mLon], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        }).addTo(map);

        // Allow clicking anywhere on the map to set user location pin
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          const rLat = Number(lat.toFixed(5));
          const rLng = Number(lng.toFixed(5));
          setUserPos({
            lat: rLat,
            lon: rLng,
            label: isEn ? "📍 Selected Pin on Map" : "📍 Điểm ghim trên bản đồ",
          });
          calculateRoute(rLat, rLng);
        });

        leafletMap.current = map;
      }

      if (leafletMap.current) {
        leafletMap.current.invalidateSize();
      }

      // Check secure context for GPS
      const isSecure =
        window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (isSecure && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            if (!isMounted) return;
            const uLat = Number(pos.coords.latitude.toFixed(5));
            const uLon = Number(pos.coords.longitude.toFixed(5));
            const acc = Math.round(pos.coords.accuracy);
            setUserPos({
              lat: uLat,
              lon: uLon,
              label: isEn ? `📍 Real GPS (±${acc}m)` : `📍 GPS Thực Tế (±${acc}m)`,
            });
            calculateRoute(uLat, uLon);
          },
          async () => {
            if (!isMounted) return;
            // Fallback to IP geolocation
            const ipLoc = await fetchIpLocation();
            if (ipLoc && isMounted) {
              const uLat = Number(ipLoc.lat.toFixed(5));
              const uLon = Number(ipLoc.lon.toFixed(5));
              setUserPos({
                lat: uLat,
                lon: uLon,
                label: isEn ? `🌐 IP Location (${ipLoc.city})` : `🌐 Vị trí mạng IP (${ipLoc.city})`,
              });
              calculateRoute(uLat, uLon);
            } else if (isMounted) {
              calculateRoute(userPos.lat, userPos.lon);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 6000,
            maximumAge: 30000,
          },
        );
      } else {
        // Insecure HTTP origin (LAN / IP) - proactively avoid throwing alert
        const ipLoc = await fetchIpLocation();
        if (ipLoc && isMounted) {
          const uLat = Number(ipLoc.lat.toFixed(5));
          const uLon = Number(ipLoc.lon.toFixed(5));
          setUserPos({
            lat: uLat,
            lon: uLon,
            label: isEn ? `🌐 IP Location (${ipLoc.city})` : `🌐 Vị trí mạng IP (${ipLoc.city})`,
          });
          calculateRoute(uLat, uLon);
          setGpsNotice({
            type: "info",
            text: isEn
              ? "HTTP origin restricts device GPS. Auto-located via IP network. Click anywhere on the map to customize pin."
              : "Trình duyệt hạn chế GPS trên kết nối HTTP (LAN). Đã tự động định vị theo IP mạng. Bạn có thể nhấp bản đồ để đổi vị trí.",
            canHelp: true,
          });
        } else if (isMounted) {
          calculateRoute(userPos.lat, userPos.lon);
          setGpsNotice({
            type: "warning",
            text: isEn
              ? "HTTP connection restricts hardware GPS. Click map or select a preset below to set your position."
              : "Trình duyệt hạn chế GPS phần cứng trên HTTP. Nhấp vào bản đồ hoặc chọn điểm mẫu bên dưới.",
            canHelp: true,
          });
        }
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isOpen, activeTab, mLat, mLon, isEn, cleanupMap]);

  // Update map markers, geofence circle, and polyline route
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !routeData) return;

    const marketIcon = L.divIcon({
      className: "ml-map-pin-market",
      html: '<div style="background:#059669;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 3px 12px rgba(5,150,105,0.7);cursor:pointer;">🎪</div>',
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    const userIcon = L.divIcon({
      className: "ml-map-pin-user",
      html: '<div style="background:#0284c7;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 3px 12px rgba(2,132,199,0.7);cursor:grab;" title="Kéo thả để đổi vị trí">📍</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Market Marker
    if (marketMarkerRef.current) {
      marketMarkerRef.current.setLatLng([mLat, mLon]);
    } else {
      marketMarkerRef.current = L.marker([mLat, mLon], {
        icon: marketIcon,
      })
        .addTo(map)
        .bindPopup(
          `<b>${name}</b><br>${address}<br><span style="color:#059669;font-weight:600;">🕒 ${operatingDays} (${operatingHours})</span>`,
        );
    }

    // 300m Geofence Circle
    if (geofenceCircleRef.current) {
      geofenceCircleRef.current.setLatLng([mLat, mLon]);
      geofenceCircleRef.current.setStyle({
        color: routeData.inGeofence ? "#16a34a" : "#059669",
        fillColor: routeData.inGeofence ? "#22c55e" : "#16a34a",
        fillOpacity: routeData.inGeofence ? 0.25 : 0.12,
      });
    } else {
      geofenceCircleRef.current = L.circle([mLat, mLon], {
        radius: 300,
        color: "#059669",
        fillColor: "#16a34a",
        fillOpacity: 0.12,
        dashArray: "6, 6",
      })
        .addTo(map)
        .bindPopup(
          isEn
            ? "<b>300m Geofence Zone</b><br>Automatic check-in notification for stalls!"
            : "<b>Vùng Geofence 300m</b><br>Tự động rung chuông cho các sạp khi bạn đến gần!",
        );
    }

    // User Marker (draggable)
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userPos.lat, userPos.lon]);
    } else {
      userMarkerRef.current = L.marker([userPos.lat, userPos.lon], {
        icon: userIcon,
        draggable: true,
      })
        .addTo(map)
        .bindPopup(
          isEn
            ? `<b>Your Location:</b><br>${userPos.label}<br><small>Tip: Drag pin to test routes!</small>`
            : `<b>Vị trí của bạn:</b><br>${userPos.label}<br><small>Mẹo: Kéo thả ghim để thử nghiệm!</small>`,
        );

      userMarkerRef.current.on("dragend", (event) => {
        const pos = event.target.getLatLng();
        const rLat = Number(pos.lat.toFixed(5));
        const rLon = Number(pos.lng.toFixed(5));
        setUserPos({
          lat: rLat,
          lon: rLon,
          label: isEn ? "📍 Dragged Map Pin" : "📍 Vị trí kéo thả trên bản đồ",
        });
        calculateRoute(rLat, rLon);
      });
    }

    // Route Polyline
    if (routeData.coords && routeData.coords.length > 0) {
      if (polylineRef.current) {
        polylineRef.current.setLatLngs(routeData.coords);
      } else {
        polylineRef.current = L.polyline(routeData.coords, {
          color: "#10b981",
          weight: 5,
          opacity: 0.9,
          lineJoin: "round",
        }).addTo(map);
      }
      const bounds = L.latLngBounds([
        [userPos.lat, userPos.lon],
        [mLat, mLon],
        ...routeData.coords,
      ]);
      map.fitBounds(bounds, {
        padding: [45, 45],
      });
    }
  }, [
    routeData,
    mLat,
    mLon,
    name,
    address,
    operatingDays,
    operatingHours,
    userPos,
    isEn,
    calculateRoute,
  ]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, [cleanupMap]);

  // Non-blocking real GPS requester with graceful IP fallback
  const handleGetRealGps = async () => {
    setGpsNotice(null);
    const isSecure =
      window.isSecureContext ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isSecure) {
      // Insecure context (HTTP LAN/IP)
      const ipLoc = await fetchIpLocation();
      if (ipLoc) {
        const uLat = Number(ipLoc.lat.toFixed(5));
        const uLon = Number(ipLoc.lon.toFixed(5));
        setUserPos({
          lat: uLat,
          lon: uLon,
          label: isEn ? `🌐 IP Network (${ipLoc.city})` : `🌐 Vị trí mạng IP (${ipLoc.city})`,
        });
        calculateRoute(uLat, uLon);
        setGpsNotice({
          type: "warning",
          text: isEn
            ? "HTTP connection restricts hardware GPS. Auto-located via IP network. You can click anywhere on the map to customize pin."
            : "Trình duyệt hạn chế GPS phần cứng trên kết nối HTTP (LAN/IP). Đã định vị theo IP mạng. Bạn có thể nhấp trên bản đồ hoặc chọn điểm mẫu bên dưới.",
          canHelp: true,
        });
      } else {
        setGpsNotice({
          type: "warning",
          text: isEn
            ? "HTTP connection restricts device GPS. Please click on the map or select a preset below."
            : "Trình duyệt chặn GPS phần cứng qua giao thức HTTP. Bạn hãy nhấp trực tiếp vào bản đồ hoặc chọn điểm mẫu.",
          canHelp: true,
        });
      }
      return;
    }

    if (!navigator.geolocation) {
      setGpsNotice({
        type: "error",
        text: isEn
          ? "Your browser does not support Geolocation GPS."
          : "Trình duyệt của bạn không hỗ trợ Geolocation GPS.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = Number(pos.coords.latitude.toFixed(5));
        const uLon = Number(pos.coords.longitude.toFixed(5));
        const acc = Math.round(pos.coords.accuracy);
        setUserPos({
          lat: uLat,
          lon: uLon,
          label: isEn ? `📍 Real GPS (±${acc}m)` : `📍 GPS Thực Tế (±${acc}m)`,
        });
        calculateRoute(uLat, uLon);
        setGpsNotice({
          type: "success",
          text: isEn
            ? `Acquired device GPS location (accuracy ±${acc}m).`
            : `Đã xác định toạ độ GPS thực tế của thiết bị (độ chính xác ±${acc}m).`,
        });
      },
      async (err) => {
        console.warn("GPS error:", err.message);
        const ipLoc = await fetchIpLocation();
        if (ipLoc) {
          const uLat = Number(ipLoc.lat.toFixed(5));
          const uLon = Number(ipLoc.lon.toFixed(5));
          setUserPos({
            lat: uLat,
            lon: uLon,
            label: isEn ? `🌐 IP Network (${ipLoc.city})` : `🌐 Vị trí mạng IP (${ipLoc.city})`,
          });
          calculateRoute(uLat, uLon);
          setGpsNotice({
            type: "warning",
            text: isEn
              ? `Could not get device GPS (${err.message}). Switched to IP network location.`
              : `Không lấy được GPS phần cứng (${err.message}). Đã chuyển sang vị trí mạng IP.`,
          });
        } else {
          setGpsNotice({
            type: "warning",
            text: isEn
              ? `Could not get device GPS (${err.message}). Click on map to place your pin.`
              : `Không lấy được toạ độ GPS (${err.message}). Bạn hãy nhấp trực tiếp lên bản đồ.`,
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  };

  const handleSelectPreset = (lat, lon, label) => {
    setUserPos({
      lat: Number(lat.toFixed(5)),
      lon: Number(lon.toFixed(5)),
      label,
    });
    calculateRoute(lat, lon);
  };

  const handleCopyFlag = () => {
    const origin = window.location.origin;
    navigator.clipboard.writeText(origin);
    setCopiedFlag(true);
    setTimeout(() => setCopiedFlag(false), 2000);
  };

  if (!market) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={localizeMarketName(name, isEn)}
      subtitle={`📍 ${address}, ${city}`}
      maxWidth="780px"
    >
      <div className="ml-market-detail-content">
        <div className="ml-modal-tab-nav">
          <button
            type="button"
            className={`ml-modal-tab-btn ${activeTab === "schedule" ? "active" : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            📅 {isEn ? "Operating Schedule & Guide" : "Lịch Hoạt Động & Hướng Dẫn"}
          </button>
          <button
            type="button"
            className={`ml-modal-tab-btn ${activeTab === "map" ? "active" : ""}`}
            onClick={() => setActiveTab("map")}
          >
            🗺️ {isEn ? "Map & GPS Route" : "Bản Đồ & Chỉ Đường GPS"}
          </button>
        </div>

        {activeTab === "schedule" && (
          <div className="ml-modal-tab-content">
            <div className="ml-detail-banner">
              <img src={imageUrl} alt={name} className="ml-detail-img" />
              <div className="ml-detail-pills">
                {distance && (
                  <Badge variant="organic" size="sm">
                    📍 {isEn ? "Distance:" : "Khoảng cách:"} {distance}
                  </Badge>
                )}
                <Badge variant={opStatus.badgeVariant} size="sm" dot>
                  {opStatus.badgeText}
                </Badge>
                <Badge variant="ready" size="sm">
                  ✓ {isEn ? "Open for Pre-orders" : "Đang mở nhận đặt trước"}
                </Badge>
              </div>
            </div>

            <div className="ml-detail-schedule-card">
              <div className="ml-sched-item">
                <span className="ml-sched-icon">🏪</span>
                <div>
                  <div className="ml-sched-label">
                    {isEn ? "Operating Status:" : "Trạng thái hoạt động:"}
                  </div>
                  <div className="ml-sched-val" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <Badge variant={opStatus.badgeVariant} size="sm" dot>
                      {opStatus.badgeText}
                    </Badge>
                    <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--color-text-main)" }}>
                      {opStatus.detailText}
                    </span>
                  </div>
                </div>
              </div>
              <div className="ml-sched-item">
                <span className="ml-sched-icon">📅</span>
                <div>
                  <div className="ml-sched-label">
                    {isEn ? "Recurring Schedule:" : "Lịch họp định kỳ:"}
                  </div>
                  <div className="ml-sched-val">
                    <strong>{localizeOperatingDays(operatingDays, isEn)}</strong>
                  </div>
                </div>
              </div>
              <div className="ml-sched-item">
                <span className="ml-sched-icon">⏰</span>
                <div>
                  <div className="ml-sched-label">
                    {isEn ? "Visitor Hours:" : "Khung giờ đón khách:"}
                  </div>
                  <div className="ml-sched-val">
                    <strong>{operatingHours}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="ml-session-card">
              <div className="ml-session-header">
                <span className="ml-session-icon">⚡</span>
                <div>
                  <h4 className="ml-session-title">
                    {isEn ? "Upcoming Session: This Weekend" : "Phiên Chợ Sắp Diễn Ra: Cuối Tuần Này"}
                  </h4>
                  <p className="ml-session-desc">
                    {isEn
                      ? "Growers harvest fresh vegetables at 4:30 - 5:00 AM and deliver straight to stalls."
                      : "Nông dân thu hoạch rau củ vào 4:30 - 5:00 sáng và chở thẳng đến sạp."}
                  </p>
                </div>
              </div>
              <div className="ml-cutoff-notice">
                <span className="ml-cutoff-badge">
                  ⏳ {isEn ? "Pre-order Cut-off:" : "Hạn chót đặt trước (Cut-off):"}
                </span>
                <span>
                  <strong>{isEn ? "20:00 Friday night" : "20:00 tối Thứ Sáu"}</strong> —{" "}
                  {isEn
                    ? "After this cutoff, stalls close order taking to focus on harvest quantities."
                    : "Sau giờ này sạp sẽ đóng đơn để tập trung thu hái theo số lượng."}
                </span>
              </div>
            </div>

            <div className="ml-detail-section">
              <h4 className="ml-detail-heading">
                {isEn ? "About This Market" : "Giới thiệu phiên chợ"}
              </h4>
              <p className="ml-detail-text">
                {description ||
                  (isEn
                    ? "Clean farmers' market bringing together certified agricultural cooperatives and family farms. All produce harvested within local radius, ensuring the highest crispness and nutrition."
                    : "Chợ nông sản sạch kết nối trực tiếp các hợp tác xã và hộ nông dân địa phương. Nông sản thu hoạch tươi mới mỗi sáng, đảm bảo độ giòn ngọt và dinh dưỡng.")}
              </p>
            </div>

            <div className="ml-detail-section">
              <h4 className="ml-detail-heading">
                {isEn ? "3 Quick Steps to Pick Up at Market" : "3 Bước nhận nông sản nhanh tại chợ"}
              </h4>
              <div className="ml-steps-grid">
                <div className="ml-step-card">
                  <div className="ml-step-num">1</div>
                  <div className="ml-step-info">
                    <strong>{isEn ? "Pre-order Online" : "Đặt trước online"}</strong>
                    <span>
                      {isEn ? "Pick produce and choose your pickup window." : "Chọn rau quả và chọn giờ hẹn ra chợ."}
                    </span>
                  </div>
                </div>
                <div className="ml-step-card">
                  <div className="ml-step-num">2</div>
                  <div className="ml-step-info">
                    <strong>{isEn ? "Arrive at Market (300m Geofence)" : "Đến chợ (Geofence 300m)"}</strong>
                    <span>
                      {isEn ? "System rings chime for stalls to ready your basket." : "Hệ thống rung chuông để sạp soạn sẵn giỏ hàng."}
                    </span>
                  </div>
                </div>
                <div className="ml-step-card">
                  <div className="ml-step-num">3</div>
                  <div className="ml-step-info">
                    <strong>{isEn ? "Show Pickup Code" : "Đọc mã nhận hàng"}</strong>
                    <span>
                      {isEn
                        ? "Pick up at express counter or stall without waiting."
                        : "Đến bàn Express hoặc sạp lấy hàng ngay không chờ đợi."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ml-detail-section">
              <h4 className="ml-detail-heading">
                {isEn ? "Market Amenities & Facilities" : "Tiện ích hỗ trợ khách lấy hàng"}
              </h4>
              <div className="ml-amenities-grid">
                {(isEn
                  ? [
                      "Free Parking",
                      "Express Pickup Counter",
                      "Organic Waste Bins",
                      "Traceability Verification Stall",
                      "VietQR Instant Payment",
                    ]
                  : amenities?.length > 0
                    ? amenities
                    : [
                        "Bãi giữ xe miễn phí",
                        "Quầy Express nhận nhanh",
                        "Thùng rác phân loại hữu cơ",
                        "Bàn tra cứu mã truy xuất nguồn gốc",
                        "Thanh toán nhanh VietQR",
                      ]
                ).map((item, idx) => (
                  <span key={idx} className="ml-amenity-chip">
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="ml-detail-footer">
              <div className="ml-detail-stall-note">
                🎪 {isEn ? "Currently " : "Hiện có "}
                <strong>
                  {stallsCount} {isEn ? "farmer stalls" : "gian hàng nông dân"}
                </strong>{" "}
                {isEn ? "registered and ready to serve." : "đã đăng ký sản phẩm sẵn sàng phục vụ."}
              </div>
              <div className="ml-modal-actions-row">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => setActiveTab("map")}
                  icon={<span>🗺️</span>}
                >
                  {isEn ? "View Map & Directions" : "Xem bản đồ & chỉ đường"}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    onClose();
                    if (onViewStalls) onViewStalls(market);
                  }}
                  icon={<span>🧺</span>}
                >
                  {isEn ? "Browse Stalls at Market" : "Xem sản phẩm sạp tại chợ"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "map" && (
          <div className="ml-modal-tab-content">
            <div className="ml-map-top-bar">
              <div className="ml-map-target-info">
                <span className="ml-map-target-icon">🎪</span>
                <div>
                  <strong>{name}</strong>
                  <div className="ml-map-target-addr">📍 {address}</div>
                </div>
              </div>
              <Badge variant="organic" size="sm">
                OSRM Live Engine
              </Badge>
            </div>

            {/* GPS Notice Banner (Non-blocking) */}
            {gpsNotice && (
              <div
                className={`ml-gps-notice-banner ${gpsNotice.type}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  background:
                    gpsNotice.type === "warning"
                      ? "var(--color-warning-subtle, #fffbeb)"
                      : gpsNotice.type === "success"
                        ? "var(--color-success-subtle, #f0fdf4)"
                        : "var(--color-info-subtle, #eff6ff)",
                  border: `1px solid ${
                    gpsNotice.type === "warning"
                      ? "var(--color-warning-border, #fde68a)"
                      : gpsNotice.type === "success"
                        ? "var(--color-success-border, #bbf7d0)"
                        : "var(--color-info-border, #bfdbfe)"
                  }`,
                  color:
                    gpsNotice.type === "warning"
                      ? "#92400e"
                      : gpsNotice.type === "success"
                        ? "#166534"
                        : "#1e40af",
                }}
              >
                <span style={{ fontSize: 16 }}>
                  {gpsNotice.type === "warning"
                    ? "⚠️"
                    : gpsNotice.type === "success"
                      ? "✅"
                      : "ℹ️"}
                </span>
                <div style={{ flex: 1 }}>
                  <span>{gpsNotice.text}</span>
                  {gpsNotice.canHelp && (
                    <div style={{ marginTop: 4 }}>
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          color: "inherit",
                          textDecoration: "underline",
                          cursor: "pointer",
                          fontWeight: 600,
                          padding: 0,
                          fontSize: 12,
                        }}
                        onClick={() => setShowChromeHelp(!showChromeHelp)}
                      >
                        {showChromeHelp
                          ? isEn
                            ? "Hide Chrome flag guide"
                            : "Ẩn hướng dẫn bật GPS"
                          : isEn
                            ? "How to enable real GPS on Chrome over LAN/IP?"
                            : "Cách bật GPS thiết bị trên Chrome qua mạng LAN?"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Chrome Flag Instruction Card */}
            {showChromeHelp && (
              <div
                style={{
                  background: "var(--color-bg-subtle, #f8fafc)",
                  border: "1px dashed var(--color-border, #cbd5e1)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 12,
                  color: "var(--color-text-main, #334155)",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  ⚙️ {isEn ? "Chrome Security Flag Guide:" : "Hướng dẫn mở khóa GPS cho IP LAN trên Chrome:"}
                </div>
                <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                  <li>
                    {isEn ? "Open in a new tab: " : "Mở tab mới trên Chrome: "}
                    <code style={{ background: "rgba(0,0,0,0.06)", padding: "1px 4px", borderRadius: 4 }}>
                      chrome://flags/#unsafely-treat-insecure-origin-as-secure
                    </code>
                  </li>
                  <li>
                    {isEn
                      ? "Paste this origin into the input box: "
                      : "Dán địa chỉ origin sau vào ô nhập: "}
                    <strong>{window.location.origin}</strong>{" "}
                    <button
                      type="button"
                      onClick={handleCopyFlag}
                      style={{
                        padding: "2px 8px",
                        fontSize: 11,
                        cursor: "pointer",
                        borderRadius: 4,
                        border: "1px solid var(--color-border, #ccc)",
                        background: "var(--color-bg-surface, #fff)",
                      }}
                    >
                      {copiedFlag ? (isEn ? "Copied!" : "Đã chép!") : (isEn ? "Copy" : "Sao chép")}
                    </button>
                  </li>
                  <li>
                    {isEn
                      ? "Select 'Enabled' and click Relaunch Chrome."
                      : "Chọn 'Enabled' và nhấn Relaunch để khởi động lại Chrome."}
                  </li>
                </ol>
              </div>
            )}

            {/* Map Container */}
            <div className="ml-leaflet-container-wrap">
              <div
                ref={mapRef}
                id="ml-modal-leaflet-map"
                className="ml-modal-map-view"
              ></div>
            </div>

            {/* Map Interactive Tip & Quick Preset Chips */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
                padding: "8px 12px",
                background: "var(--color-bg-base, #f8fafc)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "var(--color-text-body, #334155)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>💡</span>
                <span>
                  {isEn
                    ? "Click anywhere on map or drag pin 📍 to move position"
                    : "Nhấp vào bản đồ hoặc kéo ghim 📍 để đổi vị trí của bạn"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "var(--color-text-main, #1e2922)",
                  }}
                >
                  {isEn ? "Quick Presets:" : "Điểm mẫu:"}
                </span>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    height: "auto",
                    background: "rgba(16, 185, 129, 0.1)",
                    borderColor: "#10b981",
                    color: "#059669",
                    fontWeight: 600,
                  }}
                  onClick={() =>
                    handleSelectPreset(
                      mLat + 0.0015,
                      mLon + 0.0015,
                      isEn ? "🎯 Market Gate (200m - Test Geofence)" : "🎯 Cổng chợ (~200m - Thử Geofence)",
                    )
                  }
                >
                  🎯 {isEn ? "At Gate (~200m)" : "Cổng chợ (~200m)"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    height: "auto",
                  }}
                  onClick={() =>
                    handleSelectPreset(
                      mLat + 0.012,
                      mLon + 0.012,
                      isEn ? "📍 Nearby (~1.5 km)" : "📍 Lân cận (~1.5 km)",
                    )
                  }
                >
                  📍 {isEn ? "Nearby (~1.5 km)" : "Lân cận (~1.5 km)"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    height: "auto",
                  }}
                  onClick={() =>
                    handleSelectPreset(
                      10.0336,
                      105.78,
                      isEn ? "🏙️ Can Tho (CUSC)" : "🏙️ Cần Thơ (CUSC)",
                    )
                  }
                >
                  🏙️ Cần Thơ
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    height: "auto",
                  }}
                  onClick={() =>
                    handleSelectPreset(
                      21.0285,
                      105.8542,
                      isEn ? "🏙️ Hanoi (Center)" : "🏙️ Hà Nội (Hoàn Kiếm)",
                    )
                  }
                >
                  🏙️ Hà Nội
                </button>

                <button
                  type="button"
                  className="btn btn-outline"
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    height: "auto",
                  }}
                  onClick={() =>
                    handleSelectPreset(
                      10.7769,
                      106.7009,
                      isEn ? "🏙️ HCMC (District 1)" : "🏙️ TP. HCM (Quận 1)",
                    )
                  }
                >
                  🏙️ TP. HCM
                </button>
              </div>
            </div>

            {loadingRoute ? (
              <div className="ml-route-loading">
                ⏳ {isEn ? "Calculating shortest route via OpenStreetMap..." : "Đang tính toán đường đi ngắn nhất qua OpenStreetMap..."}
              </div>
            ) : routeData ? (
              <div className="ml-route-stats-container">
                <div className="ml-route-stat-box">
                  <span className="ml-route-stat-label">{isEn ? "Distance" : "Khoảng cách"}</span>
                  <span className="ml-route-stat-num">
                    {routeData.distanceKm} km
                  </span>
                </div>
                <div className="ml-route-stat-box">
                  <span className="ml-route-stat-label">{isEn ? "Transit Time" : "Thời gian xe máy"}</span>
                  <span className="ml-route-stat-num highlight">
                    ~{routeData.minutes} {isEn ? "mins" : "phút"}
                  </span>
                </div>
                <div className="ml-route-stat-box">
                  <span className="ml-route-stat-label">{isEn ? "300m Radius" : "Bán kính 300m"}</span>
                  <span
                    className={`ml-route-stat-num ${routeData.inGeofence ? "in" : "out"}`}
                  >
                    {routeData.inGeofence
                      ? isEn ? "✅ IN GEOFENCE" : "✅ ĐÃ ĐẾN VÙNG"
                      : isEn ? "📍 OUTSIDE" : "📍 NGOÀI VÙNG"}
                  </span>
                </div>
              </div>
            ) : null}

            {geofenceTriggered && (
              <div className="ml-geofence-alert-box">
                <span className="ml-geofence-bell">🔔</span>
                <div>
                  <div className="ml-geofence-title">
                    {isEn ? `Welcome to ${name}!` : `Chào mừng bạn đã đến gần ${name}!`}
                  </div>
                  <div className="ml-geofence-desc">
                    {isEn
                      ? "You are within 300m of the market. Farmers have received a chime to prepare your fresh basket!"
                      : "Bạn đang ở trong bán kính 300m. Nông dân tại các sạp đã nhận được tín hiệu chuẩn bị túi hàng tươi cho bạn!"}
                  </div>
                </div>
              </div>
            )}

            {farmerAlertMsg && (
              <div className="ml-farmer-alert-preview">
                👨‍🌾 <strong>{isEn ? "Grower Alert:" : "Phía Nông Dân:"}</strong> {farmerAlertMsg}
              </div>
            )}

            <div
              className="ml-current-pos-section"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "var(--color-bg-base, #f8fafc)",
                borderRadius: 8,
                margin: "4px 0",
                border: "1px solid var(--color-border, #e2e8f0)",
                fontSize: 13,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                📍 {isEn ? "Your GPS Location:" : "Vị trí GPS của bạn:"}{" "}
                <strong>{userPos.label}</strong> (
                {userPos.lat.toFixed(4)}, {userPos.lon.toFixed(4)})
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  height: "auto",
                }}
                onClick={handleGetRealGps}
              >
                📡 {isEn ? "Refresh GPS" : "Dò lại GPS"}
              </button>
            </div>

            {routeData?.steps && routeData.steps.length > 0 && (
              <div className="ml-route-steps-section">
                <div className="ml-steps-heading">🚦 {isEn ? "Route Directions:" : "Hướng dẫn lộ trình:"}</div>
                <ol className="ml-steps-list">
                  {routeData.steps.slice(0, 4).map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ol>
              </div>
            )}

            <div className="ml-map-modal-footer">
              {routeData?.googleMapsUrl && (
                <a
                  href={routeData.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-btn-gmaps"
                >
                  🧭 {isEn ? "Open in Google Maps" : "Mở Google Maps Dẫn Đường"}
                </a>
              )}
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  if (onViewStalls) onViewStalls(market);
                }}
                icon={<span>🧺</span>}
              >
                {isEn ? "Browse Stalls at Market" : "Xem sản phẩm sạp tại chợ"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
