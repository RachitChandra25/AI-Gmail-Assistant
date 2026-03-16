function createToolbar() {
  if (document.getElementById("ai-toolbar")) return;

  const toolbar = document.createElement("div");
  toolbar.id = "ai-toolbar";

  const container = document.createElement("div");
  container.className = "ai-container";

  const summarizeBtn = document.createElement("button");
  summarizeBtn.id = "summarizeBtn";
  summarizeBtn.innerText = "Summarize";
  summarizeBtn.className = "ai-btn ai-summarize";

  const translateBtn = document.createElement("button");
  translateBtn.id = "translateBtn";
  translateBtn.innerText = "Translate";
  translateBtn.className = "ai-btn ai-translate";

  const replyBtn = document.createElement("button");
  replyBtn.id = "replyBtn";
  replyBtn.innerText = "Reply";
  replyBtn.className = "ai-btn ai-reply";

  container.appendChild(summarizeBtn);
  container.appendChild(translateBtn);
  container.appendChild(replyBtn);

  toolbar.appendChild(container);
  document.body.appendChild(toolbar);
}

function showLanguageModal(callback) {
  const languages = [
    "English",
    "Hindi",
    "Kannada",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Marathi",
    "Bengali",
    "Punjabi",
  ];

  const overlay = document.createElement("div");
  overlay.className = "ai-modal-overlay";

  const modal = document.createElement("div");
  modal.className = "ai-modal";

  /* ---------- HEADER ---------- */

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.marginBottom = "10px";

  const title = document.createElement("h3");
  title.innerText = "Select Language";
  title.style.margin = "0";

  const close = document.createElement("span");
  close.innerText = "✕";
  close.style.cursor = "pointer";
  close.style.fontSize = "18px";

  close.onclick = () => {
    overlay.remove();
  };

  header.appendChild(title);
  header.appendChild(close);

  /* ---------- LANGUAGE LIST ---------- */

  const list = document.createElement("div");
  list.className = "ai-language-list";

  languages.forEach((lang) => {
    const item = document.createElement("div");
    item.className = "ai-language-item";
    item.innerText = lang;

    item.onclick = () => {
      overlay.remove();
      callback(lang);
    };

    list.appendChild(item);
  });

  modal.appendChild(header);
  modal.appendChild(list);

  overlay.appendChild(modal);

  document.body.appendChild(overlay);
}

function showLoadingPanel(message) {
  const existing = document.getElementById("ai-result-panel");
  if (existing) existing.remove();

  const panel = document.createElement("div");
  panel.id = "ai-result-panel";
  panel.className = "ai-result-panel";

  const loading = document.createElement("div");
  loading.className = "ai-loading";

  const spinner = document.createElement("div");
  spinner.className = "ai-spinner";

  const text = document.createElement("span");
  text.textContent = message;

  loading.appendChild(spinner);
  loading.appendChild(text);

  panel.appendChild(loading);

  document.body.appendChild(panel);
}

function showResultPanel(title, content) {
  const existing = document.getElementById("ai-result-panel");
  if (existing) existing.remove();

  const panel = document.createElement("div");
  panel.id = "ai-result-panel";
  panel.className = "ai-result-panel";

  /* ---------- HEADER ---------- */

  const header = document.createElement("div");
  header.className = "ai-panel-header";

  const titleEl = document.createElement("span");
  titleEl.innerText = title;

  const close = document.createElement("span");
  close.className = "ai-close-btn";
  close.innerText = "✕";

  close.onclick = () => {
    if (window.stopSummary) {
      window.stopSummary();
    }

    panel.remove();
  };

  header.appendChild(titleEl);
  header.appendChild(close);

  /* ---------- CONTENT ---------- */

  const body = document.createElement("div");
  body.className = "ai-result-content";
  body.innerText = content;

  /* ---------- ACTIONS ---------- */

  const actions = document.createElement("div");
  actions.className = "ai-result-actions";

  /* ---------- SUMMARY ---------- */

  if (title === "Summary") {
    const listenBtn = document.createElement("button");
    listenBtn.innerText = "Listen";

    listenBtn.onclick = () => {
      if (window.readSummary) {
        window.readSummary(content);
      }
    };

    actions.appendChild(listenBtn);
  } else if (title === "AI Reply") {
    /* ---------- REPLY ---------- */
    const regenerateBtn = document.createElement("button");
    regenerateBtn.innerText = "Regenerate";

    regenerateBtn.onclick = () => {
      showLoadingPanel("Regenerating reply...");
      window.regenerateReply();
    };

    const insertBtn = document.createElement("button");
    insertBtn.innerText = "Insert into Gmail";

    insertBtn.onclick = () => {
      if (window.insertReplyIntoCompose) {
        window.insertReplyIntoCompose(content);
      }
    };

    const copyBtn = document.createElement("button");
    copyBtn.innerText = "Copy";

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(content);
    };

    actions.appendChild(regenerateBtn);
    actions.appendChild(insertBtn);
    actions.appendChild(copyBtn);
  } else {
    /* ---------- TRANSLATION ---------- */
    const copyBtn = document.createElement("button");
    copyBtn.innerText = "Copy";

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(content);
    };

    actions.appendChild(copyBtn);
  }

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(actions);

  document.body.appendChild(panel);
}
