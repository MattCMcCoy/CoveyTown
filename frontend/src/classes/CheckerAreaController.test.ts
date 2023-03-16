import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { CheckerArea, CheckerPiece as CheckerPieceModel } from '../types/CoveyTownSocket';
import CheckerAreaController, { CheckerAreaEvents } from './CheckerAreaController';
import TownController from './TownController';

describe('CheckerAreaController', () => {
  let testArea: CheckerAreaController;
  let testAreaModel: CheckerArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<CheckerAreaEvents>();

  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      squares: [],
    };
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        testAreaModel.squares.push({
          id: `${x}${y}`,
          x,
          y,
          checker: { id: 'empty', type: 'empty' } as CheckerPieceModel,
        });
      }
    }
    testArea = new CheckerAreaController(testAreaModel);
    mockClear(townController);
    mockClear(mockListeners.checkerSquareChange);
    testArea.addListener('checkerSquareChange', mockListeners.checkerSquareChange);
  });

  describe('Updating squares', () => {
    it('updates the property and emits a checkerSquareChange event if the property changes', () => {
      const newSquares: { id: string; x: number; y: number; checker: CheckerPieceModel }[] = [];
      testArea.squares = newSquares;
      expect(mockListeners.checkerSquareChange).toBeCalledWith(newSquares);
      expect(testArea.squares).toEqual(newSquares);
    });
    it('does not emit a checkerSquareChange event if the propery does not change', () => {
      testArea.squares = testAreaModel.squares;
      expect(mockListeners.checkerSquareChange).not.toBeCalled();
    });
  });

  describe('checkerAreaModel', () => {
    it('Carries through all the properties', () => {
      const model = testArea.checkerAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });

  describe('updateFrom', () => {
    it('Updates the squares property', () => {
      const newModel: CheckerArea = {
        id: testAreaModel.id,
        squares: [],
      };

      testArea.updateFrom(newModel);
      expect(testArea.squares).toEqual(newModel.squares);
      expect(mockListeners.checkerSquareChange).toBeCalledWith(newModel.squares);
    });

    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: CheckerArea = {
        id: nanoid(),
        squares: testArea.squares,
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
