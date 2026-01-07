import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TimeInput } from './TimeInput';

afterEach(() => {
  cleanup();
});

describe('TimeInput', () => {
  it('should render with label and placeholder', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="" onChange={onChange} placeholder="08:00" />);

    expect(screen.getByText('Entrada')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('08:00')).toBeInTheDocument();
  });

  it('should display the provided value', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="09:30" onChange={onChange} />);

    expect(screen.getByDisplayValue('09:30')).toBeInTheDocument();
  });

  it('should format input as user types - two digits', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '08' } });
    expect(onChange).toHaveBeenLastCalledWith('08');
  });

  it('should format input as user types - three digits adds colon', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '083' } });
    expect(onChange).toHaveBeenLastCalledWith('08:3');
  });

  it('should format input as user types - four digits complete time', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '0830' } });
    expect(onChange).toHaveBeenLastCalledWith('08:30');
  });

  it('should strip non-numeric characters', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'ab12cd34' } });
    expect(onChange).toHaveBeenLastCalledWith('12:34');
  });

  it('should strip letters from time with colon', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '08:30abc' } });
    expect(onChange).toHaveBeenLastCalledWith('08:30');
  });

  it('should limit to 4 digits (5 chars with colon)', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '123456' } });
    expect(onChange).toHaveBeenLastCalledWith('12:34');
  });

  it('should have inputMode numeric for mobile keyboard', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  it('should have maxLength of 5', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxLength', '5');
  });

  it('should use default placeholder when not provided', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Entrada" value="" onChange={onChange} />);

    expect(screen.getByPlaceholderText('00:00')).toBeInTheDocument();
  });

  it('should handle clearing input', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Test" value="12:30" onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('should handle single digit', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Test" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '1' } });
    expect(onChange).toHaveBeenLastCalledWith('1');
  });

  it('should handle pasted value with colon', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Test" value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: '12:30' } });
    expect(onChange).toHaveBeenLastCalledWith('12:30');
  });
});
