import { useState } from "react";
import { motion } from "framer-motion";
import { HiPaperAirplane } from "react-icons/hi";
import { submitContact } from "../../lib/api";
import { useToast } from "../../hooks/useToast";
import { INITIAL_FORM, SERVICE_OPTIONS } from "./constants";
import { FloatingInput, FloatingSelect, FloatingTextarea } from "./FloatingField";
import SuccessState from "./SuccessState";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};
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
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate(form);
    if (Object.keys(validation).length) {
      setErrors(validation);
      toast("Please fix the highlighted fields.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        company: form.company.trim() || null,
        service: form.service,
        message: form.message.trim(),
        website: form.website,
      };
      await submitContact(payload);
      setSubmittedEmail(payload.email);
      setSuccess(true);
      toast("Your message was sent successfully!", "success");
    } catch (err) {
      console.error("Contact submission failed", err);
      const detail = err.response?.data?.detail;
      let message = "Something went wrong. Please try again.";

      if (err.response) {
        if (typeof detail === "string") message = detail;
        else if (Array.isArray(detail)) {
          message = detail.map((d) => d.msg || d.message).join(", ");
        } else if (detail?.message) message = detail.message;
        else if (err.response.statusText) {
          message = `${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.message) {
        if (window.location.hostname !== "localhost") {
          message =
            "Contact backend is not configured for this site. " +
            "Please set VITE_API_URL to your API URL or deploy the backend on the same origin.";
        } else {
          message = `Network error: ${err.message}`;
        }
      }

      if (err.response?.status === 429) {
        message = "Too many requests. Please wait a minute and try again.";
      }
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setSuccess(false);
    setSubmittedEmail("");
  };

  if (success) {
    return <SuccessState onReset={handleReset} email={submittedEmail} />;
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
      noValidate
    >
      {/* Honeypot — hidden from users */}
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

      <div className="grid gap-5 sm:grid-cols-2">
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
          label="Email"
          type="email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          required
          autoComplete="email"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
          label="Company Name"
          value={form.company}
          onChange={set("company")}
          error={errors.company}
          autoComplete="organization"
        />
      </div>

      <FloatingSelect
        id="service"
        label="Service Required"
        value={form.service}
        onChange={set("service")}
        error={errors.service}
        required
        options={SERVICE_OPTIONS}
      />

      <FloatingTextarea
        id="message"
        label="Message"
        value={form.message}
        onChange={set("message")}
        error={errors.message}
        required
        rows={5}
      />

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={loading ? {} : { scale: 1.02, y: -2 }}
        whileTap={loading ? {} : { scale: 0.98 }}
        className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 text-sm font-semibold text-white shadow-[0_0_40px_rgba(139,92,246,0.35)] transition-opacity disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
      >
        {!loading && (
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        )}
        <span className="relative flex items-center gap-2">
          {loading ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Sending…
            </>
          ) : (
            <>
              Send Message
              <HiPaperAirplane className="text-lg" />
            </>
          )}
        </span>
      </motion.button>
    </motion.form>
  );
}
