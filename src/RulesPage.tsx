export const pointsTemplate = {
  goals: {name: "Mål", st: 10, mf: 6, df: 3, gk: 0},
  assists: {name: 'Assist', st: 9, mf: 6, df: 4, gk: 0},
  yellowCard: {name: 'Gult kort', st: -5, mf: -5, df: -2, gk: -5 },
  redCard: {name: 'Rött kort', st: -10, mf: -10, df: -5, gk: -10 },
  played: {name: 'Närvaro', st: 1, mf: 1, df: 1, gk: 1 }
}

export const pricerTemplate = {
  win: { name: "Vinst", diff: 1 },
  loss: { name: "Förlust", diff: -1 },
  cleanSheet: { name: "Hållen nolla", diff: 1 },
  goal: { name: "Mål", diff: 2 },
  assist: { name: "Assist", diff: 1 },
  absent: { name: "Ej medverkande", diff: -2 },
  yellowCard: { name: "Gult kort", diff: -2},
  redCard: { name: "Rött kort", diff: -4},
};

const RulesPage = () => {  
  return (
    <div className="min-h-screen bg-[#101010] text-white p-4 md:p-12 font-sans pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10 border-b border-[#39ff14]/20 pb-6 text-center md:text-left">
          <h1 className="text-4xl font-black italic tracking-tighter text-[#39ff14] uppercase mb-2">
            Regler & Poäng
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Systemet är viktat för att göra varje position relevant. En stabil defensiv kan vara lika värdefull som en vass offensiv.
          </p>
        </header>

        {/* Poängtabell */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 italic uppercase">
            <span className="w-2 h-6 bg-[#39ff14]">Poängfördelning</span>
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#1a1a1a]">
            <table className="w-full text-left border-collapse" style={{ textAlign: "left" }}>
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                  <th className="p-4">Händelse</th>
                  <th className="p-4 text-[#39ff14]">ST</th>
                  <th className="p-4 text-[#39ff14]">MF</th>
                  <th className="p-4 text-[#39ff14]">DF</th>
                  <th className="p-4 text-[#39ff14]">GK</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {Object.values(pointsTemplate).map((event, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-sans text-gray-300" style={{ paddingRight: 10 }}>{event.name}</td>
                    <td className="p-4 text-white font-bold">{event.st}</td>
                    <td className="p-4 text-white font-bold">{event.mf}</td>
                    <td className="p-4 text-white font-bold">{event.df}</td>
                    <td className="p-4 text-white font-bold">{event.gk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <hr />
        {/* Poängtabell */}
        <section className="mb-12 mt-12" style={{marginBottom: "4rem"}}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 italic uppercase">
            <span className="w-2 h-6 bg-[#39ff14]">Truppvärdering ($)</span>
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#1a1a1a]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500">
                  <th className="p-4">Händelse</th>
                  <th className="p-4 text-[#39ff14]">Prisskillnad</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {Object.values(pricerTemplate).map((row, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors" style={{ textAlign: "left" }}>
                    <td className="p-4 font-sans text-gray-300" style={{ paddingRight: 10 }}>{row.name}</td>
                    <td className="p-4 text-white font-bold">{row.diff >= 0 ? `+`: ""}{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detaljerade förklaringar */}
        {/* <section className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
            <h3 className="text-[#39ff14] font-black italic mb-3 uppercase">Offensiv (ST/MF)</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Anfallare får sina största poäng via mål. Mittfältare belönas extra för sin kreativitet (assists) och får även mer poäng för mål än renodlade anfallare då de ofta startar längre ner i banan.
            </p>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
            <h3 className="text-[#39ff14] font-black italic mb-3 uppercase">Defensiv (DF/GK)</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Försvarare och målvakter lever på "Clean Sheets". Ett insläppt mål efter 90 minuter kan vara skillnaden mellan succé och fiasko. Bonuspoäng delas ut om de mot förmodan kliver fram och nätar.
            </p>
          </div>
        </section> */}

        {/* Transfer Lock Info */}
        {/* <div className="bg-gradient-to-r from-[#1a1a1a] to-[#142014] border border-[#39ff14]/30 p-8 rounded-[2rem]">
          <h2 className="text-xl font-bold mb-4 italic uppercase flex items-center gap-3 text-[#39ff14]">
             Transferfönster & Revidering
          </h2>
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex gap-4">
              <span className="font-bold text-[#39ff14]">01.</span>
              <span><strong>Fönstret stänger:</strong> Truppen låses kl 00:00 på matchdagen. Inga byten kan göras förrän poängen är satta.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-[#39ff14]">02.</span>
              <span><strong>Poängsättning:</strong> Administrationen reviderar matchen manuellt under matchdagen. Poängen baseras på officiell matchrapport.</span>
            </li>
            <li className="flex gap-4">
              <span className="font-bold text-[#39ff14]">03.</span>
              <span><strong>Fönstret öppnar:</strong> När poängen är fastställda och matchen markeras som "Spelad" i systemet öppnas fönstret för nya transfers inför nästa runda.</span>
            </li>
          </ul>
        </div> */}

        {/* <footer className="mt-16 text-center">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.3em]">
            Unatletico Madrid Fantasy Engine v1.0
          </p>
        </footer> */}
      </div>
    </div>
  );
};

export default RulesPage;