(function (global) {
  "use strict";

  const CityWalk = global.CityWalk = global.CityWalk || {};
  const KEYS = {
    favorites: "citywalk.favorites.v1",
    plan: "citywalk.plan.v1"
  };
  const TRANSIT_MINUTES = 20;
  const DAY_START_MINUTES = 9 * 60;
  const memoryStore = {};
  const notices = [];

  function queueNotice(key) {
    if (notices.indexOf(key) === -1) notices.push(key);
  }

  function consumeNotice() {
    if (!notices.length) return "";
    notices.length = 0;
    return "\u672c\u5730\u6570\u636e\u5f02\u5e38\uff0c\u5df2\u6062\u590d\u9ed8\u8ba4\u8bbe\u7f6e";
  }

  function getRaw(key) {
    try {
      return global.localStorage.getItem(key);
    } catch (error) {
      return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
    }
  }

  function setRaw(key, value) {
    try {
      global.localStorage.setItem(key, value);
    } catch (error) {
      memoryStore[key] = value;
    }
  }

  function removeRaw(key) {
    try {
      global.localStorage.removeItem(key);
    } catch (error) {
      delete memoryStore[key];
    }
  }

  function readJson(key, fallback) {
    const raw = getRaw(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      removeRaw(key);
      queueNotice(key);
      return fallback;
    }
  }

  function writeJson(key, value) {
    setRaw(key, JSON.stringify(value));
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function todayISO() {
    const now = new Date();
    return [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join("-");
  }

  function isISODate(value) {
    const text = String(value || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
    const parts = text.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.getFullYear() === parts[0] &&
      date.getMonth() === parts[1] - 1 &&
      date.getDate() === parts[2];
  }

  function addDays(isoDate, amount) {
    const parts = String(isoDate).split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    date.setDate(date.getDate() + amount);
    return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
  }

  function dayLabel(isoDate) {
    const parts = String(isoDate).split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return date.getMonth() + 1 + "月" + date.getDate() + "日 " + weekdays[date.getDay()];
  }

  function minutesToTime(minutes) {
    const normalized = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    return pad(Math.floor(normalized / 60)) + ":" + pad(normalized % 60);
  }

  function getFavorites() {
    const value = readJson(KEYS.favorites, []);
    if (!Array.isArray(value)) {
      removeRaw(KEYS.favorites);
      queueNotice(KEYS.favorites);
      return [];
    }
    return value.filter(function (id, index, list) {
      return typeof id === "string" && list.indexOf(id) === index;
    });
  }

  function isFavorite(routeId) {
    return getFavorites().indexOf(routeId) !== -1;
  }

  function toggleFavorite(routeId) {
    const favorites = getFavorites();
    const index = favorites.indexOf(routeId);
    let active = false;
    if (index === -1) {
      favorites.push(routeId);
      active = true;
    } else {
      favorites.splice(index, 1);
    }
    writeJson(KEYS.favorites, favorites);
    return active;
  }

  function normalizePlan(plan) {
    if (!plan || plan.version !== 1 || typeof plan.cityId !== "string") return null;
    const startDate = isISODate(plan.startDate) ? plan.startDate : todayISO();
    const rawDays = Array.isArray(plan.days) ? plan.days : [];
    const requestedCount = clamp(
      Number(plan.dayCount) || rawDays.length || 1,
      1,
      3
    );
    const days = [];

    for (let index = 0; index < requestedCount; index += 1) {
      const source = rawDays[index] || {};
      const items = Array.isArray(source.items) ? source.items.filter(function (item) {
        return item && typeof item.stopId === "string" && typeof item.routeId === "string";
      }).map(function (item) {
        const category = ["sight", "food", "transport", "other"].indexOf(item.category) !== -1
          ? item.category
          : "other";
        return {
          stopId: item.stopId,
          routeId: item.routeId,
          startTime: typeof item.startTime === "string" ? item.startTime : "09:00",
          stayMinutes: Math.max(0, Number(item.stayMinutes) || 0),
          cost: Math.max(0, Number(item.cost) || 0),
          category: category
        };
      }) : [];
      days.push({
        date: isISODate(source.date) ? source.date : addDays(startDate, index),
        items: items
      });
    }

    const normalized = {
      version: 1,
      cityId: plan.cityId,
      startDate: startDate,
      dayCount: days.length,
      days: days
    };
    recalcPlan(normalized);
    return normalized;
  }

  function getPlan() {
    const raw = readJson(KEYS.plan, null);
    const plan = normalizePlan(raw);
    if (raw && !plan) {
      removeRaw(KEYS.plan);
      queueNotice(KEYS.plan);
      return null;
    }
    return plan;
  }

  function savePlan(plan) {
    const normalized = normalizePlan(plan);
    if (!normalized) {
      removeRaw(KEYS.plan);
      queueNotice(KEYS.plan);
      return null;
    }
    writeJson(KEYS.plan, normalized);
    return normalized;
  }

  function clearPlan() {
    removeRaw(KEYS.plan);
  }

  function createEmptyPlan(cityId, startDate, dayCount) {
    const count = clamp(Number(dayCount) || 1, 1, 3);
    const start = startDate || todayISO();
    const days = [];
    for (let index = 0; index < count; index += 1) {
      days.push({ date: addDays(start, index), items: [] });
    }
    return {
      version: 1,
      cityId: cityId,
      startDate: start,
      dayCount: count,
      days: days
    };
  }

  function getRoute(routeId) {
    const data = global.CITYWALK_DATA;
    return data ? data.routes.find(function (route) { return route.id === routeId; }) : null;
  }

  function getStop(stopId) {
    const data = global.CITYWALK_DATA;
    return data ? data.stops[stopId] : null;
  }

  function routeInPlan(plan, routeId) {
    if (!plan) return false;
    return plan.days.some(function (day) {
      return day.items.some(function (item) { return item.routeId === routeId; });
    });
  }

  function recalcDay(day) {
    if (!day || !Array.isArray(day.items)) return;
    let cursor = DAY_START_MINUTES;
    day.items.forEach(function (item) {
      item.startTime = minutesToTime(cursor);
      cursor += Math.max(0, Number(item.stayMinutes) || 0) + TRANSIT_MINUTES;
    });
  }

  function recalcPlan(plan) {
    if (!plan) return plan;
    plan.days.forEach(recalcDay);
    return plan;
  }

  function addRoute(routeId, dayIndex, options) {
    const route = getRoute(routeId);
    if (!route) return { ok: false, reason: "missing-route", plan: getPlan() };
    const settings = options || {};
    let plan = getPlan();

    if (plan && plan.cityId !== route.cityId && !settings.reset) {
      return { ok: false, reason: "city-conflict", plan: plan, route: route };
    }
    if (!plan || settings.reset || plan.cityId !== route.cityId) {
      plan = createEmptyPlan(route.cityId, settings.startDate || todayISO(), 1);
    }
    if (routeInPlan(plan, routeId)) {
      return { ok: false, reason: "duplicate", plan: plan, route: route };
    }

    const index = clamp(Number(dayIndex) || 0, 0, plan.days.length - 1);
    const day = plan.days[index];
    route.stopIds.forEach(function (stopId) {
      const stop = getStop(stopId);
      if (!stop) return;
      day.items.push({
        stopId: stop.id,
        routeId: route.id,
        startTime: "09:00",
        stayMinutes: stop.stayMinutes,
        cost: stop.cost,
        category: stop.category
      });
    });
    recalcPlan(plan);
    plan = savePlan(plan);
    return { ok: true, reason: "added", plan: plan, route: route, dayIndex: index };
  }

  function removeItem(dayIndex, itemIndex) {
    const plan = getPlan();
    if (!plan || !plan.days[dayIndex]) return plan;
    plan.days[dayIndex].items.splice(itemIndex, 1);
    recalcPlan(plan);
    return savePlan(plan);
  }

  function moveItem(dayIndex, fromIndex, toIndex) {
    const plan = getPlan();
    if (!plan || !plan.days[dayIndex]) return plan;
    const items = plan.days[dayIndex].items;
    if (fromIndex < 0 || fromIndex >= items.length) return plan;
    const target = clamp(Number(toIndex) || 0, 0, items.length - 1);
    const moved = items.splice(fromIndex, 1)[0];
    items.splice(target, 0, moved);
    recalcPlan(plan);
    return savePlan(plan);
  }

  function moveItemToDay(fromDay, itemIndex, toDay) {
    const plan = getPlan();
    if (!plan || !plan.days[fromDay] || !plan.days[toDay]) return plan;
    if (fromDay === toDay) return plan;
    const item = plan.days[fromDay].items[itemIndex];
    if (!item) return plan;
    plan.days[fromDay].items.splice(itemIndex, 1);
    plan.days[toDay].items.push(item);
    recalcPlan(plan);
    return savePlan(plan);
  }

  function updateMeta(meta) {
    let plan = getPlan();
    if (!plan) return null;
    const nextStart = meta.startDate || plan.startDate;
    const nextCount = clamp(Number(meta.dayCount) || plan.dayCount, 1, 3);
    const oldDays = plan.days.slice();
    const nextDays = [];
    for (let index = 0; index < nextCount; index += 1) {
      nextDays.push({
        date: addDays(nextStart, index),
        items: oldDays[index] ? oldDays[index].items : []
      });
    }
    plan.startDate = nextStart;
    plan.dayCount = nextCount;
    plan.days = nextDays;
    recalcPlan(plan);
    return savePlan(plan);
  }

  function dayHasItems(plan, dayIndex) {
    return Boolean(plan && plan.days[dayIndex] && plan.days[dayIndex].items.length);
  }

  function count(plan) {
    if (!plan) return 0;
    return plan.days.reduce(function (sum, day) { return sum + day.items.length; }, 0);
  }

  function stats(plan) {
    const result = {
      totalStops: 0,
      totalMinutes: 0,
      totalCost: 0,
      categories: { sight: 0, food: 0, transport: 0, other: 0 }
    };
    if (!plan) return result;
    plan.days.forEach(function (day) {
      if (!day.items.length) return;
      result.totalStops += day.items.length;
      day.items.forEach(function (item) {
        const cost = Number(item.cost) || 0;
        result.totalMinutes += Number(item.stayMinutes) || 0;
        result.totalCost += cost;
        const category = result.categories[item.category] != null ? item.category : "other";
        result.categories[category] += cost;
      });
      result.totalMinutes += Math.max(0, day.items.length - 1) * TRANSIT_MINUTES;
    });
    return result;
  }

  function exportText(plan) {
    if (!plan) return "";
    const data = global.CITYWALK_DATA;
    const city = data ? data.cities.find(function (item) { return item.id === plan.cityId; }) : null;
    const lines = [];
    lines.push("CITYWALK / " + (city ? city.name : plan.cityId) + " 城市漫游行程");
    lines.push("生成日期：" + todayISO());
    lines.push("");
    plan.days.forEach(function (day, index) {
      lines.push("第" + (index + 1) + "天  " + dayLabel(day.date));
      if (!day.items.length) {
        lines.push("  当天暂无安排");
      } else {
        day.items.forEach(function (item, itemIndex) {
          const stop = getStop(item.stopId);
          lines.push(
            "  " + pad(itemIndex + 1) + ". " + item.startTime + "  " +
            (stop ? stop.name : item.stopId) +
            "（停留 " + item.stayMinutes + " 分钟，预计 ¥" + item.cost + "）"
          );
          if (stop) lines.push("      " + stop.description);
        });
      }
      lines.push("");
    });
    const summary = stats(plan);
    lines.push("合计： " + summary.totalStops + " 个站点 / " +
      Math.floor(summary.totalMinutes / 60) + " 小时" + (summary.totalMinutes % 60) + " 分钟 / ¥" +
      summary.totalCost);
    return lines.join("\r\n");
  }

  CityWalk.Storage = {
    KEYS: KEYS,
    getFavorites: getFavorites,
    isFavorite: isFavorite,
    toggleFavorite: toggleFavorite,
    getPlan: getPlan,
    savePlan: savePlan,
    clearPlan: clearPlan,
    createEmptyPlan: createEmptyPlan,
    addRoute: addRoute,
    removeItem: removeItem,
    moveItem: moveItem,
    moveItemToDay: moveItemToDay,
    updateMeta: updateMeta,
    recalcPlan: recalcPlan,
    recalcDay: recalcDay,
    dayHasItems: dayHasItems,
    routeInPlan: routeInPlan,
    count: count,
    stats: stats,
    exportText: exportText,
    todayISO: todayISO,
    addDays: addDays,
    dayLabel: dayLabel,
    minutesToTime: minutesToTime,
    consumeNotice: consumeNotice,
    TRANSIT_MINUTES: TRANSIT_MINUTES
  };
})(window);
