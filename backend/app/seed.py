from datetime import datetime

from sqlalchemy.orm import Session

from . import models


def seed_se_vazio(db: Session):
    if db.query(models.Categoria).count() > 0:
        return

    avancos = models.Categoria(nome="Avanços Tecnológicos")
    cultura = models.Categoria(nome="IA na Arte e Cultura")
    db.add_all([avancos, cultura])
    db.flush()

    editorias = [
        models.Editoria(nome="Avanços", categoria_id=avancos.id),
        models.Editoria(nome="Cultura", categoria_id=cultura.id),
        models.Editoria(nome="Ética", categoria_id=cultura.id),
        models.Editoria(nome="Memória", categoria_id=cultura.id),
    ]
    db.add_all(editorias)
    db.flush()
    ed_por_nome = {e.nome: e for e in editorias}

    redacao = models.Usuario(nome="Redação", email="redacao@synthetica.app", papel="editor")
    db.add(redacao)
    db.flush()

    conteudos = [
        dict(
            titulo="A máquina que aprendeu a ver",
            chamada="Reconhecimento facial chegou às estações antes de chegar ao debate público.",
            corpo="O reconhecimento facial chegou às cidades brasileiras antes de qualquer marco regulatório.",
            editoria=ed_por_nome["Avanços"],
            pagina=8,
            tempo_leitura_min=6,
            palavra_chave="reconhecimento facial",
            status=models.StatusConteudo.PUBLICADO,
        ),
        dict(
            titulo="O futuro já foi imaginado antes",
            chamada="Das fitas de celuloide às redes neurais, a ficção científica traçou um mapa.",
            corpo="Mas o que acontece quando a imaginação se esgota antes da tecnologia?",
            editoria=ed_por_nome["Cultura"],
            pagina=16,
            tempo_leitura_min=9,
            palavra_chave="ficção científica",
            status=models.StatusConteudo.PUBLICADO,
        ),
        dict(
            titulo="Quem assina o algoritmo",
            chamada="Curadoria, autoria e responsabilidade editorial quando a máquina escreve a chamada.",
            corpo="Texto sobre ética e autoria em conteúdo gerado por IA.",
            editoria=ed_por_nome["Ética"],
            pagina=18,
            tempo_leitura_min=7,
            palavra_chave="autoria algorítmica",
            status=models.StatusConteudo.PUBLICADO,
        ),
        dict(
            titulo="O trabalho que virou fila",
            chamada="Plataformização e a promessa de autonomia que nunca chegou.",
            corpo="Rascunho sobre o futuro do trabalho.",
            editoria=ed_por_nome["Avanços"],
            pagina=24,
            tempo_leitura_min=8,
            palavra_chave="trabalho plataformizado",
            status=models.StatusConteudo.RASCUNHO,
        ),
        dict(
            titulo="Réplicas e replicantes",
            chamada="Como o cinema imaginou a consciência artificial antes de existir uma.",
            corpo="Ensaio sobre ficção científica e consciência artificial.",
            editoria=ed_por_nome["Cultura"],
            pagina=31,
            tempo_leitura_min=10,
            palavra_chave="replicantes",
            status=models.StatusConteudo.PUBLICADO,
        ),
        dict(
            titulo="A cidade que não esquece",
            chamada="Memória urbana e vigilância algorítmica.",
            corpo="Rascunho sobre memória e vigilância nas cidades inteligentes.",
            editoria=ed_por_nome["Memória"],
            pagina=None,
            tempo_leitura_min=5,
            palavra_chave="memória urbana",
            status=models.StatusConteudo.RASCUNHO,
        ),
    ]

    for c in conteudos:
        db.add(
            models.Conteudo(
                titulo=c["titulo"],
                chamada=c["chamada"],
                corpo=c["corpo"],
                editoria_id=c["editoria"].id,
                pagina=c["pagina"],
                tempo_leitura_min=c["tempo_leitura_min"],
                palavra_chave=c["palavra_chave"],
                status=c["status"],
                autor_id=redacao.id,
            )
        )

    db.commit()
