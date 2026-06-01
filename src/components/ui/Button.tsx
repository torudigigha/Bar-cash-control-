import React from 'react';
import { cn } from '../../utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
  onClick?: any;
  type?: 'submit' | 'button' | 'reset';
  disabled?: boolean;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-gold-500 text-bar-950 hover:bg-gold-400 shadow-sm",
    secondary: "bg-bar-800 text-white hover:bg-bar-700",
    outline: "border border-bar-700 text-gray-300 hover:text-white hover:bg-bar-800",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    ghost: "text-gray-400 hover:text-white hover:bg-bar-800",
  };
  
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-14 px-8 text-base font-semibold",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
}
