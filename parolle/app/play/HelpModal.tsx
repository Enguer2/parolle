export default function HelpModal({ t, onClose }: { t: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div
        className="bg-[#131314] w-full max-w-md rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.7)] relative border border-[#484849]/30 overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Header accent line */}
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
            {t.howToPlay}
          </h2>
          <div className="h-px bg-gradient-to-r from-[#aff4a6]/20 to-transparent mb-6" />

          {/* Intro */}
          <p className="text-white/60 text-sm leading-relaxed mb-7">{t.instruction1}</p>

          {/* Examples */}
          <div className="space-y-3 mb-7">
            {/* Correct */}
            <div className="flex items-center gap-4 bg-[#1f1f21] rounded-xl px-4 py-3 border border-[#484849]/20">
              <div
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg font-black text-xl bg-[#6fb069] text-[#002a04] shadow-[0_0_16px_rgba(111,176,105,0.3)]"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                C
              </div>
              <p
                className="text-sm text-white/70 leading-snug"
                dangerouslySetInnerHTML={{ __html: t.correctSpotHTML }}
              />
            </div>

            {/* Present */}
            <div className="flex items-center gap-4 bg-[#1f1f21] rounded-xl px-4 py-3 border border-[#484849]/20">
              <div
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg font-black text-xl bg-[#6e5e03] text-[#f9e281] shadow-[0_0_16px_rgba(249,226,129,0.15)]"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                A
              </div>
              <p
                className="text-sm text-white/70 leading-snug"
                dangerouslySetInnerHTML={{ __html: t.wrongSpotHTML }}
              />
            </div>

            {/* Absent */}
            <div className="flex items-center gap-4 bg-[#1f1f21] rounded-xl px-4 py-3 border border-[#484849]/20">
              <div
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg font-black text-xl bg-[#262627] text-[#adaaab] border border-[#484849]/40"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                S
              </div>
              <p
                className="text-sm text-white/70 leading-snug"
                dangerouslySetInnerHTML={{ __html: t.notInWordHTML }}
              />
            </div>
          </div>

          {/* Daily note */}
          <p className="text-[11px] uppercase tracking-widest text-white/25 mb-7">
            {t.newWordTime}
          </p>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#aff4a6] text-[#002a04] font-black rounded-xl hover:bg-[#a2e599] active:scale-[0.98] transition-all text-sm uppercase tracking-widest shadow-[0_4px_24px_rgba(175,244,166,0.2)]"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {t.letsGo}
          </button>
        </div>

        {/* Bottom accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#484849]/20 to-transparent" />
      </div>
    </div>
  )
}