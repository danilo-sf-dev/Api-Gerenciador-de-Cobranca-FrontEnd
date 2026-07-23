import React from "react";
import { Loader2 } from "lucide-react";
import styles from "./ui.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      disabled = false,
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const variantClass = {
      primary: styles.btnPrimary,
      secondary: styles.btnSecondary,
      danger: styles.btnDanger,
      outline: styles.btnOutline,
      ghost: styles.btnGhost,
    }[variant];

    const sizeClass = {
      sm: styles.btnSm,
      md: styles.btnMd,
      lg: styles.btnLg,
    }[size];

    const combinedClassName = [
      styles.btn,
      variantClass,
      sizeClass,
      loading ? styles.btnLoading : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const getIconSize = () => {
      if (size === "sm") return 14;
      if (size === "lg") return 18;
      return 16;
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        aria-busy={loading ? true : undefined}
        className={combinedClassName}
        {...props}
      >
        {loading ? (
          <Loader2 className={styles.spinner} size={getIconSize()} aria-hidden="true" />
        ) : (
          icon && <span className={styles.btnIcon}>{icon}</span>
        )}
        {children && <span>{children}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
