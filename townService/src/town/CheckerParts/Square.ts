interface SquareModel {
  id: string;
  x: number;
  y: number;
}

export default class Square {
  private _id: string;

  private _x: number;

  private _y: number;

  constructor({ id, x, y }: SquareModel) {
    this._id = id;
    this._x = x;
    this._y = y;
  }
}
