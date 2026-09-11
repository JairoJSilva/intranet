# 📱 Alternador de Densidade de Tela (Modo Compacto / NOC vs. Confortável)

> **ID**: `ISSUE-04`  
> **Labels**: `frontend, ui/ux, design-system, accessibility`  
> **Weight (Complexidade)**: `2`  

### 🎯 Objetivo & User Story
Como operador de NOC/SOC que monitora dezenas de sistemas simultâneos, quero alternar a visualização para um modo de alta densidade (compacto), para enxergar mais aplicações na mesma tela sem necessidade de scroll excessivo.

---

### 📋 Critérios de Aceite
- [ ] Adicionar botão de alternância de densidade no cabeçalho ou Topbar: **Modo Confortável** (padrão com cards expandidos) vs. **Modo Compacto** (micro-tiles / lista densa).
- [ ] O modo compacto reduz margens, paddings e tamanhos de fonte de forma legível e elegante.
- [ ] Salvar a preferência do usuário no `localStorage` (`omniflowti_density_mode`).
- [ ] Garantir compatibilidade visual com todos os 7 temas de cores da aplicação.
