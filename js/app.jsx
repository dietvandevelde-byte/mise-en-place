/* =========================================================================
   MEAL PLANNER — App shell (one instance; mobile or desktop layout)
   ========================================================================= */
const TABS = [
  { key: "vandaag", name: "Vandaag", icon: "today" },
  { key: "week", name: "Week", icon: "week" },
  { key: "boodschappen", name: "Lijst", icon: "cart" },
  { key: "recepten", name: "Recepten", icon: "book" },
  { key: "profiel", name: "Profiel", icon: "user" },
];

function AppShell({ layout }) {
  const state = useStore();
  const [tab, setTab] = useState("vandaag");
  const [sheet, setSheet] = useState(null);        // {date, slot}
  const [snacksDate, setSnacksDate] = useState(null); // date for combined snacks editor
  const [share, setShare] = useState(null);        // 'week' | 'groceries'
  const [swapSource, setSwapSource] = useState(null);
  const [toastNode, toast] = useToast();
  const days = S.fmt.weekDates();

  const openSlot = useCallback((date, slot) => setSheet({ date, slot }), []);
  const openSnacks = useCallback((date) => setSnacksDate(date), []);
  const openShare = useCallback((kind) => setShare(kind), []);
  const swap = {
    source: swapSource,
    start: (date, slot) => { setSwapSource({ date, slot }); setTab("week"); },
    pick: (date, slot) => {
      if (swapSource && swapSource.date === date && swapSource.slot === slot) { setSwapSource(null); return; }
      S.actions.swap(swapSource.date, swapSource.slot, date, slot);
      toast("Gewisseld"); setSwapSource(null);
    },
    cancel: () => setSwapSource(null),
  };

  const gstats = S.sel.groceryStats();
  const remaining = gstats.total - gstats.done;

  let screen;
  if (tab === "vandaag") screen = React.createElement(TodayScreen, { layout, openSlot, openSnacks, toast });
  else if (tab === "week") screen = React.createElement(WeekScreen, { layout, openSlot, openSnacks, toast, swap, openShare });
  else if (tab === "boodschappen") screen = React.createElement(GroceriesScreen, { layout, toast, openShare });
  else if (tab === "recepten") screen = React.createElement(RecipesScreen, { toast });
  else if (tab === "profiel") screen = React.createElement(ProfileScreen, { toast });

  const brand = React.createElement("div", { className: "brand" },
    React.createElement("div", { className: "brand__mark" }, React.createElement(Icon, { name: "leaf", size: layout === "desktop" ? 22 : 18, fill: true })),
    React.createElement("div", null,
      React.createElement("div", { className: "brand__name" }, "Mise ", React.createElement("span", null, "en Place")),
      layout === "desktop" && React.createElement("div", { className: "brand__sub" }, "Weekmenu & boodschappen")));

  if (layout === "mobile") {
    return React.createElement("div", { className: "app app--mobile" },
      React.createElement("div", { className: "mtop" },
        brand,
        React.createElement("div", { className: "mtop__date" },
          React.createElement("b", null, cap(S.fmt.fmtDow(state.today)), " ", S.fmt.fmtDay(state.today)),
          React.createElement("span", null, S.fmt.fmtMon(state.today)))),
      React.createElement("div", { className: "main" }, React.createElement("div", { className: "screen" }, screen)),
      React.createElement("div", { className: "tabs" },
        TABS.map((tb) => React.createElement("button", { key: tb.key, className: "tab", "data-active": tab === tb.key ? 1 : 0, onClick: () => setTab(tb.key) },
          React.createElement(Icon, { name: tb.icon, size: 22, fill: tab === tb.key && tb.key === "vandaag" ? false : false }),
          React.createElement("span", null, tb.name)))),
      sheet && React.createElement(SlotSheet, { date: sheet.date, slot: sheet.slot, onClose: () => setSheet(null), onSwapStart: swap.start, toast }),
      snacksDate && React.createElement(window.SnacksDaySheet, { date: snacksDate, onClose: () => setSnacksDate(null), toast }),
      share && React.createElement(window.ShareSheet, { kind: share, onClose: () => setShare(null), toast }),
      toastNode
    );
  }

  // desktop
  return React.createElement("div", { className: "app app--desktop" },
    React.createElement("div", { className: "side" },
      React.createElement("div", { className: "side__brand" }, brand),
      React.createElement("div", { className: "side__nav" },
        TABS.map((tb) => React.createElement("button", { key: tb.key, className: "snav", "data-active": tab === tb.key ? 1 : 0, onClick: () => setTab(tb.key) },
          React.createElement(Icon, { name: tb.icon, size: 21 }),
          React.createElement("span", null, tb.name === "Lijst" ? "Boodschappen" : tb.name),
          tb.key === "boodschappen" && remaining > 0 && React.createElement("span", { className: "snav__badge" }, remaining)))),
      React.createElement("div", { className: "side__foot" },
        React.createElement("div", { className: "side__week" },
          React.createElement("div", { className: "side__week-eyebrow" }, "Deze week"),
          React.createElement("div", { className: "side__week-range" }, "za ", S.fmt.fmtDay(days[0]), " — vr ", S.fmt.fmtDay(days[6]), " ", S.fmt.fmtMon(days[6])),
          React.createElement("div", { className: "side__week-meta" }, "Plannen op vrijdag · boodschappen op zaterdag")))),
    React.createElement("div", { className: "main" }, React.createElement("div", { className: "screen" }, screen)),
    sheet && React.createElement(SlotSheet, { date: sheet.date, slot: sheet.slot, onClose: () => setSheet(null), onSwapStart: swap.start, toast }),
    snacksDate && React.createElement(window.SnacksDaySheet, { date: snacksDate, onClose: () => setSnacksDate(null), toast }),
    share && React.createElement(window.ShareSheet, { kind: share, onClose: () => setShare(null), toast }),
    toastNode
  );
}
window.AppShell = AppShell;

/* Error boundary — never show a blank screen; surface the error + a reload. */
class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err, info) { console.error("Mise en Place — render error:", err, info); }
  render() {
    if (this.state.err) {
      return React.createElement("div", { className: "errbound" },
        React.createElement("div", { className: "errbound__card" },
          React.createElement("div", { className: "errbound__icon" }, React.createElement(Icon, { name: "leaf", size: 24, fill: true })),
          React.createElement("h2", null, "Even niet geladen"),
          React.createElement("p", null, "Er ging iets mis bij het tonen van dit scherm. Herlaad de pagina om verder te gaan."),
          React.createElement("button", { className: "btn btn--block", onClick: () => { try { location.reload(); } catch (e) {} } },
            React.createElement(Icon, { name: "swap", size: 16 }), "Herladen"),
          React.createElement("button", { className: "errbound__reset", onClick: () => { try { S.actions.reset(); this.setState({ err: null }); } catch (e) { try { location.reload(); } catch (e2) {} } } }, "Demo-data herstellen")));
    }
    return this.props.children;
  }
}
window.AppErrorBoundary = AppErrorBoundary;
window.mountMP = function (el, layout) {
  ReactDOM.createRoot(el).render(React.createElement(AppErrorBoundary, null, React.createElement(AppShell, { layout })));
};
