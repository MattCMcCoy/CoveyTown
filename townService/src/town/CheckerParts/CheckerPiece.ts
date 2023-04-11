import {
  CheckerColor,
  CheckerPiece as CheckerPieceModel,
  CheckerType,
} from '../../types/CoveyTownSocket';

export default class CheckerPiece {
  private _color: CheckerColor;

  private _type: CheckerType;

  constructor({ type, color }: CheckerPieceModel) {
    this._type = type;
    this._color = color;
  }

  public get color(): CheckerColor {
    return this._color;
  }

  public get type(): CheckerType {
    return this._type;
  }
}
