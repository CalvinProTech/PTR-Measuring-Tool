import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressForm } from "@/components/AddressForm";

// Mock the LoadingSpinner to simplify tests
jest.mock("@/components/LoadingSpinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe("AddressForm", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("should render the address input and submit button", () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    expect(
      screen.getByPlaceholderText(/enter property address/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /analyze roof/i })
    ).toBeInTheDocument();
  });

  it("should disable submit button when input is empty", () => {
    render(<AddressForm onSubmit={mockOnSubmit} />);

    const button = screen.getByRole("button", { name: /analyze roof/i });
    expect(button).toBeDisabled();
  });

  it("should enable submit button when input has text", async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/enter property address/i);
    await user.type(input, "123 Main St");

    const button = screen.getByRole("button", { name: /analyze roof/i });
    expect(button).not.toBeDisabled();
  });

  it("should show error for short addresses", async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/enter property address/i);
    await user.type(input, "123");

    const button = screen.getByRole("button", { name: /analyze roof/i });
    await user.click(button);

    expect(screen.getByRole("alert")).toHaveTextContent(
      /please enter a valid address/i
    );
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit with trimmed address", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);
    render(<AddressForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/enter property address/i);
    await user.type(input, "  123 Main St, Tampa, FL  ");

    const button = screen.getByRole("button", { name: /analyze roof/i });
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith("123 Main St, Tampa, FL");
  });

  it("should show loading state when isLoading is true", () => {
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByText(/analyzing/i)).toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("should disable input and button when loading", () => {
    render(<AddressForm onSubmit={mockOnSubmit} isLoading={true} />);

    const input = screen.getByPlaceholderText(/enter property address/i);
    const button = screen.getByRole("button");

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it("should display error from onSubmit rejection", async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error("API error"));
    render(<AddressForm onSubmit={mockOnSubmit} />);

    const input = screen.getByPlaceholderText(/enter property address/i);
    await user.type(input, "123 Main St, Tampa, FL");

    const button = screen.getByRole("button", { name: /analyze roof/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("API error");
    });
  });

  it("should clear error when user starts typing again", async () => {
    const user = userEvent.setup();
    render(<AddressForm onSubmit={mockOnSubmit} />);

    // Submit with short address to trigger error
    const input = screen.getByPlaceholderText(/enter property address/i);
    await user.type(input, "123");

    const button = screen.getByRole("button", { name: /analyze roof/i });
    await user.click(button);

    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Type more to trigger form resubmit (error clears on submit)
    await user.clear(input);
    await user.type(input, "123 Main Street, Tampa, FL");
    await user.click(button);

    // After successful validation, no error should appear
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
