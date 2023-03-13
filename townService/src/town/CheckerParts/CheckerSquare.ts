import { CheckerSquare as CheckerSquareModel } from '../../types/CoveyTownSocket';

export default class CheckerSquare {
  private _id: string;

  private _x: number;

  private _y: number;

  constructor({ id, x, y }: CheckerSquareModel) {
    this._id = id;
    this._x = x;
    this._y = y;
  }

  public get id(): string {
    return this._id;
  }

  public get x(): number {
    return this._x;
  }

  public get y(): number {
    return this.y;
  }
}
