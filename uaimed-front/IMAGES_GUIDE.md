# Guia de Imagens — Profissionais (UaiMED)

Este pequeno guia descreve como adicionar imagens de profissionais ao projeto e como referenciá-las no componente `FeaturedProfessionalsCarousel` (ou em outros componentes).

Onde colocar as imagens

- Coloque imagens locais em: `assets/images/profissionais/`.
  - Exemplo: `assets/images/profissionais/med-001.jpg`
  - Recomendo ter permissões e direitos para usar as imagens.

Formato e nomes

- Use nomes consistentes baseados no `id` do profissional (ex.: `med-001.jpg`, `med-002.png`).
- Evite espaços no nome. Use `-` ou `_`.

Tamanhos recomendados

- Miniaturas (avatar): 128x128 px (square). Use images com aspect ratio 1:1.
- Card/hero (opcional): 800x600 px para imagens maiores.
- Exporte em JPG (boa compressão) ou PNG (transparência quando necessário).

Retina / multiplicadores

- Para suporte a telas de maior densidade, você pode incluir versões `@2x`/`@3x`:
  - `med-001.jpg`, `med-001@2x.jpg`, `med-001@3x.jpg`

Como referenciar imagens locais no componente

- Para imagens locais (recomendado quando disponíveis), use `require` com caminho relativo:

```tsx
const item = {
  imagem: require("../../assets/images/profissionais/med-001.jpg"),
};
<Image source={item.imagem} style={styles.avatar} />;
```

Como usar imagens por URL (remoto)

- Se a imagem estiver hospedada (CDN/API), use uma URL no campo `imagem`:

```tsx
const item = { imagem: "https://cdn.exemplo.com/med-001.jpg" };
<Image source={{ uri: item.imagem }} style={styles.avatar} />;
```

Fallback / Placeholder

- O componente `FeaturedProfessionalsCarousel` já renderiza um placeholder (ícone) quando `imagem` for `null`.

Boas práticas

- Otimize imagens antes de subir ao repositório (compressão). Use ferramentas como `imagemagick`, `squoosh` ou serviços de CDN que entreguem imagens otimizadas.
- Prefira carregar imagens remotas via CDN para reduzir o tamanho do app.
- Nunca commit arquivos muito grandes ao repositório. Se precisar, adicione um script para baixar imagens em tempo de build.

Exemplo de dados (array):

```ts
const profissionais = [
  {
    id: "med-001",
    nome: "Dr. João",
    especialidade: "Cardiologia",
    imagem: require("../../assets/images/profissionais/med-001.jpg"),
  },
  {
    id: "med-002",
    nome: "Dra. Ana",
    especialidade: "Dermatologia",
    imagem: "https://cdn.exemplo.com/med-002.jpg",
  },
];
```

Onde aplicar no projeto

- `src/components/FeaturedProfessionalsCarousel.tsx` — componente usado na `HomeScreen`.
- Outros componentes podem reutilizar a mesma convenção (`item.imagem` como `require()` ou `uri`).

Se quiser, posso:

- Adicionar um pequeno script para verificar a existência das imagens locais e listar as ausentes.
- Criar assets de exemplo (pequenas imagens) para desenvolvimento local.

---

Data: 11 de Novembro de 2026
