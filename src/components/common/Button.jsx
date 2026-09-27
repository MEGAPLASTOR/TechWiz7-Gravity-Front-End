import React, { useState } from 'react';
import '@/assets/styles/components/common/Button.css';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'accent' | 'outline' | 'ghost' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  icon = null,
  iconRight = null,
  loading = false,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const [autoLoading, setAutoLoading] = useState(false);
  const isLoading = loading || autoLoading;

  const handleClick = (event) => {
    const result = onClick?.(event);
    if (result && typeof result.then === 'function') {
      setAutoLoading(true);
      Promise.resolve(result).then(
        () => setAutoLoading(false),
        () => setAutoLoading(false)
      );
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-busy={isLoading || undefined}
      className={
        'ml-btn ml-btn--' + variant + ' ml-btn--' + size +
        (fullWidth ? ' ml-btn--full' : '') +
        (isLoading ? ' ml-btn--loading' : '') +
        ' ' + className
      }
      {...props}
    >
      {isLoading ? (
        <span className="ml-btn-spinner" aria-hidden="true" />
      ) : (
        icon && <span className="ml-btn-icon-left">{icon}</span>
      )}
      <span className="ml-btn-label">{children}</span>
      {!isLoading && iconRight && <span className="ml-btn-icon-right">{iconRight}</span>}
    </button>
  );
}
