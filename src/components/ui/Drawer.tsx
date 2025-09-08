import React from "react";

export default function Drawer({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string; }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-sm px-2 py-1 border rounded">Close</button>
        </div>
        <div className="p-4 overflow-auto flex-1">{children}</div>
      </div>
    </div>
  );
}


