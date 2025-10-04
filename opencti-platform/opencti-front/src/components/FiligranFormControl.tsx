import React from 'react';
import FormControl, { FormControlProps } from '@mui/material/FormControl';

type FiligranFormControlProps = FormControlProps & { name?: string };

const FiligranFormControl = (props: FiligranFormControlProps) => <FormControl {...props} />;

export default FiligranFormControl;
