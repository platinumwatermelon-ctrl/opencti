import Tab, { TabProps } from '@mui/material/Tab';
import { LinkProps } from 'react-router-dom';

type FiligranTabProps = TabProps & Partial<LinkProps>;

const FiligranTab = (props: FiligranTabProps) => <Tab {...props} />;

export default FiligranTab;
