interface ColorDotProps {
  readonly color: string;
  readonly className?: string;
}

export function ColorDot({ color, className = "size-2.5" }: ColorDotProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rounded-full ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
