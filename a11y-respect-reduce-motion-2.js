// A11y: respect prefers-reduced-motion sitewide
(function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!prefersReducedMotion) return;

  // Add class to <html> for CSS hooks
  document.documentElement.classList.add("user-prefers-reduced-motion");

  function disableMotion() {
    // Disable Lenis smooth scroll
    if (window.lenis) {
      window.lenis.destroy();
      window.lenis = null;
    }

    // Disable GSAP animations
    if (window.gsap?.globalTimeline) {
      window.gsap.globalTimeline.pause();
    }
    if (window.ScrollTrigger) {
      window.ScrollTrigger.getAll().forEach((st) => st.disable());
    }

    // Disable Webflow IX2
    if (window.Webflow && window.Webflow.require) {
      try {
        const ix2 = window.Webflow.require("ix2");
        if (ix2 && ix2.destroy) ix2.destroy();
      } catch (e) {}
    }

    // Pause autoplay videos
  document.querySelectorAll('video').forEach(video => {
    video.pause();
    video.removeAttribute('autoplay');
    
    // Prevent future play attempts by hijacking the play() method
    const originalPlay = video.play.bind(video);
    video.play = function() {
      // Reject the play promise silently
      return Promise.resolve();
    };
    
    // Also listen for any play events that bypass our override
    video.addEventListener('play', () => {
      video.pause();
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", disableMotion);
  } else {
    disableMotion();
  }

  if (window.Webflow && window.Webflow.push) {
    window.Webflow.push(disableMotion);
  }
})();
