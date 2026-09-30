import logo from "@/assets/green-wedding-logo.jpg";

interface BrandLogoProps {
  showName?: boolean;
  light?: boolean;
  compact?: boolean;
  className?: string;
}

export const BrandLogo = ({ showName = true, light = false, compact = false, className = "" }: BrandLogoProps) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <img
      src={logo}
      alt="Green Wedding"
      className={`${compact ? "h-9 w-9" : "h-11 w-11"} shrink-0 rounded-md object-cover object-center shadow-sm ring-1 ring-black/10`}
    />
    {showName && <span className={`${compact ? "text-lg" : "text-xl"} font-display font-bold leading-none ${light ? "text-white" : "text-primary-900"}`}>Green Wedding</span>}
  </span>
);
