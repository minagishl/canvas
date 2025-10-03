import {
  render,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import App from '../src/App';

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

  it('creates a sticky note when the sticky tool is used', async () => {
    render(<App />);

    const moreButton = screen.getByTestId('more');
    fireEvent.mouseEnter(moreButton);

    const menu = screen.getByRole('menu');
    const stickyButton = within(menu).getByLabelText(/Sticky note/i);
    fireEvent.click(stickyButton);

    const canvasElement = screen
      .getByRole('main')
      .querySelector('canvas') as HTMLCanvasElement;

    fireEvent.mouseDown(canvasElement, {
      clientX: 200,
      clientY: 200,
      buttons: 1,
    });
    fireEvent.mouseUp(canvasElement, {
      clientX: 200,
      clientY: 200,
      buttons: 1,
    });

    await waitFor(() => {
      expect(screen.getByText('Write a note')).toBeInTheDocument();
    });
  });
});

describe('Toolbar', () => {
  it('Menu display test on more button hover', async () => {
    render(<App />);

    const moreButton = screen.getByTestId('more');

    fireEvent.mouseEnter(moreButton);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
});
