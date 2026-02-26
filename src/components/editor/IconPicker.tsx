'use client';

// Stub: IconPicker — will be fully implemented in a later phase
interface IconPickerProps {
  trigger: React.ReactNode;
  onIconSelected: (icon: string) => void;
}

export function IconPicker({ trigger }: IconPickerProps) {
  return <>{trigger}</>;
}
