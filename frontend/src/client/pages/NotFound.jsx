import { Link } from "react-router-dom";
import Logo from "../components/common/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
      <Logo />
      <div>
        <p className="text-sm font-semibold text-brand-600">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or has moved.</p>
      </div>
      <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        Back to dashboard
      </Link>
    </div>
  );
}
