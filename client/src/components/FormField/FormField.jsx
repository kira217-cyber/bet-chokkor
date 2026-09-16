import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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

/**
 * পাসওয়ার্ডের ঘর — পাশে দেখা/লুকানোর চোখ।
 *
 * `TextInput` এর মতোই মাপ, শুধু ডানে একটা বোতাম বাড়ে। লেখা না থাকলে
 * চোখটা দেখানোর মানে নেই, তাই তখন লুকিয়ে থাকে।
 */
export const PasswordInput = ({ value, hideLabel, showLabel, ...props }) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
      style={{
        height: "calc(var(--u) * 13.333)",
        borderRadius: "var(--radius-10)",
      }}
    >
      <input
        {...props}
        value={value}
        type={show ? "text" : "password"}
        className="h-full w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
        style={{
          fontSize: "var(--fs-larger)",
          paddingInline: "calc(var(--u) * 4.267)",
        }}
      />

      {value ? (
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? hideLabel || "hide password" : showLabel || "show password"}
          className="flex shrink-0 cursor-pointer items-center justify-center text-[var(--text-disabled)] transition-colors hover:text-[var(--text-secondary)]"
          style={{
            height: "calc(var(--u) * 6.4)",
            width: "calc(var(--u) * 6.4)",
            marginInlineEnd: "calc(var(--u) * 3.2)",
          }}
        >
          {show ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      ) : null}
    </div>
  );
};

export default FormField;
