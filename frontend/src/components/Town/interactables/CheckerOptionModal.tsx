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

interface RuleItem {
  title: string;
  des: string;
}

export function CheckerViewer({
  changeGameState,
}: {
  changeGameState: (val: boolean) => void;
}): JSX.Element {
  const [visibleState, setVisibleState] = useState(true);
  const ruleList: RuleItem[] = [
    {
      title: 'Overview',
      des: `Checkers is a two-player board game played on an 8x8 board with 64 squares of alternating colors (usually red and black). Each player starts with 12 pieces (usually black and white) placed on the first three rows of the board. The goal of the game is to capture all of your opponent's pieces or to block them from being able to move.`,
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
      des: `A player cannot move their pieces to a square occupied by one of their own pieces.
        If a player has a legal move, they must make that move. If they cannot make a legal move, they forfeit their turn.
        If a player touches one of their own pieces, they must move that piece if it has a legal move. If they touch one of their opponent's pieces, they must capture that piece if it is a legal move.
        If a player makes an illegal move (such as moving a piece in a direction it cannot move), the opponent has the option to either accept the move or have the player undo the move and make a legal move instead.
        If a player moves a piece to the opposite end of the board, they must crown it as a king before making their next move.
        And that's how to play checkers! Have fun playing!`,
    },
  ];
  const onClose = () => {
    setVisibleState(false);
    changeGameState(true);
  };
  const onWait = () => {
    onClose();
  };
  return (
    <>
      <Modal isOpen={visibleState} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Game Rules</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ul className='rule-detail'>
              {ruleList.map((rule: RuleItem, index) => {
                return (
                  <li className='rule-item' key={index}>
                    <p className='rule-title'>{rule.title}</p>
                    <p className='rule-des'>{rule.des}</p>
                  </li>
                );
              })}
            </ul>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Play With AI
            </Button>
            <Button variant='ghost' onClick={onWait}>
              Wait
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CheckerViewer;
