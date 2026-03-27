export default function StatsModal({ t, onClose }: { t: any, onClose: () => void }) {
  // Ces données sont statiques pour correspondre à ta maquette. 
  // Plus tard, on les remplacera par les vraies stats du joueur.
  const mockStats = {
    played: 2,
    winPct: 100,
    currentStreak: 1,
    maxStreak: 1,
    distribution: [0, 1, 0, 1, 0, 0] // Représente les victoires en 1, 2, 3, 4, 5, 6 essais
  };

  const totalWins = mockStats.distribution.reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="bg-[#1a2332] w-full max-w-[500px] rounded-xl text-white relative shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
        
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors">
          <span className="material-icons text-[28px]">close</span>
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-medium mb-6">{t.statsTitle}</h2>
          
          {/* --- Chiffres Clés --- */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            <div className="text-center">
              <div className="text-3xl font-medium mb-1">{mockStats.played}</div>
              <div className="text-[13px] text-[#8e98a8] leading-tight">{t.statsPlayed}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium mb-1">{mockStats.winPct}</div>
              <div className="text-[13px] text-[#8e98a8] leading-tight">{t.statsWinPct}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium mb-1">{mockStats.currentStreak}</div>
              <div className="text-[13px] text-[#8e98a8] leading-tight">{t.statsCurrentStreak}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium mb-1">{mockStats.maxStreak}</div>
              <div className="text-[13px] text-[#8e98a8] leading-tight">{t.statsMaxStreak}</div>
            </div>
          </div>

          {/* --- Badges --- */}
          <div className="border-t border-white/10 pt-6 mb-6">
            <h3 className="text-base font-medium mb-2">{t.badgesTitle}</h3>
            <p className="text-[13px] text-[#8e98a8] mb-4">{t.badgesSubtitle}</p>
            
            <div className="flex gap-4 justify-center mb-4">
              {/* Badge Or */}
              <div className="text-center w-24 cursor-pointer hover:scale-105 transition-transform">
                <div className="w-[72px] h-[72px] mx-auto mb-2 rounded-full flex items-center justify-center bg-gradient-to-br from-[#e6b800] to-[#c9a000] shadow-[0_2px_8px_rgba(230,184,0,0.3)] p-1">
                  <div className="w-full h-full rounded-full bg-[#1a2332] border-2 border-[#e6b800] flex items-center justify-center">
                    <span className="text-[28px] font-medium text-[#e6b800]">2</span>
                  </div>
                </div>
                <div className="text-xs text-white leading-tight">{t.badgeParolleIn2}</div>
              </div>
              
              {/* Badge Argent */}
              <div className="text-center w-24 cursor-pointer hover:scale-105 transition-transform">
                <div className="w-[72px] h-[72px] mx-auto mb-2 rounded-full flex items-center justify-center bg-[#3d4654] p-1">
                  <div className="w-full h-full rounded-full bg-[#1a2332] border-2 border-[#5a6576] flex items-center justify-center">
                    <span className="text-[28px] font-medium text-[#5a6576]">7</span>
                  </div>
                </div>
                <div className="text-xs text-white leading-tight mb-1">{t.badgeStreak7}</div>
                <div className="text-[11px] text-[#8e98a8]">1/7</div>
              </div>
              
              {/* Badge Verrouillé */}
              <div className="text-center w-24 opacity-40">
                <div className="w-[72px] h-[72px] mx-auto mb-2 rounded-full flex items-center justify-center bg-[#3d4654] p-1">
                  <div className="w-full h-full rounded-full bg-[#1a2332] border-2 border-[#5a6576] flex items-center justify-center">
                    <span className="text-[28px] font-medium text-[#5a6576]">1</span>
                  </div>
                </div>
                <div className="text-xs text-white leading-tight">{t.badgeParolleIn1}</div>
              </div>
            </div>

            {/* Info Card - Badges */}
            <div className="bg-[#273041] hover:bg-[#2d3847] transition-colors rounded-lg p-3 flex items-center gap-3 cursor-pointer">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-[#4a9eff] to-[#357abd]">
                <span className="material-icons text-white">emoji_events</span>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium mb-0.5">{t.seeAllBadges}</div>
                <div className="text-[13px] text-[#8e98a8]">{t.appGames}</div>
              </div>
              <span className="material-icons text-[#8e98a8]">chevron_right</span>
            </div>
          </div>

          {/* --- Distribution --- */}
          <div className="border-t border-white/10 pt-6">
            
            {/* Info Card - Bot */}
            <div className="bg-[#273041] hover:bg-[#2d3847] transition-colors rounded-lg p-3 flex items-center gap-3 cursor-pointer mb-6">
              <div className="w-8 h-8 rounded bg-[#3d4654] flex items-center justify-center shrink-0">
                <span className="material-icons text-[#8e98a8] text-sm">smart_toy</span>
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-medium text-white leading-tight mb-1">{t.botAnalysisTitle}</div>
                <div className="text-[13px] text-[#4a9eff]">{t.botAnalysisLink}</div>
              </div>
            </div>

            <h3 className="text-[14px] font-medium mb-3 text-white">{t.distributionTitle}</h3>
            
            <div className="flex flex-col gap-1.5">
              {mockStats.distribution.map((value, index) => {
                const percentage = totalWins > 0 ? Math.max(7, Math.round((value / totalWins) * 100)) : 7;
                const isActive = value > 0 && value === Math.max(...mockStats.distribution);
                
                return (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-[13px] text-[#8e98a8] w-3">{index + 1}</span>
                    <div className="flex-1 flex">
                      <div 
                        className={`h-6 rounded-sm flex items-center px-2 min-w-[32px] ${isActive ? 'bg-[#4caf50]' : 'bg-[#3d4654]'}`}
                        style={{ width: value > 0 ? `${percentage}%` : 'auto' }}
                      >
                        <span className={`text-[13px] text-white ${isActive ? 'font-medium' : ''}`}>{value}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <a href="#" className="text-[13px] text-[#8e98a8] hover:text-white transition-colors underline-offset-2 hover:underline">
                {t.helpCenterLink}
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}