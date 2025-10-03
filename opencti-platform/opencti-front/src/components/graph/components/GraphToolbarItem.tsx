import { IconButtonProps } from '@mui/material/IconButton';
import { IconButton, Tooltip } from '@components';
import React, { ReactNode } from 'react';

interface GraphToolbarItemProps {
  title: string
  color: IconButtonProps['color']
  Icon: ReactNode
  onClick: IconButtonProps['onClick']
  disabled?: boolean
}

const GraphToolbarItem = ({
  title,
  color,
  Icon,
  onClick,
  disabled,
}: GraphToolbarItemProps) => {
  return (
    <Tooltip title={title}>
      <span>
        <IconButton
          color={color}
          onClick={onClick}
          disabled={disabled}
        >
          {Icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default GraphToolbarItem;
