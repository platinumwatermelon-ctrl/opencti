import ListItem, { ListItemProps } from '@mui/material/ListItem';

type FiligranListItemProps = ListItemProps & {
  to?: string;
};

const FiligranListItem = (props: FiligranListItemProps) => <ListItem {...props} />;

export default FiligranListItem;
