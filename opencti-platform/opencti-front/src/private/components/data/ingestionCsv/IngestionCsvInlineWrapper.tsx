import { csvMappers_MappersQuery, csvMappers_MappersQuery$variables } from '@private/components/data/csvMapper/__generated__/csvMappers_MappersQuery.graphql';
import { LOCAL_STORAGE_KEY_CSV_MAPPERS } from '@private/components/data/CsvMappers';
import { csvMappers_SchemaAttributesQuery } from '@private/components/data/csvMapper/__generated__/csvMappers_SchemaAttributesQuery.graphql';
import CsvMappersProvider, { mappersQuery, schemaAttributesQuery } from '@private/components/data/csvMapper/csvMappers.data';
import React, { FunctionComponent, ReactNode } from 'react';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import { usePaginationLocalStorage } from '../../../../utils/hooks/useLocalStorage';

interface IngestionCsvInlineWrapperProps {
  children: ReactNode;
}
const IngestionCsvInlineWrapper: FunctionComponent<IngestionCsvInlineWrapperProps> = ({ children }) => {
  const { paginationOptions } = usePaginationLocalStorage<csvMappers_MappersQuery$variables>(
    LOCAL_STORAGE_KEY_CSV_MAPPERS,
    {
      sortBy: 'name',
      orderAsc: false,
      view: 'lines',
      searchTerm: '',
    },
  ); const queryRefSchemaAttributes = useQueryLoading<csvMappers_SchemaAttributesQuery>(
    schemaAttributesQuery,
  );
  const queryRefMappers = useQueryLoading<csvMappers_MappersQuery>(
    mappersQuery,
    paginationOptions,
  );

  return queryRefMappers && queryRefSchemaAttributes && <CsvMappersProvider
    mappersQueryRef={queryRefMappers}
    schemaAttributesQueryRef={queryRefSchemaAttributes}
                                                        >
    {children}
  </CsvMappersProvider>;
};

export default IngestionCsvInlineWrapper;
