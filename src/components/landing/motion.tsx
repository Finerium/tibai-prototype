"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_COUNT: [number, number, number, number] = [0.25, 1, 0.5, 1];

const TAGS = {
  div: motion.div,
  span: motion.span,
  p: motion.p,
  h2: motion.h2,
  h3: motion.h3,
  li: motion.li,
  article: motion.article,
} as const;

/**
 * Scroll reveal primitive (opacity 0 / y 26 -> in). Fires once. Under reduced
 * motion it renders the final state immediately.
 */
export function Reveal({
  as = "div",
  children,
  className,
  style,
  id,
}: {
  as?: keyof typeof TAGS;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
}) {
  const reduce = useReducedMotion();
  const M = TAGS[as];
  // initial state stays deterministic for SSR; only the transition duration is
  // reduce-aware (transitions apply client-side, so no hydration mismatch).
  return (
    <M
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0 : 0.95, ease: EASE_OUT }}
    >
      {children}
    </M>
  );
}

/** Count up to a target when scrolled into view. */
export function CountUp({
  to,
  duration = 1.6,
  decimals = 0,
  className,
  suffix = "",
}: {
  to: number;
  duration?: number;
  decimals?: number;
  className?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // duration 0 under reduced motion: jumps to the final value with no tween.
    const controls = animate(0, to, {
      duration: reduce ? 0 : duration,
      ease: EASE_COUNT,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  const display = decimals ? val.toFixed(decimals) : Math.round(val);
  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}

/** Horizontal bar that scales in (transform-origin left) when in view. */
export function BarFill({
  to,
  className,
  style,
  duration = 1.3,
  delay = 0,
}: {
  to: number;
  className?: string;
  style?: CSSProperties;
  duration?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={className}
      style={{ ...style, transformOrigin: "left" }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: to }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: reduce ? 0 : duration, ease: EASE_OUT, delay: reduce ? 0 : delay }}
    />
  );
}
