import glass from "../styles/glass.module.css";
import styles from "./ConfirmarExclusaoModal.module.css";

export default function ConfirmarExclusaoModal({ conteudo, onCancelar, onConfirmar }) {
  if (!conteudo) return null;

  return (
    <div className={styles.fundo}>
      <div className={`${glass.vidro} ${styles.dialogo}`}>
        <div className={glass.vidroConteudo}>
          <p className={`mono ${styles.rotulo}`}>EXCLUSÃO PERMANENTE</p>
          <h2 className={styles.pergunta}>Excluir "{conteudo.titulo}"?</h2>
          <p className={styles.descricao}>
            O conteúdo #{String(conteudo.id).padStart(4, "0")} sai do acervo. {conteudo.total_comentarios}{" "}
            comentário(s) e {conteudo.total_favoritos} favorito(s) ligados a ele são removidos junto.
          </p>
          <div className={`mono ${styles.dica}`}>
            Para tirar do ar sem perder o histórico, mude o status para RASCUNHO.
          </div>
          <div className={styles.acoes}>
            <button className={`mono ${styles.cancelar}`} onClick={onCancelar}>
              CANCELAR
            </button>
            <button
              className={`mono ${styles.excluir}`}
              onClick={() => onConfirmar(conteudo.id)}
            >
              EXCLUIR MESMO ASSIM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
