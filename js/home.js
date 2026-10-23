(function (global) {
  "use strict";

  const data = global.CITYWALK_DATA;
  const UI = global.CityWalk.UI;

  function init() {
    UI.initPage("home");

    const cityGrid = document.getElementById("city-grid");
    if (cityGrid) {
      cityGrid.innerHTML = data.cities.map(UI.renderCityCard).join("");
    }

    const featuredGrid = document.getElementById("featured-routes");
    if (featuredGrid) {
      const featuredIds = ["nj-wutong", "bj-axis", "cd-park", "dl-erhai", "nj-qinhuai", "bj-hutong"];
      featuredGrid.innerHTML = featuredIds.map(function (routeId) {
        const route = data.routes.find(function (item) { return item.id === routeId; });
        return route ? UI.renderRouteCard(route) : "";
      }).join("");
    }

    const heroImage = document.getElementById("hero-image");
    if (heroImage && data.cities[0]) {
      heroImage.src = data.cities[0].heroImage;
    }

    const searchForm = document.getElementById("home-search");
    const searchInput = document.getElementById("home-search-input");
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const query = searchInput ? searchInput.value.trim() : "";
        window.location.href = "explore.html" + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
