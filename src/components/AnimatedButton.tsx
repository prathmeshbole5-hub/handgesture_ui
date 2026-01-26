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
    glowColor = "rgba(255, 77, 0, 0.6)",
    className = "",
    ...props
}: AnimatedButtonProps) => {

    // Base styles + Variant styles
    const baseStyles = "relative overflow-hidden font-bold tracking-widest uppercase text-xs px-6 py-3 rounded transition-colors duration-300 flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-primary text-white hover:bg-white hover:text-black",
        secondary: "bg-white text-black hover:bg-primary hover:text-white",
        outline: "border border-white/20 text-white hover:border-primary hover:text-primary backdrop-blur-sm",
        ghost: "bg-transparent text-gray-400 hover:text-white"
    };

    return (
        <motion.button
            whileHover={{
                scale: 1.05,
                y: -2,
                boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor.replace('0.6', '0.2')}`
            }}
            whileTap={{ scale: 0.95, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 17
            }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {/* Background Shimmer Effect */}
            <motion.div
                className="absolute inset-0 bg-white/20 -skew-x-12"
                initial={{ x: "-100%" }}
                whileHover={{ x: "200%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            {/* Content z-index fix to stay above shimmer */}
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </motion.button>
    );
};
