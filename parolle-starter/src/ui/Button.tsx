import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "cta";

const base =
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";

const variants: Record<Variant, string> = {
  primary: "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700",
  secondary: "bg-transparent hover:bg-slate-800/60 text-slate-100",
  ghost: "bg-transparent hover:bg-slate-800/60 text-slate-300",
  // Bleu “CTA”
  cta: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_6px_20px_rgba(79,70,229,0.35)] focus-visible:ring-indigo-500",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export default function Button({ className, variant = "primary", ...props }: Props) {
  return <button className={clsx(base, variants[variant], className)} {...props} />;
}
