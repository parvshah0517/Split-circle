import { toast } from "sonner";
import Alert from "../components/common/Alert";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../hooks/useAuth";
import { useFormState } from "../hooks/useFormState";
import { validateProfile } from "../utils/validators";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { values, errors, formError, isSubmitting, handleChange, submit } = useFormState({
    name: user?.name ?? "",
    avatarUrl: user?.avatarUrl ?? "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    submit(validateProfile, async (form) => {
      await updateProfile({
        name: form.name.trim(),
        avatarUrl: form.avatarUrl.trim() || null,
      });
      toast.success("Profile updated.");
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage how you appear to your groups." />

      <Card className="max-w-2xl p-6">
        <div className="flex items-center gap-4">
          <Avatar name={values.name || user?.name} src={values.avatarUrl.trim() || undefined} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-foreground">{user?.name}</p>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          {formError && <Alert variant="error">{formError}</Alert>}

          <Input
            id="name"
            name="name"
            label="Name"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            label="Avatar URL"
            placeholder="https://example.com/photo.jpg"
            hint="Optional. Must start with http:// or https://."
            value={values.avatarUrl}
            onChange={handleChange}
            error={errors.avatarUrl}
          />

          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
