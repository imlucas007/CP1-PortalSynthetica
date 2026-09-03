import { NavLink } from "react-router-dom";
import glass from "../styles/glass.module.css";
import styles from "./AdminShell.module.css";

const LINKS = [
  { to: "/admin/painel", rotulo: "PAINEL" },
  { to: "/admin/conteudos", rotulo: "CONTEÚDOS" },
  { to: "/admin/edicoes", rotulo: "EDIÇÕES" },
  { to: "/admin/cartas", rotulo: "CARTAS" },
  { to: "/admin/assinantes", rotulo: "ASSINANTES" },
];

export default function AdminShell({ children }) {
  return (
    <div className={glass.fundoAdmin}>
      <div className={styles.pagina}>
        <header className={`${glass.vidro} ${glass.pilula} ${styles.barra}`}>
          <div className={`${glass.vidroConteudo} ${styles.barraConteudo}`}>
            <p className="mono">SYNTHETICA · REDAÇÃO</p>
            <nav className={`mono ${styles.nav}`}>
              {LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => (isActive ? styles.ativo : undefined)}
                >
                  {link.rotulo}
                </NavLink>
              ))}
            </nav>
            <p className="mono">JÚLIA · EDITORA-CHEFE</p>
          </div>
        </header>

        <main className={styles.conteudo}>{children}</main>
      </div>
    </div>
  );
}
