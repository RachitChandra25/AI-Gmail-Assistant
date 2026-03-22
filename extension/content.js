console.log("AI Gmail Assistant Loaded");

function getEmailText() {
  const emailBody = document.querySelector(".a3s");

  if (!emailBody) {
    alert("Open an email first.");
    return null;
  }

  return emailBody.innerText;
}

function attachEvents() {
  document.getElementById("summarizeBtn").onclick = async () => {
    const btn = document.getElementById("summarizeBtn");
    btn.classList.add("ai-disabled");

    const email = getEmailText();
    if (!email) return;

    showLoadingPanel("Generating summary...");

    const data = await callAPI("summarize", { email });

    btn.classList.remove("ai-disabled");

    showResultPanel("Summary", data.summary);
  };

  document.getElementById("translateBtn").onclick = async () => {
    const btn = document.getElementById("translateBtn");

    const email = getEmailText();
    if (!email) return;

    showLanguageModal(async (language) => {
      btn.classList.add("ai-disabled");

      showLoadingPanel("Translating email...");

      try {
        const data = await callAPI("translate", {
          email: email,
          language: language,
        });

        showResultPanel(`Translation (${language})`, data.translation);
      } catch (error) {
        console.error("Translation failed:", error);
      }

      btn.classList.remove("ai-disabled");
    });
  };

  document.getElementById("replyBtn").onclick = async () => {
    const btn = document.getElementById("replyBtn");
    btn.classList.add("ai-disabled");

    const email = getEmailText();
    if (!email) return;

    showLoadingPanel("Generating AI reply...");

    const data = await callAPI("reply", { email });

    btn.classList.remove("ai-disabled");

    showResultPanel("AI Reply", data.reply);
  };
}

function insertReplyIntoGmail(replyText) {
  let composeBox = document.querySelector(
    '[role="textbox"][contenteditable="true"]',
  );

  if (composeBox) {
    composeBox.focus();
    composeBox.innerText = replyText;
    return;
  }

  const replyButtons = document.querySelectorAll('div[role="button"]');

  let replyButton = null;

  replyButtons.forEach((btn) => {
    if (btn.innerText.toLowerCase().includes("reply")) {
      replyButton = btn;
    }
  });

  if (replyButton) {
    replyButton.click();
  }

  setTimeout(() => {
    const newComposeBox = document.querySelector(
      '[role="textbox"][contenteditable="true"]',
    );

    if (newComposeBox) {
      newComposeBox.focus();
      newComposeBox.innerText = replyText;
    } else {
      showResultPanel("Reply Generated", replyText);
    }
  }, 1000);
}

window.insertReplyIntoCompose = function (text) {
  let composeBox = document.querySelector('[role="textbox"]');

  if (!composeBox) {
    const replyButton = document.querySelector('[aria-label*="Reply"]');

    if (replyButton) {
      replyButton.click();
    }

    const interval = setInterval(() => {
      composeBox = document.querySelector('[role="textbox"]');

      if (composeBox) {
        clearInterval(interval);

        insertAIBlock(composeBox, text);
      }
    }, 300);

    return;
  }

  insertAIBlock(composeBox, text);
};

/* ✅ FIXED HERE: removed grey box wrapper */
function insertAIBlock(composeBox, text) {
  composeBox.focus();
  composeBox.innerText = text;
}

window.regenerateReply = async function () {
  const email = getEmailText();
  if (!email) return;

  const data = await callAPI("reply", { email });

  showResultPanel("AI Reply", data.reply);
};

window.readSummary = function (text) {
  const cleanedText = text
    .replace(/\*/g, "")
    .replace(/#/g, "")
    .replace(/-/g, "")
    .replace(/\n+/g, ". ");

  const speech = new SpeechSynthesisUtterance(cleanedText);

  speech.lang = "en-US";
  speech.rate = 1;
  speech.pitch = 1;

  speechSynthesis.cancel();
  speechSynthesis.speak(speech);
};

window.stopSummary = function () {
  speechSynthesis.cancel();
};

/* ---------- GMAIL PAGE DETECTION ---------- */

function isEmailOpen() {
  return window.location.hash.includes("/");
}

/* ---------- INIT ---------- */

function init() {
  const toolbar = document.getElementById("ai-toolbar");

  if (isEmailOpen()) {
    if (!toolbar) {
      createToolbar();
      attachEvents();
    }
  } else {
    if (toolbar) {
      toolbar.remove();
    }
  }
}

init();

/* ---------- GMAIL DOM OBSERVER ---------- */

const observer = new MutationObserver(() => {
  init();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
