(function (global) {
  "use strict";

  const CityWalk = global.CityWalk = global.CityWalk || {};
  const Storage = CityWalk.Storage;
  const data = global.CITYWALK_DATA;
  const state = {
    lastFocused: null,
    confirmResolver: null
  };

  const CATEGORY_LABELS = {
    sight: "景点",
    food: "餐饮",
    transport: "交通",
    other: "其他"
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getCity(cityId) {
    return data.cities.find(function (city) { return city.id === cityId; }) || null;
  }

  function getRoute(routeId) {
    return data.routes.find(function (route) { return route.id === routeId; }) || null;
  }

  function getRoutesByCity(cityId) {
    return data.routes.filter(function (route) { return route.cityId === cityId; });
  }

  function getStops(route) {
    if (!route) return [];
    return route.stopIds.map(function (stopId) { return data.stops[stopId]; }).filter(Boolean);
  }

  function formatDuration(minutes) {
    const value = Math.max(0, Number(minutes) || 0);
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    if (!hours) return rest + "分钟";
    return hours + "小时" + (rest ? rest + "分" : "");
  }

  function formatMoney(value) {
    const number = Number(value) || 0;
    return "¥" + (Number.isInteger(number) ? number : number.toFixed(1));
  }

  function categoryLabel(category) {
    return CATEGORY_LABELS[category] || "其他";
  }

  function heartIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>';
  }

  function arrowIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  }

  function pinIcon() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.2 7-12a7 7 0 1 0-14 0c0 6.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>';
  }

  function renderHeader(active) {
    const root = document.getElementById("site-header");
    if (!root) return;
    root.innerHTML =
      '<header class="site-header">' +
        '<div class="site-header__inner container">' +
          '<a class="brand" href="index.html" aria-label="城市漫游计划首页">' +
            '<span class="brand__mark" aria-hidden="true">CW</span>' +
            '<span class="brand__text"><strong>CITYWALK</strong><small>城市漫游计划</small></span>' +
          '</a>' +
          '<button class="menu-toggle" type="button" data-mobile-menu aria-expanded="false" aria-controls="primary-nav">菜单</button>' +
          '<nav class="primary-nav" id="primary-nav" aria-label="主导航">' +
            '<a href="index.html" class="' + (active === "home" ? "is-active" : "") + '">首页</a>' +
            '<a href="explore.html" class="' + (active === "explore" ? "is-active" : "") + '">探索路线</a>' +
            '<a href="planner.html" class="' + (active === "planner" ? "is-active" : "") + '">我的行程 <span class="nav-count" data-plan-count>0</span></a>' +
          '</nav>' +
          '<a class="btn btn--small btn--outline header-cta" href="explore.html">开始漫游 ' + arrowIcon() + '</a>' +
        '</div>' +
      '</header>';
  }

  function renderFooter() {
    const root = document.getElementById("site-footer");
    if (!root) return;
    root.innerHTML =
      '<footer class="site-footer">' +
        '<div class="container footer-grid">' +
          '<div class="footer-brand">' +
            '<a class="brand brand--footer" href="index.html">' +
              '<span class="brand__mark" aria-hidden="true">CW</span>' +
              '<span class="brand__text"><strong>CITYWALK</strong><small>城市漫游计划</small></span>' +
            '</a>' +
            '<p>把一座城市拆成可以慢慢走完的路线。课程设计作品，数据为演示用途。</p>' +
          '</div>' +
          '<div class="footer-links">' +
            '<h2>快速入口</h2>' +
            '<a href="index.html">首页</a>' +
            '<a href="explore.html">探索路线</a>' +
            '<a href="planner.html">我的行程</a>' +
          '</div>' +
          '<div class="footer-note">' +
            '<h2>关于地图</h2>' +
            '<p>地图服务 © 高德地图。未配置 Key 时展示本地示意地图，不影响行程规划功能。</p>' +
          '</div>' +
        '</div>' +
        '<div class="container footer-bottom"><span>© ' + new Date().getFullYear() + ' CITYWALK / 城市漫游计划</span><span>用脚步，重新认识一座城。</span></div>' +
      '</footer>';
  }

  function renderCityCard(city) {
    const routes = getRoutesByCity(city.id);
    return '<a class="city-card" href="city.html?id=' + encodeURIComponent(city.id) + '">' +
      '<img src="' + escapeHtml(city.heroImage) + '" alt="' + escapeHtml(city.name) + '城市封面" loading="lazy">' +
      '<span class="city-card__shade" aria-hidden="true"></span>' +
      '<span class="city-card__content">' +
        '<span class="city-card__latin">' + escapeHtml(city.latin) + '</span>' +
        '<strong>' + escapeHtml(city.name) + '</strong>' +
        '<span>' + escapeHtml(city.tagline) + '</span>' +
        '<em>' + routes.length + ' 条路线</em>' +
      '</span>' +
      '<span class="city-card__arrow" aria-hidden="true">' + arrowIcon() + '</span>' +
    '</a>';
  }

  function renderRouteCard(route, options) {
    const city = getCity(route.cityId);
    const active = Storage.isFavorite(route.id);
    const compact = options && options.compact;
    return '<article class="route-card' + (compact ? " route-card--compact" : "") + '">' +
      '<div class="route-card__media">' +
        '<img src="' + escapeHtml(route.coverImage) + '" alt="' + escapeHtml((city ? city.name : "") + route.title) + '路线封面" loading="lazy">' +
        '<span class="route-card__city">' + escapeHtml(city ? city.name : "") + '</span>' +
        '<button class="favorite-button' + (active ? " is-active" : "") + '" type="button" data-favorite="' + escapeHtml(route.id) + '" aria-pressed="' + active + '" aria-label="' + (active ? "取消收藏" : "收藏") + escapeHtml(route.title) + '">' + heartIcon() + '</button>' +
      '</div>' +
      '<div class="route-card__body">' +
        '<div class="tag-row"><span class="tag">' + escapeHtml(route.theme) + '</span><span class="tag tag--soft">' + escapeHtml(route.bestTime) + '</span></div>' +
        '<h3>' + escapeHtml(route.title) + '</h3>' +
        '<p>' + escapeHtml(route.summary) + '</p>' +
        '<div class="route-card__meta">' +
          '<span>' + formatDuration(route.durationMinutes) + '</span>' +
          '<span>' + route.distanceKm + ' km</span>' +
          '<span>' + formatMoney(route.budget) + '</span>' +
        '</div>' +
      '</div>' +
      '<button class="route-card__hit" type="button" data-open-route="' + escapeHtml(route.id) + '" aria-label="查看' + escapeHtml(route.title) + '路线详情"></button>' +
    '</article>';
  }

  function renderEmptyState(options) {
    const settings = options || {};
    return '<div class="empty-state">' +
      '<span class="empty-state__icon" aria-hidden="true">' + pinIcon() + '</span>' +
      '<h2>' + escapeHtml(settings.title || "暂无内容") + '</h2>' +
      '<p>' + escapeHtml(settings.text || "") + '</p>' +
      (settings.actionHtml || "") +
    '</div>';
  }

  function renderDrawerContent(route) {
    const city = getCity(route.cityId);
    const stops = getStops(route);
    const plan = Storage.getPlan();
    const inPlan = Storage.routeInPlan(plan, route.id);
    const sameCity = Boolean(plan && plan.cityId === route.cityId);
    const favorite = Storage.isFavorite(route.id);
    let daySelect = "";
    if (sameCity) {
      daySelect = '<label class="drawer-day"><span>加入哪一天</span><select id="drawer-day-select">' +
        plan.days.map(function (day, index) {
          return '<option value="' + index + '">第' + (index + 1) + '天 · ' + Storage.dayLabel(day.date) + '</option>';
        }).join("") +
      '</select></label>';
    }
    const buttonLabel = inPlan ? "已在行程中" : (sameCity ? "加入行程" : (plan ? "切换城市并加入" : "加入行程"));
    const timeline = stops.map(function (stop, index) {
      return '<li class="stop-row">' +
        '<span class="stop-row__index">' + String(index + 1).padStart(2, "0") + '</span>' +
        '<div class="stop-row__body">' +
          '<div class="stop-row__head"><h4>' + escapeHtml(stop.name) + '</h4><span class="tag tag--soft">' + categoryLabel(stop.category) + '</span></div>' +
          '<p>' + escapeHtml(stop.description) + '</p>' +
          '<div class="stop-row__meta"><span>停留 ' + stop.stayMinutes + ' 分钟</span><span>' + formatMoney(stop.cost) + '</span></div>' +
        '</div>' +
      '</li>';
    }).join("");

    return '<div class="drawer-panel__cover">' +
        '<img src="' + escapeHtml(route.coverImage) + '" alt="' + escapeHtml(city.name + route.title) + '路线封面">' +
        '<span class="drawer-panel__shade" aria-hidden="true"></span>' +
        '<div class="drawer-panel__cover-copy"><span class="eyebrow eyebrow--light">' + escapeHtml(city.name) + ' / ' + escapeHtml(route.theme) + '</span><h2 id="drawer-title">' + escapeHtml(route.title) + '</h2><p>' + escapeHtml(route.summary) + '</p></div>' +
      '</div>' +
      '<div class="drawer-panel__body">' +
        '<div class="drawer-stats">' +
          '<div><span>路线时长</span><strong>' + formatDuration(route.durationMinutes) + '</strong></div>' +
          '<div><span>步行距离</span><strong>' + route.distanceKm + ' km</strong></div>' +
          '<div><span>参考预算</span><strong>' + formatMoney(route.budget) + '</strong></div>' +
          '<div><span>建议时段</span><strong>' + escapeHtml(route.bestTime) + '</strong></div>' +
        '</div>' +
        '<div class="section-heading section-heading--drawer"><div><span class="eyebrow">STOPS</span><h3>沿途站点</h3></div><span class="muted">' + stops.length + ' 站</span></div>' +
        '<ol class="stop-list">' + timeline + '</ol>' +
        '<div class="drawer-actions">' +
          daySelect +
          '<button class="btn btn--primary btn--wide" type="button" data-add-route="' + escapeHtml(route.id) + '"' + (inPlan ? " disabled" : "") + '>' + buttonLabel + '</button>' +
          '<button class="btn btn--ghost btn--wide' + (favorite ? " is-active" : "") + '" type="button" data-favorite="' + escapeHtml(route.id) + '" aria-pressed="' + favorite + '">' + heartIcon() + '<span>' + (favorite ? "已收藏" : "收藏路线") + '</span></button>' +
          (plan && !sameCity ? '<p class="drawer-warning">加入后会从当前城市行程切换到' + escapeHtml(city.name) + '。</p>' : '') +
        '</div>' +
      '</div>';
  }

  function updateFavoriteButtons(routeId, active) {
    const buttons = document.querySelectorAll('[data-favorite="' + routeId + '"]');
    buttons.forEach(function (button) {
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      const label = button.getAttribute("aria-label") || "";
      if (/取消收藏/.test(label)) {
        button.setAttribute("aria-label", label.replace("取消收藏", "收藏"));
      } else if (/^收藏/.test(label)) {
        button.setAttribute("aria-label", label.replace(/^收藏/, "取消收藏"));
      }
      const text = button.querySelector("span");
      if (text && (text.textContent === "已收藏" || text.textContent === "收藏路线")) {
        text.textContent = active ? "已收藏" : "收藏路线";
      }
    });
  }

  function toast(message, type) {
    const root = document.getElementById("toast-root");
    if (!root) return;
    const item = document.createElement("div");
    item.className = "toast" + (type ? " toast--" + type : "");
    item.textContent = message;
    root.appendChild(item);
    requestAnimationFrame(function () { item.classList.add("is-visible"); });
    setTimeout(function () {
      item.classList.remove("is-visible");
      setTimeout(function () { item.remove(); }, 220);
    }, 2600);
  }

  function createOverlayElements() {
    if (!document.getElementById("route-drawer")) {
      const backdrop = document.createElement("div");
      backdrop.className = "drawer-backdrop";
      backdrop.hidden = true;
      backdrop.setAttribute("data-close-drawer", "");
      document.body.appendChild(backdrop);

      const drawer = document.createElement("aside");
      drawer.className = "route-drawer";
      drawer.id = "route-drawer";
      drawer.setAttribute("role", "dialog");
      drawer.setAttribute("aria-modal", "true");
      drawer.setAttribute("aria-hidden", "true");
      drawer.setAttribute("aria-labelledby", "drawer-title");
      drawer.innerHTML = '<button class="drawer-close" type="button" data-close-drawer aria-label="关闭路线详情">×</button><div class="drawer-content" id="drawer-content"></div>';
      document.body.appendChild(drawer);
    }

    if (!document.getElementById("toast-root")) {
      const toastRoot = document.createElement("div");
      toastRoot.id = "toast-root";
      toastRoot.className = "toast-stack";
      toastRoot.setAttribute("aria-live", "polite");
      toastRoot.setAttribute("aria-atomic", "true");
      document.body.appendChild(toastRoot);
    }

    if (!document.getElementById("confirm-modal")) {
      const modal = document.createElement("div");
      modal.className = "modal-backdrop";
      modal.id = "confirm-modal";
      modal.hidden = true;
      modal.innerHTML =
        '<div class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">' +
          '<span class="eyebrow">PLEASE CONFIRM</span>' +
          '<h2 id="confirm-title">确认操作</h2>' +
          '<p id="confirm-message"></p>' +
          '<div class="confirm-actions">' +
            '<button class="btn btn--ghost" type="button" data-confirm-cancel>取消</button>' +
            '<button class="btn btn--primary" type="button" data-confirm-ok>确认</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(modal);
    }
  }

  function openDrawer(routeId, trigger) {
    const route = getRoute(routeId);
    if (!route) return;
    state.lastFocused = trigger || document.activeElement;
    const drawer = document.getElementById("route-drawer");
    const backdrop = document.querySelector(".drawer-backdrop");
    const content = document.getElementById("drawer-content");
    if (!drawer || !content) return;
    content.innerHTML = renderDrawerContent(route);
    drawer.scrollTop = 0;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (backdrop) {
      backdrop.hidden = false;
      requestAnimationFrame(function () { backdrop.classList.add("is-visible"); });
    }
    document.body.classList.add("is-drawer-open");
    const closeButton = drawer.querySelector(".drawer-close");
    if (closeButton) closeButton.focus();
  }

  function closeDrawer() {
    const drawer = document.getElementById("route-drawer");
    const backdrop = document.querySelector(".drawer-backdrop");
    if (!drawer || !drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (backdrop) {
      backdrop.classList.remove("is-visible");
      setTimeout(function () {
        if (!drawer.classList.contains("is-open")) backdrop.hidden = true;
      }, 220);
    }
    document.body.classList.remove("is-drawer-open");
    if (state.lastFocused && typeof state.lastFocused.focus === "function") {
      state.lastFocused.focus();
    }
  }

  function confirmDialog(options) {
    const settings = options || {};
    const modal = document.getElementById("confirm-modal");
    if (!modal) return Promise.resolve(false);
    const title = modal.querySelector("#confirm-title");
    const message = modal.querySelector("#confirm-message");
    const ok = modal.querySelector("[data-confirm-ok]");
    const cancel = modal.querySelector("[data-confirm-cancel]");
    title.textContent = settings.title || "确认操作";
    message.textContent = settings.message || "";
    ok.textContent = settings.confirmText || "确认";
    cancel.textContent = settings.cancelText || "取消";
    modal.hidden = false;
    document.body.classList.add("is-modal-open");
    cancel.focus();

    return new Promise(function (resolve) {
      function finish(result) {
        modal.hidden = true;
        document.body.classList.remove("is-modal-open");
        ok.removeEventListener("click", onOk);
        cancel.removeEventListener("click", onCancel);
        modal.removeEventListener("click", onBackdrop);
        document.removeEventListener("keydown", onKey);
        resolve(result);
      }
      function onOk() { finish(true); }
      function onCancel() { finish(false); }
      function onBackdrop(event) { if (event.target === modal) finish(false); }
      function onKey(event) {
        if (event.key === "Escape") finish(false);
      }
      ok.addEventListener("click", onOk);
      cancel.addEventListener("click", onCancel);
      modal.addEventListener("click", onBackdrop);
      document.addEventListener("keydown", onKey);
    });
  }

  function updatePlanBadge() {
    const count = Storage.count(Storage.getPlan());
    document.querySelectorAll("[data-plan-count]").forEach(function (badge) {
      badge.textContent = String(count);
      badge.classList.toggle("is-empty", count === 0);
    });
  }

  function handleFavorite(routeId, button) {
    const active = Storage.toggleFavorite(routeId);
    updateFavoriteButtons(routeId, active);
    toast(active ? "已收藏这条路线" : "已取消收藏");
    document.dispatchEvent(new CustomEvent("citywalk:favorites-updated", { detail: { routeId: routeId, active: active } }));
    if (button) button.blur();
  }

  function handleAddRoute(routeId) {
    const route = getRoute(routeId);
    if (!route) return;
    const plan = Storage.getPlan();
    const daySelect = document.getElementById("drawer-day-select");
    const dayIndex = daySelect ? Number(daySelect.value) : 0;
    const city = getCity(route.cityId);

    function add(reset) {
      const result = Storage.addRoute(routeId, dayIndex, { reset: Boolean(reset) });
      if (!result.ok) {
        if (result.reason === "duplicate") toast("这条路线已经在行程中");
        else if (result.reason === "city-conflict") toast("请先确认是否切换城市");
        else toast("暂时无法加入行程", "error");
        return;
      }
      updatePlanBadge();
      closeDrawer();
      toast("已加入" + (city ? city.name : "") + "行程 · 第" + (result.dayIndex + 1) + "天");
      document.dispatchEvent(new CustomEvent("citywalk:plan-updated", { detail: { plan: result.plan, routeId: routeId } }));
    }

    if (plan && plan.cityId !== route.cityId) {
      confirmDialog({
        title: "切换行程城市？",
        message: "当前行程属于" + (getCity(plan.cityId) ? getCity(plan.cityId).name : "另一个城市") + "。加入" + (city ? city.name : "新城市") + "路线会清空现有行程。",
        confirmText: "切换并加入"
      }).then(function (accepted) { if (accepted) add(true); });
      return;
    }
    add(false);
  }

  function bindGlobalEvents() {
    document.addEventListener("click", function (event) {
      const menuButton = event.target.closest("[data-mobile-menu]");
      if (menuButton) {
        const nav = document.getElementById("primary-nav");
        const open = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!open));
        if (nav) nav.classList.toggle("is-open", !open);
        return;
      }

      const favoriteButton = event.target.closest("[data-favorite]");
      if (favoriteButton) {
        event.preventDefault();
        event.stopPropagation();
        const routeId = favoriteButton.getAttribute("data-favorite");
        if (routeId) handleFavorite(routeId, favoriteButton);
        return;
      }

      const addButton = event.target.closest("[data-add-route]");
      if (addButton) {
        event.preventDefault();
        handleAddRoute(addButton.getAttribute("data-add-route"));
        return;
      }

      const openButton = event.target.closest("[data-open-route]");
      if (openButton) {
        event.preventDefault();
        openDrawer(openButton.getAttribute("data-open-route"), openButton);
        return;
      }

      const closeButton = event.target.closest("[data-close-drawer]");
      if (closeButton) {
        closeDrawer();
        return;
      }

      const navLink = event.target.closest(".primary-nav a");
      if (navLink) {
        const nav = document.getElementById("primary-nav");
        const menu = document.querySelector("[data-mobile-menu]");
        if (nav) nav.classList.remove("is-open");
        if (menu) menu.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeDrawer();
      }
      const drawer = document.getElementById("route-drawer");
      if (event.key === "Tab" && drawer && drawer.classList.contains("is-open")) {
        const focusable = drawer.querySelectorAll('button:not([disabled]), a[href], select, input, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  function initPage(active) {
    renderHeader(active);
    renderFooter();
    createOverlayElements();
    Storage.getFavorites();
    updatePlanBadge();
    const notice = Storage.consumeNotice();
    if (notice) toast(notice, "error");
    bindGlobalEvents();
  }

  CityWalk.UI = {
    initPage: initPage,
    renderCityCard: renderCityCard,
    renderRouteCard: renderRouteCard,
    renderEmptyState: renderEmptyState,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    confirmDialog: confirmDialog,
    toast: toast,
    updatePlanBadge: updatePlanBadge,
    updateFavoriteButtons: updateFavoriteButtons,
    escapeHtml: escapeHtml,
    getCity: getCity,
    getRoute: getRoute,
    getRoutesByCity: getRoutesByCity,
    getStops: getStops,
    formatDuration: formatDuration,
    formatMoney: formatMoney,
    categoryLabel: categoryLabel,
    heartIcon: heartIcon,
    arrowIcon: arrowIcon,
    pinIcon: pinIcon
  };
})(window);
