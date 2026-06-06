/* =========================================================================
   MEAL PLANNER — seed data + metadata
   Plain JS, attached to window.MP. Dutch content.
   ========================================================================= */
(function () {
  "use strict";

  // ---- Meal slot types (6 per day) — each coded with a palette color ----
  // colors reference design-system category vars: kracht/cardio/stab/yoga/mobi/reva/adem/neuro
  const SLOTS = [
    { i: 0, key: "ontbijt",     name: "Ontbijt",      short: "Ontbijt", color: "honey"  },
    { i: 1, key: "snack1",      name: "Snack",        short: "Snack 1", color: "sage"   },
    { i: 2, key: "lunch",       name: "Lunch",        short: "Lunch",   color: "terra"  },
    { i: 3, key: "snack2",      name: "Snack",        short: "Snack 2", color: "teal"   },
    { i: 4, key: "diner",       name: "Diner",        short: "Diner",   color: "berry"  },
    { i: 5, key: "avondsnack",  name: "Avondsnack",   short: "Avond",   color: "indigo" },
  ];

  // ---- Grocery aisles (default order = AH Kuurne walking route) ----
  const AISLES = [
    { key: "Groenten",      name: "Groenten",            order: 1,  color: "sage" },
    { key: "Fruit",         name: "Fruit",               order: 2,  color: "rose" },
    { key: "Vlees",         name: "Vlees & Vis",         order: 3,  color: "wine" },
    { key: "Kaas",          name: "Kaas",                order: 4,  color: "mustard" },
    { key: "Brood",         name: "Brood & Bakkerij",    order: 5,  color: "copper" },
    { key: "Voorraad",      name: "Droge voeding",       order: 6,  color: "olive" },
    { key: "Zuivel",        name: "Zuivel & Eieren",     order: 7,  color: "honey" },
    { key: "Dranken",       name: "Dranken",             order: 8,  color: "teal" },
    { key: "Diepvries",     name: "Diepvries",           order: 9,  color: "indigo" },
    { key: "Huishouden",    name: "Huishouden",          order: 10, color: "plum" },
    { key: "Overige",       name: "Overige",             order: 11, color: "brand" },
  ];

  // ---- Recipes ----
  // kcal/carbs/protein/fat are PER PORTION (base portions). suits = slot indices.
  const R = [];
  let _id = 0;
  function rec(o) { o.id = ++_id; R.push(o); return o; }

  // ---------- ONTBIJT ----------
  rec({
    title: "Havermout met banaan & noten", source: "Eigen", portions: 1, prepTime: 8, meatDish: false,
    seasons: ["herfst", "winter"], suits: [0],
    kcal: 340, carbs: 50, protein: 11, fat: 10,
    instructions: "Kook de havervlokken met melk tot een romige pap. Roer de banaan erdoor en bestrooi met walnoten en kaneel.",
    ingredients: [
      { name: "havervlokken", qty: 50, unit: "g", cat: "Voorraad" },
      { name: "halfvolle melk", qty: 200, unit: "ml", cat: "Zuivel" },
      { name: "banaan", qty: 1, unit: "stuk", cat: "Fruit" },
      { name: "walnoten", qty: 15, unit: "g", cat: "Voorraad" },
      { name: "kaneel", qty: 1, unit: "snufje", cat: "Voorraad" },
    ],
  });
  rec({
    title: "Griekse yoghurt met granola & bessen", source: "Eigen", portions: 1, prepTime: 5, meatDish: false,
    seasons: ["lente", "zomer"], suits: [0, 3],
    kcal: 290, carbs: 34, protein: 16, fat: 9,
    instructions: "Schep de yoghurt in een kom. Strooi de granola eroverheen en werk af met verse bessen en een lepel honing.",
    ingredients: [
      { name: "Griekse yoghurt", qty: 150, unit: "g", cat: "Zuivel" },
      { name: "granola", qty: 40, unit: "g", cat: "Voorraad" },
      { name: "blauwe bessen", qty: 60, unit: "g", cat: "Fruit" },
      { name: "honing", qty: 1, unit: "el", cat: "Voorraad" },
    ],
  });
  rec({
    title: "Volkoren toast met avocado & ei", source: "Eigen", portions: 1, prepTime: 10, meatDish: false,
    seasons: ["lente", "zomer", "herfst", "winter"], suits: [0, 2],
    kcal: 370, carbs: 30, protein: 16, fat: 21,
    instructions: "Rooster het brood. Prak de avocado met citroen, zout en peper. Beleg het brood en leg er een gekookt ei op.",
    ingredients: [
      { name: "volkoren brood", qty: 2, unit: "sneden", cat: "Brood" },
      { name: "avocado", qty: 0.5, unit: "stuk", cat: "Groenten" },
      { name: "ei", qty: 1, unit: "stuk", cat: "Zuivel" },
      { name: "citroen", qty: 0.25, unit: "stuk", cat: "Fruit" },
    ],
  });

  // ---------- LUNCH ----------
  rec({
    title: "Bloemkoolsoep", source: "https://recept.nl/bloemkoolsoep", portions: 4, prepTime: 30, meatDish: false,
    seasons: ["herfst", "winter"], suits: [2, 4],
    kcal: 210, carbs: 14, protein: 7, fat: 13,
    instructions: "Fruit ui en knoflook. Voeg bloemkoolroosjes en bouillon toe, kook 20 min. Pureer glad, roer de room erdoor en breng op smaak.",
    ingredients: [
      { name: "bloemkool", qty: 1, unit: "stuk", cat: "Groenten" },
      { name: "ui", qty: 1, unit: "stuk", cat: "Groenten" },
      { name: "knoflook", qty: 2, unit: "teen", cat: "Groenten" },
      { name: "groentebouillon", qty: 1, unit: "l", cat: "Voorraad" },
      { name: "kookroom", qty: 200, unit: "ml", cat: "Zuivel" },
    ],
  });
  rec({
    title: "Quinoasalade met feta & granaatappel", source: "Eigen", portions: 2, prepTime: 20, meatDish: false,
    seasons: ["lente", "zomer"], suits: [2],
    kcal: 430, carbs: 46, protein: 16, fat: 20,
    instructions: "Kook de quinoa en laat afkoelen. Meng met komkommer, granaatappelpitjes, verkruimelde feta en munt. Besprenkel met olijfolie en citroen.",
    ingredients: [
      { name: "quinoa", qty: 150, unit: "g", cat: "Voorraad" },
      { name: "feta", qty: 100, unit: "g", cat: "Kaas" },
      { name: "granaatappel", qty: 1, unit: "stuk", cat: "Fruit" },
      { name: "komkommer", qty: 0.5, unit: "stuk", cat: "Groenten" },
      { name: "verse munt", qty: 1, unit: "bosje", cat: "Groenten" },
      { name: "olijfolie", qty: 2, unit: "el", cat: "Voorraad" },
    ],
  });
  rec({
    title: "Volkoren wrap met kip & groenten", source: "Eigen", portions: 2, prepTime: 15, meatDish: true,
    seasons: ["lente", "zomer", "herfst", "winter"], suits: [2, 4],
    kcal: 460, carbs: 42, protein: 34, fat: 16,
    instructions: "Bak de kipreepjes gaar. Besmeer de wraps met yoghurtsaus, vul met sla, paprika, kip en rol op.",
    ingredients: [
      { name: "volkoren wraps", qty: 2, unit: "stuk", cat: "Brood" },
      { name: "kipfilet", qty: 200, unit: "g", cat: "Vlees" },
      { name: "paprika", qty: 1, unit: "stuk", cat: "Groenten" },
      { name: "sla", qty: 0.5, unit: "krop", cat: "Groenten" },
      { name: "Griekse yoghurt", qty: 50, unit: "g", cat: "Zuivel" },
    ],
  });
  rec({
    title: "Linzensoep met brood", source: "Eigen", portions: 4, prepTime: 35, meatDish: false,
    seasons: ["herfst", "winter"], suits: [2, 4],
    kcal: 330, carbs: 44, protein: 18, fat: 8,
    instructions: "Fruit ui, wortel en knoflook. Voeg linzen, tomatenblokjes en bouillon toe. Laat 25 min koken. Serveer met brood.",
    ingredients: [
      { name: "rode linzen", qty: 250, unit: "g", cat: "Voorraad" },
      { name: "wortel", qty: 2, unit: "stuk", cat: "Groenten" },
      { name: "ui", qty: 1, unit: "stuk", cat: "Groenten" },
      { name: "knoflook", qty: 2, unit: "teen", cat: "Groenten" },
      { name: "tomatenblokjes", qty: 400, unit: "g", cat: "Voorraad" },
      { name: "groentebouillon", qty: 1, unit: "l", cat: "Voorraad" },
    ],
  });

  // ---------- DINER ----------
  rec({
    title: "Zalmfilet met geroosterde groenten", source: "Eigen", portions: 2, prepTime: 30, meatDish: true,
    seasons: ["lente", "herfst"], suits: [4],
    kcal: 520, carbs: 28, protein: 38, fat: 28,
    instructions: "Verwarm de oven op 200°C. Rooster courgette, paprika en zoete aardappel 25 min. Bak de zalm 12 min mee. Werk af met citroen.",
    ingredients: [
      { name: "zalmfilet", qty: 2, unit: "stuk", cat: "Vlees" },
      { name: "courgette", qty: 1, unit: "stuk", cat: "Groenten" },
      { name: "paprika", qty: 1, unit: "stuk", cat: "Groenten" },
      { name: "zoete aardappel", qty: 1, unit: "stuk", cat: "Groenten" },
      { name: "olijfolie", qty: 2, unit: "el", cat: "Voorraad" },
      { name: "citroen", qty: 0.5, unit: "stuk", cat: "Fruit" },
    ],
  });
  rec({
    title: "Spaghetti bolognese", source: "Eigen", portions: 4, prepTime: 40, meatDish: true,
    seasons: ["herfst", "winter"], suits: [4],
    kcal: 620, carbs: 68, protein: 32, fat: 22,
    instructions: "Bak het gehakt rul. Voeg ui, knoflook, wortel en tomatenblokjes toe en laat 25 min pruttelen. Kook de spaghetti en serveer met de saus.",
    ingredients: [
      { name: "spaghetti", qty: 350, unit: "g", cat: "Voorraad" },
      { name: "rundergehakt", qty: 400, unit: "g", cat: "Vlees" },
      { name: "tomatenblokjes", qty: 400, unit: "g", cat: "Voorraad" },
      { name: "ui", qty: 1, unit: "stuk", cat: "Groenten" },
      { name: "knoflook", qty: 2, unit: "teen", cat: "Groenten" },
      { name: "wortel", qty: 1, unit: "stuk", cat: "Groenten" },
    ],
  });
  rec({
    title: "Kikkererwtencurry met rijst", source: "Eigen", portions: 4, prepTime: 30, meatDish: false,
    seasons: ["herfst", "winter"], suits: [4],
    kcal: 540, carbs: 78, protein: 18, fat: 16,
    instructions: "Fruit ui, knoflook en gember. Voeg currypasta, kikkererwten en kokosmelk toe. Laat 20 min sudderen. Serveer met rijst.",
    ingredients: [
      { name: "kikkererwten", qty: 800, unit: "g", cat: "Voorraad" },
      { name: "kokosmelk", qty: 400, unit: "ml", cat: "Voorraad" },
      { name: "basmatirijst", qty: 300, unit: "g", cat: "Voorraad" },
      { name: "ui", qty: 1, unit: "stuk", cat: "Groenten" },
      { name: "knoflook", qty: 2, unit: "teen", cat: "Groenten" },
      { name: "currypasta", qty: 2, unit: "el", cat: "Voorraad" },
    ],
  });
  rec({
    title: "Roerbak tofu met noedels", source: "Eigen", portions: 2, prepTime: 25, meatDish: false,
    seasons: ["lente", "zomer"], suits: [4],
    kcal: 480, carbs: 56, protein: 24, fat: 18,
    instructions: "Bak de tofu goudbruin. Roerbak de groenten kort. Voeg noedels, sojasaus en sesam toe en bak alles snel door.",
    ingredients: [
      { name: "tofu", qty: 250, unit: "g", cat: "Zuivel" },
      { name: "eiernoedels", qty: 200, unit: "g", cat: "Voorraad" },
      { name: "roerbakgroenten", qty: 400, unit: "g", cat: "Diepvries" },
      { name: "sojasaus", qty: 3, unit: "el", cat: "Voorraad" },
      { name: "sesamzaad", qty: 1, unit: "el", cat: "Voorraad" },
    ],
  });
  rec({
    title: "Gehaktballetjes met puree & boontjes", source: "Eigen", portions: 4, prepTime: 45, meatDish: true,
    seasons: ["herfst", "winter"], suits: [4],
    kcal: 640, carbs: 52, protein: 34, fat: 30,
    instructions: "Draai balletjes van het gehakt en bak ze rondom bruin. Kook de aardappels en stamp tot puree met melk en boter. Kook de boontjes beetgaar.",
    ingredients: [
      { name: "rundergehakt", qty: 400, unit: "g", cat: "Vlees" },
      { name: "aardappels", qty: 800, unit: "g", cat: "Groenten" },
      { name: "sperziebonen", qty: 400, unit: "g", cat: "Groenten" },
      { name: "halfvolle melk", qty: 100, unit: "ml", cat: "Zuivel" },
      { name: "roomboter", qty: 25, unit: "g", cat: "Zuivel" },
    ],
  });

  // ---------- SNACKS ----------
  rec({
    title: "Appel met pindakaas", source: "Eigen", portions: 1, prepTime: 3, meatDish: false,
    seasons: ["herfst", "winter"], suits: [1, 3, 5],
    kcal: 200, carbs: 24, protein: 6, fat: 10,
    instructions: "Snijd de appel in partjes en serveer met een lepel pindakaas om in te dippen.",
    ingredients: [
      { name: "appel", qty: 1, unit: "stuk", cat: "Fruit" },
      { name: "pindakaas", qty: 1, unit: "el", cat: "Voorraad" },
    ],
  });
  rec({
    title: "Magere kwark met honing", source: "Eigen", portions: 1, prepTime: 2, meatDish: false,
    seasons: ["lente", "zomer", "herfst", "winter"], suits: [1, 3, 5],
    kcal: 150, carbs: 14, protein: 18, fat: 2,
    instructions: "Roer een lepel honing door de kwark en bestrooi eventueel met kaneel.",
    ingredients: [
      { name: "magere kwark", qty: 200, unit: "g", cat: "Zuivel" },
      { name: "honing", qty: 1, unit: "el", cat: "Voorraad" },
    ],
  });
  rec({
    title: "Handje amandelen", source: "Eigen", portions: 1, prepTime: 1, meatDish: false,
    seasons: ["lente", "zomer", "herfst", "winter"], suits: [1, 3, 5],
    kcal: 170, carbs: 6, protein: 6, fat: 15,
    instructions: "Neem een handje ongezouten amandelen.",
    ingredients: [
      { name: "amandelen", qty: 30, unit: "g", cat: "Voorraad" },
    ],
  });
  rec({
    title: "Wortel & hummus", source: "Eigen", portions: 1, prepTime: 4, meatDish: false,
    seasons: ["lente", "zomer", "herfst", "winter"], suits: [1, 3],
    kcal: 140, carbs: 16, protein: 5, fat: 7,
    instructions: "Snijd de wortel in reepjes en dip in de hummus.",
    ingredients: [
      { name: "wortel", qty: 2, unit: "stuk", cat: "Groenten" },
      { name: "hummus", qty: 50, unit: "g", cat: "Zuivel" },
    ],
  });
  rec({
    title: "Pure chocolade", source: "Eigen", portions: 1, prepTime: 1, meatDish: false,
    seasons: ["herfst", "winter"], suits: [5],
    kcal: 110, carbs: 9, protein: 2, fat: 8,
    instructions: "Geniet van twee blokjes pure chocolade.",
    ingredients: [
      { name: "pure chocolade", qty: 20, unit: "g", cat: "Voorraad" },
    ],
  });

  // ---------- FRUIT (als snack — hoeveelheid per portie volgens dieetkaart) ----------
  // Each fruit = ONE piece of fruit. Amount is fixed by the column it came from.
  function frec(title, serving, kcal, qty, unit) {
    rec({
      title, source: "Fruit", portions: 1, prepTime: 1, meatDish: false,
      seasons: ["lente", "zomer", "herfst", "winter"], suits: [1, 3, 5],
      kcal, carbs: Math.round(kcal * 0.92 / 4), protein: 1, fat: 0,
      instructions: `Eén portie fruit: ${serving}. Tip: geen gedroogd fruit en geen fruit samen met groenten (bv. in salade).`,
      ingredients: [{ name: title.toLowerCase(), qty, unit, cat: "Fruit" }],
      fruit: true, serving, foods: ["fruit"],
    });
  }
  // 150 g per portie
  frec("Aardbeien", "150 g", 48, 150, "g");
  frec("Ananas", "150 g", 75, 150, "g");
  frec("Bessen (alle soorten)", "150 g", 65, 150, "g");
  frec("Bramen", "150 g", 65, 150, "g");
  frec("Frambozen", "150 g", 78, 150, "g");
  frec("Kersen / krieken", "150 g", 95, 150, "g");
  frec("Kiwibes", "150 g", 90, 150, "g");
  frec("Mango", "150 g", 90, 150, "g");
  frec("Meloen", "150 g", 50, 150, "g");
  frec("Papaja", "150 g", 65, 150, "g");
  frec("Pruim", "150 g", 70, 150, "g");
  frec("Rabarber", "150 g", 30, 150, "g");
  frec("Veenbessen", "150 g", 70, 150, "g");
  // 1 stuk per portie
  frec("Abrikoos", "1 stuk", 17, 1, "stuk");
  frec("Appel (kleine)", "1 stuk", 52, 1, "stuk");
  frec("Cactusvijg", "1 stuk", 42, 1, "stuk");
  frec("Citroen / limoen", "1 stuk", 17, 1, "stuk");
  frec("Clementine", "1 stuk", 35, 1, "stuk");
  frec("Kiwi", "1 stuk", 42, 1, "stuk");
  frec("Mandarijn", "1 stuk", 40, 1, "stuk");
  frec("Mandora", "1 stuk", 45, 1, "stuk");
  frec("Mineola", "1 stuk", 45, 1, "stuk");
  frec("Nectarine", "1 stuk", 62, 1, "stuk");
  frec("Peer (kleine)", "1 stuk", 57, 1, "stuk");
  frec("Perzik", "1 stuk", 58, 1, "stuk");
  frec("Pomelo (kleine)", "1 stuk", 70, 1, "stuk");
  frec("Sinaasappel (kleine)", "1 stuk", 45, 1, "stuk");
  // halve
  frec("Banaan (halve)", "½ stuk", 53, 0.5, "stuk");

  // ---------- ZUIVEL & ALTERNATIEVEN (label: ontbijt of snack) ----------
  // suits [0,1,3,5] = ontbijt + alle snackmomenten. Hoeveelheid volgens dieetkaart.
  function zrec(title, serving, kcal, protein, carbs, fat, qty, unit, opts) {
    opts = opts || {};
    rec({
      title, source: "Zuivel", portions: 1, prepTime: 1, meatDish: false,
      seasons: ["lente", "zomer", "herfst", "winter"], suits: [0, 1, 3, 5],
      kcal, protein, carbs, fat,
      instructions: `Eén portie: ${serving}.${opts.rule ? " " + opts.rule : ""}`,
      ingredients: [{ name: title.toLowerCase(), qty, unit, cat: opts.cat || "Zuivel" }],
      dairy: true, serving, foods: ["zuivel"], dairyAlt: !!opts.alt, dairyRule: opts.rule || null,
    });
  }
  // Zuivel (niet bij lactose-intolerantie)
  zrec("Geiten- of schapenyoghurt", "200 ml", 122, 7, 9, 7, 200, "ml");
  zrec("Griekse yoghurt 0%", "170 ml", 100, 17, 6, 0, 170, "ml");
  zrec("Cottage cheese", "100 g", 98, 11, 3, 4, 100, "g", { cat: "Kaas" });
  zrec("Ricotta", "100 g", 150, 9, 3, 11, 100, "g", { cat: "Kaas" });
  zrec("Koemelkkaas (mager)", "60 g", 150, 15, 0, 12, 60, "g", { rule: "Max. 20 g vet en 3 g suiker op 100 g. Kaas: max. 1× per dag.", cat: "Kaas" });
  zrec("Geiten-, schapen- of buffelkaas", "60 g", 200, 13, 0, 17, 60, "g", { rule: "Max. 30 g vet op 100 g. Kaas: max. 1× per dag.", cat: "Kaas" });
  // Alternatief voor zuivel (plantaardig — telt mee als zuivelportie)
  zrec("Sojayoghurt", "200 ml", 90, 8, 6, 4, 200, "ml", { rule: "Max. 0,3 g suiker.", alt: true });
  zrec("Sojamelk", "200 ml", 66, 7, 2, 4, 200, "ml", { rule: "Max. 0,3 g suiker.", alt: true });
  zrec("Amandelmelk", "200 ml", 26, 1, 1, 2, 200, "ml", { rule: "Max. 0,3 g suiker.", alt: true });
  zrec("Hazelnootmelk", "200 ml", 60, 1, 3, 5, 200, "ml", { rule: "Max. 0,3 g suiker.", alt: true });
  zrec("Cocosmelk (drink)", "200 ml", 40, 0, 2, 4, 200, "ml", { rule: "Max. 0,3 g suiker.", alt: true });
  zrec("Cocosyoghurt", "200 ml", 140, 2, 6, 12, 200, "ml", { alt: true });
  zrec("Kefir", "200 ml", 80, 7, 8, 3, 200, "ml", { rule: "Alleen zelfgemaakt.", alt: true });
  zrec("Plantaardige kaas", "60 g", 200, 3, 2, 20, 60, "g", { rule: "Max. 30 g vet op 100 g. Mag 2× per dag.", alt: true, cat: "Kaas" });

  // ---- expose ----
  window.MP = window.MP || {};
  window.MP.SLOTS = SLOTS;
  // Main meal lanes (snacks are handled separately as a flexible list)
  window.MP.MEALS = [SLOTS[0], SLOTS[2], SLOTS[4]];
  window.MP.SNACK_META = { key: "snacks", name: "Snacks", short: "Snacks", color: "sage" };
  window.MP.isSnackRecipe = (r) => !!(r && r.suits && r.suits.some((s) => [1, 3, 5].includes(s)));
  window.MP.fruitSnacks = () => R.filter((r) => r.fruit);
  window.MP.dairySnacks = () => R.filter((r) => r.dairy);
  // recipe categories for the Recepten filter (derived in store.recipeCategories; users can also tag their own)
  window.MP.RECIPE_CATS = [
    { key: "ontbijt", name: "Ontbijt", color: "honey" },
    { key: "hapje", name: "Apero", color: "berry" },
    { key: "soep", name: "Soep", color: "terra" },
    { key: "voorgerecht", name: "Voorgerecht", color: "indigo" },
    { key: "vlees", name: "Vlees", color: "wine" },
    { key: "vis", name: "Vis", color: "teal" },
    { key: "kaas", name: "Kaas", color: "mustard" },
    { key: "vegetarisch", name: "Veggy", color: "sage" },
    { key: "bijgerecht", name: "Bijgerecht", color: "olive" },
    { key: "dessert", name: "Dessert", color: "plum" },
    { key: "tussendoortje", name: "Tussendoortje", color: "rose" },
    { key: "bbq", name: "BBQ", color: "charcoal" },
    { key: "wok", name: "Wok", color: "jade" },
    { key: "stoofpotje", name: "Stoofpotje", color: "copper" },
    { key: "tajine", name: "Tajine", color: "aubergine" },
    { key: "ovenschotel", name: "Ovenschotel", color: "terra" },
    { key: "airfryer", name: "Airfryer", color: "charcoal" },
    { key: "slaatje", name: "Slaatje", color: "jade" },
  ];
  // when a recipe has several soorten, the first match here decides its card color + label
  window.MP.CAT_PRIORITY = ["tussendoortje", "dessert", "ontbijt", "soep", "slaatje", "voorgerecht", "hapje", "bijgerecht", "ovenschotel", "airfryer", "bbq", "wok", "stoofpotje", "tajine", "vis", "vlees", "kaas", "vegetarisch"];
  // Configurable food limits (per day & per week). key matches the food tag.
  window.MP.FOOD_LIMITS = [
    { key: "vlees",     name: "Vlees (rood)",  color: "berry",  day: "maxMeatPerDay",    week: "maxMeatPerWeek" },
    { key: "vis",       name: "Vis",           color: "teal",   day: "maxFishPerDay",    week: "maxFishPerWeek" },
    { key: "gevogelte", name: "Gevogelte",     color: "terra",  day: "maxPoultryPerDay", week: "maxPoultryPerWeek" },
    { key: "zuivel",    name: "Zuivel",        color: "honey",  day: "maxDairyPerDay",   week: "maxDairyPerWeek" },
    { key: "eieren",    name: "Eieren",        color: "indigo", day: "maxEggsPerDay",    week: "maxEggsPerWeek" },
    { key: "fruit",     name: "Fruit",         color: "rose",   day: "maxFruitPerDay",   week: "maxFruitPerWeek" },
  ];
  window.MP.AISLES = AISLES;
  window.MP.RECIPES = R;
  // non-recipe planning options for a meal moment
  window.MP.STATUSES = [
    { key: "uit_eten",  name: "Uit eten",      icon: "dineout" },
    { key: "geen",      name: "Geen maaltijd", icon: "ban" },
    { key: "afwachten", name: "Afwachten",     icon: "clock" },
    { key: "restje",    name: "Restje",        icon: "copy" },
  ];
  window.MP.statusByKey = (k) => window.MP.STATUSES.find((s) => s.key === k) || null;
})();
