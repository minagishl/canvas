import { render, fireEvent, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import App from '~/App';

describe('Canvas', () => {
  it('handles drag and drop correctly', async () => {
    render(<App />);

    const canvas = screen.getByRole('main');

    // Drag over test
    fireEvent.dragOver(canvas);
    expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();

    fireEvent.dragLeave(canvas);
    expect(screen.queryByTestId('drag-overlay')).not.toBeInTheDocument();
  });

  it('handles file drop correctly', async () => {
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    render(<App />);

    const canvas = screen.getByRole('main');

    fireEvent.drop(canvas, {
      dataTransfer: {
        files: [file],
      },
    });
  });
});
