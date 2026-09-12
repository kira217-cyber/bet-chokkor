import React from "react";

/**
 * ল্যান্ডিং পেজের সব সেকশনের সাধারণ মোড়ক — একই কনটেইনার প্রস্থ,
 * একই ভার্টিক্যাল ছন্দ আর ঐচ্ছিক টাইটেল ব্লক।
 *
 * ক্লায়েন্ট সাইটের মতোই ডেস্কটপে কনটেন্ট ১২০০px এ সীমাবদ্ধ।
 */
const Section = ({ id, eyebrow, title, text, children, className = "" }) => {
  return (
    <section id={id} className={`aff-section ${className}`}>
      <div className="aff-container">
        {(eyebrow || title || text) && (
          <div className="aff-section__head">
            {eyebrow && <p className="aff-eyebrow">{eyebrow}</p>}

            {title && <h2 className="aff-h2">{title}</h2>}

            {text && <p className="aff-lead">{text}</p>}
          </div>
        )}

        {children}
      </div>
    </section>
  );
};

export default Section;
