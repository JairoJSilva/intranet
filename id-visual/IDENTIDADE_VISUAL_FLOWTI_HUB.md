# 🎨 Manual de Identidade Visual e Interface — Flowti Hub

Este documento especifica a identidade visual, padrões de logotipo e a arquitetura visual da interface do **Flowti Hub**, harmonizada com o ecossistema de soluções Flowti (referência canônica: `flowti-agent`).

---

## 📌 1. A Marca Flowti Hub

A marca Flowti Hub é composta pelo símbolo canônico da Flowti (nós e conexões poligonais em rede), o wordmark "flowti" e o badge estilizado **HUB** com acabamento cyber neon.

### 1.1. Arquivos Oficiais de Logotipo
| Arquivo | Formato | Aplicação Recomendada | Localização |
|:---|:---|:---|:---|
| `flowti-hub-logo.svg` | SVG Vetorial | Barra lateral, cabeçalhos, temas escuros e NOC | `aplicação/public/assets/img/flowti-hub-logo.svg` e `id-visual/` |
| `flowti-hub-logo-dark.svg` | SVG Vetorial | Relatórios impressos, fundos brancos e documentações | `aplicação/public/assets/img/flowti-hub-logo-dark.svg` e `id-visual/` |
| `logo_flowti_branca.png` | PNG Raster (1006x348) | Boot overlay, veil de autenticação e transições de tela cheia | `aplicação/public/assets/img/logo_flowti_branca.png` e `id-visual/` |

---

## 🎨 2. Paleta de Cores da Identidade

| Cor / Token | Código Hex / RGBA | Uso na Interface |
|:---|:---|:---|
| **Deep OLED Background** | `#000000` | Fundo principal da tela de login e boot overlay |
| **Dark Cyber Veil** | `#09090F` | Fundo translúcido da sobreposição de sucesso |
| **Electric Blue Primary** | `#3B82F6` | Contornos neon, feixes de laser scanline e foco |
| **Neon Blue Glow** | `#60A5FA` | Brilho dos caracteres HUB, texto de ênfase e hover |
| **Royal Blue Gradient** | `#1D4ED8` ➔ `#2563EB` ➔ `#3B82F6` | Botões primários com efeito dinâmico shimmer |
| **Wipe Navy Perspective** | `#000814` ➔ `#00122E` ➔ `#002052` | Gradiente do painel deslizante em perspectiva 2D |
| **Success Emerald** | `#10B981` / `#A7F3D0` | Feedback de sucesso no envio de solicitação AD |
| **Alert Rose** | `#FB7185` / `#FDA4AF` | Mensagens de credenciais inválidas e avisos |

---

## 🔤 3. Tipografia

- **Tipografia Principal**: `Inter` (Google Fonts, pesos 300, 400, 500, 600, 700, 800 e 900) para formulários, títulos e labels.
- **Tipografia de Telemetria e Código**: `JetBrains Mono` (Google Fonts, pesos 400 e 500) para boot sequence, status de terminal, atalhos de teclado e botões de revelação ("VER" / "OC.").

---

## ⚡ 4. Componente do Badge HUB e Animação Trace Neon

Na tela de login, o badge **HUB** utiliza a técnica de traçado vetorial em tempo real via SVG e CSS keyframes:

```html
<div class="agent-badge-wrapper">
  <svg viewBox="0 0 54 22" class="agent-trace-svg">
    <text x="2" y="18" font-family="'Inter', sans-serif" font-weight="900" font-size="16" letter-spacing="2">
      <tspan class="trace-letter">H</tspan>
      <tspan class="trace-letter">U</tspan>
      <tspan class="trace-letter">B</tspan>
    </text>
  </svg>
</div>
```

### Animação CSS (`trace-text`):
- Efeito contínuo de contorno através de `stroke-dasharray: 120` e variação cíclica de `stroke-dashoffset`.
- Pulso de luz com `drop-shadow(0 0 4px rgba(99, 160, 255, 0.8)) drop-shadow(0 0 10px rgba(99, 130, 246, 0.6))`.
- Atraso sequencial nos caracteres `H` (0.00s), `U` (0.20s) e `B` (0.40s) para leitura orgânica.

---

## 🖥️ 5. Estados da Tela de Login

1. **Boot Overlay (`#lp-boot`)**: Duração de 2.3s com feixe laser descendo em 1.1s, barra de progresso carregando em 1.0s e status "Inicializando ambiente...".
2. **Normal State**: Painel angular à direita exibindo o logotipo e o badge HUB; formulário de login à esquerda.
3. **Solicitar Acesso (Modo Active Directory)**: Transição fluida com o painel deslizando para a esquerda via animação `wipe-to-left`, revelando à direita os campos de Usuário AD e Motivo do Acesso.
4. **Success Veil (`#lp-veil`)**: Arco circular desenhado proceduralmente com checkmark, mensagem "Acesso autorizado" e redirecionamento para o portal.
