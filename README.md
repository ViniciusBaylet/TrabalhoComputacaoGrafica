# Trabalho de Computação Gráfica

Este repositório contém os trabalhos realizados na disciplina de Computação Gráfica (T1 = Trabalho1, T2 = Trabalho 2, T3 = Trabalho3), focando na criação de um protótipo de modelagem baseado em voxels. O objetivo principal é desenvolver um ambiente interativo onde os usuários possam adicionar e remover voxels, além de gerar ambientes de forma procedural.

## T1: Protótipo de Modelagem Baseado em Voxels

### Descrição
O primeiro trabalho consiste na criação de um protótipo de modelagem baseado em voxels, semelhante ao que é encontrado em jogos como Minecraft. O foco principal é desenvolver os elementos básicos do protótipo, incluindo a adição e remoção de voxels, bem como a capacidade de carregar e salvar grupos de voxels em arquivos.

### Funcionalidades
- **Tipos de Voxels**: Implementação de 5 tipos de voxels, cada um com uma cor diferente. As cores básicas são utilizadas nas camadas N1 e N2(N0 = chão, N1 = 1° camada, N2 = 2° camada), enquanto as outras três cores são usadas para representar árvores no ambiente.
- **Ambiente de Modelagem**: Um plano base de 10x10 onde os voxels podem ser inseridos. A movimentação no plano é feita com as setas do teclado, e a altura é ajustada com PgUp e PgDown.
- **Ações de Teclado**:
  - Inserir voxel: `Q`
  - Remover voxel: `E`
  - Próximo tipo de voxel: `.`
  - Tipo anterior de voxel: `,`
- **Gravação e Carregamento**: Possibilidade de salvar e carregar objetos modelados através de uma interface GUI, utilizando BLOB para salvar e FETCH para carregar.

### Ambiente de Execução
O ambiente de execução apresenta um mapa baseado em voxels, onde as árvores criadas no ambiente de modelagem são inseridas aleatoriamente. O controle de câmera é feito através de uma câmera de inspeção e uma câmera em primeira pessoa, alternando entre elas com a tecla `C`.

## T2: Geração Procedural

### Descrição
Neste trabalho, o ambiente é criado por geração procedural, utilizando funções de ruído do tipo simplexNoise para gerar a estrutura do ambiente.

### Funcionalidades
- **Ambiente Amplo**: O ambiente gerado é com um tamanho de 100x100 (comprimento x largura).
- **Névoa (Fog)**: Implementação de um sistema de névoa para limitar a visibilidade, com um slider para ajustar a distância do efeito.
- **Inserção de Árvores**: As árvores criadas no T1 são inseridas aleatoriamente no ambiente gerado.

### Personagem em Terceira Pessoa
Um personagem do Minecraft é utilizado em uma visão em terceira pessoa, com animações de andar e pular. A movimentação é controlada pelas teclas WASD e setas e o pulo é feito através da tecla "Space".

### Iluminação e Materiais
Implementação de luz direcional principal e luz ambiente para melhor qualidade visual, com sombras projetadas por todos os elementos do ambiente.

## T3: Jogabilidade em Primeira Pessoa

### Descrição
A principal alteração neste trabalho é a jogabilidade em primeira pessoa, permitindo uma interação mais imersiva com o ambiente.

### Funcionalidades
- **Interação com Blocos**: Implementação de um sistema de raycasting para interagir com os blocos do ambiente, permitindo a remoção de blocos.
- **Texturização**: Todos os blocos são texturizados, com atenção especial para blocos de terra/grama, água e copas de árvores.

### Elementos Adicionais
- **Efeitos especiais**: tela de carregamento e efeitos sonoros, incluindo música de fundo e efeitos ao remover blocos.


