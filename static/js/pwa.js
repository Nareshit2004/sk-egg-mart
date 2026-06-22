/* ─────────────────────────────────────────────
   SK EGG MART — PWA Installation Script
   ───────────────────────────────────────────── */

let deferredPrompt = null;

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("✅ SW registered:", reg.scope);
      })
      .catch((err) => {
        console.log("SW registration failed:", err);
      });
  });
}

// PWA Install Prompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  const banner = document.getElementById("pwa-install-banner");
  if (banner) {
    setTimeout(() => banner.classList.add("show"), 2000);
  }
});

window.installPWA = function () {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then((choice) => {
    if (choice.outcome === "accepted") {
      console.log("PWA installed");
      const banner = document.getElementById("pwa-install-banner");
      if (banner) banner.classList.remove("show");
    }
    deferredPrompt = null;
  });
};

window.dismissPWA = function () {
  const banner = document.getElementById("pwa-install-banner");
  if (banner) banner.classList.remove("show");
};

// App installed
window.addEventListener("appinstalled", () => {
  console.log("🥚 SK EGG MART installed as PWA");
  deferredPrompt = null;
});
