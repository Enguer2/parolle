interface StatsModalProps {
  t: any;
  stats: any;
  user: any;
  onLogin: () => void;
  onClose: () => void;
}

export default function StatsModal({ t, stats, user, onLogin, onClose }: StatsModalProps) {

  // ── Non connecté ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
        <div
          className="bg-[#131314] w-full max-w-[400px] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] relative border border-[#484849]/30 overflow-hidden"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-[#aff4a6]/40 to-transparent" />

          <div className="p-8 text-center">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors"
            >
              <span className="material-icons text-[22px]">close</span>
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-[#1f1f21] border border-[#484849]/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <span className="material-icons text-3xl text-[#aff4a6]/60">leaderboard</span>
            </div>

            <h2
              className="text-2xl font-black uppercase tracking-tighter mb-3 text-white"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {t.statsTitle}
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">{t.loginForStats}</p>

            <button
              onClick={onLogin}
              className="w-full py-4 bg-[#aff4a6] text-[#002a04] font-black rounded-xl hover:bg-[#a2e599] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest shadow-[0_4px_24px_rgba(175,244,166,0.2)]"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="w-4 h-4 bg-white rounded-full p-0.5"
              />
              {t.login}
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-[#484849]/20 to-transparent" />
        </div>
      </div>
    );
  }

  // ── Statistiques ──────────────────────────────────────────────────────────────
  const played = stats?.games_played || 0;
  const won = stats?.games_won || 0;
  const winPct = played > 0 ? Math.round((won / played) * 100) : 0;
  const currentStreak = stats?.current_streak || 0;
  const maxStreak = stats?.max_streak || 0;
  const distribution: number[] = stats?.guess_distribution || [0, 0, 0, 0, 0, 0];
  const totalWins = distribution.reduce((a, b) => a + b, 0);
  const maxInDistribution = Math.max(...distribution, 1);

  const statItems = [
    { value: played,        label: t.statsPlayed },
    { value: `${winPct}%`, label: t.statsWinPct },
    { value: currentStreak, label: t.statsCurrentStreak },
    { value: maxStreak,     label: t.statsMaxStreak },
  ];

  const badges = [
    {
      key: 'parolle2',
      unlocked: distribution[1] > 0,
      value: '2',
      label: t.badgeParolleIn2,
      color: '#ebd474',
      glow: 'rgba(235,212,116,0.25)',
      gradient: 'from-[#ebd474] to-[#c9a000]',
    },
    {
      key: 'streak7',
      unlocked: maxStreak >= 7,
      value: '7',
      label: t.badgeStreak7,
      sub: `${Math.min(currentStreak, 7)}/7`,
      color: '#aff4a6',
      glow: 'rgba(175,244,166,0.2)',
      gradient: 'from-[#aff4a6] to-[#6fb069]',
    },
    {
      key: 'parolle1',
      unlocked: distribution[0] > 0,
      value: '1',
      label: t.badgeParolleIn1,
      color: '#f9e281',
      glow: 'rgba(249,226,129,0.2)',
      gradient: 'from-[#f9e281] to-[#6e5e03]',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div
        className="bg-[#131314] w-full max-w-[500px] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] relative border border-[#484849]/30 overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-[#aff4a6]/40 to-transparent" />

        <div className="p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors"
          >
            <span className="material-icons text-[22px]">close</span>
          </button>

          {/* Title */}
          <h2
            className="text-2xl font-black uppercase tracking-tighter mb-1 text-white"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {t.statsTitle}
          </h2>
          <div className="h-px bg-gradient-to-r from-[#aff4a6]/20 to-transparent mb-7" />

          {/* ── Key stats ── */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {statItems.map(({ value, label }, i) => (
              <div key={i} className="text-center bg-[#1f1f21] rounded-xl py-4 px-2 border border-[#484849]/20">
                <div
                  className="text-3xl font-black text-white mb-1 tracking-tighter"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  {value}
                </div>
                <div className="text-[11px] text-white/40 leading-tight uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Badges ── */}
          <div className="border-t border-[#484849]/20 pt-6 mb-6">
            <h3
              className="text-sm font-black uppercase tracking-widest text-white/60 mb-1"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {t.badgesTitle}
            </h3>
            <p className="text-[12px] text-white/30 mb-5">{t.badgesSubtitle}</p>

            <div className="flex gap-4 justify-center">
              {badges.map(({ key, unlocked, value, label, sub, color, glow, gradient }) => (
                <div
                  key={key}
                  className={`text-center w-24 transition-transform ${unlocked ? 'hover:scale-105 cursor-default' : 'opacity-30'}`}
                >
                  {/* Badge ring */}
                  <div
                    className={`w-[68px] h-[68px] mx-auto mb-2.5 rounded-full flex items-center justify-center p-1 ${unlocked ? `bg-gradient-to-br ${gradient}` : 'bg-[#1f1f21]'}`}
                    style={unlocked ? { boxShadow: `0 4px 16px ${glow}` } : {}}
                  >
                    <div
                      className="w-full h-full rounded-full bg-[#131314] border-2 flex items-center justify-center"
                      style={{ borderColor: unlocked ? color : '#484849' }}
                    >
                      <span
                        className="text-[26px] font-black"
                        style={{ fontFamily: 'Manrope, sans-serif', color: unlocked ? color : '#484849' }}
                      >
                        {value}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-white/60 leading-tight mb-1">{label}</div>
                  {sub && <div className="text-[11px] text-white/30">{sub}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* ── Distribution ── */}
          <div className="border-t border-[#484849]/20 pt-6">
            <h3
              className="text-sm font-black uppercase tracking-widest text-white/60 mb-4"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {t.distributionTitle}
            </h3>

            <div className="flex flex-col gap-2">
              {distribution.map((value: number, index: number) => {
                const pct = Math.max(6, Math.round((value / maxInDistribution) * 100));
                const isMax = value > 0 && value === maxInDistribution;

                return (
                  <div key={index} className="flex items-center gap-3">
                    <span
                      className="text-[13px] text-white/40 w-3 text-right flex-shrink-0"
                      style={{ fontFamily: 'Manrope, sans-serif' }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1 flex">
                      <div
                        className={`h-7 rounded-lg flex items-center px-3 min-w-[28px] transition-all ${
                          isMax
                            ? 'bg-[#6fb069] shadow-[0_0_12px_rgba(111,176,105,0.25)]'
                            : 'bg-[#1f1f21] border border-[#484849]/20'
                        }`}
                        style={{ width: `${pct}%` }}
                      >
                        <span
                          className={`text-[13px] font-black ${isMax ? 'text-[#002a04]' : 'text-white/50'}`}
                          style={{ fontFamily: 'Manrope, sans-serif' }}
                        >
                          {value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer link */}
            <div className="mt-7 text-center">
              <a
                href="#"
                className="text-[12px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors"
              >
                {t.helpCenterLink}
              </a>
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[#484849]/20 to-transparent" />
      </div>
    </div>
  );
}