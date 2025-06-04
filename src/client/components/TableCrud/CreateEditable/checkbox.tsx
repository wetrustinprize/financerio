import { forwardRef, useImperativeHandle, useState } from 'react';
import type { ICreateEditableProps, ICreateEditableRef } from '.';
import { Checkbox } from '@heroui/checkbox';

const CheckboxEditable = forwardRef<
  ICreateEditableRef<'checkbox'>,
  ICreateEditableProps<'checkbox'>
>(({ options, onValueChange, column }, ref) => {
  const [value, setValue] = useState<boolean>(options.default || false);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setValue(options.default || false);
    },
    setValue: (value) => {
      setValue(value);
    },
  }));

  return (
    <Checkbox
      name={column}
      isSelected={value}
      validate={options.validate}
      onValueChange={(newValue) => {
        if (onValueChange !== undefined) onValueChange(newValue);
        setValue(newValue);
      }}
    >
      {options.format(value)}
    </Checkbox>
  );
});

export default CheckboxEditable;
