/**
 * Floating-label input / textarea / select, themed with design tokens.
 */

const fieldBase =
  "peer w-full rounded-xl border bg-bg px-4 pb-2.5 pt-6 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder-transparent focus:border-brand-blue focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand-blue)_15%,transparent)]";
const fieldOk = "border-line";
const fieldErr = "border-brand-rose focus:border-brand-rose focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--brand-rose)_15%,transparent)]";

const labelBase =
  "pointer-events-none absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 text-sm text-subtle transition-all duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-brand-blue";

// `required` on the control is announced by screen readers, so the asterisk is visual only.
function Label({ label, required }) {
  return (
    <>
      {label}
      {required && (
        <span className="text-brand-rose" aria-hidden>
          {" "}
          *
        </span>
      )}
    </>
  );
}

function ErrorText({ id, error }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-brand-rose">
      {error}
    </p>
  );
}

export function FloatingInput({ id, label, type = "text", value, onChange, error, required, autoComplete, ...rest }) {
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        {...rest}
        placeholder=" "
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${fieldBase} ${error ? fieldErr : fieldOk}`}
      />
      <label htmlFor={id} className={labelBase}>
        <Label label={label} required={required} />
      </label>
      <ErrorText id={id} error={error} />
    </div>
  );
}

export function FloatingTextarea({ id, label, value, onChange, error, required, rows = 4 }) {
  return (
    <div className="relative">
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        placeholder=" "
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${fieldBase} resize-none ${error ? fieldErr : fieldOk}`}
      />
      <label htmlFor={id} className={labelBase}>
        <Label label={label} required={required} />
      </label>
      <ErrorText id={id} error={error} />
    </div>
  );
}

export function FloatingSelect({ id, label, value, onChange, error, required, options }) {
  return (
    <div className="relative">
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${fieldBase} appearance-none pr-10 ${error ? fieldErr : fieldOk} ${value ? "text-ink" : "text-subtle"}`}
      >
        <option value="" disabled>
          Select a service
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-surface text-ink">
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/3 items-center text-subtle transition-colors peer-focus:text-brand-blue">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-4 w-4" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 text-sm transition-colors duration-200 peer-focus:text-brand-blue ${
          value ? "text-brand-blue" : "text-subtle"
        }`}
      >
        <Label label={label} required={required} />
      </label>
      <ErrorText id={id} error={error} />
    </div>
  );
}
