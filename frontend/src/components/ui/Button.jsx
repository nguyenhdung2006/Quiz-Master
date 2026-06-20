import { classNames } from "./classNames.js";

const variants = {
  primary: "bg-purple-700 text-white shadow-sm hover:bg-purple-800 focus-visible:ring-purple-200 disabled:bg-purple-300",
  secondary: "bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-slate-200",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200",
  danger: "bg-red-700 text-white shadow-sm hover:bg-red-800 focus-visible:ring-red-200 disabled:bg-red-300",
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
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
        "inline-flex items-center justify-center rounded-lg font-semibold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    />
  );
}
