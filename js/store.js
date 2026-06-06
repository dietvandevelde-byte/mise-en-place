/* =========================================================================
   MEAL PLANNER — shared store
   Plain JS pub/sub with localStorage persistence. Both the mobile and the
   desktop app instances read & write the SAME store, so edits sync live.
   window.MPStore  — { getState, subscribe, actions..., selectors... }
   ========================================================================= */
(function () {
  "use strict";
  const { SLOTS, AISLES, RECIPES } = window.MP;
  const recById = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

  const LS_KEY = "mp_state_v3";
  const TODAY = new Date().toISOString().slice(0, 10);
  const WEEK_START = "2026-05-30";   // Saturday — anchor for the seeded demo week

  // ---- date helpers ----
  const DOW = ["zo", "ma", "di", "wo", "do", "vr", "za"];
  const DOW_LONG = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const MON = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  function addDays(iso, n) {
    const d = new Date(iso + "T12:00:00");
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function weekDates() {
    return Array.from({ length: 7 }, (_, i) => addDays(WEEK_START, i));
  }
  // day-of-week index for an ISO date (0=zo .. 6=za)
  function dow(iso) { return new Date(iso + "T12:00:00").getDay(); }
  // most recent `startDow` on or before `iso`
  function weekStartOf(iso, startDow) {
    const diff = (dow(iso) - startDow + 7) % 7;
    return addDays(iso, -diff);
  }
  function daysFor(weekStart) {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }
  function fmtDow(iso) { return DOW[new Date(iso + "T12:00:00").getDay()]; }
  function fmtDowLong(iso) { return DOW_LONG[new Date(iso + "T12:00:00").getDay()]; }
  function fmtDay(iso) { return new Date(iso + "T12:00:00").getDate(); }
  function fmtMon(iso) { return MON[new Date(iso + "T12:00:00").getMonth()]; }

  // ---- seed plan ----
  // Main meals live in plan under key `${date}|${slot}` for slot 0 (ontbijt),
  // 2 (lunch), 4 (diner). Snacks are a flexible per-day list (see seedSnacks).
  const MAIN_SLOTS = [0, 2, 4];
  function seedPlan() {
    const days = weekDates();
    // [ontbijt, lunch, diner] recipe ids per day
    const grid = [
      [1, 5, 8],   // za
      [2, 7, 9],   // zo
      [3, 4, 10],  // ma
      [1, 6, 12],  // di
      [2, 3, 11],  // wo (today)
      [1, 7, 6],   // do
      [3, 5, 4],   // vr
    ];
    const plan = {};
    days.forEach((date, di) => {
      grid[di].forEach((rid, mi) => {
        const slot = MAIN_SLOTS[mi];
        const isPast = di < 4;                 // za..di fully eaten
        const isTodayEaten = di === 4 && slot <= 2; // wo: ontbijt+lunch eaten
        plan[`${date}|${slot}`] = {
          recipeId: rid,
          portions: 1,
          eaten: isPast || isTodayEaten,
          manualName: null,
        };
      });
    });
    return plan;
  }

  // ---- seed snacks ----
  // Each day holds a free-form list of snack entries (any number).
  let SNACK_SEQ = 1;
  function newSnackId() { return "s" + (SNACK_SEQ++) + "_" + Math.random().toString(36).slice(2, 6); }
  function newDishId() { return "d" + (SNACK_SEQ++) + "_" + Math.random().toString(36).slice(2, 6); }
  function seedSnacks() {
    const days = weekDates();
    // variable number of snack recipe ids per day — shows the flexible model
    const grid = [
      [13, 14],          // za
      [15, 16, 17],      // zo
      [16, 13],          // ma
      [14],              // di
      [13, 16, 17],      // wo (today)
      [15],              // do
      [13, 16],          // vr
    ];
    const snacks = {};
    days.forEach((date, di) => {
      const isPast = di < 4;
      snacks[date] = grid[di].map((rid, idx) => ({
        id: newSnackId(),
        recipeId: rid,
        portions: 1,
        eaten: isPast || (di === 4 && idx === 0), // wo: first snack eaten
        manualName: null,
        status: null,
        note: null,
      }));
    });
    return snacks;
  }

  const DEFAULT = () => ({
    today: TODAY,
    weekStartDow: 6,    // 0=zo .. 6=za — first day of the week (configurable)
    weekOffset: 0,      // 0 = current week, +1 = next, -1 = previous
    showSnacks: true,   // show/hide the snacks lane in Today + Week
    images: {},         // recipeId -> data URL (persisted image overrides)
    targets: {
      maxKcal: 1900, carbsPct: 45, proteinPct: 30, fatPct: 25,
      maxMeatPerWeek: 4, maxMeatPerDay: 1,
      maxFishPerWeek: 3, maxFishPerDay: 1,
      maxPoultryPerWeek: 4, maxPoultryPerDay: 1,
      maxDairyPerWeek: 21, maxDairyPerDay: 3,
      maxEggsPerWeek: 7, maxEggsPerDay: 2,
      maxFruitPerDay: 2, maxFruitPerWeek: 14,
    },
    plan: seedPlan(),
    extras: {},            // { [`date|slot`]: [ {id, recipeId|manualName, portions, eaten, note}, ... ] } — extra dishes beyond the first
    snacks: seedSnacks(),  // { [date]: [ {id, recipeId|status|manualName, portions, eaten, note}, ... ] }
    manual: [
      { id: "m1", name: "Afwasmiddel", cat: "Huishouden", checked: false },
      { id: "m2", name: "Koffiebonen", cat: "Dranken", checked: false },
      { id: "m3", name: "Keukenrol", cat: "Huishouden", checked: false },
    ],
    checked: {},   // grocery line checked: key `${cat}|${name}|${unit}` -> bool
    customRecipes: [],  // user-created / imported recipes (persisted)
    recipeCatOverrides: {}, // recipeId -> [catKey] : manual category choice that wins over auto-detection
    customCats: [],     // user-defined categories: [{ key, name }]
    aisleOrder: null,   // custom shop order (array of aisle keys); null = data default
  });

  // ---- state + persistence ----
  let state;
  try {
    const raw = localStorage.getItem(LS_KEY);
    state = raw ? JSON.parse(raw) : DEFAULT();
    state.today = TODAY; // altijd de echte datum gebruiken
  } catch (e) { state = DEFAULT(); }
  // hydrate persisted user recipes back into the runtime library
  if (Array.isArray(state.customRecipes)) {
    state.customRecipes.forEach((r) => { if (!recById[r.id]) { RECIPES.push(r); recById[r.id] = r; } });
  }
  // apply persisted recipe images onto the runtime recipe objects
  if (state.images) Object.entries(state.images).forEach(([id, url]) => { if (recById[id]) recById[id].image = url; });
  // forward-compat: ensure new target/limit fields & snacks exist on older saved state
  try {
    const _def = DEFAULT();
    state.targets = Object.assign({}, _def.targets, state.targets || {});
    if (!state.snacks || typeof state.snacks !== "object") state.snacks = _def.snacks;
    if (!state.extras || typeof state.extras !== "object") state.extras = {};
    // one-time: align the week to start on Saturday (still changeable in Profile afterwards)
    if (!state._satStartMigrated) { state.weekStartDow = 6; state._satStartMigrated = true; }
  } catch (e) {}

  const subs = new Set();
  function persist() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }
  function emit() { persist(); subs.forEach((fn) => fn()); }
  function set(updater) { state = updater(state); emit(); }

  // ---- nutrition helpers ----
  function scaleFactor(entry) {
    const r = recById[entry.recipeId];
    if (!r) return 1;
    return entry.portions / r.portions;
  }
  function entryNutrition(entry) {
    const r = recById[entry.recipeId];
    if (!r) return { kcal: 0, carbs: 0, protein: 0, fat: 0 };
    return {
      kcal: Math.round(r.kcal * entry.portions),
      carbs: Math.round(r.carbs * entry.portions),
      protein: Math.round(r.protein * entry.portions),
      fat: Math.round(r.fat * entry.portions),
    };
  }
  function sumNutrition(entries) {
    return entries.reduce((a, e) => {
      const n = entryNutrition(e);
      a.kcal += n.kcal; a.carbs += n.carbs; a.protein += n.protein; a.fat += n.fat;
      return a;
    }, { kcal: 0, carbs: 0, protein: 0, fat: 0 });
  }

  // ---- food classification (for limits: vlees / vis / gevogelte / zuivel / eieren / fruit) ----
  const GARNISH_FRUIT = ["citroen", "limoen"];
  const FOOD_NAME_RULES = [
    ["vis",       ["zalm", "tonijn", "kabeljauw", "garna", "haring", "makreel", "pangasius", "schol", "forel"]],
    ["gevogelte", ["kip", "kalkoen", "gevogelte", "eend"]],
    ["vlees",     ["gehakt", "rund", "varken", "spek", "ham", "biefstuk", "worst", "chorizo", "salami", "lam", "ribbe"]],
    ["zuivel",    ["yoghurt", "kwark", "melk", "kaas", "feta", "mozzarella", "room", "skyr", "boter"]],
  ];
  function recipeFoods(r) {
    if (!r) return [];
    if (Array.isArray(r.foods)) return r.foods;   // explicit (fruit snacks)
    const set = new Set();
    for (const ing of (r.ingredients || [])) {
      const nm = (ing.name || "").toLowerCase();
      if (ing.cat === "Fruit" && !GARNISH_FRUIT.some((g) => nm.includes(g))) set.add("fruit");
      if (nm === "ei" || nm === "eieren") set.add("eieren");
      for (const [food, kws] of FOOD_NAME_RULES) { if (kws.some((k) => nm.includes(k))) set.add(food); }
    }
    return [...set];
  }
  function entryFoods(e) { const r = e && e.recipeId ? recById[e.recipeId] : null; return r ? recipeFoods(r) : []; }
  function entryHasFood(e, food) { return entryFoods(e).includes(food); }

  // ---- recipe categories (for the Recepten filter: vlees / vis / kaas / soep / hapje / voorgerecht / vegetarisch) ----
  const CAT_CHEESE = ["kaas", "feta", "mozzarella", "ricotta", "parmezaan", "cheddar", "brie", "geitenkaas", "halloumi", "burrata"];
  const CAT_FISH = ["zalm", "tonijn", "kabeljauw", "garna", "haring", "makreel", "pangasius", "schol", "forel", "vis", "zeevruchten", "mossel"];
  const CAT_MEAT = ["gehakt", "rund", "varken", "spek", "ham", "biefstuk", "worst", "chorizo", "salami", "lam", "ribbe", "kip", "kalkoen", "gevogelte", "eend"];
  function recipeCategories(r) {
    if (!r) return [];
    // manual override wins completely over auto-detection
    const ov = state.recipeCatOverrides && state.recipeCatOverrides[r.id];
    if (ov) return ov.slice();
    const set = new Set(Array.isArray(r.cats) ? r.cats : []);   // explicit tags (e.g. voorgerecht) always count
    const title = (r.title || "").toLowerCase();
    const names = (r.ingredients || []).map((i) => (i.name || "").toLowerCase());
    const has = (kws) => names.some((n) => kws.some((k) => n.includes(k)));
    if (r.meatDish) {
      if (has(CAT_FISH)) set.add("vis");
      if (has(CAT_MEAT)) set.add("vlees");
      if (!has(CAT_FISH) && !has(CAT_MEAT)) set.add("vlees");   // meat/fish dish, niet nader bepaald
    } else {
      set.add("vegetarisch");
    }
    if (names.some((n) => !n.includes("pinda") && CAT_CHEESE.some((k) => n.includes(k)))) set.add("kaas");
    if (title.includes("soep")) set.add("soep");
    if (title.includes("voorgerecht")) set.add("voorgerecht");
    if (title.includes("bbq") || title.includes("barbecue") || title.includes("gegrild") || title.includes("grill")) set.add("bbq");
    if (title.includes("wok")) set.add("wok");
    if (title.includes("stoof") || title.includes("stoverij")) set.add("stoofpotje");
    if (title.includes("tajine") || title.includes("tagine")) set.add("tajine");
    if (r.suits && r.suits.includes(0)) set.add("ontbijt");
    if (r.fruit) set.add("tussendoortje");   // loose pieces of fruit are a between-meal snack
    // savory bites (not fruit/dairy) that suit a snack moment
    if (r.suits && r.suits.some((s) => [1, 3, 5].includes(s)) && !r.fruit && !r.dairy) set.add("hapje");
    return [...set];
  }

  // ---- selectors ----
  const sel = {
    currentWeekStart: () => weekStartOf(state.today, state.weekStartDow),
    viewWeekStart: () => addDays(weekStartOf(state.today, state.weekStartDow), 7 * (state.weekOffset || 0)),
    currentWeekDays: () => daysFor(weekStartOf(state.today, state.weekStartDow)),
    days: () => daysFor(addDays(weekStartOf(state.today, state.weekStartDow), 7 * (state.weekOffset || 0))),
    recipeById: (id) => recById[id],
    // all categories available for tagging/filtering = built-in + user-defined
    allCats: () => {
      const builtKeys = new Set(window.MP.RECIPE_CATS.map((c) => c.key));
      return [...window.MP.RECIPE_CATS, ...((state.customCats) || []).filter((c) => !builtKeys.has(c.key))];
    },
    catName: (key) => {
      const m = [...window.MP.RECIPE_CATS, ...((state.customCats) || [])].find((c) => c.key === key);
      return m ? m.name : key.charAt(0).toUpperCase() + key.slice(1);
    },
    hasCatOverride: (id) => !!(state.recipeCatOverrides && state.recipeCatOverrides[id]),
    visibleSlots: () => [0, 2, 4],
    snacksFor: (date) => ((state.snacks && state.snacks[date]) || []),
    snackSummary(date) {
      // aggregate the flexible snack list for combined display
      const list = ((state.snacks && state.snacks[date]) || [])
        .filter((e) => e && (e.recipeId || e.manualName || e.status));
      const names = list.map((e) => {
        if (e.recipeId) { const r = recById[e.recipeId]; return r ? r.title : "?"; }
        if (e.status) { const st = window.MP.statusByKey(e.status); return st ? st.name : "?"; }
        return e.manualName || "?";
      });
      const kcal = list.reduce((a, e) => a + entryNutrition(e).kcal, 0);
      const eaten = list.length > 0 && list.every((e) => e.eaten);
      const eatenCount = list.filter((e) => e.eaten).length;
      return { count: list.length, names, kcal, eaten, eatenCount, items: list, hasNote: list.some((e) => e.note) };
    },
    entry: (date, slot) => state.plan[`${date}|${slot}`] || null,
    // extra dishes (beyond the first) for a meal slot
    extrasFor: (date, slot) => ((state.extras && state.extras[`${date}|${slot}`]) || []),
    // one dish per meal slot (multi-dish reverted) — primary entry only
    mealEntries(date, slot) {
      const p = state.plan[`${date}|${slot}`];
      return p ? [p] : [];
    },
    // display rows for the slot editor / cards: {primary, exId, e}
    mealRows(date, slot) {
      const p = state.plan[`${date}|${slot}`];
      return p ? [{ primary: true, exId: null, e: p }] : [];
    },
    slotFilled: (date, slot) => sel.mealEntries(date, slot).some((e) => e && (e.recipeId || e.manualName || e.status)),
    slotKcal: (date, slot) => sel.mealEntries(date, slot).reduce((a, e) => a + (e.recipeId ? entryNutrition(e).kcal : 0), 0),
    dayEntries(date, { eatenOnly = false, recipeOnly = true, onlyVisible = false } = {}) {
      const out = [];
      for (const s of [0, 2, 4]) {
        for (const e of sel.mealEntries(date, s)) {
          if (!e) continue;
          if (recipeOnly && !e.recipeId) continue;
          if (eatenOnly && !e.eaten) continue;
          out.push(e);
        }
      }
      // snacks (skip when the snacks lane is hidden and we only want visible)
      if (!(onlyVisible && state.showSnacks === false)) {
        for (const e of ((state.snacks && state.snacks[date]) || [])) {
          if (!e) continue;
          if (recipeOnly && !e.recipeId) continue;
          if (eatenOnly && !e.eaten) continue;
          out.push(e);
        }
      }
      return out;
    },
    dayTotals(date, onlyVisible = false) {
      const all = sel.dayEntries(date, { onlyVisible });
      const eaten = all.filter((e) => e.eaten);
      return {
        planned: sumNutrition(all),
        eaten: sumNutrition(eaten),
        eatenCount: eaten.length,
        slotCount: all.length,
      };
    },
    weekMeat() {
      let n = 0;
      sel.days().forEach((date) => {
        [0, 2, 4].forEach((s) => {
          const e = state.plan[`${date}|${s}`];
          if (e && e.recipeId && recById[e.recipeId] && recById[e.recipeId].meatDish) n++;
        });
        ((state.snacks && state.snacks[date]) || []).forEach((e) => {
          if (e && e.recipeId && recById[e.recipeId] && recById[e.recipeId].meatDish) n++;
        });
      });
      return n;
    },
    // ---- food limits / counts (planned entries, main meals + snacks) ----
    dayFoodEntries(date) {
      const out = [];
      [0, 2, 4].forEach((s) => { sel.mealEntries(date, s).forEach((e) => { if (e && e.recipeId) out.push(e); }); });
      ((state.snacks && state.snacks[date]) || []).forEach((e) => { if (e && e.recipeId) out.push(e); });
      return out;
    },
    foodCountDay(date, food) { return sel.dayFoodEntries(date).filter((e) => entryHasFood(e, food)).length; },
    foodCountWeek(food) { return sel.days().reduce((a, d) => a + sel.foodCountDay(d, food), 0); },
    foodDayMax(food) { return sel.days().reduce((m, d) => Math.max(m, sel.foodCountDay(d, food)), 0); },
    breakfastHasFruit(date) { return sel.mealEntries(date, 0).some((e) => entryHasFood(e, "fruit")); },
    fruitSnackCount(date) { return ((state.snacks && state.snacks[date]) || []).filter((e) => entryHasFood(e, "fruit")).length; },
    fruitPiecesDay(date) { return sel.foodCountDay(date, "fruit"); },
    canAddFruitSnack(date) {
      const cap = (state.targets && state.targets.maxFruitPerDay) || 2;
      const bf = sel.breakfastHasFruit(date);
      const total = sel.fruitPiecesDay(date);
      const maxSnack = bf ? Math.max(0, cap - 1) : cap;
      const snackFruit = sel.fruitSnackCount(date);
      if (total >= cap) return { ok: false, reason: `Maximaal ${cap} stuks fruit per dag bereikt.` };
      if (snackFruit >= maxSnack) return { ok: false, reason: bf ? "Het ontbijt bevat al fruit — daarom max. 1 fruitsnack vandaag." : `Maximaal ${cap} stuks fruit per dag bereikt.` };
      return { ok: true };
    },
    groceries() {
      const map = {}; // key -> { name, unit, qty, cat, fromRecipes:Set }
      const addEntry = (e) => {
        if (!e || !e.recipeId) return;
        if (e.leftoverOf) return;            // leftover meals come from the source pot — no extra groceries
        const r = recById[e.recipeId];
        if (!r) return;
        const mult = e.cookDouble ? 2 : 1;   // cooking a double batch buys twice the ingredients
        const f = (e.portions * mult) / r.portions;
        r.ingredients.forEach((ing) => {
          const key = `${ing.cat}|${ing.name}|${ing.unit}`;
          if (!map[key]) map[key] = { key, name: ing.name, unit: ing.unit, qty: 0, cat: ing.cat, recipes: new Set() };
          map[key].qty += ing.qty * f;
          map[key].recipes.add(r.title);
        });
      };
      sel.days().forEach((date) => {
        [0, 2, 4].forEach((s) => sel.mealEntries(date, s).forEach(addEntry));
        ((state.snacks && state.snacks[date]) || []).forEach(addEntry);
      });
      // known aisle keys; anything else falls into "Overige"
      const known = new Set(AISLES.map((a) => a.key));
      const aisleOf = (cat) => (known.has(cat) ? cat : "Overige");
      // group by aisle
      const byAisle = {};
      Object.values(map).forEach((it) => {
        it.qty = Math.round(it.qty * 100) / 100;
        it.recipeCount = it.recipes.size;
        it.checked = !!state.checked[it.key];
        const a = aisleOf(it.cat);
        (byAisle[a] = byAisle[a] || []).push(it);
      });
      // add manual items
      state.manual.forEach((m) => {
        const a = aisleOf(m.cat);
        (byAisle[a] = byAisle[a] || []).push({
          key: "manual|" + m.id, name: m.name, unit: "", qty: null, cat: m.cat,
          recipeCount: 0, checked: m.checked, manual: true, manualId: m.id,
        });
      });
      // ordered aisle list — follows the user's configurable shop order
      const order = Object.fromEntries(AISLES.map((a) => [a.key, a]));
      const seq = sel.aisleOrder();
      const idx = (k) => { const i = seq.indexOf(k); return i === -1 ? 999 : i; };
      return Object.keys(byAisle)
        .sort((a, b) => idx(a) - idx(b))
        .map((cat) => ({
          cat, name: order[cat]?.name || cat,
          items: byAisle[cat].sort((x, y) => x.name.localeCompare(y.name)),
        }));
    },
    // the active shop order (keys). Persisted; falls back to the data default + appends any new aisles.
    aisleOrder() {
      const def = AISLES.map((a) => a.key);
      const saved = Array.isArray(state.aisleOrder) ? state.aisleOrder.filter((k) => def.includes(k)) : [];
      const merged = [...saved];
      def.forEach((k) => { if (!merged.includes(k)) merged.push(k); });
      return merged;
    },
    aisleMeta: (key) => AISLES.find((a) => a.key === key),
    groceryStats() {
      const groups = sel.groceries();
      let total = 0, done = 0;
      groups.forEach((g) => g.items.forEach((it) => { total++; if (it.checked) done++; }));
      return { total, done };
    },
  };

  // ---- actions ----
  const actions = {
    assign(date, slot, recipeId, portions, opts) {
      opts = opts || {};
      set((st) => {
        const k = `${date}|${slot}`;
        const prev = st.plan[k] || {};
        const cookDouble = slot === 4 ? !!opts.cookDouble : false;
        const p = portions || prev.portions || 1;
        st.plan[k] = { recipeId, portions: p, eaten: false, manualName: null, status: null, note: prev.note || null, cookDouble };
        if (slot === 4) {
          const lk = `${addDays(date, 1)}|2`;
          const existing = st.plan[lk];
          if (cookDouble) {
            if (!existing || existing.leftoverOf === k) {
              st.plan[lk] = { recipeId, portions: p, eaten: false, manualName: null, status: null, note: null, leftoverOf: k };
            }
          } else if (existing && existing.leftoverOf === k) {
            delete st.plan[lk];
          }
        }
        return { ...st, plan: { ...st.plan } };
      });
    },
    setStatus(date, slot, status, note) {
      set((st) => {
        const k = `${date}|${slot}`;
        const prev = st.plan[k] || {};
        if (slot === 4) { const lk = `${addDays(date, 1)}|2`; if (st.plan[lk] && st.plan[lk].leftoverOf === k) delete st.plan[lk]; }
        st.plan[k] = { recipeId: null, portions: 1, eaten: false, manualName: null, status, note: note != null ? note : (prev.note || null) };
        return { ...st, plan: { ...st.plan } };
      });
    },
    setNote(date, slot, note) {
      set((st) => {
        const k = `${date}|${slot}`;
        const prev = st.plan[k];
        const clean = (note || "").trim() || null;
        if (prev) st.plan[k] = { ...prev, note: clean };
        else st.plan[k] = { recipeId: null, portions: 1, eaten: false, manualName: null, status: null, note: clean };
        return { ...st, plan: { ...st.plan } };
      });
    },
    setManualItem(date, slot, name) {
      set((st) => {
        const k = `${date}|${slot}`;
        st.plan[k] = { recipeId: null, portions: 1, eaten: false, manualName: name };
        return { ...st, plan: { ...st.plan } };
      });
    },
    clear(date, slot) {
      set((st) => {
        const k = `${date}|${slot}`;
        const cur = st.plan[k];
        // clearing a cook-double dinner removes its leftover; clearing a leftover frees its source
        if (slot === 4) { const lk = `${addDays(date, 1)}|2`; if (st.plan[lk] && st.plan[lk].leftoverOf === k) delete st.plan[lk]; }
        if (cur && cur.leftoverOf && st.plan[cur.leftoverOf]) st.plan[cur.leftoverOf] = { ...st.plan[cur.leftoverOf], cookDouble: false };
        // promote the first extra dish into the primary slot, if any
        const ex = (st.extras && st.extras[k]) ? st.extras[k].slice() : [];
        if (ex.length) {
          const promoted = ex.shift();
          st.plan[k] = { recipeId: promoted.recipeId || null, portions: promoted.portions || 1, eaten: !!promoted.eaten, manualName: promoted.manualName || null, status: promoted.status || null, note: promoted.note || null };
          st.extras = { ...st.extras, [k]: ex };
        } else {
          delete st.plan[k];
        }
        return { ...st, plan: { ...st.plan }, extras: { ...st.extras } };
      });
    },
    // ---- multiple dishes per meal (like snacks) ----
    addMealDish(date, slot, payload) {
      set((st) => {
        const k = `${date}|${slot}`;
        if (!st.plan[k]) {
          // empty slot → this becomes the first dish
          st.plan[k] = { recipeId: payload.recipeId || null, portions: payload.portions || 1, eaten: false, manualName: payload.manualName || null, status: payload.status || null, note: payload.note || null };
          return { ...st, plan: { ...st.plan } };
        }
        const arr = (st.extras && st.extras[k]) ? st.extras[k].slice() : [];
        arr.push({ id: newDishId(), recipeId: payload.recipeId || null, portions: payload.portions || 1, eaten: false, manualName: payload.manualName || null, status: payload.status || null, note: payload.note || null });
        return { ...st, extras: { ...st.extras, [k]: arr } };
      });
    },
    updateMealDish(date, slot, exId, patch) {
      set((st) => {
        const k = `${date}|${slot}`;
        const arr = (st.extras && st.extras[k]) ? st.extras[k].map((e) => e.id === exId ? { ...e, ...patch } : e) : [];
        return { ...st, extras: { ...st.extras, [k]: arr } };
      });
    },
    removeMealDish(date, slot, exId) {
      set((st) => {
        const k = `${date}|${slot}`;
        const arr = (st.extras && st.extras[k]) ? st.extras[k].filter((e) => e.id !== exId) : [];
        return { ...st, extras: { ...st.extras, [k]: arr } };
      });
    },
    toggleMealDishEaten(date, slot, exId) {
      set((st) => {
        const k = `${date}|${slot}`;
        const arr = (st.extras && st.extras[k]) ? st.extras[k].map((e) => e.id === exId ? { ...e, eaten: !e.eaten } : e) : [];
        return { ...st, extras: { ...st.extras, [k]: arr } };
      });
    },
    // ref-based helpers: ref = { primary:true } or { exId }
    dishEaten(date, slot, ref) {
      if (ref.primary) set((st) => { const k = `${date}|${slot}`; if (st.plan[k]) st.plan[k] = { ...st.plan[k], eaten: !st.plan[k].eaten }; return { ...st, plan: { ...st.plan } }; });
      else actions.toggleMealDishEaten(date, slot, ref.exId);
    },
    dishRemove(date, slot, ref) {
      if (ref.primary) actions.clear(date, slot);
      else actions.removeMealDish(date, slot, ref.exId);
    },
    dishPortions(date, slot, ref, p) {
      if (ref.primary) actions.setPortions(date, slot, p);
      else actions.updateMealDish(date, slot, ref.exId, { portions: Math.max(0.1, Math.round(p * 10) / 10) });
    },
    dishReplace(date, slot, ref, recipeId, portions) {
      if (ref.primary) actions.assign(date, slot, recipeId, portions);
      else actions.updateMealDish(date, slot, ref.exId, { recipeId, portions: portions || 1, status: null, manualName: null });
    },
    dishNote(date, slot, ref, note) {
      const clean = (note || "").trim() || null;
      if (ref.primary) actions.setNote(date, slot, clean);
      else actions.updateMealDish(date, slot, ref.exId, { note: clean });
    },
    setPortions(date, slot, portions) {
      set((st) => {
        const k = `${date}|${slot}`;
        const p = Math.max(0.1, Math.round(portions * 10) / 10);
        if (st.plan[k]) st.plan[k] = { ...st.plan[k], portions: p };
        // keep a linked leftover in sync
        if (slot === 4) { const lk = `${addDays(date, 1)}|2`; if (st.plan[lk] && st.plan[lk].leftoverOf === k) st.plan[lk] = { ...st.plan[lk], portions: p }; }
        return { ...st, plan: { ...st.plan } };
      });
    },
    shiftWeek(n) {
      set((st) => ({ ...st, weekOffset: (st.weekOffset || 0) + n }));
    },
    gotoCurrentWeek() {
      set((st) => ({ ...st, weekOffset: 0 }));
    },
    setWeekStartDow(d) {
      set((st) => ({ ...st, weekStartDow: d }));
    },
    toggleSnacks() {
      set((st) => ({ ...st, showSnacks: st.showSnacks === false }));
    },
    // ---- recipe categories: manual overrides + custom categories ----
    setRecipeCats(id, cats) {
      set((st) => {
        const ov = { ...(st.recipeCatOverrides || {}) };
        ov[id] = Array.from(new Set(cats));
        return { ...st, recipeCatOverrides: ov };
      });
    },
    clearRecipeCats(id) {
      set((st) => {
        const ov = { ...(st.recipeCatOverrides || {}) };
        delete ov[id];
        return { ...st, recipeCatOverrides: ov };
      });
    },
    addCustomCat(name) {
      const clean = (name || "").trim();
      if (!clean) return null;
      const key = clean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || ("cat-" + Date.now());
      const existing = [...window.MP.RECIPE_CATS, ...(state.customCats || [])].find((c) => c.key === key);
      if (existing) return existing.key;
      set((st) => ({ ...st, customCats: [ ...((st.customCats) || []), { key, name: clean, custom: true } ] }));
      return key;
    },
    setRecipeImage(id, dataUrl) {
      if (recById[id]) recById[id].image = dataUrl || null;
      set((st) => {
        const images = { ...(st.images || {}) };
        if (dataUrl) images[id] = dataUrl; else delete images[id];
        return { ...st, images };
      });
    },
    deleteRecipe(id) {
      const idx = RECIPES.findIndex((r) => r.id === id);
      if (idx >= 0) RECIPES.splice(idx, 1);
      delete recById[id];
      set((st) => {
        // remove any planned slots that used this recipe
        const plan = { ...st.plan };
        Object.keys(plan).forEach((k) => { if (plan[k] && plan[k].recipeId === id) delete plan[k]; });
        // remove from snack lists too
        const snacks = { ...(st.snacks || {}) };
        Object.keys(snacks).forEach((d) => { snacks[d] = (snacks[d] || []).filter((e) => e.recipeId !== id); });
        const images = { ...(st.images || {}) };
        delete images[id];
        const customRecipes = (st.customRecipes || []).filter((r) => r.id !== id);
        return { ...st, plan, images, customRecipes, snacks };
      });
    },
    toggleEaten(date, slot) {
      set((st) => {
        const k = `${date}|${slot}`;
        // toggle the whole meal: base it on the primary's current state
        const target = st.plan[k] ? !st.plan[k].eaten : true;
        if (st.plan[k]) st.plan[k] = { ...st.plan[k], eaten: target };
        if (st.extras && st.extras[k]) st.extras = { ...st.extras, [k]: st.extras[k].map((e) => ({ ...e, eaten: target })) };
        return { ...st, plan: { ...st.plan }, extras: { ...st.extras } };
      });
    },
    setSnacksEaten(date, val) {
      set((st) => {
        const snacks = { ...(st.snacks || {}) };
        snacks[date] = (snacks[date] || []).map((e) => ({ ...e, eaten: val }));
        return { ...st, snacks };
      });
    },
    // ---- flexible snacks (any number per day) ----
    addSnack(date, payload) {
      set((st) => {
        const snacks = { ...(st.snacks || {}) };
        const list = (snacks[date] || []).slice();
        list.push({
          id: newSnackId(),
          recipeId: payload.recipeId || null,
          portions: payload.portions || 1,
          eaten: false,
          manualName: payload.manualName || null,
          status: payload.status || null,
          note: payload.note || null,
        });
        snacks[date] = list;
        return { ...st, snacks };
      });
    },
    updateSnack(date, id, patch) {
      set((st) => {
        const snacks = { ...(st.snacks || {}) };
        snacks[date] = (snacks[date] || []).map((e) => (e.id === id ? { ...e, ...patch } : e));
        return { ...st, snacks };
      });
    },
    removeSnack(date, id) {
      set((st) => {
        const snacks = { ...(st.snacks || {}) };
        snacks[date] = (snacks[date] || []).filter((e) => e.id !== id);
        return { ...st, snacks };
      });
    },
    toggleSnackEaten(date, id) {
      set((st) => {
        const snacks = { ...(st.snacks || {}) };
        snacks[date] = (snacks[date] || []).map((e) => (e.id === id ? { ...e, eaten: !e.eaten } : e));
        return { ...st, snacks };
      });
    },
    swap(aDate, aSlot, bDate, bSlot) {
      set((st) => {
        const ak = `${aDate}|${aSlot}`, bk = `${bDate}|${bSlot}`;
        const a = st.plan[ak], b = st.plan[bk];
        if (b) st.plan[ak] = b; else delete st.plan[ak];
        if (a) st.plan[bk] = a; else delete st.plan[bk];
        // swap any extra dishes too
        const ex = { ...(st.extras || {}) };
        const ea = ex[ak], eb = ex[bk];
        if (eb && eb.length) ex[ak] = eb; else delete ex[ak];
        if (ea && ea.length) ex[bk] = ea; else delete ex[bk];
        return { ...st, plan: { ...st.plan }, extras: ex };
      });
    },
    toggleGrocery(key) {
      set((st) => {
        if (key.startsWith("manual|")) {
          const id = key.slice(7);
          st.manual = st.manual.map((m) => (m.id === id ? { ...m, checked: !m.checked } : m));
        } else {
          st.checked = { ...st.checked, [key]: !st.checked[key] };
        }
        return { ...st };
      });
    },
    addManual(name, cat) {
      set((st) => {
        const id = "m" + Date.now();
        st.manual = [...st.manual, { id, name, cat, checked: false }];
        return { ...st };
      });
    },
    removeManual(id) {
      set((st) => { st.manual = st.manual.filter((m) => m.id !== id); return { ...st }; });
    },
    setAisleOrder(keys) {
      set((st) => ({ ...st, aisleOrder: Array.from(new Set(keys)) }));
    },
    moveAisle(key, dir) {
      const seq = sel.aisleOrder();
      const i = seq.indexOf(key);
      const j = i + dir;
      if (i === -1 || j < 0 || j >= seq.length) return;
      const next = seq.slice();
      next.splice(i, 1);
      next.splice(j, 0, key);
      set((st) => ({ ...st, aisleOrder: next }));
    },
    resetAisleOrder() {
      set((st) => ({ ...st, aisleOrder: null }));
    },
    uncheckAllGroceries() {
      set((st) => {
        st.checked = {};
        st.manual = st.manual.map((m) => ({ ...m, checked: false }));
        return { ...st };
      });
    },
    setTarget(key, val) {
      set((st) => ({ ...st, targets: { ...st.targets, [key]: val } }));
    },
    setMacros(carbs, protein, fat) {
      set((st) => ({ ...st, targets: { ...st.targets, carbsPct: carbs, proteinPct: protein, fatPct: fat } }));
    },
    createRecipe(obj) {
      const id = Math.max(1000, ...RECIPES.map((r) => r.id)) + 1;
      const r = {
        id,
        title: (obj.title || "").trim() || "Naamloos recept",
        source: obj.source || "Eigen recept",
        portions: obj.portions || 1,
        prepTime: obj.prepTime || 0,
        meatDish: !!obj.meatDish,
        seasons: obj.seasons || [],
        suits: (obj.suits && obj.suits.length) ? obj.suits : [2, 4],
        kcal: obj.kcal || 0, carbs: obj.carbs || 0, protein: obj.protein || 0, fat: obj.fat || 0,
        instructions: obj.instructions || "",
        ingredients: (obj.ingredients || []).filter((i) => i.name && i.name.trim()).map((i) => ({
          name: i.name.trim(), qty: Number(i.qty) || 0, unit: i.unit || "", cat: i.cat || "Voorraad",
        })),
        image: obj.image || null,
        cats: Array.isArray(obj.cats) ? obj.cats : [],
        custom: true,
      };
      RECIPES.push(r); recById[id] = r;
      state = { ...state, customRecipes: [ ...(state.customRecipes || []), r ] };
      emit();
      return r;
    },
    importRecipe(obj) {
      const id = Math.max(1000, ...RECIPES.map((r) => r.id)) + 1;
      const r = {
        id,
        title: obj.title || "Naamloos recept",
        source: obj.source || "Import",
        portions: obj.portions || 1,
        prepTime: obj.prep_time_minutes || obj.prepTime || 0,
        meatDish: !!(obj.meat_dish ?? obj.meatDish),
        seasons: obj.seasons || [],
        suits: obj.suits || [2, 4],
        kcal: obj.kcal || 0, carbs: obj.carbs || 0, protein: obj.protein || 0, fat: obj.fat || 0,
        instructions: obj.instructions || "",
        ingredients: (obj.ingredients || []).map((i) => ({
          name: i.name, qty: i.quantity ?? i.qty ?? 0, unit: i.unit || "", cat: i.category || i.cat || "Voorraad",
        })),
        imported: true,
      };
      RECIPES.push(r); recById[id] = r;
      state = { ...state, customRecipes: [ ...(state.customRecipes || []), r ] };
      emit();
      return r;
    },
    suggestWeek() {
      // fill EVERY empty main slot with a fitting recipe; ensure each day has a snack
      set((st) => {
        const used = {};
        const snacks = { ...(st.snacks || {}) };
        const snackFits = RECIPES.filter((r) => r.suits && r.suits.some((x) => [1, 3, 5].includes(x)));
        sel.days().forEach((date) => {
          [0, 2, 4].forEach((s) => {
            const k = `${date}|${s}`;
            if (st.plan[k] && (st.plan[k].recipeId || st.plan[k].manualName)) return;
            const fits = RECIPES.filter((r) => r.suits.includes(s));
            // prefer least-recently-used in this fill
            fits.sort((a, b) => (used[a.id] || 0) - (used[b.id] || 0) || Math.random() - 0.5);
            const pick = fits[0];
            if (pick) {
              used[pick.id] = (used[pick.id] || 0) + 1;
              st.plan[k] = { recipeId: pick.id, portions: 1, eaten: false, manualName: null, auto: true };
            }
          });
          // ensure at least one snack on empty days
          if ((!snacks[date] || snacks[date].length === 0) && snackFits.length) {
            const pick = snackFits[Math.floor(Math.random() * snackFits.length)];
            snacks[date] = [{ id: newSnackId(), recipeId: pick.id, portions: 1, eaten: false, manualName: null, status: null, note: null, auto: true }];
          }
        });
        return { ...st, plan: { ...st.plan }, snacks };
      });
    },
    // remove ONLY the automatically suggested entries; keep everything you chose yourself
    clearSuggested() {
      set((st) => {
        const dates = sel.days();
        const plan = { ...st.plan };
        const snacks = { ...(st.snacks || {}) };
        const extras = { ...(st.extras || {}) };
        dates.forEach((d) => {
          [0, 2, 4].forEach((s) => { const k = `${d}|${s}`; if (plan[k] && plan[k].auto) delete plan[k]; if (extras[k]) extras[k] = extras[k].filter((e) => !e.auto); });
          if (Array.isArray(snacks[d])) snacks[d] = snacks[d].filter((e) => !e.auto);
        });
        return { ...st, plan, snacks, extras };
      });
    },
    // does the current week contain any auto-suggested entries?
    hasSuggested() {
      const dates = sel.days();
      return dates.some((d) =>
        [0, 2, 4].some((s) => { const e = state.plan[`${d}|${s}`]; return e && e.auto; }) ||
        ((state.snacks && state.snacks[d]) || []).some((e) => e.auto)
      );
    },
    clearWeek() {
      set((st) => {
        const dates = sel.days();
        const plan = { ...st.plan };
        const snacks = { ...(st.snacks || {}) };
        const extras = { ...(st.extras || {}) };
        dates.forEach((d) => { [0, 2, 4].forEach((s) => { delete plan[`${d}|${s}`]; delete extras[`${d}|${s}`]; }); snacks[d] = []; });
        return { ...st, plan, snacks, extras };
      });
    },
    // wipe the old auto-fills and generate a fresh set, keeping your own picks
    newSuggestion() {
      actions.clearSuggested();
      actions.suggestWeek();
    },
    reset() { state = DEFAULT(); emit(); },
  };

  window.MPStore = {
    getState: () => state,
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
    sel, actions,
    fmt: { fmtDow, fmtDowLong, fmtDay, fmtMon, weekDates, daysFor, dow, addDays },
    entryNutrition, sumNutrition, recipeFoods, recipeCategories,
    // Registreer een extern (backend) recept in RECIPES én recById zonder emit
    registerRecipe: (r) => { RECIPES.push(r); recById[r.id] = r; },
  };
})();
