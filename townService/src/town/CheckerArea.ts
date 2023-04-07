import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  Interactable,
  CheckerArea as CheckerAreaModel,
  CheckerSquare as CheckerSquareModel,
  CheckerPiece as CheckerPieceModel,
  BoundingBox,
  TownEmitter,
  Color,
} from '../types/CoveyTownSocket.d';
import CheckerSquare from './CheckerParts/CheckerSquare';
import InteractableArea from './InteractableArea';

export default class CheckerArea extends InteractableArea {
  private _squares: CheckerSquareModel[] = [];

  private _redScore: number;

  private _blackScore: number;

  public get squares(): CheckerSquareModel[] {
    return this._squares;
  }

  public set squares(squares: CheckerSquareModel[]) {
    this._squares = squares;
  }

  public get redScore(): number {
    return this._redScore;
  }

  public get blackScore(): number {
    return this._blackScore;
  }

  /**
   * Creates a new checker area
   *
   * @param checkerArea model containing the areas starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, squares, blackScore, redScore }: CheckerAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);

    this.squares = squares;
    this._blackScore = blackScore;
    this._redScore = redScore;
  }

  /**
   * initializes the board with all of its base values, including checker pieces.
   */
  public initializeBoard() {
    const newSquares = [];
    const checkers: CheckerPieceModel[] = this._createCheckerPieces();
    let pieces = 0;
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if ((x === 0 || x === 2 || x === 6) && y % 2 !== 0) {
          newSquares.push({
            id: `${x}${y}`,
            x,
            y,
            checker: checkers.at(pieces),
          } as CheckerSquareModel);
          pieces += 1;
        } else if ((x === 1 || x === 5 || x === 7) && y % 2 === 0) {
          newSquares.push({
            id: `${x}${y}`,
            x,
            y,
            checker: checkers.at(pieces),
          } as CheckerSquareModel);
          pieces += 1;
        } else {
          newSquares.push({
            id: `${x}${y}`,
            x,
            y,
            checker: { id: 'empty', type: 'empty' },
          } as CheckerSquareModel);
        }
      }
    }

    this.squares = newSquares;
  }

  /**
   * Helper method that creates all of the checker pieces with their corresponding colors. Starting with the 12 red
   * then the 12 black
   */
  private _createCheckerPieces(): CheckerPieceModel[] {
    const checkers: CheckerPieceModel[] = [];
    for (let i = 0; i < 24; i++) {
      if (i < 12) {
        checkers.push({ id: `red ${i}`, type: 'red' } as CheckerPieceModel);
      } else {
        checkers.push({ id: `black ${23 - i}`, type: 'black' } as CheckerPieceModel);
      }
    }
    return checkers;
  }

  /**
   * Removes a player from this poster session area.
   *
   * When the last player leaves, this method resets the board and emits this update to all players in the Town.
   *
   * @param player
   */
  public remove(player: Player): void {
    super.remove(player);
    if (this._occupants.length === 0) {
      this.squares = [];
      this._blackScore = 0;
      this._redScore = 0;
    }
    this._emitAreaChanged();
  }

  updateModel(checkerArea: CheckerAreaModel) {
    this.squares = checkerArea.squares;
    this._blackScore = checkerArea.blackScore;
    this._redScore = checkerArea.redScore;
  }

  public toModel(): Interactable {
    return {
      id: this.id,
      squares: this.squares,
      blackScore: this._blackScore,
      redScore: this._redScore,
    };
  }

  public updateMoveablePieces() {
    this.squares.forEach(square => square.moves = this._generalMoves(square).concat(this._attackingMoves(square)));
  }

  public makeMove(moveFrom: string, moveTo: string) {
    this.updateMoveablePieces();
    const moveFromSquare = this.squares.find(square => square.id === moveFrom);
    const moveToSquare = this.squares.find(square => square.id === moveTo);
    // If the move is a general move.
    if (
      moveFromSquare &&
      moveToSquare &&
      this._generalMoves(moveFromSquare).includes(moveToSquare.id)
    ) {
      moveToSquare.checker.id = moveFromSquare.checker.id;
      moveToSquare.checker.type = moveFromSquare.checker.type;
      // Color.EMPTY doesnt work?
      moveFromSquare.checker.id = 'empty';
      moveFromSquare.checker.type = 'empty' as Color;
    }
    // If the move is an attacking move.
    if (
      moveFromSquare &&
      moveToSquare &&
      this._attackingMoves(moveFromSquare).includes(moveToSquare.id)
    ) {
      moveToSquare.checker.id = moveFromSquare.checker.id;
      moveToSquare.checker.type = moveFromSquare.checker.type;
      // Color.EMPTY doesnt work?
      const jumpedXCoordinate = (moveFromSquare.x - moveToSquare.x) / 2;
      const jumpedYCoordinate = (moveFromSquare.y - moveToSquare.y) / 2;
      const jumpedSquare = this.squares.find(
        square => square.id === `${moveToSquare.x + jumpedXCoordinate}${moveToSquare.y + jumpedYCoordinate}`,
      );
      if (jumpedSquare) {
        jumpedSquare.checker.id = 'empty';
        jumpedSquare.checker.type = 'empty' as Color;
        moveFromSquare.checker.id = 'empty';
        moveFromSquare.checker.type = 'empty' as Color;
      }
    }
  }

  /**
   * This method serves to determine the valid general (non-attacking) moves in a
   * checkers game. The function then returns then returns the array of ids, attributed
   * the squares that the checker piece within the square being looked at can move to, without
   * attacking.
   * 
   * @param square This variable is the square's movement that is being looked into. 
   * @returns the array of ids that are attributed to squares that can be moved to.
   */
  private _generalMoves(square: CheckerSquareModel): string[] {
    let generalMoves = [];
    if (square.checker.type === 'red') {
      if (
        square.x + 1 < 8 &&
        square.y + 1 < 8 &&
        this.squares.at(((square.x + 1) * 8) + (square.y + 1))?.checker.type === 'empty'
      ) {
        const validMove = this.squares.at(((square.x + 1) * 8) + (square.y + 1))?.id;
        if (validMove !== undefined) {
          generalMoves.push(validMove);
        }
      }
      if (
        square.x + 1 < 8 &&
        square.y - 1 >= 0 &&
        this.squares.at(((square.x + 1) * 8) + (square.y - 1))?.checker.type === 'empty'
      ) {
        const validMove = this.squares.at(((square.x + 1) * 8) + (square.y - 1))?.id;
        if (validMove !== undefined) {
          generalMoves.push(validMove);
        }
      }
    }
    if (square.checker.type === 'black') {
      if (
        square.x - 1 >= 0 &&
        square.y + 1 < 8 &&
        this.squares.at(((square.x - 1) * 8) + (square.y + 1))?.checker.type === 'empty'
      ) {
        const validMove = this.squares.at(((square.x - 1) * 8) + (square.y + 1))?.id;
        if (validMove !== undefined) {
          generalMoves.push(validMove);
        }
      }
      if (
        square.x - 1 >= 0 &&
        square.y - 1 >= 0 &&
        this.squares.at(((square.x - 1) * 8) + (square.y - 1))?.checker.type === 'empty'
      ) {
        const validMove = this.squares.at(((square.x - 1) * 8) + (square.y - 1))?.id;
        if (validMove !== undefined) {
          generalMoves.push(validMove);
        }
      }
    }
    return generalMoves;
  }

  /**
   * This method serves to determine the valid attacking moves in a
   * checkers game. The function then returns then returns the array of ids, attributed to
   * the squares that the checker piece within the square being looked at can move to, while
   * attacking.
   * 
   * @param square This variable is the square's movement that is being looked into. 
   * @returns the array of ids that are attributed to squares that can be moved to as well
   * as the squares that are being jumped.
   */
  private _attackingMoves(square: CheckerSquareModel): string[] {
    let attackingMoves = [];
    if (square.checker.type === 'red') {
      if (
        square.x + 2 < 8 &&
        square.y + 2 < 8 &&
        this.squares.at(((square.x + 2) * 8) + (square.y + 2))?.checker.type === 'empty' &&
        this.squares.at(((square.x + 1) * 8) + (square.y + 1))?.checker.type === 'black'
      ) {
        const validMove = this.squares.at(((square.x + 2) * 8) + (square.y + 2))?.id;
        if (validMove !== undefined) {
          attackingMoves.push(validMove);
        }
      }
      if (
        square.x + 2 < 8 &&
        square.y - 2 >= 0 &&
        this.squares.at(((square.x + 2) * 8) + (square.y - 2))?.checker.type === 'empty' &&
        this.squares.at(((square.x + 1) * 8) + (square.y - 1))?.checker.type === 'black'
      ) {
        const validMove = this.squares.at(((square.x + 2) * 8) + (square.y - 2))?.id;
        if (validMove !== undefined) {
          attackingMoves.push(validMove);
        }
      }
    }
    if (square.checker.type === 'black') {
      if (
        square.x - 2 >= 0 &&
        square.y + 2 < 8 &&
        this.squares.at(((square.x - 2) * 8) + (square.y + 2))?.checker.type === 'empty' &&
        this.squares.at(((square.x - 1) * 8) + (square.y + 1))?.checker.type === 'red'
      ) {
        const validMove = this.squares.at(((square.x - 2) * 8) + (square.y + 2))?.id;
        if (validMove !== undefined) {
          attackingMoves.push(validMove);
        }
      }
      if (
        square.x - 2 >= 0 &&
        square.y - 2 >= 0 &&
        this.squares.at(((square.x - 2) * 8) + (square.y - 2))?.checker.type === 'empty' &&
        this.squares.at(((square.x - 1) * 8) + (square.y - 1))?.checker.type === 'red'
      ) {
        const validMove = this.squares.at(((square.x - 2) * 8) + (square.y - 2))?.id;
        if (validMove !== undefined) {
          attackingMoves.push(validMove);
        }
      }
    }
    return attackingMoves;
  }

  /**
   * Creates a new CheckerArea object that will represent a Checker Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this checker area exists
   * @param townEmitter An emitter that can be used by this checker area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): CheckerArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed checker area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new CheckerArea(
      { id: name, squares: [], blackScore: 0, redScore: 0 },
      rect,
      townEmitter,
    );
  }
}
