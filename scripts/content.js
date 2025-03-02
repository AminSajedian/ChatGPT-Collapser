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
    },
    globalButtonStyles: {
      padding: "3px 7px",
      fontSize: "10px",
      borderRadius: "10px",
      position: "absolute",
      bottom: "16px",
      right: "58px",
      zIndex: "1",
    },
  };

  let allCollapsed = true;

  /* ------------------------ Helper Functions ------------------------ */

  const createButton = ({ text, title, className, styles, onClick }) => {
    const button = document.createElement("button");
    Object.assign(button, { innerText: text, title, className });
    Object.assign(button.style, styles);
    if (onClick) button.addEventListener("click", onClick);
    return button;
  };

  const toggleCollapseExpandState = (article, button, collapse) => {
    Object.assign(article.style, {
      maxHeight: collapse
        ? constants.maxCollapsedHeight
        : `${article.scrollHeight}px`,
      overflow: collapse ? "hidden" : "visible",
    });

    Object.assign(button.style, {
      background: collapse ? colors.collapsedBtnBg : colors.expandedBtnBg,
      transform: collapse ? "scaleY(1)" : "scaleY(-1)",
    });

    collapse ? addFadeEffect(article) : removeFadeEffect(article);
    article.setAttribute("data-is-collapsed", collapse);
  };

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

  const removeFadeEffect = (article) => {
    article.querySelector(".fade-effect")?.remove();
  };

  /* ------------------------ Main Functions ------------------------ */

  const addCollapseExpandButtons = () => {
    document.querySelectorAll("article").forEach((article) => {
      if (article.querySelector(".collapse-expand-btn")) return;

      const isCollapsed = article.getAttribute("data-is-collapsed") === "true";
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
          zIndex: "1",
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
            collapseExpandBtn,
            !currentlyCollapsed
          );
        },
      });

      const targetContainer =
        article.querySelector("div > div > div > div") || article;
      targetContainer.appendChild(collapseExpandBtn);
      targetContainer.style.position = "relative";
      if (isCollapsed) addFadeEffect(article);
    });
  };

  const toggleAllArticles = () => {
    const articles = document.querySelectorAll("article");
    const someExpanded = Array.from(articles).some(
      (article) => article.getAttribute("data-is-collapsed") === "false"
    );

    allCollapsed = someExpanded; // If any article is expanded, collapse all; otherwise, expand all

    articles.forEach((article) => {
      const btn = article.querySelector(".collapse-expand-btn");
      if (btn) toggleCollapseExpandState(article, btn, allCollapsed);
    });

    document.querySelector(".global-collapse-expand-btn").style.background =
      allCollapsed ? colors.collapsedBtnBg : colors.expandedBtnBg;
  };

  const addGlobalCollapseButton = () => {
    if (document.querySelector(".global-collapse-expand-btn")) return;

    const globalBtn = createButton({
      text: "▼ ▲",
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
    observeFormChanges(globalBtn);
  };

  /* ------------------------ Observers ------------------------ */

  const observeFormChanges = (globalBtn) => {
    new MutationObserver(() => {
      const formElement = document.querySelector("form");
      if (formElement && !formElement.contains(globalBtn)) {
        formElement.appendChild(globalBtn);
        formElement.style.position = "relative";
      }
    }).observe(document.body, { childList: true, subtree: true });
  };

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
  addCollapseExpandButtons();
})();
