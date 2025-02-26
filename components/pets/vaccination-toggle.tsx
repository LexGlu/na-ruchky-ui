"use client";

import { memo } from "react";
import { Switch } from "@/components/ui/switch";

interface VaccinationToggleProps {
  isVaccinated: boolean;
  onToggle: (checked: boolean) => void;
}

const VaccinationToggle = memo(function VaccinationToggle({
  isVaccinated,
  onToggle,
}: VaccinationToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <span>Щеплення</span>
      <Switch checked={isVaccinated} onCheckedChange={onToggle} />
    </div>
  );
});

export default VaccinationToggle;
