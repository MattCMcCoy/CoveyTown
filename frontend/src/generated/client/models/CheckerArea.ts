/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CheckerSquare } from './CheckerSquare';

export type CheckerArea = {
    id: string;
    squares: Array<CheckerSquare>;
    blackScore: number;
    redScore: number;
};
