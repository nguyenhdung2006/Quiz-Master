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
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>Name</span>
        <span>Slug</span>
        <span className="text-right">Actions</span>
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
            <code className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-700">{category.slug}</code>
            <div className="flex justify-start gap-2 md:justify-end">
              {confirmingId === category.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => onConfirmDelete(category)}
                    disabled={deletingId === category.id}
                    data-testid={`confirm-delete-category-${category.id}`}
                    className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === category.id ? "Deleting..." : "Confirm delete"}
                  </button>
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    disabled={deletingId === category.id}
                    className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    data-testid={`edit-category-${category.id}`}
                    className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestDelete(category)}
                    data-testid={`delete-category-${category.id}`}
                    className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
