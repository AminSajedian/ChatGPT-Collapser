(function () {
  "use strict";

  // Get the computed values from the <html> element
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
    globalButtonPadding: "10px",
    borderRadius: "50%",
    globalBorderRadius: "5px",
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
      button.style.background = colors.collapsedBtnBg;
      button.style.transform = "scaleY(1)";
      addFadeEffect(article);
    } else {
      article.style.maxHeight = `${article.scrollHeight}px`;
      button.style.background = colors.expandedBtnBg;
      button.style.transform = "scaleY(-1)";
      removeFadeEffect(article);
    }
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

      const isLast = index === articles.length - 1;
      let isCollapsed = !isLast;
      article.style.clipPath = "inset(0 0 0 0)";
      article.style.transition = "all 0.5s ease-out";
      article.style.maxHeight = isCollapsed
        ? constants.maxCollapsedHeight
        : "none";

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
          isCollapsed = !isCollapsed;
          toggleArticle(article, collapseExpandBtn, isCollapsed);
        },
      });

      const targetContainer =
        article.querySelector("div > div > div > div") || article;
      targetContainer.appendChild(collapseExpandBtn);
      targetContainer.style.position = "relative";

      if (isCollapsed) addFadeEffect(article);
    });
  }

  function addGlobalCollapseButton() {
    if (document.querySelector(".global-collapse-expand-btn")) return;

    let allCollapsed = true;
    const globalBtn = createButton({
      text: "▼ ▲",
      title: "Collapse/Expand All",
      className: "global-collapse-expand-btn",
      styles: {
        position: "fixed",
        bottom: "10px",
        right: "10px",
        zIndex: "1",
        cursor: "pointer",
        padding: constants.globalButtonPadding,
        fontSize: constants.globalButtonFontSize,
        border: `solid ${colors.borderColor} 1px`,
        background: colors.collapsedBtnBg,
        color: colors.globalBtnColor,
        borderRadius: constants.globalBorderRadius,
      },
      onClick: () => {
        document.querySelectorAll("article").forEach((article) => {
          const btn = article.querySelector(".collapse-expand-btn");
          if (btn && btn.innerText) toggleArticle(article, btn, allCollapsed);
        });
        allCollapsed = !allCollapsed;
        globalBtn.style.background = allCollapsed
          ? colors.collapsedBtnBg
          : colors.expandedBtnBg;
      },
    });

    document.body.appendChild(globalBtn);
  }

  function observeMutations() {
    new MutationObserver(addCollapseExpandButtons).observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  observeMutations();
  addGlobalCollapseButton();
})();