import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatWidget } from './index';

describe('ChatWidget', () => {
  it('renderiza el chat y permite minimizar', () => {
    const handleToggle = jest.fn();
    render(<ChatWidget minimized={false} onToggle={handleToggle} />);
    expect(screen.getByText('Chat Metaverso')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(handleToggle).toHaveBeenCalled();
  });
}); 