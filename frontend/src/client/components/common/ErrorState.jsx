import Button from "./Button";

export default function ErrorState({ title = "Something went wrong", message, onRetry, className }) {
  return (
    <div role="alert" className={`flex flex-col items-center justify-center px-6 py-10 text-center ${className ?? ""}`}>
      <h3 className="text-base font-semibold text-destructive">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
