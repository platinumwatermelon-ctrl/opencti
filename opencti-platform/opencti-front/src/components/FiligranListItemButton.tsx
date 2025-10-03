import React from 'react';
import MuiListItemButton, { ListItemButtonProps as MuiListItemButtonProps } from '@mui/material/ListItemButton';

const FiligranListItemButton = React.forwardRef<HTMLDivElement, MuiListItemButtonProps>((props, ref) => <MuiListItemButton ref={ref} {...props} />);

FiligranListItemButton.displayName = 'FiligranListItemButton';

export type ListItemButtonProps = MuiListItemButtonProps;
export default FiligranListItemButton;
