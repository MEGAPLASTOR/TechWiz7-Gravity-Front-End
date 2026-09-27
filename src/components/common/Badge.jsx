import React from "react";
import "@/assets/styles/components/common/Badge.css";
export default function Badge({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
  ...props
}) {
  return (
    <span
      className={`ml-badge ml-badge--${variant} ml-badge--${size} ${className}`}
      {...props}
    >
      {dot && <span className="ml-badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
