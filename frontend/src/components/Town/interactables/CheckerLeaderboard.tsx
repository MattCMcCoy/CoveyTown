import {
  Box,
  Button,
  Grid,
  GridItem,
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

export default function CheckerLeaderBoard({
  isLeaderBoardOpen,
  checkerArea,
  closeLeaderBoard,
}: {
  isLeaderBoardOpen: boolean;
  checkerArea: CheckerAreaInteractable;
  closeLeaderBoard: () => void;
}) {
  const townController = useTownController();
  const checkerAreaController = useCheckerAreaController(checkerArea.name);
  const leaderboard = useLeaderboard(checkerAreaController);

  useEffect(() => {
    if (isLeaderBoardOpen) {
      townController
        .getCheckerLeaderboard(checkerAreaController)
        .then(newLeaderboard => (checkerAreaController.leaderboard = newLeaderboard));
    }
  }, [checkerAreaController, isLeaderBoardOpen, townController]);

  return (
    <Modal isOpen={isLeaderBoardOpen} onClose={closeLeaderBoard}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Leaderboard</ModalHeader>
        <ModalCloseButton onClick={closeLeaderBoard} />
        <ModalBody>
          <Grid templateColumns='repeat(4, 1fr)' boxShadow='dark-lg'>
            <GridItem pl='1'>Position</GridItem>
            <GridItem>PlayerId</GridItem>
            <GridItem>Wins</GridItem>
            <GridItem>Losses</GridItem>
          </Grid>
          {leaderboard.length > 0 ? (
            <Grid templateColumns='repeat(4, 1fr)' boxShadow='dark-lg'>
              <GridItem>
                {leaderboard.map(player => (
                  <Box
                    pl='1'
                    key={player.playerId}
                    bgColor={player.position % 2 != 0 ? 'gray.100' : 'white'}>
                    {player.position}
                  </Box>
                ))}
              </GridItem>
              <GridItem>
                {leaderboard.map(player => (
                  <Box
                    pl='1'
                    key={player.playerId}
                    bgColor={player.position % 2 != 0 ? 'gray.100' : 'white'}>
                    {player.playerId}
                  </Box>
                ))}
              </GridItem>
              <GridItem>
                {leaderboard.map(player => (
                  <Box
                    key={player.playerId}
                    bgColor={player.position % 2 != 0 ? 'gray.100' : 'white'}>
                    {player.wins}
                  </Box>
                ))}
              </GridItem>
              <GridItem>
                {leaderboard.map(player => (
                  <Box
                    key={player.losses}
                    bgColor={player.position % 2 != 0 ? 'gray.100' : 'white'}>
                    {player.playerId}
                  </Box>
                ))}
              </GridItem>
            </Grid>
          ) : (
            <Grid>
              <GridItem pl='1'>No one has played checkers in this area yet.</GridItem>
            </Grid>
          )}
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
