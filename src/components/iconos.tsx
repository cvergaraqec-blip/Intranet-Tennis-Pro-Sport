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

// Logotipo PROSPORT; va sobre fondo oscuro.
export function Logo({ className = "" }: Props) {
  return (
    <span
      className={`font-[family-name:'Exo_2'] text-acento italic leading-none tracking-tight ${className}`}
      aria-label="Tennis ProSport"
      role="img"
    >
      <span className="font-extrabold">PRO</span>
      <span className="font-light">SPORT</span>
    </span>
  );
}

export function IconoReloj({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h8M8 11h3M13 11h3M8 15h3M13 15h3" />
    </svg>
  );
}

export function IconoEntrada({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3h5a2 2 0 012 2v14a2 2 0 01-2 2h-5" />
      <path d="M3 12h12M11 8l4 4-4 4" />
    </svg>
  );
}

export function IconoSalida({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3H5a2 2 0 00-2 2v14a2 2 0 002 2h5" />
      <path d="M9 12h12M17 8l4 4-4 4" />
    </svg>
  );
}
