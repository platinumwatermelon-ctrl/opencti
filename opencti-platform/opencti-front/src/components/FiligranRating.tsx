import React from 'react';
import Rating, { RatingProps } from '@mui/material/Rating';

type FiligranRatingProps = RatingProps;

const FiligranRating = (props: FiligranRatingProps) => <Rating {...props} />;

export default FiligranRating;
