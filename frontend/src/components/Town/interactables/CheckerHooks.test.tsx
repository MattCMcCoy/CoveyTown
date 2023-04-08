import CheckerAreaController, { CheckerAreaEvents } from '../../../classes/CheckerAreaController';
import TownController from '../../../classes/TownController';
import { ChakraProvider } from '@chakra-ui/react';
import { cleanup, render, RenderResult } from '@testing-library/react';
import { DeepMockProxy, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import React from 'react';
import { act } from 'react-dom/test-utils';
import TownControllerContext from '../../../contexts/TownControllerContext';
import { EventNames, mockTownController } from '../../../TestUtils';
import { CheckerBoard } from './CheckerAreaViewer';
import { CheckerPiece, CheckerSquare } from '../../../generated/client';

function renderCheckerArea(checkerArea: CheckerAreaController, townController: TownController) {
  let selectIsOpen = checkerArea.squares === undefined || checkerArea.squares.length < 1;
  const close = () => {
    selectIsOpen = false;
  };
  return (
    <ChakraProvider>
      <TownControllerContext.Provider value={townController}>
        <CheckerBoard controller={checkerArea} isOpen={!selectIsOpen} close={close} />
      </TownControllerContext.Provider>
    </ChakraProvider>
  );
}

describe('Checker Board Viewer', () => {
  const mockToast = jest.fn();
  let checkerArea: CheckerAreaController;
  type CheckerAreaEventName = keyof CheckerAreaEvents;
  let addListenerSpy: jest.SpyInstance<
    CheckerAreaController,
    [event: CheckerAreaEventName, listener: CheckerAreaEvents[CheckerAreaEventName]]
  >;

  let removeListenerSpy: jest.SpyInstance<
    CheckerAreaController,
    [event: CheckerAreaEventName, listener: CheckerAreaEvents[CheckerAreaEventName]]
  >;

  let townController: DeepMockProxy<TownController>;

  let renderData: RenderResult;
  beforeEach(() => {
    mockClear(mockToast);
    const piece = { id: '1', type: 'red' } as CheckerPiece;
    const checker = { id: '11', x: 1, y: 1, checker: piece } as CheckerSquare;
    checkerArea = new CheckerAreaController({
      id: `id-${nanoid()}`,
      squares: [checker],
      blackScore: 0,
      redScore: 0,
      activePlayer: 0,
      players: [],
      leaderboard: [],
    });
    townController = mockTownController({ checkerAreas: [checkerArea] });

    addListenerSpy = jest.spyOn(checkerArea, 'addListener');
    removeListenerSpy = jest.spyOn(checkerArea, 'removeListener');

    renderData = render(renderCheckerArea(checkerArea, townController));
  });

  /**
   * Retrieve the listener passed to "addListener" for a given eventName
   * @throws Error if the addListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerAdded<Ev extends EventNames<CheckerAreaEvents>>(
    eventName: Ev,
    spy = addListenerSpy,
  ): CheckerAreaEvents[Ev] {
    const addedListeners = spy.mock.calls.filter(eachCall => eachCall[0] === eventName);
    if (addedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one addListener call for ${eventName} but found ${addedListeners.length}`,
      );
    }
    return addedListeners[0][1] as unknown as CheckerAreaEvents[Ev];
  }
  /**
   * Retrieve the listener pased to "removeListener" for a given eventName
   * @throws Error if the removeListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerRemoved<Ev extends EventNames<CheckerAreaEvents>>(
    eventName: Ev,
  ): CheckerAreaEvents[Ev] {
    const removedListeners = removeListenerSpy.mock.calls.filter(
      eachCall => eachCall[0] === eventName,
    );
    if (removedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one removeListeners call for ${eventName} but found ${removedListeners.length}`,
      );
    }
    return removedListeners[0][1] as unknown as CheckerAreaEvents[Ev];
  }

  describe('CheckerHooks', () => {
    it('useRedScore Registers exactly one redScoreChange listener', () => {
      act(() => {
        checkerArea.emit('redScoreChange', 1);
      });
      act(() => {
        checkerArea.emit('redScoreChange', 2);
      });
      act(() => {
        checkerArea.emit('redScoreChange', 3);
      });
      getSingleListenerAdded('redScoreChange');
    });
    it('useRedScore Unregisters exactly the same redScoreChange listener on unmounting', () => {
      act(() => {
        checkerArea.emit('redScoreChange', 1);
      });
      const listenerAdded = getSingleListenerAdded('redScoreChange');
      cleanup();
      expect(getSingleListenerRemoved('redScoreChange')).toBe(listenerAdded);
    });
    it('useBlackScore Registers exactly one blackScoreChange listener', () => {
      act(() => {
        checkerArea.emit('blackScoreChange', 1);
      });
      act(() => {
        checkerArea.emit('blackScoreChange', 2);
      });
      act(() => {
        checkerArea.emit('blackScoreChange', 3);
      });
      getSingleListenerAdded('blackScoreChange');
    });
    it('useBlackScore Unregisters exactly the same blackScoreChange listener on unmounting', () => {
      act(() => {
        checkerArea.emit('blackScoreChange', 1);
      });
      const listenerAdded = getSingleListenerAdded('blackScoreChange');
      cleanup();
      expect(getSingleListenerRemoved('blackScoreChange')).toBe(listenerAdded);
    });
    it('useSquares Registers exactly one checkerSquareChange listener', () => {
      const piece = { id: '1', type: 'red' } as CheckerPiece;
      const piece2 = { id: '2', type: 'black' } as CheckerPiece;
      const checker = { id: '11', x: 1, y: 1, checker: piece } as CheckerSquare;
      const checker2 = { id: '12', x: 1, y: 2, checker: piece2 } as CheckerSquare;
      act(() => {
        checkerArea.emit('checkerSquareChange', [checker, checker2]);
      });
      act(() => {
        checkerArea.emit('checkerSquareChange', [checker]);
      });
      act(() => {
        checkerArea.emit('checkerSquareChange', [checker, checker2]);
      });
      getSingleListenerAdded('checkerSquareChange');
    });
    it('useSquares Unregisters exactly the same checkerSquareChange listener on unmounting', () => {
      act(() => {
        checkerArea.emit('checkerSquareChange', []);
      });
      const listenerAdded = getSingleListenerAdded('checkerSquareChange');
      cleanup();
      expect(getSingleListenerRemoved('checkerSquareChange')).toBe(listenerAdded);
    });
    it('Removes the listeners and adds new ones if the controller changes', () => {
      const origCheckerChange = getSingleListenerAdded('checkerSquareChange');
      const origRedScoreChange = getSingleListenerAdded('redScoreChange');
      const origBlackScoreChange = getSingleListenerAdded('blackScoreChange');
      const piece = { id: '1', type: 'red' } as CheckerPiece;
      const piece2 = { id: '2', type: 'black' } as CheckerPiece;
      const checker = { id: '11', x: 1, y: 1, checker: piece } as CheckerSquare;
      const checker2 = { id: '12', x: 1, y: 2, checker: piece2 } as CheckerSquare;

      const newCheckerAreaController = new CheckerAreaController({
        id: nanoid(),
        squares: [checker, checker2],
        blackScore: 10,
        redScore: 10,
        activePlayer: 0,
        players: [],
        leaderboard: [{ position: 2, playerId: '123', wins: 3, losses: 2 }],
      });
      const newAddListenerSpy = jest.spyOn(newCheckerAreaController, 'addListener');
      renderData.rerender(renderCheckerArea(newCheckerAreaController, townController));

      expect(getSingleListenerRemoved('checkerSquareChange')).toBe(origCheckerChange);
      expect(getSingleListenerRemoved('redScoreChange')).toBe(origRedScoreChange);
      expect(getSingleListenerRemoved('blackScoreChange')).toBe(origBlackScoreChange);

      getSingleListenerAdded('checkerSquareChange', newAddListenerSpy);
      getSingleListenerAdded('redScoreChange', newAddListenerSpy);
      getSingleListenerAdded('blackScoreChange', newAddListenerSpy);
    });
  });
});
