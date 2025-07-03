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

import ReactFlow from 'reactflow';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import nodeTypes from './types/nodes';
import edgeTypes from './types/edges';
import useLayout from './hooks/useLayout';
import useManipulateComponents from './hooks/useManipulateComponents';
import { addPlaceholders, computeEdges, computeNodes } from './utils/playbook';
import { PlaybookFlowFragment$key } from './__generated__/PlaybookFlowFragment.graphql';
import { PlaybookFlowComponentsFragment$key } from './__generated__/PlaybookFlowComponentsFragment.graphql';

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };
const proOptions = { account: 'paid-pro', hideAttribution: true };
const fitViewOptions = { padding: 0.8 };

const playbookFlowFragment = graphql`
  fragment PlaybookFlowFragment on Playbook {
    id
    entity_type
    name
    description
    playbook_definition
    playbook_running
  }
`;

const playbookFlowComponentsFragment = graphql`
  fragment PlaybookFlowComponentsFragment on Query {
    playbookComponents {
      id
      name
      description
      icon
      is_entry_point
      is_internal
      configuration_schema
      ports {
        id
        type
      }
    }
  }
`;

interface PlaybookFlowProps {
  data: PlaybookFlowFragment$key
  dataComponents: PlaybookFlowComponentsFragment$key
}

const PlaybookFlow = ({ data, dataComponents }: PlaybookFlowProps) => {
  const playbook = useFragment(playbookFlowFragment, data);
  const { playbookComponents } = useFragment(playbookFlowComponentsFragment, dataComponents);
  const definition = JSON.parse(playbook.playbook_definition ?? '{}');

  const {
    setAction,
    setSelectedNode,
    setSelectedEdge,
    renderManipulateComponents,
  } = useManipulateComponents(playbook, playbookComponents);

  const initialNodes = computeNodes(
    definition.nodes,
    playbookComponents,
    setAction,
    setSelectedNode,
  );
  const initialEdges = computeEdges(
    definition.links,
    setAction,
    setSelectedEdge,
  );

  const { nodes: flowNodes, edges: flowEdges } = addPlaceholders(
    initialNodes,
    initialEdges,
    setAction,
    setSelectedNode,
  );

  useLayout(playbook.id);

  console.log(flowNodes);
  console.log(flowEdges);

  return (
    <>
      <ReactFlow
        defaultNodes={flowNodes}
        defaultEdges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={defaultViewport}
        minZoom={0.2}
        fitView={true}
        fitViewOptions={fitViewOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnDoubleClick={false}
        proOptions={proOptions}
      />
      {renderManipulateComponents()}
    </>
  );
};

export default PlaybookFlow;
