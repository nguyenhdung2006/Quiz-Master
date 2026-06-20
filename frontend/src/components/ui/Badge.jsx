import { classNames } from "./classNames.js";

const variants = {
  default: "bg-slate-100 text-slate-700 ring-slate-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  neutral: "bg-white text-slate-600 ring-slate-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
};

export default function Badge({ children, className = "", variant = "default" }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        variants[variant] || variants.default,
        className,
      )}
    >
      {children}
    </span>
  );
}
