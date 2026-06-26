import { classNames } from "./classNames.js";

export default function PageContainer({ children, className = "" }) {
  return (
    <main className={classNames("mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10", className)}>
      {children}
    </main>
  );
}
