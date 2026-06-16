// a11y: shared announcement utility for screen reader announcements
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

// Shared announcement utility
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

// FAQ list observer
document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector(".faq_component");
  if (!list) {
    console.warn("🟦 FAQ list not found — selector wrong?");
    return;
  }

  let lastAnnouncedCount = list.querySelectorAll(".faq_accordion").length;
  let debounceTimer = null;
  console.log(`🟦 FAQ observer: initial count = ${lastAnnouncedCount}`);

  const observer = new MutationObserver(() => {
    // Clear any pending announcement
    clearTimeout(debounceTimer);

    // Wait 500ms for mutations to settle, then announce the final count
    debounceTimer = setTimeout(() => {
      const newCount = list.querySelectorAll(".faq_accordion").length;
      if (newCount !== lastAnnouncedCount) {
        const added = newCount - lastAnnouncedCount;
        const message =
          added > 0
            ? `Loaded ${added} more items. Now showing ${newCount} FAQs.`
            : `Now showing ${newCount} FAQs.`;
        window.a11yAnnounce(message);
        lastAnnouncedCount = newCount;
      }
    }, 500);
  });

  observer.observe(list, { childList: true, subtree: true });
  console.log("🟦 FAQ observer attached to:", list);
});
