/**
 * Form Field Component with validation and accessibility
 */
import React from 'react';
import './FormField.css';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  placeholder,
  autoComplete,
}) => {
  const inputId = `field-${name}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const inputProps = {
    id: inputId,
    name,
    value,
    onChange,
    disabled,
    placeholder,
    autoComplete,
    required,
    'aria-invalid': !!error,
    'aria-describedby': [
      error ? errorId : null,
      hint ? hintId : null,
    ].filter(Boolean).join(' ') || undefined,
  };

  return (
    <div className={`form-field ${error ? 'form-field-error' : ''}`}>
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && <span className="form-required" aria-label="required">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          {...inputProps}
          className="form-textarea"
          rows={4}
        />
      ) : (
        <input
          {...inputProps}
          type={type}
          className="form-input"
        />
      )}
      
      {error && (
        <div id={errorId} className="form-error" role="alert">
          {error}
        </div>
      )}
      
      {hint && !error && (
        <div id={hintId} className="form-hint">
          {hint}
        </div>
      )}
    </div>
  );
};

export default FormField;
