import { classNames } from "./classNames.js";

const variants = {
  primary:
    "bg-gradient-to-b from-violet-600 to-indigo-700 text-white shadow-sm shadow-indigo-200 hover:from-violet-700 hover:to-indigo-800 focus-visible:ring-violet-200 disabled:from-violet-300 disabled:to-indigo-300 disabled:shadow-none",
  secondary:
    "bg-white text-slate-800 ring-1 ring-slate-200 shadow-sm hover:bg-slate-50 hover:ring-slate-300 focus-visible:ring-violet-200",
  ghost:
    "bg-transparent text-slate-700 hover:bg-violet-50 hover:text-violet-800 focus-visible:ring-violet-200",
  danger:
    "bg-gradient-to-b from-red-600 to-red-700 text-white shadow-sm shadow-red-100 hover:from-red-700 hover:to-red-800 focus-visible:ring-red-200 disabled:from-red-300 disabled:to-red-300 disabled:shadow-none",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  as: Component = "button",
  className = "",
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <Component
      type={Component === "button" ? type : undefined}
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold leading-none transition duration-150 focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-80",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    />
  );
}
