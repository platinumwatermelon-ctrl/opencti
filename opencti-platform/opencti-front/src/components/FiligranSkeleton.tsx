import React from 'react';
import Skeleton, { SkeletonProps } from '@mui/material/Skeleton';

type FiligranSkeletonProps = SkeletonProps;

const FiligranSkeleton = (props: FiligranSkeletonProps) => <Skeleton {...props} />;

export default FiligranSkeleton;
