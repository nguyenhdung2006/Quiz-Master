import { classNames } from "./classNames.js";

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-5 sm:p-6",
  xl: "p-6 sm:p-8",
};

export default function Card({ as: Component = "section", children, className = "", padding = "lg", ...props }) {
  return (
    <Component
      className={classNames(
        "rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/70",
        paddingClasses[padding] || paddingClasses.lg,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
