// A11y: shared announcement utility for screen reader announcements
window.a11yAnnounce = (function () {
  let region = null;

  function ensureRegion() {
    if (region) return region;
    region = document.createElement("div");
    region.id = "a11y-live-region";
    region.className = "visuallyhidden";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    document.body.appendChild(region);
    return region;
  }

  return function announce(message) {
    const el = ensureRegion();
    el.textContent = "";
    setTimeout(() => {
      el.textContent = message;
    }, 50);
  };
})();

// A11y: CMS list change observer — announces dynamic loading/filtering of CMS items
(function () {
  function observeListChanges(config) {
    const { listSelector, itemSelector, label } = config;
    const list = document.querySelector(listSelector);
    if (!list) return; // Silently bail on pages without this list

    let lastAnnouncedCount = list.querySelectorAll(itemSelector).length;
    let debounceTimer = null;

    new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const newCount = list.querySelectorAll(itemSelector).length;
        if (newCount !== lastAnnouncedCount) {
          const added = newCount - lastAnnouncedCount;
          const message =
            added > 0
              ? `Loaded ${added} more items. Now showing ${newCount} ${label}.`
              : `Now showing ${newCount} ${label}.`;
          if (window.a11yAnnounce) window.a11yAnnounce(message);
          lastAnnouncedCount = newCount;
        }
      }, 500);
    }).observe(list, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Add new lists here as you discover them
    const lists = [
      {
        listSelector: ".faq_component",
        itemSelector: ".faq_accordion",
        label: "FAQs",
      },
      {
        listSelector: ".conditions_list",
        itemSelector: ".w-dyn-item",
        label: "conditions",
      },
    ];

    lists.forEach(observeListChanges);
  });
})();
