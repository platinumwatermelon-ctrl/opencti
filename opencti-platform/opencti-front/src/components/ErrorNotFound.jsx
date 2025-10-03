import React from 'react';
import * as PropTypes from 'prop-types';
import inject18n from './i18n';
import { Alert, AlertTitle } from '@components';

const ErrorNotFound = (props) => {
  const { t } = props;
  return (
    <Alert severity="info">
      <AlertTitle>{t('Error')}</AlertTitle>
      {t('This page is not found on this OpenCTI application.')}
    </Alert>
  );
};

ErrorNotFound.propTypes = {
  t: PropTypes.func,
};

export default inject18n(ErrorNotFound);
