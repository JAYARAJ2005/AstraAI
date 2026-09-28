import { useId } from "react";

// AstraAI star logo (same shape and colors as the Welcome page logo)
function AstraLogo({ className = "astra-logo" }) {
  // Unique gradient id per logo, so several logos on one page never clash
  const rawId = useId();

  const gradientId = `astra-gradient-${rawId.replace(
    /[^a-zA-Z0-9]/g,
    ""
  )}`;

  return (
    <svg
      className={className}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M28 2 L33 23 L54 28 L33 33 L28 54 L23 33 L2 28 L23 23 Z"
        fill={`url(#${gradientId})`}
      />

      <defs>
        <linearGradient
          id={gradientId}
          x1="2"
          y1="2"
          x2="54"
          y2="54"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default AstraLogo;