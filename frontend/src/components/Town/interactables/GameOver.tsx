import { Button } from '@chakra-ui/react';
import React from 'react';

interface GameOverProps {
  winner: string | null;
  onPlayAgain: () => void;
  isDeadlock: boolean;
}

export function GameOver(props: GameOverProps): JSX.Element {
  const { winner, onPlayAgain, isDeadlock } = props;

  return (
    <div className='game-over'>
      {winner ? <p>{winner} wins!</p> : isDeadlock ? <p>It is a deadlock!</p> : <p>It is a tie!</p>}
      <Button colorScheme='blue' size='md' onClick={onPlayAgain}>
        Play Again
      </Button>
    </div>
  );
}

export default GameOver;
