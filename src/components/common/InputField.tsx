import React, { InputHTMLAttributes, forwardRef, useState } from "react";
import styled from "styled-components";

export interface InputFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
  "onChange"
> {
  label: string;
  error?: string | boolean;
  isTextArea?: boolean;
  value?: string;
  onChange?: (val: string) => void;
  rows?: number;
  required?: boolean;
}

const InputField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputFieldProps
>(
  (
    {
      label,
      error,
      isTextArea,
      value,
      onChange,
      onFocus,
      onBlur,
      rows = 3,
      required,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<any>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<any>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const renderLabelContent = () => {
      if (typeof label === "string" && label.endsWith("*")) {
        const baseLabel = label.slice(0, -1).trim();
        return (
          <>
            {baseLabel} <RequiredAsterisk>*</RequiredAsterisk>
          </>
        );
      }
      if (required) {
        return (
          <>
            {label} <RequiredAsterisk>*</RequiredAsterisk>
          </>
        );
      }
      return label;
    };

    return (
      <Container
        $hasError={!!error}
        $isFocused={isFocused}
        className={props.className}
      >
        <Label $hasError={!!error}>{renderLabelContent()}</Label>
        {isTextArea ? (
          <StyledTextArea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            rows={rows}
            {...(props as any)}
          />
        ) : (
          <StyledInput
            ref={ref as React.Ref<HTMLInputElement>}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...(props as any)}
          />
        )}
        {typeof error === "string" && error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}
      </Container>
    );
  },
);

InputField.displayName = "InputField";

export default InputField;

// --- Styles ---
const Container = styled.div<{ $hasError: boolean; $isFocused: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  border: 1px solid
    ${({ $hasError, $isFocused }) => {
      if ($hasError) return "var(--border-error)";
      if ($isFocused) return "var(--border-brand)";
      return "var(--border-default)";
    }};
  background-color: ${({ $hasError }) =>
    $hasError ? "var(--bg-error)" : "var(--bg-subtle)"};
  padding: 8px 12px;
  min-height: 56px;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:focus-within {
    border-color: ${({ $hasError }) =>
      $hasError
        ? "var(--border-error)"
        : "var(--border-brand)"};
  }
`;

const Label = styled.span<{ $hasError: boolean }>`
  color: ${({ $hasError }) =>
    $hasError ? "var(--text-error)" : "var(--text-tertiary)"};
  margin-bottom: 4px;
  pointer-events: none;
  text-align: left;

  overflow: hidden;
  text-overflow: ellipsis;

  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 16px;
`;

const RequiredAsterisk = styled.span`
  color: var(--text-error);
  font-weight: 600;
  margin-left: 2px;
`;

const StyledInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  padding: 0;
  width: 100%;
  box-sizing: border-box;

  overflow: hidden;
  color: var(--text-primary);
  text-overflow: ellipsis;

  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 24px;

  &::placeholder {
    color: var(--text-disabled);
  }
`;

const StyledTextArea = styled.textarea`
  border: none;
  background: transparent;
  outline: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--gray-800);
  padding: 0;
  width: 100%;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;

  &::placeholder {
    color: var(--text-disabled);
  }
`;

const ErrorMessage = styled.span`
  color: var(--text-error);
  font-size: 11px;
  margin-top: 4px;
  text-align: left;
`;
