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
            <p className="text-sm text-slate-500">Edit category names and slugs used by quizzes.</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {categories.map((category) => (
          <div
            key={category.id}
            data-testid={`category-row-${category.id}`}
            className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"
          >
            <div className="min-w-0">
              <p className="break-words font-semibold text-slate-950">{category.name}</p>
              <p className="text-xs text-slate-500">ID {category.id}</p>
            </div>
            <div className="min-w-0">
              <p className="mb-1 text-xs font-semibold text-slate-500">Slug</p>
              <code className="block w-fit max-w-full break-words rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm text-slate-700">
                {category.slug}
              </code>
            </div>
            <div className="flex flex-col justify-start gap-2 sm:flex-row md:justify-end">
              {confirmingId === category.id ? (
                <>
                  <Button
                    type="button"
                    onClick={() => onConfirmDelete(category)}
                    disabled={deletingId === category.id}
                    data-testid={`confirm-delete-category-${category.id}`}
                    variant="danger"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {deletingId === category.id ? "Deleting..." : "Confirm delete"}
                  </Button>
                  <Button
                    type="button"
                    onClick={onCancelDelete}
                    disabled={deletingId === category.id}
                    variant="secondary"
                    size="sm"
                    className="w-full sm:w-auto"
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
                    className="w-full sm:w-auto"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onRequestDelete(category)}
                    data-testid={`delete-category-${category.id}`}
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-700 hover:bg-red-50 sm:w-auto"
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
