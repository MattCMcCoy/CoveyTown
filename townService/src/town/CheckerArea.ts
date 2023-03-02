import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  Interactable,
  CheckerArea as CheckerAreaModel,
  BoundingBox,
  TownEmitter,
} from '../types/CoveyTownSocket';
import Square from './CheckerParts/Square';
import InteractableArea from './InteractableArea';

export default class CheckerArea extends InteractableArea {
  private _squares: Square[] = [];

  public constructor({ id }: CheckerAreaModel, coordinates: BoundingBox, townEmitter: TownEmitter) {
    super(id, coordinates, townEmitter);

    this._initializeSquares();
  }

  /**
   * initialize squares.
   */
  private _initializeSquares(): void {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        this._squares.push(new Square({ id: `${x}${y}`, x, y }));
      }
    }
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
      this._initializeSquares();
    }
    this._emitAreaChanged();
  }

  updateModel(checkerArea: CheckerAreaModel) {
    throw new Error('Method not implemented.');
  }

  public toModel(): Interactable {
    return { id: this.id };
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
    return new CheckerArea({ id: name }, rect, townEmitter);
  }
}
