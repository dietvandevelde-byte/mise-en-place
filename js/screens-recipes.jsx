/* =========================================================================
   MEAL PLANNER — Recipes library, detail, JSON import
   ========================================================================= */
const EXAMPLE_JSON = `{
  "title": "Bloemkoolsoep",
  "source": "https://recept.nl/...",
  "portions": 4,
  "prep_time_minutes": 30,
  "meat_dish": false,
  "seasons": ["herfst", "winter"],
  "kcal": 210, "carbs": 14, "protein": 7, "fat": 13,
  "instructions": "Fruit ui en knoflook...",
  "ingredients": [
    { "name": "bloemkool", "quantity": 1, "unit": "stuk", "category": "Groenten" },
    { "name": "room", "quantity": 200, "unit": "ml", "category": "Zuivel" }
  ]
}`;

function primaryCatKey(r) {
  const cats = S.recipeCategories(r);
  if (!cats.length) return null;
  for (const k of (window.MP.CAT_PRIORITY || [])) { if (cats.includes(k)) return k; }
  return cats[0]; // a custom category with no priority entry
}
function primaryColor(r) {
  const k = primaryCatKey(r);
  const meta = k && window.MP.RECIPE_CATS.find((c) => c.key === k);
  return (meta && meta.color) || "brand";
}
function slotLabel(r) {
  const k = primaryCatKey(r);
  return k ? S.sel.catName(k) : "Recept";
}

/* Read-only recipe view (macros per portion, ingredients scaled to `portions`). */
function RecipeView({ recipe, portions, editable, onImageChange }) {
  const p = portions || recipe.portions;
  const factor = p / recipe.portions;
  return React.createElement("div", { className: "rdetail" },
    editable
      ? React.createElement(ImagePicker, { value: recipe.image, onChange: onImageChange, height: 180, label: "Foto toevoegen aan recept" })
      : (recipe.image && React.createElement("div", { className: "rdetail__hero" }, React.createElement("img", { src: recipe.image, alt: "" }))),
    recipe.kcal === 0 && React.createElement("div", { className: "rdetail__nokcal" },
      React.createElement(Icon, { name: "warn", size: 15 }),
      React.createElement("span", null, "Geen voedingswaarden. Bereken ze automatisch via ", React.createElement("b", null, "Bewerken"), ".")),
    React.createElement("div", null,
      React.createElement("div", { className: "rdetail__macros" },
        React.createElement("div", { className: "rmacro" }, React.createElement("b", null, recipe.kcal), React.createElement("span", null, "kcal")),
        React.createElement("div", { className: "rmacro", "data-k": "carb" }, React.createElement("b", null, recipe.carbs, "g"), React.createElement("span", null, "Koolh.")),
        React.createElement("div", { className: "rmacro", "data-k": "prot" }, React.createElement("b", null, recipe.protein, "g"), React.createElement("span", null, "Eiwit")),
        React.createElement("div", { className: "rmacro", "data-k": "fat" }, React.createElement("b", null, recipe.fat, "g"), React.createElement("span", null, "Vet"))),
      React.createElement("div", { style: { fontSize: 12, color: "var(--ink-3)", textAlign: "center", marginTop: 6, fontWeight: 600 } }, "per portie")),
    React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } },
      React.createElement("span", { className: "tag" }, React.createElement(Icon, { name: "clock", size: 13 }), recipe.prepTime, " min"),
      React.createElement("span", { className: "tag" }, React.createElement(Icon, { name: "user", size: 13 }), nlNum(p), " ", p === 1 ? "portie" : "porties"),
      S.recipeCategories(recipe).map((c) => {
        const meta = S.sel.allCats().find((x) => x.key === c);
        const isVeg = c === "vegetarisch";
        const icon = (c === "vlees" || c === "vis") ? "meat" : isVeg ? "leaf" : c === "kaas" ? "milk" : null;
        return React.createElement("span", { key: c, className: "tag", style: isVeg ? { background: "var(--sage-soft)", color: "var(--sage-ink)" } : undefined },
          icon && React.createElement(Icon, { name: icon, size: 13 }), meta ? meta.name : cap(c));
      }),
      (recipe.seasons || []).map((s) => React.createElement("span", { key: s, className: "tag" }, cap(s)))),
    editable && React.createElement(CategoryEditor, { recipe }),
    recipe.ingredients.length > 0 && React.createElement("div", null,
      React.createElement("div", { className: "section-label" }, `Ingrediënten · ${nlNum(p)} ${p === 1 ? "portie" : "porties"}`),
      recipe.ingredients.map((ing, i) => React.createElement("div", { key: i, className: "ingrow" },
        React.createElement("div", { className: "ingrow__qty" }, fmtQty(ing.qty * factor, ing.unit)),
        React.createElement("div", { className: "ingrow__name" }, ing.name),
        React.createElement("div", { className: "ingrow__cat" }, ing.cat)))),
    recipe.instructions && React.createElement("div", null,
      React.createElement("div", { className: "section-label" }, "Bereiding"),
      React.createElement("p", { style: { margin: 0, lineHeight: 1.6, color: "var(--ink-2)" } }, recipe.instructions)),
    recipe.source && React.createElement("div", { style: { fontSize: 12, color: "var(--ink-3)" } }, "Bron: ", recipe.source));
}
window.RecipeView = RecipeView;

/* ---- manual category editor (toggle built-in + add your own, e.g. "Dessert") ---- */
function CategoryEditor({ recipe }) {
  useStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const current = S.recipeCategories(recipe);
  const all = S.sel.allCats();
  const overridden = S.sel.hasCatOverride(recipe.id);

  function toggle(key) {
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    S.actions.setRecipeCats(recipe.id, next);
  }
  function addNew() {
    const key = S.actions.addCustomCat(name);
    if (key) S.actions.setRecipeCats(recipe.id, Array.from(new Set([...current, key])));
    setName(""); setAdding(false);
  }

  return React.createElement("div", { className: "cateditor" },
    React.createElement("div", { className: "section-label", style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
      React.createElement("span", null, "Categorie\u00ebn"),
      overridden && React.createElement("button", { className: "cateditor__reset", onClick: () => S.actions.clearRecipeCats(recipe.id) },
        React.createElement(Icon, { name: "swap", size: 12 }), "Automatisch")),
    React.createElement("div", { className: "field__hint", style: { marginBottom: 10 } },
      overridden ? "Je hebt de categorie\u00ebn handmatig ingesteld voor dit recept." : "Standaard automatisch herkend. Tik om aan te passen of voeg een eigen categorie toe."),
    React.createElement("div", { className: "chiprow" },
      all.map((c) => React.createElement("button", {
        key: c.key, className: "chip chip--toggle", "data-active": current.includes(c.key) ? 1 : 0, onClick: () => toggle(c.key),
      }, current.includes(c.key) && React.createElement(Icon, { name: "check", size: 13 }), c.name)),
      adding
        ? React.createElement("span", { className: "cateditor__add" },
            React.createElement("input", {
              className: "cateditor__input", autoFocus: true, value: name, placeholder: "Bv. Dessert",
              onChange: (e) => setName(e.target.value),
              onKeyDown: (e) => { if (e.key === "Enter") addNew(); if (e.key === "Escape") { setAdding(false); setName(""); } },
            }),
            React.createElement("button", { className: "cateditor__ok", onClick: addNew, disabled: !name.trim() }, React.createElement(Icon, { name: "check", size: 14 })))
        : React.createElement("button", { className: "chip chip--add", onClick: () => setAdding(true) }, React.createElement(Icon, { name: "plus", size: 13 }), "Eigen categorie")));
}
window.CategoryEditor = CategoryEditor;

function RecipeDetail({ recipe, onClose, toast }) {
  const state = useStore();
  const [planning, setPlanning] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirm, confirmPortal] = useConfirm();

  const [day, setDay] = useState(state.today);
  const [slot, setSlot] = useState(recipe.suits[0]);
  const [portions, setPortions] = useState(recipe.portions);
  const days = S.sel.days();
  const c = primaryColor(recipe);

  const foot = editing
    ? null  // CreateRecipeForm heeft eigen knoppen
    : planning
      ? React.createElement(React.Fragment, null,
          React.createElement("button", { className: "btn btn--ghost", onClick: () => setPlanning(false) }, "Terug"),
          React.createElement("button", { className: "btn btn--block", onClick: () => { S.actions.assign(day, slot, recipe.id, portions); toast(`${recipe.title} ingepland`); onClose(); } }, React.createElement(Icon, { name: "check", size: 18 }), "Inplannen"))
      : React.createElement(React.Fragment, null,
          React.createElement("button", { className: "btn btn--danger btn--icon", title: "Recept verwijderen", onClick: async () => { if (await confirm(`"${recipe.title}" verwijderen uit je bibliotheek? Het wordt ook uit geplande dagen gehaald.`, true)) { S.actions.deleteRecipe(recipe.id); toast(`${recipe.title} verwijderd`); onClose(); } } },
            React.createElement(Icon, { name: "trash", size: 19 })),
          React.createElement("button", { className: "btn btn--ghost", style: { display: "flex", alignItems: "center", gap: 6 }, onClick: () => setEditing(true) }, React.createElement(Icon, { name: "edit", size: 18 }), "Bewerken"),
          React.createElement("button", { className: "btn btn--block", onClick: () => setPlanning(true) }, React.createElement(Icon, { name: "plus", size: 18 }), "In de week plannen"));

  const body = editing
    ? React.createElement(CreateRecipeForm, {
        initialRecipe: recipe,
        onCancel: () => setEditing(false),
        onSave: () => { toast("Recept opgeslagen"); setEditing(false); },
      })
    : planning
      ? React.createElement("div", null,
          React.createElement("div", { className: "section-label" }, "Welke dag?"),
          React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 } },
            days.map((d) => React.createElement("button", { key: d, className: "chip", "data-active": d === day ? 1 : 0, onClick: () => setDay(d) },
              cap(S.fmt.fmtDow(d)), " ", S.fmt.fmtDay(d)))),
          React.createElement("div", { className: "section-label" }, "Welk dagdeel?"),
          React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 } },
            window.MP.SLOTS.map((m) => React.createElement("button", { key: m.i, className: "chip", "data-c": m.color, "data-active": m.i === slot ? 1 : 0, onClick: () => setSlot(m.i) }, m.name))),
          React.createElement("div", { className: "field__row" },
            React.createElement("div", { className: "field__label" }, "Porties"),
            React.createElement(Stepper, { value: portions, onChange: setPortions, step: 0.1, min: 0.1, max: 20, editable: true })))
      : React.createElement(RecipeView, { recipe, portions: recipe.portions, editable: true, onImageChange: (v) => {
          S.actions.setRecipeImage(recipe.id, v);
          toast && toast(v ? "Foto opgeslagen" : "Foto verwijderd");
        } });

  const title = editing ? `Bewerken: ${recipe.title}` : recipe.title;
  const eyebrow = editing ? "Recept bewerken" : slotLabel(recipe);
  const eyebrowColor = editing ? "teal" : c;

  return React.createElement(React.Fragment, null,
    React.createElement(Sheet, { eyebrow, eyebrowColor, title, onClose: editing ? () => setEditing(false) : onClose, foot, wide: true }, body),
    confirmPortal);
}

function repairTruncatedJSON(s) {
  // Knip tot het laatste volledig afgesloten object en balanceer de haakjes.
  const end = s.lastIndexOf("}");
  if (end < 0) throw new Error("onherstelbare JSON");
  const t = s.slice(0, end + 1);
  const stack = [];
  let inStr = false, esc = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === "\"") inStr = false; continue; }
    if (c === "\"") inStr = true;
    else if (c === "{" || c === "[") stack.push(c);
    else if (c === "}" || c === "]") stack.pop();
  }
  let close = "";
  for (let i = stack.length - 1; i >= 0; i--) close += stack[i] === "{" ? "}" : "]";
  return t + close;
}

function sourceLabel(r) {
  if (r.source && r.source.startsWith("http")) {
    try {
      const host = new URL(r.source).hostname.replace(/^www\./, "");
      const parts = host.split(".");
      // "njam.tv" → "njam", "leukerecepten.nl" → "leukerecepten"
      return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    } catch(e) {}
  }
  if (r.source && r.source !== "Eigen recept" && r.source !== "AI import") return r.source;
  return "Eigen";
}
window.sourceLabel = sourceLabel;

function ImportSheet({ onClose, toast }) {
  const [tab, setTab] = useState("url");     // url | screenshot | tekst | json
  const [txt, setTxt] = useState("");
  const [url, setUrl] = useState("");
  const [img, setImg] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [screenshotSource, setScreenshotSource] = useState("");
  const [tekstSource, setTekstSource] = useState("");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function _saveRecipe(result, overrideSource) {
    const r = result.recipe;
    console.log("[scraper] recipe.name:", r?.name, "| ingredients:", r?.ingredients?.length, "| instructions:", r?.instructions?.length);
    const ingredients = (r.ingredients || []).map(i => ({
      name: i.name, qty: i.amount || 0, unit: i.unit || "", cat: i.cat || "Voorraad"
    }));
    let kcal = r.kcal || 0, carbs = r.carbs || 0, protein = r.protein || 0, fat = r.fat || 0;

    // Als voedingswaarden ontbreken, automatisch berekenen
    if (!kcal && ingredients.length) {
      try {
        const nut = await window.MPAPI.calculateNutrition(r.name, r.ingredients || [], r.servings || 1);
        kcal    = Math.round(nut.kcal    || 0);
        protein = Math.round((nut.protein || 0) * 10) / 10;
        carbs   = Math.round((nut.carbs   || 0) * 10) / 10;
        fat     = Math.round((nut.fat     || 0) * 10) / 10;
      } catch(e) { /* gebruik 0 als fallback */ }
    }

    const obj = {
      title: r.name || "Naamloos recept",
      source: overrideSource || r.source_url || null,
      portions: r.servings || 1,
      prepTime: r.prep_time || r.total_time || 0,
      meatDish: false,
      seasons: [],
      suits: r.category === "breakfast" ? [0] : r.category === "lunch" ? [2] : [4],
      kcal, carbs, protein, fat,
      instructions: (r.instructions || []).map(s => s.text || "").join("\n\n"),
      ingredients,
      image: img || null,
      cats: [],
    };
    const saved = S.actions.createRecipe(obj);
    toast(`${saved.title} geïmporteerd`);
    onClose();
  }

  async function doUrl() {
    if (!url.trim()) { setErr("Vul een URL in"); return; }
    setErr(null); setBusy(true);
    try {
      const result = await window.MPAPI.scrapeUrl(url.trim());
      console.log("[scraper] result:", JSON.stringify(result?.recipe?.ingredients?.slice(0,2)));
      _saveRecipe(result);
    } catch (e) { setErr("Kon URL niet lezen: " + e.message); }
    finally { setBusy(false); }
  }

  async function doScreenshot() {
    if (!selectedFile) { setErr("Kies een afbeelding"); return; }
    const file = selectedFile;
    setErr(null); setBusy(true);
    try {
      const result = await window.MPAPI.scrapeScreenshot(file);
      _saveRecipe(result, screenshotSource.trim() || null);
    } catch (e) { setErr("Kon screenshot niet lezen: " + e.message); }
    finally { setBusy(false); }
  }

  async function doTekst() {
    if (!txt.trim()) { setErr("Plak eerst een recepttekst"); return; }
    setErr(null); setBusy(true);
    try {
      const result = await window.MPAPI.scrapeText(txt.trim());
      _saveRecipe(result, tekstSource.trim() || null);
    } catch (e) { setErr("Kon recept niet lezen: " + e.message); }
    finally { setBusy(false); }
  }

  function doImportJSON() {
    try {
      const obj = JSON.parse(txt);
      if (!obj.title || !Array.isArray(obj.ingredients)) throw new Error("title en ingredients zijn verplicht");
      const r = S.actions.importRecipe(obj);
      toast(`${r.title} geïmporteerd`);
      onClose();
    } catch (e) { setErr("Kon JSON niet lezen: " + e.message); }
  }

  const seg = React.createElement("div", { className: "seg", style: { marginBottom: 16 } },
    React.createElement("button", { "data-active": tab === "url"        ? 1 : 0, onClick: () => { setTab("url");        setErr(null); } }, "URL"),
    React.createElement("button", { "data-active": tab === "screenshot" ? 1 : 0, onClick: () => { setTab("screenshot"); setErr(null); } }, "Screenshot"),
    React.createElement("button", { "data-active": tab === "tekst"      ? 1 : 0, onClick: () => { setTab("tekst");      setErr(null); } }, "Tekst"),
    React.createElement("button", { "data-active": tab === "json"       ? 1 : 0, onClick: () => { setTab("json");       setErr(null); } }, "JSON"));

  if (tab === "url") {
    return React.createElement(Sheet, {
      eyebrow: "Recept importeren", eyebrowColor: "teal", title: "Via URL", onClose, wide: true,
      foot: React.createElement("button", { className: "btn btn--block", onClick: doUrl, disabled: busy },
        busy ? React.createElement(React.Fragment, null, React.createElement("span", { className: "spinner" }), "Bezig…")
             : React.createElement(React.Fragment, null, React.createElement(Icon, { name: "spark", size: 18 }), "Importeren met AI")),
    },
      seg,
      React.createElement("div", { className: "import__hint" }, "Plak de link van een recept. De AI leest het recept automatisch in, inclusief ingrediënten, voedingswaarden en bereiding."),
      React.createElement("input", { className: "input", type: "url", placeholder: "https://www.ah.nl/allerhande/recept/...", value: url, onChange: (e) => { setUrl(e.target.value); setErr(null); }, style: { marginTop: 12 } }),
      err && React.createElement("div", { className: "import__err" }, err)
    );
  }

  if (tab === "screenshot") {
    return React.createElement(Sheet, {
      eyebrow: "Recept importeren", eyebrowColor: "teal", title: "Via screenshot", onClose, wide: true,
      foot: React.createElement("button", { className: "btn btn--block", onClick: doScreenshot, disabled: busy },
        busy ? React.createElement(React.Fragment, null, React.createElement("span", { className: "spinner" }), "Bezig…")
             : React.createElement(React.Fragment, null, React.createElement(Icon, { name: "spark", size: 18 }), "Importeren met AI")),
    },
      seg,
      React.createElement("div", { className: "import__hint" }, "Maak een screenshot van een recept en upload het hier. De AI herkent automatisch alle informatie."),
      React.createElement("input", { type: "file", accept: "image/*", onChange: (e) => { setSelectedFile(e.target.files[0] || null); setErr(null); }, style: { marginTop: 12, width: "100%" } }),
      React.createElement("input", { className: "input", type: "text", placeholder: "Bron (bijv. Njam, Dagelijkse kost…)", value: screenshotSource, onChange: (e) => setScreenshotSource(e.target.value), style: { marginTop: 10 } }),
      err && React.createElement("div", { className: "import__err" }, err)
    );
  }

  if (tab === "tekst") {
    return React.createElement(Sheet, {
      eyebrow: "Recept importeren", eyebrowColor: "teal", title: "Via tekst", onClose, wide: true,
      foot: React.createElement("button", { className: "btn btn--block", onClick: doTekst, disabled: busy },
        busy ? React.createElement(React.Fragment, null, React.createElement("span", { className: "spinner" }), "Bezig…")
             : React.createElement(React.Fragment, null, React.createElement(Icon, { name: "spark", size: 18 }), "Vul in met AI")),
    },
      seg,
      React.createElement("div", { className: "import__hint" }, "Plak de tekst van een recept. De AI haalt er automatisch de titel, porties, voedingswaarden, ingrediënten en bereiding uit."),
      React.createElement("input", { className: "input", type: "text", placeholder: "Bron (bijv. Njam, Dagelijkse kost…)", value: tekstSource, onChange: (e) => setTekstSource(e.target.value), style: { marginTop: 12 } }),
      React.createElement("textarea", { className: "input", rows: 7, placeholder: "Plak hier de recepttekst…", value: txt, onChange: (e) => { setTxt(e.target.value); setErr(null); }, style: { marginTop: 8 } }),
      err && React.createElement("div", { className: "import__err" }, err)
    );
  }

  return React.createElement(Sheet, {
    eyebrow: "Recept importeren", eyebrowColor: "teal", title: "Plak JSON", onClose, wide: true,
    foot: React.createElement(React.Fragment, null,
      React.createElement("button", { className: "btn btn--ghost", onClick: () => { setTxt(EXAMPLE_JSON); setErr(null); } }, "Voorbeeld"),
      React.createElement("button", { className: "btn btn--block", onClick: doImportJSON, disabled: !txt.trim() }, React.createElement(Icon, { name: "clipboard", size: 18 }), "Importeren")),
  },
    seg,
    React.createElement("div", { className: "import__hint" },
      "Plak een recept in JSON-formaat volgens onderstaand voorbeeld."),
    React.createElement("textarea", { className: "input", rows: 11, placeholder: "{ \"title\": ... }", value: txt, onChange: (e) => { setTxt(e.target.value); setErr(null); }, style: { marginTop: 12 } }),
    err && React.createElement("div", { className: "import__err" }, err)
  );
}
window.ImportSheet = ImportSheet;

/* ---- Reusable create-recipe form (used in slot picker + Recipes screen) ---- */
/* Reusable create-recipe form (used in slot picker + Recipes screen) */
const MP_UNITS = [
  ["g", "gram (g)"], ["kg", "kilogram (kg)"], ["ml", "milliliter (ml)"], ["l", "liter (l)"],
  ["stuk", "stuk(s)"], ["el", "eetlepel (el)"], ["tl", "theelepel (tl)"], ["kl", "koffielepel (kl)"],
  ["snufje", "snufje"], ["teen", "teen"], ["bosje", "bosje"], ["handje", "handje"],
  ["plak", "plak(ken)"], ["sneden", "sneden"], ["blik", "blik"], ["pak", "pak"], ["naar smaak", "naar smaak"],
];
function CreateRecipeForm({ slot, onCancel, onSave, initialRecipe }) {
  const init = initialRecipe;
  const [f, setF] = useState(init ? {
    title: init.title || "", portions: init.portions || 1,
    prepTime: init.prepTime || 0, kcal: init.kcal || 0,
    carbs: init.carbs || 0, protein: init.protein || 0, fat: init.fat || 0,
    meatDish: !!init.meatDish, instructions: init.instructions || "",
    image: init.image || null,
    suits: init.suits || [2],
    cats: init.cats || [],
  } : {
    title: "", portions: 1, prepTime: 20, kcal: 0, carbs: 0, protein: 0, fat: 0,
    meatDish: false, instructions: "", image: null,
    suits: slot != null ? [slot] : [2],
    cats: [],
  });
  const [ings, setIngs] = useState(
    (init && init.ingredients && init.ingredients.length)
      ? init.ingredients.map(i => ({ name: i.name || "", qty: i.qty ?? i.amount ?? "", unit: i.unit || "g", cat: i.cat || "Voorraad" }))
      : [{ name: "", qty: "", unit: "g", cat: "Voorraad" }]
  );
  const [calcBusy, setCalcBusy] = useState(false);
  const [calcMsg, setCalcMsg] = useState(null);
  const calcTimerRef = React.useRef(null);
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const updIng = (i, k, v) => setIngs((s) => s.map((x, j) => j === i ? { ...x, [k]: v } : x));

  async function calcNutrition(ingList, title, portions) {
    const filled = (ingList || ings).filter(i => i.name.trim());
    if (!filled.length) return;
    setCalcBusy(true); setCalcMsg(null);
    try {
      const result = await window.MPAPI.calculateNutrition(title || f.title || "recept", filled, portions || f.portions || 1);
      setF(s => ({ ...s,
        kcal:    Math.round(result.kcal    || 0),
        protein: Math.round((result.protein || 0) * 10) / 10,
        carbs:   Math.round((result.carbs   || 0) * 10) / 10,
        fat:     Math.round((result.fat     || 0) * 10) / 10,
      }));
      setCalcMsg("✓ Automatisch berekend op basis van NEVO-tabel");
    } catch(e) { setCalcMsg(null); }
    finally { setCalcBusy(false); }
  }

  // auto-berekenen na 1.5s stilte bij ingrediëntenwijzigingen
  useEffect(() => {
    const filled = ings.filter(i => i.name.trim());
    if (!filled.length) return;
    if (calcTimerRef.current) clearTimeout(calcTimerRef.current);
    calcTimerRef.current = setTimeout(() => calcNutrition(ings, f.title, f.portions), 1500);
    return () => clearTimeout(calcTimerRef.current);
  }, [ings]);
  const AISLES = window.MP.AISLES;
  const SLOTS = window.MP.SLOTS;

  function toggleSuit(i) {
    setF((s) => ({ ...s, suits: s.suits.includes(i) ? s.suits.filter((x) => x !== i) : [...s.suits, i].sort() }));
  }
  function toggleCat(k) {
    setF((s) => ({ ...s, cats: s.cats.includes(k) ? s.cats.filter((x) => x !== k) : [...s.cats, k] }));
  }
  function save() {
    if (init) {
      const idx = window.MP.RECIPES.findIndex(r => r.id === init.id);
      if (idx >= 0) {
        Object.assign(window.MP.RECIPES[idx], { ...f, ingredients: ings });
      }
      // Trigger store subscribers by updating the image (also saves the image field)
      S.actions.setRecipeImage(init.id, f.image || init.image || null);
      // Also persist to backend
      if (window.MPAPI && window.MPAPI._idMap && window.MPAPI._idMap[init.id]) {
        window.MPAPI.updateRecipe(window.MPAPI._idMap[init.id], {
          name: f.title, servings: f.portions, prep_time: f.prepTime,
          kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat,
          instructions: f.instructions ? f.instructions.split("\n\n").map((t,i)=>({step:i+1,text:t.trim()})).filter(s=>s.text) : [],
          ingredients: ings.map(i=>({name:i.name, amount:Number(i.qty)||null, unit:i.unit||null})),
        }).catch(() => {});
      }
      onSave(init);
    } else {
      const r = S.actions.createRecipe({ ...f, ingredients: ings });
      onSave(r);
    }
  }

  const numField = (key, label, suffix) => React.createElement("div", { className: "crf__num" },
    React.createElement("label", { className: "crf__lbl" }, label),
    React.createElement("div", { className: "crf__numinput" },
      React.createElement("input", { className: "input", type: "number", min: 0, inputMode: "numeric", value: f[key] === 0 ? "" : f[key], placeholder: "0", onChange: (e) => upd(key, Number(e.target.value) || 0) }),
      suffix && React.createElement("span", { className: "crf__suffix" }, suffix)));

  return React.createElement("div", { className: "crf" },
    React.createElement("div", { className: "field" },
      React.createElement("label", { className: "crf__lbl" }, "Naam van het recept *"),
      React.createElement("input", { className: "input", placeholder: "bv. Restje pasta pesto", value: f.title, onChange: (e) => upd("title", e.target.value), autoFocus: true })),

    React.createElement("div", { style: { marginTop: 14 } },
      React.createElement("label", { className: "crf__lbl" }, "Foto (optioneel)"),
      React.createElement(ImagePicker, { value: f.image, onChange: (v) => upd("image", v), height: 150 })),

    React.createElement("div", { className: "crf__row2", style: { marginTop: 14 } },
      numField("portions", "Porties (basis)"),
      numField("prepTime", "Bereidingstijd", "min")),

    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", margin: "20px 0 10px" } },
      React.createElement("div", { className: "section-label", style: { margin: 0 } }, "Voeding per portie"),
      React.createElement("button", {
        type: "button", className: "btn btn--ghost", style: { fontSize: 12, padding: "4px 10px" },
        onClick: () => calcNutrition(), disabled: calcBusy,
      }, calcBusy
        ? React.createElement(React.Fragment, null, React.createElement("span", { className: "spinner" }), " Berekenen\u2026")
        : React.createElement(React.Fragment, null, React.createElement(Icon, { name: "spark", size: 14 }), " Herbereken"))),
    React.createElement("div", { className: "crf__row4" },
      numField("kcal", "Calorie\u00ebn", "kcal"),
      numField("carbs", "Koolh.", "g"),
      numField("protein", "Eiwit", "g"),
      numField("fat", "Vet", "g")),
    calcMsg && React.createElement("div", { style: { fontSize: 12, color: calcMsg.startsWith("\u2713") ? "#2F7D4F" : "#C0392B", marginTop: 6 } }, calcMsg),

    React.createElement("div", { className: "section-label", style: { margin: "20px 0 10px" } }, "Geschikt als"),
    React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap" } },
      SLOTS.map((m) => React.createElement("button", { key: m.i, type: "button", className: "chip", "data-c": m.color, "data-active": f.suits.includes(m.i) ? 1 : 0, onClick: () => toggleSuit(m.i) }, m.name))),

    React.createElement("label", { className: "crf__check", style: { marginTop: 16 } },
      React.createElement("input", { type: "checkbox", checked: f.meatDish, onChange: (e) => upd("meatDish", e.target.checked) }),
      React.createElement("span", null, "Bevat vlees of vis")),

    React.createElement("div", { className: "section-label", style: { margin: "20px 0 6px" } }, "Categorie\u00ebn"),
    React.createElement("div", { className: "field__hint", style: { marginBottom: 10 } }, "Vlees, vis en kaas worden automatisch herkend. Voeg hier zelf bv. \u201Cvoorgerecht\u201D of \u201Csoep\u201D toe."),
    React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap" } },
      window.MP.RECIPE_CATS.map((c) => React.createElement("button", { key: c.key, type: "button", className: "chip", "data-active": f.cats.includes(c.key) ? 1 : 0, onClick: () => toggleCat(c.key) }, c.name))),

    React.createElement("div", { className: "section-label", style: { margin: "20px 0 10px", display: "flex", justifyContent: "space-between" } },
      React.createElement("span", null, "Ingredi\u00ebnten"),
      React.createElement("span", { style: { color: "var(--ink-4)", fontWeight: 600 } }, "voor ", f.portions || 1, " porties \u00b7 optioneel")),
    React.createElement("div", { className: "crf__ings" },
      ings.map((ing, i) => React.createElement("div", { key: i, className: "crf__ingrow" },
        React.createElement("input", { className: "input", placeholder: "ingredi\u00ebnt", value: ing.name, onChange: (e) => updIng(i, "name", e.target.value) }),
        React.createElement("input", { className: "input crf__qty", placeholder: "1", value: ing.qty, onChange: (e) => updIng(i, "qty", e.target.value) }),
        React.createElement("select", { className: "input crf__unit", value: ing.unit, onChange: (e) => updIng(i, "unit", e.target.value) },
          MP_UNITS.map(([v, l]) => React.createElement("option", { key: v, value: v }, l))),
        React.createElement("select", { className: "input crf__cat", value: ing.cat, onChange: (e) => updIng(i, "cat", e.target.value) },
          AISLES.map((a) => React.createElement("option", { key: a.key, value: a.key }, a.name))),
        React.createElement("button", { type: "button", className: "gitem__del", onClick: () => setIngs((s) => s.length > 1 ? s.filter((_, j) => j !== i) : s), title: "Verwijderen" },
          React.createElement(Icon, { name: "x", size: 16 })))),
      React.createElement("button", { type: "button", className: "btn btn--ghost btn--sm", style: { marginTop: 8 }, onClick: () => setIngs((s) => [...s, { name: "", qty: "", unit: "g", cat: "Voorraad" }]) },
        React.createElement(Icon, { name: "plus", size: 16 }), "Ingredi\u00ebnt")),

    React.createElement("div", { className: "section-label", style: { margin: "20px 0 10px" } }, "Bereiding (optioneel)"),
    React.createElement("textarea", { className: "input", rows: 3, placeholder: "Korte omschrijving van de bereiding\u2026", value: f.instructions, onChange: (e) => upd("instructions", e.target.value) }),

    React.createElement("div", { className: "crf__foot" },
      React.createElement("button", { type: "button", className: "btn btn--ghost", onClick: onCancel }, "Annuleren"),
      React.createElement("button", { type: "button", className: "btn btn--block", disabled: !f.title.trim(), onClick: save },
        React.createElement(Icon, { name: "check", size: 18 }), "Recept opslaan"))
  );
}
window.CreateRecipeForm = CreateRecipeForm;

function CreateRecipeSheet({ onClose, toast }) {
  return React.createElement(Sheet, { eyebrow: "Eigen recept", eyebrowColor: "sage", title: "Nieuw recept", onClose, wide: true },
    React.createElement(CreateRecipeForm, { onCancel: onClose, onSave: (r) => { toast(`${r.title} toegevoegd`); onClose(); } }));
}

function RecipesScreen({ toast }) {
  const state = useStore();
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("gerecht"); // "gerecht"|"snack"|"alle"
  const [meal, setMeal] = useState("alle");  // alle|0|2|4|snack
  const [selCats, setSelCats] = useState([]);  // multi-select soort filter ([] = alle)
  function toggleSoort(k) { if (k === "alle") { setSelCats([]); return; } setSelCats((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k]); }
  function setType(t) { setTypeFilter(t); setMeal("alle"); setSelCats([]); }
  const [detail, setDetail] = useState(null);
  const [importing, setImporting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [favsOnly, setFavsOnly] = useState(false);
  const [ownOnly, setOwnOnly] = useState(false);
  const activeFilters = (meal !== "alle" ? 1 : 0) + selCats.length;
  const recipes = window.MP.RECIPES;
  const favIds = new Set(state.favorites || []);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return recipes.filter((r) => {
      // type-filter: gerechten vs snacks
      const isSnack = !!(r.fruit || r.dairy);
      if (typeFilter === "gerecht" && isSnack) return false;
      if (typeFilter === "snack"   && !isSnack) return false;
      if (favsOnly && !favIds.has(r.id)) return false;
      if (ownOnly && !(r.custom || r.imported)) return false;
      if (ql && !r.title.toLowerCase().includes(ql)) return false;
      // wanneer (dagdeel)
      if (meal === "snack") { if (!r.suits.some((s) => [1, 3, 5].includes(s))) return false; }
      else if (meal !== "alle") { if (!r.suits.includes(Number(meal))) return false; }
      // soort (categorie) — multi-select: match any selected category
      if (selCats.length && !selCats.some((k) => S.recipeCategories(r).includes(k))) return false;
      return true;
    }).sort((a, b) => a.title.localeCompare(b.title, "nl"));
  }, [q, typeFilter, meal, selCats, favsOnly, ownOnly, recipes.length, state.favorites]);

  const MEALS = [["alle", "Alle"], ["0", "Ochtend"], ["2", "Middag"], ["4", "Avond"], ["snack", "Snacks"]];
  const CATS = [["alle", "Alle"], ...S.sel.allCats().map((c) => [c.key, c.name])];

  return React.createElement("div", { className: "wrap screen-anim" },
    React.createElement("div", { className: "shead" },
      React.createElement("div", null,
        React.createElement("h1", { className: "shead__title" }, "Recepten"),
        React.createElement("div", { className: "shead__sub" }, React.createElement("b", null, recipes.length), " recepten in je bibliotheek")),
      React.createElement("div", { style: { display: "flex", gap: 8 } },
        React.createElement("button", { className: "btn btn--ghost", onClick: () => setImporting(true) }, React.createElement(Icon, { name: "clipboard", size: 18 }), "Importeer"),
        React.createElement("button", { className: "btn", onClick: () => setCreating(true) }, React.createElement(Icon, { name: "plus", size: 18 }), "Nieuw recept"))),
    React.createElement("div", { className: "rectypebar" },
      [["gerecht", "Gerechten"], ["snack", "Snacks"], ["alle", "Alles"]].map(([k, l]) =>
        React.createElement("button", { key: k, className: "rectype", "data-active": typeFilter === k ? 1 : 0, onClick: () => setType(k) }, l)),
      React.createElement("button", { className: "rectype rectype--own", "data-active": ownOnly ? 1 : 0, onClick: () => setOwnOnly(v => !v), title: "Toon alleen eigen recepten" },
        React.createElement(Icon, { name: "user", size: 13 }), "Eigen")),
    React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 12, alignItems: "center" } },
      React.createElement("div", { className: "picker__search", style: { flex: 1, marginBottom: 0 } },
        React.createElement(Icon, { name: "search", size: 18 }),
        React.createElement("input", { className: "input", placeholder: "Zoek op naam…", value: q, onChange: (e) => setQ(e.target.value) })),
      favIds.size > 0 && React.createElement("button", { className: "chip", "data-active": favsOnly ? 1 : 0, style: { whiteSpace: "nowrap" }, onClick: () => setFavsOnly(v => !v) },
        React.createElement(Icon, { name: "star", size: 14, fill: favsOnly }), "Favorieten")),
    typeFilter !== "snack" && React.createElement("div", { className: "recfilters" },
      React.createElement("div", { className: "recfilters__group" },
        React.createElement("span", { className: "recfilters__lbl" }, "Wanneer"),
        React.createElement("div", { className: "chiprow chiprow--split" },
          React.createElement("button", { key: "alle", className: "chip", "data-active": meal === "alle" ? 1 : 0, onClick: () => setMeal("alle") }, "Alle"),
          React.createElement("div", { className: "chipsub" },
            MEALS.slice(1).map(([k, l]) => React.createElement("button", { key: k, className: "chip", "data-active": meal === k ? 1 : 0, onClick: () => setMeal(k) }, l))))),
      React.createElement("div", { className: "recfilters__group" },
        React.createElement("span", { className: "recfilters__lbl" },
          "Soort",
          selCats.length > 0 && React.createElement("span", { className: "recfilters__cnt" }, ` (${selCats.length})`)),
        React.createElement("div", { className: "chiprow chiprow--split" },
          React.createElement("button", { key: "alle", className: "chip", "data-active": selCats.length === 0 ? 1 : 0, onClick: () => toggleSoort("alle") }, "Alle"),
          React.createElement("div", { className: "chipsub" },
            CATS.slice(1).map(([k, l]) => React.createElement("button", { key: k, className: "chip chip--toggle", "data-active": selCats.includes(k) ? 1 : 0, onClick: () => toggleSoort(k) },
              selCats.includes(k) && React.createElement(Icon, { name: "check", size: 12 }), l)))))),
    typeFilter !== "snack" && React.createElement("div", { className: "filterbar" },
      React.createElement("button", { className: "filterbtn", "data-active": activeFilters > 0 ? 1 : 0, onClick: () => setFilterOpen(true) },
        React.createElement(Icon, { name: "filter", size: 16 }), "Filters",
        activeFilters > 0 && React.createElement("span", { className: "filterbtn__badge" }, activeFilters)),
      activeFilters > 0 && React.createElement("button", { className: "filterclear", onClick: () => { setMeal("alle"); setSelCats([]); } }, "Wissen")),
    list.length === 0
      ? React.createElement("div", { className: "empty" },
          React.createElement("div", { className: "empty__icon" }, React.createElement(Icon, { name: "search", size: 26 })),
          React.createElement("div", { className: "empty__title" }, "Niets gevonden"),
          React.createElement("div", null, "Pas je zoekterm of filter aan."))
      : React.createElement("div", { className: "recgrid" },
          list.map((r) => {
            const isFav = (state.favorites || []).includes(r.id);
            const ownFlag = (r.imported || r.custom)
              ? React.createElement("span", { className: "imported-flag" }, sourceLabel(r))
              : null;
            const cardBand = React.createElement("div", { className: "reccard__band" },
              React.createElement("span", { className: "reccard__band-label" }, slotLabel(r)),
              ownFlag,
              React.createElement("button", { className: "reccard__favbtn", "data-on": isFav ? 1 : 0,
                title: isFav ? "Verwijder uit favorieten" : "Voeg toe aan favorieten",
                onClick: (e) => { e.stopPropagation(); S.actions.toggleFavorite(r.id); } },
                React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: isFav ? "#E8A020" : "none", stroke: isFav ? "#333" : "#999", strokeWidth: 1.7 },
                  React.createElement("path", { d: "M12 2.5l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 16.8l-5.6 2.9 1.1-6.2L3 9.1l6.2-.9z" }))));
            const cardImg = r.image
              ? React.createElement("div", { className: "reccard__thumb" }, React.createElement("img", { src: r.image, alt: "" }))
              : React.createElement("div", { className: "reccard__thumb reccard__thumb--empty" });
            const cardKcal = React.createElement("div", { className: "reccard__kcal" + (r.kcal === 0 ? " reccard__kcal--missing" : "") },
              r.kcal === 0
                ? React.createElement(React.Fragment, null, React.createElement(Icon, { name: "warn", size: 12 }), " geen kcal")
                : React.createElement(React.Fragment, null, r.kcal, " ", React.createElement("span", null, "kcal")));
            const cardTags = React.createElement("div", { className: "reccard__tags" },
              React.createElement("span", { className: "tag" }, React.createElement(Icon, { name: "clock", size: 12 }), r.prepTime, "m"),
              r.meatDish
                ? React.createElement("span", { className: "tag" }, React.createElement(Icon, { name: "meat", size: 12 }))
                : React.createElement("span", { className: "tag", style: { background: "var(--sage-soft)", color: "var(--sage-ink)" } }, React.createElement(Icon, { name: "leaf", size: 12 })));
            const cardContent = React.createElement("div", { className: "reccard__content" },
              React.createElement("div", { className: "reccard__left" },
                React.createElement("div", { className: "reccard__title" }, r.title),
                React.createElement("div", { className: "reccard__meta" }, cardKcal, cardTags)),
              cardImg);
            return React.createElement("div", { key: r.id, className: "reccard", "data-c": primaryColor(r) },
              React.createElement("button", { className: "reccard__inner", onClick: () => setDetail(r) },
                cardBand, cardContent));
          })),
    detail && React.createElement(RecipeDetail, { recipe: detail, onClose: () => setDetail(null), toast }),
    filterOpen && React.createElement(Sheet, { eyebrow: "Recepten", eyebrowColor: "brand", title: "Filteren", onClose: () => setFilterOpen(false),
      foot: React.createElement(React.Fragment, null,
        React.createElement("button", { className: "btn btn--ghost", onClick: () => { setMeal("alle"); setSelCats([]); } }, "Wis filters"),
        React.createElement("button", { className: "btn btn--block", onClick: () => setFilterOpen(false) }, "Toon ", list.length, " ", list.length === 1 ? "recept" : "recepten")) },
      React.createElement("div", { className: "section-label" }, "Wanneer"),
      React.createElement("div", { className: "chiprow", style: { marginBottom: 18 } },
        MEALS.map(([k, l]) => React.createElement("button", { key: k, className: "chip", "data-active": meal === k ? 1 : 0, onClick: () => setMeal(k) }, l))),
      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 } },
        React.createElement("div", { className: "section-label", style: { marginBottom: 0 } }, "Soort"),
        React.createElement("span", { className: "field__hint" }, "Meerdere tegelijk mogelijk")),
      React.createElement("div", { className: "chiprow", style: { marginBottom: 4 } },
        React.createElement("button", { key: "alle", className: "chip", "data-active": selCats.length === 0 ? 1 : 0, onClick: () => toggleSoort("alle") }, "Alle"),
        CATS.slice(1).map(([k, l]) => React.createElement("button", { key: k, className: "chip chip--toggle", "data-active": selCats.includes(k) ? 1 : 0, onClick: () => toggleSoort(k) },
          selCats.includes(k) && React.createElement(Icon, { name: "check", size: 12 }), l)))),
    importing && React.createElement(ImportSheet, { onClose: () => setImporting(false), toast }),
    creating && React.createElement(CreateRecipeSheet, { onClose: () => setCreating(false), toast })
  );
}
window.RecipesScreen = RecipesScreen;
