(function (global) {
  "use strict";

  const data = global.CITYWALK_DATA;
  const UI = global.CityWalk.UI;
  const params = new URLSearchParams(window.location.search);
  const state = {
    query: params.get("q") || "",
    city: params.get("city") || "all",
    theme: "all",
    duration: "all",
    budget: "all",
    sort: "recommended"
  };
  let searchTimer = null;

  const THEMES = ["历史", "街区", "美食", "夜景", "自然"];
  const DURATION_OPTIONS = [
    { value: "all", label: "不限" },
    { value: "short", label: "3小时内" },
    { value: "medium", label: "3–5小时" },
    { value: "long", label: "5小时以上" }
  ];
  const BUDGET_OPTIONS = [
    { value: "all", label: "不限" },
    { value: "low", label: "¥0–50" },
    { value: "mid", label: "¥50–100" },
    { value: "high", label: "¥100+" }
  ];

  function escape(value) {
    return UI.escapeHtml(value);
  }

  function cityName(cityId) {
    const city = UI.getCity(cityId);
    return city ? city.name : "";
  }

  function renderChip(group, value, label, current) {
    const active = current === value;
    return '<button class="chip' + (active ? " is-active" : "") + '" type="button" data-filter-key="' +
      group + '" data-filter-value="' + escape(value) + '" aria-pressed="' + active + '">' + escape(label) + '</button>';
  }

  function renderChips() {
    const cityRoot = document.getElementById("filter-city");
    const themeRoot = document.getElementById("filter-theme");
    const durationRoot = document.getElementById("filter-duration");
    const budgetRoot = document.getElementById("filter-budget");
    if (cityRoot) {
      cityRoot.innerHTML = [renderChip("city", "all", "全部城市", state.city)]
        .concat(data.cities.map(function (city) { return renderChip("city", city.id, city.name, state.city); }))
        .join("");
    }
    if (themeRoot) {
      themeRoot.innerHTML = [renderChip("theme", "all", "全部主题", state.theme)]
        .concat(THEMES.map(function (theme) { return renderChip("theme", theme, theme, state.theme); }))
        .join("");
    }
    if (durationRoot) {
      durationRoot.innerHTML = DURATION_OPTIONS.map(function (option) {
        return renderChip("duration", option.value, option.label, state.duration);
      }).join("");
    }
    if (budgetRoot) {
      budgetRoot.innerHTML = BUDGET_OPTIONS.map(function (option) {
        return renderChip("budget", option.value, option.label, state.budget);
      }).join("");
    }
  }

  function matchesDuration(route) {
    if (state.duration === "short") return route.durationMinutes <= 180;
    if (state.duration === "medium") return route.durationMinutes > 180 && route.durationMinutes <= 300;
    if (state.duration === "long") return route.durationMinutes > 300;
    return true;
  }

  function matchesBudget(route) {
    if (state.budget === "low") return route.budget <= 50;
    if (state.budget === "mid") return route.budget > 50 && route.budget <= 100;
    if (state.budget === "high") return route.budget > 100;
    return true;
  }

  function getSearchText(route) {
    const city = UI.getCity(route.cityId);
    const stops = UI.getStops(route);
    return [
      route.title,
      route.summary,
      route.theme,
      route.bestTime,
      city ? city.name : "",
      city ? city.tagline : "",
      stops.map(function (stop) { return stop.name + " " + stop.description; }).join(" ")
    ].join(" ").toLowerCase();
  }

  function filteredRoutes() {
    const terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    const list = data.routes.filter(function (route) {
      const text = getSearchText(route);
      const queryMatch = terms.every(function (term) { return text.indexOf(term) !== -1; });
      const cityMatch = state.city === "all" || route.cityId === state.city;
      const themeMatch = state.theme === "all" || route.theme === state.theme;
      return queryMatch && cityMatch && themeMatch && matchesDuration(route) && matchesBudget(route);
    });

    if (state.sort === "short") {
      list.sort(function (a, b) { return a.durationMinutes - b.durationMinutes; });
    } else if (state.sort === "budget") {
      list.sort(function (a, b) { return a.budget - b.budget; });
    } else if (state.sort === "distance") {
      list.sort(function (a, b) { return a.distanceKm - b.distanceKm; });
    }
    return list;
  }

  function renderResults() {
    const list = filteredRoutes();
    const grid = document.getElementById("explore-grid");
    const empty = document.getElementById("explore-empty");
    const count = document.getElementById("result-count");
    const status = document.getElementById("filter-status");
    if (count) count.textContent = String(list.length);
    if (status) status.textContent = "当前找到 " + list.length + " 条路线";

    if (!list.length) {
      if (grid) {
        grid.innerHTML = "";
        grid.hidden = true;
      }
      if (empty) {
        empty.hidden = false;
        empty.innerHTML = UI.renderEmptyState({
          title: "没有找到匹配的路线",
          text: "试试换一个关键词，或者放宽城市、主题、时长和预算条件。",
          actionHtml: '<button class="btn btn--outline" type="button" data-reset-filters>重置筛选</button>'
        });
      }
      return;
    }

    if (grid) {
      grid.hidden = false;
      grid.innerHTML = list.map(function (route) { return UI.renderRouteCard(route); }).join("");
    }
    if (empty) {
      empty.hidden = true;
      empty.innerHTML = "";
    }
  }

  function updateUrl() {
    const next = new URLSearchParams();
    if (state.query) next.set("q", state.query);
    if (state.city !== "all") next.set("city", state.city);
    const suffix = next.toString();
    try {
      window.history.replaceState(null, "", "explore.html" + (suffix ? "?" + suffix : ""));
    } catch (error) {
      /* local previews may restrict history; filtering still works */
    }
  }

  function resetFilters() {
    state.query = "";
    state.city = "all";
    state.theme = "all";
    state.duration = "all";
    state.budget = "all";
    state.sort = "recommended";
    const search = document.getElementById("explore-search");
    const sort = document.getElementById("explore-sort");
    if (search) search.value = "";
    if (sort) sort.value = "recommended";
    renderChips();
    renderResults();
    updateUrl();
    if (search) search.focus();
  }

  function init() {
    UI.initPage("explore");
    const search = document.getElementById("explore-search");
    if (search) {
      search.value = state.query;
      search.addEventListener("input", function () {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(function () {
          state.query = search.value.trim();
          renderResults();
          updateUrl();
        }, 150);
      });
    }

    const sort = document.getElementById("explore-sort");
    if (sort) {
      sort.addEventListener("change", function () {
        state.sort = sort.value;
        renderResults();
      });
    }

    document.addEventListener("click", function (event) {
      const chip = event.target.closest("[data-filter-key]");
      if (chip) {
        const key = chip.getAttribute("data-filter-key");
        if (Object.prototype.hasOwnProperty.call(state, key)) {
          state[key] = chip.getAttribute("data-filter-value");
          renderChips();
          renderResults();
          updateUrl();
        }
        return;
      }
      if (event.target.closest("[data-reset-filters]") || event.target.closest("#reset-filters")) {
        resetFilters();
      }
    });

    renderChips();
    renderResults();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
