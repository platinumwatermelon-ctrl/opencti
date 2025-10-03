import React from 'react';
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete';

type FiligranAutocompleteProps<
  Value,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
  ChipComponent extends React.ElementType = 'div',
> = AutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>;

const FiligranAutocomplete = <
  Value,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
  ChipComponent extends React.ElementType = 'div',
>(props: FiligranAutocompleteProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>) => <Autocomplete {...props} />;

export default FiligranAutocomplete;
