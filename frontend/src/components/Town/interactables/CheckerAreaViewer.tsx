import {
  HStack,
  VStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  Box,
  Flex,
  Circle,
  Square,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useInteractable, useCheckerAreaController } from '../../../classes/TownController';
import CheckerAreaController, {
  useBlackScore,
  useRedScore,
  useSquares,
} from '../../../classes/CheckerAreaController';
import useTownController from '../../../hooks/useTownController';
import CheckerAreaInteractable from './CheckerArea';
import { CheckerSquare } from '../../../generated/client';
import CheckerOptionModal from './CheckerOptionModal';
import CheckerLeaderboardModal from './CheckerLeaderboardModal';

const CHECKER_INNER_RED = '#C53030';
const CHECKER_INNER_BLACK = '#1A202C';
const CHECKER_OUTER_RED = '#9B2C2C';
const CHECKER_OUTER_BLACK = 'black';
const CHECKER_HIGHLIGHT_SIZE = '70';
const CHECKER_OUTER_SIZE = '65';
const CHECKER_INNER_SIZE = '50';

function Score({ controller }: { controller: CheckerAreaController }): JSX.Element {
  const blackScore = useBlackScore(controller);
  const redScore = useRedScore(controller);
  return (
    <Square display={'grid'}>
      <Circle size={CHECKER_OUTER_SIZE} margin='auto' bg={CHECKER_OUTER_RED} marginBottom={5}>
        <Circle
          size={CHECKER_INNER_SIZE}
          margin='auto'
          bg={CHECKER_INNER_RED}
          shadow='inner'
          textColor={'white'}>
          {redScore}
        </Circle>
      </Circle>
      <Circle size={CHECKER_OUTER_SIZE} margin='auto' bg={CHECKER_OUTER_BLACK}>
        <Circle
          size={CHECKER_INNER_SIZE}
          margin='auto'
          bg={CHECKER_INNER_BLACK}
          shadow='inner'
          textColor={'white'}>
          {blackScore}
        </Circle>
      </Circle>
    </Square>
  );
}
function Board({
  squares,
  controller,
}: {
  squares: CheckerSquare[] | undefined;
  controller: CheckerAreaController;
}): JSX.Element {
  const [moveFrom, setMoveFrom] = useState<string>('');
  const [moveTo, setMoveTo] = useState<string>('');
  const townController = useTownController();

  useEffect(() => {
    if (moveFrom && moveTo) {
      townController
        .makeCheckerMove(controller, moveFrom, moveTo)
        .then(newBoard => (controller.squares = newBoard));
      setMoveFrom('');
      setMoveTo('');
    }
  }, [controller, moveFrom, moveTo, townController]);
  if (squares == undefined) {
    return <></>;
  }

  // gets the color of a given square
  const getSquareColor = (x: number, y: number) => {
    const lightBrown = '#e6b273';
    const brown = '#a5681e';
    return (x % 2 === 0 && y % 2 !== 0) || (x % 2 !== 0 && y % 2 === 0) ? brown : lightBrown;
  };

  let row: JSX.Element[] = [];
  const board: JSX.Element[] = [];

  function handleSquareClick(id: string): void {
    if (moveFrom == '') {
      setMoveFrom(id);
    } else if (moveTo == '') {
      setMoveTo(id);
    } else {
      setMoveFrom(id);
      setMoveTo('');
    }
  }

  squares.forEach(square => {
    // add squares to row
    row.push(
      <Box
        w={'20'}
        h={'20'}
        bg={getSquareColor(square.x, square.y)}
        display='flex'
        key={square.id}
        onClick={() => handleSquareClick(square.id)}>
        {square.checker.type !== 'empty' ? (
          <Circle
            size={CHECKER_HIGHLIGHT_SIZE}
            margin='auto'
            bg={moveFrom == `${square.x}${square.y}` ? 'yellow' : 'transparent'}>
            <Circle
              size={CHECKER_OUTER_SIZE}
              margin='auto'
              bg={square.checker.type == 'red' ? CHECKER_OUTER_RED : CHECKER_OUTER_BLACK}>
              <Circle
                size={CHECKER_INNER_SIZE}
                margin='auto'
                bg={square.checker.type == 'red' ? CHECKER_INNER_RED : CHECKER_INNER_BLACK}
                shadow='inner'></Circle>
            </Circle>
          </Circle>
        ) : null}
      </Box>,
    );
    // add row to checker board
    if (square.y === 7) {
      board.push(
        <HStack spacing='0px' key={square.x}>
          {row}
        </HStack>,
      );
      row = [];
    }
  });

  return <VStack spacing='0px'>{board}</VStack>;
}

/**
 * The CheckerBoard component does the following:
 * -- renders the checkerBoard of a CheckerArea (in a modal)
 * -- displays the title of the CheckerArea as the header of the modal
 *
 * @param props: A 'controller', which is the CheckerArea corresponding to the
 *               current checker area.
 *             : A 'isOpen' flag, denoting whether or not the modal should open (it should open if the a checkers game is started)
 *             : A 'close' function, to be called when the modal is closed
 */
export function CheckerBoard({
  controller,
  isOpen,
  close,
}: {
  controller: CheckerAreaController;
  isOpen: boolean;
  close: () => void;
}): JSX.Element {
  const townController = useTownController();
  const toast = useToast();
  const title = 'Checkers';

  useEffect(() => {
    townController.getCheckerAreaBoard(controller);
  }, [townController, controller]);

  const squares = useSquares(controller);

  useEffect(() => {
    if (squares == undefined || squares.length < 1) {
      if (controller.squares.length < 1) {
        townController
          .initializeCheckerSessionAreaBoard(controller)
          .then(newBoard => (controller.squares = newBoard));
      } else {
        toast({
          title: `Cant initialize Board`,
          status: 'error',
        });
      }
    }
  }, [controller, squares, toast, townController]);

  useEffect(() => {
    townController
      .getCheckerAreaBoard(controller)
      .then(newBoard => (controller.squares = newBoard));
  }, [controller, squares, townController]);

  return (
    <Modal
      isOpen={isOpen}
      size={'4xl'}
      onClose={() => {
        close();
        townController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        {<ModalHeader>{title} </ModalHeader>}
        <ModalCloseButton />
        <ModalBody pb={6}></ModalBody>
        <Grid templateColumns='repeat(5, 1fr)'>
          <GridItem colSpan={4}>
            <Flex justify={'center'} padding={'5'}>
              <Board squares={squares} controller={controller} />
            </Flex>
          </GridItem>
          <GridItem colSpan={1} margin='auto'>
            <Score controller={controller} />
          </GridItem>
        </Grid>
        <ModalFooter />
        {/* </form> */}
      </ModalContent>
    </Modal>
  );
}

/**
 * The CheckerGame monitors the player's interaction with a CheckerArea on the map: displaying either
 * a popup to notifying the player that a game is in progress or if a game is not in progress a CheckerBoard modal to display the checkerBoard.
 *
 * @param props: the checkerArea interactable that is being interacted with
 */
export function CheckerGame({
  checkerArea,
}: {
  checkerArea: CheckerAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const checkerAreaController = useCheckerAreaController(checkerArea.name);
  // selectIsOpen is true if the squares have not been initialized
  const [selectIsOpen, setSelectIsOpen] = useState(checkerAreaController.squares.length < 1);

  // If a checkers game has started
  if (!selectIsOpen) {
    return (
      <Modal
        isOpen={!selectIsOpen}
        onClose={() => {
          townController.unPause();
        }}>
        <ModalOverlay />
        <ModalContent>
          {<ModalHeader>Game in Progress</ModalHeader>}
          <Score controller={checkerAreaController} />
          <ModalCloseButton />
          <ModalFooter />
          {/* </form> */}
        </ModalContent>
      </Modal>
    );
  }
  return (
    <>
      <CheckerBoard
        controller={checkerAreaController}
        isOpen={selectIsOpen}
        close={() => {
          setSelectIsOpen(false);
          // forces game to emit "checkerArea" event again so that
          // repoening the modal works as expected
          townController.interactEnd(checkerArea);
        }}
      />
    </>
  );
}

/**
 * The CheckerAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with checker area.
 */
export default function CheckerAreaWrapper(): JSX.Element {
  const [beginGame, setBeginGame] = useState(false);
  const [isLeaderboardOpen, setLeaderboardOpen] = useState(false);
  const checkerArea = useInteractable<CheckerAreaInteractable>('checkerArea');
  const changeGameState = (val: boolean) => {
    setBeginGame(val);
  };
  if (checkerArea && beginGame) {
    return <CheckerGame checkerArea={checkerArea} />;
  } else if (checkerArea) {
    if (isLeaderboardOpen) {
      return (
        <CheckerLeaderboardModal
          isLeaderboardOpen={isLeaderboardOpen}
          checkerArea={checkerArea}
          closeLeaderboard={() => setLeaderboardOpen(false)}
        />
      );
    }
    return (
      <CheckerOptionModal
        changeGameState={changeGameState}
        openLeaderboard={() => setLeaderboardOpen(true)}
      />
    );
  }
  return <></>;
}
