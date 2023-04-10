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

import React from 'react';

interface RuleItem {
  title: string;
  des: string;
}

export function HowToPlayModal({
  isOpen,
  closeHowToPlay,
}: {
  isOpen: boolean;
  closeHowToPlay: () => void;
}) {
  const ruleList: RuleItem[] = [
    {
      title: 'Overview',
      des: `Checkers is a two-player board game played on an 8x8 board with 64 squares of alternating colors. Each player starts with 12 pieces placed on the first three rows of the board. The goal of the game is to capture all of your opponent's pieces or to block them from being able to move.`,
    },
    {
      title: 'Gameplay',
      des: `The game starts with the player with the darker colored pieces moving first. Players take turns moving one piece per turn, diagonally forward on the black squares. A piece can only move forward unless it becomes a "king" (more on that later). Pieces can only move one square at a time unless they are capturing an opponent's piece.`,
    },
    {
      title: 'Capturing',
      des: `If a player's piece is adjacent to an opponent's piece and there is an empty square diagonally beyond the opponent's piece, the player can "capture" the opponent's piece by jumping over it and landing on the empty square. The player removes the captured piece from the board and places it aside. A player can capture multiple pieces in one turn if they are able to make a series of jumps.`,
    },
    {
      title: 'Kings',
      des: `When a player's piece reaches the opposite end of the board, it becomes a "king." Kings can move diagonally forward and backward on the black squares. Kings can also jump over multiple opponent pieces in a single turn, as long as there is an empty square diagonally beyond each piece.`,
    },
    {
      title: 'Winning',
      des: `A player wins the game when they have captured all of their opponent's pieces or have blocked their opponent from being able to make a legal move.`,
    },
    {
      title: 'Rules',
      des: `A player cannot move their pieces to a square occupied by one of their own pieces or the opponents pieces, and must be moved diagonally to an adjacent square.
        And that's how to play checkers! Have fun playing!`,
    },
  ];
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeHowToPlay}
        isCentered
        size='4xl'
        blockScrollOnMount={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>How to Play</ModalHeader>
          <ModalCloseButton />
          <ModalBody width='4xl'>
            <ul>
              {ruleList.map((rule: RuleItem, index) => {
                return (
                  <li key={index}>
                    <p>{rule.title}</p>
                    <p>{rule.des}</p>
                  </li>
                );
              })}
            </ul>
          </ModalBody>
          <ModalFooter mx='auto'>
            <Button colorScheme='gray' width='36' marginRight='1' onClick={closeHowToPlay}>
              Back
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
