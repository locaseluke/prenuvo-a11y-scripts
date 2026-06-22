// A11y: shared announcement utility for screen reader announcements
const A11Y_DEBUG = false;

function a11yLog(...args) {
  if (A11Y_DEBUG) console.log(...args);
}

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
    a11yLog("🟦 a11yAnnounce: live region created");
    return region;
  }

  return function announce(message) {
    const el = ensureRegion();
    el.textContent = "";
    setTimeout(() => {
      el.textContent = message;
      a11yLog("🟢 a11yAnnounce:", message);
    }, 50);
  };
})();

// A11y: CMS list change observer — announces + manages focus on dynamic load
(function () {
  a11yLog("🟦 List observer script: loaded");

  function observeListChanges(config) {
    const { listSelector, itemSelector, label, focusTarget } = config;
    const list = document.querySelector(listSelector);

    if (!list) {
      a11yLog(`🟦 List not found on this page: ${listSelector}`);
      return;
    }

    let lastItems = Array.from(list.querySelectorAll(itemSelector));
    let debounceTimer = null;
    a11yLog(
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

        a11yLog(
          `🟦 Count changed for ${listSelector}: ${oldCount} → ${newCount}`,
        );

        if (window.a11yAnnounce) {
          window.a11yAnnounce(message);
        }

        // Focus management: move focus to first newly-loaded item's focusable target
        if (added > 0) {
          const firstNewItem = currentItems[oldCount];
          if (firstNewItem) {
            // Use focusTarget selector if provided, otherwise fall back to the item itself
            const focusEl = focusTarget
              ? firstNewItem.querySelector(focusTarget)
              : firstNewItem;

            if (focusEl) {
              // Add tabindex=-1 only if the element isn't already focusable
              if (
                !focusEl.matches(
                  "a, button, input, select, textarea, [tabindex]",
                )
              ) {
                focusEl.setAttribute("tabindex", "-1");
              }
              focusEl.classList.add("a11y-focus-target");
              focusEl.focus({ preventScroll: false });
              a11yLog("🟦 Focus moved to:", focusEl);
            }
          }
        }

        lastItems = currentItems;
      }, 500);
    }).observe(list, { childList: true, subtree: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    a11yLog("🟦 DOMContentLoaded — running list observers");

    const lists = [
      {
        listSelector: ".faq_component",
        itemSelector: ".faq_accordion",
        label: "FAQs",
        focusTarget: ".faq_question", // The clickable question element
      },
      {
        listSelector: ".case-studies-other_list",
        itemSelector: ".articles_item",
        label: "Blog articles",
        focusTarget: "a", // First link in article card
      },
      {
        listSelector: ".research_list",
        itemSelector: ".research_item",
        label: "Research articles",
        focusTarget: ".research_title-link", // Title link
      },
      {
        listSelector: ".conditions_list",
        itemSelector: ".w-dyn-item",
        label: "conditions",
        focusTarget: "a", // First link in condition card
      },
      {
        listSelector: ".media_list",
        itemSelector: ".media_item",
        label: "Media",
        focusTarget: "a", // First link in media item
      },
    ];
    a11yLog(`🟦 Configured lists: ${lists.length}`);
    lists.forEach(observeListChanges);
  });
})();
