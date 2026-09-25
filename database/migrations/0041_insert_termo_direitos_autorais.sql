-- =====================================================
-- Migration: 0041_insert_termo_direitos_autorais.sql
-- Descrição : Cadastro do Termo de Autorização para
--             Publicação e Disponibilização de Obra
--             na Plataforma Leitura - versão 1.0
-- Projeto   : Plataforma Cigana
-- PostgreSQL: 16+
-- =====================================================

BEGIN;

INSERT INTO contratos (
    tipo,
    codigo,
    nome,
    descricao
)
VALUES (
    'DIREITOS_AUTORAIS',
    'TERMO_AUTORIZACAO_PUBLICACAO',
    'Termo de Autorização para Publicação e Disponibilização de Obra na Plataforma Leitura',
    'Termo de autorização para publicação e disponibilização de obra na Plataforma Leitura.'
);

INSERT INTO contrato_versoes (
    contrato_id,
    versao,
    titulo,
    conteudo,
    status,
    publicado_em
)
SELECT
    id,
    '1.0',
    'Termo de Autorização para Publicação e Disponibilização de Obra na Plataforma Leitura',
    $TERMO$
# TERMO DE AUTORIZAÇÃO PARA PUBLICAÇÃO E DISPONIBILIZAÇÃO DE OBRA NA PLATAFORMA LEITURA

**Versão 1.0**

Pelo presente Termo de Autorização, de um lado:

**PLATAFORMA LEITURA**, doravante denominada simplesmente **PLATAFORMA**, responsável pela disponibilização de obras literárias em ambiente digital e interativo;

e, de outro lado, o(a) **AUTOR(A)/TITULAR**, devidamente identificado(a) no cadastro da Plataforma e no processo de publicação da obra;

têm entre si estabelecidas as seguintes condições para autorização de publicação e disponibilização de obra na Plataforma.

---

## 1. IDENTIFICAÇÃO DA OBRA

A presente autorização refere-se exclusivamente à obra identificada no sistema da Plataforma no momento do aceite deste Termo, contendo, conforme aplicável:

* título da obra;
* subtítulo;
* descrição ou sinopse;
* idioma;
* classificação indicativa;
* categoria;
* autores e demais titulares informados;
* capítulos, cenas e conteúdos integrantes da obra;
* demais informações registradas no Editor da Plataforma.

A autorização concedida por este Termo estará vinculada à obra específica identificada no sistema e não se estenderá automaticamente a outras obras do(a) AUTOR(A)/TITULAR.

---

## 2. DECLARAÇÃO DE AUTORIA E TITULARIDADE

O(A) AUTOR(A)/TITULAR declara, sob sua responsabilidade, que:

I. possui os direitos necessários para autorizar a publicação e disponibilização da obra na Plataforma;

II. as informações fornecidas à Plataforma sobre autoria, coautoria, titularidade e participação de terceiros são verdadeiras;

III. obteve, quando necessário, as autorizações dos demais autores, coautores, titulares ou terceiros que detenham direitos sobre qualquer conteúdo integrante da obra;

IV. a publicação da obra na Plataforma não viola, de forma consciente, direitos autorais, direitos de imagem, direitos de personalidade, marcas, obras protegidas ou quaisquer outros direitos de terceiros;

V. responsabiliza-se pelas informações e conteúdos inseridos por meio do Editor da Plataforma.

A Plataforma poderá solicitar informações ou documentos complementares quando houver necessidade razoável de verificar a titularidade ou autorização relacionada à obra.

---

## 3. AUSÊNCIA DE TRANSFERÊNCIA DA AUTORIA OU TITULARIDADE

Este Termo **não constitui cessão da autoria ou transferência da titularidade da obra para a Plataforma**.

A autoria, os direitos patrimoniais e demais direitos pertencentes ao(à) AUTOR(A)/TITULAR permanecem sob sua titularidade, observados os direitos eventualmente pertencentes a coautores, terceiros ou outros titulares legitimamente envolvidos na obra.

A Plataforma recebe somente as autorizações necessárias para executar as atividades expressamente previstas neste Termo.

---

## 4. AUTORIZAÇÃO DE USO DA OBRA

O(A) AUTOR(A)/TITULAR autoriza a Plataforma, de forma **não exclusiva**, durante o prazo estabelecido neste Termo, a utilizar a obra na medida necessária para:

I. armazenar os arquivos e informações que compõem a obra;

II. processar tecnicamente os conteúdos para funcionamento da Plataforma;

III. reproduzir tecnicamente a obra nos servidores e sistemas necessários ao seu funcionamento;

IV. disponibilizar a obra aos usuários autorizados da Plataforma;

V. apresentar a obra em sua interface de leitura;

VI. disponibilizar capítulos, cenas, textos, imagens, áudios, vídeos e demais elementos integrantes da obra conforme sua estrutura;

VII. realizar adaptações técnicas de formato, resolução, codificação ou organização necessárias ao funcionamento dos dispositivos e sistemas utilizados para acesso à Plataforma;

VIII. realizar cópias técnicas de segurança e contingência necessárias à operação da Plataforma;

IX. utilizar informações e elementos da obra para sua identificação, organização, catalogação e apresentação dentro da Plataforma.

A autorização acima não permite à Plataforma alterar a autoria da obra ou atribuir a terceiros a titularidade que pertença ao(à) AUTOR(A)/TITULAR.

---

## 5. NATUREZA INTERATIVA DA PLATAFORMA

O(A) AUTOR(A)/TITULAR declara estar ciente de que a Plataforma poderá disponibilizar obras em formato **interativo**.

A obra poderá conter, entre outros elementos:

* textos;
* capítulos;
* cenas;
* imagens;
* áudios;
* vídeos;
* escolhas realizadas pelo leitor;
* caminhos narrativos alternativos;
* links ou referências internas;
* outros elementos digitais compatíveis com a experiência de leitura.

A organização desses elementos poderá resultar em uma experiência de leitura diferente daquela proporcionada por uma publicação impressa ou por um arquivo digital convencional.

A Plataforma poderá executar tecnicamente a estrutura interativa definida pelo(a) AUTOR(A)/TITULAR por meio do Editor.

---

## 6. DISPONIBILIZAÇÃO DA OBRA

A obra será disponibilizada por meio da Plataforma **Leitura**, em ambiente digital e, salvo disposição específica em contrário, destinada à leitura online.

A autorização prevista neste Termo não implica obrigação da Plataforma de disponibilizar a obra em formato para download, impressão ou distribuição de arquivos aos usuários.

A Plataforma poderá adotar mecanismos técnicos destinados a reduzir cópias, extrações ou usos não autorizados do conteúdo, sem garantia absoluta de impedir práticas realizadas por terceiros mediante recursos externos à Plataforma.

---

## 7. ACESSO DOS USUÁRIOS

O acesso à obra pelos usuários ocorrerá de acordo com as regras, planos, condições comerciais, classificações indicativas e demais políticas da Plataforma.

A Plataforma poderá estabelecer mecanismos de controle de acesso, inclusive:

* cadastro de usuário;
* autenticação;
* classificação indicativa;
* restrições de idade;
* planos de acesso;
* disponibilidade pública ou privada;
* permissões específicas;
* outras medidas necessárias ao funcionamento da Plataforma.

Essas condições não representam transferência dos direitos da obra aos usuários.

O usuário terá apenas o direito de acessar a obra nas condições oferecidas pela Plataforma.

---

## 8. MODELOS DE ACESSO E REMUNERAÇÃO

A Plataforma Leitura poderá disponibilizar as Obras por diferentes modalidades de acesso, incluindo acesso por assinatura da Plataforma e acesso individual à Obra por período determinado.

As condições específicas de remuneração serão estabelecidas pela Plataforma de acordo com o modelo comercial aplicável a cada modalidade.

### 8.1. Acesso por assinatura da Plataforma

O usuário poderá contratar uma assinatura da Plataforma Leitura que lhe permitirá acessar as Obras disponibilizadas no catálogo, de acordo com as condições do plano contratado.

A assinatura não representa aquisição individual das Obras nem transferência de quaisquer direitos sobre elas.

A remuneração do(a) AUTOR(A)/TITULAR, quando aplicável, estará vinculada ao modelo de distribuição de receitas adotado pela Plataforma para essa modalidade.

Para fins de apuração da remuneração, a Plataforma poderá utilizar os registros de **progresso de leitura** realizados pelo sistema.

Uma vez iniciada a leitura de uma Obra por determinado usuário, o sistema poderá registrar seu progresso de leitura até a conclusão da leitura da Obra.

A leitura concluída pelo usuário poderá gerar remuneração ao(à) AUTOR(A)/TITULAR conforme os critérios comerciais estabelecidos pela Plataforma.

A **releitura da mesma Obra pelo mesmo usuário não gerará nova remuneração ao(à) AUTOR(A)/TITULAR**, salvo se regra comercial específica estabelecer condição diferente.

Os percentuais, valores, critérios de cálculo e demais parâmetros financeiros serão definidos nas condições comerciais aplicáveis e poderão ser implementados ou atualizados pela Plataforma de acordo com seu modelo de negócio.

### 8.2. Acesso individual à Obra

A Plataforma poderá oferecer ao usuário acesso individual a uma determinada Obra, independentemente da contratação de assinatura da Plataforma.

O acesso individual poderá ser contratado por períodos determinados, incluindo:

* 30 (trinta) dias;
* 60 (sessenta) dias;
* 90 (noventa) dias;

ou outros períodos que venham a ser disponibilizados pela Plataforma.

O Leitor que contratar o acesso individual terá direito de acessar a Obra durante todo o período contratado, observadas as condições aplicáveis à modalidade adquirida.

O acesso individual não representa aquisição definitiva da Obra, cessão de direitos autorais ou transferência de titularidade.

### 8.3. Remuneração do acesso individual

Nas contratações de acesso individual pago, a remuneração do(a) AUTOR(A)/TITULAR poderá ser composta por:

I. um percentual fixo incidente sobre a receita ou valor correspondente à contratação; e

II. um componente relacionado ao progresso de leitura da Obra.

Os percentuais, valores, critérios de cálculo, deduções, periodicidade de apuração e condições de pagamento serão definidos nas condições comerciais aplicáveis.

A Plataforma poderá alterar ou aprimorar os critérios de remuneração de acordo com a evolução de seu modelo comercial, observados os direitos já constituídos.

### 8.4. Registros de leitura

A Plataforma poderá utilizar seus registros técnicos para determinar o início, andamento e conclusão da leitura das Obras pelos usuários.

Os registros de progresso de leitura poderão ser utilizados para fins de:

* apuração de remuneração;
* análise de utilização das Obras;
* estatísticas;
* melhoria da experiência de leitura;
* funcionamento dos mecanismos da Plataforma.

A Plataforma poderá adotar mecanismos técnicos destinados a evitar duplicidade de remuneração decorrente de releituras da mesma Obra pelo mesmo usuário.

### 8.5. Armazenamento de conteúdo

A Plataforma poderá disponibilizar ao(à) AUTOR(A)/TITULAR uma franquia de armazenamento destinada aos conteúdos integrantes de suas Obras.

Essa franquia poderá ser utilizada para armazenar, entre outros:

* textos;
* imagens;
* áudios;
* vídeos;
* demais arquivos necessários à composição das Obras.

O limite de armazenamento, atualmente previsto como franquia inicial da Plataforma, será definido nas condições comerciais aplicáveis.

A utilização de espaço de armazenamento superior à franquia disponibilizada poderá estar sujeita à cobrança adicional, de acordo com as regras de armazenamento vigentes na Plataforma.

Os valores, limites, modalidades e condições para armazenamento adicional serão definidos pela Plataforma em suas condições comerciais e poderão ser atualizados conforme a infraestrutura de armazenamento utilizada pela Plataforma.

### 8.6. Ausência de garantia de remuneração mínima

A disponibilização de uma Obra na Plataforma não representa garantia de número mínimo de leitores, leituras, acessos, vendas ou remuneração.

A remuneração dependerá dos critérios aplicáveis à modalidade de acesso utilizada pelos usuários e dos registros efetivamente apurados pela Plataforma.

Nenhum valor mínimo de remuneração será devido exclusivamente pelo fato de a Obra permanecer cadastrada ou disponível na Plataforma, salvo condição comercial expressamente estabelecida em sentido contrário.

---

## 9. NÃO EXCLUSIVIDADE

A autorização concedida por este Termo é **não exclusiva**.

O(A) AUTOR(A)/TITULAR permanecerá livre para:

I. publicar a obra por conta própria;

II. disponibilizar a obra em outras plataformas;

III. celebrar contratos com outras empresas ou serviços;

IV. explorar comercialmente a obra por outros meios;

V. publicar versões impressas, digitais ou outras formas de apresentação da obra,

desde que tais atividades não impeçam o cumprimento das obrigações expressamente assumidas perante a Plataforma.

A Plataforma não poderá impedir o(a) AUTOR(A)/TITULAR de explorar a obra em outros meios exclusivamente em razão deste Termo.

---

## 10. PRAZO DA AUTORIZAÇÃO

A autorização concedida por este Termo terá início na data do aceite eletrônico e permanecerá válida enquanto a obra estiver vinculada à Plataforma, salvo encerramento da autorização conforme as disposições deste Termo.

O(A) AUTOR(A)/TITULAR poderá solicitar a retirada da obra da disponibilização pública observadas as condições estabelecidas neste Termo.

A existência de obrigações pendentes, valores devidos, registros financeiros, obrigações legais ou outras situações que exijam manutenção de informações não será automaticamente eliminada pela retirada da obra.

---

## 11. RETIRADA DA OBRA PELO(A) AUTOR(A)/TITULAR 

O(A) AUTOR(A)/TITULAR poderá solicitar a retirada de sua Obra da Plataforma.

A solicitação será submetida à análise e aprovação pela Plataforma, observadas as condições deste Termo e as regras operacionais aplicáveis.

A simples solicitação de retirada não produzirá, por si só, a indisponibilidade imediata da Obra.

Após a aprovação do pedido de retirada, a Obra será retirada da oferta pública da Biblioteca da Plataforma e ficará indisponível para novos acessos individuais, novas compras ou novas disponibilizações, a partir da data definida pela Plataforma para o encerramento de sua oferta.

A retirada da oferta não prejudicará os direitos de acesso já adquiridos pelos Leitores antes da aprovação do pedido de retirada.

## 11.1. ACESSOS INDIVIDUAIS JÁ CONTRATADOS

Quando um Leitor tiver contratado acesso individual à Obra antes da aprovação do pedido de retirada, seu acesso permanecerá válido até o término do período contratado.

Assim:

I. um acesso de 30 (trinta) dias permanecerá disponível até o término dos 30 (trinta) dias contratados;

II. um acesso de 60 (sessenta) dias permanecerá disponível até o término dos 60 (sessenta) dias contratados;

III. um acesso de 90 (noventa) dias permanecerá disponível até o término dos 90 (noventa) dias contratados.

A retirada da Obra do catálogo não converterá automaticamente um acesso contratado em acesso permanente nem ampliará o período originalmente adquirido pelo Leitor.

Após o término da data final de disponibilidade da Obra de acesso individual, o acesso à Obra será encerrado, salvo se o Leitor possuir outra forma válida de acesso à Obra.

## 11.2. ACESSO POR ASSINATURA

Quando a Obra estiver disponível por meio da assinatura da Plataforma, os usuários assinantes poderão continuar acessando a Obra durante o período definido para sua retirada.

A Plataforma deverá informar, de forma adequada, a data a partir da qual a Obra deixará de estar disponível para os usuários.

Após o encerramento da disponibilidade da Obra, o acesso por assinatura àquela Obra será encerrado, independentemente da validade da assinatura geral do usuário.

## 11.3. BLOQUEIO DE NOVOS ACESSOS

Após a aprovação do pedido de retirada e o início do período de encerramento da oferta, a Obra não deverá ser disponibilizada para:

novos acessos individuais;
novas compras de acesso individual;
inclusão de novos usuários com acesso específico à Obra;
novas ofertas comerciais da Obra.

Os acessos regularmente adquiridos antes da retirada permanecerão válidos até suas respectivas datas de vencimento, conforme previsto neste Termo.

## 11.4. COMUNICAÇÃO AOS USUÁRIOS

Quando a Obra estiver programada para retirada, a Plataforma poderá comunicar os usuários que possuam acesso ou tenham realizado leitura da Obra.

A comunicação poderá informar:

título da Obra;
autor(a);
motivo ou informação geral sobre a retirada, quando aplicável;
data limite de disponibilidade;
orientação para conclusão da leitura;
demais informações necessárias.

A Plataforma poderá utilizar notificações internas, mensagens eletrônicas ou outros meios disponíveis, observada a legislação aplicável.

A finalidade da comunicação será garantir transparência aos usuários e permitir que os Leitores tenham conhecimento prévio do encerramento da disponibilidade da Obra.

## 11.5. DATA FINAL DE DISPONIBILIDADE DA OBRA NA PLATAFORMA

Após a aprovação do pedido de retirada, a Plataforma estabelecerá a data final de disponibilidade da Obra na Plataforma, observando os acessos já regularmente concedidos aos usuários.

A Obra permanecerá disponível para os usuários que já possuírem direito de acesso até o término dos respectivos períodos de validade.

No caso de acessos individuais contratados anteriormente, a data final de disponibilidade da Obra na Plataforma deverá considerar o término do último acesso individual regularmente adquirido antes da retirada, de modo a preservar o período de acesso contratado pelo respectivo Leitor.

Após o término do último acesso individual válido, a Obra poderá ser integralmente retirada da Biblioteca e deixará de estar disponível para leitura pelos usuários, ressalvadas as informações e registros que devam ser mantidos pela Plataforma por razões legais, administrativas, financeiras, de segurança ou exercício regular de direitos.

A partir da aprovação do pedido de retirada, não serão realizados novos contratos ou vendas de acesso individual à Obra.

A data final de disponibilidade será, sempre que possível, informada ao(à) AUTOR(A)/TITULAR e aos usuários que possuam acesso à Obra.

## 11.6. REMUNERAÇÕES PENDENTES

A retirada da Obra não prejudicará o direito do(a) AUTOR(A)/TITULAR aos valores que tenham sido regularmente gerados antes do encerramento da disponibilização, conforme as regras de remuneração aplicáveis.

A Plataforma poderá concluir a apuração de valores, estornos, cancelamentos, chargebacks ou outras ocorrências relacionadas aos acessos realizados antes da retirada.

A retirada da Obra também não extinguirá obrigações financeiras já constituídas entre as partes.

---

## 12. SUSPENSÃO OU REMOÇÃO PELA PLATAFORMA

A Plataforma poderá suspender temporariamente ou remover a disponibilização da obra quando houver motivo relevante, incluindo:

I. suspeita de violação de direitos de terceiros;

II. denúncia fundamentada relacionada à obra;

III. determinação judicial ou administrativa;

IV. violação deste Termo;

V. utilização de conteúdo ilícito;

VI. risco à segurança da Plataforma ou de seus usuários;

VII. necessidade técnica ou operacional relevante;

VIII. descumprimento das políticas aplicáveis à Plataforma.

Sempre que razoavelmente possível, a Plataforma poderá comunicar o(a) AUTOR(A)/TITULAR sobre a suspensão ou remoção e, quando aplicável, permitir esclarecimentos ou correções.

A suspensão ou remoção não representa, por si só, reconhecimento definitivo de responsabilidade do(a) AUTOR(A)/TITULAR ou da Plataforma.

---

## 13. CONTEÚDO INSERIDO PELO(A) AUTOR(A)/TITULAR

O conteúdo inserido no Editor deverá respeitar a legislação aplicável e as regras da Plataforma.

O(A) AUTOR(A)/TITULAR não deverá inserir conteúdo que:

* viole direitos autorais de terceiros;
* utilize imagem ou voz de terceiros sem autorização quando necessária;
* infrinja direitos de personalidade;
* contenha material cuja publicação seja proibida por lei;
* utilize marcas ou outros elementos protegidos sem autorização quando necessária;
* viole as regras de classificação indicativa;
* contenha informações falsas sobre autoria ou titularidade.

A Plataforma poderá estabelecer regras específicas de conteúdo, segurança, classificação e publicação.

---

## 14. DIREITOS DE TERCEIROS

Caso a obra contenha elementos pertencentes a terceiros, caberá ao(à) AUTOR(A)/TITULAR obter previamente as autorizações necessárias para sua utilização.

Isso poderá incluir, conforme o caso:

* fotografias;
* ilustrações;
* músicas;
* gravações;
* vídeos;
* textos de terceiros;
* personagens;
* marcas;
* nomes ou imagens de pessoas;
* outros materiais protegidos.

A Plataforma não assume a responsabilidade pela obtenção dessas autorizações quando o conteúdo tiver sido fornecido pelo(a) AUTOR(A)/TITULAR.

Caso terceiro apresente reclamação ou reivindicação relacionada ao conteúdo fornecido pelo(a) AUTOR(A)/TITULAR, a Plataforma poderá adotar as medidas necessárias para proteger seus usuários e seus serviços.

---

## 15. DIVULGAÇÃO DA OBRA

O(A) AUTOR(A)/TITULAR autoriza a Plataforma Leitura a divulgar, apresentar e promover a Obra e sua disponibilidade na Plataforma, utilizando informações e elementos relacionados à Obra, incluindo:

* título;
* nome do(a) autor(a);
* nome artístico, quando informado;
* capa;
* imagens de apresentação;
* sinopse;
* descrição;
* categoria;
* classificação indicativa;
* informações bibliográficas;
* pequenos trechos da Obra destinados à apresentação ou divulgação, quando aplicável.

A autorização de divulgação poderá abranger os canais de comunicação e divulgação utilizados pela Plataforma, incluindo, entre outros:

I. a própria Plataforma Leitura;

II. páginas e materiais institucionais da Plataforma;

III. campanhas publicitárias;

IV. mecanismos de comunicação eletrônica;

V. redes sociais;

VI. serviços de mensagens e comunicação digital;

VII. materiais promocionais impressos ou digitais;

VIII. outros meios de comunicação utilizados para divulgação da Plataforma e das obras nela disponibilizadas.

A divulgação poderá ocorrer, inclusive, em plataformas e redes sociais de terceiros, tais como **Facebook, Instagram, WhatsApp** e outras que venham a ser utilizadas pela Plataforma, respeitadas as regras e condições de utilização de cada serviço.

A autorização prevista nesta cláusula destina-se exclusivamente à divulgação, apresentação e promoção da Obra, de seu(sua) autor(a) e da Plataforma, não representando cessão da autoria ou transferência da titularidade dos direitos sobre a Obra.

### 15.1. DIVULGAÇÃO E MARKETING

A autorização para divulgação não constitui obrigação da Plataforma de realizar campanhas publicitárias, ações de marketing ou qualquer nível mínimo de divulgação específica da Obra.

A Plataforma poderá decidir, segundo seus critérios comerciais, editoriais, técnicos e de marketing, quais obras serão divulgadas, em quais canais, formatos, períodos e condições.

A Plataforma não garante número mínimo de visualizações, leitores, acessos, vendas, assinaturas, receita ou qualquer outro resultado decorrente das ações de divulgação.

O(A) AUTOR(A)/TITULAR poderá realizar, por sua própria iniciativa e responsabilidade, ações de divulgação e marketing da Obra em outros meios, desde que respeitados os direitos da Plataforma, deste Termo e de terceiros.

---

## 16. DADOS PESSOAIS

A Plataforma poderá tratar os dados pessoais fornecidos pelo(a) AUTOR(A)/TITULAR para finalidades relacionadas à criação e manutenção da conta, publicação da obra, execução deste Termo, pagamentos, comunicação, segurança, atendimento, cumprimento de obrigações legais e demais finalidades legítimas relacionadas ao funcionamento da Plataforma.

O tratamento de dados pessoais deverá observar a legislação aplicável, especialmente a **Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD)**.

Os dados pessoais não serão utilizados para finalidades incompatíveis com aquelas informadas ao titular ou permitidas pela legislação aplicável.

As informações necessárias para comprovação do aceite deste Termo poderão ser mantidas pelo período necessário ao cumprimento de obrigações legais, exercício regular de direitos ou outras hipóteses legalmente autorizadas.

---

## 17. RESPONSABILIDADE DO(A) AUTOR(A)/TITULAR

O(A) AUTOR(A)/TITULAR é responsável:

I. pela veracidade das informações fornecidas;

II. pela legitimidade dos conteúdos inseridos;

III. pela autoria e/ou titularidade declarada;

IV. pela obtenção das autorizações de terceiros que sejam necessárias;

V. pela manutenção de informações cadastrais atualizadas;

VI. pelo cumprimento das obrigações assumidas neste Termo.

Caso seja constatada violação de direitos de terceiros decorrente de conteúdo fornecido pelo(a) AUTOR(A)/TITULAR, poderão ser adotadas as medidas previstas neste Termo e na legislação aplicável.

---

## 18. RESPONSABILIDADE DA PLATAFORMA

A Plataforma será responsável pela manutenção dos serviços sob seu controle e pela disponibilização técnica da obra de acordo com suas condições de funcionamento.

A Plataforma não garante:

* disponibilidade ininterrupta do serviço;
* funcionamento permanente de todos os recursos;
* número mínimo de leitores;
* remuneração mínima;
* ausência absoluta de falhas técnicas;
* impossibilidade absoluta de cópia ou captura de conteúdo por terceiros.

A Plataforma poderá realizar manutenções, atualizações, alterações técnicas e melhorias necessárias ao funcionamento do serviço.

---

## 19. ALTERAÇÕES NA OBRA PELO(A) AUTOR(A)/TITULAR

O(A) AUTOR(A)/TITULAR poderá utilizar o Editor para modificar informações, capítulos, cenas e demais conteúdos da obra, conforme os recursos disponibilizados pela Plataforma.

Alterações realizadas posteriormente ao aceite deste Termo continuarão vinculadas à autorização originalmente concedida, desde que integrem a mesma obra.

A Plataforma poderá registrar versões, datas e informações técnicas das alterações para fins de segurança, histórico e funcionamento do serviço.

---

## 20. ALTERAÇÕES DESTE TERMO

A Plataforma poderá atualizar este Termo quando houver necessidade de adequação legal, regulatória, técnica ou operacional.

Quando uma alteração exigir novo aceite, o(a) AUTOR(A)/TITULAR será informado(a) e deverá realizar novo aceite para continuar utilizando as funcionalidades que dependam dessa concordância.

A versão do Termo aceita pelo(a) AUTOR(A)/TITULAR deverá permanecer registrada para fins de comprovação.

---

## 21. ACEITE ELETRÔNICO

O aceite deste Termo poderá ocorrer de forma eletrônica por meio da Plataforma.

Ao selecionar a opção de concordância e confirmar o procedimento, o(a) AUTOR(A)/TITULAR declara que:

I. leu o presente Termo;

II. compreendeu suas condições;

III. possui capacidade e legitimidade para realizar o aceite;

IV. declara verdadeiras as informações fornecidas;

V. concorda com as condições estabelecidas neste Termo.

A Plataforma poderá registrar, para fins de comprovação:

* identificação do usuário;
* identificação da obra;
* versão do Termo;
* data e hora do aceite;
* informações técnicas relacionadas ao aceite;
* demais dados necessários à demonstração da manifestação de vontade.

O registro eletrônico do aceite poderá ser utilizado como meio de comprovação da concordância com este Termo, observada a legislação aplicável.

---

## 22. AUSÊNCIA DE GARANTIA DE PUBLICAÇÃO IMEDIATA

O aceite deste Termo não obriga a Plataforma a disponibilizar imediatamente a obra ao público.

A publicação poderá depender de:

* conclusão do cadastro;
* preenchimento das informações obrigatórias;
* validações técnicas;
* classificação indicativa;
* análise de conteúdo, quando aplicável;
* cumprimento das regras da Plataforma;
* outras condições necessárias à publicação.

A obra poderá permanecer em estado de construção, revisão ou preparação dentro do Editor antes de sua disponibilização pública.

---

## 23. INDEPENDÊNCIA DAS DISPOSIÇÕES

Caso qualquer disposição deste Termo seja considerada inválida, ilegal ou inexequível, as demais disposições permanecerão válidas na medida permitida pela legislação aplicável.

As partes deverão buscar interpretar ou substituir a disposição afetada de modo a preservar, tanto quanto possível, sua finalidade original.

---

## 24. DISPOSIÇÕES FINAIS

Este Termo representa a autorização concedida pelo(a) AUTOR(A)/TITULAR à Plataforma exclusivamente nos limites aqui estabelecidos.

Nenhuma disposição deste Termo deverá ser interpretada como:

* transferência da autoria;
* transferência automática da titularidade da obra;
* cessão exclusiva de direitos;
* impedimento à publicação da obra em outros meios;
* autorização irrestrita para exploração da obra fora das finalidades previstas neste Termo.

A relação entre o(a) AUTOR(A)/TITULAR e a Plataforma será regida por este Termo, pelas condições comerciais eventualmente aplicáveis e pelas demais políticas da Plataforma, observada a legislação vigente.

---

## 25. FORO

Fica eleito o foro competente na forma da legislação aplicável para solução de eventuais controvérsias decorrentes deste Termo, respeitadas as regras legais de competência que eventualmente sejam aplicáveis.

---

# ACEITE

Ao confirmar eletronicamente o aceite deste Termo, o(a) AUTOR(A)/TITULAR declara que leu, compreendeu e concorda com todas as condições acima.

**Obra:** [identificação da obra]

**Autor(a)/Titular:** [identificação]

**Versão do Termo:** 1.0

**Data do aceite:** [data]

**Registro eletrônico:** [identificador do aceite]

**[ ] Li e concordo com o Termo de Autorização para Publicação e Disponibilização de Obra na Plataforma Leitura.**

**[ Confirmar aceite ]**
$TERMO$,
    'ATIVA',
    NOW()
FROM contratos
WHERE codigo = 'TERMO_AUTORIZACAO_PUBLICACAO';

COMMIT;
