import { Link } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import { useAuth } from "../../hooks/useAuth";
import { useFormState } from "../../hooks/useFormState";
import { validateLogin } from "../../utils/validators";

export default function Login() {
  const { login, sessionExpired } = useAuth();
  const { values, errors, formError, isSubmitting, handleChange, submit } = useFormState({
    email: "",
    password: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    submit(validateLogin, async (credentials) => {
      await login(credentials);
      toast.success("Welcome back!");
    });
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back to SplitCircle."
      footer={
        <>
          New to SplitCircle?{" "}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {sessionExpired && <Alert variant="warning">Your session has expired. Please sign in again.</Alert>}
        {formError && <Alert variant="error">{formError}</Alert>}

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
        />
        <PasswordInput
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
