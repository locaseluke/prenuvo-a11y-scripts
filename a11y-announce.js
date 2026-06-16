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
    console.log("🟦 a11yAnnounce: live region created");
    return region;
  }

  return function announce(message) {
    const el = ensureRegion();
    el.textContent = "";
    setTimeout(() => {
      el.textContent = message;
      console.log("🟢 a11yAnnounce:", message);
    }, 50);
  };
})();

// A11y: CMS list change observer
(function () {
  console.log("🟦 List observer script: loaded");

  function observeListChanges(config) {
    const { listSelector, itemSelector, label } = config;
    const list = document.querySelector(listSelector);

    if (!list) {
      console.log(`🟦 List not found on this page: ${listSelector}`);
      return;
    }

    let lastAnnouncedCount = list.querySelectorAll(itemSelector).length;
    let debounceTimer = null;
    console.log(
      `🟦 Observer attached: ${listSelector} (initial count: ${lastAnnouncedCount}, label: "${label}")`,
    );

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
          console.log(
            `🟦 Count changed for ${listSelector}: ${lastAnnouncedCount} → ${newCount}`,
          );
          if (window.a11yAnnounce) {
            window.a11yAnnounce(message);
          } else {
            console.warn("🟦 a11yAnnounce not available!");
          }
          lastAnnouncedCount = newCount;
        }
      }, 500);
    }).observe(list, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    console.log("🟦 DOMContentLoaded — running list observers");

    const lists = [
      {
        listSelector: ".faq_component",
        itemSelector: ".faq_accordion",
        label: "FAQs",
      },
      {
        listSelector: ".case-studies-other_list",
        itemSelector: ".articles_item",
        label: "Blog articles",
      },
      {
        listSelector: ".research_list",
        itemSelector: ".research_item",
        label: "Research articles",
      },
      {
        listSelector: ".conditions_list",
        itemSelector: ".w-dyn-item",
        label: "conditions",
      },
    ];
    console.log(`🟦 Configured lists: ${lists.length}`);
    lists.forEach(observeListChanges);
  });
})();
