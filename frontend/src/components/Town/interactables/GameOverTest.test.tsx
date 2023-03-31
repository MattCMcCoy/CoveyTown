import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });
import GameOver from './GameOver';

describe('GameOver component', () => {
  it('should render without errors', () => {
    const wrapper = mount(<GameOver winner='Player 1' onPlayAgain={() => {}} isDeadlock={false} />);
    expect(wrapper.find('.game-over')).toHaveLength(1);
  });

  it('should display a tie message when there is no winner and not a deadlock', () => {
    const wrapper = mount(<GameOver winner='' onPlayAgain={() => {}} isDeadlock={false} />);
    expect(wrapper.text()).toContain('It is a tie!');
  });

  it('should display the winner message', () => {
    const winner = 'Player 2';
    const wrapper = mount(<GameOver winner={winner} onPlayAgain={() => {}} isDeadlock={false} />);
    expect(wrapper.text()).toContain(`${winner} wins!`);
  });

  it('should display a deadlock message when there is no winner and is a deadlock', () => {
    const wrapper = mount(<GameOver winner='' onPlayAgain={() => {}} isDeadlock={true} />);
    expect(wrapper.text()).toContain('It is a deadlock!');
  });

  it('should call the onPlayAgain function when the button is clicked', () => {
    const onPlayAgain = jest.fn();
    const wrapper = mount(
      <GameOver winner='Player 1' onPlayAgain={onPlayAgain} isDeadlock={false} />,
    );
    const button = wrapper.find('button');
    button.simulate('click');
    expect(onPlayAgain).toHaveBeenCalled();
  });
});
