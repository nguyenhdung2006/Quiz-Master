import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

export default function CategoryList({
  categories,
  confirmingId,
  deletingId,
  onCancelDelete,
  onConfirmDelete,
  onEdit,
  onRequestDelete,
}) {
  return (
    <Card className="overflow-hidden" padding="none">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Category list</h2>
            <p className="text-sm text-slate-500">{categories.length} categories available.</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Name / slug / actions</p>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {categories.map((category) => (
          <div
            key={category.id}
            data-testid={`category-row-${category.id}`}
            className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1fr_1fr_auto] md:items-center"
          >
            <div>
              <p className="font-medium text-slate-950">{category.name}</p>
              <p className="text-xs text-slate-500">ID {category.id}</p>
            </div>
            <code className="w-fit rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm text-slate-700">
              {category.slug}
            </code>
            <div className="flex justify-start gap-2 md:justify-end">
              {confirmingId === category.id ? (
                <>
                  <Button
                    type="button"
                    onClick={() => onConfirmDelete(category)}
                    disabled={deletingId === category.id}
                    data-testid={`confirm-delete-category-${category.id}`}
                    variant="danger"
                    size="sm"
                  >
                    {deletingId === category.id ? "Deleting..." : "Confirm delete"}
                  </Button>
                  <Button
                    type="button"
                    onClick={onCancelDelete}
                    disabled={deletingId === category.id}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={() => onEdit(category)}
                    data-testid={`edit-category-${category.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onRequestDelete(category)}
                    data-testid={`delete-category-${category.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
