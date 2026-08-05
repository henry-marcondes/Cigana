## DEC-001 — Separação entre Aplicação e Ambiente de Desenvolvimento

Status: ✅ Aprovada

Princípios
1. Backend sempre representa o ambiente de produção

O código da aplicação não conterá:

modo de teste;
reset de banco;
limpeza de dados;
dados fictícios (mock);
lógica específica para desenvolvimento.

O backend implementará apenas as regras reais da plataforma.

2. Administração do ambiente

Toda administração do ambiente ficará fora da aplicação.

database/
├── migrations/
├── seeds/
└── maintenance/

scripts/
├── start-dev.sh
├── stop-dev.sh
├── reset-dev.sh
├── backup.sh
└── restore.sh

3. Exclusão lógica

Todas as entidades de negócio utilizarão:

ativo = false

Nunca DELETE físico durante o funcionamento normal da plataforma.

4. Reset do ambiente

O reset será responsabilidade dos scripts de desenvolvimento.

O backend nem saberá que isso existe.

5. Produção

Quando publicarmos a plataforma:

os scripts continuarão existindo apenas para administração;
o backend será exatamente o mesmo que foi desenvolvido e testado;
não haverá necessidade de remover código de teste, pois ele nunca terá sido incluído.
