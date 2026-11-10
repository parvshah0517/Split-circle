import { Link } from "react-router-dom";
import Logo from "../components/common/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#ECEEF2] px-6 text-center">
      <Logo />
      <div className="rounded-[32px] bg-white p-8 shadow-soft border border-gray-100 max-w-sm w-full">
        <p className="text-sm font-bold text-[#00C4A7] uppercase tracking-wider">404 Error</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-gray-900">Page Not Found</h1>
        <p className="mt-2 text-xs text-gray-400 font-medium">The screen you are looking for does not exist or has been moved.</p>
        <Link
          to="/"
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-[#18191E] py-3.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-black transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
