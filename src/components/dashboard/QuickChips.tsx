import { useState } from "react";
import { FLAGS } from "@/data/matches";
import { useFilterStore } from "@/store";
import { useSignals } from "@preact/signals-react/runtime";
import { favoritesSignal, toggleFavorite, clearFavorites } from "@/store/favoritesSignal";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function QuickChips() {
  useSignals();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const team = useFilterStore((s) => s.team);
  const setTeam = useFilterStore((s) => s.setTeam);

  const hosts = ["USA", "Mexico", "Canada"];
  const contenders = ["Brazil", "Argentina", "France", "England", "Spain", "Germany", "Portugal", "Netherlands"];

  return (
    <section className="w-full max-w-[1180px] mx-auto px-6 mt-1">
      <div className="flex flex-col gap-2.5 border-t border-white/5 pt-4">
        {/* Favorites Row (always visible so users can add to it) */}
        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center text-xs pb-1">
          <span className="font-mono text-rose-400 uppercase tracking-[0.12em] mr-2 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart text-rose-400"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            Favorites
          </span>
          
          {favoritesSignal.value.map(f => (
            <button
              key={f}
              onClick={() => setTeam(team === f ? "" : f)}
              className={`flex items-center gap-1.5 border py-1.5 px-3.5 rounded-full transition-all duration-300 ease-out active:scale-95 font-semibold cursor-pointer ${
                team === f 
                  ? 'bg-rose-400/15 border-rose-400/50 text-rose-400 shadow-[0_0_20px_-4px_rgba(251,113,133,0.3)] ring-1 ring-rose-400/20' 
                  : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10 text-muted-foreground hover:text-white hover:-translate-y-[1px]'
              }`}
            >
              <span className="text-base leading-none select-none">{FLAGS[f] || "❤️"}</span>
              {f}
              <div 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(f); }}
                className="ml-1 p-0.5 rounded-full hover:bg-white/20 text-white/50 hover:text-white transition-colors"
                title="Remove Favorite"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </div>
            </button>
          ))}

          {/* Add Favorite Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="h-[28px] px-3.5 bg-[#1a1a1a] border border-white/10 rounded-full text-[11px] font-semibold text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 ease-out active:scale-95 shadow-sm flex items-center justify-center">
                + Add Team
              </button>
            </DialogTrigger>

            {favoritesSignal.value.length > 0 && (
              <button 
                onClick={clearFavorites}
                className="h-[28px] px-3.5 bg-rose-400/5 border border-rose-400/20 rounded-full text-[11px] font-semibold text-rose-400 hover:bg-rose-400/20 hover:border-rose-400/40 transition-all duration-300 ease-out active:scale-95 ml-1 flex items-center gap-1.5"
              >
                Clear All
              </button>
            )}

            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl bg-[#0f0f0f]/95 border-white/10 text-white rounded-2xl backdrop-blur-xl p-0 overflow-hidden shadow-[0_24px_100px_rgba(0,0,0,0.9)] ring-1 ring-white/10 duration-400 ease-out">
              <DialogHeader className="p-6 pb-4 border-b border-white/5">
                <div>
                  <DialogTitle className="text-xl">Select Favorite Teams</DialogTitle>
                  <DialogDescription className="text-white/50 text-sm mt-1.5">Choose teams to add to your quick filters. You can select multiple.</DialogDescription>
                </div>
              </DialogHeader>
              <ScrollArea className="max-h-[65vh] p-6">
                <div className="flex flex-wrap gap-2.5">
                  {Object.keys(FLAGS).sort().map(t => {
                    const isFav = favoritesSignal.value.includes(t);
                    return (
                      <button
                        key={t}
                        onClick={() => toggleFavorite(t)}
                        className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full transition-all duration-200 ease-out active:scale-95 border ${
                          isFav 
                            ? 'bg-rose-400/15 border-rose-400/50 text-rose-400 shadow-[0_0_16px_-4px_rgba(251,113,133,0.3)] ring-1 ring-rose-400/20' 
                            : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10 text-white'
                        }`}
                      >
                        <span className="text-lg leading-none select-none drop-shadow-md">{FLAGS[t]}</span>
                        <span className="text-[13px] font-semibold">{t}</span>
                        {isFav && <span className="ml-0.5 text-rose-400 text-[10px] drop-shadow-[0_0_4px_rgba(251,113,133,0.8)]">❤️</span>}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
              <DialogFooter className="px-6 py-5 border-t border-white/5 bg-black/20 flex flex-row items-center justify-between sm:justify-between w-full">
                {favoritesSignal.value.length > 0 ? (
                  <button 
                    onClick={clearFavorites}
                    className="text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors border border-rose-400/20 hover:border-rose-400/40 px-4 py-2 rounded-full bg-rose-400/5 hover:bg-rose-400/10 active:scale-95"
                  >
                    Clear All
                  </button>
                ) : (
                  <div />
                )}
                <button onClick={() => setIsDialogOpen(false)} className="w-auto px-8 py-2 bg-rose-400 text-white text-sm font-bold rounded-full transition-all duration-300 hover:bg-rose-500 active:scale-95 shadow-[0_0_15px_rgba(251,113,133,0.25)] hover:shadow-[0_0_20px_rgba(251,113,133,0.4)]">
                  Done
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center text-xs">
          <span className="font-mono text-muted-foreground/60 uppercase tracking-[0.12em] mr-2">Hosts</span>
          {hosts.map(h => (
            <button
              key={h}
              onClick={() => setTeam(team === h ? "" : h)}
              className={`flex items-center gap-1.5 border py-1.5 px-3.5 rounded-full transition-all duration-300 ease-out active:scale-95 font-semibold cursor-pointer ${
                team === h 
                  ? 'bg-fox/15 border-fox/50 text-fox shadow-[0_0_20px_-4px_rgba(5,255,155,0.3)] ring-1 ring-fox/20' 
                  : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10 text-muted-foreground hover:text-white hover:-translate-y-[1px]'
              }`}
            >
              <span className="text-base leading-none select-none">{FLAGS[h]}</span>
              {h}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-2 gap-y-2 items-center text-xs mt-1">
          <span className="font-mono text-muted-foreground/60 uppercase tracking-[0.12em] mr-2">Contenders</span>
          {contenders.map(c => (
            <button
              key={c}
              onClick={() => setTeam(team === c ? "" : c)}
              className={`flex items-center gap-1.5 border py-1.5 px-3.5 rounded-full transition-all duration-300 ease-out active:scale-95 font-semibold cursor-pointer ${
                team === c 
                  ? 'bg-fox/15 border-fox/50 text-fox shadow-[0_0_20px_-4px_rgba(5,255,155,0.3)] ring-1 ring-fox/20' 
                  : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10 text-muted-foreground hover:text-white hover:-translate-y-[1px]'
              }`}
            >
              <span className="text-base leading-none select-none">{FLAGS[c]}</span>
              {c}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
