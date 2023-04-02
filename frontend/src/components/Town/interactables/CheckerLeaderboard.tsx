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
import React, { useEffect } from 'react';
import { useLeaderboard } from '../../../classes/CheckerAreaController';
import { useCheckerAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import CheckerAreaInteractable from './CheckerArea';
import { useToast } from '@chakra-ui/react';

export default function CheckerLeaderBoard({
  isLeaderBoardOpen,
  checkerArea,
  closeLeaderBoard,
}: {
  isLeaderBoardOpen: boolean;
  checkerArea: CheckerAreaInteractable;
  closeLeaderBoard: () => void;
}) {
  const toast = useToast();
  const townController = useTownController();
  const checkerAreaController = useCheckerAreaController(checkerArea.name);
  const leaderboard = useLeaderboard(checkerAreaController);
  useEffect(() => {
    if (leaderboard == undefined || leaderboard.length < 1) {
      if (checkerAreaController.leaderboard.length < 1) {
        townController
          .getCheckerLeaderboard(checkerAreaController)
          .then(newLeaderboard => (checkerAreaController.leaderboard = newLeaderboard));
      } else {
        toast({
          title: `Cant initialize Scoreboard`,
          status: 'error',
        });
      }
    }
  }, [checkerAreaController, leaderboard, toast, townController]);
  return (
    <Modal isOpen={isLeaderBoardOpen} onClose={closeLeaderBoard}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Leaderboard</ModalHeader>
        <ModalCloseButton onClick={closeLeaderBoard} />
        <ModalBody>
          {leaderboard.map(player => (
            <p
              key={
                player.playerId
              }>{`Player: ${player.playerId}, Wins: ${player.wins}, Losses: ${player.losses}`}</p>
          ))}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='gray' onClick={closeLeaderBoard}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
