(function (global) {
  "use strict";

  const data = global.CITYWALK_DATA;
  const UI = global.CityWalk.UI;
  const Storage = global.CityWalk.Storage;
  const params = new URLSearchParams(window.location.search);
  const cityId = params.get("id");
  const state = { city: null, activeRouteId: null };

  function escape(value) {
    return UI.escapeHtml(value);
  }

  function routeCard(route, active) {
    const favorite = Storage.isFavorite(route.id);
    const routeNo = String(state.city.routeIds.indexOf(route.id) + 1).padStart(2, "0");
    const stops = UI.getStops(route);
    return '<article class="city-route-card' + (active ? " is-active" : "") + '" data-city-route="' + escape(route.id) + '">' +
      '<div class="city-route-card__media">' +
        '<div class="cover">' +
          '<span class="cover__no">NO.' + routeNo + ' / ' + escape(state.city.name) + '</span>' +
          '<span class="cover__seq">' + escape(stops.length ? stops[0].name : '') + '<i>→</i>' + escape(stops.length ? stops[stops.length - 1].name : '') + '</span>' +
          '<span class="cover__foot">' + stops.length + ' 站 · ' + UI.formatDuration(route.durationMinutes) + ' · ' + route.distanceKm + ' km</span>' +
        '</div>' +
        '<button class="favorite-button' + (favorite ? " is-active" : "") + '" type="button" data-favorite="' + escape(route.id) + '" aria-pressed="' + favorite + '" aria-label="' + (favorite ? "取消收藏" : "收藏") + escape(route.title) + '">' + UI.heartIcon() + '</button>' +
      '</div>' +
      '<div class="city-route-card__body">' +
        '<div class="tag-row"><span class="tag">' + escape(route.theme) + '</span><span class="tag tag--soft">' + escape(route.bestTime) + '</span></div>' +
        '<h3>' + escape(route.title) + '</h3>' +
        '<p>' + escape(route.summary) + '</p>' +
        '<div class="city-route-card__meta">' +
          '<span>' + UI.formatDuration(route.durationMinutes) + '</span>' +
          '<span>' + route.distanceKm + ' km</span>' +
          '<span>' + UI.formatMoney(route.budget) + '</span>' +
          '<span>' + route.stopIds.length + ' 站</span>' +
        '</div>' +
      '</div>' +
      '<button class="route-card__hit" type="button" data-select-route="' + escape(route.id) + '" aria-label="在地图中查看' + escape(route.title) + '"></button>' +
    '</article>';
  }

  function renderRouteList() {
    const root = document.getElementById("city-route-list");
    if (!root) return;
    root.innerHTML = state.city.routeIds.map(function (routeId) {
      const route = UI.getRoute(routeId);
      return route ? routeCard(route, route.id === state.activeRouteId) : "";
    }).join("");
  }

  function renderSelectedRoute() {
    const route = UI.getRoute(state.activeRouteId);
    if (!route) return;
    const stops = UI.getStops(route);
    const mapTitle = document.getElementById("city-map-title");
    const mapMeta = document.getElementById("city-map-meta");
    const selected = document.getElementById("city-selected-info");
    if (mapTitle) mapTitle.textContent = route.title;
    if (mapMeta) mapMeta.textContent = stops.length + " 站 · " + UI.formatDuration(route.durationMinutes);
    if (selected) {
      selected.innerHTML =
        '<div class="city-selected__copy">' +
          '<span class="eyebrow">SELECTED ROUTE</span>' +
          '<h3>' + escape(route.title) + '</h3>' +
          '<p>' + escape(route.summary) + '</p>' +
        '</div>' +
        '<div class="city-selected__meta">' +
          '<div><span>参考预算</span><strong>' + UI.formatMoney(route.budget) + '</strong></div>' +
          '<div><span>建议时段</span><strong>' + escape(route.bestTime) + '</strong></div>' +
        '</div>' +
        '<button class="btn btn--primary btn--wide" type="button" data-open-route="' + escape(route.id) + '">查看站点详情 <span aria-hidden="true">↗</span></button>';
    }
    const map = document.getElementById("city-map");
    if (map) {
      global.CityWalk.Map.renderRouteMap(map, stops, {
        fallbackMessage: "配置高德 Key 后显示真实地图",
        emptyMessage: "这条路线还没有站点"
      });
    }
  }

  function selectRoute(routeId) {
    const route = UI.getRoute(routeId);
    if (!route || route.cityId !== state.city.id) return;
    state.activeRouteId = routeId;
    document.querySelectorAll("[data-city-route]").forEach(function (card) {
      card.classList.toggle("is-active", card.getAttribute("data-city-route") === routeId);
    });
    renderSelectedRoute();
  }

  function renderCity() {
    const hero = document.getElementById("city-hero");
    const content = document.getElementById("city-content");
    const empty = document.getElementById("city-empty");
    const latin = document.getElementById("city-latin");
    const name = document.getElementById("city-name");
    const tagline = document.getElementById("city-tagline");
    const intro = document.getElementById("city-intro");
    const stats = document.getElementById("city-stats");

    if (hero) hero.hidden = false;
    if (content) content.hidden = false;
    if (empty) empty.hidden = true;
    if (latin) latin.textContent = state.city.latin + " / " + state.city.id.toUpperCase();
    if (name) name.textContent = state.city.name;
    if (tagline) tagline.textContent = state.city.tagline;
    if (intro) intro.textContent = state.city.intro;
    if (stats) {
      const stopCount = state.city.routeIds.reduce(function (sum, routeId) {
        const route = UI.getRoute(routeId);
        return sum + (route ? route.stopIds.length : 0);
      }, 0);
      stats.innerHTML =
        '<div><strong>' + state.city.routeIds.length + '</strong><span>条经典路线</span></div>' +
        '<div><strong>' + stopCount + '</strong><span>个沿途站点</span></div>' +
        '<div><strong>' + escape(state.city.bestSeason) + '</strong><span>推荐季节</span></div>';
    }
    document.title = state.city.name + "漫游路线 · 城市漫游计划";

    state.activeRouteId = state.city.routeIds[0];
    renderRouteList();
    renderSelectedRoute();

    const addMore = document.getElementById("add-more-routes");
    if (addMore) addMore.href = "explore.html?city=" + encodeURIComponent(state.city.id);
  }

  function renderUnknownCity() {
    const hero = document.getElementById("city-hero");
    const content = document.getElementById("city-content");
    const empty = document.getElementById("city-empty");
    const emptyContent = document.getElementById("city-empty-content");
    if (hero) hero.hidden = true;
    if (content) content.hidden = true;
    if (empty) empty.hidden = false;
    document.title = "未找到城市 · 城市漫游计划";
    if (emptyContent) {
      emptyContent.innerHTML = UI.renderEmptyState({
        title: "没有找到这座城市",
        text: "这个城市可能还没有收录。先返回探索页，看看南京、北京、成都和大理的四城路线。",
        actionHtml: '<a class="btn btn--outline" href="explore.html">去探索路线</a>'
      });
    }
  }

  function init() {
    UI.initPage("city");
    state.city = cityId ? UI.getCity(cityId) : null;
    if (!state.city) {
      renderUnknownCity();
      return;
    }
    renderCity();

    document.addEventListener("click", function (event) {
      const target = event.target.closest("[data-select-route]");
      if (target) {
        event.preventDefault();
        selectRoute(target.getAttribute("data-select-route"));
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
