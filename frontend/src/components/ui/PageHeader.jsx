import Card from "./Card.jsx";
import { classNames } from "./classNames.js";

export default function PageHeader({ actions, children, className = "", eyebrow, title }) {
  return (
    <Card className={classNames("overflow-hidden bg-white/95", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {eyebrow && (
            <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">{eyebrow}</p>
          )}
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">{title}</h1>
          {children && <div className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{children}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-3 sm:justify-end">{actions}</div>}
      </div>
    </Card>
  );
}
