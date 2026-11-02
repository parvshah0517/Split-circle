import { useState } from "react";
import { toast } from "sonner";

import Alert from "../components/common/Alert";
import Avatar from "../components/common/Avatar";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import PageHeader from "../components/common/PageHeader";

import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "Not available";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Name is required.");
      return;
    }

    if (trimmedName.length > 100) {
      setFormError("Name cannot exceed 100 characters.");
      return;
    }

    try {
      setIsSubmitting(true);

      await updateProfile({ name: trimmedName });

      toast.success("Account information updated.");
    } catch (error) {
      setFormError(
        error?.message || "Unable to update account information.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Information"
        description="View and manage your personal account details."
      />

      <Card className="max-w-2xl p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name} size="lg" />

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {user?.name}
            </h2>

            <p className="truncate text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <h3 className="mb-4 text-base font-semibold text-foreground">
            Personal Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && <Alert variant="error">{formError}</Alert>}

            <Input
              id="name"
              name="name"
              label="Full Name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
            />

            <Input
              id="email"
              label="Email Address"
              type="email"
              value={user?.email ?? ""}
              disabled
              hint="Your registered email address."
            />

            <Input
              id="createdAt"
              label="Account Created"
              value={createdAt}
              disabled
            />

            <div className="flex justify-end">
              <Button type="submit" loading={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}