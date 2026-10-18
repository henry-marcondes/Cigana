
## Decisão Validada nº 005
Cena é a unidade funcional da narrativa

Status: ✅ Aprovado

Definição

A Cena é a menor unidade funcional da narrativa e o coração da Plataforma de Livros Interativos.

É dentro dela que acontece toda a experiência do leitor.

Uma Cena é composta por quatro pilares fundamentais:
```text
Cena
│
├── Conteúdo
├── Recursos
├── Interações
└── Comportamentos
```
O Capítulo passa a ser um agrupador lógico de cenas.

O Livro passa a ser um agrupador lógico de capítulos.

Hierarquia do domínio :
```text
Plataforma
    │
    └── Biblioteca
            │
            └── Categoria
                    │
                    └── Livro
                            │
                            └── Capítulo
                                    │
                                    └── Cena
```
1. Conteúdo

Representa a narrativa apresentada ao leitor.

*Exemplos:*

Texto
Diálogos
Descrições
Narração

2. Recursos

São os elementos multimídia utilizados pela cena.

*Exemplos:*

Imagem
Áudio
Vídeo
Animações (futuro)
Modelos 3D (futuro)

3. Interações

São as ações realizadas pelo leitor.

*Exemplos:*

Escolha
Quiz
Puzzle
Hotspot
Formulário
Mini Game (futuro)
Entrada de Texto
Arrastar e Soltar
IA Conversacional (futuro)

4. Comportamentos

São ações executadas automaticamente pelo sistema durante o ciclo de vida da cena.

*Exemplos:*

Executar áudio ao entrar
Alterar variáveis da história
Desbloquear conteúdo
Registrar decisões
Atualizar progresso
Iniciar cronômetros
Disparar eventos
Executar animações
Alterar estado de personagens

