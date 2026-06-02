/**
 * Floating-label input / textarea / select with focus glow.
 */
export function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  required,
  autoComplete,
}) {
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
        placeholder=" "
        className={`peer w-full rounded-xl border bg-white/[0.04] px-4 pb-2.5 pt-6 text-sm text-white outline-none backdrop-blur-md transition-[border-color,box-shadow] duration-300 placeholder-transparent focus:border-violet-500/50 focus:shadow-[0_0_24px_rgba(139,92,246,0.25)] ${
          error 
            ? "border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.15)] focus:border-rose-500 focus:shadow-[0_0_20px_rgba(244,63,94,0.25)]" 
            : "border-white/10"
        }`}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 text-xs text-gray-500 transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-violet-400"
      >
        {label}
        {required && <span className="text-violet-400"> *</span>}
      </label>
      {error && <p className="mt-1.5 text-xs text-rose-400 font-semibold">{error}</p>}
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
        className={`peer w-full resize-none rounded-xl border bg-white/[0.04] px-4 pb-2.5 pt-6 text-sm text-white outline-none backdrop-blur-md transition-[border-color,box-shadow] duration-300 placeholder-transparent focus:border-violet-500/50 focus:shadow-[0_0_24px_rgba(139,92,246,0.25)] ${
          error 
            ? "border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.15)] focus:border-rose-500 focus:shadow-[0_0_20px_rgba(244,63,94,0.25)]" 
            : "border-white/10"
        }`}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 z-10 origin-[0] -translate-y-3 scale-75 text-xs text-gray-500 transition-all duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-violet-400"
      >
        {label}
        {required && <span className="text-violet-400"> *</span>}
      </label>
      {error && <p className="mt-1.5 text-xs text-rose-400 font-semibold">{error}</p>}
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
        className={`peer w-full appearance-none rounded-xl border bg-white/[0.04] px-4 pr-10 pb-2.5 pt-6 text-sm text-white outline-none backdrop-blur-md transition-[border-color,box-shadow] duration-300 focus:border-violet-500/50 focus:shadow-[0_0_24px_rgba(139,92,246,0.25)] ${
          error 
            ? "border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.15)] focus:border-rose-500 focus:shadow-[0_0_20px_rgba(244,63,94,0.25)]" 
            : "border-white/10"
        } ${!value ? "text-gray-500" : "text-white"}`}
      >
        <option value="" disabled>
          Select a service
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#14141f] text-white">
            {opt}
          </option>
        ))}
      </select>

      {/* Elegant Custom Chevron Arrow */}
      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/3 flex items-center text-gray-500 peer-focus:text-violet-400 transition-colors duration-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 z-10 origin-[0] text-xs transition-all duration-300 ${
          value
            ? "-translate-y-3 top-4 scale-75 text-violet-400"
            : "top-4 scale-100 text-gray-500 peer-focus:-translate-y-3 peer-focus:top-4 peer-focus:scale-75 peer-focus:text-violet-400"
        }`}
      >
        {label}
        {required && <span className="text-violet-400"> *</span>}
      </label>
      {error && <p className="mt-1.5 text-xs text-rose-400 font-semibold">{error}</p>}
    </div>
  );
}
