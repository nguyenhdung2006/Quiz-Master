import { classNames } from "./classNames.js";

const controlClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function FieldFrame({ children, className = "", label, message }) {
  return (
    <label className={classNames("block space-y-2", className)}>
      {label && <span className="text-sm font-medium text-slate-700">{label}</span>}
      {children}
      {message && <span className="block text-xs text-slate-500">{message}</span>}
    </label>
  );
}

export function Input({ className = "", label, message, ...props }) {
  const input = <input className={classNames(controlClass, className)} {...props} />;
  return label || message ? (
    <FieldFrame label={label} message={message}>
      {input}
    </FieldFrame>
  ) : (
    input
  );
}

export function Select({ children, className = "", label, message, ...props }) {
  const select = (
    <select className={classNames(controlClass, className)} {...props}>
      {children}
    </select>
  );
  return label || message ? (
    <FieldFrame label={label} message={message}>
      {select}
    </FieldFrame>
  ) : (
    select
  );
}

export function Textarea({ className = "", label, message, ...props }) {
  const textarea = <textarea className={classNames(controlClass, "min-h-28", className)} {...props} />;
  return label || message ? (
    <FieldFrame label={label} message={message}>
      {textarea}
    </FieldFrame>
  ) : (
    textarea
  );
}
