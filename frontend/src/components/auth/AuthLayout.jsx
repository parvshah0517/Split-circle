import Logo from "../common/Logo";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ECEEF2] p-4 sm:p-6 selection:bg-[#00C4A7] selection:text-white">
      <div className="w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="inline-block">
            <Logo />
          </div>
          <p className="mt-2 text-xs font-medium text-gray-500">
            Smarter group expenses & seamless settlements
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-[32px] border border-gray-100 bg-white p-7 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.06)]">
          <h1 className="text-xl font-black tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-xs text-gray-400 font-medium">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <div className="mt-6 text-center text-xs font-medium text-gray-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
