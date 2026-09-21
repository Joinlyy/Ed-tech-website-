import { useEffect, useRef, useState } from 'react';
import { faqItems } from '@/config/site';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const refs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    refs.current.forEach((el, i) => {
      if (!el) return;
      el.style.maxHeight = openIndex === i ? `${el.scrollHeight}px` : '0px';
    });
  }, [openIndex]);

  return (
    <section className="section" id="faq">
      <div className="wrap">
        <div className="head center">
          <h2>Questions parents ask first</h2>
        </div>
        <div className="faq-list">
          {faqItems.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={item.question} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="faq-q"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  {item.question}
                </button>
                <div
                  className="faq-a"
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
