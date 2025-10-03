import React, { UIEvent } from 'react';
import Button from '@mui/material/Button';
import { ButtonProps, ButtonOwnProps } from '@mui/material';
import { LinkProps } from 'react-router-dom';

type FiligranButtonProps = (ButtonProps & Partial<LinkProps> & ButtonOwnProps) & { onClick?: (e: UIEvent | React.MouseEvent) => void };

const FiligranButton = (props: FiligranButtonProps) => <Button {...props} />;

export default FiligranButton;
