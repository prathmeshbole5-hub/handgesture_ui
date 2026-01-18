import { useRef, useState } from "react";
import { motion } from "framer-motion";

const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;

const CHARS = "!@#$%^&*():{};|,.<>/?";

interface TextScrambleProps {
    children: string;
    className?: string;
}

export const TextScramble = ({ children, className }: TextScrambleProps) => {
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [text, setText] = useState(children);

    const scramble = () => {
        let pos = 0;

        intervalRef.current = setInterval(() => {
            const scrambled = children.split("")
                .map((char, index) => {
                    if (pos / CYCLES_PER_LETTER > index) {
                        return char;
                    }

                    const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
                    return randomChar;
                })
                .join("");

            setText(scrambled);
            pos++;

            if (pos >= children.length * CYCLES_PER_LETTER) {
                stopScramble();
            }
        }, SHUFFLE_TIME);
    };

    const stopScramble = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setText(children);
    };

    return (
        <motion.span
            onMouseEnter={scramble}
            onMouseLeave={stopScramble}
            className={className}
        >
            {text}
        </motion.span>
    );
};
