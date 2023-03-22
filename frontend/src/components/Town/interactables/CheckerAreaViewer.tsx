import {
  Button,
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
  Spacer,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import TownController, {
  useInteractable,
  useCheckerAreaController,
} from '../../../classes/TownController';
import CheckerAreaController, { useSquares } from '../../../classes/CheckerAreaController';
import useTownController from '../../../hooks/useTownController';
import CheckerAreaInteractable from './CheckerArea';
import { CheckerSquare } from '../../../generated/client';
// import { TownsController } from '../../../../../TownService/src/Town/TownsController';
// import { isCheckerArea } from '../../../../../TownService/src/TestUtils';
// import CheckerAreaReal from '../../../../../TownService/src/Town/CheckerArea';
// import InvalidParametersError from '../../../../../TownService/src/lib/InvalidParametersError';
// import CoveyTownsStore from '../../../../../TownService/src/lib/TownsStore';

export function makeBoard(squares: CheckerSquare[] | undefined): JSX.Element {
  if (squares == undefined) {
    return <></>;
  }
  let i = 1;
  const size = '20';
  // light brown
  const color1 = '#e6b273';
  // brown
  const color2 = '#a5681e';
  let color = color1;
  let row: JSX.Element[] = [];
  const board: JSX.Element[] = [];
  console.log('Number of squares:' + squares.length);

  for (let square in squares) {
    // add squares to row
    // eslint-disable-next-line no-self-assign
    square = square;
    row.push(<Box w={size} h={size} bg={color}></Box>);
    // add row to checker board
    if (i % 8 == 0) {
      board.push(<HStack spacing='0px'>{row}</HStack>);
      // Switch the color
      color = color == color1 ? color2 : color1;
      row = [];
    }
    color = color == color1 ? color2 : color1;

    i++;
  }

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
  const curPlayerId = townController.ourPlayer.id;
  const toast = useToast();
  const title = 'Checkers';

  useEffect(() => {
    townController.getCheckerAreaBoard(controller);
  }, [townController, controller]);

  function initBoard() {
    console.log('In initBoard');
    if (controller.squares.length < 1) {
      console.log('passed if statement');
      townController
        .initializeCheckerSessionAreaBoard(controller)
        .then(newBoard => (controller.squares = newBoard));
      console.log('newboard length: ' + controller.squares.length);
    } else {
      toast({
        title: `Cant initialize Board`,
        status: 'error',
      });
    }
    console.log('end of initBoard');
  }
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
        <Flex justify={'center'} padding={'5'}>
          {makeBoard(squares)}
        </Flex>
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
          townController.interactEnd(checkerArea);
        }}>
        <ModalOverlay />
        <ModalContent>
          {<ModalHeader>Game in Progress</ModalHeader>}
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
  const checkerArea = useInteractable<CheckerAreaInteractable>('checkerArea');
  if (checkerArea) {
    return <CheckerGame checkerArea={checkerArea} />;
  }
  return <></>;
}
