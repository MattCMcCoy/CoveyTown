import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  Interactable,
  CheckerArea as CheckerAreaModel,
  CheckerSquare as CheckerSquareModel,
  CheckerPiece as CheckerPieceModel,
  BoundingBox,
  TownEmitter,
  CheckerLeaderboardItem,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class CheckerArea extends InteractableArea {
  private _squares: CheckerSquareModel[] = [];

  private _leaderboard: CheckerLeaderboardItem[] = [];

  private _redScore: number;

  private _blackScore: number;

  private _activePlayer: number;

  private _players: string[];

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

  public get activePlayer(): number {
    return this._activePlayer;
  }

  public get players(): string[] {
    return this._players;
  }

  public get leaderboard(): CheckerLeaderboardItem[] {
    return this._leaderboard;
  }

  /**
   * Creates a new checker area
   *
   * @param checkerArea model containing the areas starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, squares, blackScore, redScore, leaderboard }: CheckerAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);

    this.squares = squares;
    this._blackScore = blackScore;
    this._redScore = redScore;
    this._activePlayer = 0;
    this._players = [];
    this._leaderboard = leaderboard;
  }

  /**
   * initializes the board with all of its base values, including checker pieces.
   */
  public initializeBoard() {
    this._activePlayer = 0;
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
    if (this._occupants.length < 2) {
      this.squares = [];
      this._blackScore = 0;
      this._redScore = 0;
      this._activePlayer = 0;
      this._players = [];
      this._leaderboard = [];
    }
    this._emitAreaChanged();
  }

  updateModel(checkerArea: CheckerAreaModel) {
    this.squares = checkerArea.squares;
    this._blackScore = checkerArea.blackScore;
    this._redScore = checkerArea.redScore;
    this._activePlayer = checkerArea.activePlayer;
    this._players = checkerArea.players;
    this._leaderboard = checkerArea.leaderboard;
  }

  public toModel(): Interactable {
    return {
      id: this.id,
      squares: this.squares,
      blackScore: this._blackScore,
      redScore: this._redScore,
      activePlayer: this._activePlayer,
      players: this._players,
      leaderboard: this._leaderboard,
    };
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
      {
        id: name,
        squares: [],
        blackScore: 0,
        redScore: 0,
        activePlayer: 0,
        players: [],
        leaderboard: [],
      },
      rect,
      townEmitter,
    );
  }
}
