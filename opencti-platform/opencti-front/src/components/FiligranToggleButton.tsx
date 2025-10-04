import React from 'react';
import ToggleButton, { ToggleButtonProps } from '@mui/material/ToggleButton';

type FiligranToggleButtonProps = ToggleButtonProps & {
  to?: string;
};

const FiligranToggleButton = (props: FiligranToggleButtonProps) => <ToggleButton {...props} />;

export default FiligranToggleButton;
