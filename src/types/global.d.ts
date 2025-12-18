//Global type declarations
import React from 'react';

interface GooglePlaceAutocompleteProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  placeholder?: string;
}

//global declaration for JSX
//eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': GooglePlaceAutocompleteProps;
    }
  }
}
export {};