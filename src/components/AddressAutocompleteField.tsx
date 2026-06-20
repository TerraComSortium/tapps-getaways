import { Control, Path, useController, FieldValues } from "react-hook-form";
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { BRAND } from '../theme/colors';
import type { LocationEntry } from '../types/getaway';

const validateInput = (value: LocationEntry | undefined | null): boolean | string => {
  if (!value || !value.address) {
    return true;
  }

  if (/<|>/.test(value.address)) {
    return "Invalid characters are not allowed.";
  }
  return true;
};

type AddressAutocompleteFieldProps<T extends FieldValues> = {
  name: Path<T>;
  control: Control<T>;
  label?: string;
};

export function AddressAutocompleteField<T extends FieldValues>({
  name,
  control,
  label = "Getaway address",
}: AddressAutocompleteFieldProps<T>) {
  const { field, fieldState: { error } } = useController({
    name,
    control,
    rules: { validate: validateInput }
  });

  return (
    <AddressAutocomplete
      label={label}
      value={field.value}
      showCurrentLocationBtn
      onChange={(locationData) => {
        console.log("Data received on intermediary:", locationData);
        field.onChange(locationData);
      }}
      error={!!error}
      errorMessage={error?.message}
      inputStyle={{
        height: '55px',
        backgroundColor: BRAND.white,
        color:BRAND.black,
        borderRadius: '8px',
        // borderColor: 'white',
      }}
    />
  );
}