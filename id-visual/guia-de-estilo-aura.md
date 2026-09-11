
Conversa com o Gemini
Crie um guia de estilo para identidade visual do meu site com esses dados.

Crie um guia de estilo para identidade visual do meu site com esses dados.





Os códigos RGB e Hex exatos utilizados para representar essa energia são:



Elemento da AuraCódigo HEXCódigo RGBPreto Profundo / Fundo#0B0A0A(11, 10, 10)Roxo Escuro (Transição)#360F5A(54, 15, 90)Roxo de Energia Intermediária#8129A9(129, 41, 169)Roxo Vivo / Brilho Elétrico#AB17EE(171, 23, 238)







Eu tenho esse modelo de exemplo



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

🔤 4. Tipografia
Família de Fontes: 'Inter', 'Space Grotesk', system-ui, sans-serif

Link Google Fonts:

HTML
<link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)">
<link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin>
<link href="[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@500;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@500;700&display=swap)" rel="stylesheet">
Escala Tipográfica:
Títulos H1 (Desktop): 2.5rem (40px) - Space Grotesk (Peso 700)

Títulos H1 (Mobile): 1.75rem (28px) - Space Grotesk (Peso 700)

Corpo do Texto (Normal): 1rem (16px) - Inter (Peso 400)

Legendas / Auxiliar: 0.75rem (12px) - Inter (Peso 400/500)

📐 5. Estrutura, Superfícies & Layout
Background da Página: #0B0A0A (Preto Profundo)

Superfícies de Cards: Background translúcido profundo, ou #121014 com borda sutil de #360F5A.

Border Radius:

Padrão (Cards / Containers): 8px (0.5rem)

Inputs & Botões: 6px (0.375rem)

Elementos circulares/Badges: 9999px (Pill)

Efeitos de Sombra e Brilho (Glow):

Glow Suave: 0 0 15px rgba(129, 41, 169, 0.3)

Glow Intenso (Hover em Botões): 0 0 20px rgba(171, 23, 238, 0.6)

Drop Shadow Padrão (Cards): 0 4px 12px rgba(0, 0, 0, 0.5)

Foco / Focus Ring: 0 0 0 2px #0B0A0A, 0 0 0 4px #AB17EE
"""

css_content = """/* variables.css - Aura Design System /
:root {
/ Brand Colors */
--aura-black: #0B0A0A;
--aura-purple-dark: #360F5A;
--aura-purple-mid: #8129A9;
--aura-purple-vivid: #AB17EE;

/* Functional Colors */
--color-success-bg: rgba(22, 163, 74, 0.2);
--color-success-text: #4ADE80;
--color-error-bg: rgba(220, 38, 38, 0.2);
--color-error-text: #F87171;
--color-warning-bg: rgba(217, 119, 6, 0.2);
--color-warning-text: #FBBF24;
--color-info-bg: rgba(37, 99, 235, 0.2);
--color-info-text: #60A5FA;
--color-disabled-bg: #1F1E24;
--color-disabled-text: #52525B;

/* Gradients */
--gradient-aura: linear-gradient(135deg, var(--aura-purple-vivid), var(--aura-purple-mid));
--gradient-deep: linear-gradient(180deg, var(--aura-purple-dark), var(--aura-black));
--gradient-glow: linear-gradient(90deg, var(--aura-purple-mid), var(--aura-purple-vivid), var(--aura-purple-mid));

/* Typography */
--font-family-body: 'Inter', system-ui, sans-serif;
--font-family-heading: 'Space Grotesk', system-ui, sans-serif;

/* Effects */
--glow-soft: 0 0 15px rgba(129, 41, 169, 0.3);
--glow-intense: 0 0 20px rgba(171, 23, 238, 0.6);
--shadow-card: 0 4px 12px rgba(0, 0, 0, 0.5);
}

body {
background-color: var(--aura-black);
color: #E4E4E7;
font-family: var(--font-family-body);
}
"""

json_content = """{
"colors": {
"aura": {
"black": "#0B0A0A",
"purple": {
"dark": "#360F5A",
"mid": "#8129A9",
"vivid": "#AB17EE"
}
},
"feedback": {
"success": { "bg": "rgba(22, 163, 74, 0.2)", "text": "#4ADE80" },
"error": { "bg": "rgba(220, 38, 38, 0.2)", "text": "#F87171" },
"warning": { "bg": "rgba(217, 119, 6, 0.2)", "text": "#FBBF24" },
"info": { "bg": "rgba(37, 99, 235, 0.2)", "text": "#60A5FA" }
}
},
"gradients": {
"aura": "linear-gradient(135deg, #AB17EE, #8129A9)",
"deep": "linear-gradient(180deg, #360F5A, #0B0A0A)"
},
"shadows": {
"glow-soft": "0 0 15px rgba(129, 41, 169, 0.3)",
"glow-intense": "0 0 20px rgba(171, 23, 238, 0.6)"
}
}"""

js_content = """/ tailwind.theme.js */
module.exports = {
theme: {
extend: {
colors: {
aura: {
black: '#0B0A0A',
purple: {
dark: '#360F5A',
mid: '#8129A9',
vivid: '#AB17EE',
}
}
},
backgroundImage: {
'gradient-aura': 'linear-gradient(135deg, #AB17EE, #8129A9)',
'gradient-deep': 'linear-gradient(180deg, #360F5A, #0B0A0A)',
'gradient-glow': 'linear-gradient(90deg, #8129A9, #AB17EE, #8129A9)',
},
boxShadow: {
'glow-soft': '0 0 15px rgba(129, 41, 169, 0.3)',
'glow-intense': '0 0 20px rgba(171, 23, 238, 0.6)',
},
fontFamily: {
sans: ['Inter', 'system-ui', 'sans-serif'],
display: ['Space Grotesk', 'system-ui', 'sans-serif'],
}
}
}
};
"""

with open('guia-de-estilo.md', 'w', encoding='utf-8') as f:
f.write(md_content)
with open('variables.css', 'w', encoding='utf-8') as f:
f.write(css_content)
with open('tokens.json', 'w', encoding='utf-8') as f:
f.write(json_content)
with open('tailwind.theme.js', 'w', encoding='utf-8') as f:
f.write(js_content)


Os seus arquivos para o novo guia de estilo baseado na paleta "Aura" estão prontos!

[file-tag: code-generated-file-01ed3112-cff9-4802-8d8f-ff1e4198fbae]
[file-tag: code-generated-file-c65ed099-c080-4e86-b2d3-4eada0cecfb6]
[file-tag: code-generated-file-df1b85b8-612f-4356-9641-3ddc552c2519]
[file-tag: code-generated-file-bc7a9da7-4d8a-4c99-b211-1222e7fec75f]

Eu adaptei o seu modelo original para acomodar a nova paleta de cores. Como as cores fornecidas refletem uma paleta escura (Preto profundo) e elétrica (tons de Roxo e Neon), eu estruturei os seguintes elementos no documento:

1. **Tema "Dark Mode First":** Adaptei a paleta para um fundo escuro constante (`#0B0A0A`) enquanto elementos interativos, bordas e botões utilizam os tons de roxo vívido e intermediário.
2. **Cores de Feedback:** Converti as cores de sucesso, erro, aviso e informação (verde, vermelho, amarelo e azul) para tons translúcidos com textos mais brilhantes, ideal para contrastar no fundo preto sem sobrecarregar a visão.
3. **Novos Gradientes:** Criei três gradientes (`--gradient-aura`, `--gradient-deep`, `--gradient-glow`) para aproveitar os efeitos elétricos e de "glow" sugeridos pelas cores.
4. **Arquivos Prontos para Uso:** Além do **Markdown** com as regras estéticas (`guia-de-estilo.md`), criei as variáveis em CSS puras (`variables.css`), a estrutura de design tokens (`tokens.json`) e o modelo para inserção em projetos baseados no Tailwind CSS (`tailwind.theme.js`). 

Se precisar ajustar qualquer sombra, opacidade ou estrutura de fonte, basta avisar!
Me envie tudo em um unico arquivo .md

🔤 4. Tipografia
Família de Fontes:

Títulos e Headings: 'Space Grotesk', system-ui, sans-serif

Corpo e Interface: 'Inter', system-ui, -apple-system, sans-serif

Importação Google Fonts:

HTML
<link rel="preconnect" href="[https://fonts.googleapis.com](https://fonts.googleapis.com)">
<link rel="preconnect" href="[https://fonts.gstatic.com](https://fonts.gstatic.com)" crossorigin>
<link href="[https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap](https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap)" rel="stylesheet">
Escala Tipográfica:
Display / Hero: 3.25rem (52px) — Peso 700 (Space Grotesk)

Títulos H1 (Desktop): 2.25rem (36px) — Peso 700 (Space Grotesk)

Títulos H1 (Mobile): 1.625rem (26px) — Peso 700 (Space Grotesk)

Títulos H2: 1.75rem (28px) — Peso 600 (Space Grotesk)

Títulos H3: 1.25rem (20px) — Peso 600 (Space Grotesk)

Corpo do Texto (Normal): 1rem (16px) — Peso 400 / Altura de linha 1.6 (Inter)

Texto Auxiliar / Small: 0.875rem (14px) — Peso 400 (Inter)

Legendas / Badges: 0.688rem (11px) — Peso 600 / Maiúsculas / Espaçamento entre letras 0.05em

📐 5. Estrutura, Superfícies & Layout
Canvas Principal (Background da Página): #0B0A0A

Superfície de Cartão (Card / Painéis): #131118 com borda 1px solid rgba(129, 41, 169, 0.25)

Header Height: 4rem (64px)

Border Radius:

Padrão (Cards / Containers): 8px (0.5rem)

Inputs & Botões: 6px (0.375rem)

Modais / Caixas de Destaque: 12px (0.75rem)

Pílula / Badges / Tags: 9999px (Pill)

Sombras & Efeitos Luminescentes (Box Shadow & Glow):

Sombra Base de Elevação: 0 8px 24px rgba(0, 0, 0, 0.6)

Glow Suave (Acentos / Cards ao passar o mouse): 0 0 16px rgba(129, 41, 169, 0.35)

Glow Elétrico Forte (CTAs Primários / Botão Ativo): 0 0 24px rgba(171, 23, 238, 0.65)

Anel de Foco (Acessibilidade / Focus Ring): 0 0 0 2px #0B0A0A, 0 0 0 4px #AB17EE

💻 6. Implementações Prontas de Código
6.1 Variáveis CSS (variables.css)
CSS
:root {
  /* Brand Colors */
  --aura-bg-deep: #0B0A0A;
  --aura-purple-dark: #360F5A;
  --aura-purple-mid: #8129A9;
  --aura-purple-vivid: #AB17EE;

  /* Surfaces & Text */
  --surface-card: #131118;
  --text-primary: #F4F4F5;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;

  /* Functional Feedback */
  --feedback-success-bg: rgba(22, 163, 74, 0.18);
  --feedback-success-text: #4ADE80;
  --feedback-error-bg: rgba(220, 38, 38, 0.18);
  --feedback-error-text: #F87171;
  --feedback-warning-bg: rgba(217, 119, 6, 0.18);
  --feedback-warning-text: #FBBF24;
  --feedback-info-bg: rgba(37, 99, 235, 0.18);
  --feedback-info-text: #60A5FA;
  --feedback-disabled-bg: #161518;
  --feedback-disabled-text: #52525B;

  /* Gradients */
  --gradient-aura: linear-gradient(135deg, #AB17EE 0%, #8129A9 100%);
  --gradient-deep: linear-gradient(180deg, #360F5A 0%, #0B0A0A 100%);
  --gradient-glow: linear-gradient(90deg, #8129A9 0%, #AB17EE 50%, #8129A9 100%);

  /* Typography */
  --font-family-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-family-heading: 'Space Grotesk', system-ui, sans-serif;

  /* Shadows & Glows */
  --shadow-elevation: 0 8px 24px rgba(0, 0, 0, 0.6);
  --glow-soft: 0 0 16px rgba(129, 41, 169, 0.35);
  --glow-electric: 0 0 24px rgba(171, 23, 238, 0.65);
}

body {
  background-color: var(--aura-bg-deep);
  color: var(--text-primary);
  font-family: var(--font-family-body);
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-heading);
}

/* Exemplo de botão primário */
.btn-aura-primary {
  background: var(--gradient-aura);
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  box-shadow: var(--glow-soft);
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.btn-aura-primary:hover {
  box-shadow: var(--glow-electric);
  transform: translateY(-1px);
}
6.2 Design Tokens JSON (tokens.json)
JSON
{
  "name": "Aura Design System",
  "version": "1.0.0",
  "color": {
    "brand": {
      "bg-deep": { "value": "#0B0A0A", "type": "color" },
      "purple-dark": { "value": "#360F5A", "type": "color" },
      "purple-mid": { "value": "#8129A9", "type": "color" },
      "purple-vivid": { "value": "#AB17EE", "type": "color" }
    },
    "feedback": {
      "success": { "background": "rgba(22, 163, 74, 0.18)", "text": "#4ADE80" },
      "error": { "background": "rgba(220, 38, 38, 0.18)", "text": "#F87171" },
      "warning": { "background": "rgba(217, 119, 6, 0.18)", "text": "#FBBF24" },
      "info": { "background": "rgba(37, 99, 235, 0.18)", "text": "#60A5FA" }
    }
  },
  "gradient": {
    "aura": { "value": "linear-gradient(135deg, #AB17EE 0%, #8129A9 100%)", "type": "gradient" },
    "deep": { "value": "linear-gradient(180deg, #360F5A 0%, #0B0A0A 100%)", "type": "gradient" },
    "glow": { "value": "linear-gradient(90deg, #8129A9 0%, #AB17EE 50%, #8129A9 100%)", "type": "gradient" }
  },
  "typography": {
    "fontFamilies": {
      "heading": { "value": "Space Grotesk, system-ui, sans-serif", "type": "fontFamilies" },
      "body": { "value": "Inter, system-ui, sans-serif", "type": "fontFamilies" }
    }
  },
  "boxShadow": {
    "glow-soft": { "value": "0 0 16px rgba(129, 41, 169, 0.35)", "type": "boxShadow" },
    "glow-electric": { "value": "0 0 24px rgba(171, 23, 238, 0.65)", "type": "boxShadow" }
  }
}
6.3 Configuração do Tailwind CSS (tailwind.theme.js)
JavaScript
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        aura: {
          deep: '#0B0A0A',
          'purple-dark': '#360F5A',
          'purple-mid': '#8129A9',
          'purple-vivid': '#AB17EE',
        },
        surface: {
          card: '#131118',
        },
      },
      backgroundImage: {
        'gradient-aura': 'linear-gradient(135deg, #AB17EE 0%, #8129A9 100%)',
        'gradient-deep': 'linear-gradient(180deg, #360F5A 0%, #0B0A0A 100%)',
        'gradient-glow': 'linear-gradient(90deg, #8129A9 0%, #AB17EE 50%, #8129A9 100%)',
      },
      boxShadow: {
        'glow-soft': '0 0 16px rgba(129, 41, 169, 0.35)',
        'glow-electric': '0 0 24px rgba(171, 23, 238, 0.65)',
        'card-elevation': '0 8px 24px rgba(0, 0, 0, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        input: '6px',
      }
    },
  },
};
"""

filename = "guia-de-estilo-aura.md"
with open(filename, "w", encoding="utf-8") as f:
f.write(full_md_content)

print(f"File created: {filename}")


```text?code_stdout&code_event_index=1
File created: guia-de-estilo-aura.md

O seu arquivo unificado em formato Markdown (.md) está pronto!

Ícone do app MD
guia-de-estilo-aura
 MD 
O que foi reunido dentro deste arquivo único:
Visão Geral e Conceito: Identidade Dark Mode First, atmosfera profunda (#0B0A0A), brilhos neon e sugestões de bibliotecas de ícones.

Paleta de Cores Completa:

As 4 cores oficiais solicitadas (Preto Profundo, Roxo Escuro, Roxo Intermediário e Roxo Vivo/Elétrico) com códigos HEX e RGB.

Cores funcionais de feedback (Sucesso, Erro, Alerta, Informativo, Desabilitado) calibradas com transparência para fundo escuro.

Gradientes Oficiais: Códigos CSS prontos para botões, fundos de cabeçalho, bordas com efeito neon e glow radial.

Tipografia & Escala: Links do Google Fonts e escala em rem/px combinando Space Grotesk (títulos futuristas/geométricos) com Inter (leitura e corpo).

Superfícies, Sombras e Layout: Regras de raio de borda (border-radius), anéis de acessibilidade (focus ring) e sombras com luminescência (glow).

Implementações Prontas de Código Embutidas:

Folha de variáveis em CSS puro (:root { ... }).

Objeto de Design Tokens em JSON.

Bloco de configuração para Tailwind CSS.

2 / 2

Isso é pra utilizar no Antigravity

O Gemini é uma IA e pode cometer erros.

Analisando
# 🎨 Guia de Identidade Visual & Design System - Aura

Este documento descreve a especificação completa de identidade visual, design tokens, tipografia, regras de interface e código para implementação baseados na energia **Aura**.

---

## 📌 1. Visão Geral da Marca

- **Nome do Sistema:** Aura Design System
- **Conceito Visual:** Tema escuro imersivo (*Dark Mode First*), combinando uma base em preto profundo com vibrações elétricas em gradientes de roxo e violeta.
- **Tipografia Principal:** 
  - Títulos & Destaques: **Space Grotesk**
  - Corpo & Interfaces: **Inter**
- **Pacote de Ícones Recomendado:** Phosphor Icons ou Lucide Icons
- **Diretrizes Visuais:** Uso de sombras com luminescência (*neon glow*), cantos arredondados modernos (6px a 8px), superfícies translúcidas em vidro escuro (*glassmorphism*) e alto contraste visual para legibilidade e impacto.

---

## 🎨 2. Paleta de Cores Principais

### 2.1 Cores da Marca (Brand Colors)

| Nome do Token | Valor HEX | Valor RGB | Amostra | Descrição / Uso |
| :--- | :--- | :--- | :---: | :--- |
| `--color-bg-deep` | `#0B0A0A` | `rgb(11, 10, 10)` | ⬛ | **Preto Profundo:** Fundo de tela principal, canvas, modais e base estrutural. |
| `--color-purple-dark` | `#360F5A` | `rgb(54, 15, 90)` | 🟪 | **Roxo Escuro:** Zonas de transição, cards secundários, headers e bordas sutis. |
| `--color-purple-mid` | `#8129A9` | `rgb(129, 41, 169)` | 🟣 | **Roxo Intermediário:** Estados de hover, elementos secundários e acentos. |
| `--color-purple-vivid` | `#AB17EE` | `rgb(171, 23, 238)` | 🔮 | **Roxo Vivo / Brilho Elétrico:** CTAs primários, ícones ativos, links e pontos de luz. |

---

### 2.2 Cores Funcionais & Feedback (Dark Mode)

| Estado | Background (Superfície) | Texto / Ícone | Uso Recomendado |
| :--- | :--- | :--- | :--- |
| **Sucesso / Validado** | `rgba(22, 163, 74, 0.18)` | `#4ADE80` | Confirmação de formulários, badges de aprovação, feedback positivo |
| **Recusado / Erro** | `rgba(220, 38, 38, 0.18)` | `#F87171` | Erros de validação, alertas críticos e ações destrutivas |
| **Pendente / Alerta** | `rgba(217, 119, 6, 0.18)` | `#FBBF24` | Avisos de pendência, notificações e status temporários |
| **Informativo** | `rgba(37, 99, 235, 0.18)` | `#60A5FA` | Tooltips informativos, notas de instrução |
| **Desabilitado** | `#161518` | `#52525B` | Botões inativos, inputs desabilitados e textos secundários |
| **Linhas & Divisórias** | `#360F5A` | — | Bordas de inputs, separadores horizontais e contornos |

---

## 🌈 3. Gradientes Oficiais

```css
/* Gradiente Principal Aura (Botões Primários e Destaques Elétricos) */
--gradient-aura: linear-gradient(135deg, #AB17EE 0%, #8129A9 100%);

/* Gradiente de Profundidade (Headers, Hero Sections e Fundos) */
--gradient-deep: linear-gradient(180deg, #360F5A 0%, #0B0A0A 100%);

/* Gradiente Glow / Neon (Bordas Iluminadas e Textos em Gradiente) */
--gradient-glow: linear-gradient(90deg, #8129A9 0%, #AB17EE 50%, #8129A9 100%);

/* Gradiente Radial de Luz Ambiente (Efeito de fundo com 'mesh glow') */
--gradient-ambient: radial-gradient(circle at top right, rgba(171, 23, 238, 0.25), rgba(11, 10, 10, 0) 65%);
```

---

## 🔤 4. Tipografia

- **Família de Fontes:**
  - **Títulos e Headings:** `'Space Grotesk', system-ui, sans-serif`
  - **Corpo e Interface:** `'Inter', system-ui, -apple-system, sans-serif`
- **Importação Google Fonts:**
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  ```

### Escala Tipográfica:
- **Display / Hero:** `3.25rem` (52px) — Peso `700` (Space Grotesk)
- **Títulos H1 (Desktop):** `2.25rem` (36px) — Peso `700` (Space Grotesk)
- **Títulos H1 (Mobile):** `1.625rem` (26px) — Peso `700` (Space Grotesk)
- **Títulos H2:** `1.75rem` (28px) — Peso `600` (Space Grotesk)
- **Títulos H3:** `1.25rem` (20px) — Peso `600` (Space Grotesk)
- **Corpo do Texto (Normal):** `1rem` (16px) — Peso `400` / Altura de linha `1.6` (Inter)
- **Texto Auxiliar / Small:** `0.875rem` (14px) — Peso `400` (Inter)
- **Legendas / Badges:** `0.688rem` (11px) — Peso `600` / Maiúsculas / Espaçamento entre letras `0.05em`

---

## 📐 5. Estrutura, Superfícies & Layout

- **Canvas Principal (Background da Página):** `#0B0A0A`
- **Superfície de Cartão (Card / Painéis):** `#131118` com borda `1px solid rgba(129, 41, 169, 0.25)`
- **Header Height:** `4rem` (64px)
- **Border Radius:**
  - Padrão (Cards / Containers): `8px` (`0.5rem`)
  - Inputs & Botões: `6px` (`0.375rem`)
  - Modais / Caixas de Destaque: `12px` (`0.75rem`)
  - Pílula / Badges / Tags: `9999px` (Pill)
- **Sombras & Efeitos Luminescentes (Box Shadow & Glow):**
  - **Sombra Base de Elevação:** `0 8px 24px rgba(0, 0, 0, 0.6)`
  - **Glow Suave (Acentos / Cards ao passar o mouse):** `0 0 16px rgba(129, 41, 169, 0.35)`
  - **Glow Elétrico Forte (CTAs Primários / Botão Ativo):** `0 0 24px rgba(171, 23, 238, 0.65)`
- **Anel de Foco (Acessibilidade / Focus Ring):** `0 0 0 2px #0B0A0A, 0 0 0 4px #AB17EE`

---

## 💻 6. Implementações Prontas de Código

### 6.1 Variáveis CSS (`variables.css`)

```css
:root {
  /* Brand Colors */
  --aura-bg-deep: #0B0A0A;
  --aura-purple-dark: #360F5A;
  --aura-purple-mid: #8129A9;
  --aura-purple-vivid: #AB17EE;

  /* Surfaces & Text */
  --surface-card: #131118;
  --text-primary: #F4F4F5;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;

  /* Functional Feedback */
  --feedback-success-bg: rgba(22, 163, 74, 0.18);
  --feedback-success-text: #4ADE80;
  --feedback-error-bg: rgba(220, 38, 38, 0.18);
  --feedback-error-text: #F87171;
  --feedback-warning-bg: rgba(217, 119, 6, 0.18);
  --feedback-warning-text: #FBBF24;
  --feedback-info-bg: rgba(37, 99, 235, 0.18);
  --feedback-info-text: #60A5FA;
  --feedback-disabled-bg: #161518;
  --feedback-disabled-text: #52525B;

  /* Gradients */
  --gradient-aura: linear-gradient(135deg, #AB17EE 0%, #8129A9 100%);
  --gradient-deep: linear-gradient(180deg, #360F5A 0%, #0B0A0A 100%);
  --gradient-glow: linear-gradient(90deg, #8129A9 0%, #AB17EE 50%, #8129A9 100%);

  /* Typography */
  --font-family-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-family-heading: 'Space Grotesk', system-ui, sans-serif;

  /* Shadows & Glows */
  --shadow-elevation: 0 8px 24px rgba(0, 0, 0, 0.6);
  --glow-soft: 0 0 16px rgba(129, 41, 169, 0.35);
  --glow-electric: 0 0 24px rgba(171, 23, 238, 0.65);
}

body {
  background-color: var(--aura-bg-deep);
  color: var(--text-primary);
  font-family: var(--font-family-body);
  margin: 0;
  padding: 0;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-heading);
}

/* Exemplo de botão primário */
.btn-aura-primary {
  background: var(--gradient-aura);
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  box-shadow: var(--glow-soft);
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.btn-aura-primary:hover {
  box-shadow: var(--glow-electric);
  transform: translateY(-1px);
}
```

---

### 6.2 Design Tokens JSON (`tokens.json`)

```json
{
  "name": "Aura Design System",
  "version": "1.0.0",
  "color": {
    "brand": {
      "bg-deep": { "value": "#0B0A0A", "type": "color" },
      "purple-dark": { "value": "#360F5A", "type": "color" },
      "purple-mid": { "value": "#8129A9", "type": "color" },
      "purple-vivid": { "value": "#AB17EE", "type": "color" }
    },
    "feedback": {
      "success": { "background": "rgba(22, 163, 74, 0.18)", "text": "#4ADE80" },
      "error": { "background": "rgba(220, 38, 38, 0.18)", "text": "#F87171" },
      "warning": { "background": "rgba(217, 119, 6, 0.18)", "text": "#FBBF24" },
      "info": { "background": "rgba(37, 99, 235, 0.18)", "text": "#60A5FA" }
    }
  },
  "gradient": {
    "aura": { "value": "linear-gradient(135deg, #AB17EE 0%, #8129A9 100%)", "type": "gradient" },
    "deep": { "value": "linear-gradient(180deg, #360F5A 0%, #0B0A0A 100%)", "type": "gradient" },
    "glow": { "value": "linear-gradient(90deg, #8129A9 0%, #AB17EE 50%, #8129A9 100%)", "type": "gradient" }
  },
  "typography": {
    "fontFamilies": {
      "heading": { "value": "Space Grotesk, system-ui, sans-serif", "type": "fontFamilies" },
      "body": { "value": "Inter, system-ui, sans-serif", "type": "fontFamilies" }
    }
  },
  "boxShadow": {
    "glow-soft": { "value": "0 0 16px rgba(129, 41, 169, 0.35)", "type": "boxShadow" },
    "glow-electric": { "value": "0 0 24px rgba(171, 23, 238, 0.65)", "type": "boxShadow" }
  }
}
```

---

### 6.3 Configuração do Tailwind CSS (`tailwind.theme.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        aura: {
          deep: '#0B0A0A',
          'purple-dark': '#360F5A',
          'purple-mid': '#8129A9',
          'purple-vivid': '#AB17EE',
        },
        surface: {
          card: '#131118',
        },
      },
      backgroundImage: {
        'gradient-aura': 'linear-gradient(135deg, #AB17EE 0%, #8129A9 100%)',
        'gradient-deep': 'linear-gradient(180deg, #360F5A 0%, #0B0A0A 100%)',
        'gradient-glow': 'linear-gradient(90deg, #8129A9 0%, #AB17EE 50%, #8129A9 100%)',
      },
      boxShadow: {
        'glow-soft': '0 0 16px rgba(129, 41, 169, 0.35)',
        'glow-electric': '0 0 24px rgba(171, 23, 238, 0.65)',
        'card-elevation': '0 8px 24px rgba(0, 0, 0, 0.6)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
        input: '6px',
      }
    },
  },
};
```
guia-de-estilo-aura.md
Exibindo guia-de-estilo-aura.md.