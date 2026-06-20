import PageHeader from "../components/ui/PageHeader.jsx";

export default function PageShell({ title, eyebrow, children }) {
  return (
    <PageHeader eyebrow={eyebrow} title={title}>
      {children}
    </PageHeader>
  );
}
