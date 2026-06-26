import { useCallback, useEffect, useState } from "react";
import { getCategories, getQuizzes } from "../api/publicQuizApi.js";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import CategoryFilter from "../components/quiz/CategoryFilter.jsx";
import QuizCard from "../components/quiz/QuizCard.jsx";
import Card from "../components/ui/Card.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";

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
    <div className="space-y-6 lg:space-y-8">
      <PageHeader eyebrow="Quiz catalog" title="Find a quiz to practice" className="border-violet-100 shadow-violet-100/70">
        <p>
          Browse published quizzes by category. Public listings show only quiz metadata,
          never questions, answer keys, or explanations.
        </p>
      </PageHeader>

      {loading ? (
        <LoadingState message="Loading quiz catalog..." />
      ) : error ? (
        <ErrorState message={error} onAction={loadCatalog} />
      ) : (
        <>
          <Card className="bg-white/95" padding="md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-950">Categories</h2>
                <p className="mt-1 text-sm text-slate-500">Filter the real published catalog.</p>
              </div>
              <CategoryFilter
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                disabled={filterLoading}
                onChange={handleCategoryChange}
              />
            </div>
          </Card>

          {filterLoading ? (
            <LoadingState message="Loading selected category..." />
          ) : quizzes.length === 0 ? (
            <EmptyState
              title="No public quizzes available."
              message="Try another category or check back after an admin publishes more quizzes."
            />
          ) : (
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
