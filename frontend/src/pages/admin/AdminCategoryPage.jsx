import { useCallback, useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../api/adminCategoryApi.js";
import CategoryForm from "../../components/admin/CategoryForm.jsx";
import CategoryList from "../../components/admin/CategoryList.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import Card from "../../components/ui/Card.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";

export default function AdminCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleSubmit(payload) {
    setSaving(true);
    setActionError(null);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }

      setEditingCategory(null);
      await loadCategories();
    } catch (error) {
      setActionError(error.message || "Could not save category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete(category) {
    setDeletingId(category.id);
    setActionError(null);

    try {
      await deleteCategory(category.id);
      if (editingCategory?.id === category.id) {
        setEditingCategory(null);
      }
      setConfirmingDeleteId(null);
      await loadCategories();
    } catch (error) {
      setActionError(error.message || "Could not delete category.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Categories">
        Manage the subjects used to organize quizzes. Categories with quizzes remain protected from deletion.
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <CategoryForm
          editingCategory={editingCategory}
          busy={saving}
          error={actionError}
          onCancelEdit={() => {
            setEditingCategory(null);
            setActionError(null);
          }}
          onSubmit={handleSubmit}
        />

        <div className="min-w-0 space-y-4">
          {!loading && !loadError && categories.length > 0 && (
            <Card className="bg-gradient-to-r from-violet-50 to-white" padding="md">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Category directory</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {categories.length} categor{categories.length === 1 ? "y" : "ies"} available for quiz metadata.
                  </p>
                </div>
                <p className="text-sm font-semibold text-violet-700">Names and slugs are managed here.</p>
              </div>
            </Card>
          )}

          {loading && <LoadingState message="Loading categories..." />}

          {!loading && loadError && (
            <ErrorState
              title="Could not load categories."
              message={loadError.message || "Please check your connection and try again."}
              actionLabel="Try again"
              onAction={loadCategories}
            />
          )}

          {!loading && !loadError && categories.length === 0 && (
            <EmptyState title="No categories yet." message="Create your first category." />
          )}

          {!loading && !loadError && categories.length > 0 && (
            <CategoryList
              categories={categories}
              confirmingId={confirmingDeleteId}
              deletingId={deletingId}
              onCancelDelete={() => setConfirmingDeleteId(null)}
              onConfirmDelete={handleConfirmDelete}
              onEdit={(category) => {
                setEditingCategory(category);
                setConfirmingDeleteId(null);
                setActionError(null);
              }}
              onRequestDelete={(category) => {
                setConfirmingDeleteId(category.id);
                setActionError(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
