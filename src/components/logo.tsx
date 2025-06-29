import React from 'react';
import { GraduationCap } from 'lucide-react';

export function Logo() {
  return (
    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
      <GraduationCap className="h-6 w-6 text-primary-foreground" />
    </div>
  );
}
