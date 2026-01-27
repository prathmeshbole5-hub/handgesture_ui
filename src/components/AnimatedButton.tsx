import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    glowColor?: string;
    className?: string;
}

export const AnimatedButton = ({
    children,
    variant = 'primary',
    glowColor = "rgba(255, 77, 0, 0.8)",
    className = "",
    ...props
}: AnimatedButtonProps) => {

    const baseStyles = "relative overflow-hidden font-display font-bold tracking-widest uppercase text-xs px-8 py-4 rounded-sm transition-all duration-300 flex items-center justify-center gap-2 group";

    const variants = {
        primary: "bg-primary text-white border border-primary hover:bg-transparent hover:text-primary",
        secondary: "bg-transparent text-white border border-white/20 hover:border-primary hover:text-primary hover:bg-white/5 backdrop-blur-sm",
        outline: "border border-white/20 text-white hover:border-primary hover:text-primary backdrop-blur-md",
        ghost: "bg-transparent text-gray-400 hover:text-white"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {/* Hover Glow Background */}
            <motion.div
                className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                layoutId={`glow-${Math.random()}`}
            />

            {/* Scanline/Shimmer */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />

            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>

            {/* Corner Accents */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/0 group-hover:border-white/50 transition-all duration-300" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/0 group-hover:border-white/50 transition-all duration-300" />
        </motion.button>
    );
};
