import { Link } from "react-router-dom";
import { toast } from "sonner";
import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import { useAuth } from "../../hooks/useAuth";
import { useFormState } from "../../hooks/useFormState";
import { MIN_PASSWORD_LENGTH, validateRegistration } from "../../utils/validators";

export default function Register() {
  const { register } = useAuth();
  const { values, errors, formError, isSubmitting, handleChange, submit } = useFormState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    submit(validateRegistration, async ({ name, email, password }) => {
      await register({ name: name.trim(), email: email.trim(), password });
      toast.success("Your account is ready.");
    });
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start splitting shared costs in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {formError && <Alert variant="error">{formError}</Alert>}

        <Input
          id="name"
          name="name"
          label="Full name"
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
        />
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
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          value={values.password}
          onChange={handleChange}
          error={errors.password}
        />
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
