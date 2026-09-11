"""
main.py — API do Portal Synthetica sobre Oracle
-----------------------------------------------
Mesmo padrao do repositorio de aula (vvsantos/aula_fastapi):

  - database.py cuida SO da conexao;
  - modelos Pydantic de ENTRADA e SAIDA separados;
  - toda query com bind variables (:nome) — nunca concatena string no SQL;
  - toda escrita com commit()/rollback() explicitos;
  - SELECT sempre com as colunas listadas, nunca SELECT *;
  - conexao aberta no inicio da rota e fechada no finally.

Cada rota corresponde a uma operacao SQL da secao 7 do doc de modelagem.

Como rodar:
    uvicorn main:app --reload --port 8010
    http://127.0.0.1:8010/docs
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import get_connection
from ia import gerar_resumo
from curadoria import PreferenciasCuradoria, selecionar_materias

load_dotenv()

app = FastAPI(title="API do Portal Synthetica (Oracle)", version="1.0.0")

# O repositorio de aula serve o proprio front na mesma origem e por isso nao
# usa CORS. Aqui o front do Synthetica roda separado (Vite, :5173), entao
# precisamos liberar a origem dele.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# MODELOS PYDANTIC — entrada (o que a API recebe) e saida (o que devolve)
# =====================================================================

class ComentarioEntrada(BaseModel):
    """Corpo do POST /materias/{id}/comentarios."""
    id_usuario: int
    texto: str = Field(min_length=3, max_length=500)


class ComentarioEdicao(BaseModel):
    """Corpo do PUT /comentarios/{id}."""
    texto: str = Field(min_length=3, max_length=500)


class FavoritoEntrada(BaseModel):
    """Corpo do POST /favoritos."""
    id_usuario: int
    id_materia: int


class ModeracaoEntrada(BaseModel):
    """Corpo do PUT /avaliacoes/{id}/moderar.

    status e moderada_por vem JUNTOS: a constraint ck_aval_moderacao do
    banco exige os dois preenchidos quando o status sai de 'PENDENTE'.
    """
    status: str  # 'APROVADA' ou 'REJEITADA'
    moderada_por: int


class MateriaSaida(BaseModel):
    id_materia: int
    titulo: str
    categoria: str
    autor: str
    publicada_em: str | None = None
    # Campos que a revista (front) consome na listagem. 'pagina' e
    # 'tempo_leitura' sao derivados na propria query (nao existem como coluna).
    resumo: str | None = None
    subtitulo: str | None = None
    pagina: int | None = None
    tempo_leitura: int | None = None
    imagem_url: str | None = None


class MateriaDetalheSaida(MateriaSaida):
    """Detalhe de uma materia — inclui o corpo (CLOB) e as tags."""
    corpo: str
    palavras_chave: str | None = None


class MateriaComentadaSaida(BaseModel):
    id_materia: int
    titulo: str
    total_comentarios: int


class FavoritoSaida(BaseModel):
    id_materia: int
    titulo: str
    categoria: str
    favoritado_em: str | None = None


class UsuarioAtivoSaida(BaseModel):
    id_usuario: int
    nome: str
    total_interacoes: int


class ComentarioSaida(BaseModel):
    id_comentario: int
    id_usuario: int
    id_materia: int
    texto: str
    criado_em: str | None = None


class AvaliacaoSaida(BaseModel):
    id_avaliacao: int
    id_fechamento: int
    nota: int
    texto: str
    status: str
    moderada_por: int | None = None
    editada_em: str | None = None


# =====================================================================
# FUNCOES AUXILIARES — transformam a tupla do Oracle em dicionario.
# O cursor devolve tuplas posicionais: (1, 'Titulo', 'Eixo', ...).
# A gente quer devolver ao cliente: {"id_materia": 1, "titulo": ...}.
# Como isso se repete em varias rotas, extraimos (principio DRY).
# =====================================================================

def _data(valor):
    """Datas do Oracle vem como datetime; devolvemos como texto ISO."""
    return valor.isoformat() if valor is not None else None


def linha_para_materia(l: tuple) -> dict:
    return {
        "id_materia": l[0], "titulo": l[1], "categoria": l[2], "autor": l[3],
        "publicada_em": _data(l[4]), "resumo": l[5], "subtitulo": l[6],
        "pagina": l[7], "tempo_leitura": l[8], "imagem_url": l[9],
    }


def linha_para_materia_detalhe(l: tuple) -> dict:
    d = linha_para_materia(l)
    d["corpo"] = l[10] or ""
    d["palavras_chave"] = l[11]
    return d


def linha_para_materia_comentada(l: tuple) -> dict:
    return {"id_materia": l[0], "titulo": l[1], "total_comentarios": l[2]}


def linha_para_favorito(l: tuple) -> dict:
    return {"id_materia": l[0], "titulo": l[1], "categoria": l[2], "favoritado_em": _data(l[3])}


def linha_para_usuario_ativo(l: tuple) -> dict:
    return {"id_usuario": l[0], "nome": l[1], "total_interacoes": l[2]}


def linha_para_comentario(l: tuple) -> dict:
    return {"id_comentario": l[0], "id_usuario": l[1], "id_materia": l[2], "texto": l[3], "criado_em": _data(l[4])}


def linha_para_avaliacao(l: tuple) -> dict:
    return {
        "id_avaliacao": l[0], "id_fechamento": l[1], "nota": l[2], "texto": l[3],
        "status": l[4], "moderada_por": l[5], "editada_em": _data(l[6]),
    }


# =====================================================================
# INFRA
# =====================================================================

@app.get("/")
def raiz():
    return {"mensagem": "API do Portal Synthetica (Oracle) no ar!"}


@app.get("/health")
def health():
    """SELECT 1 FROM dual — confirma que o banco responde."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT 1 FROM dual")
        return {"banco": "ok" if cursor.fetchone()[0] == 1 else "sem_resposta"}
    finally:
        cursor.close()
        conn.close()


# =====================================================================
# MATERIAS
# =====================================================================

@app.get("/materias", response_model=list[MateriaSaida])
def listar_materias():
    """Consulta 5.1 — todos os conteudos com a categoria (EIXO) e o autor.

    'pagina' e 'tempo_leitura' nao sao colunas: a pagina e a ordem de
    publicacao (ROW_NUMBER) e o tempo estimado sai do tamanho do CLOB
    'corpo' (~1100 caracteres por minuto de leitura).
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT m.id_materia,
                   m.titulo,
                   e.nome        AS categoria,
                   a.nome        AS autor,
                   m.publicada_em,
                   m.resumo,
                   m.subtitulo,
                   ROW_NUMBER() OVER (ORDER BY m.publicada_em, m.id_materia) AS pagina,
                   GREATEST(1, ROUND(DBMS_LOB.GETLENGTH(m.corpo) / 1100))   AS tempo_leitura,
                   m.imagem_url
            FROM materia m
            JOIN eixo  e ON e.id_eixo  = m.id_eixo
            JOIN autor a ON a.id_autor = m.id_autor
            ORDER BY e.nome, m.titulo
        """)
        return [linha_para_materia(l) for l in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()


@app.get("/materias/mais-comentadas", response_model=list[MateriaComentadaSaida])
def materias_mais_comentadas():
    """Consulta 5.2 — LEFT JOIN + COUNT + GROUP BY.
    O LEFT JOIN garante que materia sem nenhum comentario apareca com total 0.

    Fica ANTES de /materias/{id_materia}: o FastAPI casa as rotas na ordem de
    declaracao, entao a rota fixa precisa vir antes da com parametro, senao
    'mais-comentadas' seria lido como um id.
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT m.id_materia,
                   m.titulo,
                   COUNT(c.id_comentario) AS total_comentarios
            FROM materia m
            LEFT JOIN comentario c ON c.id_materia = m.id_materia
            GROUP BY m.id_materia, m.titulo
            ORDER BY total_comentarios DESC, m.titulo
        """)
        return [linha_para_materia_comentada(l) for l in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()


@app.post("/curadoria")
def curadoria(preferencias: PreferenciasCuradoria):
    return {"recomendacoes": selecionar_materias(preferencias, listar_materias())}


@app.get("/materias/{id_materia}", response_model=MateriaDetalheSaida)
def obter_materia(id_materia: int):
    """Detalhe de uma materia para a tela de Leitura da revista: mesmos
    campos da 5.1 + o corpo (CLOB) + as tags concatenadas (MATERIA_TAG + TAG)."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id_materia, titulo, categoria, autor, publicada_em,
                   resumo, subtitulo, pagina, tempo_leitura, imagem_url, corpo, palavras_chave
            FROM (
                SELECT m.id_materia,
                       m.titulo,
                       e.nome AS categoria,
                       a.nome AS autor,
                       m.publicada_em,
                       m.resumo,
                       m.subtitulo,
                       ROW_NUMBER() OVER (ORDER BY m.publicada_em, m.id_materia) AS pagina,
                       GREATEST(1, ROUND(DBMS_LOB.GETLENGTH(m.corpo) / 1100)) AS tempo_leitura,
                       m.imagem_url,
                       m.corpo,
                       (SELECT LISTAGG(t.nome, ', ') WITHIN GROUP (ORDER BY t.nome)
                          FROM materia_tag mt
                          JOIN tag t ON t.id_tag = mt.id_tag
                         WHERE mt.id_materia = m.id_materia) AS palavras_chave
                FROM materia m
                JOIN eixo  e ON e.id_eixo  = m.id_eixo
                JOIN autor a ON a.id_autor = m.id_autor
            )
            WHERE id_materia = :id
        """, {"id": id_materia})
        linha = cursor.fetchone()
        if linha is None:
            raise HTTPException(404, "Materia nao encontrada.")
        return linha_para_materia_detalhe(linha)
    except HTTPException:
        raise
    finally:
        cursor.close()
        conn.close()


# =====================================================================
# RESUMO COM IA
# =====================================================================

class ResumoIASaida(BaseModel):
    id_materia: int
    resumo: str
    modelo: str


@app.post("/materias/{id_materia}/resumo-ia", response_model=ResumoIASaida)
def resumir_materia(id_materia: int):
    materia = obter_materia(id_materia)
    modelo = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite").strip()
    return {
        "id_materia": id_materia,
        "resumo": gerar_resumo(materia["titulo"], materia["corpo"], modelo),
        "modelo": modelo,
    }


# =====================================================================
# COMENTARIOS
# =====================================================================

@app.post("/materias/{id_materia}/comentarios", response_model=ComentarioSaida, status_code=201)
def criar_comentario(id_materia: int, comentario: ComentarioEntrada):
    """INSERT em COMENTARIO. O RETURNING traz o id gerado pela IDENTITY."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        id_novo = cursor.var(int)
        cursor.execute("""
            INSERT INTO comentario (id_usuario, id_materia, texto)
            VALUES (:id_usuario, :id_materia, :texto)
            RETURNING id_comentario INTO :id_novo
        """, {
            "id_usuario": comentario.id_usuario,
            "id_materia": id_materia,
            "texto": comentario.texto,
            "id_novo": id_novo,
        })
        conn.commit()

        valor = id_novo.getvalue()
        novo = int(valor[0] if isinstance(valor, list) else valor)

        cursor.execute("""
            SELECT id_comentario, id_usuario, id_materia, texto, criado_em
            FROM comentario
            WHERE id_comentario = :id
        """, {"id": novo})
        return linha_para_comentario(cursor.fetchone())
    except Exception as erro:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(erro))
    finally:
        cursor.close()
        conn.close()


@app.put("/comentarios/{id_comentario}", response_model=ComentarioSaida)
def editar_comentario(
    id_comentario: int,
    edicao: ComentarioEdicao,
    x_usuario_id: int = Header(..., alias="X-Usuario-Id"),
):
    """UPDATE em COMENTARIO, restrito ao autor: o id_usuario entra no WHERE,
    entao um usuario nao consegue editar comentario de outro."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE comentario
            SET texto = :texto
            WHERE id_comentario = :id
              AND id_usuario    = :uid
        """, {"texto": edicao.texto, "id": id_comentario, "uid": x_usuario_id})

        if cursor.rowcount == 0:
            conn.rollback()
            raise HTTPException(404, "Comentario nao encontrado ou nao pertence a este usuario.")
        conn.commit()

        cursor.execute("""
            SELECT id_comentario, id_usuario, id_materia, texto, criado_em
            FROM comentario
            WHERE id_comentario = :id
        """, {"id": id_comentario})
        return linha_para_comentario(cursor.fetchone())
    except HTTPException:
        raise
    except Exception as erro:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(erro))
    finally:
        cursor.close()
        conn.close()


@app.delete("/comentarios/{id_comentario}")
def apagar_comentario(
    id_comentario: int,
    x_usuario_id: int = Header(..., alias="X-Usuario-Id"),
):
    """DELETE em COMENTARIO, restrito ao autor."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM comentario WHERE id_comentario = :id AND id_usuario = :uid",
            {"id": id_comentario, "uid": x_usuario_id},
        )
        if cursor.rowcount == 0:
            conn.rollback()
            raise HTTPException(404, "Comentario nao encontrado ou nao pertence a este usuario.")
        conn.commit()
        return {"mensagem": "Comentario removido."}
    except HTTPException:
        raise
    except Exception as erro:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(erro))
    finally:
        cursor.close()
        conn.close()


# =====================================================================
# FAVORITOS
# =====================================================================

@app.get("/usuarios/{id_usuario}/favoritos", response_model=list[FavoritoSaida])
def favoritos_do_usuario(id_usuario: int):
    """Consulta 5.3 — INNER JOIN FAVORITO + MATERIA + EIXO, filtrado por
    usuario. O 1 fixo do doc vira o path parameter aqui."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT m.id_materia,
                   m.titulo,
                   e.nome      AS categoria,
                   f.criado_em AS favoritado_em
            FROM favorito f
            JOIN materia m ON m.id_materia = f.id_materia
            JOIN eixo    e ON e.id_eixo    = m.id_eixo
            WHERE f.id_usuario = :id_usuario
            ORDER BY f.criado_em DESC
        """, {"id_usuario": id_usuario})
        return [linha_para_favorito(l) for l in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()


@app.post("/favoritos", status_code=201)
def criar_favorito(favorito: FavoritoEntrada):
    """INSERT em FAVORITO (chave primaria composta id_usuario + id_materia)."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO favorito (id_usuario, id_materia) VALUES (:id_usuario, :id_materia)",
            {"id_usuario": favorito.id_usuario, "id_materia": favorito.id_materia},
        )
        conn.commit()
        return {"mensagem": "Favorito criado."}
    except Exception as erro:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(erro))
    finally:
        cursor.close()
        conn.close()


@app.delete("/favoritos/{id_usuario}/{id_materia}")
def apagar_favorito(id_usuario: int, id_materia: int):
    """DELETE em FAVORITO."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM favorito WHERE id_usuario = :id_usuario AND id_materia = :id_materia",
            {"id_usuario": id_usuario, "id_materia": id_materia},
        )
        if cursor.rowcount == 0:
            conn.rollback()
            raise HTTPException(404, "Favorito nao encontrado.")
        conn.commit()
        return {"mensagem": "Favorito removido."}
    except HTTPException:
        raise
    except Exception as erro:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(erro))
    finally:
        cursor.close()
        conn.close()


# =====================================================================
# USUARIOS
# =====================================================================

@app.get("/usuarios/mais-ativos", response_model=list[UsuarioAtivoSaida])
def usuarios_mais_ativos():
    """Consulta 5.4 — UNION ALL de comentario + favorito + avaliacao (esta
    ultima via FECHAMENTO, porque AVALIACAO nao tem id_usuario direto),
    depois COUNT + GROUP BY. Top 10."""
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT u.id_usuario,
                   u.nome,
                   COUNT(*) AS total_interacoes
            FROM usuario u
            JOIN (
                  SELECT id_usuario FROM comentario
                  UNION ALL
                  SELECT id_usuario FROM favorito
                  UNION ALL
                  SELECT f.id_usuario
                    FROM avaliacao a
                    JOIN fechamento f ON f.id_fechamento = a.id_fechamento
                 ) interacoes ON interacoes.id_usuario = u.id_usuario
            GROUP BY u.id_usuario, u.nome
            ORDER BY total_interacoes DESC
            FETCH FIRST 10 ROWS ONLY
        """)
        return [linha_para_usuario_ativo(l) for l in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()


# =====================================================================
# AVALIACOES
# =====================================================================

@app.put("/avaliacoes/{id_avaliacao}/moderar", response_model=AvaliacaoSaida)
def moderar_avaliacao(id_avaliacao: int, moderacao: ModeracaoEntrada):
    """UPDATE em AVALIACAO: status e moderada_por sao setados JUNTOS, mais
    editada_em = SYSDATE. A constraint ck_aval_moderacao exige os dois."""
    if moderacao.status not in ("APROVADA", "REJEITADA"):
        raise HTTPException(400, "status deve ser 'APROVADA' ou 'REJEITADA'.")

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE avaliacao
            SET status       = :status,
                moderada_por = :moderada_por,
                editada_em   = SYSDATE
            WHERE id_avaliacao = :id
        """, {"status": moderacao.status, "moderada_por": moderacao.moderada_por, "id": id_avaliacao})

        if cursor.rowcount == 0:
            conn.rollback()
            raise HTTPException(404, "Avaliacao nao encontrada.")
        conn.commit()

        cursor.execute("""
            SELECT id_avaliacao, id_fechamento, nota, texto, status, moderada_por, editada_em
            FROM avaliacao
            WHERE id_avaliacao = :id
        """, {"id": id_avaliacao})
        return linha_para_avaliacao(cursor.fetchone())
    except HTTPException:
        raise
    except Exception as erro:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(erro))
    finally:
        cursor.close()
        conn.close()
