import { ButtonOwnProps, ButtonProps } from '@mui/material';
import Button from '@mui/material/Button';
import React from 'react';

export type FiligranButtonProps = (ButtonProps & ButtonOwnProps) & { onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void } & {
  to?: string;
  target?: string;
};

const FiligranButton = (props: FiligranButtonProps) => <Button {...props} />;

export default FiligranButton;
