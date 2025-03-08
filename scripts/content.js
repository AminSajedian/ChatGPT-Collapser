(function () {
  "use strict";

  /* ------------------------ Constants & Variables ------------------------ */

  const htmlElement = document.documentElement;
  const getCSSVar = (varName, fallback) =>
    getComputedStyle(htmlElement).getPropertyValue(varName).trim() || fallback;

  const colors = {
    collapsedBtnBg: getCSSVar("--message-surface", "#f1f1f1"),
    expandedBtnBg: getCSSVar("--message-surface", "#dfdfdf"),
    btnColor: getCSSVar("--text-primary", "#000"),
    fadeEffectBg: `linear-gradient(to bottom, rgba(255, 255, 255, 0), ${getCSSVar(
      "--main-surface-primary"
    )})`,
    globalBtnColor: getCSSVar("--text-primary", "#000"),
    borderColor: getCSSVar("--text-primary", "#888"),
  };

  const constants = {
    maxCollapsedHeight: "150px",
    fadeEffectHeight: "50px",
    collapseExpandBtnText: "▼",
    buttonStyles: {
      padding: "0px 5px",
      fontSize: "12px",
      borderRadius: "50%",
      zIndex: "1",
    },
    globalButtonStyles: {
      padding: "3px 4px",
      fontSize: "10px",
      borderRadius: "10px",
      position: "fixed",
      bottom: "6px",
      right: "40px",
      zIndex: "1",
    },
  };

  /* ------------------------ Helper Functions ------------------------ */

  /**
   * Creates a button element with the specified properties.
   */
  const createButton = ({ text, title, className, styles, onClick }) => {
    const button = document.createElement("button");
    Object.assign(button, { innerText: text, title, className });
    Object.assign(button.style, styles);
    if (onClick) button.addEventListener("click", onClick);
    return button;
  };

  /**
   * Toggles the collapse/expand state of an article.
   */
  const toggleCollapseExpandState = (article, button, collapse) => {
    article.style.maxHeight = collapse
      ? constants.maxCollapsedHeight
      : `${article.scrollHeight}px`;
    article.style.overflow = collapse ? "hidden" : "visible";

    button.style.background = collapse ? colors.collapsedBtnBg : colors.expandedBtnBg;
    button.style.transform = collapse ? "scaleY(1)" : "scaleY(-1)";

    collapse ? addFadeEffect(article) : removeFadeEffect(article);
    article.setAttribute("data-is-collapsed", collapse);
  };

  /**
   * Adds a fade effect to the bottom of the article.
   */
  const addFadeEffect = (article) => {
    if (article.querySelector(".fade-effect")) return;

    const target = article.querySelector("div > div > div > div") || article;
    const fadeDiv = document.createElement("div");
    fadeDiv.className = "fade-effect";

    Object.assign(fadeDiv.style, {
      position: "absolute",
      bottom: "0",
      left: "50%",
      transform: "translateX(-50%)",
      width: `${target.scrollWidth}px`,
      height: constants.fadeEffectHeight,
      background: colors.fadeEffectBg,
      pointerEvents: "none",
    });

    article.style.position = "relative";
    article.appendChild(fadeDiv);
  };

  /**
   * Removes the fade effect from the article.
   */
  const removeFadeEffect = (article) => {
    article.querySelector(".fade-effect")?.remove();
  };

  /* ------------------------ Main Functions ------------------------ */

  /**
   * Adds collapse/expand buttons to all articles.
   */
  const addCollapseExpandButtons = () => {
    document.querySelectorAll("article").forEach((article) => {
      if (article.querySelector(".collapse-expand-btn")) return;

      article.setAttribute("data-is-collapsed", "false");
      const isCollapsed = false;

      Object.assign(article.style, {
        clipPath: "inset(0 0 0 0)",
        transition: "max-height 0.5s ease-out, overflow 0.5s ease-out",
        maxHeight: isCollapsed ? constants.maxCollapsedHeight : "none",
        overflow: isCollapsed ? "hidden" : "visible",
      });

      const collapseExpandBtn = createButton({
        text: constants.collapseExpandBtnText,
        title: "Collapse/Expand",
        className: "collapse-expand-btn",
        styles: {
          position: "absolute",
          top: "0px",
          right: "-30px",
          cursor: "pointer",
          border: `solid ${colors.borderColor} 1px`,
          color: colors.btnColor,
          background: isCollapsed ? colors.collapsedBtnBg : colors.expandedBtnBg,
          transform: isCollapsed ? "scaleY(1)" : "scaleY(-1)",
          ...constants.buttonStyles,
        },
        onClick: () => {
          const currentlyCollapsed =
            article.getAttribute("data-is-collapsed") === "true";
          toggleCollapseExpandState(article, collapseExpandBtn, !currentlyCollapsed);
        },
      });

      const targetContainer =
        article.querySelector("div > div > div > div") || article;
      targetContainer.appendChild(collapseExpandBtn);
      targetContainer.style.position = "relative";

      if (isCollapsed) addFadeEffect(article);
    });
  };

  /**
   * Toggles the collapse/expand state of all articles.
   */
  const toggleAllArticles = () => {
    const articles = document.querySelectorAll("article");
    const someExpanded = Array.from(articles).some(
      (article) => article.getAttribute("data-is-collapsed") === "false"
    );

    articles.forEach((article) => {
      const btn = article.querySelector(".collapse-expand-btn");
      if (btn) toggleCollapseExpandState(article, btn, someExpanded);
    });

    const globalBtn = document.querySelector(".global-collapse-expand-btn");
    if (globalBtn) {
      globalBtn.style.background = someExpanded
        ? colors.collapsedBtnBg
        : colors.expandedBtnBg;
    }
  };

  /**
   * Adds the global collapse/expand button to the body.
   */
  const addGlobalCollapseButton = () => {
    if (document.querySelector(".global-collapse-expand-btn")) return;

    const globalBtn = createButton({
      text: "▼▲",
      title: "Collapse/Expand All",
      className: "global-collapse-expand-btn",
      styles: {
        cursor: "pointer",
        border: `solid ${colors.borderColor} 1px`,
        background: colors.collapsedBtnBg,
        color: colors.globalBtnColor,
        ...constants.globalButtonStyles,
      },
      onClick: toggleAllArticles,
    });

    document.body.appendChild(globalBtn);
  };

  /* ------------------------ Observers ------------------------ */

  /**
   * Observes DOM mutations to dynamically add collapse/expand buttons.
   */
  const observeMutations = () => {
    new MutationObserver(() => addCollapseExpandButtons()).observe(
      document.body,
      {
        childList: true,
        subtree: true,
      }
    );
  };

  /* ------------------------ Initialization ------------------------ */

  observeMutations();
  addGlobalCollapseButton();
})();