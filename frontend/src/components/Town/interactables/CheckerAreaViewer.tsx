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

/**
 * The PosterImage component does the following:
 * -- renders the image of a PosterSessionArea (in a modal)
 * -- displays the title of the PosterSessionArea as the header of the modal
 * -- displays the number of stars on the poster
 * Along with the number of stars, there is also a button to increment the number of stars on a poster (i.e.
 * where a player can star a poster). Note that a player cannot star a poster more than once (this is tied to
 * the poster itself, not the PosterSessionArea).
 *
 * @param props: A 'controller', which is the PosterSessionArea corresponding to the
 *               current poster session area.
 *             : A 'isOpen' flag, denoting whether or not the modal should open (it should open if the poster exists)
 *             : A 'close' function, to be called when the modal is closed
 */

/**
 * The PosterViewerWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a poster session area.
 */
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
  // Need to add this method in town controller
  // useEffect(() => {
  //   townController.getCheckerAreaSquares(controller);
  // }, [townController, controller]);

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
 * The PosterViewer monitors the player's interaction with a PosterSessionArea on the map: displaying either
 * a popup to set the poster image and title for a poster session area, or if the image/title is set,
 * a PosterImage modal to display the poster itself.
 *
 * @param props: the viewing area interactable that is being interacted with
 */
export function CheckerGame({
  checkerArea,
}: {
  checkerArea: CheckerAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const checkerAreaController = useCheckerAreaController(checkerArea.name);
  const [selectIsOpen, setSelectIsOpen] = useState(checkerAreaController.squares.length < 1);

  if (selectIsOpen) {
    return (
      <Modal
        isOpen={selectIsOpen}
        onClose={() => {
          close();
          townController.unPause();
        }}>
        <ModalOverlay />
        <ModalContent>
          {<ModalHeader>NoSquares</ModalHeader>}
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
        isOpen={!selectIsOpen}
        close={() => {
          setSelectIsOpen(false);
          // forces game to emit "posterSessionArea" event again so that
          // repoening the modal works as expected
          townController.interactEnd(checkerArea);
        }}
      />
    </>
  );
}

/**
 * The PosterViewerWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a poster session area.
 */
export default function CheckerAreaWrapper(): JSX.Element {
  const checkerArea = useInteractable<CheckerAreaInteractable>('checkerArea');
  if (checkerArea) {
    return <CheckerGame checkerArea={checkerArea} />;
  }
  return <></>;
}
