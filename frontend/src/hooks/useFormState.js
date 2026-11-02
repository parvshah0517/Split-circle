import { useCallback, useState } from "react";
import { getFieldErrors } from "../utils/apiError";

export function useFormState(initialValues) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  }, []);

  const submit = useCallback(
    async (validate, onSubmit) => {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      setFormError("");
      if (Object.keys(validationErrors).length > 0) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        const fieldErrors = getFieldErrors(error);
        setErrors(fieldErrors);
        setFormError(Object.keys(fieldErrors).length > 0 ? "" : error.message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values],
  );

  return { values, errors, formError, isSubmitting, handleChange, submit };
}
