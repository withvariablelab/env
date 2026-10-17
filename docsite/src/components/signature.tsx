import logo from "@variablelab/brand/assets/logo.svg";

// Variable Lab's Signature: the Logo 16px wide at its own proportions (16x18.6), 8px from
// "Variable Land" set as text, one link to lab.variable.land. The Logo is decorative, so
// the link's name is the text. It signs the docs apart from env's Sign, never beside it.
// On hover the text takes a dim underline at a 4px offset, as links do on www.
export function Signature() {
  return (
    <a
      href="https://lab.variable.land"
      className="mt-4 inline-flex items-center gap-2 self-start text-[13px] font-medium tracking-[-0.015em] text-fd-foreground decoration-(--vlab-dim) decoration-1 underline-offset-4 hover:underline"
    >
      <img src={logo} alt="" width={16} className="h-auto shrink-0" />
      Variable Land
    </a>
  );
}
