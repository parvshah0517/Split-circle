import Logo from "../common/Logo";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 to-brand-600 p-12 text-white lg:flex">
        <Logo inverted />
        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight">Split shared costs without the awkward follow-ups.</h2>
          <p className="mt-4 text-brand-100">
            Track group expenses, review split previews, and see exactly who owes whom.
          </p>
        </div>
        <p className="text-sm text-brand-200">Balances update only after expenses are approved.</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
