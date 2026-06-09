/**
 * Form Field Component
 * Componente genérico para campos de formulário
 */

import { ReactNode } from 'react';
import { Controller, FieldPath, FieldValues, UseControllerProps } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends UseControllerProps<TFieldValues, TName> {
  label?: string;
  placeholder?: string;
  description?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox';
  options?: { label: string; value: string }[];
  required?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  placeholder,
  description,
  type = 'text',
  options,
  required,
  disabled,
  control,
  children,
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      name={name}
      control={control}
      {...props}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-2">
          {label && (
            <Label htmlFor={name}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          )}

          {type === 'textarea' ? (
            <Textarea
              {...field}
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
          ) : type === 'select' ? (
            <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
              <SelectTrigger id={name} className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === 'checkbox' ? (
            <div className="flex items-center space-x-2">
              <Checkbox
                {...field}
                id={name}
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
              {label && <Label htmlFor={name}>{label}</Label>}
            </div>
          ) : (
            <Input
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
          )}

          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
      )}
    />
  );
}
