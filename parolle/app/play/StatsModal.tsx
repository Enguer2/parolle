interface StatsModalProps {
  t: any;
  stats: any;
  user: any;
  onLogin: () => void;
  onClose: () => void;
}

export default function StatsModal({ t, stats, user, onLogin, onClose }: StatsModalProps) {
  
  // --- ÉCRAN SI NON CONNECTÉ ---
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm transition-opacity">
        <div className="bg-[#1a2332] w-full max-w-[400px] rounded-xl text-white relative shadow-2xl p-8 text-center border border-gray-700">
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors">
            <span className="material-icons text-[28px]">close</span>
          </button>
          
          <div className="w-16 h-16 bg-[#2d3748] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-3xl text-[#8e98a8]">leaderboard</span>
          </div>
          <h2 className="text-2xl font-medium mb-3">{t.statsTitle}</h2>
          <p className="text-[#8e98a8] text-sm mb-8 leading-relaxed">
            {t.loginForStats}
          </p>
          
          <button 
            onClick={onLogin} 
            className="w-full py-4 bg-[#6b5cd6] text-white font-bold rounded-xl hover:bg-[#5849bc] transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
            {t.login}
          </button>
        </div>
      </div>
    );
  }

  // --- CALCUL DES STATISTIQUES (SI CONNECTÉ) ---
  const played = stats?.games_played || 0;
  const won = stats?.games_won || 0;
  // Calcul du % : (victoires / joués) * 100
  const winPct = played > 0 ? Math.round((won / played) * 100) : 0; 
  const currentStreak = stats?.current_streak || 0;
  const maxStreak = stats?.max_streak || 0;
  const distribution = stats?.guess_distribution || [0, 0, 0, 0, 0, 0];

  const totalWins = distribution.reduce((a: number, b: number) => a + b, 0);

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
              <div className="text-3xl font-medium mb-1">{played}</div>
              <div className="text-[13px] text-[#8e98a8] leading-tight">{t.statsPlayed}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium mb-1">{winPct}</div>
              <div className="text-[13px] text-[#8e98a8] leading-tight">{t.statsWinPct}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium mb-1">{currentStreak}</div>
              <div className="text-[13px] text-[#8e98a8] leading-tight">{t.statsCurrentStreak}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium mb-1">{maxStreak}</div>
              <div className="text-[13px] text-[#8e98a8] leading-tight">{t.statsMaxStreak}</div>
            </div>
          </div>

          {/* --- Badges --- */}
          <div className="border-t border-white/10 pt-6 mb-6">
            <h3 className="text-base font-medium mb-2">{t.badgesTitle}</h3>
            <p className="text-[13px] text-[#8e98a8] mb-4">{t.badgesSubtitle}</p>
            
            <div className="flex gap-4 justify-center mb-4">
              {/* Badge Or */}
              <div className={`text-center w-24 transition-transform ${distribution[1] > 0 ? 'cursor-pointer hover:scale-105' : 'opacity-40'}`}>
                <div className={`w-[72px] h-[72px] mx-auto mb-2 rounded-full flex items-center justify-center p-1 ${distribution[1] > 0 ? 'bg-gradient-to-br from-[#e6b800] to-[#c9a000] shadow-[0_2px_8px_rgba(230,184,0,0.3)]' : 'bg-[#3d4654]'}`}>
                  <div className={`w-full h-full rounded-full bg-[#1a2332] border-2 flex items-center justify-center ${distribution[1] > 0 ? 'border-[#e6b800]' : 'border-[#5a6576]'}`}>
                    <span className={`text-[28px] font-medium ${distribution[1] > 0 ? 'text-[#e6b800]' : 'text-[#5a6576]'}`}>2</span>
                  </div>
                </div>
                <div className="text-xs text-white leading-tight">{t.badgeParolleIn2}</div>
              </div>
              
              {/* Badge Argent */}
              <div className={`text-center w-24 transition-transform ${maxStreak >= 7 ? 'cursor-pointer hover:scale-105' : 'opacity-40'}`}>
                <div className="w-[72px] h-[72px] mx-auto mb-2 rounded-full flex items-center justify-center bg-[#3d4654] p-1">
                  <div className="w-full h-full rounded-full bg-[#1a2332] border-2 border-[#5a6576] flex items-center justify-center">
                    <span className="text-[28px] font-medium text-[#5a6576]">7</span>
                  </div>
                </div>
                <div className="text-xs text-white leading-tight mb-1">{t.badgeStreak7}</div>
                <div className="text-[11px] text-[#8e98a8]">{Math.min(currentStreak, 7)}/7</div>
              </div>
              
              {/* Badge Parolle en 1 */}
              <div className={`text-center w-24 transition-transform ${distribution[0] > 0 ? 'cursor-pointer hover:scale-105' : 'opacity-40'}`}>
                <div className={`w-[72px] h-[72px] mx-auto mb-2 rounded-full flex items-center justify-center p-1 ${distribution[0] > 0 ? 'bg-gradient-to-br from-[#4a9eff] to-[#357abd] shadow-[0_2px_8px_rgba(74,158,255,0.3)]' : 'bg-[#3d4654]'}`}>
                  <div className={`w-full h-full rounded-full bg-[#1a2332] border-2 flex items-center justify-center ${distribution[0] > 0 ? 'border-[#4a9eff]' : 'border-[#5a6576]'}`}>
                    <span className={`text-[28px] font-medium ${distribution[0] > 0 ? 'text-[#4a9eff]' : 'text-[#5a6576]'}`}>1</span>
                  </div>
                </div>
                <div className="text-xs text-white leading-tight">{t.badgeParolleIn1}</div>
              </div>
            </div>
          </div>

          {/* --- Distribution --- */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-[14px] font-medium mb-3 text-white">{t.distributionTitle}</h3>
            
            <div className="flex flex-col gap-1.5">
              {distribution.map((value: number, index: number) => {
                const percentage = totalWins > 0 ? Math.max(7, Math.round((value / totalWins) * 100)) : 7;
                const isActive = value > 0 && value === Math.max(...distribution);
                
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