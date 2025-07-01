import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Form } from '@/components/ui/form';
import { z } from 'zod';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
});

const TestForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = jest.fn();

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Form.Field
          control={form.control}
          name="username"
          render={({ field }) => (
            <Form.Item>
              <Form.Label htmlFor="username">Username</Form.Label>
              <Form.Control>
                <input id="username" {...field} />
              </Form.Control>
              <Form.Message id="username" />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="email"
          render={({ field }) => (
            <Form.Item>
              <Form.Label htmlFor="email">Email</Form.Label>
              <Form.Control>
                <input id="email" {...field} />
              </Form.Control>
              <Form.Message id="email" />
            </Form.Item>
          )}
        />
        <button type="submit">Submit</button>
      </Form>
    </FormProvider>
  );
};

describe('Form Component', () => {
  it('renders form fields correctly', () => {
    render(<TestForm />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    render(<TestForm />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(usernameInput, { target: { value: 'a' } });
    fireEvent.blur(usernameInput);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('accepts valid input', async () => {
    render(<TestForm />);
    
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/username must be at least 2 characters/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
    });
  });
}); 