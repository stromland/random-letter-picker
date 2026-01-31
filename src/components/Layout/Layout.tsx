import type { ReactNode } from "react";
import styles from "./layout.module.css";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return <div className={styles.layout}>{children}</div>;
}
