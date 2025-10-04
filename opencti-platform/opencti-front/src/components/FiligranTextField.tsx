import React from 'react';
import TextField, { type TextFieldProps, type StandardTextFieldProps, type OutlinedTextFieldProps, type FilledTextFieldProps } from '@mui/material/TextField';

type FiligranTextFieldProps = TextFieldProps & (StandardTextFieldProps | OutlinedTextFieldProps | FilledTextFieldProps);

const FiligranTextField = (props: FiligranTextFieldProps) => <TextField {...props} />;

export default FiligranTextField;
