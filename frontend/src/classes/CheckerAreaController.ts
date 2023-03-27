import _ from 'lodash';
import { useEffect, useState } from 'react';
import { EventEmitter } from 'events';
import TypedEmitter from 'typed-emitter';
import { CheckerArea as CheckerAreaModel } from '../types/CoveyTownSocket';
import { CheckerSquare } from '../generated/client';

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
   * A blackScoreChange event indicates that a red piece was taken.
   * Listeners are passed the new state of the score.
   */
  blackScoreChange: (blackScore: number) => void;

  /**
   * A redScoreChange event indicates that a black piece was taken.
   * Listeners are passed the new state of the score.
   */
  redScoreChange: (redScore: number) => void;
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

  /**
   * The score of the black checker player.
   */
  public get blackScore(): number {
    return this._model.blackScore;
  }

  /**
   * The state of the blackScore in a checker area.
   *
   * Changing this value will emit a 'blackScoreChange' event
   */
  public set blackScore(blackScore: number) {
    if (this._model.blackScore != blackScore) {
      this._model.blackScore = blackScore;
      this.emit('blackScoreChange', blackScore);
    }
  }

  /**
   * The score of the red checker player.
   */
  public get redScore(): number {
    return this._model.redScore;
  }

  /**
   * The state of the redScore in a checker area.
   *
   * Changing this value will emit a 'redScoreChange' event
   */
  public set redScore(redScore: number) {
    if (this._model.redScore != redScore) {
      this._model.redScore = redScore;
      this.emit('redScoreChange', redScore);
    }
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
    this.blackScore = updatedModel.blackScore ?? 0;
    this.redScore = updatedModel.redScore ?? 0;
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

export function useBlackScore(controller: CheckerAreaController): number {
  const [blackScore, setBlackScore] = useState(controller.blackScore);

  useEffect(() => {
    controller.addListener('blackScoreChange', setBlackScore);
    return () => {
      controller.removeListener('blackScoreChange', setBlackScore);
    };
  }, [controller]);
  return blackScore;
}

export function useRedScore(controller: CheckerAreaController): number {
  const [redScore, setRedScore] = useState(controller.redScore);

  useEffect(() => {
    controller.addListener('redScoreChange', setRedScore);
    return () => {
      controller.removeListener('redScoreChange', setRedScore);
    };
  }, [controller]);
  return redScore;
}
