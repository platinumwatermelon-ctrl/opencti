import MuiListItemButton, { ListItemButtonProps as MuiListItemButtonProps } from '@mui/material/ListItemButton';
import React from 'react';
import { FiligranButtonProps } from './FiligranButton';

type FiligranListItemButtonProps = MuiListItemButtonProps & FiligranButtonProps & {
  to?: string;
};

const FiligranListItemButton = React.forwardRef<HTMLDivElement, FiligranListItemButtonProps>((props, ref) => <MuiListItemButton ref={ref} {...props} />);

FiligranListItemButton.displayName = 'FiligranListItemButton';

export type ListItemButtonProps = MuiListItemButtonProps;
export default FiligranListItemButton;
