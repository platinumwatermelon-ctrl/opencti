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

import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { graphql, usePreloadedQuery } from 'react-relay';
import { PreloadedQuery } from 'react-relay/relay-hooks/EntryPointTypes';
import { ReactFlowProvider } from 'reactflow';
import { ErrorBoundary } from '@components/Error';
import PlaybookFlow from './PlaybookFlow';
import { PlaybookQuery } from './__generated__/PlaybookQuery.graphql';
import PlaybookHeader from './PlaybookHeader';
import Loader from '../../../../components/Loader';
import ErrorNotFound from '../../../../components/ErrorNotFound';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../components/i18n';

const playbookQuery = graphql`
  query PlaybookQuery($id: String!) {
    playbook(id: $id) {
      id
      name
      ...PlaybookHeader_playbook
      ...PlaybookFlowFragment
    }
    ...PlaybookFlowComponentsFragment
  }
`;

interface RootComponentProps {
  queryRef: PreloadedQuery<PlaybookQuery>
}

const PlaybookComponent = ({ queryRef }: RootComponentProps) => {
  const { t_i18n } = useFormatter();
  const playbookQueryData = usePreloadedQuery(playbookQuery, queryRef);
  const { playbook } = playbookQueryData;
  if (!playbook) return <ErrorNotFound/>;

  const breadcrumb = [
    { label: t_i18n('Data') },
    { label: t_i18n('Processing') },
    { label: t_i18n('Automation'), link: '/dashboard/data/processing/automation' },
    { label: playbook.name, current: true },
  ];

  return (
    <>
      <Breadcrumbs elements={breadcrumb} />
      <PlaybookHeader playbook={playbook} />
      <ErrorBoundary>
        <div style={{ width: '100%', height: '100%', margin: 0, overflow: 'hidden' }}>
          <ReactFlowProvider>
            <PlaybookFlow
              data={playbook}
              dataComponents={playbookQueryData}
            />
          </ReactFlowProvider>
        </div>
      </ErrorBoundary>
    </>
  );
};

const Playbook = () => {
  const { playbookId } = useParams();
  if (!playbookId) return <ErrorNotFound/>;
  const playbookQueryRef = useQueryLoading<PlaybookQuery>(
    playbookQuery,
    { id: playbookId },
  );

  return (
    <Suspense fallback={<Loader />}>
      {playbookQueryRef && (
        <PlaybookComponent queryRef={playbookQueryRef} />
      )}
    </Suspense>
  );
};

export default Playbook;
