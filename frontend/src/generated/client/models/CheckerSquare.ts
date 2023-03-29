/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CheckerPiece } from './CheckerPiece';

export type CheckerSquare = {
    id: string;
    'x': number;
    'y': number;
    checker: CheckerPiece;
};
