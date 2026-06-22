// A11y: accordion keyboard support
document.addEventListener("DOMContentLoaded", () => {
  const accordionConfigs = [
    {
      trigger: ".faq_question",
      panel: ".faq_answer",
      listContainer: ".faq_component",
    },
    {
      trigger: ".blog-citations_accordion-trigger",
      panel: ".blog-citations_accordion-panel",
      listContainer: null,
    },
  ];

  function setPanelState(panelEl, isOpen) {
    panelEl.style.visibility = isOpen ? "visible" : "hidden";

    const focusables = panelEl.querySelectorAll(
      "a, button, input, select, textarea, [tabindex]",
    );
    focusables.forEach((el) => {
      if (isOpen) {
        const originalTabindex = el.dataset.originalTabindex;
        if (originalTabindex !== undefined) {
          if (originalTabindex === "") {
            el.removeAttribute("tabindex");
          } else {
            el.setAttribute("tabindex", originalTabindex);
          }
          delete el.dataset.originalTabindex;
        }
      } else {
        if (el.dataset.originalTabindex === undefined) {
          el.dataset.originalTabindex = el.getAttribute("tabindex") || "";
        }
        el.setAttribute("tabindex", "-1");
      }
    });
  }

  function initTrigger(triggerEl, panelSelector) {
    if (triggerEl.dataset.a11yReady === "true") return;
    triggerEl.dataset.a11yReady = "true";

    const panelEl =
      triggerEl.parentElement.querySelector(panelSelector) ||
      triggerEl.nextElementSibling;
    if (!panelEl) return;

    triggerEl.setAttribute("role", "button");
    triggerEl.setAttribute("tabindex", "0");

    const isOpen = panelEl.classList.contains("is-open");
    triggerEl.setAttribute("aria-expanded", isOpen);
    setPanelState(panelEl, isOpen);

    if (!panelEl.id) {
      panelEl.id = `accordion-panel-${Math.random().toString(36).slice(2, 9)}`;
    }
    triggerEl.setAttribute("aria-controls", panelEl.id);

    // Watch panel class for is-open changes
    new MutationObserver(() => {
      const nowOpen = panelEl.classList.contains("is-open");
      const currentExpanded =
        triggerEl.getAttribute("aria-expanded") === "true";

      if (nowOpen !== currentExpanded) {
        triggerEl.setAttribute("aria-expanded", nowOpen);
        setPanelState(panelEl, nowOpen);
      }
    }).observe(panelEl, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  // Use ONE delegated keydown listener at document level for ALL accordion triggers
  // This is more robust than per-element listeners
  const allTriggerSelectors = accordionConfigs.map((c) => c.trigger).join(", ");

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;

      const trigger = e.target.closest(allTriggerSelectors);
      if (!trigger) return;

      e.preventDefault();
      trigger.click();
    },
    true,
  ); // capture phase — runs before Webflow's listeners

  accordionConfigs.forEach(({ trigger, panel, listContainer }) => {
    document
      .querySelectorAll(trigger)
      .forEach((triggerEl) => initTrigger(triggerEl, panel));

    if (listContainer) {
      const list = document.querySelector(listContainer);
      if (!list) return;

      new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== 1) return;
            if (node.matches?.(trigger)) initTrigger(node, panel);
            node
              .querySelectorAll?.(trigger)
              .forEach((el) => initTrigger(el, panel));
          });
        });
      }).observe(list, { childList: true, subtree: true });
    }
  });
});
