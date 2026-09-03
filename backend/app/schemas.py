from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from .models import StatusConteudo


class CategoriaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str


class EditoriaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    categoria_id: int


class UsuarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome: str
    papel: str


class ConteudoBase(BaseModel):
    titulo: str
    chamada: str = ""
    corpo: str = ""
    editoria_id: int
    pagina: Optional[int] = None
    tempo_leitura_min: int = 5
    palavra_chave: str = ""
    status: StatusConteudo = StatusConteudo.RASCUNHO


class ConteudoCreate(ConteudoBase):
    autor_id: Optional[int] = None


class ConteudoUpdate(BaseModel):
    titulo: Optional[str] = None
    chamada: Optional[str] = None
    corpo: Optional[str] = None
    editoria_id: Optional[int] = None
    pagina: Optional[int] = None
    tempo_leitura_min: Optional[int] = None
    palavra_chave: Optional[str] = None
    status: Optional[StatusConteudo] = None


class ConteudoOut(ConteudoBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    autor_id: int
    criado_em: datetime
    atualizado_em: datetime
    editoria: EditoriaOut
    autor: UsuarioOut
    total_comentarios: int = 0
    total_favoritos: int = 0
