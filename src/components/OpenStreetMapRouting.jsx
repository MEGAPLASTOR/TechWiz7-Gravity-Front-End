import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import {
  notificationService,
  playNotificationChime,
} from "../services/notificationService";
import { useLanguage } from "../context";
import { getMarketOperatingStatus } from "../utils/marketUtils";

export default function OpenStreetMapRouting({
  token,
  callApi,
  targetMarketId,
  targetMarket,
  onSelectMarketProducts,
}) {
  const { isEn, localizeMarketName } = useLanguage();
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const userMarkerRef = useRef(null);
  const marketMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const geofenceCircleRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastAlertRef = useRef({
    marketId: null,
    timestamp: 0,
  });

  // Default initial position near active market (Can Tho / CUSC: 10.0361, 105.7941)
  const [userPos, setUserPos] = useState({
    lat: 10.0361,
    lon: 105.7941,
    label: isEn ? "Detecting location..." : "Đang dò vị trí...",
  });

  const [gpsStatus, setGpsStatus] = useState({
    loading: true,
    active: false,
    isIp: false,
    city: null,
    accuracy: null,
    error: null,
    warning: null,
  });

  const [selectedMarketId, setSelectedMarketId] = useState(
    targetMarketId || targetMarket?.id || targetMarket?.marketId || "",
  );
  const selectedMarketIdRef = useRef(selectedMarketId);
  useEffect(() => {
    selectedMarketIdRef.current = selectedMarketId;
  }, [selectedMarketId]);

  const [markets, setMarkets] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [geofenceAlert, setGeofenceAlert] = useState(null);
  const [farmerAlert, setFarmerAlert] = useState(null);
  const [showChromeHelp, setShowChromeHelp] = useState(false);

  const safeCallApi = async (url, method = "GET", body = null) => {
    if (callApi && typeof callApi === "function") {
      try {
        return await callApi(url, method, body);
      } catch (err) {
        console.warn("callApi error:", err);
      }
    }
    try {
      const activeToken =
        token ||
        localStorage.getItem("ml_token") ||
        localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
      };
      if (activeToken) headers["Authorization"] = `Bearer ${activeToken}`;
      const opts = {
        method,
        headers,
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(url, opts);
      if (!res.ok)
        return {
          status: res.status,
          data: null,
        };
      const data = await res.json();
      return {
        status: res.status,
        data,
      };
    } catch (err) {
      return {
        status: 500,
        error: err,
      };
    }
  };

  useEffect(() => {
    const loadMarkets = async () => {
      try {
        const res = await safeCallApi("/api/markets", "GET");
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map((m) => ({
            ...m,
            marketId: m.marketId || m.id,
            id: m.marketId || m.id,
          }));
          setMarkets(formatted);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách chợ:", err);
      }
    };
    loadMarkets();
  }, []);

  // IP Geolocation fallback when hardware GPS is blocked by browser (HTTP origin / permissions)
  const fetchIpLocation = async () => {
    try {
      const isHttps = window.location.protocol === "https:";
      let lat = null,
        lon = null,
        city = "Việt Nam";

      if (isHttps) {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        if (data && data.success && data.latitude && data.longitude) {
          lat = Number(data.latitude);
          lon = Number(data.longitude);
          city = data.city || data.region || "Việt Nam";
        }
      } else {
        const res = await fetch("http://ip-api.com/json/");
        const data = await res.json();
        if (data && data.status === "success" && data.lat && data.lon) {
          lat = Number(data.lat);
          lon = Number(data.lon);
          city = data.city || data.regionName || "Việt Nam";
        }
      }

      if (lat !== null && lon !== null) {
        return { lat, lon, city };
      }
    } catch (err) {
      console.warn("fetchIpLocation warning:", err);
    }
    return null;
  };

  const requestRealGps = async (isInitial = false) => {
    setGpsStatus((prev) => ({
      ...prev,
      loading: true,
      error: null,
      warning: null,
    }));

    const isSecure =
      window.isSecureContext ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // Proactively fallback to IP Geolocation when running over insecure HTTP (e.g. LAN / VPS IP)
    if (!isSecure) {
      const ipLoc = await fetchIpLocation();
      if (ipLoc) {
        const realPos = {
          lat: ipLoc.lat,
          lon: ipLoc.lon,
          label: isEn
            ? `🌐 IP Location (${ipLoc.city})`
            : `🌐 Vị trí mạng IP (${ipLoc.city})`,
          accuracy: 1000,
        };
        setUserPos(realPos);
        setGpsStatus({
          loading: false,
          active: true,
          isIp: true,
          city: ipLoc.city,
          accuracy: 1000,
          error: null,
          warning: isEn
            ? "HTTP origin restricts hardware GPS. Auto-located via IP network. Click anywhere on map to customize pin."
            : "Trình duyệt hạn chế GPS phần cứng trên HTTP. Đã tự động định vị qua mạng IP. Nhấp bản đồ để đổi vị trí.",
        });
        if (leafletMap.current) {
          leafletMap.current.setView([ipLoc.lat, ipLoc.lon], 13);
        }
        fetchRoute(
          ipLoc.lat,
          ipLoc.lon,
          selectedMarketIdRef.current || selectedMarketId,
        );
        return;
      }
    }

    if (!navigator.geolocation) {
      const ipLoc = await fetchIpLocation();
      const fallbackLat = ipLoc?.lat || 10.0361;
      const fallbackLon = ipLoc?.lon || 105.7941;
      const fallbackLabel = ipLoc?.city
        ? `🌐 Vị trí mạng IP (${ipLoc.city})`
        : "Cần Thơ (Vị trí mặc định)";
      setUserPos({
        lat: fallbackLat,
        lon: fallbackLon,
        label: fallbackLabel,
      });
      setGpsStatus({
        loading: false,
        active: !!ipLoc,
        isIp: !!ipLoc,
        city: ipLoc?.city || null,
        accuracy: null,
        error: isEn
          ? "Browser does not support GPS Geolocation"
          : "Trình duyệt không hỗ trợ Geolocation GPS",
      });
      fetchRoute(
        fallbackLat,
        fallbackLon,
        selectedMarketIdRef.current || selectedMarketId,
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const realPos = {
          lat: latitude,
          lon: longitude,
          label: isEn
            ? `📍 Real GPS (±${Math.round(accuracy)}m)`
            : `📍 GPS Thực Tế (±${Math.round(accuracy)}m)`,
          accuracy: Math.round(accuracy),
        };
        setUserPos(realPos);
        setGpsStatus({
          loading: false,
          active: true,
          isIp: false,
          city: null,
          accuracy: Math.round(accuracy),
          error: null,
          warning: null,
        });
        if (leafletMap.current) {
          leafletMap.current.setView([latitude, longitude], 14);
        }
        fetchRoute(
          latitude,
          longitude,
          selectedMarketIdRef.current || selectedMarketId,
        );
        startLiveGpsWatcher();
      },
      async (err) => {
        console.warn("Hardware GPS unavailable, trying IP Geolocation:", err.message);
        const ipLoc = await fetchIpLocation();
        if (ipLoc) {
          setUserPos({
            lat: ipLoc.lat,
            lon: ipLoc.lon,
            label: isEn
              ? `🌐 IP Location (${ipLoc.city})`
              : `🌐 Vị trí mạng IP (${ipLoc.city})`,
            accuracy: 1000,
          });
          setGpsStatus({
            loading: false,
            active: true,
            isIp: true,
            city: ipLoc.city,
            accuracy: 1000,
            error: null,
            warning: isEn
              ? "Device GPS restricted on HTTP. Auto-located via IP network. Click map to customize pin."
              : "Trình duyệt hạn chế GPS thiết bị trên HTTP. Đã định vị theo IP mạng. Nhấp bản đồ để đổi vị trí.",
          });
          if (leafletMap.current) {
            leafletMap.current.setView([ipLoc.lat, ipLoc.lon], 13);
          }
          fetchRoute(
            ipLoc.lat,
            ipLoc.lon,
            selectedMarketIdRef.current || selectedMarketId,
          );
        } else {
          const fallbackLat = 10.0361;
          const fallbackLon = 105.7941;
          setUserPos({
            lat: fallbackLat,
            lon: fallbackLon,
            label: isEn
              ? "Can Tho (Default position)"
              : "Cần Thơ (Vị trí mặc định)",
          });
          setGpsStatus({
            loading: false,
            active: false,
            isIp: false,
            city: null,
            accuracy: null,
            error: isEn
              ? "Cannot access device GPS (HTTP origin restricted). Click map to choose your location."
              : "Chưa cấp quyền GPS (HTTP hạn chế quyền). Bạn có thể nhấp trực tiếp vào bản đồ để chọn vị trí.",
          });
          fetchRoute(
            fallbackLat,
            fallbackLon,
            selectedMarketIdRef.current || selectedMarketId,
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  };

  const startLiveGpsWatcher = () => {
    if (
      !navigator.geolocation ||
      (!window.isSecureContext && window.location.hostname !== "localhost")
    )
      return;
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserPos((prev) => {
          const movedMeters = getHaversineMeters(
            prev.lat,
            prev.lon,
            latitude,
            longitude,
          );
          if (movedMeters > 8) {
            fetchRoute(
              latitude,
              longitude,
              selectedMarketIdRef.current || selectedMarketId,
            );
            return {
              lat: latitude,
              lon: longitude,
              label: isEn
                ? `📍 Live GPS (±${Math.round(accuracy)}m)`
                : `📍 GPS Thực Tế (±${Math.round(accuracy)}m)`,
              accuracy: Math.round(accuracy),
            };
          }
          return prev;
        });
      },
      (err) => console.debug("watchPosition status:", err.message),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  const handleManualPinSelect = (lat, lon, label) => {
    const roundedLat = Number(lat.toFixed(5));
    const roundedLon = Number(lon.toFixed(5));
    setUserPos({
      lat: roundedLat,
      lon: roundedLon,
      label: label || (isEn ? "📍 Custom Map Location" : "📍 Điểm ghim trên bản đồ"),
      accuracy: 10,
    });
    setGpsStatus({
      loading: false,
      active: true,
      isIp: false,
      city: null,
      accuracy: 10,
      error: null,
      warning: null,
    });
    if (leafletMap.current) {
      leafletMap.current.setView([roundedLat, roundedLon], 14);
    }
    fetchRoute(roundedLat, roundedLon, selectedMarketIdRef.current || selectedMarketId);
  };

  useEffect(() => {
    if (!mapRef.current) return;
    if (!leafletMap.current) {
      const initialLat = 10.0336;
      const initialLon = 105.7800;
      const map = L.map(mapRef.current).setView([initialLat, initialLon], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Allow clicking anywhere on the map to set user location pin
      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        handleManualPinSelect(
          lat,
          lng,
          isEn ? "📍 Selected Pin on Map" : "📍 Điểm ghim trên bản đồ",
        );
      });

      leafletMap.current = map;
    }
    requestRealGps(true);
    return () => {
      if (watchIdRef.current && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  const fetchRoute = async (lat, lon, marketId = "") => {
    setLoading(true);
    setGeofenceAlert(null);
    setFarmerAlert(null);
    try {
      let url = `/api/markets/nearest-and-route?latitude=${lat}&longitude=${lon}`;
      if (marketId) url += `&marketId=${marketId}`;
      const res = await safeCallApi(url, "GET");
      let data = res.data?.data || res.data;
      if (res.status === 404 || !data?.routeGeometry) {
        data = await calculateClientSideRoute(lat, lon, marketId);
      }
      setRouteInfo(data);
      updateMapDisplay(lat, lon, data);
      if (
        data.inGeofence ||
        (data.distanceKilometers !== undefined &&
          data.distanceKilometers <= 0.35)
      ) {
        triggerGeofenceCheckIn(lat, lon, data.marketId, data.marketName);
      }
    } catch (err) {
      console.error("Lỗi tính đường:", err);
      const data = await calculateClientSideRoute(lat, lon, marketId);
      setRouteInfo(data);
      updateMapDisplay(lat, lon, data);
    } finally {
      setLoading(false);
    }
  };

  const calculateClientSideRoute = async (userLat, userLon, targetMId) => {
    let target = null;
    if (targetMId && markets.length > 0) {
      target = markets.find((m) => m.marketId === Number(targetMId));
    }
    if (!target && markets.length > 0) {
      target = markets.reduce((prev, curr) => {
        const d1 = getHaversineMeters(
          userLat,
          userLon,
          prev.latitude,
          prev.longitude,
        );
        const d2 = getHaversineMeters(
          userLat,
          userLon,
          curr.latitude,
          curr.longitude,
        );
        return d1 < d2 ? prev : curr;
      });
    }
    if (!target) {
      target = {
        marketId: 1,
        name: "CUSC",
        address: "Số 1, Lý Tự Trọng, An Phú, Ninh Kiều, Cần Thơ",
        latitude: 10.033592,
        longitude: 105.779754,
      };
    }
    const mLat = Number(target.latitude);
    const mLon = Number(target.longitude);
    try {
      const osrmRes = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${mLon},${mLat}?overview=full&geometries=geojson&steps=true`,
      );
      const osrmData = await osrmRes.json();
      if (osrmData.routes && osrmData.routes.length > 0) {
        const route = osrmData.routes[0];
        const distKm = Math.round((route.distance / 1000) * 10) / 10;
        const mins = Math.ceil(route.duration / 60);
        const coords = route.geometry.coordinates.map((pt) => [pt[1], pt[0]]);
        const steps = (route.legs[0]?.steps || [])
          .map(
            (s) =>
              `Đi ${s.name ? `vào ${s.name}` : "tiếp tục"} (${Math.round(s.distance)} m)`,
          )
          .filter(Boolean);
        return {
          marketId: target.marketId,
          marketName: target.name,
          marketAddress: target.address,
          targetMarketObj: target,
          marketLatitude: mLat,
          marketLongitude: mLon,
          distanceKilometers: distKm,
          estimatedMinutes: mins,
          routeGeometry: coords,
          navigationSteps: steps,
          inGeofence: distKm <= 0.3,
          googleMapsNavUrl: `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${mLat},${mLon}`,
        };
      }
    } catch {}
    const distMeters = getHaversineMeters(userLat, userLon, mLat, mLon);
    const km = Math.round((distMeters / 1000) * 10) / 10;
    return {
      marketId: target.marketId,
      marketName: target.name,
      marketAddress: target.address,
      targetMarketObj: target,
      marketLatitude: mLat,
      marketLongitude: mLon,
      distanceKilometers: km,
      estimatedMinutes: Math.ceil(km * 2.5),
      routeGeometry: [
        [userLat, userLon],
        [mLat, mLon],
      ],
      navigationSteps: [
        `Đi thẳng theo trục đường tới ${target.name}`,
        `Đến cổng chợ tại ${target.address}`,
      ],
      inGeofence: distMeters <= 300,
      googleMapsNavUrl: `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${mLat},${mLon}`,
    };
  };

  const getHaversineMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const updateMapDisplay = (userLat, userLon, route) => {
    const map = leafletMap.current;
    if (!map) return;
    const userIcon = L.divIcon({
      className: "user-pin-marker",
      html: '<div style="background:#0284c7;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 10px rgba(2,132,199,0.7);cursor:grab;" title="Kéo thả để đổi vị trí">📍</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    const marketIcon = L.divIcon({
      className: "market-pin-marker",
      html: '<div style="background:#16a34a;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 2px 12px rgba(22,163,74,0.7);">🥬</div>',
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLat, userLon]);
    } else {
      userMarkerRef.current = L.marker([userLat, userLon], {
        icon: userIcon,
        draggable: true,
      })
        .addTo(map)
        .bindPopup(
          isEn
            ? "<b>Your Location</b><br>💡 Tip: Drag this pin or click map to change location!"
            : "<b>Vị trí của bạn</b><br>💡 Mẹo: Kéo thả ghim hoặc nhấp vào bản đồ để đổi vị trí!",
        );

      userMarkerRef.current.on("dragend", (event) => {
        const pos = event.target.getLatLng();
        handleManualPinSelect(
          pos.lat,
          pos.lng,
          isEn ? "📍 Dragged Location Pin" : "📍 Vị trí kéo thả trên bản đồ",
        );
      });
    }
    if (route?.marketLatitude && route?.marketLongitude) {
      const mLat = Number(route.marketLatitude);
      const mLon = Number(route.marketLongitude);
      const op = getMarketOperatingStatus(route.targetMarketObj || {}, isEn);
      const popupHtml = `<b>${route.marketName}</b><br><span style="font-size:12px;color:#555;">${route.marketAddress}</span><br><span style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;background:${op.isOpen ? '#dcfce7' : '#f3f4f6'};color:${op.isOpen ? '#15803d' : '#4b5563'};">${op.badgeText}</span>`;

      if (marketMarkerRef.current) {
        marketMarkerRef.current.setLatLng([mLat, mLon]);
        marketMarkerRef.current.setPopupContent(popupHtml);
      } else {
        marketMarkerRef.current = L.marker([mLat, mLon], {
          icon: marketIcon,
        })
          .addTo(map)
          .bindPopup(popupHtml);
      }
      if (geofenceCircleRef.current) {
        geofenceCircleRef.current.setLatLng([mLat, mLon]);
        geofenceCircleRef.current.setStyle({
          color: route?.inGeofence ? "#16a34a" : "#059669",
          fillColor: route?.inGeofence ? "#22c55e" : "#16a34a",
          fillOpacity: route?.inGeofence ? 0.22 : 0.1,
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
              ? "<b>300m Geofence Zone</b><br>Auto check-in when nearby!"
              : "<b>Vùng Geofence 300m</b><br>Tự động thông báo khi đến gần chợ!",
          );
      }
      if (route.routeGeometry && route.routeGeometry.length > 0) {
        if (polylineRef.current) {
          polylineRef.current.setLatLngs(route.routeGeometry);
        } else {
          polylineRef.current = L.polyline(route.routeGeometry, {
            color: "#16a34a",
            weight: 5,
            opacity: 0.9,
            lineJoin: "round",
          }).addTo(map);
        }
        const bounds = L.latLngBounds([
          [userLat, userLon],
          [mLat, mLon],
          ...route.routeGeometry,
        ]);
        map.fitBounds(bounds, {
          padding: [50, 50],
        });
      }
    }
  };

  const triggerGeofenceCheckIn = async (
    lat,
    lon,
    marketId,
    marketName,
    isManual = false,
  ) => {
    const now = Date.now();
    const cooldownMs = 5 * 60 * 1000;
    if (
      !isManual &&
      lastAlertRef.current.marketId === marketId &&
      now - lastAlertRef.current.timestamp < cooldownMs
    ) {
      return;
    }
    lastAlertRef.current = {
      marketId,
      timestamp: now,
    };
    setGeofenceAlert({
      title: isEn
        ? "📍 Welcome to the market!"
        : "📍 Chào mừng bạn đã đến phiên chợ!",
      message: isEn
        ? `You are within 300m of ${marketName}. Your pre-orders are ready at the stalls!`
        : `Bạn đang ở trong bán kính 300m quanh ${marketName}. Đơn hàng đặt trước của bạn đã sẵn sàng nhận tại sạp!`,
      marketName,
    });
    setFarmerAlert({
      farmerName:
        targetMarket?.farmerName ||
        (isEn ? "Market Stall Farmer" : "Chủ Sạp Nông Dân"),
      msg: isEn
        ? `🔔 Notification to Farmer: Customer entered 300m range of the market! Prepare their reserved produce bundle.`
        : `🔔 Thông báo tới Nông Dân: Khách hàng vừa tiến vào phạm vi 300m chợ! Hãy chuẩn bị sẵn giỏ nông sản đã hẹn.`,
    });
    playNotificationChime();
    try {
      notificationService.showBrowserNotification(
        `📍 Bạn đã đến ${marketName}!`,
        {
          body: `Bạn đang ở trong bán kính 300m quanh chợ. Đơn hàng đặt trước đã sẵn sàng nhận tại quầy!`,
          tag: `geofence-${marketId}`,
          onClick: () => {
            window.focus();
          },
        },
      );
    } catch (err) {
      console.debug("Browser notification notice:", err);
    }
    try {
      await safeCallApi("/api/customer/geofence/check-in", "POST", {
        latitude: lat,
        longitude: lon,
        targetMarketId: marketId,
      });
    } catch {}
  };

  return (
    <div className="grid-cols-2">
      <div className="card">
        <div className="card-top">
          <div className="card-heading">
            🗺️ Bản Đồ OpenStreetMap Trực Tuyến
            <span
              className="live-badge"
              style={{
                background: "#10b981",
                color: "#ffffff",
              }}
            >
              <span className="live-pulse"></span>
              OSRM Engine Active
            </span>
          </div>
          <span className="badge-tag">Free & Open Source</span>
        </div>

        <div ref={mapRef} id="osm-map-container" className="map-view-box"></div>

        {/* Map Interactive Tip & Quick Preset Chips */}
        <div
          style={{
            marginTop: 10,
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
                ? "Click anywhere on the map or drag the blue pin to change position!"
                : "Nhấp chuột vào bất kỳ điểm nào trên bản đồ hoặc kéo ghim xanh để đổi vị trí!"}
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
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-main, #1e2922)",
              }}
            >
              {isEn ? "Quick Presets:" : "Chọn nhanh:"}
            </span>
            <button
              type="button"
              className="btn btn-outline"
              style={{
                fontSize: 11,
                padding: "3px 8px",
                height: "auto",
                borderColor: "#16a34a",
                color: "#166534",
                background: "#dcfce7",
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={() =>
                handleManualPinSelect(
                  10.0361,
                  105.7941,
                  "Cần Thơ (Gần Chợ CUSC)",
                )
              }
            >
              📍 Cần Thơ (CUSC)
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{
                fontSize: 11,
                padding: "3px 8px",
                height: "auto",
                borderColor: "var(--color-border, #cbd5e1)",
                color: "var(--color-text-main, #1e2922)",
                background: "var(--color-bg-surface, #ffffff)",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() =>
                handleManualPinSelect(21.0285, 105.8542, "Hoàn Kiếm, Hà Nội")
              }
            >
              📍 Hà Nội
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{
                fontSize: 11,
                padding: "3px 8px",
                height: "auto",
                borderColor: "var(--color-border, #cbd5e1)",
                color: "var(--color-text-main, #1e2922)",
                background: "var(--color-bg-surface, #ffffff)",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() =>
                handleManualPinSelect(10.7769, 106.7009, "Quận 1, TP. HCM")
              }
            >
              📍 TP. HCM
            </button>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--color-text-main, #1e2922)",
              minWidth: 90,
            }}
          >
            {isEn ? "Destination:" : "Đích đến:"}
          </span>
          <select
            className="input-control"
            value={selectedMarketId}
            onChange={(e) => {
              setSelectedMarketId(e.target.value);
              fetchRoute(userPos.lat, userPos.lon, e.target.value);
            }}
          >
            <option value="">
              🎯 Tự động tìm chợ gần tôi nhất (Haversine)
            </option>
            {markets.map((m) => (
              <option key={m.marketId} value={m.marketId}>
                {m.name} ({m.address?.split(",")[1] || m.address})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-top">
          <div className="card-heading">
            🧭 Lộ Trình & Định Vị Geofencing (300m)
          </div>
          <span className="badge-tag">O2O Smart Navigation</span>
        </div>

        {geofenceAlert && (
          <div className="geofence-banner">
            <div className="geofence-icon">🔔</div>
            <div>
              <div className="geofence-title">{geofenceAlert.title}</div>
              <div className="geofence-desc">{geofenceAlert.message}</div>
            </div>
          </div>
        )}

        {farmerAlert && (
          <div
            style={{
              background: "rgba(245, 158, 11, 0.15)",
              border: "1px solid #f59e0b",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 14,
              fontSize: 13,
              color: "#92400e",
            }}
          >
            <b>👨‍🌾 {isEn ? "Farmer View:" : "Góc nhìn Nông Dân:"}</b> {farmerAlert.msg}
          </div>
        )}

        {/* GPS Status Bar - Clear High Contrast Colors */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: gpsStatus.active
              ? "rgba(16, 185, 129, 0.12)"
              : gpsStatus.loading
                ? "rgba(59, 130, 246, 0.12)"
                : "rgba(245, 158, 11, 0.14)",
            border: `1px solid ${
              gpsStatus.active
                ? "#10b981"
                : gpsStatus.loading
                  ? "#3b82f6"
                  : "#f59e0b"
            }`,
            borderRadius: 8,
            padding: "9px 12px",
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>
              {gpsStatus.active
                ? gpsStatus.isIp
                  ? "🌐"
                  : "🛰️"
                : gpsStatus.loading
                  ? "📡"
                  : "⚠️"}
            </span>
            <div>
              {gpsStatus.loading ? (
                <span
                  style={{
                    color: "#0369a1",
                    fontWeight: 600,
                  }}
                >
                  {isEn
                    ? "Detecting device / IP location..."
                    : "Đang dò tìm tọa độ (GPS / Mạng IP)..."}
                </span>
              ) : gpsStatus.active ? (
                <div>
                  <span
                    style={{
                      color: "#065f46",
                      fontWeight: 700,
                    }}
                  >
                    {gpsStatus.isIp
                      ? isEn
                        ? `🌐 IP Location (${gpsStatus.city || "Network"}) • Auto-detected`
                        : `🌐 Định vị mạng IP (${gpsStatus.city || "Tự động"}) • Đang hoạt động`
                      : isEn
                        ? `🛰️ Live Device GPS (±${gpsStatus.accuracy}m) • Real-time`
                        : `🛰️ GPS Thiết Bị Thực Tế (±${gpsStatus.accuracy}m) • Trực tiếp`}
                  </span>
                  {gpsStatus.warning && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#92400e",
                        marginTop: 2,
                        fontWeight: 500,
                      }}
                    >
                      {gpsStatus.warning}
                    </div>
                  )}
                </div>
              ) : (
                <span
                  style={{
                    color: "#92400e",
                    fontWeight: 600,
                  }}
                >
                  {gpsStatus.error ||
                    (isEn
                      ? "GPS permission needed (Using default position)"
                      : "Chưa cấp quyền GPS (Dùng vị trí mặc định)")}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{
                fontSize: 12,
                padding: "4px 10px",
                height: "auto",
                borderColor: "var(--color-border, #cbd5e1)",
                color: "var(--color-text-main, #1e2922)",
                background: "var(--color-bg-surface, #ffffff)",
                fontWeight: 600,
                cursor: "pointer",
              }}
              onClick={() => requestRealGps(false)}
            >
              {isEn ? "🔄 Re-scan" : "🔄 Dò lại GPS"}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              style={{
                fontSize: 11,
                padding: "4px 8px",
                height: "auto",
                borderColor: "transparent",
                color: "#0284c7",
                background: "transparent",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() => setShowChromeHelp(!showChromeHelp)}
              title="Hướng dẫn bật GPS trên HTTP mạng LAN"
            >
              ❓ {isEn ? "Help" : "Trợ giúp"}
            </button>
          </div>
        </div>

        {/* Chrome HTTP GPS Guide (Collapsible) */}
        {showChromeHelp && (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #93c5fd",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 12,
              fontSize: 12,
              color: "#1e3a8a",
              lineHeight: 1.5,
            }}
          >
            <b>ℹ️ Lưu ý về GPS trên trình duyệt:</b>
            <div style={{ marginTop: 4 }}>
              Khi truy cập qua IP HTTP (như <code>http://172.16.2.89:5178</code>), các trình duyệt Chromium/Edge mặc định chặn quyền GPS phần cứng để bảo mật. Hệ thống đã tự động kích hoạt <b>định vị theo IP mạng</b> hoặc bạn có thể <b>nhấp bất kỳ đâu trên bản đồ</b> để ghim vị trí.
            </div>
            <div style={{ marginTop: 6 }}>
              Nếu muốn cấp quyền GPS phần cứng qua HTTP: Mở Chrome truy cập <code>chrome://flags/#unsafely-treat-insecure-origin-as-secure</code>, dán <code>http://172.16.2.89:5178</code> vào, chọn <b>Enabled</b> và khởi động lại trình duyệt.
            </div>
          </div>
        )}

        {/* Current Location Bar - High Contrast */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--color-bg-base, #f8fafc)",
            border: "1px solid var(--color-border, #e2e8f0)",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 16,
            fontSize: 13,
            color: "var(--color-text-body, #334155)",
          }}
        >
          <div>
            <span
              style={{
                color: "var(--color-text-muted, #64748b)",
                fontWeight: 500,
              }}
            >
              {isEn ? "📍 Current location: " : "📍 Vị trí hiện tại: "}
            </span>
            <b
              style={{
                color: "var(--color-text-main, #0f172a)",
                fontWeight: 700,
              }}
            >
              {userPos.label}
            </b>{" "}
            <span
              style={{
                color: "var(--color-text-muted, #64748b)",
                fontSize: 12,
              }}
            >
              ({userPos.lat.toFixed(4)}, {userPos.lon.toFixed(4)})
            </span>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{
              fontSize: 12,
              padding: "4px 10px",
              height: "auto",
              borderColor: "var(--color-border, #cbd5e1)",
              color: "var(--color-text-main, #1e2922)",
              background: "var(--color-bg-surface, #ffffff)",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => requestRealGps(false)}
          >
            {isEn ? "📡 Update" : "📡 Cập nhật"}
          </button>
        </div>

        {loading ? (
          <div
            style={{
              padding: 20,
              textAlign: "center",
              color: "var(--color-primary-dark, #1b5e20)",
              fontWeight: 600,
            }}
          >
            {isEn
              ? "⏳ Finding shortest route via OpenStreetMap..."
              : "⏳ Đang giải thuật tìm đoạn đường ngắn nhất qua OpenStreetMap..."}
          </div>
        ) : routeInfo ? (
          <div>
            <div className="route-stat-grid">
              <div className="route-stat-item">
                <div className="route-stat-label">
                  {isEn ? "Market Destination" : "Chợ Đón Tiếp"}
                </div>
                <div
                  className="route-stat-val"
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--color-primary, #2e7d32)",
                  }}
                >
                  {localizeMarketName(routeInfo.marketName)}
                </div>
              </div>
              <div className="route-stat-item">
                <div className="route-stat-label">
                  {isEn ? "Distance" : "Quãng Đường"}
                </div>
                <div
                  className="route-stat-val"
                  style={{ color: "var(--color-text-main, #0f172a)" }}
                >
                  {routeInfo.distanceKilometers} km
                </div>
              </div>
              <div className="route-stat-item">
                <div className="route-stat-label">
                  {isEn ? "Estimated Time" : "Thời Gian Dự Kiến"}
                </div>
                <div
                  className="route-stat-val"
                  style={{
                    color: "#d97706",
                  }}
                >
                  ~{routeInfo.estimatedMinutes} {isEn ? "mins" : "phút"}
                </div>
              </div>
              <div className="route-stat-item">
                <div className="route-stat-label">Geofence 300m</div>
                <div
                  className="route-stat-val"
                  style={{
                    fontSize: "0.9rem",
                    color: routeInfo.inGeofence ? "#16a34a" : "#dc2626",
                  }}
                >
                  {routeInfo.inGeofence
                    ? isEn
                      ? "✅ INSIDE"
                      : "✅ ĐÃ VÀO VÙNG"
                    : isEn
                      ? "❌ OUTSIDE"
                      : "❌ NGOÀI VÙNG"}
                </div>
              </div>
            </div>

            {/* Destination Market Box - Clear High Contrast */}
            <div
              style={{
                background: "var(--color-bg-base, #f8fafc)",
                border: "1px solid var(--color-border, #e2e8f0)",
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--color-text-main, #0f172a)",
                }}
              >
                🎯 {localizeMarketName(routeInfo.marketName)}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-text-body, #334155)",
                  marginTop: 3,
                }}
              >
                📍 {routeInfo.marketAddress}
              </div>
            </div>

            {/* Navigation Steps - Clear High Contrast */}
            <div
              style={{
                borderTop: "1px solid var(--color-border, #e2e8f0)",
                paddingTop: 10,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-text-main, #0f172a)",
                  marginBottom: 6,
                }}
              >
                {isEn
                  ? "🚦 Turn-by-turn navigation instructions:"
                  : "🚦 Hướng dẫn lộ trình chi tiết:"}
              </div>
              <ol
                className="steps-list"
                style={{ color: "var(--color-text-body, #334155)" }}
              >
                {routeInfo.navigationSteps?.slice(0, 5).map((step, idx) => (
                  <li
                    key={idx}
                    style={{ color: "var(--color-text-body, #334155)" }}
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 12,
              }}
            >
              {routeInfo.googleMapsNavUrl && (
                <a
                  href={routeInfo.googleMapsNavUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    textDecoration: "none",
                    borderColor: "#0284c7",
                    color: "#0369a1",
                    background: "var(--color-bg-surface, #ffffff)",
                    fontWeight: 600,
                  }}
                >
                  {isEn
                    ? "🧭 Open Google Maps Navigation"
                    : "🧭 Mở Google Maps Dẫn Đường"}
                </a>
              )}
              {onSelectMarketProducts && (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#16a34a",
                    borderColor: "#16a34a",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const currentM = markets.find(
                      (m) => m.marketId === Number(routeInfo.marketId),
                    ) || {
                      id: routeInfo.marketId,
                      name: routeInfo.marketName,
                      address: routeInfo.marketAddress,
                    };
                    onSelectMarketProducts(currentM);
                  }}
                >
                  {isEn
                    ? "🧺 View stalls & produce at this market →"
                    : "🧺 Xem sản phẩm sạp tại chợ này →"}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
