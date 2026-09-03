import styles from "./AdminBar.module.css";

const LINKS = ["CONTEÚDOS", "EDIÇÕES", "CATEGORIAS", "ASSINANTES"];

export default function AdminBar() {
  return (
    <header className={styles.barra}>
      <div className={styles.esquerda}>
        <p className={`mono ${styles.marca}`}>SYNTHETICA · REDAÇÃO</p>
        <nav className={`mono ${styles.nav}`}>
          {LINKS.map((link) => (
            <span key={link} className={link === "CONTEÚDOS" ? styles.ativo : ""}>
              {link}
            </span>
          ))}
        </nav>
      </div>
      <p className={`mono ${styles.usuaria}`}>JÚLIA · EDITORA</p>
    </header>
  );
}
