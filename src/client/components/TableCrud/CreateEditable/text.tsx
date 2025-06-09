import { forwardRef, useImperativeHandle, useState } from 'react';
import type { ICreateEditableProps, ICreateEditableRef } from '.';
import { Input } from '@heroui/input';

const TextEditable = forwardRef<
  ICreateEditableRef<'text'>,
  ICreateEditableProps<'text'>
>(({ options, onValueChange, column }, ref) => {
  const [value, setValue] = useState<string>(options.default || '');
  useImperativeHandle(ref, () => ({
    reset: () => {
      setValue(options.default ?? '');
    },
    setValue: (value) => {
      setValue(value);
    },
  }));

  return (
    <Input
      value={value}
      name={column}
      validate={options.validate}
      onValueChange={(newValue) => {
        if (onValueChange !== undefined) onValueChange(newValue);
        setValue(newValue);
      }}
    />
  );
});

export default TextEditable;
