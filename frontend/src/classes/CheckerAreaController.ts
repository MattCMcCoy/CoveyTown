import _ from 'lodash';
import { useEffect, useState } from 'react';
import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { CheckerArea as CheckerAreaModel } from '../types/CoveyTownSocket';
import { CheckerLeaderboardItem, CheckerSquare } from '../generated/client';

/**
 * The events that a CheckerAreaController can emit.
 */
export type CheckerAreaEvents = {
  /**
   * A checkerSquareChange event indicates that the boards squares have changes.
   * Listeners are passed the new state of the squares.
   */
  checkerSquareChange: (squares: CheckerSquare[]) => void;

  /**
   * A playerTurnChange event indicates that a players are changing turns.
   * Listeners are passed the new state of the activePlayer.
   */
  playerTurnChange: (player: number) => void;

  /**
   * A playerListChange event indicates that a players participating
   * in the game are changing.
   * Listeners are passed the new state of the activePlayer.
   */
  playerListChange: (players: string[]) => void;

  /**
   * A leaderboardChange event that indicates that the leaderboard has changed.
   * Listeners are passed the new state of the leaderboard.
   */
  leaderboardChange: (leaderboard: CheckerLeaderboardItem[]) => void;
};

/**
 * A CheckerAreaController manages the state for a CheckerArea in the frontend app, serving as a bridge between the checker
 * board that is being displayed in the user's browser and the backend TownService, and ensuring that square updates are
 * synchronized across all the players looking at the board.
 *
 * The CheckerAreaController implements callbacks that handle events from the board in this browser window, and
 * emits updates when the state is updated, @see CheckerAreaEvents
 */
export default class CheckerAreaController extends (EventEmitter as new () => TypedEmitter<CheckerAreaEvents>) {
  private _model: CheckerAreaModel;

  /**
   * Constructs a new CheckerAreaController, initialized with the state of the provided checkerAreaModel.
   *
   * @param checkerAreaModel The checker area model that this controller should represent
   */
  constructor(checkerAreaModel: CheckerAreaModel) {
    super();
    this._model = checkerAreaModel;
  }

  /**
   * The ID of the checker area represented by this checker area controller
   * This property is read-only: once a CheckerAreaController is created, it will always be
   * tied to the same checker area ID.
   */
  public get id(): string {
    return this._model.id;
  }

  /**
   * The squares of this checker area.
   */
  public get squares(): CheckerSquare[] {
    return this._model.squares;
  }

  /**
   * The state of the squares in a checker area.
   *
   * Changing this value will emit a 'checkerSquareChange' event
   */
  public set squares(checkerSquares: CheckerSquare[]) {
    if (_.xor(this._model.squares, checkerSquares).length > 0) {
      this._model.squares = checkerSquares;
      this.emit('checkerSquareChange', checkerSquares);
    }
  }

  public get leaderboard(): CheckerLeaderboardItem[] {
    return this._model.leaderboard;
  }

  public set leaderboard(leaderboard: CheckerLeaderboardItem[]) {
    if (_.xor(this._model.leaderboard, leaderboard).length > 0) {
      this._model.leaderboard = leaderboard;
      this.emit('leaderboardChange', leaderboard);
    }
  }

  /**
   * The pleyer whose turn it is.
   */
  public get activePlayer(): number {
    return this._model.activePlayer;
  }

  /**
   * The state of the currentPlayer in a checker area.
   *
   * Changing this value will emit a 'playerTurnChange' event
   */
  public set activePlayer(activePlayer: number) {
    if (this._model.activePlayer != activePlayer) {
      this._model.activePlayer = activePlayer;
      this.emit('playerTurnChange', activePlayer);
    }
  }

  public get players(): string[] {
    return this._model.players;
  }

  /**
   * The state of the currentPlayer in a checker area.
   *
   * Changing this value will emit a 'playerTurnChange' event
   */
  public set players(players: string[]) {
    if (this._model.players != players) {
      this._model.players = players;
      this.emit('playerListChange', players);
    }
  }

  public getActivePlayer(): string {
    return this.players[this.activePlayer];
  }

  public isActivePlayer(playerId: string): boolean {
    return this.players[this.activePlayer] == playerId;
  }

  public getActivePlayerColor(): string {
    return this.activePlayer == 0 ? 'red' : 'black';
  }

  /**
   * @returns CheckerArea that represents the current state of this CheckerArea
   */
  public checkerAreaModel(): CheckerAreaModel {
    return this._model;
  }

  /**
   * Applies updates to this Checker Area controller's model, setting the squares.
   *
   * @param updatedModel a new checker area update to update this model.
   */
  public updateFrom(updatedModel: CheckerAreaModel): void {
    this.squares = updatedModel.squares;
    this.leaderboard = updatedModel.leaderboard;
    this.activePlayer = updatedModel.activePlayer;
    this.players = updatedModel.players;
  }

  /**
   * This method is to be called from the CheckerAreaViewer to verify possible
   * moveTo positions so that the user can have an easier experience.
   *
   * @param moveFrom This is the id that the possible moveTo will be tested against.
   *
   * @param moveTo  This is the id of the square that is being tested against the move
   * values for the moveFrom square.
   *
   * @returns boolean value true if moveTo is in moveFrom's list of moves.
   *
   */
  public _isValid(moveFrom: string, moveTo: string): boolean {
    if (this.squares.find(square => square.id === moveFrom)?.moves.includes(moveTo) === true) {
      return true;
    }
    return false;
  }

  /**
   * This method is to be called from the CheckerAreaViewer to verify possible
   * moveTo positions so that the user can have an easier experience.
   *
   * @param moveFrom This is the id that the possible moveTo will be tested against.
   *
   * @param moveTo  This is the id of the square that is being tested against the move
   * values for the moveFrom square.
   *
   * @returns boolean value true if moveTo is in moveFrom's list of moves.
   *
   */
  public _isValid(moveFrom: string, moveTo: string): boolean {
    if (this.squares.find(square => square.id === moveFrom)?.moves.includes(moveTo) === true) {
      return true;
    }
    return false;
  }
}

/**
 * A hook in which returns the current state of the squares.
 *
 * @param controller the controller to get the squares from
 * @returns the current squares of the given controller
 */
export function useSquares(controller: CheckerAreaController): CheckerSquare[] | undefined {
  const [checkerSquares, setCheckerSquares] = useState(controller.squares);
  useEffect(() => {
    controller.addListener('checkerSquareChange', setCheckerSquares);
    return () => {
      controller.removeListener('checkerSquareChange', setCheckerSquares);
    };
  }, [controller]);
  return checkerSquares;
}

export function useActivePlayer(controller: CheckerAreaController): number {
  const [activePlayer, setActivePlayer] = useState(controller.activePlayer);

  useEffect(() => {
    controller.addListener('playerTurnChange', setActivePlayer);
    return () => {
      controller.removeListener('playerTurnChange', setActivePlayer);
    };
  }, [controller]);
  return activePlayer;
}

export function usePlayers(controller: CheckerAreaController): string[] {
  const [players, setPlayers] = useState(controller.players);

  useEffect(() => {
    controller.addListener('playerListChange', setPlayers);
    return () => {
      controller.removeListener('playerListChange', setPlayers);
    };
  }, [controller]);
  return players;
}

export function useLeaderboard(controller: CheckerAreaController): CheckerLeaderboardItem[] {
  const [leaderboard, setLeaderboard] = useState(controller.leaderboard);

  useEffect(() => {
    controller.addListener('leaderboardChange', setLeaderboard);
    return () => {
      controller.removeListener('leaderboardChange', setLeaderboard);
    };
  }, [controller]);
  return leaderboard;
}
