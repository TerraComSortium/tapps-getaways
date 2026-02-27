import { Control, Path, useController, FieldValues } from "react-hook-form";
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import type { LocationEntry } from '../types/getaway';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

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
      apiKey={GOOGLE_API_KEY}
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
        backgroundColor: '#fff',
        color:'#000',
        borderRadius: '8px',
        // borderColor: 'white',
      }}
    />
  );
}