# 🎨 Guia de Identidade Visual - Cartão VEM (Urbana-PE)

Este documento descreve a identidade visual e o design system extraídos da plataforma **Cartão VEM**.

---

## 📌 1. Visão Geral da Marca

- **Nome:** Cartão VEM
- **Tipografia Principal:** Poppins (Google Fonts)
- **Pacote de Ícones:** Remix Icon (`remixicon@4.5.0`) e Icomoon
- **Estilo Geral:** Cores contrastantes entre azul institucional e tons vibrantes de laranja/coral, cantos arredondados suaves (`6px` a `1rem`) e fundos claros/translúcidos (`#fafcff`).

---

## 🎨 2. Paleta de Cores Principais

### Cores da Marca (Brand Colors)
| Nome do Token | Valor HEX / RGB | Amostra | Descrição / Uso |
| :--- | :--- | :---: | :--- |
| `--color-primary` | `#0165AA` | 🟦 | Azul principal (Header, botões primários, destaque) |
| `--color-primary-active` | `#005288` | 🟦 | Azul escuro (Hover/Active em botões primários) |
| `--submenu-background` | `rgb(0, 73, 121)` | 🟦 | Fundo de submenus e navegação interna |
| `--color-secondary` | `#F67F1D` | 🟧 | Laranja secundário (Destaques de ação, badges) |
| `--color-terciary` | `#E75B32` | 🟧 | Laranja terracota / Coral (CTAs, Blip Chat, cards) |
| `--hover-terciary` | `rgba(231, 92, 50, 0.63)` | 🟧 | Hover em elementos terciários |
| `--hover-card` | `rgba(231, 92, 50, 0.64)` | 🟧 | Efeito hover em cartões interativos |
| `--bg-empresa` | `#F67F1D` | 🟧 | Identificador da seção Empresa |

### Cores Funcionais & Feedback
| Estado | Background | Texto / Ícone | Uso |
| :--- | :--- | :--- | :--- |
| **Sucesso / Validado** | `#C8FFD9` (`--background-validate`) | `#006400` (`--text-validate`) / `#74E07B` | Validação de cartão, recarga aprovada |
| **Recusado / Erro** | `#FFC8C8` (`--background-refused`) | `#DC2626` (`--text-refused`) / `#CC0000` | Transação recusada, erro de formulário |
| **Pendente / Alerta** | `#FFEEC8` (`--background-beggar`) | `#DC6026` (`--text-beggar`) / `#EBB42C` | Pendências, avisos intermediários |
| **Informativo** | `#CFF4FC` | `#0165AA` / `#17A2B8` | Dicas e notas informativas |
| **Desabilitado** | `#E9ECEF` | `#75798B` (`--color-disabled`) | Inputs e botões inativos |
| **Bordas de Inputs**| `#9CA1B6` (`--color-border-bottom-input`) | - | Linhas de base de campos de entrada |

---

## 🌈 3. Gradientes Oficiais

```css
/* Gradiente Principal Laranja/Coral (Botões e destaques de ação) */
--gradient-primary: linear-gradient(to right, #e75b32, #f67f1d 90%);

/* Gradiente Secundário Suave */
--gradient-secondary: linear-gradient(to right, #F0974E, #E67356);

/* Gradiente Azul Vertical (Headers/Banners) */
--gradient-primary-bottom: linear-gradient(to bottom, #0165aa, #4d90bd 90%);

/* Gradiente de Fundo do Usuário */
--gradient-bg-usuario: linear-gradient(260deg, rgba(231, 78, 39, .75) 34%, rgba(246, 127, 29, .75) 81%);
```

---

## 🔤 4. Tipografia

- **Família de Fontes:** `'Poppins', system-ui, -apple-system, sans-serif`
- **Link Google Fonts:**
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  ```

### Escala Tipográfica:
- **Títulos H1 (Desktop):** `2.25rem` (36px) - Peso `700` ou `600`
- **Títulos H1 (Mobile):** `1.5rem` (24px) - Peso `700`
- **Corpo do Texto (Normal):** `1rem` (16px) Desktop / `0.938rem` (15px) Mobile - Peso `400`
- **Legendas / Tiny:** `0.625rem` (10px) - Peso `400` / `500`

---

## 📐 5. Estrutura, Superfícies & Layout

- **Background da Página:** `#fafcff` com imagem de mapa/padrão translúcido fixo:
  - Desktop: `url(pattern-map-bg.png)`
  - Mobile: `url(pattern-map-mobile.png)`
- **Header Height:** `3rem` (48px)
- **Border Radius:**
  - Padrão (Cards / Containers): `6px` (`--border-radius`)
  - Inputs & Botões: `0.375rem` (6px) ou `.5rem` (8px)
  - Modais / Cards Grandes: `1rem` (16px)
  - Pílula / Badges: `50rem` (Pill)
- **Sombras (Box Shadow):**
  - Card Padrão: `0 0.5rem 1rem rgba(0, 0, 0, 0.15)`
  - Suave: `0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)`
  - Destaque: `0 1rem 3rem rgba(0, 0, 0, 0.175)`
- **Foco / Focus Ring:** `0 0 0 0.2rem #BFDBFE` (Azul translúcido)

---

## 📦 6. Arquivos Gerados neste Diretório

1. `guia-de-estilo.md`: Esta documentação completa.
2. `variables.css`: Variáveis CSS prontas para importar em qualquer projeto web.
3. `tokens.json`: Tokens em formato JSON para bibliotecas de UI, Figma ou Tailwind.
4. `tailwind.theme.js`: Extensão de tema para projetos utilizando Tailwind CSS.
