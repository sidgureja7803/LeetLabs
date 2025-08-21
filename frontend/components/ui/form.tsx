import * as React from "react";
import { useFormContext, Controller, FieldValues, ControllerProps, FieldPath, ControllerRenderProps } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, onSubmit, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn("space-y-8", className)}
        onSubmit={onSubmit}
        {...props}
      />
    );
  }
);
Form.displayName = "Form";

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<ControllerProps<TFieldValues, TName>, "render"> {
  render: (props: { field: ControllerRenderProps<TFieldValues, TName> }) => React.ReactElement;
}

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  render,
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <Controller
      {...props}
      render={({ field }) => render({ field })}
    />
  );
};

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    );
  }
);
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      className={cn("block text-sm font-medium text-gray-900", className)}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ ...props }, ref) => {
    return <div ref={ref} {...props} />;
  }
);
FormControl.displayName = "FormControl";

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, id, ...props }, ref) => {
    const { formState: { errors } } = useFormContext();
    const error = errors[id as string];

    if (!error) return null;

    return (
      <p
        ref={ref}
        className={cn("text-sm font-medium text-red-500", className)}
        {...props}
      >
        {error.message as string}
      </p>
    );
  }
);
FormMessage.displayName = "FormMessage";

type FormComponentType = typeof Form & {
  Field: typeof FormField;
  Item: typeof FormItem;
  Label: typeof FormLabel;
  Control: typeof FormControl;
  Message: typeof FormMessage;
};

const FormRoot = Form as unknown as FormComponentType;

FormRoot.Field = FormField;
FormRoot.Item = FormItem;
FormRoot.Label = FormLabel;
FormRoot.Control = FormControl;
FormRoot.Message = FormMessage;

export { FormRoot as Form }; 