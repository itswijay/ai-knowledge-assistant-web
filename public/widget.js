(function () {
  "use strict";

  if (window.__kdok_widget_initialized) return;
  window.__kdok_widget_initialized = true;

  // 1. Resolve configuration from script tag or window.kdokSettings
  var currentScript =
    document.currentScript ||
    document.querySelector("script[data-assistant-id]");
  var settings = window.kdokSettings || {};
  var assistantId =
    (currentScript && currentScript.getAttribute("data-assistant-id")) ||
    settings.assistantId;

  if (!assistantId) {
    console.warn("[kdok] Missing data-assistant-id attribute on widget script tag.");
    return;
  }

  // Derive origin from script src so it works dynamically across localhost & production
  var scriptSrc = currentScript ? currentScript.src : "";
  var origin = "https://kdok.app";
  try {
    if (scriptSrc) {
      var parsedUrl = new URL(scriptSrc);
      origin = parsedUrl.origin;
    }
  } catch (e) {
    // Fallback to default
  }

  var position =
    (currentScript && currentScript.getAttribute("data-position")) ||
    settings.position ||
    "bottom-right";
  var isLeft = position === "bottom-left";

  // 2. Inject CSS Styles
  var style = document.createElement("style");
  style.id = "kdok-widget-styles";
  style.textContent = `
    #kdok-widget-root {
      position: fixed;
      ${isLeft ? "left: 20px;" : "right: 20px;"}
      bottom: 20px;
      z-index: 2147483647;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #kdok-widget-button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #2563EB;
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, background-color 0.2s ease;
      -webkit-tap-highlight-color: transparent;
    }
    #kdok-widget-button:hover {
      transform: scale(1.06);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22);
    }
    #kdok-widget-button:active {
      transform: scale(0.96);
    }
    #kdok-widget-button svg {
      width: 26px;
      height: 26px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: transform 0.2s ease, opacity 0.2s ease;
    }
    #kdok-widget-iframe-container {
      position: fixed;
      ${isLeft ? "left: 20px;" : "right: 20px;"}
      bottom: 86px;
      width: 400px;
      height: 600px;
      max-height: calc(100vh - 106px);
      max-width: calc(100vw - 40px);
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.08);
      overflow: hidden;
      z-index: 2147483646;
      opacity: 0;
      pointer-events: none;
      transform: translateY(16px) scale(0.96);
      transform-origin: ${isLeft ? "bottom left" : "bottom right"};
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      background: #ffffff;
    }
    #kdok-widget-iframe-container.kdok-open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }
    #kdok-widget-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
    @media (max-width: 480px) {
      #kdok-widget-iframe-container {
        left: 0 !important;
        right: 0 !important;
        top: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
        border: none !important;
        transform: translateY(100%);
      }
      #kdok-widget-iframe-container.kdok-open {
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);

  // 3. Create Root & Elements
  var root = document.createElement("div");
  root.id = "kdok-widget-root";

  var button = document.createElement("button");
  button.id = "kdok-widget-button";
  button.setAttribute("aria-label", "Toggle AI knowledge dock");
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-expanded", "false");

  var chatIcon = `
    <svg id="kdok-icon-chat" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;
  var closeIcon = `
    <svg id="kdok-icon-close" viewBox="0 0 24 24" style="display: none;">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  button.innerHTML = chatIcon + closeIcon;

  var iframeContainer = document.createElement("div");
  iframeContainer.id = "kdok-widget-iframe-container";

  var iframe = document.createElement("iframe");
  iframe.id = "kdok-widget-iframe";
  iframe.src = origin + "/widget/" + encodeURIComponent(assistantId);
  iframe.title = "kdok AI knowledge assistant";
  iframe.setAttribute("allow", "clipboard-write");

  iframeContainer.appendChild(iframe);
  root.appendChild(button);
  document.body.appendChild(iframeContainer);
  document.body.appendChild(root);

  // 4. Toggle Interaction
  var isOpen = false;
  function toggleWidget(state) {
    isOpen = typeof state === "boolean" ? state : !isOpen;
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");

    var chatSvg = document.getElementById("kdok-icon-chat");
    var closeSvg = document.getElementById("kdok-icon-close");

    if (isOpen) {
      iframeContainer.classList.add("kdok-open");
      if (chatSvg) chatSvg.style.display = "none";
      if (closeSvg) closeSvg.style.display = "block";
    } else {
      iframeContainer.classList.remove("kdok-open");
      if (chatSvg) chatSvg.style.display = "block";
      if (closeSvg) closeSvg.style.display = "none";
    }
  }

  button.addEventListener("click", function () {
    toggleWidget();
  });

  // 5. Listen to postMessage from iframe
  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "kdok:close") {
      toggleWidget(false);
    }
  });

  // Expose global controller
  window.kdok = {
    open: function () {
      toggleWidget(true);
    },
    close: function () {
      toggleWidget(false);
    },
    toggle: function () {
      toggleWidget();
    },
  };
})();
