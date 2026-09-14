import React, { useCallback, useMemo, useRef, useState } from "react";

import AlertModal from "../components/AlertModal/AlertModal";
import { AlertContext } from "./alertContext";

/**
 * সাইটের সব বার্তা এক জায়গা থেকে।
 *
 * `showConfirm` একটা Promise দেয়, তাই কল করার জায়গায় সরাসরি
 * `if (await showConfirm(...))` লেখা যায় — কলব্যাক ছড়াতে হয় না।
 */
const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  // চলতি confirm এর উত্তর কোথায় পাঠাতে হবে
  const resolveRef = useRef(null);

  const settle = useCallback((answer) => {
    setAlert(null);

    if (resolveRef.current) {
      resolveRef.current(answer);
      resolveRef.current = null;
    }
  }, []);

  const showAlert = useCallback((next) => {
    resolveRef.current = null;
    setAlert({ type: "info", ...next, isConfirm: false });
  }, []);

  const showConfirm = useCallback(
    (next) =>
      new Promise((resolve) => {
        resolveRef.current = resolve;
        setAlert({ type: "confirm", ...next, isConfirm: true });
      }),
    [],
  );

  const value = useMemo(() => ({ showAlert, showConfirm }), [
    showAlert,
    showConfirm,
  ]);

  return (
    <AlertContext.Provider value={value}>
      {children}

      <AlertModal
        alert={alert}
        onClose={() => settle(false)}
        onConfirm={alert?.isConfirm ? () => settle(true) : undefined}
      />
    </AlertContext.Provider>
  );
};

export default AlertProvider;
