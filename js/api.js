/* =========================================================================
   MISE EN PLACE — Backend API bridge
   Handles auth, recipe sync, meal plan sync and AI scraper.
   ========================================================================= */
window.MPAPI = (function () {
  "use strict";

  const BASE = "https://mise-en-place-api-3ah7.onrender.com";
  let _token = localStorage.getItem("mp_jwt") || null;
  let _user  = null;

  // id map: store numeric id → backend UUID — persistent over sessies
  const _idMap = JSON.parse(localStorage.getItem("mp_idmap") || "{}");
  function _saveIdMap() { try { localStorage.setItem("mp_idmap", JSON.stringify(_idMap)); } catch(e) {} }

  // ── HTTP helper ────────────────────────────────────────────────────────────
  async function req(method, path, body, isForm) {
    const headers = {};
    if (_token) headers["Authorization"] = "Bearer " + _token;
    if (body && !isForm) headers["Content-Type"] = "application/json";
    const res = await fetch(BASE + path, {
      method,
      headers,
      body: isForm ? body : (body ? JSON.stringify(body) : undefined),
    });
    if (res.status === 204) return null;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const d = json.detail;
      const msg = Array.isArray(d) ? d.map(x => x.msg || JSON.stringify(x)).join(", ")
                : (typeof d === "string" ? d : "HTTP " + res.status);
      throw new Error(msg);
    }
    return json;
  }

  // ── Auth ───────────────────────────────────────────────────────────────────
  async function register(name, email, password) {
    await req("POST", "/auth/register", { name, email, password });
    return login(email, password);
  }

  async function login(email, password) {
    const res = await req("POST", "/auth/login", { email, password });
    _token = res.access_token;
    localStorage.setItem("mp_jwt", _token);
    _user = await req("GET", "/auth/me");
    return _user;
  }

  function logout() {
    _token = null;
    _user = null;
    localStorage.removeItem("mp_jwt");
    // Wis de ID-map zodat een andere gebruiker niet de recepten-koppelingen erft
    Object.keys(_idMap).forEach(k => delete _idMap[k]);
    localStorage.removeItem("mp_idmap");
  }

  async function changePassword(currentPw, newPw) {
    return req("PUT", "/auth/change-password", { current_password: currentPw, new_password: newPw });
  }
  async function forgotPassword(email) {
    return req("POST", "/auth/forgot-password", { email });
  }
  async function resetPassword(token, newPw) {
    return req("POST", "/auth/reset-password", { token, new_password: newPw });
  }

  async function me() {
    if (!_token) return null;
    try { _user = await req("GET", "/auth/me"); return _user; }
    catch { logout(); return null; }
  }

  async function updateProfile(data) {
    const res = await req("PATCH", "/auth/me", data);
    _user = res;
    return res;
  }

  // ── Recipes ────────────────────────────────────────────────────────────────
  async function getRecipes() { return req("GET", "/recipes/"); }

  async function createRecipe(r) { return req("POST", "/recipes/", r); }

  async function updateRecipe(id, r) { return req("PUT", "/recipes/" + id, r); }

  async function deleteRecipe(id) { return req("DELETE", "/recipes/" + id); }

  // ── AI Scraper ─────────────────────────────────────────────────────────────
  async function scrapeUrl(url) {
    return req("POST", "/scraper/url", { url });
  }

  async function scrapeScreenshot(file) {
    const fd = new FormData();
    fd.append("file", file);
    return req("POST", "/scraper/screenshot", fd, true);
  }

  async function scrapeText(text) {
    return req("POST", "/scraper/text", { text });
  }

  async function calculateNutrition(title, ingredients, portions) {
    return req("POST", "/scraper/nutrition", { title, ingredients, portions });
  }

  // ── Meal plan sync ─────────────────────────────────────────────────────────
  // Convert MPStore plan format → backend format and save/load per week
  function _isoMonday(isoDate) {
    // The design uses Saturday as week start. For the backend we store by
    // Monday of the ISO week that contains isoDate.
    const d = new Date(isoDate + "T12:00:00");
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  }

  const DAY_NAMES = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
  const SLOT_TO_MEAL = { 0: "breakfast", 2: "lunch", 4: "dinner" };

  // Push the current week's plan to the backend (fire-and-forget)
  async function pushWeekPlan(weekStart7Days) {
    // weekStart7Days: array of 7 ISO date strings for the displayed week
    if (!_token) return;
    const state = window.MPStore.getState();
    // group by backend week_start (Monday)
    const byMon = {};
    weekStart7Days.forEach((date) => {
      const mon = _isoMonday(date);
      if (!byMon[mon]) byMon[mon] = [];
      byMon[mon].push(date);
    });
    for (const [mon, dates] of Object.entries(byMon)) {
      const entries = [];
      for (const date of dates) {
        // Hoofdmaaltijden (ontbijt, lunch, diner)
        for (const slot of [0, 2, 4]) {
          const e = state.plan[`${date}|${slot}`];
          if (e && e.recipeId) {
            let backendId = _idMap[e.recipeId];
            if (!backendId) {
              const recipe = window.MP.RECIPES.find(r => r.id === e.recipeId);
              if (recipe) { await saveNewRecipe(recipe); backendId = _idMap[e.recipeId]; }
            }
            if (backendId) {
              entries.push({
                day: DAY_NAMES[new Date(date + "T12:00:00").getDay()],
                meal_type: SLOT_TO_MEAL[slot],
                recipe_id: backendId,
                eaten: !!e.eaten,
                portions_eaten: e.portionsEaten != null ? e.portionsEaten : null,
              });
            }
          }
        }
        // Snacks
        const snacks = state.snacks && state.snacks[date];
        if (snacks) {
          for (const snack of snacks) {
            if (!snack.recipeId) continue;
            let backendId = _idMap[snack.recipeId];
            if (!backendId) {
              const recipe = window.MP.RECIPES.find(r => r.id === snack.recipeId);
              if (recipe) { await saveNewRecipe(recipe); backendId = _idMap[snack.recipeId]; }
            }
            if (backendId) {
              entries.push({
                day: DAY_NAMES[new Date(date + "T12:00:00").getDay()],
                meal_type: "snack",
                recipe_id: backendId,
                eaten: !!snack.eaten,
                portions_eaten: snack.portionsEaten != null ? snack.portionsEaten : null,
              });
            }
          }
        }
      }
      req("PUT", "/meal-plans/" + mon, { week_start: mon, entries }).catch(() => {});
    }
  }

  // ── Load meal plan from backend → inject into store ───────────────────────
  const DAY_OFFSETS = { monday:0, tuesday:1, wednesday:2, thursday:3, friday:4, saturday:5, sunday:6 };
  const MEAL_TO_SLOT = { breakfast:0, lunch:2, dinner:4 };

  async function loadWeekPlan() {
    if (!_token) return;
    try {
      const plans = await req("GET", "/meal-plans/");
      const state = window.MPStore.getState();
      plans.forEach(plan => {
        (plan.entries || []).forEach(entry => {
          const offset = DAY_OFFSETS[entry.day];
          if (offset === undefined || !entry.recipe) return;
          const d = new Date(plan.week_start + "T12:00:00");
          d.setDate(d.getDate() + offset);
          const date = d.toISOString().slice(0, 10);
          // Find recipe in store by backend UUID
          const storeRecipe = window.MP.RECIPES.find(r => r._backendId === entry.recipe.id);
          if (!storeRecipe) return;

          if (entry.meal_type === "snack") {
            // Snacks herstellen
            if (!state.snacks) state.snacks = {};
            if (!state.snacks[date]) state.snacks[date] = [];
            const alreadyHas = state.snacks[date].some(s => s.recipeId === storeRecipe.id);
            if (!alreadyHas) {
              state.snacks[date].push({
                id: "bs_" + Math.random().toString(36).slice(2),
                recipeId: storeRecipe.id,
                portions: 1,
                eaten: !!entry.eaten,
                portionsEaten: entry.portions_eaten != null ? entry.portions_eaten : null,
                manualName: null,
                status: null,
                note: null,
              });
            }
          } else {
            // Hoofdmaaltijden herstellen
            const slot = MEAL_TO_SLOT[entry.meal_type];
            if (slot === undefined) return;
            state.plan[`${date}|${slot}`] = {
              recipeId: storeRecipe.id,
              portions: 1,
              eaten: !!entry.eaten,
              portionsEaten: entry.portions_eaten != null ? entry.portions_eaten : null,
              manualName: null,
              status: null,
              note: null,
            };
          }
        });
      });
    } catch (e) {
      console.warn("Kon weekmenu niet laden:", e.message);
    }
  }

  // Push ALL weeks that have plan entries to backend
  async function pushAllPlans() {
    if (!_token) return;
    const state = window.MPStore.getState();
    const mondays = new Set();
    Object.keys(state.plan).forEach(key => {
      const [date] = key.split("|");
      mondays.add(_isoMonday(date));
    });
    for (const mon of mondays) {
      const dates = Array.from({length: 7}, (_, i) => {
        const d = new Date(mon + "T12:00:00");
        d.setDate(d.getDate() + i);
        return d.toISOString().slice(0, 10);
      });
      pushWeekPlan(dates);
    }
  }

  // ── Ingredient category guesser (keyword-based fallback) ─────────────────
  // Returns one of the known aisle keys. Used when the backend has no cat stored.
  function _guessCat(name) {
    const n = (name || "").toLowerCase();
    const m = (words) => words.some((w) => n.includes(w));

    if (m(["banaan","braam","aardbei","framboos","blauwe bes","bosbes","druif","mango",
           "ananas","kiwi","sinaasappel","mandarijn","citroen","limoen","grapefruit",
           "granaatappel","watermeloen","meloen","perzik","nectarine","pruim","kersen",
           "vijg","dadel","abrikoos","appelsien","appel","peer","kers","lychee",
           "papaya","passievrucht","guave","kumquat","tamarinde"])) return "Fruit";

    if (m(["wortel","prei","knoflook","sjalot","tomaat","paprika","courgette","broccoli",
           "bloemkool","spinazie","andijvie","champignon","paddenstoel","aubergine",
           "komkommer","radijs","biet","selderij","asperge","venkel","paksoi",
           "boerenkool","lente-ui","rucola","witlof","spruitje","spruiten","tuinboon",
           "doperwt","avocado","olijf","maïs","mais","zoete aardappel","aardappel",
           "knolselderij","raap","waterkers","veldsla","ijsbergsla","romanosla",
           "bleekselderij","schorseneer","pastinaak","artisjok","prei","ui ","uien"])) return "Groenten";

    if (m(["kip","zalm","kabeljauw","garnaal","tonijn","makreel","forel","haring",
           "mossel","inktvis","calamari","ansjovis","sardine","schelvis","tilapia",
           "heek","paling","schol","tong ","bot ","koolvis","zeebaars",
           "ham","spek","chorizo","salami","worst","rookworst","pepperoni",
           "biefstuk","gehakt","tartaar","entrecote","ossenhaas","ribeye",
           "varkensfilet","kipfilet","kippenborst","kippendij","kipreep",
           "rund","varken","lam ","lams","kalkoen","eend ","vlees","vis ","visstick",
           "bacon","pancetta","prosciutto","bresaola"])) return "Vlees";

    if (m(["mozzarella","parmezaan","parmesan","parmigiano","cheddar","camembert",
           "brie","gorgonzola","feta","ricotta","gruyère","gruyere","gruyèrekaas",
           "mascarpone","halloumi","manchego","emmentaler","gouda","edam","beemster",
           "roomkaas","smeerkaas","cottage cheese","boursin","reblochon",
           " kaas","kaas","kaasvlokken"])) return "Kaas";

    if (m(["brood","boterham","ciabatta","baguette","pistolet","pita","wrap",
           "toast","crackers","beschuit","roggebrood","volkorenbrood",
           "croissant","bagel","focaccia","naan","brioche","chapati","tortilla"])) return "Brood";

    if (m(["melk","yoghurt","room ","slagroom","boter ","kwark","vla","karnemelk",
           "crème fraîche","creme fraiche","crème","amandelmelk","havermelk",
           "sojamelk","rijstmelk","kokosmelk","kokosroom","eieren","eidooier",
           "eiwit","gekookt ei","hardgekookt","zachje ei"," ei ","ei,"])) return "Zuivel";

    if (m(["wijn","bier","frisdrank","cola","tonic","limonade"," sap ","sinaasappelsap",
           "appelsap","tomatensap","vruchtensap","cranberrysap"])) return "Dranken";

    if (m(["diepvries","bevroren","ingevroren"])) return "Diepvries";

    return "Voorraad";
  }

  // ── Convert backend recipe → store recipe format ───────────────────────────
  function _toStoreRecipe(r, storeId) {
    return {
      id: storeId,                 // local numeric id for the store
      _backendId: r.id,            // UUID in the database
      title: r.name,
      source: r.source_url || "Mijn recepten",
      portions: r.servings || 1,
      prepTime: r.prep_time || 0,
      meatDish: false,
      seasons: [],
      suits: [2, 4],
      kcal: r.kcal || 0,
      carbs: r.carbs || 0,
      protein: r.protein || 0,
      fat: r.fat || 0,
      instructions: (r.instructions || []).map(s => s.text || "").join("\n\n"),
      ingredients: (r.ingredients || []).map(i => ({
        name: i.name || "",
        qty: i.amount || 0,
        unit: i.unit || "",
        cat: i.cat || _guessCat(i.name),  // keyword-guesser als fallback
      })),
      image: r.image_url || null,
      cats: [],
      custom: true,
      imported: !!r.source_url,
    };
  }

  // (zie boven: _idMap wordt geladen vanuit localStorage)

  // Load all user recipes from backend and inject into the store
  async function loadUserRecipes() {
    if (!_token) return;
    try {
      const allRecipes = await getRecipes();

      // Server-side dedup: verwijder recepten met dezelfde naam uit de database
      const seen = new Map();
      const toDelete = [];
      allRecipes.forEach(r => {
        const key = (r.name || "").toLowerCase().trim();
        if (seen.has(key)) { toDelete.push(r.id); }
        else { seen.set(key, r); }
      });
      for (const id of toDelete) { await deleteRecipe(id).catch(() => {}); }
      const recipes = allRecipes.filter(r => !toDelete.includes(r.id));

      const RECIPES = window.MP.RECIPES;
      let nextId = Math.max(2000, ...RECIPES.map(r => r.id)) + 1;

      // Reverse map: backendId → local storeId (from _idMap)
      const backendToLocal = {};
      Object.entries(_idMap).forEach(([localId, backendId]) => { backendToLocal[backendId] = Number(localId); });

      recipes.forEach((r) => {
        // Already loaded from backend (has _backendId field)
        const existsByBackendId = RECIPES.find(x => x._backendId === r.id);
        if (existsByBackendId) { _idMap[existsByBackendId.id] = r.id; _saveIdMap(); return; }
        // Already exists locally (created on this device, tracked via _idMap)
        const localId = backendToLocal[r.id];
        if (localId != null) {
          const localRecipe = RECIPES.find(x => x.id === localId);
          if (localRecipe) { localRecipe._backendId = r.id; return; }
        }
        // Truly new — add from backend
        const sr = _toStoreRecipe(r, nextId++);
        window.MPStore.registerRecipe(sr);
        _idMap[sr.id] = r.id; _saveIdMap();
      });

      // Dedup: remove local copies that now have a backend-loaded equivalent
      const backendLoaded = new Set(RECIPES.filter(r => r._backendId).map(r => r._backendId));
      for (let i = RECIPES.length - 1; i >= 0; i--) {
        const r = RECIPES[i];
        if (!r._backendId && (r.custom || r.imported)) {
          const bid = _idMap[r.id];
          if (bid && backendLoaded.has(bid)) RECIPES.splice(i, 1);
        }
      }
    } catch (e) {
      console.warn("Kon recepten niet laden:", e.message);
    }
  }

  // Convert store createRecipe payload → backend format and save
  async function saveNewRecipe(storeRecipe) {
    if (!_token) return;
    try {
      const payload = {
        name: storeRecipe.title,
        description: null,
        image_url: storeRecipe.image || null,
        prep_time: storeRecipe.prepTime || null,
        cook_time: null,
        total_time: null,
        servings: storeRecipe.portions || 1,
        kcal: storeRecipe.kcal || null,
        protein: storeRecipe.protein || null,
        carbs: storeRecipe.carbs || null,
        fat: storeRecipe.fat || null,
        category: "dinner",
        source_url: null,
        source_type: "manual",
        tags: storeRecipe.cats || [],
        ingredients: (storeRecipe.ingredients || []).map(i => ({
          name: i.name, amount: i.qty || null, unit: i.unit || null, cat: i.cat || null
        })),
        instructions: (storeRecipe.instructions || "").split("\n\n")
          .map((t, i) => ({ step: i + 1, text: t.trim() })).filter(s => s.text),
      };
      const saved = await createRecipe(payload);
      _idMap[storeRecipe.id] = saved.id; _saveIdMap();
    } catch (e) {
      console.warn("Kon recept niet opslaan in database:", e.message);
    }
  }

  return {
    get token() { return _token; },
    get user() { return _user; },
    get _idMap() { return _idMap; },
    register, login, logout, me, updateProfile, changePassword, forgotPassword, resetPassword,
    getRecipes, createRecipe, updateRecipe, deleteRecipe,
    scrapeUrl, scrapeScreenshot, scrapeText, calculateNutrition,
    loadUserRecipes, saveNewRecipe, pushWeekPlan, pushAllPlans, loadWeekPlan,
  };
})();
