import { describe, expect, it } from "vitest";
import { validateProfile, validateRegistration } from "./validators";

describe("validateRegistration", () => {
  it("reports every invalid field", () => {
    expect(
      validateRegistration({ name: " ", email: "nope", password: "short", confirmPassword: "other" }),
    ).toEqual({
      name: "Full name is required.",
      email: "Enter a valid email address.",
      password: "Password must be at least 8 characters.",
      confirmPassword: "Passwords don't match.",
    });
  });

  it("accepts a valid submission", () => {
    expect(
      validateRegistration({
        name: "Alex",
        email: "alex@example.com",
        password: "Password123",
        confirmPassword: "Password123",
      }),
    ).toEqual({});
  });
});

describe("validateProfile", () => {
  it("allows a blank avatar and rejects non-http URLs", () => {
    expect(validateProfile({ name: "Alex", avatarUrl: "" })).toEqual({});
    expect(validateProfile({ name: "Alex", avatarUrl: "javascript:alert(1)" })).toEqual({
      avatarUrl: "Enter a valid image URL starting with http or https.",
    });
  });
});
