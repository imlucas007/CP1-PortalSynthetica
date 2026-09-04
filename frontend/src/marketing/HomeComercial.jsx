import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import glass from "../styles/glass.module.css";
import { listarConteudos } from "../api/client";
import objetoCromado from "../assets/login/objeto-cromado.png";
import {
  EIXOS,
  EQUIPE,
  FAQ,
  PASSOS,
  PLANOS,
  RODAPE_COLUNAS,
  REDES_SOCIAIS,
  VALORES,
  BYLINE_POR_TITULO,
} from "./dadosComerciais";
import styles from "./HomeComercial.module.css";

export default function HomeComercial() {
  const navigate = useNavigate();
  const [destaques, setDestaques] = useState([]);
  const [emailNewsletter, setEmailNewsletter] = useState("");
  const [newsletterEnviada, setNewsletterEnviada] = useState(false);

  useEffect(() => {
    listarConteudos({ status: "publicado" }).then((itens) => setDestaques(itens.slice(0, 3)));
  }, []);

  function enviarNewsletter(e) {
    e.preventDefault();
    // Protótipo acadêmico: não existe serviço de e-mail integrado, isso só
    // simula a confirmação visual do cadastro.
    setNewsletterEnviada(true);
  }

  return (
    <div className={styles.pagina}>
      <div className={styles.halo} />

      {/* NAV */}
      <div className={`${glass.vidro} ${glass.pilula} ${styles.nav}`}>
        <div className={glass.vidroConteudo}>
          <p className={`mono ${styles.navMarca}`}>SYNTHETICA</p>
          <nav className={`mono ${styles.navLinks}`}>
            <a href="#nesta-edicao">PESQUISA</a>
            <Link to="/sumario">REPORTAGENS</Link>
            <a href="#redacao">ENSAIOS</a>
            <a href="#faq">COLUNAS</a>
            <a href="#planos">EDIÇÕES</a>
          </nav>
          <button className={`mono ${styles.navCta}`} onClick={() => navigate("/checkout")}>
            ASSINAR
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className={styles.hero}>
        <p className={`mono ${styles.heroMeta}`}>
          <span>REVISTA DE INTELIGÊNCIA ARTIFICIAL</span>
          <span>EDIÇÃO #07</span>
          <span>AGO 2047</span>
          <span>2.400+ ASSINANTES</span>
        </p>

        <div className={styles.heroGrade}>
          <div className={styles.heroTexto}>
            <h1 className={styles.h1}>
              A revista de inteligência artificial
              <br />
              escrita por humanos e
              <br />
              selecionada para você
            </h1>
            <p className={styles.subheadline}>
              Nossa redação contrata jornalistas, ensaístas e designers para produzir as matérias
              sobre IA na arte e cultura e sobre avanços tecnológicos em IA. A inteligência
              artificial não escreve nenhuma linha: ela só monta a edição que faz sentido para
              você, e mostra o porquê de cada escolha.
            </p>
            <div className={styles.ctas}>
              <button className={`mono ${styles.ctaPrimario}`} onClick={() => navigate("/checkout")}>
                ASSINAR POR R$ 19/MÊS
              </button>
              <button className={`mono ${styles.ctaSecundario}`} onClick={() => navigate("/leitura/1")}>
                VER EDIÇÃO DE EXEMPLO
              </button>
            </div>
            <p className={`mono ${styles.trust}`}>
              Matérias escritas por humanos · 7 dias grátis · assinatura de revista digital sem
              fidelidade
            </p>
          </div>

          <div className={styles.heroWordmarkArea}>
            <p className={styles.wordmarkGigante} aria-hidden="true">
              SYNTHETICA
            </p>
            <div className={`${glass.vidro} ${styles.introCard}`}>
              <p className={`${glass.vidroConteudo} ${styles.introTexto}`}>
                Cada leitor recebe uma edição diferente. A curadoria não é oculta: ao lado de cada
                matéria, a redação artificial mostra o motivo da escolha e o sinal de leitura que a
                produziu. Você pode apagar qualquer sinal.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.eixos}>
          {EIXOS.map((eixo) => (
            <span key={eixo} className={`mono ${styles.eixoPill}`}>
              {eixo}
            </span>
          ))}
        </div>
      </section>

      {/* CAPA EM DESTAQUE */}
      <section className={`${glass.vidro} ${styles.capa}`}>
        <div className={`${glass.vidroConteudo} ${styles.capaConteudo}`}>
          <div className={styles.capaTexto}>
            <p className={`mono ${styles.capaRotulo}`}>MATÉRIA DE CAPA</p>
            <h2 className={styles.capaTitulo}>O futuro já foi imaginado antes</h2>
            <p className={styles.capaCorpo}>
              Das fitas de celulose às redes neurais, a ficção científica traçou um mapa que a
              realidade teima em seguir. Mas o que acontece quando a imaginação se esgota antes da
              tecnologia?
            </p>
            <div className={styles.capaJustificativa}>
              <span className="mono">POR QUE ESTA MATÉRIA</span>
              <span>seu histórico de leitura sobre IA e cultura visual</span>
            </div>
          </div>
          <img src={objetoCromado} alt="" className={styles.capaImagem} />
        </div>
      </section>

      {/* CARDS DE VALOR */}
      <section className={styles.valores}>
        {VALORES.map((v) => (
          <div key={v.titulo} className={`${glass.vidro} ${styles.valorCard}`}>
            <div className={glass.vidroConteudo}>
              <p className={`mono ${styles.valorRotulo}`}>{v.rotulo}</p>
              <h3 className={styles.valorTitulo}>{v.titulo}</h3>
              <p className={styles.valorTexto}>{v.texto}</p>
              <a href="#como-funciona" className={`mono ${styles.valorLink}`}>
                SAIBA MAIS →
              </a>
            </div>
          </div>
        ))}
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className={styles.secao}>
        <h2 className={styles.h2}>Como funciona</h2>
        <div className={styles.passos}>
          {PASSOS.map((p) => (
            <div key={p.numero} className={styles.passo}>
              <p className={styles.passoNumero}>{p.numero}</p>
              <p className={styles.passoTitulo}>{p.titulo}</p>
              <p className={styles.passoTexto}>{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NESTA EDIÇÃO */}
      <section id="nesta-edicao" className={styles.secao}>
        <h2 className={styles.h2}>Nesta edição</h2>
        <p className={styles.secaoSublinha}>
          Três das quinze matérias publicadas em agosto. A sua edição terá seis, escolhidas para o
          seu perfil.
        </p>
        <div className={styles.artigos}>
          {destaques.map((c) => (
            <button
              key={c.id}
              className={`${glass.vidro} ${styles.artigoCard}`}
              onClick={() => navigate(`/leitura/${c.id}`)}
            >
              <div className={glass.vidroConteudo}>
                <div className={styles.artigoFoto}>
                  <span className="mono">FOTO</span>
                </div>
                <p className={`mono ${styles.artigoEditoria}`}>{c.editoria.nome.toUpperCase()}</p>
                <p className={styles.artigoTitulo}>{c.titulo}</p>
                <p className={styles.artigoChamada}>{c.chamada}</p>
                <p className={`mono ${styles.artigoByline}`}>
                  {BYLINE_POR_TITULO[c.titulo] ?? "REDAÇÃO"} · {c.tempo_leitura_min} MIN
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* REDAÇÃO */}
      <section id="redacao" className={styles.secao}>
        <h2 className={styles.h2}>Redação</h2>
        <p className={styles.secaoSublinha}>
          Toda matéria é assinada por uma pessoa. Nenhum texto é gerado por máquina em nenhuma
          etapa.
        </p>
        <div className={styles.equipe}>
          {EQUIPE.map((p) => (
            <div key={p.nome} className={styles.perfil}>
              <div className={styles.retrato}>{p.iniciais}</div>
              <p className={styles.perfilNome}>{p.nome}</p>
              <p className={`mono ${styles.perfilCargo}`}>{p.cargo}</p>
              <p className={styles.perfilBio}>{p.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className={styles.secao}>
        <h2 className={styles.h2}>Planos simples, sem letras miúdas</h2>
        <div className={styles.planos}>
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className={`${glass.vidro} ${styles.planoCard} ${
                plano.destaque ? styles.planoDestaque : ""
              }`}
            >
              <div className={glass.vidroConteudo}>
                <p className={`mono ${styles.planoNome}`}>{plano.nome}</p>
                <div className={styles.planoPreco}>
                  <span>{plano.preco}</span>
                  <span>{plano.periodo}</span>
                </div>
                <ul className={styles.planoLista}>
                  {plano.itens.map((item) => (
                    <li key={item}>— {item}</li>
                  ))}
                </ul>
                <button
                  className={`mono ${styles.planoBotao}`}
                  onClick={() => navigate("/checkout")}
                >
                  COMEÇAR AGORA
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={styles.secao}>
        <h2 className={styles.h2}>Perguntas frequentes</h2>
        <div className={styles.faq}>
          {FAQ.map((item) => (
            <div key={item.pergunta} className={styles.faqItem}>
              <p className={styles.faqPergunta}>{item.pergunta}</p>
              <p className={styles.faqResposta}>{item.resposta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className={`${glass.vidro} ${styles.newsletter}`}>
        <div className={`${glass.vidroConteudo} ${styles.newsletterConteudo}`}>
          <div className={styles.newsletterTexto}>
            <p className={`mono ${styles.newsletterRotulo}`}>PRÉVIA MENSAL</p>
            <h2 className={styles.newsletterTitulo}>Receba a prévia da edição no seu e-mail</h2>
            <p className={styles.newsletterCorpo}>
              Um resumo do que a redação humana publicou no mês e do que o editor-chefe artificial
              separou. Sem custo e sem cadastro de assinante.
            </p>
          </div>
          {newsletterEnviada ? (
            <p className={styles.newsletterSucesso}>
              Prévia a caminho de {emailNewsletter || "você"}. Confira sua caixa de entrada.
            </p>
          ) : (
            <form onSubmit={enviarNewsletter} className={styles.newsletterForm}>
              <div className={styles.newsletterCampo}>
                <input
                  type="email"
                  required
                  placeholder="seu@e-mail.com"
                  value={emailNewsletter}
                  onChange={(e) => setEmailNewsletter(e.target.value)}
                />
                <button className="mono">CADASTRAR</button>
              </div>
              <p className={styles.newsletterTermos}>
                Li e concordo com a política de privacidade e os termos de uso.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className={styles.rodape}>
        <div className={styles.rodapeTopo}>
          <div className={styles.rodapeMarca}>
            <p className={styles.rodapeMarcaTitulo}>SYNTHETICA</p>
            <p className={styles.rodapeMarcaTexto}>
              Revista de inteligência artificial. Matérias escritas por humanos, edição
              selecionada para cada leitor.
            </p>
          </div>
          {RODAPE_COLUNAS.map((coluna) => (
            <div key={coluna.titulo} className={styles.rodapeColuna}>
              <p className={`mono ${styles.rodapeColunaTitulo}`}>{coluna.titulo}</p>
              {coluna.links.map((link) => (
                <p key={link} className={styles.rodapeLink}>
                  {link}
                </p>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.rodapeLinha} />
        <div className={styles.rodapeBase}>
          <p className="mono">© 2047 SYNTHETICA · SÃO PAULO · CNPJ 00.000.000/0001-00</p>
          <div className={`mono ${styles.rodapeSocial}`}>
            {REDES_SOCIAIS.map((rede) => (
              <span key={rede}>{rede}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
