import { useCallback, useEffect, useState } from "react";
import { getCategories, getQuizzes } from "../api/publicQuizApi.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import CategoryFilter from "../components/quiz/CategoryFilter.jsx";
import QuizCard from "../components/quiz/QuizCard.jsx";

export default function QuizCatalogPage() {
  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [categoryData, quizData] = await Promise.all([getCategories(), getQuizzes()]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setQuizzes(Array.isArray(quizData) ? quizData : []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load quizzes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  async function handleCategoryChange(categoryId) {
    setSelectedCategoryId(categoryId);
    setFilterLoading(true);
    setError("");

    try {
      const quizData = await getQuizzes(categoryId);
      setQuizzes(Array.isArray(quizData) ? quizData : []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load quizzes for this category.");
    } finally {
      setFilterLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Quiz catalog</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Find a quiz to practice</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Browse published quizzes by category. Public listings show only quiz metadata.
        </p>
      </section>

      {loading ? (
        <LoadingState message="Loading quiz catalog..." />
      ) : error ? (
        <ErrorState message={error} onAction={loadCatalog} />
      ) : (
        <>
          <section className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <CategoryFilter
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              disabled={filterLoading}
              onChange={handleCategoryChange}
            />
          </section>

          {filterLoading ? (
            <LoadingState message="Loading selected category..." />
          ) : quizzes.length === 0 ? (
            <EmptyState
              title="No published quizzes yet"
              message="Try another category or check back after an admin publishes quizzes."
            />
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
