/* =========================================================================
   MEAL PLANNER — Profile / diet targets
   ========================================================================= */

/* Accordion wrapper: collapsed header + expandable body */
function AccordionCard({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return React.createElement("div", { className: "profcard profcard--acc" + (open ? " profcard--open" : "") },
    React.createElement("button", { className: "profcard__toggle", onClick: () => setOpen((o) => !o) },
      React.createElement("div", { className: "profcard__head" },
        React.createElement(Icon, { name: icon, size: 22 }),
        React.createElement("h3", null, title)),
      React.createElement(Icon, { name: open ? "chevU" : "chevD", size: 18 })),
    open && React.createElement("div", { className: "profcard__body" }, children));
}

/* Configurable grocery shop order (drag or use the arrows) */
function ShopOrderCard({ toast }) {
  useStore();
  const seq = S.sel.aisleOrder();
  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);
  const isCustom = Array.isArray(S.getState().aisleOrder);

  function drop(targetKey) {
    if (!dragKey || dragKey === targetKey) { setDragKey(null); setOverKey(null); return; }
    const next = seq.filter((k) => k !== dragKey);
    const ti = next.indexOf(targetKey);
    next.splice(ti, 0, dragKey);
    S.actions.setAisleOrder(next);
    setDragKey(null); setOverKey(null);
  }

  return React.createElement(AccordionCard, { icon: "cart", title: "Winkelvolgorde" },
    React.createElement("div", { className: "field__hint", style: { marginBottom: 12 } }, "De volgorde waarin je boodschappenlijst de schappen toont — ingesteld op de looproute van jouw winkel. Sleep een schap of gebruik de pijltjes."),
    React.createElement("div", { className: "shoporder" },
      seq.map((key, i) => {
        const meta = S.sel.aisleMeta(key);
        return React.createElement("div", {
          key,
          className: "shoprow" + (dragKey === key ? " shoprow--drag" : "") + (overKey === key && dragKey && dragKey !== key ? " shoprow--over" : ""),
          draggable: true,
          onDragStart: () => setDragKey(key),
          onDragEnter: () => setOverKey(key),
          onDragOver: (e) => e.preventDefault(),
          onDrop: () => drop(key),
          onDragEnd: () => { setDragKey(null); setOverKey(null); },
        },
          React.createElement("span", { className: "shoprow__num" }, i + 1),
          React.createElement("span", { className: "shoprow__grip" }, React.createElement(Icon, { name: "grip", size: 16 })),
          React.createElement("span", { className: "shoprow__name" }, meta ? meta.name : key),
          React.createElement("span", { className: "shoprow__arrows" },
            React.createElement("button", { className: "shoprow__arrow", disabled: i === 0, title: "Omhoog", onClick: () => S.actions.moveAisle(key, -1) }, React.createElement(Icon, { name: "chevU", size: 16 })),
            React.createElement("button", { className: "shoprow__arrow", disabled: i === seq.length - 1, title: "Omlaag", onClick: () => S.actions.moveAisle(key, 1) }, React.createElement(Icon, { name: "chevD", size: 16 }))));
      })),
    isCustom && React.createElement("button", { className: "btn btn--ghost btn--sm", style: { marginTop: 12 }, onClick: () => { S.actions.resetAisleOrder(); toast("Standaardvolgorde hersteld"); } },
      React.createElement(Icon, { name: "swap", size: 15 }), "Standaardvolgorde herstellen")
  );
}
window.ShopOrderCard = ShopOrderCard;

function ChangePasswordCard({ toast }) {
  const [cur, setCur]   = useState("");
  const [nw1, setNw1]   = useState("");
  const [nw2, setNw2]   = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg]   = useState(null);  // {text, ok}

  async function submit() {
    if (!cur || !nw1 || !nw2) { setMsg({ text: "Vul alle velden in", ok: false }); return; }
    if (nw1 !== nw2) { setMsg({ text: "Nieuwe wachtwoorden komen niet overeen", ok: false }); return; }
    if (nw1.length < 8) { setMsg({ text: "Nieuw wachtwoord moet minimaal 8 tekens zijn", ok: false }); return; }
    setBusy(true); setMsg(null);
    try {
      await window.MPAPI.changePassword(cur, nw1);
      setCur(""); setNw1(""); setNw2("");
      setMsg({ text: "✓ Wachtwoord gewijzigd", ok: true });
      toast("Wachtwoord gewijzigd");
    } catch(e) { setMsg({ text: e.message, ok: false }); }
    finally { setBusy(false); }
  }

  const inp = (label, val, set, type="password") =>
    React.createElement("div", { className: "field", style: { marginBottom: 10 } },
      React.createElement("label", { className: "crf__lbl" }, label),
      React.createElement("input", { className: "input", type, value: val, onChange: e => { set(e.target.value); setMsg(null); }, onKeyDown: e => { if (e.key === "Enter") submit(); } }));

  return React.createElement(AccordionCard, { icon: "user", title: "Wachtwoord wijzigen" },
    inp("Huidig wachtwoord", cur, setCur),
    inp("Nieuw wachtwoord", nw1, setNw1),
    inp("Bevestig nieuw wachtwoord", nw2, setNw2),
    msg && React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: msg.ok ? "#2F7D4F" : "#C0392B", marginBottom: 10 } }, msg.text),
    React.createElement("button", { className: "btn btn--block", onClick: submit, disabled: busy },
      busy ? React.createElement(React.Fragment, null, React.createElement("span", { className: "spinner" }), "Opslaan…")
           : "Wachtwoord opslaan"));
}

function HouseholdCard({ toast }) {
  const state = useStore();
  const hs = state.householdSize || 1;

  async function save(n) {
    S.actions.setHouseholdSize(n);
    try {
      await window.MPAPI.updateProfile({ household_size: n });
    } catch(e) {
      toast("Kon niet opslaan: " + e.message);
    }
  }

  return React.createElement(AccordionCard, { icon: "cart", title: "Huishoudengrootte" },
    React.createElement("div", { className: "field__hint", style: { marginBottom: 16 } },
      "Voor hoeveel personen kook je? Dit bepaalt de hoeveelheden in de boodschappenlijst. Je persoonlijke voedingswaarden worden apart bijgehouden via de eetknop."),
    React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16 } },
      React.createElement(Stepper, { value: hs, min: 1, max: 10, onChange: save }),
      React.createElement("div", null,
        React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, hs === 1 ? "Alleen" : `${hs} personen`),
        React.createElement("div", { className: "field__hint" }, hs === 1 ? "Boodschappen voor 1 persoon" : `Boodschappen voor ${hs} personen`))));
}

function ProfileScreen({ toast }) {
  const state = useStore();
  const [confirm, confirmPortal] = useConfirm();
  const t = state.targets;
  const macroSum = t.carbsPct + t.proteinPct + t.fatPct;

  function setMacro(key, val) {
    S.actions.setTarget(key, val);
  }

  const MAC = [
    ["carbsPct", "Koolhydraten", "var(--macro-carb)"],
    ["proteinPct", "Eiwitten", "var(--macro-prot)"],
    ["fatPct", "Vetten", "var(--macro-fat)"],
  ];

  // gram targets at max kcal
  const gCarb = Math.round(t.maxKcal * t.carbsPct / 100 / 4);
  const gProt = Math.round(t.maxKcal * t.proteinPct / 100 / 4);
  const gFat  = Math.round(t.maxKcal * t.fatPct / 100 / 9);

  const u = window.MPAPI && window.MPAPI.user;

  return React.createElement("div", { className: "wrap screen-anim" },
    React.createElement("div", { className: "shead" },
      React.createElement("div", null,
        React.createElement("h1", { className: "shead__title" }, "Profiel"),
        React.createElement("div", { className: "shead__sub" }, "Je instellingen — tik een kaart om te openen"))),
    React.createElement("div", { className: "prof" },

      /* Gebruikersinfo + uitloggen (mobiel — desktop heeft sidebar) */
      u && React.createElement("div", { className: "profcard profcard--user" },
        React.createElement("div", { className: "profcard__userrow" },
          React.createElement("div", { className: "side__user-av" }, u.name[0].toUpperCase()),
          React.createElement("div", { style: { flex: 1 } },
            React.createElement("div", { style: { fontWeight: 700, fontSize: 15 } }, u.name),
            React.createElement("div", { className: "field__hint" }, u.email)),
          React.createElement("button", { className: "btn btn--ghost btn--sm", onClick: () => window._authLogout && window._authLogout() },
            "Uitloggen"))),

      /* Begin van de week */
      React.createElement(AccordionCard, { icon: "week", title: "Begin van de week" },
        React.createElement("div", { className: "field__hint", style: { marginBottom: 12 } }, "Bepaalt de eerste kolom in de weekplanner en hoe de boodschappen per week gebundeld worden."),
        React.createElement("div", { style: { display: "flex", gap: 7, flexWrap: "wrap" } },
          [[1, "Maandag"], [2, "Dinsdag"], [3, "Woensdag"], [4, "Donderdag"], [5, "Vrijdag"], [6, "Zaterdag"], [0, "Zondag"]].map(([d, label]) =>
            React.createElement("button", { key: d, className: "chip", "data-active": state.weekStartDow === d ? 1 : 0, onClick: () => { S.actions.setWeekStartDow(d); toast(`Week begint nu op ${label.toLowerCase()}`); } }, label)))),

      /* Huishoudengrootte */
      React.createElement(HouseholdCard, { toast }),

      /* Caloriedoel */
      React.createElement(AccordionCard, { icon: "flame", title: "Caloriedoel" },
        React.createElement("div", { className: "field__row", style: { marginBottom: 16 } },
          React.createElement("div", null,
            React.createElement("div", { className: "field__label" }, "Maximaal per dag"),
            React.createElement("div", { className: "field__hint" }, "Standaard 1900 kcal")),
          React.createElement("div", { className: "bigreadout" }, t.maxKcal.toLocaleString("nl-NL"), React.createElement("span", null, " kcal"))),
        React.createElement("input", { className: "slider", type: "range", min: 1200, max: 3000, step: 50, value: t.maxKcal, onChange: (e) => setMacro("maxKcal", Number(e.target.value)) }),
        React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--ink-3)", marginTop: 6 } },
          React.createElement("span", null, "1200"), React.createElement("span", null, "3000"))),

      /* Macroverdeling */
      React.createElement(AccordionCard, { icon: "today", title: "Macroverdeling" },
        React.createElement("div", { className: "macrobars" },
          MAC.map(([key, name, c]) => React.createElement("div", { key, className: "macroctl" },
            React.createElement("div", { className: "macroctl__name" }, React.createElement("span", { className: "sw", style: { background: c } }), name),
            React.createElement("input", { className: "slider", type: "range", min: 0, max: 100, step: 5, value: t[key], onChange: (e) => setMacro(key, Number(e.target.value)), style: { accentColor: c } }),
            React.createElement("div", { className: "macroctl__val" }, t[key], "%"))) ),
        React.createElement("div", { className: "macrosum", "data-bad": macroSum !== 100 ? 1 : 0, style: { marginTop: 16 } },
          React.createElement("span", null, macroSum === 100 ? "Verdeling klopt" : "Som moet 100% zijn"),
          React.createElement("b", null, macroSum, "%")),
        macroSum !== 100 && React.createElement("button", { className: "btn btn--soft btn--sm", style: { marginTop: 10 }, onClick: () => {
          const s = macroSum || 1;
          const c = Math.round(t.carbsPct / s * 100), p = Math.round(t.proteinPct / s * 100);
          S.actions.setMacros(c, p, 100 - c - p); toast("Verdeling rechtgetrokken");
        } }, "Normaliseer naar 100%"),
        React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 16 } },
          [["Koolh.", gCarb, "carb"], ["Eiwit", gProt, "prot"], ["Vet", gFat, "fat"]].map(([l, v, k]) =>
            React.createElement("div", { key: k, className: "rmacro", "data-k": k }, React.createElement("b", null, v, "g"), React.createElement("span", null, l, " /dag"))))),

      /* Voedingslimieten */
      React.createElement(AccordionCard, { icon: "meat", title: "Voedingslimieten" },
        React.createElement("div", { className: "field__hint", style: { marginBottom: 6 } }, "Stel per voedingsmiddel een maximum in per dag en per week. Zet op 0 voor geen limiet. Gerechten én snacks tellen mee."),
        React.createElement("div", { className: "limitgrid" },
          React.createElement("div", { className: "limithead" },
            React.createElement("span", null, "Voedingsmiddel"),
            React.createElement("span", null, "Per dag"),
            React.createElement("span", null, "Per week")),
          window.MP.FOOD_LIMITS.map((f) => {
            const perWeek = S.sel.foodCountWeek(f.key);
            const perDayMax = S.sel.foodDayMax(f.key);
            const dayLim = t[f.day] || 0, weekLim = t[f.week] || 0;
            const overDay = dayLim > 0 && perDayMax > dayLim;
            const overWeek = weekLim > 0 && perWeek > weekLim;
            return React.createElement("div", { key: f.key, className: "limitrow" },
              React.createElement("div", { className: "limitrow__l" },
                React.createElement("div", { className: "limitrow__name" }, React.createElement("span", { className: "dot", style: { background: `var(--${f.color})` } }), f.name),
                React.createElement("div", { className: "limitrow__hint" },
                  "Deze week: ", React.createElement("b", { "data-over": overWeek ? 1 : 0 }, perWeek, "×"),
                  " · piek/dag ", React.createElement("b", { "data-over": overDay ? 1 : 0 }, perDayMax, "×"))),
              React.createElement("div", { className: "limitctl" },
                React.createElement(Stepper, { value: dayLim, onChange: (v) => setMacro(f.day, v), min: 0, max: 10 })),
              React.createElement("div", { className: "limitctl" },
                React.createElement(Stepper, { value: weekLim, onChange: (v) => setMacro(f.week, v), min: 0, max: 21 })));
          })),
        React.createElement("div", { className: "field__hint", style: { marginTop: 12, display: "flex", gap: 7, alignItems: "flex-start" } },
          React.createElement(Icon, { name: "leaf", size: 14 }),
          React.createElement("span", null, "Fruitregel: bevat het ontbijt al fruit, dan blijft er die dag nog max. 1 fruitsnack over."))),

      /* Winkelvolgorde */
      React.createElement(ShopOrderCard, { toast }),

      /* Wachtwoord wijzigen */
      React.createElement(ChangePasswordCard, { toast }),

      /* Reset */
      React.createElement("div", { style: { display: "flex", gap: 10 } },
        React.createElement("button", { className: "btn btn--danger", onClick: async () => { if (await confirm("Alles terugzetten naar de standaardweek? Je planning en eigen recepten gaan verloren.", true)) { S.actions.reset(); toast("Hersteld"); } } },
          React.createElement(Icon, { name: "trash", size: 18 }), "Reset demo-data"))
    ),
    confirmPortal
  );
}
window.ProfileScreen = ProfileScreen;
