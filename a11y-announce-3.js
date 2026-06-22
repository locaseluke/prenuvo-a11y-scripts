// A11y: shared announcement utility for screen reader announcements
const A11Y_DEBUG = false; // flip to true for diagnostic logs

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
    if (A11Y_DEBUG) console.log("🟦 a11yAnnounce: live region created");
    return region;
  }

  return function announce(message) {
    const el = ensureRegion();
    el.textContent = "";
    setTimeout(() => {
      el.textContent = message;
      if (A11Y_DEBUG) console.log("🟢 a11yAnnounce:", message);
    }, 50);
  };
})();

// A11y: CMS list change observer — announces + focuses new items
(function () {
  if (A11Y_DEBUG) console.log("🟦 List observer script: loaded");

  function observeListChanges(config) {
    const { listSelector, itemSelector, label } = config;
    const list = document.querySelector(listSelector);

    if (!list) return;

    let lastItems = Array.from(list.querySelectorAll(itemSelector));
    let debounceTimer = null;
    if (A11Y_DEBUG)
      console.log(
        `🟦 Observer attached: ${listSelector} (initial count: ${lastItems.length}, label: "${label}")`,
      );

    new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const currentItems = Array.from(list.querySelectorAll(itemSelector));
        const newCount = currentItems.length;
        const oldCount = lastItems.length;

        if (newCount === oldCount) return;

        const added = newCount - oldCount;
        const message =
          added > 0
            ? `Loaded ${added} more items. Now showing ${newCount} ${label}.`
            : `Now showing ${newCount} ${label}.`;

        if (A11Y_DEBUG)
          console.log(`🟦 Count changed: ${oldCount} → ${newCount}`);
        if (window.a11yAnnounce) window.a11yAnnounce(message);

        // Focus management: if items were added, move focus to the first new item
        if (added > 0) {
          const firstNewItem = currentItems[oldCount];
          if (firstNewItem) {
            // Make it programmatically focusable
            firstNewItem.setAttribute("tabindex", "-1");
            // Add a class so we can style the focus ring
            firstNewItem.classList.add("a11y-focus-target");
            // Move focus
            firstNewItem.focus({ preventScroll: false });
            if (A11Y_DEBUG)
              console.log("🟦 Focus moved to first new item:", firstNewItem);
          }
        }

        lastItems = currentItems;
      }, 500);
    }).observe(list, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
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
      {
        listSelector: ".media_list",
        itemSelector: ".media_item",
        label: "Media",
      },
    ];
    if (A11Y_DEBUG) console.log(`🟦 Configured lists: ${lists.length}`);
    lists.forEach(observeListChanges);
  });
})();
