// src/components/ui/Spinner.tsx
import { Loader2 } from "lucide-react";
import React from "react";

interface Props {
  className?: string;
  size?: number; // Taille de l’icône (px). Par défaut 24.
}

const Spinner: React.FC<Props> = ({ className = "", size = 24 }) => (
  <div
    className={`flex items-center justify-center p-4 ${className}`}
    role="status"
    aria-label="Chargement…"
  >
    <Loader2
      className="animate-spin text-dashboard-purple" /* ou text-primary */
      width={size}
      height={size}
    />
  </div>
);

export default Spinner;
