/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckerLeaderboardItem } from './CheckerLeaderboardItem';
import type { CheckerSquare } from './CheckerSquare';

export type CheckerArea = {
    id: string;
    squares: Array<CheckerSquare>;
    blackScore: number;
    redScore: number;
    activePlayer: number;
    players: Array<string>;
    leaderboard: Array<CheckerLeaderboardItem>;
};
