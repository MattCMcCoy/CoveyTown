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
import { CheckerLeaderboardItem, CheckerSquare } from '../../../generated/client';
import CheckerOptionModal from './CheckerModals/CheckerOptionModal';
import CheckerLeaderboardModal from './CheckerModals/CheckerLeaderboardModal';

const CHECKER_INNER_RED = '#C53030';
const CHECKER_INNER_BLACK = '#1A202C';
const CHECKER_OUTER_RED = '#9B2C2C';
const CHECKER_OUTER_BLACK = 'black';
const CHECKER_HIGHLIGHT_SIZE = '70';
const CHECKER_OUTER_SIZE = '65';
const CHECKER_INNER_SIZE = '50';
const MAX_PLAYERS = 2;

function Score({
  controller,
  activePlayer,
}: {
  controller: CheckerAreaController;
  activePlayer: number;
}): JSX.Element {
  return (
    <Square display={'grid'}>
      <Circle
        size='20'
        margin='auto'
        bg={activePlayer === 0 ? 'yellow' : 'transparent'}
        marginBottom='5'>
        <Circle size={CHECKER_OUTER_SIZE} bg={CHECKER_OUTER_RED}>
          <Circle
            size={CHECKER_INNER_SIZE}
            bg={CHECKER_INNER_RED}
            shadow='inner'
            textColor={'white'}>
            {12 - controller.squares.filter(square => square.checker.color === 'black').length}
          </Circle>
        </Circle>
      </Circle>
      <Circle
        size='20'
        margin='auto'
        bg={activePlayer === 1 ? 'yellow' : 'transparent'}
        marginBottom='5'>
        <Circle size={CHECKER_OUTER_SIZE} margin='auto' bg={CHECKER_OUTER_BLACK}>
          <Circle
            size={CHECKER_INNER_SIZE}
            bg={CHECKER_INNER_BLACK}
            shadow='inner'
            textColor={'white'}>
            {12 - controller.squares.filter(square => square.checker.color === 'red').length}
          </Circle>
        </Circle>
      </Circle>
    </Square>
  );
}
function Board({
  squares,
  controller,
  close,
}: {
  squares: CheckerSquare[] | undefined;
  controller: CheckerAreaController;
  close: () => void;
}): JSX.Element {
  const [moveFrom, setMoveFrom] = useState<string>('');
  const [moveTo, setMoveTo] = useState<string>('');
  const townController = useTownController();
  const toast = useToast();
  const currPlayer = townController.ourPlayer.id;
  const squareSize = '20';

  const changingTurn = useCallback(() => {
    townController.changeActivePlayer(controller).then(p => (controller.activePlayer = p));
    toast({
      title: 'Switching turns',
      status: 'info',
    });
  }, [controller, toast, townController]);

  const checkGameOver = useCallback(() => {
    if (
      controller.squares &&
      controller.squares.filter(
        square =>
          square.checker.color.toString() === (controller.activePlayer == 0 ? 'red' : 'black') &&
          square.moves.length > 0,
      ).length == 0 &&
      controller.players.length > 1
    ) {
      townController
        .updateLeaderboard(
          controller,
          currPlayer,
          townController.ourPlayer.userName,
          controller.isActivePlayer(currPlayer),
        )
        .then(
          (newLeaderboard: CheckerLeaderboardItem[]) => (controller.leaderboard = newLeaderboard),
        );
      const otherPlayer = controller.players.find(player => player !== currPlayer) ?? '';
      townController
        .updateLeaderboard(
          controller,
          otherPlayer,
          townController.players.find(player => player.id === otherPlayer)?.userName ?? '',
          controller.isActivePlayer(otherPlayer),
        )
        .then(
          (newLeaderboard: CheckerLeaderboardItem[]) => (controller.leaderboard = newLeaderboard),
        );
      townController.unPause();
      townController.resetCheckerArea(controller).then(model => controller.updateFrom(model));
      close();
    }
  }, [close, controller, currPlayer, townController]);

  useEffect(() => {
    checkGameOver();
    const timer = setInterval(checkGameOver, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [checkGameOver]);

  useEffect(() => {
    if (moveFrom && moveTo) {
      townController.makeCheckerMove(controller, moveFrom, moveTo).then(value => {
        if (value.isValid) {
          changingTurn();
        }
        controller.squares = value.board;
      });
      setMoveFrom('');
      setMoveTo('');
    }
  }, [changingTurn, close, controller, moveFrom, moveTo, squares, toast, townController]);

  // gets the color of a given square
  const getSquareColor = (x: number, y: number) => {
    const lightBrown = '#e6b273';
    const brown = '#a5681e';
    return (x % 2 === 0 && y % 2 !== 0) || (x % 2 !== 0 && y % 2 === 0) ? brown : lightBrown;
  };

  function handleButtonAction(square: CheckerSquare, color: string) {
    if (square.checker.color == color) {
      setMoveFrom(square.id);
    } else if (square.checker.color == 'empty') {
      setMoveTo(square.id);
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
        as='button'
        w={squareSize}
        h={squareSize}
        bg={getSquareColor(square.x, square.y)}
        display='flex'
        onClick={
          controller.isActivePlayer(currPlayer) ? () => handleButtonAction(square, color) : () => {}
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
        {controller._isValid(moveFrom, square.id) ? (
          <Circle
            size={CHECKER_HIGHLIGHT_SIZE}
            margin='auto'
            bg='transparent'
            border='4px'
            borderColor='yellow'></Circle>
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
  const activePlayer = useActivePlayer(controller);
  const playerList = usePlayers(controller);
  const squares = useSquares(controller);
  const [title, setTitle] = useState('Waiting for other players ...');
  const [currentPlayerList, setCurrentPlayerList] = useState<string[]>(playerList);
  const [currentSquares, setCurrentSquares] = useState<CheckerSquare[] | undefined>(squares);
  const [startGame, setStartGame] = useState(true);

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
  }

  if (currentPlayerList.length == MAX_PLAYERS && (squares == undefined || squares.length < 1)) {
    initBoard();
  }

  if (controller.players.length == 0 && startGame == false) {
    setStartGame(true);
    townController.resetCheckerArea(controller).then(model => controller.updateFrom(model));
    townController.unPause();
    close();
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
        <Grid templateColumns='repeat(5, 1fr)'>
          <GridItem colSpan={4} rowSpan={1}>
            <Flex justify={'center'} padding={'5'}>
              <Board squares={currentSquares} controller={controller} close={close} />
            </Flex>
          </GridItem>
          <GridItem colSpan={1} margin='auto'>
            {title === 'Waiting for other players ...' ? null : (
              <Score controller={controller} activePlayer={activePlayer} />
            )}
          </GridItem>
        </Grid>
        <ModalFooter />
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
}: {
  checkerArea: CheckerAreaInteractable;
  changeGameState: (val: boolean) => void;
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
          changeGameState(false);
          townController.unPause();
          townController.interactEnd(checkerArea);
        }}>
        <ModalOverlay />
        <ModalContent>
          {<ModalHeader>Game in Progress</ModalHeader>}
          <ModalCloseButton />
          <ModalFooter />
        </ModalContent>
      </Modal>
    );
  }
  return (
    <>
      <CheckerBoard
        //start={start}
        controller={checkerAreaController}
        isOpen={selectIsOpen}
        close={() => {
          setSelectIsOpen(false);
          changeGameState(false);
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
    return <CheckerGame changeGameState={changeGameState} checkerArea={checkerArea} />;
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
