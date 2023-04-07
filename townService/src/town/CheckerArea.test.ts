import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { Color, TownEmitter } from '../types/CoveyTownSocket.d';
import CheckerArea from './CheckerArea';
import { getLastEmittedEvent } from '../TestUtils';
import CheckerSquare from './CheckerParts/CheckerSquare';
import CheckerPieceModel from './CheckerParts/CheckerPiece';

describe('CheckerArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: CheckerArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;
  let squares: CheckerSquare[];

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new CheckerArea(
      { id, squares: [], blackScore: 0, redScore: 0 },
      testAreaBox,
      townEmitter,
    );
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
    it('Removes the player from the list of occupants, clears the board, and emits an interactableUpdate event', () => {
      testArea.initializeBoard();
      expect(testArea.squares.length).toBeGreaterThan(0);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, squares: [], redScore: 0, blackScore: 0 });
    });

    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so we dont test when last person leaves.
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ id, squares: [], redScore: 0, blackScore: 0 });
    });
  });

  test('toModel sets the id and squares', () => {
    const model = testArea.toModel();

    expect(model).toEqual({ id, squares: [], redScore: 0, blackScore: 0 });
  });

  test('update model sets the squares', () => {
    const newSquares: CheckerSquare[] = [];
    const newId = 'newID';

    testArea.updateModel({ id: newId, squares: newSquares, blackScore: 0, redScore: 0 });
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

    it('Verfies checkersPieces are on the board.', () => {
      expect(testArea.squares).toEqual([]);
      testArea.initializeBoard();
      expect(testArea.squares.length).toEqual(64);
      testArea.squares.forEach(square => expect(square.id).toEqual(`${square.x}${square.y}`));
      expect(testArea.squares.at(1)?.checker).toEqual({
        id: 'red 0',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(3)?.checker).toEqual({
        id: 'red 1',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(5)?.checker).toEqual({
        id: 'red 2',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(7)?.checker).toEqual({
        id: 'red 3',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(8)?.checker).toEqual({
        id: 'red 4',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(10)?.checker).toEqual({
        id: 'red 5',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(12)?.checker).toEqual({
        id: 'red 6',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(14)?.checker).toEqual({
        id: 'red 7',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(17)?.checker).toEqual({
        id: 'red 8',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(19)?.checker).toEqual({
        id: 'red 9',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(21)?.checker).toEqual({
        id: 'red 10',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(23)?.checker).toEqual({
        id: 'red 11',
        type: 'red',
      } as CheckerPieceModel);
      expect(testArea.squares.at(40)?.checker).toEqual({
        id: 'black 11',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(42)?.checker).toEqual({
        id: 'black 10',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(44)?.checker).toEqual({
        id: 'black 9',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(46)?.checker).toEqual({
        id: 'black 8',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(49)?.checker).toEqual({
        id: 'black 7',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(51)?.checker).toEqual({
        id: 'black 6',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(53)?.checker).toEqual({
        id: 'black 5',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(55)?.checker).toEqual({
        id: 'black 4',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(56)?.checker).toEqual({
        id: 'black 3',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(58)?.checker).toEqual({
        id: 'black 2',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(60)?.checker).toEqual({
        id: 'black 1',
        type: 'black',
      } as CheckerPieceModel);
      expect(testArea.squares.at(62)?.checker).toEqual({
        id: 'black 0',
        type: 'black',
      } as CheckerPieceModel);
    });

  it('Verfies the valid moves are stored correctly at game start.', () => {
    expect(testArea.squares).toEqual([]);
    testArea.initializeBoard();
    testArea.updateMoveablePieces();
    expect(testArea.squares.length).toEqual(64);
    testArea.squares.forEach(square => expect(square.id).toEqual(`${square.x}${square.y}`));
    expect(testArea.squares.at(0)?.moves.length).toEqual(0);
    expect(testArea.squares.at(1)?.moves.length).toEqual(0);
    expect(testArea.squares.at(2)?.moves.length).toEqual(0);
    expect(testArea.squares.at(3)?.moves.length).toEqual(0);
    expect(testArea.squares.at(4)?.moves.length).toEqual(0);
    expect(testArea.squares.at(5)?.moves.length).toEqual(0);
    expect(testArea.squares.at(6)?.moves.length).toEqual(0);
    expect(testArea.squares.at(7)?.moves.length).toEqual(0);
    expect(testArea.squares.at(8)?.moves.length).toEqual(0);
    expect(testArea.squares.at(9)?.moves.length).toEqual(0);
    expect(testArea.squares.at(10)?.moves.length).toEqual(0);
    expect(testArea.squares.at(11)?.moves.length).toEqual(0);
    expect(testArea.squares.at(12)?.moves.length).toEqual(0);
    expect(testArea.squares.at(13)?.moves.length).toEqual(0);
    expect(testArea.squares.at(14)?.moves.length).toEqual(0);
    expect(testArea.squares.at(15)?.moves.length).toEqual(0);
    expect(testArea.squares.at(16)?.moves.length).toEqual(0);
    expect(testArea.squares.at(17)?.moves.length).toEqual(2);
    expect(testArea.squares.at(18)?.moves.length).toEqual(0);
    expect(testArea.squares.at(19)?.moves.length).toEqual(2);
    expect(testArea.squares.at(20)?.moves.length).toEqual(0);
    expect(testArea.squares.at(21)?.moves.length).toEqual(2);
    expect(testArea.squares.at(22)?.moves.length).toEqual(0);
    expect(testArea.squares.at(23)?.moves.length).toEqual(1);
    expect(testArea.squares.at(24)?.moves.length).toEqual(0);
    expect(testArea.squares.at(25)?.moves.length).toEqual(0);
    expect(testArea.squares.at(26)?.moves.length).toEqual(0);
    expect(testArea.squares.at(27)?.moves.length).toEqual(0);
    expect(testArea.squares.at(28)?.moves.length).toEqual(0);
    expect(testArea.squares.at(29)?.moves.length).toEqual(0);
    expect(testArea.squares.at(30)?.moves.length).toEqual(0);
    expect(testArea.squares.at(31)?.moves.length).toEqual(0);
    expect(testArea.squares.at(32)?.moves.length).toEqual(0);
    expect(testArea.squares.at(33)?.moves.length).toEqual(0);
    expect(testArea.squares.at(34)?.moves.length).toEqual(0);
    expect(testArea.squares.at(35)?.moves.length).toEqual(0);
    expect(testArea.squares.at(36)?.moves.length).toEqual(0);
    expect(testArea.squares.at(37)?.moves.length).toEqual(0);
    expect(testArea.squares.at(38)?.moves.length).toEqual(0);
    expect(testArea.squares.at(39)?.moves.length).toEqual(0);
    expect(testArea.squares.at(40)?.moves.length).toEqual(1);
    expect(testArea.squares.at(41)?.moves.length).toEqual(0);
    expect(testArea.squares.at(42)?.moves.length).toEqual(2);
    expect(testArea.squares.at(43)?.moves.length).toEqual(0);
    expect(testArea.squares.at(44)?.moves.length).toEqual(2);
    expect(testArea.squares.at(45)?.moves.length).toEqual(0);
    expect(testArea.squares.at(46)?.moves.length).toEqual(2);
    expect(testArea.squares.at(47)?.moves.length).toEqual(0);
    expect(testArea.squares.at(48)?.moves.length).toEqual(0);
    expect(testArea.squares.at(49)?.moves.length).toEqual(0);
    expect(testArea.squares.at(50)?.moves.length).toEqual(0);
    expect(testArea.squares.at(51)?.moves.length).toEqual(0);
    expect(testArea.squares.at(52)?.moves.length).toEqual(0);
    expect(testArea.squares.at(53)?.moves.length).toEqual(0);
    expect(testArea.squares.at(54)?.moves.length).toEqual(0);
    expect(testArea.squares.at(55)?.moves.length).toEqual(0);
    expect(testArea.squares.at(56)?.moves.length).toEqual(0);
    expect(testArea.squares.at(57)?.moves.length).toEqual(0);
    expect(testArea.squares.at(58)?.moves.length).toEqual(0);
    expect(testArea.squares.at(59)?.moves.length).toEqual(0);
    expect(testArea.squares.at(60)?.moves.length).toEqual(0);
    expect(testArea.squares.at(61)?.moves.length).toEqual(0);
    expect(testArea.squares.at(62)?.moves.length).toEqual(0);
    expect(testArea.squares.at(63)?.moves.length).toEqual(0);

    expect(testArea.squares.find(square => square.id === `${2}${1}`)?.moves.includes(`${3}${0}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${2}${1}`)?.moves.includes(`${3}${2}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${2}${3}`)?.moves.includes(`${3}${2}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${2}${3}`)?.moves.includes(`${3}${4}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${2}${5}`)?.moves.includes(`${3}${4}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${2}${5}`)?.moves.includes(`${3}${6}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${2}${7}`)?.moves.includes(`${3}${6}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${5}${0}`)?.moves.includes(`${4}${1}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${5}${2}`)?.moves.includes(`${4}${1}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${5}${2}`)?.moves.includes(`${4}${3}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${5}${4}`)?.moves.includes(`${4}${3}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${5}${4}`)?.moves.includes(`${4}${5}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${5}${6}`)?.moves.includes(`${4}${5}`)).toEqual(true);
    expect(testArea.squares.find(square => square.id === `${5}${6}`)?.moves.includes(`${4}${7}`)).toEqual(true);
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
