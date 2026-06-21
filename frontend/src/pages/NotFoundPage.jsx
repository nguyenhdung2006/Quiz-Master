import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

export default function NotFoundPage() {
  return (
    <Card className="mx-auto max-w-2xl text-center" padding="xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        Không tìm thấy trang
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Đường dẫn này không tồn tại hoặc đã được thay đổi.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button as={Link} to="/" variant="secondary">
          Về trang chủ
        </Button>
        <Button as={Link} to="/quizzes">
          Xem danh sách quiz
        </Button>
      </div>
    </Card>
  );
}
