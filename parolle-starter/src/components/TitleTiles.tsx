import React from "react";

type State = "correct" | "present" | "neutral";

type Props = {
  text: string;          // ex: "PAROLLE"
  states?: State[];      // motif des couleurs, même longueur que text (optionnel)
};

export default function TitleTiles({ text, states }: Props) {
  const letters = Array.from(text);

  // Couleurs du projet
  const color = (s: State) => {
    switch (s) {
      case "correct": return "bg-[rgb(22,163,74)] border-[rgb(22,163,74)] text-white"; // vert
      case "present": return "bg-[rgb(234,179,8)] border-[rgb(234,179,8)] text-black"; // jaune
      default:        return "bg-slate-600 border-slate-600 text-slate-100";           // gris
    }
  };

  // Motif par défaut (peut être surchargé avec props.states)
  const fallback: State[] = letters.map(() => "neutral");
  if (letters.length >= 1) fallback[0] = "correct";
  if (letters.length >= 2) fallback[1] = "present";
  if (letters.length >= 5) fallback[4] = "correct";
  if (letters.length >= 6) fallback[5] = "present";
  const palette = (states && states.length === letters.length) ? states : fallback;

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 px-2">
      {/* h1 accessible pour SEO/lecteurs d’écran */}
      <h1 className="sr-only">{text}</h1>

      {/* Tuiles visibles */}
      <div role="img" aria-label={text} className="flex gap-1 sm:gap-2">
        {letters.map((ch, i) => (
          <div
            key={`${ch}-${i}`}
            className={`aspect-square w-[clamp(40px,9vw,56px)] grid place-items-center
                        rounded-xl border font-extrabold
                        text-[clamp(16px,4vw,22px)] tracking-wide shadow
                        ${color(palette[i])}`}
          >
            {ch}
          </div>
        ))}
      </div>
    </div>
  );
}
