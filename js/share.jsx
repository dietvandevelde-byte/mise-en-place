/* =========================================================================
   MEAL PLANNER — export / share (weekmenu + boodschappenlijst)
   Plain-text builders + a small share sheet (kopiëren / WhatsApp / afdrukken).
   ========================================================================= */
(function () {
  const SLOTS = window.MP.SLOTS;
  const MEALS = [0, 2, 4];

  function dishName(e) {
    if (!e) return null;
    if (e.recipeId) { const r = S.sel.recipeById(e.recipeId); return r ? r.title : "?"; }
    if (e.status) { const st = window.MP.statusByKey(e.status); return st ? st.name : "?"; }
    return e.manualName || null;
  }

  function buildWeekText() {
    const days = S.sel.days();
    const lines = ["🍽️ WEEKMENU", ""];
    days.forEach((d) => {
      lines.push(cap(S.fmt.fmtDowLong(d)) + " " + S.fmt.fmtDay(d) + " " + S.fmt.fmtMon(d));
      MEALS.forEach((s) => {
        const names = S.sel.mealEntries(d, s).map(dishName).filter(Boolean);
        if (names.length) lines.push("  " + SLOTS[s].name + ": " + names.join(", "));
      });
      const snacks = S.sel.snacksFor(d).map(dishName).filter(Boolean);
      if (snacks.length && S.getState().showSnacks !== false) lines.push("  Snacks: " + snacks.join(", "));
      lines.push("");
    });
    return lines.join("\n").trim();
  }

  function buildGroceryText() {
    const groups = S.sel.groceries();
    const lines = ["🛒 BOODSCHAPPEN", ""];
    if (!groups.length) return "🛒 BOODSCHAPPEN\n\n(geen items)";
    groups.forEach((g) => {
      lines.push(g.name.toUpperCase());
      g.items.forEach((it) => {
        const qty = (it.qty != null) ? (" — " + fmtQty(it.qty, it.unit)) : "";
        lines.push("• " + cap(it.name) + qty);
      });
      lines.push("");
    });
    return lines.join("\n").trim();
  }

  function printText(title, text) {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      '<!doctype html><html><head><meta charset="utf-8"><title>' + title + '</title>' +
      '<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1b1714;padding:32px 40px;max-width:720px;margin:0 auto;}h1{font-size:22px;margin:0 0 16px;}pre{white-space:pre-wrap;font-family:inherit;font-size:14px;line-height:1.55;}@media print{@page{margin:16mm;}}</style>' +
      '</head><body><h1>' + title + '</h1><pre>' + text.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])) + '</pre>' +
      '<script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script></body></html>'
    );
    w.document.close();
  }

  /* Share sheet: preview + actions */
  function ShareSheet({ kind, onClose, toast }) {
    const [copied, setCopied] = React.useState(false);
    const isWeek = kind === "week";
    const title = isWeek ? "Weekmenu delen" : "Boodschappenlijst delen";
    const text = isWeek ? buildWeekText() : buildGroceryText();
    const canShare = typeof navigator !== "undefined" && !!navigator.share;

    function copy() {
      try {
        navigator.clipboard.writeText(text).then(() => { setCopied(true); toast && toast("Gekopieerd ✓"); setTimeout(() => setCopied(false), 1800); });
      } catch (e) { toast && toast("Kopiëren niet gelukt"); }
    }
    function whatsapp() { window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank"); }
    function nativeShare() { try { navigator.share({ title, text }); } catch (e) {} }

    const foot = React.createElement(React.Fragment, null,
      React.createElement("button", { className: "btn btn--ghost", onClick: onClose }, "Sluiten"),
      React.createElement("button", { className: "btn btn--block", onClick: copy }, React.createElement(Icon, { name: copied ? "check" : "note", size: 18 }), copied ? "Gekopieerd" : "Kopiëren"));

    return React.createElement(Sheet, { eyebrow: "Delen", eyebrowColor: "brand", title, onClose, foot },
      React.createElement("div", { className: "sharebtns" },
        React.createElement("button", { className: "sharebtn sharebtn--wa", onClick: whatsapp },
          React.createElement(Icon, { name: "chat", size: 20 }), "WhatsApp"),
        canShare && React.createElement("button", { className: "sharebtn", onClick: nativeShare },
          React.createElement(Icon, { name: "swap", size: 19 }), "Delen via…"),
        React.createElement("button", { className: "sharebtn", onClick: () => printText(title.replace(" delen", ""), text) },
          React.createElement(Icon, { name: "book", size: 19 }), "Afdrukken")),
      React.createElement("div", { className: "sharepreview" }, text));
  }

  window.MPShare = { buildWeekText, buildGroceryText, printText };
  window.ShareSheet = ShareSheet;
})();
