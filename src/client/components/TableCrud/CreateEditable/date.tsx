import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { DatePicker } from '@heroui/date-picker';
import {
  getLocalTimeZone,
  fromDate,
  CalendarDate,
  today,
} from '@internationalized/date';
import type { ICreateEditableProps, ICreateEditableRef } from '.';

const transform = (from: number | Date) => {
  const date = from instanceof Date ? from : new Date(from);
  const zoned = fromDate(date, getLocalTimeZone());

  return new CalendarDate(zoned.year, zoned.month, zoned.day);
};

const DateEditable = forwardRef<
  ICreateEditableRef<'date'>,
  ICreateEditableProps<'date'>
>(({ column, options, onValueChange }, ref) => {
  const [value, setValue] = useState<CalendarDate>(
    options.default ? transform(options.default) : today(getLocalTimeZone()),
  );

  useEffect(() => {
    if (options.default === undefined) return;
    setValue(transform(options.default));
  }, [options.default]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setValue(
        options.default
          ? transform(options.default)
          : today(getLocalTimeZone()),
      );
    },
    setValue: (value) => {
      setValue(transform(value));
    },
  }));

  return (
    <DatePicker
      hideTimeZone
      showMonthAndYearPickers
      name={column}
      value={value}
      validate={(date) => {
        if (options.validate === undefined) return true;

        const time = date.toDate(getLocalTimeZone()).getTime();

        return options.validate(time);
      }}
      onChange={(date) => {
        if (date === null) return;
        if (onValueChange !== undefined)
          onValueChange(date.toDate(getLocalTimeZone()).getTime());

        setValue(date);
      }}
    />
  );
});

export default DateEditable;
