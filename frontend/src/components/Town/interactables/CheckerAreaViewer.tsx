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
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useInteractable, useCheckerAreaController } from '../../../classes/TownController';
import CheckerAreaController, {
  useBlackScore,
  useCurrentPlayer,
  useRedScore,
  useSquares,
} from '../../../classes/CheckerAreaController';
import useTownController from '../../../hooks/useTownController';
import CheckerAreaInteractable from './CheckerArea';
import { CheckerSquare } from '../../../generated/client';

const CHECKER_INNER_RED = '#C53030';
const CHECKER_INNER_BLACK = '#1A202C';
const CHECKER_OUTER_RED = '#9B2C2C';
const CHECKER_OUTER_BLACK = 'black';
const CHECKER_OUTER_SIZE = '70';
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

function Board({ squares }: { squares: CheckerSquare[] | undefined }): JSX.Element {
  if (squares == undefined) {
    return <></>;
  }
  const squareSize = '20';

  // gets the color of a given square
  const getSquareColor = (x: number, y: number) => {
    const lightBrown = '#e6b273';
    const brown = '#a5681e';
    return (x % 2 === 0 && y % 2 !== 0) || (x % 2 !== 0 && y % 2 === 0) ? brown : lightBrown;
  };

  let row: JSX.Element[] = [];
  const board: JSX.Element[] = [];

  squares.forEach(square => {
    // add squares to row
    row.push(
      <Box
        w={squareSize}
        h={squareSize}
        bg={getSquareColor(square.x, square.y)}
        display='flex'
        key={square.id}>
        {square.checker.type !== 'empty' ? (
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
  const currPlayer = useCurrentPlayer(controller);
  const [title, setTitle] = useState('Waiting for other players ...');

  useEffect(() => {
    townController.getCheckerAreaBoard(controller);
  }, [townController, controller]);

  function initBoard() {
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

  async function changeTurn() {
    await townController.changeCurrentPlayer(controller).then(p => (controller.currentPlayer = p));
    //console.log('new current Player: ' + p);
    console.log('current player: ' + controller.getActivePlayer());
    toast({
      title: 'Switching turns',
      status: 'info',
    });
  }

  useEffect(() => {
    if (controller.players.length > 1) {
      setTitle('');
    }
    console.log('In useEffect');
  }, [townController, controller]);

  const squares = useSquares(controller);
  if (squares == undefined || squares.length < 1) {
    initBoard();
  }

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
        <Grid templateColumns='repeat(5, 1fr)' templateRows='repeat(2, 1fr)'>
          <GridItem colSpan={4} rowSpan={2}>
            <Flex justify={'center'} padding={'5'}>
              <Board squares={squares} />
            </Flex>
          </GridItem>
          <GridItem colSpan={1}>
            <Button onClick={() => changeTurn()}>{'Active Player: ' + currPlayer}</Button>
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

export function JoinMenu({
  controller,
  close,
}: {
  controller: CheckerAreaController;
  close: () => void;
}): JSX.Element {
  const townController = useTownController();
  const toast = useToast();
  const currPlayer = useCurrentPlayer(controller);
  const title = 'Checkers';
  const currPlayerId = townController.ourPlayer.id;
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Modal
      isOpen={true}
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
        <Button
          onClick={() => {
            console.log('calling CheckerBoard');
            if (controller.players.length < 2 && !controller.players.includes(currPlayerId)) {
              controller.addPlayer(townController.ourPlayer.id);
              onOpen();
            }
          }}>
          Join Game
        </Button>
        <CheckerBoard controller={controller} isOpen={isOpen} close={close} />
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

  console.log('checker players: ' + checkerAreaController.players);

  // If a checkers game has started
  if (!selectIsOpen) {
    return (
      <Modal
        isOpen={!selectIsOpen}
        onClose={() => {
          townController.unPause();
          townController.interactEnd(checkerArea);
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
      <JoinMenu
        controller={checkerAreaController}
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
  const checkerArea = useInteractable<CheckerAreaInteractable>('checkerArea');
  if (checkerArea) {
    return <CheckerGame checkerArea={checkerArea} />;
  }
  return <></>;
}
