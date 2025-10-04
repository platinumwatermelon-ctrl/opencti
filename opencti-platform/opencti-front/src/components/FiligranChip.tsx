import Chip, { ChipProps } from '@mui/material/Chip';

type FiligranChipProps = Omit<ChipProps, 'onClick'> & {
  onClick?: (e: React.UIEvent) => void;
  to?: string;
};

const FiligranChip = (props: FiligranChipProps) => <Chip {...props} />;

export default FiligranChip;
