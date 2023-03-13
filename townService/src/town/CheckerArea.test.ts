import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { TownEmitter } from '../types/CoveyTownSocket';
import CheckerArea from './CheckerArea';
import { getLastEmittedEvent } from '../TestUtils';
import CheckerSquare from './CheckerParts/CheckerSquare';

describe('CheckerArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: CheckerArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;
  let squares: CheckerSquare[];

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new CheckerArea({ id, squares: [] }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
    squares = [];
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        squares.push({ id: `${x}${y}`, x, y } as CheckerSquare);
      }
    }
  });

  describe('add', () => {
    it('Adds the player to the occupants list', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);
    });

    it("Sets the player's interactableID and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });

  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so we dont test when last person leaves.
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, squares: [] });
    });
  });

  test('toModel sets the id and squares', () => {
    const model = testArea.toModel();

    expect(model).toEqual({ id, squares: [] });
  });

  test('update model sets the squares', () => {
    const newSquares: CheckerSquare[] = [];
    const newId = 'newID';

    testArea.updateModel({ id: newId, squares: newSquares });
    expect(testArea.id).toBe(id);
    expect(testArea.squares).toBe(newSquares);
  });

  describe('initializeBoard', () => {
    it('Sets square list to be an 8 by 8 checker board.', () => {
      expect(testArea.squares).toEqual([]);
      testArea.initializeBoard();
      expect(testArea.squares.length).toEqual(64);
      testArea.squares.forEach(square => expect(square.id).toEqual(`${square.x}${square.y}`));
    });
  });

  describe('fromMapObject', () => {
    it('Throws an error if the width is missing', () => {
      expect(() =>
        CheckerArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, height: 100, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Throws an error if the height is missing', () => {
      expect(() =>
        CheckerArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, width: 100, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });

    it('Creates a new checker area using the provided boundingBox and id, and emitter', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = CheckerArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.squares).toEqual([]);
      expect(val.occupantsByID).toEqual([]);
    });
  });
});
