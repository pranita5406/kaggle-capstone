"use client";

import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4 animate-in scale-95 zoom-in-95">
        <div className="p-6 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-start gap-3">
            {isDangerous && (
              <div className="p-2 bg-red-900/30 rounded-lg mt-0.5">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            )}
            <h2 className={cn(
              "font-bold text-lg tracking-tight",
              isDangerous ? "text-red-300" : "text-white"
            )}>
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-300 transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            {message}
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg border border-slate-700 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                "px-4 py-2 font-medium rounded-lg border transition",
                isDangerous
                  ? "bg-red-600 hover:bg-red-500 text-white border-red-500"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500"
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
