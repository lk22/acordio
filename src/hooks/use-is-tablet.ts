'use client';
import {useState, useEffect} from "react";

type UseIsTablet = () => boolean;

export const useIsTablet: UseIsTablet = () => {
  const [isTablet, setIsTablet] = useState<boolean>(false);

  useEffect(() => {
    const handleSizeChange = () => {
      const width = window.innerWidth;
      setIsTablet(width > 768 && width <= 1024);
    }

    window.addEventListener("resize", handleSizeChange);
    handleSizeChange(); // Check on mount

    return () => {
      window.removeEventListener("resize", handleSizeChange);
    }

  }, []);

  return isTablet;
}