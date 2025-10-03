import React, { CSSProperties, ReactNode } from 'react';
import { useTheme } from '@mui/styles';
import type { Theme } from './Theme';
import { Alert, Typography } from '@components';

type AlertInfoProps = {
  content: string | ReactNode
  style?: CSSProperties
};

const AlertInfo = ({ content, style }: AlertInfoProps) => {
  const theme = useTheme<Theme>();

  return (
    <div style={style}>
      <Alert
        severity="info"
        variant="outlined"
        style={{ padding: `0 ${theme.spacing(1)}` }}
      >
        <Typography variant={'body2'}>
          {content}
        </Typography>
      </Alert>
    </div>
  );
};

export default AlertInfo;
