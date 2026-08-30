"use client";

import { motion, useMotionValue, useTransform } from "motion/react";
import { useState, useEffect } from "react";

interface WishCardData {
  image: string;
  text: string;
}

interface StackProps {
  cards: WishCardData[];
  sensitivity?: number;
  randomRotation?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
}

function CardRotate({
  children,
  onSendToBack,
  sensitivity,
}: {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(_: unknown, info: { offset: { x: number; y: number } }) {
    if (Math.abs(info.offset.x) > sensitivity || Math.abs(info.offset.y) > sensitivity) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="wc-rotate"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

export default function WishStack({
  cards = [],
  sensitivity = 200,
  randomRotation = false,
  autoplay = false,
  autoplayDelay = 3000,
}: StackProps) {
  const [stack, setStack] = useState(() =>
    cards.map((c, i) => ({ id: i + 1, content: c, x: 0 })),
  );
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setStack(cards.map((c, i) => ({ id: i + 1, content: c, x: 0 })));
  }, [cards]);

  const sendToBack = (id: number) => {
    setStack((prev) => {
      const newStack = [...prev];
      const index = newStack.findIndex((card) => card.id === id);
      const [card] = newStack.splice(index, 1);
      newStack.unshift(card);
      return newStack;
    });
  };

  useEffect(() => {
    if (autoplay && stack.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        const topCardId = stack[stack.length - 1].id;
        sendToBack(topCardId);
      }, autoplayDelay);
      return () => clearInterval(interval);
    }
  }, [autoplay, autoplayDelay, stack, isPaused]);

  return (
    <div
      className="wc-stack"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {stack.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;
        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
          >
            <motion.div
              className="wc-card"
              animate={{
                rotateZ: (stack.length - index - 1) * 4 + randomRotate,
                scale: 1 + index * 0.06 - stack.length * 0.06,
                transformOrigin: "90% 90%",
              }}
              initial={false}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <img src={card.content.image} alt={card.content.text} className="wc-img" draggable={false} />
            </motion.div>
          </CardRotate>
        );
      })}
      <p className="wc-hint">Geser kartu untuk ucapan berikutnya</p>
    </div>
  );
}
