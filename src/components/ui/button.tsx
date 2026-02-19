import React from 'react';

export function Button({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      style={{
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px solid #ddd',
        background: '#111',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
        opacity: props.disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
