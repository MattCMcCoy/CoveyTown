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

export default function GameOverModal({ gameOverState }: { gameOverState: boolean }): JSX.Element {
  const [visibleState, setVisibleState] = useState(gameOverState);
  const onClose = () => {
    setVisibleState(false);
  };
  return (
    <>
      <Modal isOpen={visibleState} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tips</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Game Over</ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
