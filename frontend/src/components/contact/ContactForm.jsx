import { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { apiErrorMessage, submitContact } from "../../lib/api";
import { useToast } from "../../hooks/useToast";
import { CUSTOM_SERVICE, INITIAL_FORM, SERVICE_OPTIONS } from "./constants";
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
  } else if (form.service === CUSTOM_SERVICE && form.custom_service.trim().length < 2) {
    errors.custom_service = "Tell me which service you need";
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
        service: form.service === CUSTOM_SERVICE ? form.custom_service.trim() : form.service,
        message: form.message.trim(),
        website: form.website,
      };
      await submitContact(payload);
      setSubmittedEmail(payload.email);
      setSuccess(true);
      toast("Your message was sent successfully!", "success");
    } catch (err) {
      console.error("Contact submission failed", err);
      toast(apiErrorMessage(err), "error");
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

      {form.service === CUSTOM_SERVICE && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <FloatingInput
            id="custom_service"
            label="Your service (e.g. Chatbot for my clinic)"
            value={form.custom_service}
            onChange={set("custom_service")}
            error={errors.custom_service}
            required
            maxLength={120}
            autoFocus
          />
        </motion.div>
      )}

      <FloatingTextarea
        id="message"
        label="Message"
        value={form.message}
        onChange={set("message")}
        error={errors.message}
        required
        rows={5}
      />

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full !py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
            Sending…
          </>
        ) : (
          <>
            Send Message
            <Send size={17} aria-hidden />
          </>
        )}
      </button>
    </motion.form>
  );
}
