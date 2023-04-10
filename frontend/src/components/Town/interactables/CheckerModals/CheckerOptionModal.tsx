import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { HowToPlayModal } from './CheckerHowToPlayModal';

export default function CheckerOptionModal({
  changeGameState,
  openLeaderboard,
}: {
  changeGameState: (val: boolean) => void;
  openLeaderboard: () => void;
}): JSX.Element {
  const [visibleState, setVisibleState] = useState(true);
  const [isHowToPlayOpen, setHowToPlayOpen] = useState(false);

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
          <ModalBody> </ModalBody>
          <ModalFooter mx='auto'>
            <Button colorScheme='blue' width='36' marginRight='1' onClick={onClose}>
              Play With AI
            </Button>
            <Button colorScheme='blue' width='36' marginLeft='1' onClick={onClose}>
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
