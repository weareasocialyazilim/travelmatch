import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { LiquidInput } from './LiquidInput';
import type { Ionicons } from '@expo/vector-icons';

interface ControlledLiquidInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
}

/**
 * React Hook Form ile entegre Liquid Input.
 * Tüm formlarda otomatik hata yönetimi ve premium tasarım sağlar.
 */
export const ControlledLiquidInput = <T extends FieldValues>({
  name,
  control,
  ...props
}: ControlledLiquidInputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <LiquidInput
          value={value}
          onChangeText={onChange}
          error={error?.message}
          {...props}
        />
      )}
    />
  );
};

export default ControlledLiquidInput;
