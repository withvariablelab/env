// env's Sign, the same shape as package/brand/sign.svg. When the Sign changes, change this copy too.
export function Sign({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} aria-hidden="true" className={className}>
      <path fill="currentColor" fillRule="evenodd" d="M2 2h20v20H2V2zm4 8h12v4H6v-4z" />
    </svg>
  );
}
