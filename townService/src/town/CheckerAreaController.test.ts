import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import TownsStore from '../lib/TownsStore';
import { getLastEmittedEvent, isCheckerArea, MockedPlayer, mockPlayer } from '../TestUtils';
import { CheckerArea, CheckerSquare, Interactable, TownEmitter } from '../types/CoveyTownSocket';
import { TownsController } from './TownsController';

type TestTownData = {
  friendlyName: string;
  townID: string;
  isPubliclyListed: boolean;
  townUpdatePassword: string;
};

const broadcastEmitter = jest.fn();
describe('TownsController integration tests', () => {
  let controller: TownsController;

  const createdTownEmitters: Map<string, DeepMockProxy<TownEmitter>> = new Map();
  async function createTownForTesting(
    friendlyNameToUse?: string,
    isPublic = false,
  ): Promise<TestTownData> {
    const friendlyName =
      friendlyNameToUse !== undefined
        ? friendlyNameToUse
        : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
    const ret = await controller.createTown({
      friendlyName,
      isPubliclyListed: isPublic,
      mapFile: 'testData/indoors.json',
    });
    return {
      friendlyName,
      isPubliclyListed: isPublic,
      townID: ret.townID,
      townUpdatePassword: ret.townUpdatePassword,
    };
  }
  function getBroadcastEmitterForTownID(townID: string) {
    const ret = createdTownEmitters.get(townID);
    if (!ret) {
      throw new Error(`Could not find broadcast emitter for ${townID}`);
    }
    return ret;
  }

  beforeAll(() => {
    // Set the twilio tokens to dummy values so that the unit tests can run
    process.env.TWILIO_API_AUTH_TOKEN = 'testing';
    process.env.TWILIO_ACCOUNT_SID = 'ACtesting';
    process.env.TWILIO_API_KEY_SID = 'testing';
    process.env.TWILIO_API_KEY_SECRET = 'testing';
  });

  beforeEach(async () => {
    createdTownEmitters.clear();
    broadcastEmitter.mockImplementation((townID: string) => {
      const mockRoomEmitter = mockDeep<TownEmitter>();
      createdTownEmitters.set(townID, mockRoomEmitter);
      return mockRoomEmitter;
    });
    TownsStore.initializeTownsStore(broadcastEmitter);
    controller = new TownsController();
  });

  describe('Interactables', () => {
    let testingTown: TestTownData;
    let player: MockedPlayer;
    let sessionToken: string;
    let interactables: Interactable[];
    beforeEach(async () => {
      testingTown = await createTownForTesting(undefined, true);
      player = mockPlayer(testingTown.townID);
      await controller.joinTown(player.socket);
      const initialData = getLastEmittedEvent(player.socket, 'initialize');
      sessionToken = initialData.sessionToken;
      interactables = initialData.interactables;
    });
    describe('Create Checker Area', () => {
      it('Executes without error when creating a new checker area', async () => {
        const checkerArea = interactables.find(isCheckerArea) as CheckerArea;
        if (!checkerArea) {
          fail('Expected at least one checker area to be returned in the initial join data');
        } else {
          const fullSquares = [];

          for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
              fullSquares.push({ id: `${x}${y}`, x, y } as CheckerSquare);
            }
          }
          const newCheckerArea: CheckerArea = {
            id: checkerArea.id,
            squares: fullSquares,
            blackScore: 0,
            redScore: 0,
            activePlayer: 0,
            players: [],
            leaderboard: [],
          };

          await controller.createCheckerArea(testingTown.townID, sessionToken, newCheckerArea);

          const townEmitter = getBroadcastEmitterForTownID(testingTown.townID);

          const updateMessage = getLastEmittedEvent(townEmitter, 'interactableUpdate');

          if (isCheckerArea(updateMessage)) {
            expect(updateMessage.id).toEqual(newCheckerArea.id);
            expect(updateMessage.squares.length).toEqual(newCheckerArea.squares.length);
            updateMessage.squares.forEach(square => {
              expect(
                newCheckerArea.squares.find(newSquare => newSquare.id === square.id),
              ).not.toBeNull();
            });
          } else {
            fail('Expected an interactableUpdate to be dispatched with the new checker area');
          }
        }
      });

      it('Executes without error when creating a new checker area with no squares', async () => {
        const checkerArea = interactables.find(isCheckerArea) as CheckerArea;
        if (!checkerArea) {
          fail('Expected at least one checker area to be returned in the initial join data');
        } else {
          const newCheckerArea: CheckerArea = {
            id: checkerArea.id,
            squares: [],
            blackScore: 0,
            redScore: 0,
            activePlayer: 0,
            players: [],
            leaderboard: [],
          };

          expect(newCheckerArea.squares.length).toEqual(0);
          // should create a brand new game with given a list of squares with nothing in them.
          await controller.createCheckerArea(testingTown.townID, sessionToken, newCheckerArea);

          const townEmitter = getBroadcastEmitterForTownID(testingTown.townID);

          const updateMessage = getLastEmittedEvent(townEmitter, 'interactableUpdate');

          if (isCheckerArea(updateMessage)) {
            expect(updateMessage.id).toEqual(newCheckerArea.id);
            expect(updateMessage.squares.length).toEqual(0);
          } else {
            fail('Expected an interactableUpdate to be dispatched with the new checker area');
          }
        }
      });

      it('Returns an error message if the town ID is invalid', async () => {
        const checkerArea = interactables.find(isCheckerArea) as CheckerArea;
        const newCheckerArea: CheckerArea = {
          id: checkerArea.id,
          squares: [],
          blackScore: 0,
          redScore: 0,
          activePlayer: 0,
          players: [],
          leaderboard: [],
        };
        await expect(
          controller.createCheckerArea(nanoid(), sessionToken, newCheckerArea),
        ).rejects.toThrow();
      });
      it('Checks for a valid session token before creating a checker area', async () => {
        const invalidSessionToken = nanoid();
        const checkerArea = interactables.find(isCheckerArea) as CheckerArea;
        const newCheckerArea: CheckerArea = {
          id: checkerArea.id,
          squares: [],
          blackScore: 0,
          redScore: 0,
          activePlayer: 0,
          players: [],
          leaderboard: [],
        };
        await expect(
          controller.createCheckerArea(testingTown.townID, invalidSessionToken, newCheckerArea),
        ).rejects.toThrow();
      });
      it('Returns an error message if addCheckerArea returns false', async () => {
        const checkerArea = interactables.find(isCheckerArea) as CheckerArea;
        checkerArea.id = nanoid();
        await expect(
          controller.createCheckerArea(testingTown.townID, sessionToken, checkerArea),
        ).rejects.toThrow();
      });

      it('initialize board initializes every square on the checker board', async () => {
        const checkerArea = interactables.find(isCheckerArea) as CheckerArea;
        if (!checkerArea) {
          fail('checker area does not exist in interactables');
        }

        expect(checkerArea.squares).toEqual([]);

        await controller.initializeCheckerAreaBoard(
          testingTown.townID,
          checkerArea.id,
          sessionToken,
        );

        const squares = await controller.getCheckerAreaSquares(
          testingTown.townID,
          checkerArea.id,
          sessionToken,
        );
        if (!squares) fail('should have recieved squares');
        expect(squares.length).toEqual(64);
        squares.forEach(square => expect(square.id).toEqual(`${square.x}${square.y}`));
      });
    });
  });
});
