export default function Button({ className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium shadow-sm border bg-white hover:bg-slate-50 ${className}`}
      {...props}
    />
  );
}


