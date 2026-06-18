import { FLAGS } from "@/data/matches";
import { useFilterStore } from "@/store";

export default function QuickChips() {
  const team = useFilterStore((s) => s.team);
  const setTeam = useFilterStore((s) => s.setTeam);

  const hosts = ["USA", "Mexico", "Canada"];
  const contenders = ["Brazil", "Argentina", "France", "England", "Spain", "Germany", "Portugal", "Netherlands"];

  return (
    <section className="w-full max-w-[1180px] mx-auto px-6 mt-1">
      <div className="flex flex-col gap-2.5 border-t border-white/5 pt-3">
        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center text-xs">
          <span className="font-mono text-[#5E6C84] uppercase tracking-wider mr-2">Hosts</span>
          {hosts.map(h => (
            <button
              key={h}
              onClick={() => setTeam(team === h ? "" : h)}
              className={`flex items-center gap-1.5 border py-1.5 px-3.5 rounded-full transition-all duration-300 font-medium cursor-pointer ${team === h ? 'bg-[#1FB87A]/20 border-[#2DE89A] text-[#2DE89A]' : 'bg-[#111A2B] border-white/10 hover:border-[#1FB87A] text-white'}`}
            >
              <span className="text-base leading-none">{FLAGS[h]}</span>
              {h}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center text-xs mt-1">
          <span className="font-mono text-[#5E6C84] uppercase tracking-wider mr-2">Contenders</span>
          {contenders.map(c => (
            <button
              key={c}
              onClick={() => setTeam(team === c ? "" : c)}
              className={`flex items-center gap-1.5 border py-1.5 px-3.5 rounded-full transition-all duration-300 font-medium cursor-pointer ${team === c ? 'bg-[#1FB87A]/20 border-[#2DE89A] text-[#2DE89A]' : 'bg-[#111A2B] border-white/10 hover:border-[#1FB87A] text-white'}`}
            >
              <span className="text-base leading-none">{FLAGS[c]}</span>
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
