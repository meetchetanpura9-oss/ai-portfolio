"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { HiPaperAirplane } from "react-icons/hi";
import { submitContact, ContactData } from "../../lib/api";
import { useToast } from "../../hooks/useToast";
import { INITIAL_FORM, SERVICE_OPTIONS } from "./constants";
import { FloatingInput, FloatingSelect, FloatingTextarea } from "./FloatingField";
import SuccessState from "./SuccessState";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  message: string;
  website: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  service?: string;
  message?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.full_name.trim() || form.full_name.trim().length < 2) {
    errors.full_name = "Name must be at least 2 characters";
  }
  if (!EMAIL_RE.test(form.email)) {
    errors.email = "Enter a valid email address";
  }
  if (!form.phone.trim() || form.phone.trim().length < 7) {
    errors.phone = "Enter a valid phone number";
  }
  if (!form.service) {
    errors.service = "Please select a service";
  }
  if (!form.message.trim() || form.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters";
  }
  return errors;
}

export default function ContactForm() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submitError, setSubmitError] = useState("");
  const submittingRef = useRef(false);

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setSubmitError("");
    const validation = validate(form);
    if (Object.keys(validation).length) {
      setErrors(validation);
      toast("Please fix the highlighted fields.", "error");
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    try {
      const payload: ContactData = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim() || undefined,
        service: form.service,
        message: form.message.trim(),
        website: form.website,
      };
      await submitContact(payload);
      setSubmittedEmail(payload.email);
      setSuccess(true);
      toast("Your message was sent successfully!", "success");
    } catch {
      setSubmitError("We couldn't send your message. Please try again.");
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSuccess(false);
    setSubmittedEmail("");
    setSubmitError("");
  };

  if (success) {
    return <SuccessState onReset={handleReset} email={submittedEmail} />;
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
      noValidate
    >
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FloatingInput
          id="full_name"
          label="Full Name"
          value={form.full_name}
          onChange={set("full_name")}
          error={errors.full_name}
          required
          autoComplete="name"
        />
        <FloatingInput
          id="email"
          label="Email Address"
          type="email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          required
          autoComplete="email"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FloatingInput
          id="phone"
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          error={errors.phone}
          required
          autoComplete="tel"
        />
        <FloatingInput
          id="company"
          label="Company / Organization"
          value={form.company}
          onChange={set("company")}
          error={errors.company}
          autoComplete="organization"
        />
      </div>

      <FloatingSelect
        id="service"
        label="Service Interest"
        value={form.service}
        onChange={set("service")}
        error={errors.service}
        required
        options={SERVICE_OPTIONS}
      />

      <FloatingTextarea
        id="message"
        label="Project Details or Inquiry"
        value={form.message}
        onChange={set("message")}
        error={errors.message}
        required
        rows={4}
      />

      {submitError && (
        <p role="alert" aria-live="assertive" className="rounded-xl border border-rose-500/60 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-500">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="key-gloss flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <span>Sending Message...</span>
        ) : (
          <>
            <span>Start a Conversation</span>
            <HiPaperAirplane className="text-base" />
          </>
        )}
      </button>
    </motion.form>
  );
}
