import { CheckerPiece as CheckerPieceModel } from '../../types/CoveyTownSocket';

export default class CheckerPiece {
  private _id: string;

  private _type: string;

  constructor({ id, type }: CheckerPieceModel) {
    this._id = id;
    this._type = type;
  }

  public get id(): string {
    return this._id;
  }

  public get type(): string {
    return this._type;
  }
}
