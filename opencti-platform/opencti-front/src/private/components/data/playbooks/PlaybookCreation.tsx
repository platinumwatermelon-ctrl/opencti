/*
Copyright (c) 2021-2025 Filigran SAS

This file is part of the OpenCTI Enterprise Edition ("EE") and is
licensed under the OpenCTI Enterprise Edition License (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

https://github.com/OpenCTI-Platform/opencti/blob/master/LICENSE

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/

import React from 'react';
import { Field, Form, Formik } from 'formik';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import { graphql } from 'react-relay';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { PlaybooksLinesPaginationQuery$variables } from '@components/data/__generated__/PlaybooksLinesPaginationQuery.graphql';
import { FormikConfig } from 'formik/dist/types';
import Drawer, { DrawerControlledDialProps } from '../../common/drawer/Drawer';
import TextField from '../../../../components/TextField';
import { insertNode } from '../../../../utils/store';
import { useFormatter } from '../../../../components/i18n';
import { resolveLink } from '../../../../utils/Entity';
import CreateEntityControlledDial from '../../../../components/CreateEntityControlledDial';
import useApiMutation from '../../../../utils/hooks/useApiMutation';
import { PlaybookCreationMutation } from './__generated__/PlaybookCreationMutation.graphql';

const playbookCreationMutation = graphql`
  mutation PlaybookCreationMutation($input: PlaybookAddInput!) {
    playbookAdd(input: $input) {
      id
      ...PlaybooksLine_node
    }
  }
`;

const CreatePlaybookControlledDial = (props: DrawerControlledDialProps) => (
  <CreateEntityControlledDial
    entityType='Playbook'
    {...props}
  />
);

interface PlaybookCreationProps {
  paginationOptions: PlaybooksLinesPaginationQuery$variables
}

interface PlaybookCreationFormData {
  name: string,
  description: string,
}

const PlaybookCreation = ({ paginationOptions }: PlaybookCreationProps) => {
  const { t_i18n } = useFormatter();
  const navigate = useNavigate();
  const theme = useTheme();

  const [createMutation] = useApiMutation<PlaybookCreationMutation>(playbookCreationMutation);

  const playbookCreationValidation = Yup.object().shape({
    name: Yup.string().required(t_i18n('This field is required')),
    description: Yup.string().nullable(),
  });

  const initialValues = {
    name: '',
    description: '',
  };

  const onSubmit: FormikConfig<PlaybookCreationFormData>['onSubmit'] = (
    values,
    { setSubmitting, resetForm },
  ) => {
    createMutation({
      variables: {
        input: values,
      },
      updater: (store) => {
        insertNode(
          store,
          'Pagination_playbooks',
          paginationOptions,
          'playbookAdd',
        );
      },
      onCompleted: (response) => {
        setSubmitting(false);
        resetForm();
        navigate(`${resolveLink('Playbook')}/${response?.playbookAdd?.id}`);
      },
    });
  };

  return (
    <Drawer
      title={t_i18n('Create a playbook')}
      controlledDial={CreatePlaybookControlledDial}
    >
      {({ onClose }) => (
        <Formik
          initialValues={initialValues}
          validationSchema={playbookCreationValidation}
          onSubmit={(values, formikHelpers) => {
            onSubmit(values, formikHelpers);
            onClose();
          }}
          onReset={onClose}
        >
          {({ submitForm, handleReset, isSubmitting }) => (
            <Form>
              <Field
                component={TextField}
                variant="standard"
                name="name"
                label={t_i18n('Name')}
                fullWidth={true}
              />
              <Field
                component={TextField}
                variant="standard"
                name="description"
                label={t_i18n('Description')}
                fullWidth={true}
                style={{ marginTop: 20 }}
              />
              <div style={{ marginTop: 20, justifyContent: 'end', display: 'flex', gap: theme.spacing(2) }}>
                <Button
                  variant="contained"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  {t_i18n('Cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={submitForm}
                  disabled={isSubmitting}
                >
                  {t_i18n('Create')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Drawer>
  );
};

export default PlaybookCreation;
