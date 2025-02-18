(function () {
  "use strict";
  const collapseExpandBtnText = "▼";
  const maxCollapsedHeight = "100px";
  const collapsedBtnBg = "#555";
  const expandedBtnBg = "#333";

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
          article.style.maxHeight = maxCollapsedHeight;
          button.style.background = collapsedBtnBg;
          button.style.transform = "scaleY(1)";
          addFadeEffect(article);
      } else {
          article.style.maxHeight = `${article.scrollHeight}px`;
          button.style.background = expandedBtnBg;
          button.style.transform = "scaleY(-1)";
          removeFadeEffect(article);
      }
  }

  function addFadeEffect(article) {
      if (article.querySelector(".fade-effect")) return;
      const targetElement = article.querySelector("div > div > div > div") || article;

      const fadeDiv = document.createElement("div");
      fadeDiv.className = "fade-effect";
      Object.assign(fadeDiv.style, {
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          width: targetElement ? `${targetElement.scrollWidth}px` : "100%",
          height: "50px",
          background: "linear-gradient(to bottom, rgba(0, 0, 0, 0), #212121)",
          pointerEvents: "none"
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
          article.style.maxHeight = isCollapsed ? maxCollapsedHeight : "none";

          const needsButton = article.scrollHeight > parseInt(maxCollapsedHeight);

          const collapseExpandBtn = createButton({
              text: needsButton ? collapseExpandBtnText : "",
              title: needsButton ? "Collapse/Expand" : "",
              className: "collapse-expand-btn",
              styles: {
                  position: "absolute",
                  top: "0px",
                  right: "-30px",
                  zIndex: "1",
                  cursor: "pointer",
                  padding: "0px 5px",
                  fontSize: "12px",
                  border: "solid #888 1px",
                  borderRadius: "50%",
                  background: isCollapsed ? collapsedBtnBg : expandedBtnBg,
                  transform: isCollapsed ? "scaleY(1)" : "scaleY(-1)",
                  cursor: needsButton ? "pointer" : "auto",
                  width: needsButton ? "auto" : "25px",
                  height: needsButton ? "auto" : "25px",
              },
              onClick: needsButton ? () => {
                  isCollapsed = !isCollapsed;
                  toggleArticle(article, collapseExpandBtn, isCollapsed);
              } : null
          });

          const targetContainer = article.querySelector("div > div > div > div") || article;
          targetContainer.appendChild(collapseExpandBtn);
          targetContainer.style.position = "relative";
          if (isCollapsed && needsButton) addFadeEffect(article);
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
              padding: "10px",
              fontSize: "10px",
              border: "solid #888 1px",
              background: collapsedBtnBg,
              color: "#fff",
              borderRadius: "5px"
          },
          onClick: () => {
              document.querySelectorAll("article").forEach(article => {
                  const btn = article.querySelector(".collapse-expand-btn");
                  if (btn && btn.innerText) toggleArticle(article, btn, allCollapsed);
              });
              allCollapsed = !allCollapsed;
              globalBtn.style.background = allCollapsed ? collapsedBtnBg : expandedBtnBg;
          }
      });

      document.body.appendChild(globalBtn);
  }

  function observeMutations() {
      new MutationObserver(addCollapseExpandButtons).observe(document.body, { childList: true, subtree: true });
  }

  observeMutations();
  addGlobalCollapseButton();
})();