import styles from "./retro.module.css";

// Decorative minimize / maximize / close buttons — drawn, not interactive.
export function RetroTitleButtons() {
  return (
    <span className={styles.titleBtns} aria-hidden="true">
      <span className={styles.titleBtn}>
        <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="7" width="6" height="2" fill="#000" /></svg>
      </span>
      <span className={styles.titleBtn}>
        <svg width="11" height="10" viewBox="0 0 11 10"><path d="M0.5 0.5h9v8.5h-9z M0.5 1.5h9" stroke="#000" fill="none" /><rect x="0" y="0" width="10" height="2" fill="#000" /></svg>
      </span>
      <span className={styles.titleBtn}>
        <svg width="10" height="9" viewBox="0 0 10 9"><path d="M1 0h2l2 2.5L7 0h2L6 4.5 9 9H7L5 6.5 3 9H1l3-4.5z" fill="#000" /></svg>
      </span>
    </span>
  );
}

export function RetroTitleBar({ title }: { title: string }) {
  return (
    <div className={styles.titlebar}>
      <span className={styles.titleIcon} aria-hidden="true" />
      <span className={styles.titleText}>{title}</span>
      <RetroTitleButtons />
    </div>
  );
}
