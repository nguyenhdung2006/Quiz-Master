import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./auth/AdminRoute.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AnswerReviewPage from "./pages/AnswerReviewPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MyAttemptsPage from "./pages/MyAttemptsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import QuizCatalogPage from "./pages/QuizCatalogPage.jsx";
import QuizDetailPage from "./pages/QuizDetailPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ResultPage from "./pages/ResultPage.jsx";
import TakeQuizPage from "./pages/TakeQuizPage.jsx";
import AdminCategoryPage from "./pages/admin/AdminCategoryPage.jsx";
import AdminQuizEditorPage from "./pages/admin/AdminQuizEditorPage.jsx";
import AdminQuizListPage from "./pages/admin/AdminQuizListPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/quizzes" element={<QuizCatalogPage />} />
        <Route path="/quizzes/:id" element={<QuizDetailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/attempts/:attemptId/take" element={<TakeQuizPage />} />
          <Route path="/attempts/:attemptId/result" element={<ResultPage />} />
          <Route path="/attempts/:attemptId/review" element={<AnswerReviewPage />} />
          <Route path="/attempts" element={<MyAttemptsPage />} />
          <Route path="/me/attempts" element={<Navigate to="/attempts" replace />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/quizzes" element={<AdminQuizListPage />} />
          <Route path="/admin/quizzes/new" element={<AdminQuizEditorPage />} />
          <Route path="/admin/quizzes/:id/edit" element={<AdminQuizEditorPage />} />
          <Route path="/admin/categories" element={<AdminCategoryPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
