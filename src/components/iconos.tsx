type Props = { className?: string };

export function IconoInventario({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

export function IconoHorarios({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconoEmpleados({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5" />
      <path d="M16 4.5a3.5 3.5 0 010 7M18 14.8c1.8.7 3 2.5 3.5 5.2" />
    </svg>
  );
}

export function IconoBuscar({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

export function Logo({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="12" fill="#ddf06a" />
      <path d="M5 8c5 4 5 8 0 12M23 8c-5 4-5 8 0 12" fill="none" stroke="#0f1b2d" strokeWidth="2" />
    </svg>
  );
}
