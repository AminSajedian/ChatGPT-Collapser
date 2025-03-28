(function () {
  ("use strict");

  /* ------------------------ Constants & Variables ------------------------ */

  const htmlElement = document.documentElement;

  /**
   * Retrieves a CSS variable's value with a fallback if undefined.
   * @param {string} varName - The name of the CSS variable.
   * @param {string} fallback - The fallback value if the variable is not found.
   * @returns {string} - The value of the CSS variable or the fallback.
   */
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
      bottom: "12px",
      right: "40px",
      zIndex: "1",
    },
  };

  /* ------------------------ Helper Functions ------------------------ */

  /**
   * Creates a button element with specified properties.
   * @param {Object} config - Button configuration.
   * @param {string} config.text - Button label.
   * @param {string} config.title - Tooltip text.
   * @param {string} config.className - Class name to apply.
   * @param {Object} config.styles - CSS styles to apply.
   * @param {Function} config.onClick - Click handler.
   * @returns {HTMLButtonElement} - Configured button element.
   */
  const createButton = ({ text, title, className, styles, onClick }) => {
    const button = document.createElement("button");
    Object.assign(button, { innerText: text, title, className });
    Object.assign(button.style, styles);
    if (onClick) button.addEventListener("click", onClick);
    return button;
  };

  /**
   * Toggles the collapse or expand state of a target element within an article.
   * @param {HTMLElement} article - The article element.
   * @param {HTMLElement} collapseEl - The target content container to collapse/expand.
   * @param {HTMLElement} button - The associated toggle button.
   * @param {boolean} collapse - Whether to collapse (true) or expand (false).
   * @param {Object} [options] - Optional settings.
   * @param {boolean} [options.shouldScroll=true] - Whether to scroll into view when collapsing.
   */
  const toggleCollapseExpandState = (
    article,
    collapseEl,
    button,
    collapse,
    options = { shouldScroll: true }
  ) => {
    const { shouldScroll } = options;

    if (collapse) {
      if (shouldScroll) {
        collapseEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setTimeout(() => {
        collapseEl.style.maxHeight = constants.maxCollapsedHeight;
        collapseEl.style.overflow = "hidden";
        article.setAttribute("data-is-collapsed", "true");

        button.style.background = colors.collapsedBtnBg;
        button.style.transform = "scaleY(1)";

        addFadeEffect(collapseEl);
      }, 300);
    } else {
      collapseEl.style.maxHeight = `${collapseEl.scrollHeight}px`;
      collapseEl.style.overflow = "visible";
      article.setAttribute("data-is-collapsed", "false");

      button.style.background = colors.expandedBtnBg;
      button.style.transform = "scaleY(-1)";

      removeFadeEffect(collapseEl);
    }
  };

  /**
   * Adds a gradient fade effect to the bottom of a collapsible element.
   * @param {HTMLElement} collapseEl - The target element.
   */
  const addFadeEffect = (collapseEl) => {
    if (collapseEl.querySelector(".fade-effect")) return;

    const target =
      collapseEl.querySelector("div > div > div > div") || collapseEl;
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

    collapseEl.style.position = "relative";
    collapseEl.appendChild(fadeDiv);
  };

  /**
   * Removes the fade effect from a collapsible element.
   * @param {HTMLElement} collapseEl - The element from which to remove the effect.
   */
  const removeFadeEffect = (collapseEl) => {
    collapseEl.querySelector(".fade-effect")?.remove();
  };

  /* ------------------------ Main Functions ------------------------ */

  /**
   * Adds collapse/expand toggle buttons to all article elements in the DOM.
   */
  const addCollapseBtns = () => {
    document.querySelectorAll("article").forEach((article) => {
      if (article.querySelector(".collapse-btn-wrapper")) return;

      const targetContainer =
        article.querySelector("div > div > div > div") || article;
      const collapseEl =
        article.querySelector("div > div > div > div > div") || article;
      collapseEl.classList.add("collapse-Element");

      article.setAttribute("data-is-collapsed", "false");
      const isCollapsed = false;

      Object.assign(collapseEl.style, {
        clipPath: "inset(0 0 0 0)",
        transition: "max-height 0.5s ease-out, overflow 0.5s ease-out",
        maxHeight: isCollapsed ? constants.maxCollapsedHeight : "none",
        overflow: isCollapsed ? "hidden" : "visible",
        position: "relative",
      });

      const collapseBtnWrapper = document.createElement("div");
      collapseBtnWrapper.className = "collapse-btn-wrapper";
      Object.assign(collapseBtnWrapper.style, {
        position: "sticky",
        top: "0px",
        zIndex: "10",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.7)",
      });

      const collapseBtn = createButton({
        text: constants.collapseExpandBtnText,
        title: "Collapse/Expand Message",
        className: "collapse-expand-btn",
        styles: {
          position: "absolute",
          top: "10px",
          right: "-30px",
          cursor: "pointer",
          border: `solid ${colors.borderColor} 1px`,
          color: colors.btnColor,
          background: isCollapsed
            ? colors.collapsedBtnBg
            : colors.expandedBtnBg,
          transform: isCollapsed ? "scaleY(1)" : "scaleY(-1)",
          ...constants.buttonStyles,
        },
        onClick: () => {
          const currentlyCollapsed =
            article.getAttribute("data-is-collapsed") === "true";
          toggleCollapseExpandState(
            article,
            collapseEl,
            collapseBtn,
            !currentlyCollapsed
          );
        },
      });

      collapseBtnWrapper.appendChild(collapseBtn);
      targetContainer.prepend(collapseBtnWrapper);
      targetContainer.style.position = "relative";

      if (isCollapsed) addFadeEffect(article);
    });
  };

  /**
   * Toggles the collapsed/expanded state of all article elements simultaneously.
   */
  const toggleAllArticles = () => {
    const articles = document.querySelectorAll("article");
    const someExpanded = Array.from(articles).some(
      (article) => article.getAttribute("data-is-collapsed") === "false"
    );

    articles.forEach((article) => {
      const collapseEl = article.querySelector(".collapse-Element") || article;
      const btn = article.querySelector(".collapse-expand-btn");
      if (btn)
        toggleCollapseExpandState(article, collapseEl, btn, someExpanded, {
          shouldScroll: false,
        });
    });

    const globalBtn = document.querySelector(".global-collapse-expand-btn");
    if (globalBtn) {
      globalBtn.style.background = someExpanded
        ? colors.collapsedBtnBg
        : colors.expandedBtnBg;
    }
  };

  /**
   * Appends a global button to the DOM that toggles all article collapses.
   */
  const addGlobalCollapseButton = () => {
    if (document.querySelector(".global-collapse-expand-btn")) return;

    const globalBtn = createButton({
      text: "▼▲",
      title: "Collapse/Expand All Messages",
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
   * Initializes a MutationObserver to dynamically manage collapse buttons
   * when new article elements are added to the DOM.
   */
  const observeMutations = () => {
    new MutationObserver(() => {
      addGlobalCollapseButton();
      addCollapseBtns();
    }).observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  /* ------------------------ Initialization ------------------------ */

  observeMutations();
})();
