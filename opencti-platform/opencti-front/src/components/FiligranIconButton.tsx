import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { LinkProps } from 'react-router-dom';

type FiligranIconButtonProps = IconButtonProps & Omit<Partial<LinkProps>, 'onClick'> & {
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const FiligranIconButton = (props: FiligranIconButtonProps) => <IconButton {...props} />;

export default FiligranIconButton;
