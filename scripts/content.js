(function () {
  "use strict";

  const htmlElement = document.documentElement;
  const textPrimaryColor = getComputedStyle(htmlElement)
    .getPropertyValue("--text-primary")
    .trim();
  const mainSurfacePrimary = getComputedStyle(htmlElement)
    .getPropertyValue("--main-surface-primary")
    .trim();
  const messageSurface = getComputedStyle(htmlElement)
    .getPropertyValue("--message-surface")
    .trim();

  // Color Definitions
  const colors = {
    collapsedBtnBg: messageSurface || "#f1f1f1",
    expandedBtnBg: messageSurface || "#dfdfdf",
    btnColor: textPrimaryColor || "#000",
    fadeEffectBg: `linear-gradient(to bottom, rgba(255, 255, 255, 0), ${mainSurfacePrimary})`,
    globalBtnColor: textPrimaryColor || "#000",
    borderColor: textPrimaryColor || "#888",
  };

  // Constants
  const constants = {
    maxCollapsedHeight: "150px",
    collapseExpandBtnText: "▼",
    fadeEffectHeight: "50px",
    buttonPadding: "0px 5px",
    buttonFontSize: "12px",
    globalButtonFontSize: "10px",
    borderRadius: "50%",
    globalBorderRadius: "10px",
  };

  function createButton({ text, title, className, styles, onClick }) {
    const button = document.createElement("button");
    if (text) button.innerText = text;
    button.title = title;
    button.className = className;
    Object.assign(button.style, styles);
    if (onClick) button.addEventListener("click", onClick);
    return button;
  }

  function toggleArticle(article, button, collapse) {
    if (collapse) {
      article.style.maxHeight = constants.maxCollapsedHeight;
      article.style.overflow = "hidden"; // Ensure content is clipped
      button.style.background = colors.collapsedBtnBg;
      button.style.transform = "scaleY(1)";
      addFadeEffect(article);
    } else {
      article.style.maxHeight = `${article.scrollHeight}px`;
      article.style.overflow = "visible"; // Allow content to expand
      button.style.background = colors.expandedBtnBg;
      button.style.transform = "scaleY(-1)";
      removeFadeEffect(article);
    }
    // Update the isCollapsed attribute
    article.setAttribute("data-is-collapsed", collapse);
  }

  function addFadeEffect(article) {
    if (article.querySelector(".fade-effect")) return;

    const targetElement =
      article.querySelector("div > div > div > div") || article;

    const fadeDiv = document.createElement("div");
    fadeDiv.className = "fade-effect";
    Object.assign(fadeDiv.style, {
      position: "absolute",
      bottom: "0",
      left: "50%",
      transform: "translateX(-50%)",
      width: targetElement ? `${targetElement.scrollWidth}px` : "100%",
      height: constants.fadeEffectHeight,
      background: colors.fadeEffectBg,
      pointerEvents: "none",
    });

    article.style.position = "relative";
    article.appendChild(fadeDiv);
  }

  function removeFadeEffect(article) {
    const fadeDiv = article.querySelector(".fade-effect");
    if (fadeDiv) fadeDiv.remove();
  }

  function addCollapseExpandButtons() {
    document.querySelectorAll("article").forEach((article, index, articles) => {
      if (article.querySelector(".collapse-expand-btn")) return;

      // Initialize isCollapsed state from the attribute or default to false
      let isCollapsed = article.getAttribute("data-is-collapsed") === "true";

      article.style.clipPath = "inset(0 0 0 0)";
      article.style.transition = "max-height 0.5s ease-out, overflow 0.5s ease-out";
      article.style.maxHeight = isCollapsed ? constants.maxCollapsedHeight : "none";
      article.style.overflow = isCollapsed ? "hidden" : "visible";

      const collapseExpandBtn = createButton({
        text: constants.collapseExpandBtnText,
        title: "Collapse/Expand",
        className: "collapse-expand-btn",
        styles: {
          position: "absolute",
          top: "0px",
          right: "-30px",
          zIndex: "1",
          cursor: "pointer",
          padding: constants.buttonPadding,
          fontSize: constants.buttonFontSize,
          border: `solid ${colors.borderColor} 1px`,
          borderRadius: constants.borderRadius,
          color: colors.btnColor,
          background: isCollapsed
            ? colors.collapsedBtnBg
            : colors.expandedBtnBg,
          transform: isCollapsed ? "scaleY(1)" : "scaleY(-1)",
          width: "auto",
          height: "auto",
        },
        onClick: () => {
          // Read the current state from the article's attribute
          const isCollapsed = article.getAttribute("data-is-collapsed") === "true";
          toggleArticle(article, collapseExpandBtn, !isCollapsed);
        },
      });

      const targetContainer =
        article.querySelector("div > div > div > div") || article;
      targetContainer.appendChild(collapseExpandBtn);
      targetContainer.style.position = "relative";

      if (isCollapsed) addFadeEffect(article);
    });
  }

  function placeGlobalBtn(globalBtn, targetElement) {
    if (!targetElement) {
      console.error("Target element not found.");
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const bodyRect = document.body.getBoundingClientRect();

    const buttonBottom = bodyRect.bottom - targetRect.top - 51;
    const buttonRight = bodyRect.right - targetRect.right + 11;

    globalBtn.style.bottom = `${buttonBottom}px`;
    globalBtn.style.right = `${buttonRight}px`;
  }

  function addGlobalCollapseButton() {
    if (document.querySelector(".global-collapse-expand-btn")) return;

    let allCollapsed = true;
    const globalBtn = createButton({
      text: "▼ ▲",
      title: "Collapse/Expand All",
      className: "global-collapse-expand-btn",
      styles: {
        position: "absolute",
        bottom: "20px",
        right: "11px",
        zIndex: "1",
        cursor: "pointer",
        padding: "7px 8px",
        fontSize: constants.globalButtonFontSize,
        border: `solid ${colors.borderColor} 1px`,
        background: colors.collapsedBtnBg,
        color: colors.globalBtnColor,
        borderRadius: constants.globalBorderRadius,
      },
      onClick: () => {
        document.querySelectorAll("article").forEach((article) => {
          const btn = article.querySelector(".collapse-expand-btn");
          if (btn) {
            const isCollapsed = article.getAttribute("data-is-collapsed") === "true";
            toggleArticle(article, btn, allCollapsed);
          }
        });
        allCollapsed = !allCollapsed;
        globalBtn.style.background = allCollapsed
          ? colors.collapsedBtnBg
          : colors.expandedBtnBg;
      },
    });

    document.body.appendChild(globalBtn);
    const targetElement = document.querySelector(
      "body > div.flex.h-full.w-full.flex-col > div > div.relative.flex.h-full.w-full.flex-row.overflow-hidden > div > main > div.composer-parent.flex.flex-col.focus-visible\\:outline-0.h-full > div.md\\:pt-0.dark\\:border-white\\/20.md\\:border-transparent.md\\:dark\\:border-transparent.w-full.isolate.has-\\[\\[data-has-thread-error\\]\\]\\:\\[box-shadow\\:var\\(--sharp-edge-bottom-shadow\\)\\].has-\\[\\[data-has-thread-error\\]\\]\\:pt-2 > div > div.m-auto.text-base.px-3.md\\:px-4.w-full.md\\:px-5.lg\\:px-4.xl\\:px-5 > div > form"
    );
    placeGlobalBtn(globalBtn, targetElement);
  }

  function observeMutations() {
    new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList") {
          addCollapseExpandButtons();
        }
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  observeMutations();
  addGlobalCollapseButton();
  addCollapseExpandButtons(); // Initialize buttons for existing articles
})();