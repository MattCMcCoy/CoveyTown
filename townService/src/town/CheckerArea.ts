import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  Interactable,
  CheckerArea as CheckerAreaModel,
  CheckerSquare as CheckerSquareModel,
  BoundingBox,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class CheckerArea extends InteractableArea {
  private _squares: CheckerSquareModel[] = [];

  public get squares(): CheckerSquareModel[] {
    return this._squares;
  }

  public set squares(squares: CheckerSquareModel[]) {
    this._squares = squares;
  }

  /**
   * Creates a new checker area
   *
   * @param checkerArea model containing the areas starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, squares }: CheckerAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);

    this.squares = squares;
  }

  /**
   * initializes the board with all of its base values, including checker pieces.
   */
  public initializeBoard() {
    const newSquares = [];
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        newSquares.push({ id: `${x}${y}`, x, y } as CheckerSquareModel);
      }
    }

    this.squares = newSquares;
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
    }
    this._emitAreaChanged();
  }

  updateModel(checkerArea: CheckerAreaModel) {
    this.squares = checkerArea.squares;
  }

  public toModel(): Interactable {
    return { id: this.id, squares: this.squares };
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
    return new CheckerArea({ id: name, squares: [] }, rect, townEmitter);
  }
}
