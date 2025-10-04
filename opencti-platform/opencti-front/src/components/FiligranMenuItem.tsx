import MenuItem, { type MenuItemOwnProps, type MenuItemProps } from '@mui/material/MenuItem';

type FiligranMenuItemProps = MenuItemOwnProps & MenuItemProps & {
  value?: string | number;
  children?: React.ReactNode;
  to?: string;
  target?: string;
  href?: string;
};

const FiligranMenuItem = (props: FiligranMenuItemProps) => <MenuItem {...props} />;

export default FiligranMenuItem;
