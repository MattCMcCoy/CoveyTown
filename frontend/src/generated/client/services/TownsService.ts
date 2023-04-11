/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CheckerArea } from '../models/CheckerArea';
import type { CheckerLeaderboardItem } from '../models/CheckerLeaderboardItem';
import type { CheckerSquare } from '../models/CheckerSquare';
import type { ConversationArea } from '../models/ConversationArea';
import type { PosterSessionArea } from '../models/PosterSessionArea';
import type { Town } from '../models/Town';
import type { TownCreateParams } from '../models/TownCreateParams';
import type { TownCreateResponse } from '../models/TownCreateResponse';
import type { TownSettingsUpdate } from '../models/TownSettingsUpdate';
import type { ViewingArea } from '../models/ViewingArea';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class TownsService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * List all towns that are set to be publicly available
     * @returns Town list of towns
     * @throws ApiError
     */
    public listTowns(): CancelablePromise<Array<Town>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/towns',
        });
    }

    /**
     * Create a new town
     * @param requestBody The public-facing information for the new town
     * @returns TownCreateResponse The ID of the newly created town, and a secret password that will be needed to update or delete this town.
     * @throws ApiError
     */
    public createTown(
requestBody: TownCreateParams,
): CancelablePromise<TownCreateResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Updates an existing town's settings by ID
     * @param townId town to update
     * @param xCoveyTownPassword town update password, must match the password returned by createTown
     * @param requestBody The updated settings
     * @returns void 
     * @throws ApiError
     */
    public updateTown(
townId: string,
xCoveyTownPassword: string,
requestBody: TownSettingsUpdate,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}',
            path: {
                'townID': townId,
            },
            headers: {
                'X-CoveyTown-Password': xCoveyTownPassword,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid password or update values specified`,
            },
        });
    }

    /**
     * Deletes a town
     * @param townId ID of the town to delete
     * @param xCoveyTownPassword town update password, must match the password returned by createTown
     * @returns void 
     * @throws ApiError
     */
    public deleteTown(
townId: string,
xCoveyTownPassword: string,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/towns/{townID}',
            path: {
                'townID': townId,
            },
            headers: {
                'X-CoveyTown-Password': xCoveyTownPassword,
            },
            errors: {
                400: `Invalid password or update values specified`,
            },
        });
    }

    /**
     * Creates a conversation area in a given town
     * @param townId ID of the town in which to create the new conversation area
     * @param xSessionToken session token of the player making the request, must match the session token returned when the player joined the town
     * @param requestBody The new conversation area to create
     * @returns void 
     * @throws ApiError
     */
    public createConversationArea(
townId: string,
xSessionToken: string,
requestBody: ConversationArea,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/conversationArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a viewing area in a given town
     * @param townId ID of the town in which to create the new viewing area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @param requestBody The new viewing area to create
     * @returns void 
     * @throws ApiError
     */
    public createViewingArea(
townId: string,
xSessionToken: string,
requestBody: ViewingArea,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/viewingArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a poster session area in a given town
     * @param townId ID of the town in which to create the new poster session area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @param requestBody The new poster session area to create
     * @returns void 
     * @throws ApiError
     */
    public createPosterSessionArea(
townId: string,
xSessionToken: string,
requestBody: PosterSessionArea,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/posterSessionArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Gets the image contents of a given poster session area in a given town
     * @param townId ID of the town in which to get the poster session area image contents
     * @param posterSessionId interactable ID of the poster session
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns string Ok
     * @throws ApiError
     */
    public getPosterAreaImageContents(
townId: string,
posterSessionId: string,
xSessionToken: string,
): CancelablePromise<string> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{posterSessionId}/imageContents',
            path: {
                'townID': townId,
                'posterSessionId': posterSessionId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Increment the stars of a given poster session area in a given town, as long as there is
 * a poster image. Returns the new number of stars.
     * @param townId ID of the town in which to get the poster session area image contents
     * @param posterSessionId interactable ID of the poster session
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns number Ok
     * @throws ApiError
     */
    public incrementPosterAreaStars(
townId: string,
posterSessionId: string,
xSessionToken: string,
): CancelablePromise<number> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{posterSessionId}/incStars',
            path: {
                'townID': townId,
                'posterSessionId': posterSessionId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Creates a checker area in a given town
     * @param townId ID of the town in which to create the new checker area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @param requestBody The new checker area to create
     * @returns void 
     * @throws ApiError
     */
    public createCheckerArea(
townId: string,
xSessionToken: string,
requestBody: CheckerArea,
): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/towns/{townID}/checkerArea',
            path: {
                'townID': townId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Gets the squares of a checker area in a given town
     * @param townId ID of the town in which to get the checker area squares
     * @param checkerAreaId interactable ID of the checker area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns CheckerSquare Ok
     * @throws ApiError
     */
    public getCheckerAreaSquares(
townId: string,
checkerAreaId: string,
xSessionToken: string,
): CancelablePromise<Array<CheckerSquare>> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{checkerAreaId}/squares',
            path: {
                'townID': townId,
                'checkerAreaId': checkerAreaId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Initializes the checker board of the given checkerBoard area.
     * @param townId ID of the town in which to initialize the checker areas board.
     * @param checkerAreaId interactable ID of the checker area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns CheckerSquare Ok
     * @throws ApiError
     */
    public initializeCheckerAreaBoard(
townId: string,
checkerAreaId: string,
xSessionToken: string,
): CancelablePromise<Array<CheckerSquare>> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{checkerAreaId}/initializeCheckerAreaBoard',
            path: {
                'townID': townId,
                'checkerAreaId': checkerAreaId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Initializes the checker board of the given checkerBoard area.
     * @param townId ID of the town in which to initialize the checker areas board.
     * @param checkerAreaId interactable ID of the checker area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @param moveFrom 
     * @param moveTo 
     * @returns any Ok
     * @throws ApiError
     */
    public makeCheckerMove(
townId: string,
checkerAreaId: string,
xSessionToken: string,
moveFrom: string,
moveTo: string,
): CancelablePromise<{
board: Array<CheckerSquare>;
isValid: boolean;
}> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{checkerAreaId}/makeCheckerMove/{moveFrom}/{moveTo}',
            path: {
                'townID': townId,
                'checkerAreaId': checkerAreaId,
                'moveFrom': moveFrom,
                'moveTo': moveTo,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Gets the leaderboard of a given checker area.
     * @param townId ID of the town in which to get the checker areas leaderboard.
     * @param checkerAreaId interactable ID of the checker area
     * @param xSessionToken token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns CheckerLeaderboardItem the leaderboard of the checker area
     * @throws ApiError
     */
    public getCheckerLeaderBoard(
townId: string,
checkerAreaId: string,
xSessionToken: string,
): CancelablePromise<Array<CheckerLeaderboardItem>> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{checkerAreaId}/leaderboard',
            path: {
                'townID': townId,
                'checkerAreaId': checkerAreaId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * changes the active player of the checker game.
     * @param townId ID of the town in which to get the players of the checker area
     * @param checkerAreaId interactable ID of the checker area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns number Ok
     * @throws ApiError
     */
    public changeActivePlayer(
townId: string,
checkerAreaId: string,
xSessionToken: string,
): CancelablePromise<number> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{checkerAreaId}/changeActivePlayer',
            path: {
                'townID': townId,
                'checkerAreaId': checkerAreaId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * changes the active player of the checker game.
     * @param townId ID of the town in which to get the players of the checker area
     * @param checkerAreaId interactable ID of the checker area
     * @param playerId 
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns string Ok
     * @throws ApiError
     */
    public addCheckerPlayer(
townId: string,
checkerAreaId: string,
playerId: string,
xSessionToken: string,
): CancelablePromise<Array<string>> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{checkerAreaId}/{playerId}/addCheckerPlayer',
            path: {
                'townID': townId,
                'checkerAreaId': checkerAreaId,
                'playerId': playerId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Resets the checker Area
     * @param townId ID of the town in which to get the players of the checker area
     * @param checkerAreaId interactable ID of the checker area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns CheckerArea Ok
     * @throws ApiError
     */
    public resetCheckerArea(
townId: string,
checkerAreaId: string,
xSessionToken: string,
): CancelablePromise<CheckerArea> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{checkerAreaId}/resetCheckerArea',
            path: {
                'townID': townId,
                'checkerAreaId': checkerAreaId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Gets the players in a checker area in a given town
     * @param townId ID of the town in which to get the checker area squares
     * @param checkerAreaId interactable ID of the checker area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns string Ok
     * @throws ApiError
     */
    public getCheckerPlayers(
townId: string,
checkerAreaId: string,
xSessionToken: string,
): CancelablePromise<Array<string>> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{checkerAreaId}/getCheckerPlayers',
            path: {
                'townID': townId,
                'checkerAreaId': checkerAreaId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

    /**
     * Gets the active player of a checker area in a given town
     * @param townId ID of the town in which to get the checker area squares
     * @param checkerAreaId interactable ID of the checker area
     * @param xSessionToken session token of the player making the request, must
 * match the session token returned when the player joined the town
     * @returns number Ok
     * @throws ApiError
     */
    public getActiveCheckerPlayer(
townId: string,
checkerAreaId: string,
xSessionToken: string,
): CancelablePromise<number> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/towns/{townID}/{checkerAreaId}/getActiveCheckerPlayer',
            path: {
                'townID': townId,
                'checkerAreaId': checkerAreaId,
            },
            headers: {
                'X-Session-Token': xSessionToken,
            },
            errors: {
                400: `Invalid values specified`,
            },
        });
    }

}
