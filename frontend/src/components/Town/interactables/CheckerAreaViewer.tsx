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
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useInteractable, useCheckerAreaController } from '../../../classes/TownController';
import CheckerAreaController, { useSquares } from '../../../classes/CheckerAreaController';
import useTownController from '../../../hooks/useTownController';
import CheckerAreaInteractable from './CheckerArea';
import { CheckerSquare } from '../../../generated/client';

export function makeBoard(squares: CheckerSquare[] | undefined): JSX.Element {
  if (squares == undefined) {
    return <></>;
  }
  let i = 1;
  let color = 'red';
  let row: JSX.Element[] = [];
  const board: JSX.Element[] = [];
  for (const square in squares) {
    row.push(<Box w='40' h='40' bg={color}></Box>);
    if (i % 8 == 0) {
      board.push(<HStack spacing='0px'>{row}</HStack>);
      row = [];
    }
    color = color == 'red' ? 'black' : 'red';
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
  const squares = useSquares(controller);
  const townController = useTownController();
  const curPlayerId = townController.ourPlayer.id;
  const toast = useToast();
  const title = 'Checkers';
  useEffect(() => {
    townController.getCheckerAreaBoard(controller);
  }, [townController, controller]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        close();
        townController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        {<ModalHeader>{title} </ModalHeader>}
        <ModalCloseButton />
        <ModalBody pb={6}></ModalBody>
        {makeBoard(squares)}
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
  const [selectIsOpen, setSelectIsOpen] = useState(checkerAreaController.squares.length < 1);

  if (!selectIsOpen) {
    return (
      <Modal
        isOpen={!selectIsOpen}
        onClose={() => {
          close();
          townController.unPause();
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
