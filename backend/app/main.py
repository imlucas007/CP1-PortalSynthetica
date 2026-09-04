from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from . import auth, models, schemas
from .database import Base, engine, get_db
from .migracoes import aplicar_migracoes
from .seed import seed_cartas_se_vazio, seed_se_vazio

Base.metadata.create_all(bind=engine)
aplicar_migracoes(engine)

with Session(engine) as db:
    seed_se_vazio(db)
    seed_cartas_se_vazio(db)

app = FastAPI(title="Synthetica API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _com_contagens(db: Session, conteudo: models.Conteudo) -> models.Conteudo:
    conteudo.total_comentarios = (
        db.query(func.count(models.Comentario.id))
        .filter(models.Comentario.conteudo_id == conteudo.id)
        .scalar()
    )
    conteudo.total_favoritos = (
        db.query(func.count(models.Favorito.id))
        .filter(models.Favorito.conteudo_id == conteudo.id)
        .scalar()
    )
    return conteudo


@app.get("/")
def raiz():
    return {"servico": "Synthetica API", "status": "ok"}


def _usuario_autenticado(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
) -> models.Usuario:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Não autenticado")
    token = authorization.split(" ", 1)[1].strip()
    usuario = db.query(models.Usuario).filter(models.Usuario.token == token).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Sessão inválida")
    return usuario


@app.post("/auth/cadastro", response_model=schemas.SessaoOut, status_code=201)
def cadastrar(dados: schemas.CadastroIn, db: Session = Depends(get_db)):
    if db.query(models.Usuario).filter(models.Usuario.email == dados.email).first():
        raise HTTPException(status_code=409, detail="Já existe uma conta com esse e-mail")
    if len(dados.senha) < 8:
        raise HTTPException(status_code=400, detail="A senha precisa ter pelo menos 8 caracteres")

    prefs = dados.preferencias
    usuario = models.Usuario(
        nome=dados.email.split("@")[0].upper(),
        email=dados.email,
        papel="assinante",
        senha_hash=auth.gerar_hash_senha(dados.senha),
        token=auth.gerar_token(),
        proporcao_avancos=prefs.proporcao_avancos if prefs else None,
        temas=",".join(prefs.temas) if prefs and prefs.temas else None,
        perfil=prefs.perfil if prefs else None,
        tempo=prefs.tempo if prefs else None,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return schemas.SessaoOut(token=usuario.token, assinante=usuario)


@app.post("/auth/login", response_model=schemas.SessaoOut)
def entrar(dados: schemas.LoginIn, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == dados.email).first()
    if not usuario or not usuario.senha_hash or not auth.verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")
    usuario.token = auth.gerar_token()
    db.commit()
    db.refresh(usuario)
    return schemas.SessaoOut(token=usuario.token, assinante=usuario)


@app.get("/auth/eu", response_model=schemas.AssinanteOut)
def eu(usuario: models.Usuario = Depends(_usuario_autenticado)):
    return usuario


@app.patch("/auth/preferencias", response_model=schemas.AssinanteOut)
def atualizar_preferencias(
    dados: schemas.PreferenciasOnboarding,
    usuario: models.Usuario = Depends(_usuario_autenticado),
    db: Session = Depends(get_db),
):
    if dados.proporcao_avancos is not None:
        usuario.proporcao_avancos = dados.proporcao_avancos
    if dados.temas is not None:
        usuario.temas = ",".join(dados.temas)
    if dados.perfil is not None:
        usuario.perfil = dados.perfil
    if dados.tempo is not None:
        usuario.tempo = dados.tempo
    db.commit()
    db.refresh(usuario)
    return usuario


@app.delete("/auth/preferencias/{campo}", response_model=schemas.AssinanteOut)
def apagar_sinal(
    campo: str,
    usuario: models.Usuario = Depends(_usuario_autenticado),
    db: Session = Depends(get_db),
):
    campos_validos = {"proporcao_avancos", "temas", "perfil", "tempo"}
    if campo not in campos_validos:
        raise HTTPException(status_code=400, detail="Sinal desconhecido")
    setattr(usuario, campo, None)
    db.commit()
    db.refresh(usuario)
    return usuario


@app.get("/categorias", response_model=list[schemas.CategoriaOut])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(models.Categoria).all()


@app.get("/editorias", response_model=list[schemas.EditoriaOut])
def listar_editorias(db: Session = Depends(get_db)):
    return db.query(models.Editoria).all()


@app.get("/conteudos", response_model=list[schemas.ConteudoOut])
def listar_conteudos(
    db: Session = Depends(get_db),
    busca: Optional[str] = Query(None, description="Filtra por título"),
    editoria: Optional[str] = Query(None, description="AVANÇOS, CULTURA, ÉTICA, MEMÓRIA"),
    status_: Optional[models.StatusConteudo] = Query(None, alias="status"),
):
    query = db.query(models.Conteudo)
    if busca:
        query = query.filter(models.Conteudo.titulo.ilike(f"%{busca}%"))
    if editoria:
        query = query.join(models.Editoria).filter(
            func.lower(models.Editoria.nome) == editoria.lower()
        )
    if status_:
        query = query.filter(models.Conteudo.status == status_)
    itens = query.order_by(models.Conteudo.atualizado_em.desc()).all()
    return [_com_contagens(db, c) for c in itens]


@app.get("/conteudos/{conteudo_id}", response_model=schemas.ConteudoOut)
def obter_conteudo(conteudo_id: int, db: Session = Depends(get_db)):
    conteudo = db.get(models.Conteudo, conteudo_id)
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    return _com_contagens(db, conteudo)


@app.post("/conteudos", response_model=schemas.ConteudoOut, status_code=201)
def criar_conteudo(dados: schemas.ConteudoCreate, db: Session = Depends(get_db)):
    editoria = db.get(models.Editoria, dados.editoria_id)
    if not editoria:
        raise HTTPException(status_code=400, detail="Editoria inválida")

    autor_id = dados.autor_id
    if not autor_id:
        primeiro_usuario = db.query(models.Usuario).first()
        autor_id = primeiro_usuario.id if primeiro_usuario else None
    if not autor_id:
        raise HTTPException(status_code=400, detail="Nenhum usuário disponível como autor")

    conteudo = models.Conteudo(
        titulo=dados.titulo,
        chamada=dados.chamada,
        corpo=dados.corpo,
        editoria_id=dados.editoria_id,
        pagina=dados.pagina,
        tempo_leitura_min=dados.tempo_leitura_min,
        palavra_chave=dados.palavra_chave,
        status=dados.status,
        autor_id=autor_id,
    )
    db.add(conteudo)
    db.commit()
    db.refresh(conteudo)
    return _com_contagens(db, conteudo)


@app.put("/conteudos/{conteudo_id}", response_model=schemas.ConteudoOut)
@app.patch("/conteudos/{conteudo_id}", response_model=schemas.ConteudoOut)
def atualizar_conteudo(
    conteudo_id: int, dados: schemas.ConteudoUpdate, db: Session = Depends(get_db)
):
    conteudo = db.get(models.Conteudo, conteudo_id)
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")

    if dados.editoria_id is not None:
        editoria = db.get(models.Editoria, dados.editoria_id)
        if not editoria:
            raise HTTPException(status_code=400, detail="Editoria inválida")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(conteudo, campo, valor)

    db.commit()
    db.refresh(conteudo)
    return _com_contagens(db, conteudo)


@app.delete("/conteudos/{conteudo_id}", status_code=204)
def excluir_conteudo(conteudo_id: int, db: Session = Depends(get_db)):
    conteudo = db.get(models.Conteudo, conteudo_id)
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    db.delete(conteudo)
    db.commit()
    return None


@app.get("/cartas", response_model=list[schemas.CartaOut])
def listar_cartas(
    db: Session = Depends(get_db),
    status_: Optional[models.StatusCarta] = Query(None, alias="status"),
    busca: Optional[str] = Query(None, description="Busca por assinante ou trecho da carta"),
):
    query = db.query(models.Carta)
    if status_:
        query = query.filter(models.Carta.status == status_)
    if busca:
        termo = f"%{busca}%"
        query = query.filter(
            (models.Carta.assinante_nome.ilike(termo)) | (models.Carta.texto.ilike(termo))
        )
    return query.order_by(models.Carta.criado_em.desc()).all()


@app.patch("/cartas/{carta_id}", response_model=schemas.CartaOut)
def atualizar_carta(carta_id: int, dados: schemas.CartaUpdate, db: Session = Depends(get_db)):
    carta = db.get(models.Carta, carta_id)
    if not carta:
        raise HTTPException(status_code=404, detail="Carta não encontrada")
    carta.status = dados.status
    db.commit()
    db.refresh(carta)
    return carta
