import React, { useState, useEffect, ReactNode } from 'react';
import './ModernUI.css';

// ========================================
// INTERFACES Y TIPOS
// ========================================

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  tooltip?: string;
}

interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
  headerActions?: ReactNode;
  footer?: ReactNode;
}

interface PanelProps {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  actions?: ReactNode;
}

interface BadgeProps {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  className?: string;
}

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

// ========================================
// COMPONENTES BASE
// ========================================

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  children,
  onClick,
  className = '',
  tooltip
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      onClick();
    }
  };

  const buttonClasses = [
    'modern-btn',
    `modern-btn--${variant}`,
    `modern-btn--${size}`,
    loading && 'modern-btn--loading',
    isPressed && 'modern-btn--pressed',
    className
  ].filter(Boolean).join(' ');

  return (
    <Tooltip content={tooltip || ''}>
      <button
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled || loading}
        data-variant={variant}
        data-size={size}
      >
        {loading && (
          <span className="modern-btn__spinner">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31.416" strokeDashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite" />
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite" />
              </circle>
            </svg>
          </span>
        )}
        {icon && !loading && <span className="modern-btn__icon">{icon}</span>}
        <span className="modern-btn__text">{children}</span>
      </button>
    </Tooltip>
  );
};

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  required = false,
  className = ''
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const inputClasses = [
    'modern-input',
    isFocused && 'modern-input--focused',
    error && 'modern-input--error',
    disabled && 'modern-input--disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="modern-input-wrapper">
      {label && (
        <label className="modern-input__label">
          {label}
          {required && <span className="modern-input__required">*</span>}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        required={required}
      />
      {error && <div className="modern-input__error">{error}</div>}
    </div>
  );
};

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  className = '',
  headerActions,
  footer
}) => {
  const cardClasses = [
    'modern-card',
    `modern-card--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {(title || headerActions) && (
        <div className="modern-card__header">
          <div className="modern-card__header-content">
            {title && <h3 className="modern-card__title">{title}</h3>}
            {subtitle && <p className="modern-card__subtitle">{subtitle}</p>}
          </div>
          {headerActions && (
            <div className="modern-card__header-actions">
              {headerActions}
            </div>
          )}
        </div>
      )}
      <div className="modern-card__body">
        {children}
      </div>
      {footer && (
        <div className="modern-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className = '',
  actions
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const panelClasses = [
    'modern-panel',
    isCollapsed && 'modern-panel--collapsed',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={panelClasses}>
      <div className="modern-panel__header">
        <div className="modern-panel__header-content">
          {collapsible && (
            <button
              className="modern-panel__toggle"
              onClick={toggleCollapse}
              aria-expanded={!isCollapsed}
            >
              <svg
                className={`modern-panel__toggle-icon ${isCollapsed ? '' : 'modern-panel__toggle-icon--rotated'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </button>
          )}
          <h3 className="modern-panel__title">{title}</h3>
        </div>
        {actions && (
          <div className="modern-panel__actions">
            {actions}
          </div>
        )}
      </div>
      <div className="modern-panel__content">
        {children}
      </div>
    </div>
  );
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  className = ''
}) => {
  const badgeClasses = [
    'modern-badge',
    `modern-badge--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses}>
      {children}
    </span>
  );
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (content) {
      const rect = e.currentTarget.getBoundingClientRect();
      setCoords({ x: rect.left + rect.width / 2, y: rect.top });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltipClasses = [
    'modern-tooltip',
    `modern-tooltip--${position}`,
    isVisible && 'modern-tooltip--visible',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className="modern-tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {content && (
        <div className={tooltipClasses} style={{ left: coords.x, top: coords.y }}>
          {content}
        </div>
      )}
    </div>
  );
};

// ========================================
// COMPONENTES ESPECIALIZADOS PARA EDITOR 3D
// ========================================

interface ViewportButtonProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  tooltip?: string;
}

export const ViewportButton: React.FC<ViewportButtonProps> = ({
  icon,
  label,
  active = false,
  onClick,
  disabled = false,
  tooltip
}) => {
  const buttonClasses = [
    'viewport-btn',
    active && 'viewport-btn--active',
    disabled && 'viewport-btn--disabled'
  ].filter(Boolean).join(' ');

  return (
    <Tooltip content={tooltip || label}>
      <button
        className={buttonClasses}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        <span className="viewport-btn__icon">{icon}</span>
        <span className="viewport-btn__label">{label}</span>
      </button>
    </Tooltip>
  );
};

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  className = ''
}) => {
  const colorPickerClasses = [
    'modern-color-picker',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={colorPickerClasses}>
      {label && <label className="modern-color-picker__label">{label}</label>}
      <div className="modern-color-picker__input-wrapper">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="modern-color-picker__input"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="modern-color-picker__text-input"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  showValue = true,
  className = ''
}) => {
  const sliderClasses = [
    'modern-slider',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={sliderClasses}>
      {label && <label className="modern-slider__label">{label}</label>}
      <div className="modern-slider__container">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="modern-slider__input"
        />
        {showValue && (
          <span className="modern-slider__value">{value}</span>
        )}
      </div>
    </div>
  );
};

// ========================================
// HOOKS PERSONALIZADOS
// ========================================

export const useLocalStorage = function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

export const useDebounce = function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ========================================
// EXPORTACIÓN PRINCIPAL
// ========================================

export default {
  Button,
  Input,
  Card,
  Panel,
  Badge,
  Tooltip,
  ViewportButton,
  ColorPicker,
  Slider,
  useLocalStorage,
  useDebounce
}; 