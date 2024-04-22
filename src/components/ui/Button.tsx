import type { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'yellow' | 'gray' | 'red' | 'blue';
} & DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const Button = ({ children, className, variant = 'primary', ...btnProps }: ButtonProps) => {
  const baseClasses = "w-fit px-4 py-1.5 text-xs font-semibold transition-opacity focus:outline-none enabled:hover:bg-opacity-80 enabled:active:bg-opacity-90 disabled:cursor-not-allowed sm:text-sm";
  
  const variantClasses = {
    primary: "bg-primary text-title",
    secondary: "bg-secondary text-white",
    yellow: "bg-yellow-400 text-black",
    gray: "bg-gray-200 text-gray-800",
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...btnProps}
    >
      {children}
    </button>
  );
};

export default Button;