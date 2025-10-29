import { describe, expect, it } from 'vitest';
import axios from 'axios';
import { addIngestion, ingestionDelete, ingestionEditField } from '../../src/modules/ingestion/ingestion-taxii-collection-domain';
import { ADMIN_API_TOKEN, ADMIN_USER, testContext } from '../utils/testQuery';
import type { EditInput, IngestionTaxiiCollectionAddInput, TaxiiCollectionAddInput } from '../../src/generated/graphql';
import { getGroupEntityByName } from '../utils/domainQueryHelper';
import { getBaseUrl } from '../../src/config/conf';
import { createTaxiiCollection, taxiiCollectionDelete } from '../../src/domain/taxii';
import { waitInSec } from '../../src/database/utils';

describe('Should taxii push accept several content-type', () => {
  let taxiiPushIngestionId: string;

  it('creates a taxii push configuration and start', async () => {
    const connectorsGroup = await getGroupEntityByName('Connectors');
    const ingestionAdd: IngestionTaxiiCollectionAddInput = {
      name: 'Taxii push test ingestion',
      authorized_members: [
        {
          id: connectorsGroup.id,
          access_right: 'view'
        }
      ]
    };
    const taxiiPushIngestion = await addIngestion(testContext, ADMIN_USER, ingestionAdd);
    expect(taxiiPushIngestion.id).toBeDefined();
    expect(taxiiPushIngestion.name).toBe('Taxii push test ingestion');
    // Start it
    const moveToRunning: EditInput[] = [{ key: 'ingestion_running', value: ['true'] }];
    await ingestionEditField(testContext, ADMIN_USER, taxiiPushIngestion.id, moveToRunning);

    taxiiPushIngestionId = taxiiPushIngestion.id;
  });

  it('should taxii post works correctly', async () => {
    const bundleObject = {
      type: 'bundle',
      spec_version: '2.1',
      id: 'bundle--cb13d683-9173-46bc-a947-47fb7936bb52',
      objects: [
        {
          id: 'email-addr--20e5acb1-ab1e-5f49-89e1-3348fb2a4590',
          spec_version: '2.1',
          type: 'email-addr',
          extensions: {
            'extension-definition--ea279b3e-5c71-4632-ac08-831c66a786ba': {
              extension_type: 'property-extension',
              id: 'fb96642f-cdbd-4d39-8237-96077ed80677',
              type: 'Email-Addr',
              created_at: '2025-10-08T06: 17: 24.882Z',
              updated_at: '2025-10-08T06: 17: 24.882Z',
              creator_ids: [
                '88ec0c6a-13ce-5e39-b486-354fe4a7084f'
              ]
            },
            'extension-definition--f93e2c80-4231-4f9a-af8b-95c9bd566a82': {
              extension_type: 'property-extension',
              score: 50
            }
          },
          value: 'patate@truc.fr'
        }
      ]
    };

    await expect(async () => {
      await axios.post(`${getBaseUrl()}/taxii2/root/collections/${taxiiPushIngestionId}/objects`, bundleObject, { });
    }).rejects.toThrowError('Request failed with status code 401');

    /*
    UNCOMMENT THIS CODE when fixing taxii2 push server behavior on no content type or bad content type
        const headersToTest1 = {
      Authorization: `Bearer ${ADMIN_API_TOKEN}`
    };
    await expect(async () => {
      await axios.post(`${getBaseUrl()}/taxii2/root/collections/${taxiiPushIngestion.id}/objects`, bundleObject, { headers: headersToTest1 });
    }).rejects.toThrowError('????');
    */
    const headersToTest2 = {
      'Content-Type': 'application/taxii+json;version=2.1',
      Authorization: `Bearer ${ADMIN_API_TOKEN}`
    };

    let axiosResponsePost = await axios.post(`${getBaseUrl()}/taxii2/root/collections/${taxiiPushIngestionId}/objects`, bundleObject, { headers: headersToTest2 });
    expect(axiosResponsePost.status, 'With correct content type and authentication should works fine').toBe(200);
    // We do not check entity from bundleObject in database since it requires the worker to process it.

    const headersToTest3 = {
      'Content-Type': 'application/taxii+json; version=2.1',
      Authorization: `Bearer ${ADMIN_API_TOKEN}`
    };
    axiosResponsePost = await axios.post(`${getBaseUrl()}/taxii2/root/collections/${taxiiPushIngestionId}/objects`, bundleObject, { headers: headersToTest3 });
    expect(axiosResponsePost.status, 'With correct content type including space and authentication should works fine').toBe(200);

    const headersToTest4 = {
      'Content-Type': 'application/vnd.oasis.stix+json; version=2.1',
      Authorization: `Bearer ${ADMIN_API_TOKEN}`
    };
    axiosResponsePost = await axios.post(`${getBaseUrl()}/taxii2/root/collections/${taxiiPushIngestionId}/objects`, bundleObject, { headers: headersToTest4 });
    expect(axiosResponsePost.status, 'With an accepted content type including space and authentication should works fine').toBe(200);
  });

  it('should delete taxii post Feed', async () => {
    await ingestionDelete(testContext, ADMIN_USER, taxiiPushIngestionId);
  });
});

describe('Should taxii collection be exposed', () => {
  let taxiiCollectionId: string;

  it('creates a taxii collection configuration and start', async () => {
    const dataSharingTaxii: TaxiiCollectionAddInput = {
      name: 'Testing coverage on Taxii collection',
      description: '',
      authorized_members: [],
      taxii_public: false,
      include_inferences: true,
      score_to_confidence: false,
      filters: '{\'mode\':\'and\',\'filters\':[{\'key\':[\'entity_type\'],\'operator\':\'eq\',\'values\':[\'Indicator\'],\'mode\':\'or\'}],\'filterGroups\':[]}'
    };
    const taxiiCollection = await createTaxiiCollection(testContext, ADMIN_USER, dataSharingTaxii);
    expect(taxiiCollection.id).toBeDefined();
    taxiiCollectionId = taxiiCollection.id;
    expect(taxiiCollection.name).toBe('Testing coverage on Taxii collection');

    await waitInSec(10);
  });

  it('should taxii root works', async () => {
    const headers = {
      Authorization: `Bearer ${ADMIN_API_TOKEN}`
    };
    const taxiiRootResponse = await axios.get(`${getBaseUrl()}/taxii2/root/`, { headers });
    const { data, status } = taxiiRootResponse;
    expect(status, 'With correct content type and authentication should works fine').toBe(200);
    expect(data.versions, 'With correct content type and authentication should works fine').toBe('application/taxii+json;version=2.1');
  });

  // This one is not working yet, to be investigated
  it.skip('should taxii collection works', async () => {
    const headers = {
      Authorization: `Bearer ${ADMIN_API_TOKEN}`
    };
    const taxiiCollectionResponse = await axios.get(`${getBaseUrl()}/taxii2/root/collections/${taxiiCollectionId}/objects/`, { headers });
    // console.log('taxiiCollectionResponse:', { taxiiCollectionResponse });
    const { status } = taxiiCollectionResponse;
    // console.log('DATA collection:', { data });
    expect(status, 'With correct content type and authentication should works fine').toBe(200);
    // TODO uncomment when bug is fixed
    // expect(data.versions, 'With correct content type and authentication should works fine').toBe(['application/taxii+json;version=2.1']);
  });

  it('should delete taxii collection', async () => {
    await taxiiCollectionDelete(testContext, ADMIN_USER, taxiiCollectionId);
  });
});
