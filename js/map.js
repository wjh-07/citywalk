(function (global) {
  "use strict";

  const CityWalk = global.CityWalk = global.CityWalk || {};
  const UI = CityWalk.UI;
  let amapPromise = null;

  function hasKey() {
    const config = global.APP_CONFIG || {};
    return Boolean(config.amapKey && String(config.amapKey).trim());
  }

  function loadAMap() {
    if (global.AMap) return Promise.resolve(global.AMap);
    if (amapPromise) return amapPromise;
    const config = global.APP_CONFIG || {};
    amapPromise = new Promise(function (resolve, reject) {
      if (!config.amapKey) {
        reject(new Error("missing-key"));
        return;
      }
      if (config.securityCode) {
        global._AMapSecurityConfig = { securityJsCode: config.securityCode };
      }
      const script = document.createElement("script");
      script.src = "https://webapi.amap.com/maps?v=2.0&key=" + encodeURIComponent(config.amapKey);
      script.async = true;
      script.onload = function () {
        if (global.AMap) resolve(global.AMap);
        else reject(new Error("amap-load-failed"));
      };
      script.onerror = function () { reject(new Error("amap-network-error")); };
      document.head.appendChild(script);
    });
    return amapPromise;
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getFallbackPoints(stops) {
    const list = stops.filter(function (stop) {
      return Number.isFinite(Number(stop.lng)) && Number.isFinite(Number(stop.lat));
    });
    if (!list.length) return [];
    let minLng = Math.min.apply(null, list.map(function (stop) { return Number(stop.lng); }));
    let maxLng = Math.max.apply(null, list.map(function (stop) { return Number(stop.lng); }));
    let minLat = Math.min.apply(null, list.map(function (stop) { return Number(stop.lat); }));
    let maxLat = Math.max.apply(null, list.map(function (stop) { return Number(stop.lat); }));
    const lngSpan = Math.max(maxLng - minLng, 0.012);
    const latSpan = Math.max(maxLat - minLat, 0.009);
    minLng -= (lngSpan - (maxLng - minLng)) / 2;
    maxLng += (lngSpan - (maxLng - minLng)) / 2;
    minLat -= (latSpan - (maxLat - minLat)) / 2;
    maxLat += (latSpan - (maxLat - minLat)) / 2;
    const padX = 110;
    const padY = 76;
    const width = 1000;
    const height = 520;
    return list.map(function (stop, index) {
      const x = padX + ((Number(stop.lng) - minLng) / (maxLng - minLng || 1)) * (width - padX * 2);
      const y = height - padY - ((Number(stop.lat) - minLat) / (maxLat - minLat || 1)) * (height - padY * 2);
      return { stop: stop, x: x, y: y, index: index };
    });
  }

  function renderFallbackMap(container, stops, note) {
    if (!container) return;
    if (container._citywalkMap) {
      try { container._citywalkMap.destroy(); } catch (error) { /* noop */ }
      container._citywalkMap = null;
    }
    const points = getFallbackPoints(stops || []);
    if (!points.length) {
      container.innerHTML = '<div class="map-placeholder"><span class="map-placeholder__cross" aria-hidden="true">＋</span><strong>' +
        escapeHtml(note || "暂无站点") + '</strong><p>选择路线后，这里会显示城市漫游路径。</p></div>';
      return;
    }
    const polyline = points.map(function (point) { return point.x.toFixed(1) + "," + point.y.toFixed(1); }).join(" ");
    const markers = points.map(function (point) {
      return '<g class="fallback-marker" transform="translate(' + point.x.toFixed(1) + ' ' + point.y.toFixed(1) + ')">' +
        '<circle r="23" class="fallback-marker__halo"></circle>' +
        '<circle r="16" class="fallback-marker__dot"></circle>' +
        '<text text-anchor="middle" dominant-baseline="central">' + (point.index + 1) + '</text>' +
        '<text class="fallback-marker__label" x="28" y="5">' + escapeHtml(point.stop.name) + '</text>' +
      '</g>';
    }).join("");
    container.innerHTML =
      '<div class="map-fallback" role="img" aria-label="城市漫游路线示意地图">' +
        '<svg viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
          '<defs>' +
            '<pattern id="map-grid" width="54" height="54" patternUnits="userSpaceOnUse"><path d="M54 0H0V54" fill="none" stroke="rgba(31,111,92,.12)" stroke-width="1"/></pattern>' +
            '<linearGradient id="map-wash" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#edf2ed"/><stop offset="1" stop-color="#f8f9f6"/></linearGradient>' +
          '</defs>' +
          '<rect width="1000" height="520" fill="url(#map-wash)"/>' +
          '<rect width="1000" height="520" fill="url(#map-grid)" opacity=".65"/>' +
          '<path d="M-40 390C160 330 260 420 430 365S730 300 1040 340" fill="none" stroke="#d7e6df" stroke-width="72"/>' +
          '<path d="M-30 392C160 334 264 421 430 367S730 304 1035 343" fill="none" stroke="#f8faf8" stroke-width="2" stroke-dasharray="8 10"/>' +
          '<path d="M120 40C180 160 150 240 245 300S420 380 510 490" fill="none" stroke="#e1e6df" stroke-width="1.5"/>' +
          '<path d="M760 10C720 130 780 220 720 300S690 420 740 550" fill="none" stroke="#e1e6df" stroke-width="1.5"/>' +
          '<polyline points="' + polyline + '" fill="none" stroke="#1F6F5C" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="10 14"/>' +
          markers +
        '</svg>' +
        '<div class="map-fallback__badge"><span class="map-fallback__pulse"></span>' + escapeHtml(note || "本地示意地图") + '</div>' +
        '<div class="map-fallback__scale"><span>0</span><i></i><span>2 km</span></div>' +
      '</div>';
  }

  function renderAMap(container, stops, options) {
    const settings = options || {};
    return loadAMap().then(function (AMap) {
      if (container._citywalkMap) {
        try { container._citywalkMap.destroy(); } catch (error) { /* noop */ }
      }
      const map = new AMap.Map(container, {
        zoom: 13,
        center: [stops[0].lng, stops[0].lat],
        viewMode: "2D",
        mapStyle: "amap://styles/whitesmoke",
        resizeEnable: true
      });
      const markers = [];
      const infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -20), isCustom: false });
      stops.forEach(function (stop, index) {
        const marker = new AMap.Marker({
          position: [stop.lng, stop.lat],
          title: stop.name,
          anchor: "center",
          content: '<div class="amap-marker"><span>' + (index + 1) + '</span></div>'
        });
        marker.on("click", function () {
          infoWindow.setContent(
            '<div class="amap-info"><strong>' + escapeHtml(stop.name) + '</strong><p>' + escapeHtml(stop.description) + '</p><span>停留 ' + stop.stayMinutes + ' 分钟 · ' + UI.formatMoney(stop.cost) + '</span></div>'
          );
          infoWindow.open(map, marker.getPosition());
        });
        markers.push(marker);
      });
      map.add(markers);
      if (stops.length > 1) {
        map.add(new AMap.Polyline({
          path: stops.map(function (stop) { return [stop.lng, stop.lat]; }),
          strokeColor: "#1F6F5C",
          strokeWeight: 4,
          strokeStyle: "dashed",
          strokeDasharray: [8, 6],
          lineJoin: "round",
          lineCap: "round"
        }));
      }
      if (markers.length) {
        map.setFitView(markers, false, [60, 60, 60, 60], 15);
      }
      container._citywalkMap = map;
      return map;
    }).catch(function () {
      renderFallbackMap(container, stops, "高德地图暂不可用，当前为本地示意地图");
    });
  }

  function renderRouteMap(container, stops, options) {
    if (!container) return;
    const settings = options || {};
    const list = (stops || []).filter(Boolean);
    if (!list.length) {
      renderFallbackMap(container, [], settings.emptyMessage || "当天还没有安排");
      return;
    }
    if (!hasKey()) {
      renderFallbackMap(container, list, settings.fallbackMessage || "配置高德 Key 后显示真实地图");
      return;
    }
    container.innerHTML = '<div class="map-loading"><span></span><span></span><span></span><p>正在加载城市地图</p></div>';
    renderAMap(container, list, settings);
  }

  CityWalk.Map = {
    renderRouteMap: renderRouteMap,
    renderFallbackMap: renderFallbackMap,
    loadAMap: loadAMap,
    hasKey: hasKey
  };
})(window);
