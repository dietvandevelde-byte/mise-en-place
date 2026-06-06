/* =========================================================================
   Auth overlay + AI-scraper modal — gedeeld door desktop & mobiel app
   ========================================================================= */
(function () {
  "use strict";

  /* ── Auth overlay HTML ─────────────────────────────────────────────────── */
  document.body.insertAdjacentHTML("afterbegin", `
<div id="mp-auth" style="
  position:fixed;inset:0;z-index:9999;
  background:#E7E1D5;
  background-image:radial-gradient(circle at 12% 0%,rgba(47,125,79,.10),transparent 40%),
                   radial-gradient(circle at 90% 100%,rgba(207,98,56,.08),transparent 40%);
  display:flex;align-items:center;justify-content:center;padding:24px;
  font-family:'Hanken Grotesk',sans-serif;
">
  <div style="background:#fff;border-radius:20px;box-shadow:0 8px 40px -8px rgba(33,30,26,.18);width:100%;max-width:400px;padding:36px;">
    <div style="width:48px;height:48px;border-radius:14px;background:#2F7D4F;color:#fff;display:grid;place-items:center;margin-bottom:16px;box-shadow:0 4px 14px -4px rgba(47,125,79,.5);">
      <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M5 19C4 11 9 5 19 5c0 10-6 15-14 14z"/></svg>
    </div>
    <div style="font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:24px;color:#211E1A;letter-spacing:-.02em;margin-bottom:4px;">
      Mise <span style="color:#2F7D4F">en Place</span>
    </div>
    <div style="font-size:13px;color:#6B655C;margin-bottom:24px;font-weight:500;">Jouw persoonlijke weekmenu-planner</div>
    <div style="display:flex;border-bottom:2px solid #EDE7DC;margin-bottom:22px;" id="auth-tabs">
      <button onclick="window._authTab('login')"    id="atab-login"    style="flex:1;padding:8px;text-align:center;font-size:14px;font-weight:700;cursor:pointer;color:#2F7D4F;border:none;border-bottom:2px solid #2F7D4F;margin-bottom:-2px;background:none;">Inloggen</button>
      <button onclick="window._authTab('register')" id="atab-register" style="flex:1;padding:8px;text-align:center;font-size:14px;font-weight:700;cursor:pointer;color:#938A7C;border:none;border-bottom:2px solid transparent;margin-bottom:-2px;background:none;">Registreren</button>
    </div>
    <div id="auth-panel-login">
      <label style="display:block;font-size:12px;font-weight:700;color:#5C554B;margin-bottom:5px;">E-mailadres</label>
      <input id="auth-email" type="email" placeholder="jij@voorbeeld.nl" style="width:100%;padding:10px 13px;border:1.5px solid #DDD7CC;border-radius:10px;font-size:14px;font-family:inherit;color:#211E1A;background:#FDFBF8;box-sizing:border-box;margin-bottom:14px;" />
      <label style="display:block;font-size:12px;font-weight:700;color:#5C554B;margin-bottom:5px;">Wachtwoord</label>
      <input id="auth-pw" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter')window._authSubmit()" style="width:100%;padding:10px 13px;border:1.5px solid #DDD7CC;border-radius:10px;font-size:14px;font-family:inherit;color:#211E1A;background:#FDFBF8;box-sizing:border-box;margin-bottom:6px;" />
      <div id="auth-err" style="color:#C0392B;font-size:13px;min-height:20px;margin-bottom:6px;"></div>
      <button id="auth-btn" onclick="window._authSubmit()" style="width:100%;padding:11px;border-radius:10px;border:none;background:#2F7D4F;color:#fff;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;">Inloggen</button>
    </div>
    <div id="auth-panel-register" style="display:none">
      <label style="display:block;font-size:12px;font-weight:700;color:#5C554B;margin-bottom:5px;">Naam</label>
      <input id="auth-name" type="text" placeholder="Marie Janssen" style="width:100%;padding:10px 13px;border:1.5px solid #DDD7CC;border-radius:10px;font-size:14px;font-family:inherit;color:#211E1A;background:#FDFBF8;box-sizing:border-box;margin-bottom:14px;" />
      <label style="display:block;font-size:12px;font-weight:700;color:#5C554B;margin-bottom:5px;">E-mailadres</label>
      <input id="auth-email2" type="email" placeholder="jij@voorbeeld.nl" style="width:100%;padding:10px 13px;border:1.5px solid #DDD7CC;border-radius:10px;font-size:14px;font-family:inherit;color:#211E1A;background:#FDFBF8;box-sizing:border-box;margin-bottom:14px;" />
      <label style="display:block;font-size:12px;font-weight:700;color:#5C554B;margin-bottom:5px;">Wachtwoord <span style="font-weight:400;color:#938A7C">(min. 8 tekens)</span></label>
      <input id="auth-pw2" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter')window._authSubmit()" style="width:100%;padding:10px 13px;border:1.5px solid #DDD7CC;border-radius:10px;font-size:14px;font-family:inherit;color:#211E1A;background:#FDFBF8;box-sizing:border-box;margin-bottom:6px;" />
      <div id="auth-err2" style="color:#C0392B;font-size:13px;min-height:20px;margin-bottom:6px;"></div>
      <button id="auth-btn2" onclick="window._authSubmit()" style="width:100%;padding:11px;border-radius:10px;border:none;background:#2F7D4F;color:#fff;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;">Account aanmaken</button>
    </div>
  </div>
</div>

<!-- AI Scraper modal -->
<div id="mp-scraper" style="display:none;position:fixed;inset:0;z-index:8888;background:rgba(33,30,26,.5);align-items:center;justify-content:center;padding:16px;font-family:'Hanken Grotesk',sans-serif;">
  <div style="background:#fff;border-radius:20px;box-shadow:0 8px 40px rgba(33,30,26,.2);width:100%;max-width:480px;padding:28px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div style="font-size:18px;font-weight:800;color:#211E1A;">🤖 Recept importeren</div>
      <button onclick="window._scraperClose()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#938A7C;">✕</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px;">
      <button onclick="window._scraperMode('url')"        id="stab-url" style="flex:1;padding:8px;border:2px solid #CF6238;border-radius:10px;background:none;cursor:pointer;font-weight:700;font-size:13px;color:#CF6238;">Via URL</button>
      <button onclick="window._scraperMode('screenshot')" id="stab-ss"  style="flex:1;padding:8px;border:2px solid #DDD7CC;border-radius:10px;background:none;cursor:pointer;font-weight:700;font-size:13px;color:#938A7C;">Via screenshot</button>
    </div>
    <div id="scraper-url-panel">
      <input id="scraper-url" type="url" placeholder="https://www.ah.nl/allerhande/recept/..." style="width:100%;padding:10px 13px;border:1.5px solid #DDD7CC;border-radius:10px;font-size:14px;font-family:inherit;box-sizing:border-box;margin-bottom:12px;" />
      <button onclick="window._scraperRun()" id="scraper-go" style="width:100%;padding:11px;border-radius:10px;border:none;background:#CF6238;color:#fff;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;">Importeren</button>
    </div>
    <div id="scraper-ss-panel" style="display:none">
      <input id="scraper-file" type="file" accept="image/*" style="width:100%;margin-bottom:12px;" />
      <button onclick="window._scraperRun()" id="scraper-go2" style="width:100%;padding:11px;border-radius:10px;border:none;background:#CF6238;color:#fff;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;">Importeren</button>
    </div>
    <div id="scraper-status" style="margin-top:12px;font-size:13px;color:#6B655C;min-height:20px;"></div>
    <div id="scraper-preview" style="display:none;margin-top:12px;background:#F0F7F3;border-radius:10px;padding:14px;font-size:13px;color:#211E1A;"></div>
    <div style="display:flex;gap:10px;margin-top:16px;justify-content:flex-end;">
      <button onclick="window._scraperClose()" style="padding:9px 18px;border-radius:10px;border:1.5px solid #DDD7CC;background:none;cursor:pointer;font-size:14px;font-weight:600;font-family:inherit;">Sluiten</button>
      <button id="scraper-save" onclick="window._scraperSave()" style="display:none;padding:9px 18px;border-radius:10px;border:none;background:#2F7D4F;color:#fff;cursor:pointer;font-size:14px;font-weight:700;font-family:inherit;">Opslaan in recepten</button>
    </div>
  </div>
</div>
  `);

  /* ── Auth logic ─────────────────────────────────────────────────────────── */
  let _mode = "login";
  let _scraperMode_current = "url";
  let _scraped = null;

  window._authTab = function (mode) {
    _mode = mode;
    document.getElementById("atab-login").style.cssText    += ";color:" + (mode==="login"?"#2F7D4F":"#938A7C") + ";border-bottom-color:" + (mode==="login"?"#2F7D4F":"transparent");
    document.getElementById("atab-register").style.cssText += ";color:" + (mode==="register"?"#2F7D4F":"#938A7C") + ";border-bottom-color:" + (mode==="register"?"#2F7D4F":"transparent");
    document.getElementById("auth-panel-login").style.display    = mode === "login"    ? "" : "none";
    document.getElementById("auth-panel-register").style.display = mode === "register" ? "" : "none";
  };

  window._authSubmit = async function () {
    document.getElementById("auth-err").textContent  = "";
    document.getElementById("auth-err2").textContent = "";
    document.getElementById("auth-btn").disabled  = true;
    document.getElementById("auth-btn2").disabled = true;
    try {
      if (_mode === "login") {
        const email = document.getElementById("auth-email").value.trim();
        const pw    = document.getElementById("auth-pw").value;
        await window.MPAPI.login(email, pw);
      } else {
        const name  = document.getElementById("auth-name").value.trim();
        const email = document.getElementById("auth-email2").value.trim();
        const pw    = document.getElementById("auth-pw2").value;
        await window.MPAPI.register(name, email, pw);
      }
      await _onAuthSuccess();
    } catch (e) {
      const id = _mode === "login" ? "auth-err" : "auth-err2";
      document.getElementById(id).textContent = e.message;
    } finally {
      document.getElementById("auth-btn").disabled  = false;
      document.getElementById("auth-btn2").disabled = false;
    }
  };

  async function _onAuthSuccess() {
    await window.MPAPI.loadUserRecipes();

    // Patch store om nieuwe recepten ook naar backend te sturen
    const origCreate = window.MPStore.actions.createRecipe;
    window.MPStore.actions.createRecipe = function (obj) {
      const r = origCreate(obj);
      window.MPAPI.saveNewRecipe(r);
      return r;
    };
    const origImport = window.MPStore.actions.importRecipe;
    window.MPStore.actions.importRecipe = function (obj) {
      const r = origImport(obj);
      window.MPAPI.saveNewRecipe(r);
      return r;
    };

    document.getElementById("mp-auth").style.display = "none";
    if (typeof window._mpMountApp === "function") window._mpMountApp();
  }

  window._authLogout = function () {
    window.MPAPI.logout();
    location.reload();
  };

  // Auto-login als er al een token is
  window.MPAPI.me().then(user => { if (user) _onAuthSuccess(); });

  /* ── AI Scraper logic ───────────────────────────────────────────────────── */
  window.openScraper = function () {
    _scraped = null;
    document.getElementById("scraper-status").textContent = "";
    document.getElementById("scraper-preview").style.display = "none";
    document.getElementById("scraper-save").style.display = "none";
    document.getElementById("scraper-url").value = "";
    document.getElementById("mp-scraper").style.display = "flex";
  };

  window._scraperClose = function () {
    document.getElementById("mp-scraper").style.display = "none";
  };

  window._scraperMode = function (mode) {
    _scraperMode_current = mode;
    document.getElementById("stab-url").style.borderColor = mode === "url" ? "#CF6238" : "#DDD7CC";
    document.getElementById("stab-url").style.color       = mode === "url" ? "#CF6238" : "#938A7C";
    document.getElementById("stab-ss").style.borderColor  = mode === "screenshot" ? "#CF6238" : "#DDD7CC";
    document.getElementById("stab-ss").style.color        = mode === "screenshot" ? "#CF6238" : "#938A7C";
    document.getElementById("scraper-url-panel").style.display = mode === "url"        ? "" : "none";
    document.getElementById("scraper-ss-panel").style.display  = mode === "screenshot" ? "" : "none";
  };

  window._scraperRun = async function () {
    const btn = document.getElementById(_scraperMode_current === "url" ? "scraper-go" : "scraper-go2");
    btn.textContent = "Bezig…"; btn.disabled = true;
    document.getElementById("scraper-status").textContent = "🤖 Claude analyseert het recept…";
    document.getElementById("scraper-preview").style.display = "none";
    document.getElementById("scraper-save").style.display = "none";
    _scraped = null;
    try {
      let result;
      if (_scraperMode_current === "url") {
        const url = document.getElementById("scraper-url").value.trim();
        if (!url) throw new Error("Vul een URL in");
        result = await window.MPAPI.scrapeUrl(url);
      } else {
        const file = document.getElementById("scraper-file").files[0];
        if (!file) throw new Error("Kies een afbeelding");
        result = await window.MPAPI.scrapeScreenshot(file);
      }
      _scraped = result.recipe;
      const conf = Math.round((result.confidence || 0.9) * 100);
      document.getElementById("scraper-status").textContent = `✅ Recept gevonden (betrouwbaarheid: ${conf}%)`;
      const r = result.recipe;
      document.getElementById("scraper-preview").style.display = "";
      document.getElementById("scraper-preview").innerHTML =
        `<strong style="font-size:15px">${r.name}</strong><br/>` +
        (r.description ? `<em style="color:#6B655C">${r.description}</em><br/>` : "") +
        `<br/>${r.kcal ? `🔥 ${r.kcal} kcal &nbsp;` : ""}${r.servings ? `👥 ${r.servings} porties &nbsp;` : ""}${r.total_time ? `⏱ ${r.total_time} min` : ""}<br/>` +
        (r.ingredients?.length ? `<br/><strong>Ingrediënten:</strong> ${r.ingredients.slice(0,6).map(i=>i.name).join(", ")}${r.ingredients.length>6?"…":""}` : "");
      document.getElementById("scraper-save").style.display = "";
    } catch (e) {
      document.getElementById("scraper-status").textContent = "❌ " + e.message;
    } finally {
      btn.textContent = "Importeren"; btn.disabled = false;
    }
  };

  window._scraperSave = async function () {
    if (!_scraped) return;
    try {
      // Convert to store format and save
      const obj = {
        title: _scraped.name,
        source: _scraped.source_url || "AI import",
        portions: _scraped.servings || 1,
        prepTime: _scraped.prep_time || 0,
        meatDish: false,
        seasons: [],
        suits: [2, 4],
        kcal: _scraped.kcal || 0,
        carbs: _scraped.carbs || 0,
        protein: _scraped.protein || 0,
        fat: _scraped.fat || 0,
        instructions: (_scraped.instructions || []).map(s => s.text || "").join("\n\n"),
        ingredients: (_scraped.ingredients || []).map(i => ({
          name: i.name, qty: i.amount || 0, unit: i.unit || "", cat: "Voorraad"
        })),
        image: null,
        cats: [],
      };
      window.MPStore.actions.createRecipe(obj);
      window._scraperClose();
      // Small toast
      const t = document.createElement("div");
      t.textContent = "✓ Recept opgeslagen!";
      t.style.cssText = "position:fixed;bottom:24px;right:24px;background:#2F7D4F;color:#fff;padding:12px 20px;border-radius:10px;font-family:'Hanken Grotesk',sans-serif;font-weight:700;z-index:9999;";
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3000);
    } catch (e) {
      document.getElementById("scraper-status").textContent = "❌ Opslaan mislukt: " + e.message;
    }
  };
})();
