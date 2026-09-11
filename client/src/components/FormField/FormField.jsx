import React from "react";

/**
 * লেবেল + কন্ট্রোল — মূল সাইটের `.form-wrap`।
 *
 * মাপ (মূল সাইট থেকে): সারি ২১.০৬u উঁচু = টাইটেল ৫.৬u + গ্যাপ ২.১৩৩u +
 * কনটেন্ট ১৩.৩৩u। টাইটেল --fs-larger, রঙ neutral300।
 */
const FormField = ({ label, children, error }) => {
  return (
    <div className="w-full">
      <p
        className="text-[var(--text-secondary)]"
        style={{
          fontSize: "var(--fs-larger)",
          height: "calc(var(--u) * 5.6)",
          marginBottom: "calc(var(--u) * 2.133)",
        }}
      >
        {label}
      </p>

      {children}

      {error && (
        <p
          className="text-[var(--status-danger)]"
          style={{
            fontSize: "var(--fs-normal)",
            marginTop: "calc(var(--u) * 1.067)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

/** `.input__inner` — ৫০px উঁচু, bg neutral800, radius --radius-10 */
export const TextInput = ({ className = "", ...props }) => (
  <div
    className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
    style={{
      height: "calc(var(--u) * 13.333)",
      borderRadius: "var(--radius-10)",
    }}
  >
    <input
      {...props}
      className={`h-full w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)] ${className}`}
      style={{
        fontSize: "var(--fs-larger)",
        paddingInline: "calc(var(--u) * 4.267)",
      }}
    />
  </div>
);

export default FormField;
