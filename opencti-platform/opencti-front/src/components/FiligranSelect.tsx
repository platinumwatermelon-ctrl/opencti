import React from 'react';
import Select, { SelectProps, StandardSelectProps, OutlinedSelectProps, FilledSelectProps } from '@mui/material/Select';

type FiligranSelectProps<T> = SelectProps<T> & (StandardSelectProps | OutlinedSelectProps | FilledSelectProps);

const FiligranSelect = <T = string>(props: FiligranSelectProps<T>) => <Select<T> {...props} />;

export default FiligranSelect;
