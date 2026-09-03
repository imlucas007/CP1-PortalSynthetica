from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, schemas
from .database import Base, engine, get_db
from .seed import seed_se_vazio

Base.metadata.create_all(bind=engine)

with Session(engine) as db:
    seed_se_vazio(db)

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
