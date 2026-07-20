/*
 * src/components/ui/Spinner.tsx
 *
 * Reusable inline spinner. Uses the sn-spin CSS animation defined in globals.css.
 * Size and colour are controllable via props.
 */

interface SpinnerProps {
  /** diameter in px — default 16 */
  size?: number;
  /** border colour — defaults to current brand primary */
  color?: string;
  className?: string;
}

export default function Spinner({ size = 16, color = "var(--color-brand-primary)", className = "" }: SpinnerProps) {
  return (
    <span
      className={`sn-spin inline-block rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        border: `2px solid transparent`,
        borderTopColor: color,
        borderRightColor: color,
      }}
      aria-hidden="true"
    />
  );
}
