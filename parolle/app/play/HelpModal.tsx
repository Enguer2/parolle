export default function HelpModal({ t, onClose }: { t: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#2c2c2d] w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative border border-gray-700">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
          <span className="material-icons">close</span>
        </button>
        <h2 className="text-2xl font-black uppercase tracking-widest mb-6 text-white text-center">{t.howToPlay}</h2>
        <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
          <p>{t.instruction1}</p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#38a169] flex-shrink-0 flex items-center justify-center rounded font-bold text-white text-xl">C</div>
              <p dangerouslySetInnerHTML={{ __html: t.correctSpotHTML }}></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#d69e2e] flex-shrink-0 flex items-center justify-center rounded font-bold text-white text-xl">A</div>
              <p dangerouslySetInnerHTML={{ __html: t.wrongSpotHTML }}></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#4a5568] flex-shrink-0 flex items-center justify-center rounded font-bold text-white text-xl">S</div>
              <p dangerouslySetInnerHTML={{ __html: t.notInWordHTML }}></p>
            </div>
          </div>
          <p className="pt-4 border-t border-gray-700 text-xs italic opacity-70">{t.newWordTime}</p>
        </div>
        <button onClick={onClose} className="w-full mt-8 py-4 bg-[#6b5cd6] text-white font-black rounded-xl hover:bg-[#5849bc] transition-all">
          {t.letsGo}
        </button>
      </div>
    </div>
  )
}