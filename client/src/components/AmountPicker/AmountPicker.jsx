import React from "react";

/**
 * টাকার অঙ্ক বসানোর ঘর — উপরে ইনপুট, নিচে চেনা কয়েকটা অঙ্কের বোতাম।
 *
 * বেশিরভাগ মানুষ গোল সংখ্যাতেই লেনদেন করেন, তাই এক চাপেই বসে যায়;
 * তবু ইনপুটটা খোলা থাকে — যিনি ৩৭৫ দিতে চান তিনি টাইপ করবেন।
 *
 * চাপ দেওয়া অঙ্কটা হাইলাইট হয় বলে কোনটা বাছা হয়েছে সেটা এক নজরেই
 * বোঝা যায়, আর টাইপ করে বদলালে হাইলাইটও নিজে থেকে সরে যায়।
 *
 * মিন-ম্যাক্সের বাইরের অঙ্কগুলো দেখানোই হয় না — চাপার পর "পারবেন না"
 * শোনার চেয়ে বোতামটা না থাকাই পরিষ্কার।
 */
const QUICK = [200, 400, 600, 800, 1000, 1500, 2000];

const AmountPicker = ({
  value,
  onChange,
  placeholder,
  currency = "",
  min = 0,
  max = 0,
}) => {
  const boxStyle = {
    height: "calc(var(--u) * 13.333)",
    borderRadius: "var(--radius-10)",
  };

  const options = QUICK.filter(
    (item) => (min <= 0 || item >= min) && (max <= 0 || item <= max),
  );

  const picked = String(value || "").trim();

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--u) * 2.667)" }}>
      <div
        className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
        style={boxStyle}
      >
        {currency ? (
          <span
            className="flex h-full shrink-0 items-center font-bold text-[var(--text-disabled)]"
            style={{
              fontSize: "var(--fs-larger)",
              paddingInlineStart: "calc(var(--u) * 4.267)",
            }}
          >
            {currency}
          </span>
        ) : null}

        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ""))}
          placeholder={placeholder}
          className="h-full w-full bg-transparent font-bold text-[var(--text-primary)] outline-none placeholder:font-normal placeholder:text-[var(--text-disabled)]"
          style={{
            fontSize: "var(--fs-body)",
            paddingInline: "calc(var(--u) * 4.267)",
          }}
        />
      </div>

      {options.length ? (
        <div
          className="grid grid-cols-4 sm:grid-cols-7"
          style={{ gap: "calc(var(--u) * 2.133)" }}
        >
          {options.map((item) => {
            const on = picked === String(item);

            return (
              <button
                key={item}
                type="button"
                onClick={() => onChange(String(item))}
                className="flex cursor-pointer items-center justify-center font-bold transition-colors"
                style={{
                  height: "calc(var(--u) * 10.667)",
                  borderRadius: "var(--radius-10)",
                  fontSize: "var(--fs-larger)",
                  background: on
                    ? "var(--primary500)"
                    : "var(--form-box-bg)",
                  color: on ? "var(--neutral900)" : "var(--text-secondary)",
                  border: `1px solid ${
                    on ? "var(--primary500)" : "transparent"
                  }`,
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default AmountPicker;
