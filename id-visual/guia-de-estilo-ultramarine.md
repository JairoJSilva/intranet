# 🎨 Guia de Identidade Visual — Electric Ultramarine & Cyber Navy

Este documento descreve as especificações técnicas, design tokens, paleta de cores e diretrizes de interface do design system **Electric Ultramarine & Cyber Navy**, estruturado para sistemas web de alta tecnologia, dashboards corporativos e interfaces escuras imersivas.

---

## 📌 1. Visão Geral da Marca & Design System

- **Nome:** Electric Ultramarine & Cyber Navy
- **Filosofia Visual:** Profundidade cósmica com acentos elétricos e vibração luminescente. Contraste equilibrado entre tons ultra-escuros de azul e violeta com realces em ciano aqua e ultramarino vibrante.
- **Tipografia Principal:** Space Grotesk (títulos e indicadores) e Inter (corpo e leitura de alta densidade).
- **Pacote de Ícones:** Remix Icon (`remixicon@4.5.0`).
- **Estilo Geral:** Dark Mode imersivo, efeito Glassmorphism com backdrop blur, bordas com reflexo sutil em ciano/violeta e botões em pílula (*pill buttons*).

---

## 🎨 2. Paleta de Cores Oficiais

### 🔮 Cores Secundárias (Acentos & Efeitos de Luz)

| Nome do Token | HEX | RGB | CMYK | Amostra | Descrição / Uso |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `--color-violet-deep` | `#300063` | `(48, 0, 99)` | `(52, 100, 0, 61)` | 🟣 | Roxo Profundo / Base de transição escura e sombras |
| `--color-purple-electric` | `#7F00F5` | `(127, 0, 245)` | `(48, 100, 0, 4)` | 🟪 | Violeta Elétrico / Acentos de destaque, badges e glows |

---

### 🌊 Cores Principais (Estrutura, Superfícies e Ação)

| Nome do Token | HEX | RGB | CMYK | Amostra | Descrição / Uso |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `--color-navy-midnight` | `#001744` | `(0, 23, 68)` | `(100, 66, 0, 73)` | 🌑 | Azul Noite Profundo / Fundo principal do sistema |
| `--color-navy-deep` | `#001B72` | `(0, 27, 114)` | `(100, 76, 0, 55)` | 🌌 | Azul Marinho Royal / Superfícies de cards, sidebar e painéis |
| `--color-ultramarine` | `#312BD9` | `(49, 43, 217)` | `(77, 80, 0, 15)` | 🟦 | Azul Ultramarino Elétrico / Botões primários e CTAs ativos |
| `--color-cerulean-vivid` | `#109DE8` | `(16, 157, 232)` | `(93, 32, 0, 9)` | 🔷 | Azul Celeste Vibrante / Links de navegação, ícones e foco |
| `--color-aqua-cyan` | `#17E1E5` | `(23, 225, 229)` | `(90, 2, 0, 10)` | 💠 | Ciano Aqua / Indicadores de status online e brilho neon |
| `--color-ice-white` | `#E6F4FF` | `(230, 244, 255)` | `(10, 4, 0, 0)` | ❄️ | Azul Gelo Suave / Textos primários de alto contraste e tags |

---

### 🚦 Cores Funcionais & Feedback (Status do Sistema)

| Estado | Token | Valor HEX | Uso |
| :--- | :--- | :---: | :--- |
| **Online / Sucesso** | `--status-online` | `#17E1E5` / `#00E676` | Aplicações operacionais, validações e uptime |
| **Alerta / Atenção** | `--status-warning` | `#FFB300` | Latência moderada, avisos e pendências |
| **Offline / Erro** | `--status-offline` | `#FF3860` | Falhas de conexão, serviços inativos e erros |
| **Informativo** | `--status-info` | `#109DE8` | Tooltips, notas de rodapé e orientações |
| **Desabilitado** | `--color-disabled` | `#4A5568` | Elementos inativos ou bloqueados por permissão |

---

## 🌈 3. Gradientes Oficiais

```css
/* 1. Gradiente Primário Cybernetic (Ultramarino para Ciano Aqua) */
--gradient-primary: linear-gradient(135deg, #312BD9 0%, #109DE8 50%, #17E1E5 100%);

/* 2. Gradiente Neon Elétrico (Violeta para Aqua) */
--gradient-electric: linear-gradient(135deg, #7F00F5 0%, #312BD9 50%, #17E1E5 100%);

/* 3. Gradiente de Superfície Profunda (Cards e Hero Banners) */
--gradient-surface: linear-gradient(180deg, rgba(0, 27, 114, 0.85) 0%, rgba(0, 23, 68, 0.95) 100%);

/* 4. Gradiente de Fundo com Malha de Luz (Mesh Background) */
--gradient-mesh-bg: 
    radial-gradient(circle at 12% 15%, rgba(127, 0, 245, 0.22) 0%, transparent 45%),
    radial-gradient(circle at 88% 20%, rgba(23, 225, 229, 0.18) 0%, transparent 40%),
    radial-gradient(circle at 50% 85%, rgba(49, 43, 217, 0.25) 0%, transparent 50%),
    #001744;
```

---

## 🔤 4. Tipografia & Hierarquia Visual

- **Família de Títulos:** `'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif`
- **Família de Corpo e Dados:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Importação Google Fonts:**
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  ```

### Escala Tipográfica:
- **Títulos Display / Hero:** `2.25rem` (36px) — Peso `700` (Bold)
- **Títulos H1 / Seções:** `1.75rem` (28px) — Peso `600` (Semi-bold)
- **Subtítulos / Cards:** `1.125rem` (18px) — Peso `600`
- **Corpo de Texto (Base):** `0.938rem` (15px) — Peso `400` (Regular)
- **Legendas / Badges / Metadados:** `0.75rem` (12px) — Peso `500` (Medium)

---

## 📐 5. Estrutura, Superfícies & Glassmorphism

- **Fundo da Aplicação:** `#001744` com gradientes radiais de ambiência violeta e ciano.
- **Superfícies de Cards & Modais:**
  - Background: `rgba(0, 27, 114, 0.65)`
  - Filtro de Vidro: `backdrop-filter: blur(16px) saturate(160%)`
  - Borda: `1px solid rgba(23, 225, 229, 0.2)`
  - Sombra: `0 10px 30px rgba(0, 10, 30, 0.6), inset 0 1px 0 0 rgba(230, 244, 255, 0.1)`
- **Efeito Hover em Cards Interativos:**
  - Background: `rgba(0, 35, 140, 0.8)`
  - Borda Iluminada: `rgba(23, 225, 229, 0.5)`
  - Glow Neon: `0 0 20px rgba(23, 225, 229, 0.25), 0 12px 32px rgba(0, 0, 0, 0.5)`
- **Raio de Borda (Border Radius):**
  - Botões de Ação (Pill): `9999px` (estilo *"Lembrar mais tarde"* e *"Entendi"*)
  - Cards e Painéis: `12px`
  - Modais: `16px`
  - Inputs de Formulário: `8px`
- **Anel de Foco (Accessibility Focus Ring):**
  - `0 0 0 3px rgba(23, 225, 229, 0.35), 0 0 12px rgba(49, 43, 217, 0.4)`

---

## 💻 6. Implementação em Variáveis CSS (Design Tokens)

```css
:root,
[data-theme="ultramarine-dark"] {
  /* Cores Secundárias */
  --color-violet-deep: #300063;
  --color-purple-electric: #7f00f5;

  /* Cores Principais */
  --color-navy-midnight: #001744;
  --color-navy-deep: #001b72;
  --color-ultramarine: #312bd9;
  --color-cerulean-vivid: #109de8;
  --color-aqua-cyan: #17e1e5;
  --color-ice-white: #e6f4ff;

  /* Mapeamento Semântico do Sistema */
  --theme-primary: #312bd9;
  --theme-primary-hover: #109de8;
  --theme-accent: #17e1e5;
  --theme-accent-hover: #7f00f5;

  --bg-primary: #001744;
  --bg-secondary: #001b72;
  --bg-card: rgba(0, 27, 114, 0.65);
  --bg-card-hover: rgba(0, 35, 140, 0.85);
  --bg-elevated: #002288;
  --border-color: rgba(23, 225, 229, 0.2);
  --border-hover: rgba(23, 225, 229, 0.5);

  --text-primary: #e6f4ff;
  --text-secondary: #a3c7e8;
  --text-muted: #6287af;
  --text-accent: #17e1e5;

  --status-online: #17e1e5;
  --status-online-bg: rgba(23, 225, 229, 0.16);
  --status-warning: #ffb300;
  --status-warning-bg: rgba(255, 179, 0, 0.16);
  --status-offline: #ff3860;
  --status-offline-bg: rgba(255, 56, 96, 0.16);

  --glass-bg: rgba(0, 27, 114, 0.65);
  --glass-border: rgba(23, 225, 229, 0.22);
  --glass-shadow: 0 10px 30px rgba(0, 10, 30, 0.6);
}
```

---

## 📦 7. Configuração Tailwind CSS

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        cyber: {
          violet: '#300063',
          purple: '#7F00F5',
          midnight: '#001744',
          navy: '#001B72',
          ultramarine: '#312BD9',
          cerulean: '#109DE8',
          aqua: '#17E1E5',
          ice: '#E6F4FF',
        }
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #312BD9 0%, #109DE8 50%, #17E1E5 100%)',
        'electric-gradient': 'linear-gradient(135deg, #7F00F5 0%, #312BD9 50%, #17E1E5 100%)',
      }
    }
  }
}
```
