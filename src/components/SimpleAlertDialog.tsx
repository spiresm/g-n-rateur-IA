import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface SimpleAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  cancelText?: string;
  confirmText?: string;
  onConfirm: () => void;
}

export function SimpleAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = 'Annuler',
  confirmText = 'Confirmer',
  onConfirm,
}: SimpleAlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-w-lg w-full mx-4 p-6 z-50">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl text-white">{title}</h2>
        </div>

        {/* Description */}
        <div className="text-gray-300 mb-6">{description}</div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 text-white hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
