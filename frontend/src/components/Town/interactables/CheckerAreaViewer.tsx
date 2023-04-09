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
  useRedScore,
  useActivePlayer,
  useSquares,
  usePlayers,
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
const CHECKER_OUTER_SIZE = '70';
const CHECKER_INNER_SIZE = '50';
const MAX_PLAYERS = 2;

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
  const squareSize = '20';
  const townController = useTownController();
  const toast = useToast();
  const currPlayer = townController.ourPlayer.id;
  let source: CheckerSquare;
  const [firstButtonClicked, setFirstButtonClicked] = useState(0);
  const [, setSecondButtonClicked] = useState(0);
  if (squares == undefined || squares.length == 0) {
    return <></>;
  }

  // gets the color of a given square
  const getSquareColor = (x: number, y: number) => {
    const lightBrown = '#e6b273';
    const brown = '#a5681e';
    return (x % 2 === 0 && y % 2 !== 0) || (x % 2 !== 0 && y % 2 === 0) ? brown : lightBrown;
  };

  async function changeTurn() {
    await townController.changeActivePlayer(controller).then(p => (controller.activePlayer = p));
    console.log('current player: ' + controller.getActivePlayer());
    toast({
      title: 'Switching turns',
      status: 'info',
    });
  }

  function handleFirstButtonClick(square: CheckerSquare) {
    setFirstButtonClicked(1);
    source = square;
    console.log('Source square clicked: ' + source.id);
  }

  function handleSecondButtonClick(square: CheckerSquare) {
    if (firstButtonClicked == 1) {
      //dest = square;
      //call movePiece method that changes the models checker squares
      //movePiece(source, square);
      setSecondButtonClicked(2);
      console.log('Dest square clicked: ' + square.id);
      setFirstButtonClicked(0);
      changeTurn();
    }
  }

  function handleButtonAction(square: CheckerSquare, color: string) {
    console.log('In handleButtonAction');
    if (square.checker.type == color) {
      return handleFirstButtonClick(square);
    } else if (square.checker.type == 'empty') {
      return handleSecondButtonClick(square);
    } else {
      return () => undefined;
    }
  }

  const color = controller.getActivePlayerColor();
  let row: JSX.Element[] = [];
  const board: JSX.Element[] = [];

  squares.forEach(square => {
    // add squares to row
    row.push(
      <Box
        as='button'
        w={squareSize}
        h={squareSize}
        bg={getSquareColor(square.x, square.y)}
        display='flex'
        onClick={
          controller.isActivePlayer(currPlayer)
            ? () => handleButtonAction(square, color)
            : () => {
                console.log('Not active player');
              }
        }
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
  const activePlayer = useActivePlayer(controller);
  const playerList = usePlayers(controller);
  const squares = useSquares(controller);
  const [title, setTitle] = useState('Waiting for other players ...');

  console.log('Player list: ' + controller.players);

  useEffect(() => {
    townController.getCheckerPlayers(controller).then(players => (controller.players = players));
    townController
      .getActiveCheckerPlayer(controller)
      .then(player => (controller.activePlayer = player));
  }, [townController, controller, playerList, activePlayer]);

  useEffect(() => {
    function getPlayerColor(): string {
      return playerList.indexOf(townController.ourPlayer.id) == 0 ? 'red' : 'black';
    }

    async function initBoard() {
      await townController
        .initializeCheckerSessionAreaBoard(controller)
        .then(newBoard => (controller.squares = newBoard));
      if (controller.squares == undefined || controller.squares.length < 1) {
        console.log('Cant initialize Board');
      }
    }

    if (playerList.length == MAX_PLAYERS && (squares == undefined || squares.length < 1)) {
      initBoard();
    }

    if (controller.players.length >= MAX_PLAYERS) {
      setTitle('You are player ' + getPlayerColor());
    }
  }, [townController, controller, playerList, squares]);

  async function changeTurn() {
    await townController
      .changeActivePlayer(controller)
      .then(player => (controller.activePlayer = player));
    //console.log('new current Player: ' + p);
    console.log('current player: ' + controller.getActivePlayer());
    toast({
      title: 'Switching turns',
      status: 'info',
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      size={'4xl'}
      onClose={() => {
        close();
        townController.unPause();
        townController.resetCheckerArea(controller).then(model => controller.updateFrom(model));
      }}>
      <ModalOverlay />
      <ModalContent>
        {<ModalHeader>{title} </ModalHeader>}
        <ModalCloseButton />
        <ModalBody pb={6}></ModalBody>
        <Grid templateColumns='repeat(5, 1fr)' templateRows='repeat(2, 1fr)'>
          <GridItem colSpan={4} rowSpan={2}>
            <Flex justify={'center'} padding={'5'}>
              <Board squares={squares} controller={controller} />
            </Flex>
          </GridItem>
          <GridItem colSpan={1}>
            <Button onClick={() => changeTurn()}>{'Active Player: ' + activePlayer}</Button>
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
  changeGameState,
  openLeaderboard,
}: {
  checkerArea: CheckerAreaInteractable;
  changeGameState: (val: boolean) => void;
  openLeaderboard: () => void;
}): JSX.Element {
  const townController = useTownController();
  const checkerAreaController = useCheckerAreaController(checkerArea.name);
  // selectIsOpen is true if the squares have not been initialized
  const [selectIsOpen, setSelectIsOpen] = useState(checkerAreaController.squares.length < 1);

  console.log('checker players: ' + checkerAreaController.players);

  function start(): JSX.Element {
    return (
      <CheckerOptionModal
        checkerArea={checkerArea}
        changeGameState={changeGameState}
        openLeaderboard={() => openLeaderboard}
      />
    );
  }

  // If a checkers game has started
  if (!selectIsOpen) {
    return (
      <Modal
        isOpen={!selectIsOpen}
        onClose={() => {
          changeGameState(false);
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
      <CheckerBoard
        controller={checkerAreaController}
        isOpen={selectIsOpen}
        close={() => {
          changeGameState(false);
          setSelectIsOpen(false);
          start();
        }}
      />
    </>
  );
}

// export function JoinMenu({
//   controller,
//   close,
// }: {
//   controller: CheckerAreaController;
//   close: () => void;
// }): JSX.Element {
//   const townController = useTownController();
//   const title = 'Checkers';
//   const currPlayerId = townController.ourPlayer.id;
//   const { isOpen, onOpen } = useDisclosure();
//   return (
//     <Modal
//       isOpen={true}
//       size={'4xl'}
//       onClose={() => {
//         close();
//         townController.unPause();
//       }}>
//       <ModalOverlay />
//       <ModalContent>
//         {<ModalHeader>{title} </ModalHeader>}
//         <ModalCloseButton />
//         <ModalBody pb={6}></ModalBody>
//         <Button
//           onClick={() => {
//             if (
//               controller.players.length < MAX_PLAYERS &&
//               !controller.players.includes(currPlayerId)
//             ) {
//               townController
//                 .addCheckerPlayer(controller)
//                 .then(players => (controller.players = players));
//               onOpen();
//             }
//           }}>
//           Join Game
//         </Button>
//         <CheckerBoard controller={controller} isOpen={isOpen} close={close} />
//         <ModalFooter />
//         {/* </form> */}
//       </ModalContent>
//     </Modal>
//   );
// }

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

  // useEffect(() => {
  // }, [beginGame]);

  if (checkerArea && beginGame) {
    return (
      <CheckerGame
        changeGameState={changeGameState}
        openLeaderboard={() => setLeaderboardOpen(false)}
        checkerArea={checkerArea}
      />
    );
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
        checkerArea={checkerArea}
        changeGameState={changeGameState}
        openLeaderboard={() => setLeaderboardOpen(true)}
      />
    );
  }
  return <></>;
}
