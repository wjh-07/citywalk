(function (global) {
  "use strict";

  const data = global.CITYWALK_DATA;
  const CityWalk = global.CityWalk;
  const UI = CityWalk.UI;
  const Storage = CityWalk.Storage;
  const state = {
    activeDay: 0,
    drag: null,
    dropTarget: null
  };

  const CATEGORY_COLORS = {
    sight: "#1F6F5C",
    food: "#E56B3F",
    transport: "#79998C",
    other: "#C7D0C8"
  };

  function escape(value) {
    return UI.escapeHtml(value);
  }

  function getPlan() {
    let plan = Storage.getPlan();
    if (plan && !UI.getCity(plan.cityId)) {
      Storage.clearPlan();
      UI.toast("行程数据已恢复为默认状态", "error");
      plan = null;
    }
    return plan;
  }

  function planStopCount(plan) {
    return plan ? plan.days.reduce(function (sum, day) { return sum + day.items.length; }, 0) : 0;
  }

  function routeCount(plan) {
    const ids = {};
    if (plan) {
      plan.days.forEach(function (day) {
        day.items.forEach(function (item) { ids[item.routeId] = true; });
      });
    }
    return Object.keys(ids).length;
  }

  function formatMinutes(minutes) {
    const value = Math.max(0, Number(minutes) || 0);
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    if (!hours) return rest + "分钟";
    return hours + "小时" + (rest ? rest + "分" : "");
  }

  function renderEmpty() {
    const empty = document.getElementById("planner-empty");
    const layout = document.getElementById("planner-layout");
    const controls = document.getElementById("planner-controls");
    if (controls) controls.hidden = true;
    if (layout) layout.hidden = true;
    if (!empty) return;
    empty.innerHTML = UI.renderEmptyState({
      title: "你的行程还是空的",
      text: "先去挑一条城市路线，加入后就能在这里调整顺序、查看地图、计算时间与预算。",
      actionHtml: '<a class="btn btn--primary" href="explore.html">去探索路线 <span aria-hidden="true">↗</span></a>'
    });
  }

  function renderDayTabs(plan) {
    const root = document.getElementById("day-tabs");
    if (!root) return;
    root.innerHTML = plan.days.map(function (day, index) {
      const active = index === state.activeDay;
      return '<button class="day-tab' + (active ? " is-active" : "") + '" type="button" role="tab" id="day-tab-' + index + '" aria-selected="' + active + '" aria-controls="day-schedule" data-day-tab="' + index + '">' +
        '<strong>DAY ' + String(index + 1).padStart(2, "0") + '</strong>' +
        '<span>' + escape(Storage.dayLabel(day.date)) + ' · ' + day.items.length + ' 站</span>' +
      '</button>';
    }).join("");
  }

  function renderSchedule(plan) {
    const root = document.getElementById("day-schedule");
    if (!root) return;
    const day = plan.days[state.activeDay];
    if (!day || !day.items.length) {
      root.innerHTML = UI.renderEmptyState({
        title: "这一天还没有安排",
        text: "从探索页挑一条路线加入行程，站点会自动按顺序排好。",
        actionHtml: '<a class="btn btn--outline" href="explore.html?city=' + encodeURIComponent(plan.cityId) + '">挑选路线</a>'
      });
      return;
    }

    root.innerHTML = day.items.map(function (item, index) {
      const stop = data.stops[item.stopId];
      const route = UI.getRoute(item.routeId);
      const name = stop ? stop.name : "未知站点";
      const description = stop ? stop.description : "站点数据暂不可用";
      const dayOptions = plan.days.map(function (dayItem, dayIndex) {
        return '<option value="' + dayIndex + '"' + (dayIndex === state.activeDay ? " selected" : "") + '>移到第' + (dayIndex + 1) + '天</option>';
      }).join("");
      return '<article class="plan-item" draggable="true" data-day-index="' + state.activeDay + '" data-item-index="' + index + '">' +
        '<button class="drag-handle" type="button" data-drag-handle aria-label="拖动排序：' + escape(name) + '" title="拖动排序">⠿</button>' +
        '<div class="plan-item__body">' +
          '<div class="plan-item__head">' +
            '<span class="plan-item__time">' + escape(item.startTime) + '</span>' +
            '<h3>' + escape(name) + '</h3>' +
            '<span class="tag tag--soft">' + UI.categoryLabel(item.category) + '</span>' +
          '</div>' +
          '<p>' + escape(description) + '</p>' +
          '<div class="plan-item__meta">' +
            '<span>停留 ' + item.stayMinutes + ' 分钟</span>' +
            '<span>' + UI.formatMoney(item.cost) + '</span>' +
            (route ? '<span>' + escape(route.title) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="plan-item__actions">' +
          '<button type="button" data-move-up="' + index + '" aria-label="上移' + escape(name) + '" title="上移"' + (index === 0 ? " disabled" : "") + '>↑</button>' +
          '<button type="button" data-move-down="' + index + '" aria-label="下移' + escape(name) + '" title="下移"' + (index === day.items.length - 1 ? " disabled" : "") + '>↓</button>' +
          (plan.days.length > 1 ? '<select data-move-day="' + index + '" aria-label="把' + escape(name) + '移到其他天">' + dayOptions + '</select>' : '') +
          '<button class="remove-item" type="button" data-remove="' + index + '" aria-label="删除' + escape(name) + '" title="删除">×</button>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  function donutBackground(stats) {
    const total = stats.totalCost;
    if (!total) return "conic-gradient(#DCE1DB 0 100%)";
    let cursor = 0;
    const parts = [];
    ["sight", "food", "transport", "other"].forEach(function (category) {
      const value = stats.categories[category] || 0;
      if (!value) return;
      const start = cursor;
      cursor += (value / total) * 100;
      parts.push(CATEGORY_COLORS[category] + " " + start.toFixed(2) + "% " + cursor.toFixed(2) + "%");
    });
    if (cursor < 100) parts.push("#DCE1DB " + cursor.toFixed(2) + "% 100%");
    return "conic-gradient(" + parts.join(", ") + ")";
  }

  function renderSummary(plan) {
    const root = document.getElementById("summary-content");
    if (!root) return;
    const stats = Storage.stats(plan);
    const city = UI.getCity(plan.cityId);
    const categories = [
      { key: "sight", label: "景点 / 门票" },
      { key: "food", label: "餐饮" },
      { key: "transport", label: "交通" },
      { key: "other", label: "其他" }
    ];
    const legend = categories.map(function (category) {
      return '<div class="legend-row"><span><i class="legend-dot" style="background:' + CATEGORY_COLORS[category.key] + '"></i>' + category.label + '</span><strong>' + UI.formatMoney(stats.categories[category.key] || 0) + '</strong></div>';
    }).join("");
    const dayBreakdown = plan.days.map(function (day, index) {
      const dayCost = day.items.reduce(function (sum, item) { return sum + (Number(item.cost) || 0); }, 0);
      return '<div class="day-breakdown__row"><span>第' + (index + 1) + '天 · ' + escape(Storage.dayLabel(day.date)) + '</span><strong>' + day.items.length + ' 站 / ' + UI.formatMoney(dayCost) + '</strong></div>';
    }).join("");
    root.innerHTML =
      '<div class="summary-card__head">' +
        '<div><span class="eyebrow">TRIP SUMMARY</span><h2 id="summary-title">行程概览</h2></div>' +
        '<span class="tag">' + plan.dayCount + ' DAY</span>' +
      '</div>' +
      '<div class="summary-stats">' +
        '<div class="summary-stat"><strong>' + stats.totalStops + '</strong><span>个站点</span></div>' +
        '<div class="summary-stat"><strong>' + formatMinutes(stats.totalMinutes) + '</strong><span>预计用时</span></div>' +
        '<div class="summary-stat"><strong>' + UI.formatMoney(stats.totalCost) + '</strong><span>参考预算</span></div>' +
      '</div>' +
      '<div class="budget-block">' +
        '<div class="donut" style="background:' + donutBackground(stats) + '">' +
          '<div class="donut__center"><strong>' + UI.formatMoney(stats.totalCost) + '</strong><span>BUDGET</span></div>' +
        '</div>' +
        '<div class="legend">' + legend + '</div>' +
      '</div>' +
      '<div class="day-breakdown">' + dayBreakdown + '</div>' +
      '<div class="summary-actions">' +
        '<button class="btn btn--outline btn--wide" type="button" data-export-plan>导出为 TXT</button>' +
      '</div>' +
      '<p class="summary-note">' + escape(city ? city.name : "") + ' · ' + escape(Storage.dayLabel(plan.startDate)) + ' 出发</p>';
  }

  function renderMap(plan) {
    const map = document.getElementById("planner-map");
    const meta = document.getElementById("planner-map-meta");
    if (!map) return;
    const day = plan.days[state.activeDay];
    const stops = day ? day.items.map(function (item) { return data.stops[item.stopId]; }).filter(Boolean) : [];
    if (meta) meta.textContent = stops.length ? stops.length + " 站 · 第" + (state.activeDay + 1) + "天" : "等待加入路线";
    CityWalk.Map.renderRouteMap(map, stops, {
      fallbackMessage: "配置高德 Key 后显示真实地图",
      emptyMessage: "当天还没有安排"
    });
  }

  function renderPlan() {
    const plan = getPlan();
    UI.updatePlanBadge();
    if (!plan) {
      renderEmpty();
      return;
    }

    state.activeDay = Math.min(Math.max(state.activeDay, 0), plan.days.length - 1);
    const empty = document.getElementById("planner-empty");
    const layout = document.getElementById("planner-layout");
    const controls = document.getElementById("planner-controls");
    if (empty) {
      empty.innerHTML = "";
      empty.hidden = true;
    }
    if (layout) layout.hidden = false;
    if (controls) controls.hidden = false;

    const city = UI.getCity(plan.cityId);
    const dateInput = document.getElementById("plan-start-date");
    const dayCount = document.getElementById("plan-day-count");
    if (dateInput) dateInput.value = plan.startDate;
    if (dayCount) dayCount.value = String(plan.dayCount);

    const title = document.getElementById("plan-city-title");
    const summary = document.getElementById("plan-city-summary");
    const addMore = document.getElementById("add-more-routes");
    if (title) title.textContent = (city ? city.name : "") + "城市漫游";
    if (summary) {
      summary.textContent = "第" + (state.activeDay + 1) + "天 · " +
        Storage.dayLabel(plan.days[state.activeDay].date) + " · " +
        routeCount(plan) + " 条路线 · " +
        planStopCount(plan) + " 个站点";
    }
    if (addMore) addMore.href = "explore.html?city=" + encodeURIComponent(plan.cityId);

    renderDayTabs(plan);
    renderSchedule(plan);
    renderSummary(plan);
    renderMap(plan);
  }

  function handleDayCountChange(value) {
    const plan = getPlan();
    if (!plan) return;
    const next = Math.min(Math.max(Number(value) || 1, 1), 3);
    const current = plan.dayCount;
    const input = document.getElementById("plan-day-count");

    function apply() {
      Storage.updateMeta({ startDate: plan.startDate, dayCount: next });
      state.activeDay = Math.min(state.activeDay, next - 1);
      renderPlan();
      UI.toast("已调整为 " + next + " 天行程");
    }

    if (next < current) {
      const removedHasItems = plan.days.slice(next).some(function (day) { return day.items.length > 0; });
      if (removedHasItems) {
        UI.confirmDialog({
          title: "减少行程天数？",
          message: "被删除的日期里还有 " + plan.days.slice(next).reduce(function (sum, day) { return sum + day.items.length; }, 0) + " 个站点。继续后会移除这些安排。",
          confirmText: "减少天数"
        }).then(function (accepted) {
          if (accepted) apply();
          else if (input) input.value = String(current);
        });
        return;
      }
    }
    apply();
  }

  function handleDateChange(value) {
    const plan = getPlan();
    if (!plan || !value) return;
    Storage.updateMeta({ startDate: value, dayCount: plan.dayCount });
    renderPlan();
    UI.toast("出发日期已更新");
  }

  function clearPlan() {
    const plan = getPlan();
    if (!plan) return;
    const hasItems = planStopCount(plan) > 0;
    if (!hasItems) {
      Storage.clearPlan();
      renderPlan();
      return;
    }
    UI.confirmDialog({
      title: "清空当前行程？",
      message: "清空后，当前城市的所有站点安排都会被移除。这个操作不能撤销。",
      confirmText: "清空行程"
    }).then(function (accepted) {
      if (!accepted) return;
      Storage.clearPlan();
      state.activeDay = 0;
      renderPlan();
      UI.toast("行程已清空");
    });
  }

  function exportPlan() {
    const plan = getPlan();
    if (!plan || planStopCount(plan) === 0) {
      UI.toast("空行程不能导出，请先加入路线", "error");
      return;
    }
    const city = UI.getCity(plan.cityId);
    const text = Storage.exportText(plan);
    const blob = new Blob(["\ufeff" + text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "citywalk-" + (city ? city.name : plan.cityId) + "-" + plan.startDate + ".txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    UI.toast("行程已导出");
  }

  function moveItem(direction, itemIndex) {
    const plan = getPlan();
    if (!plan) return;
    const from = Number(itemIndex);
    const to = from + direction;
    const day = plan.days[state.activeDay];
    if (!day || to < 0 || to >= day.items.length) return;
    Storage.moveItem(state.activeDay, from, to);
    renderPlan();
  }

  function bindPlannerEvents() {
    const dateInput = document.getElementById("plan-start-date");
    const dayCount = document.getElementById("plan-day-count");
    const clearButton = document.getElementById("clear-plan");
    const exportButton = document.getElementById("export-plan");
    if (dateInput) dateInput.addEventListener("change", function () { handleDateChange(dateInput.value); });
    if (dayCount) dayCount.addEventListener("change", function () { handleDayCountChange(dayCount.value); });
    if (clearButton) clearButton.addEventListener("click", clearPlan);
    if (exportButton) exportButton.addEventListener("click", exportPlan);

    document.addEventListener("click", function (event) {
      const tab = event.target.closest("[data-day-tab]");
      if (tab) {
        state.activeDay = Number(tab.getAttribute("data-day-tab"));
        renderPlan();
        return;
      }
      if (event.target.closest("[data-export-plan]")) {
        exportPlan();
        return;
      }
      const up = event.target.closest("[data-move-up]");
      if (up) {
        moveItem(-1, up.getAttribute("data-move-up"));
        return;
      }
      const down = event.target.closest("[data-move-down]");
      if (down) {
        moveItem(1, down.getAttribute("data-move-down"));
        return;
      }
      const remove = event.target.closest("[data-remove]");
      if (remove) {
        const plan = getPlan();
        const day = plan ? plan.days[state.activeDay] : null;
        const itemIndex = Number(remove.getAttribute("data-remove"));
        const item = day ? day.items[itemIndex] : null;
        const stop = item ? data.stops[item.stopId] : null;
        Storage.removeItem(state.activeDay, itemIndex);
        renderPlan();
        UI.toast((stop ? stop.name : "站点") + " 已从行程移除");
      }
    });

    document.addEventListener("change", function (event) {
      const select = event.target.closest("[data-move-day]");
      if (!select) return;
      const itemIndex = Number(select.getAttribute("data-move-day"));
      const targetDay = Number(select.value);
      if (targetDay === state.activeDay) return;
      Storage.moveItemToDay(state.activeDay, itemIndex, targetDay);
      renderPlan();
      UI.toast("已移动到第" + (targetDay + 1) + "天");
    });

    const schedule = document.getElementById("day-schedule");
    if (schedule) {
      schedule.addEventListener("dragstart", function (event) {
        const item = event.target.closest(".plan-item");
        if (!item) return;
        if (event.target.closest("button:not(.drag-handle), select")) {
          event.preventDefault();
          return;
        }
        const dayIndex = Number(item.getAttribute("data-day-index"));
        const itemIndex = Number(item.getAttribute("data-item-index"));
        state.drag = { dayIndex: dayIndex, itemIndex: itemIndex };
        item.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        try {
          event.dataTransfer.setData("text/plain", JSON.stringify(state.drag));
        } catch (error) {
          /* browsers may restrict drag data in local previews */
        }
      });

      schedule.addEventListener("dragover", function (event) {
        if (!state.drag) return;
        const item = event.target.closest(".plan-item");
        if (!item) return;
        if (Number(item.getAttribute("data-day-index")) !== state.drag.dayIndex) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        if (state.dropTarget && state.dropTarget !== item) state.dropTarget.classList.remove("is-drag-over");
        state.dropTarget = item;
        item.classList.add("is-drag-over");
      });

      schedule.addEventListener("drop", function (event) {
        if (!state.drag) return;
        const target = event.target.closest(".plan-item");
        if (!target) return;
        if (Number(target.getAttribute("data-day-index")) !== state.drag.dayIndex) return;
        event.preventDefault();
        const rect = target.getBoundingClientRect();
        let toIndex = Number(target.getAttribute("data-item-index"));
        if (event.clientY > rect.top + rect.height / 2) toIndex += 1;
        if (state.drag.itemIndex < toIndex) toIndex -= 1;
        Storage.moveItem(state.drag.dayIndex, state.drag.itemIndex, toIndex);
        clearDragState();
        renderPlan();
      });

      schedule.addEventListener("dragend", function () {
        clearDragState();
      });
    }

    document.addEventListener("citywalk:plan-updated", function () {
      renderPlan();
    });
  }

  function clearDragState() {
    document.querySelectorAll(".plan-item.is-dragging, .plan-item.is-drag-over").forEach(function (item) {
      item.classList.remove("is-dragging", "is-drag-over");
    });
    state.drag = null;
    state.dropTarget = null;
  }

  function init() {
    UI.initPage("planner");
    bindPlannerEvents();
    renderPlan();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
