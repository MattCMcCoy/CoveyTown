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
} from '@chakra-ui/react';
import { Crown } from '@styled-icons/fa-solid/Crown';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useCheckerAreaController } from '../../../classes/TownController';
import CheckerAreaController, {
  useSquares,
  useActivePlayer,
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
const CHECKER_HIGHLIGHT_SIZE = '70';
const CHECKER_OUTER_SIZE = '65';
const CHECKER_INNER_SIZE = '50';
const MAX_PLAYERS = 2;

function Score({ controller }: { controller: CheckerAreaController }): JSX.Element {
  return (
    <Square display={'grid'}>
      <Circle size={CHECKER_OUTER_SIZE} margin='auto' bg={CHECKER_OUTER_RED} marginBottom={5}>
        <Circle
          size={CHECKER_INNER_SIZE}
          margin='auto'
          bg={CHECKER_INNER_RED}
          shadow='inner'
          textColor={'white'}>
          {12 - controller.squares.filter(square => square.checker.color === 'black').length}
        </Circle>
      </Circle>
      <Circle size={CHECKER_OUTER_SIZE} margin='auto' bg={CHECKER_OUTER_BLACK}>
        <Circle
          size={CHECKER_INNER_SIZE}
          margin='auto'
          bg={CHECKER_INNER_BLACK}
          shadow='inner'
          textColor={'white'}>
          {12 - controller.squares.filter(square => square.checker.color === 'red').length}
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
  const [firstButtonClicked, setFirstButtonClicked] = useState(0);
  const [, setSecondButtonClicked] = useState(0);
  const townController = useTownController();
  const toast = useToast();
  const currPlayer = townController.ourPlayer.id;
  let source: CheckerSquare;
  const squareSize = '20';

  const changingTurn = useCallback(() => {
    townController.changeActivePlayer(controller).then(p => (controller.activePlayer = p));
    console.log('current player: ' + controller.getActivePlayer());
    toast({
      title: 'Switching turns',
      status: 'info',
    });
  }, [controller, toast, townController]);

  useEffect(() => {
    if (moveFrom && moveTo) {
      townController.makeCheckerMove(controller, moveFrom, moveTo).then(value => {
        console.log('In makeMove: ' + value.isValid);
        if (value.isValid) {
          console.log('Switching  Turns');
          changingTurn();
        }
        controller.squares = value.board;
      });
      setMoveFrom('');
      setMoveTo('');
    }
  }, [changingTurn, controller, moveFrom, moveTo, townController]);

  // gets the color of a given square
  const getSquareColor = (x: number, y: number) => {
    const lightBrown = '#e6b273';
    const brown = '#a5681e';
    return (x % 2 === 0 && y % 2 !== 0) || (x % 2 !== 0 && y % 2 === 0) ? brown : lightBrown;
  };

  function handleFirstButtonClick(square: CheckerSquare) {
    setFirstButtonClicked(1);
    source = square;
    setMoveFrom(square.id);
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
      setMoveTo(square.id);
    }
  }

  function handleButtonAction(square: CheckerSquare, color: string) {
    console.log('In handleButtonAction');
    if (square.checker.color == color) {
      return handleFirstButtonClick(square);
    } else if (square.checker.color == 'empty') {
      return handleSecondButtonClick(square);
    } else {
      return () => undefined;
    }
  }

  const color = controller.getActivePlayerColor();
  let row: JSX.Element[] = [];
  const board: JSX.Element[] = [];

  if (squares == undefined || squares.length == 0) {
    return <></>;
  }
  squares.forEach(square => {
    // add squares to row
    row.push(
      <Box
        //onKeyDown={}
        as='button'
        w={squareSize}
        h={squareSize}
        bg={getSquareColor(square.x, square.y)}
        display='flex'
        onClick={
          controller.isActivePlayer(currPlayer)
            ? () => handleButtonAction(square, color)
            : () => {
                console.log('Active player' + controller.getActivePlayer());
                console.log('Not active player');
              }
        }
        key={square.id}>
        {square.checker.type !== 'empty' ? (
          <Circle
            size={CHECKER_HIGHLIGHT_SIZE}
            margin='auto'
            bg={moveFrom == `${square.x}${square.y}` ? 'yellow' : 'transparent'}>
            <Circle
              size={CHECKER_OUTER_SIZE}
              margin='auto'
              bg={square.checker.color == 'red' ? CHECKER_OUTER_RED : CHECKER_OUTER_BLACK}>
              <Circle
                size={CHECKER_INNER_SIZE}
                margin='auto'
                bg={square.checker.color == 'red' ? CHECKER_INNER_RED : CHECKER_INNER_BLACK}
                shadow='inner'>
                {square.checker.type == 'king' ? <Crown size={30} color='white' /> : null}
              </Circle>
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
  start,
}: {
  controller: CheckerAreaController;
  isOpen: boolean;
  close: () => void;
  start: () => JSX.Element;
}): JSX.Element {
  const townController = useTownController();
  const toast = useToast();
  //const title = 'Checkers';c
  const activePlayer = useActivePlayer(controller);
  const playerList = usePlayers(controller);
  const squares = useSquares(controller);
  const [title, setTitle] = useState('Waiting for other players ...');
  const [currentPlayerList, setCurrentPlayerList] = useState<string[]>(playerList);
  const [currentActivePlayer, setActivePlayer] = useState<number>(activePlayer);
  const [currentSquares, setCurrentSquares] = useState<CheckerSquare[] | undefined>(squares);
  const [startGame, setStartGame] = useState(true);

  console.log('Player list: ' + controller.players);

  const updateGame = useCallback(() => {
    function getPlayerColor(): string {
      return controller.players.indexOf(townController.ourPlayer.id) == 0 ? 'red' : 'black';
    }
    if (controller.players.length == MAX_PLAYERS && startGame) {
      setStartGame(false);
      setTitle('You are player ' + getPlayerColor());
    }
    townController.getCheckerAreaBoard(controller).then(board => setCurrentSquares(board));
    townController.getCheckerPlayers(controller).then(players => {
      controller.players = players;
      setCurrentPlayerList(players);
    });
    townController.getActiveCheckerPlayer(controller).then(player => {
      controller.activePlayer = player;
      setActivePlayer(player);
    });
  }, [controller, startGame, townController]);

  useEffect(() => {
    updateGame();
    const timer = setInterval(updateGame, 2000);
    return () => {
      clearInterval(timer);
    };
  }, [updateGame]);

  async function initBoard() {
    await townController
      .initializeCheckerSessionAreaBoard(controller)
      .then(newBoard => (controller.squares = newBoard));
    if (controller.squares == undefined || controller.squares.length < 1) {
      console.log('Cant initialize Board');
    }
  }

  if (currentPlayerList.length == MAX_PLAYERS && (squares == undefined || squares.length < 1)) {
    initBoard();
  }

  async function changeTurn() {
    await townController
      .changeActivePlayer(controller)
      .then(player => (controller.activePlayer = player));
    console.log('current player: ' + controller.getActivePlayer());
    toast({
      title: 'Switching turns',
      status: 'info',
    });
  }

  if (controller.players.length == 0 && startGame == false) {
    setStartGame(true);
    townController.resetCheckerArea(controller).then(model => controller.updateFrom(model));
    townController.unPause();
    close();
    return start();
  }

  // useEffect(() => {
  //   townController.getCheckerAreaBoard(controller);
  // }, [townController, controller]);

  // useEffect(() => {
  //   if (squares == undefined || squares.length < 1) {
  //     if (controller.squares.length < 1) {
  //       townController
  //         .initializeCheckerSessionAreaBoard(controller)
  //         .then(newBoard => (controller.squares = newBoard));
  //     } else {
  //       toast({
  //         title: `Cant initialize Board`,
  //         status: 'error',
  //       });
  //     }
  //   }
  // }, [controller, squares, toast, townController]);

  // useEffect(() => {
  //   townController
  //     .getCheckerAreaBoard(controller)
  //     .then(newBoard => (controller.squares = newBoard));
  // }, [controller, squares, townController]);

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
        <Grid templateColumns='repeat(5, 1fr)'>
          <GridItem colSpan={4} rowSpan={2}>
            <Flex justify={'center'} padding={'5'}>
              <Board squares={currentSquares} controller={controller} />
            </Flex>
          </GridItem>
          <GridItem colSpan={1}>
            <Button onClick={() => changeTurn()}>{'Active Player: ' + currentActivePlayer}</Button>
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

  const start = () => {
    return (
      <CheckerOptionModal
        checkerArea={checkerArea}
        changeGameState={changeGameState}
        openLeaderboard={() => openLeaderboard}
      />
    );
  };

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
        start={start}
        controller={checkerAreaController}
        isOpen={selectIsOpen}
        close={() => {
          changeGameState(false);
          setSelectIsOpen(false);
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
