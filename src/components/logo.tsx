export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "size-6",
    default: "size-8",
    large: "size-10",
  };

  return (
    <img
      src="/logo.svg"
      alt="linQ logo"
      className={`${sizeClasses[size]} aspect-square rounded-full object-cover`}
    />
  );
}
