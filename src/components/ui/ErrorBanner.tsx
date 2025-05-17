// src/components/ui/ErrorBanner.tsx
import { AlertTriangle } from "lucide-react";
import React from "react";

interface Props {
  error?: Error | null;        // accepte undefined pour éviter les crash
  title?: string;
}

const ErrorBanner: React.FC<Props> = ({
  error,
  title = "Une erreur est survenue",
}) => {
  if (!error) return null;     // rien à afficher

  return (
    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-2">
      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">{title}</p>
        <pre className="whitespace-pre-wrap break-words text-sm mt-1">
          {error.message}
        </pre>
      </div>
    </div>
  );
};

export default ErrorBanner;
