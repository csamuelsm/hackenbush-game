# Jogo Hackenbush Web

## Funcionalidades

-   ✅ **Jogue contra o computador ou com um amigo (presencialmente)**
-   ✅ **Escolha entre a versão Normal e a versão Misère**
-   ✅ **Carregue seus próprios jogos a partir de arquivos SVG** - Faça
    o parse e jogue qualquer jogo de Hackenbush em SVG devidamente
    formatado (veja abaixo como criar seus próprios jogos)
-   ✅ **Suporte para vários idiomas** - Inglês, Português e Francês

## Criando seus próprios jogos

Você pode jogar [Hackenbush](https://hackenbush.vercel.app/) com jogos
criados por você! Basta desenhar seus jogos em um arquivo `.svg`
formatado corretamente conforme descrito abaixo. Para isso, você só
precisa de um bom software de design vetorial, como **Inkscape** ou
**Adobe Illustrator**.

Seus arquivos SVG devem seguir a seguinte estrutura:

### Requisitos principais para seu SVG:

-   **Canvas**: 600 x 600 com `viewBox="0 0 600 600"`
-   **Ground (chão)**: Deve haver um grupo com `id="ground"`
-   **Vértices**: Grupos com `id="vertex-01"`, `id="vertex-02"`, etc.
    (01--99)
-   **Arestas**: Grupos com `id="edge-{color}-{endpoint1}-{endpoint2}"`,
    onde:
    -   `{color}` é `red` ou `blue`
    -   `{endpoint1}` e `{endpoint2}` são IDs de vértices (por exemplo
        `"01"`, `"02"`, `"ground"`)
    -   Exemplo: `edge-red-02-33` (aresta vermelha do vértice 02 ao
        vértice 33)

### Tipos de aresta:

-   **Arestas vermelhas (Red edges)**: Apenas o jogador vermelho pode
    remover
-   **Arestas azuis (Blue edges)**: Apenas o jogador azul pode remover

Aqui está um exemplo de um arquivo SVG corretamente formatado:

``` xml
<svg viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Ground line (required) -->
  <g id="ground">
    <line x1="0" y1="550" x2="600" y2="550" stroke="#374151" stroke-width="4"/>
  </g>
  
  <!-- Vertices: id format "vertex-{xx}" -->
  <g id="vertex-01">
    <circle cx="200" cy="500" r="8" fill="black"/>
  </g>
  <g id="vertex-02">
    <circle cx="300" cy="500" r="8" fill="black"/>
  </g>
  
  <!-- Edges: id format "edge-{color}-{from}-{to}" -->
  <!-- Colors: red, blue -->
  <g id="edge-blue-ground-01">
    <line x1="200" y1="550" x2="200" y2="500" stroke="blue" stroke-width="9"/>
  </g>
  <g id="edge-red-01-02">
    <line x1="200" y1="500" x2="300" y2="500" stroke="red" stroke-width="9"/>
  </g>
  <g id="edge-red-02-03">
    <path d="M300,500 Q350,450 400,500" stroke="red" stroke-width="9" fill="none"/>
  </g>
  
  <!-- Other decorative elements (optional) -->
  <text x="300" y="50" text-anchor="middle">My Game</text>
</svg>
```

### Mais informações

-   Preste atenção em cada elemento `vertex`, `edge` ou `ground` no seu
    SVG. Todos eles devem ser **grupos** (mesmo que o grupo contenha
    apenas um único elemento). O parser de SVG procura por tags
    `<g></g>` com os IDs descritos acima, então isso é muito importante.
    Lembre-se de rotular corretamente os vértices e as arestas.
-   Você pode adicionar outros elementos que não sejam vértices ou
    arestas, como textos ou outras formas. Eles serão exibidos no jogo,
    mas **não serão interativos** para os jogadores.

### Dicas

1.  **Comece simples**: Comece com um grafo pequeno (5--10 arestas).
2.  **Teste o equilíbrio**: Garanta que ambos os jogadores tenham
    movimentos razoáveis.
3.  **Use curvas**: Caminhos (`paths`) em SVG tornam os jogos
    visualmente mais interessantes. Curvas são especialmente adequadas
    para representar arestas.
4.  **Adicione outros elementos**: Inclua novas formas ou cenários em
    seus jogos. Divirta-se!
5.  **Consulte o livro Winning Ways**: *Winning Ways for your
    Mathematical Plays* é um livro em que **Elwyn Berlekamp**, **John
    Conway** e **Richard Guy** desenvolvem grande parte da teoria por
    trás do Hackenbush e da Teoria de Jogos Combinatórios. Há muitos
    exemplos de jogos de Hackenbush e muito conteúdo interessante para
    aprender.
6.  **Compartilhe seus jogos**: Considere compartilhar os jogos que você
    criar com outras pessoas fazendo um **Pull Request** neste
    repositório ou abrindo uma **issue**. Sempre que possível, eu
    verificarei os jogos e os adicionarei à página principal do
    [Hackenbush](https://hackenbush.vercel.app).
7.  **Compartilhe o jogo com seus amigos**: Espalhe a palavra sobre
    Teoria de Jogos Combinatórios e Hackenbush entre seus amigos!!

## Créditos

Baseado no jogo Hackenbush de John Conway.
