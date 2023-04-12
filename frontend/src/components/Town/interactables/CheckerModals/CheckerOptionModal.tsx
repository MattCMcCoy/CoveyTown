import {
  Button,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import CheckerAreaInteractable from '../CheckerArea';
import React, { useState } from 'react';
import { HowToPlayModal } from './CheckerHowToPlayModal';
import useTownController from '../../../../hooks/useTownController';
import { useCheckerAreaController } from '../../../../classes/TownController';
const MAX_PLAYERS = 2;

export default function CheckerOptionModal({
  checkerArea,
  changeGameState,
  openLeaderboard,
}: {
  checkerArea: CheckerAreaInteractable;
  changeGameState: (val: boolean) => void;
  openLeaderboard: () => void;
}): JSX.Element {
  const [visibleState, setVisibleState] = useState(true);
  const [isHowToPlayOpen, setHowToPlayOpen] = useState(false);
  const townController = useTownController();
  const currPlayerId = townController.ourPlayer.id;
  const controller = useCheckerAreaController(checkerArea.name);

  const onClose = () => {
    setVisibleState(false);
    changeGameState(true);
  };

  return (
    <>
      <HowToPlayModal closeHowToPlay={() => setHowToPlayOpen(false)} isOpen={isHowToPlayOpen} />
      <Modal isOpen={visibleState} onClose={() => setVisibleState(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Checkers</ModalHeader>
          <ModalCloseButton />
          <ModalFooter mx='auto'>
            <Button
              colorScheme='blue'
              width='36'
              marginRight='1'
              onClick={() => {
                onClose();
              }}>
              Play With AI
            </Button>
            <Button
              colorScheme='blue'
              marginLeft='1'
              onClick={() => {
                if (
                  controller.players.length < MAX_PLAYERS &&
                  !controller.players.includes(currPlayerId)
                ) {
                  townController
                    .addCheckerPlayer(controller)
                    .then(players => (controller.players = players));
                  onClose();
                } else {
                  console.log('too many players');
                }
              }}>
              Wait For Player
            </Button>
          </ModalFooter>
          <ModalFooter mx='auto'>
            <Button colorScheme='gray' width='36' marginRight='1' onClick={openLeaderboard}>
              Leaderboard
            </Button>
            <Button
              colorScheme='gray'
              width='36'
              marginLeft='1'
              onClick={() => setHowToPlayOpen(true)}>
              How To Play
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
