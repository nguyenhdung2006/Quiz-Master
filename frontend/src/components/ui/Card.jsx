import { classNames } from "./classNames.js";

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
  xl: "p-8",
};

export default function Card({ as: Component = "section", children, className = "", padding = "lg", ...props }) {
  return (
    <Component
      className={classNames(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        paddingClasses[padding] || paddingClasses.lg,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
