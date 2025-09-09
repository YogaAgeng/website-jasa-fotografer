export default function Button(
  {
    className = "",
    variant = "default",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
    variant?: "default" | "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
  }
) {
  const base = "inline-flex items-center justify-center rounded-md font-medium border transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    default: "bg-white text-gray-700 border-gray-300 hover:bg-slate-50",
    primary: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
    danger: "bg-red-500 text-white border-red-500 hover:bg-red-600",
    ghost: "bg-transparent text-gray-700 border-transparent hover:bg-gray-100",
  };
  const sizes: Record<string, string> = {
    sm: "text-xs px-2.5 py-1.5 gap-1",
    md: "text-sm px-3 py-2 gap-2",
    lg: "text-base px-4 py-2.5 gap-2.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      )}
      {!loading && leftIcon}
      <span className="inline-flex items-center">{children}</span>
      {!loading && rightIcon}
    </button>
  );
}


