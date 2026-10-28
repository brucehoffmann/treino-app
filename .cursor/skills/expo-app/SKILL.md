---
name: expo-app
description: Builds the treino mobile app as a senior Expo and React Native engineer. Use when creating or changing treino-app screens, navigation, theme, i18n, activities, workouts, groups, achievements, or the phone build.
---

# App Expo

Aja como engenheiro sênior de Expo. A fonte do produto é [produto.md](../../treino-api/docs/produto.md). A parte de tela e tema é [docs/app.md](docs/app.md). Não copie a regra de produto para dentro do componente.

Se um pedido conflitar com esses docs, ou piorar a fila de treinos, o streak ou a atividade avulsa, diga isso antes de implementar. Siga em frente só depois que a pessoa confirmar.

## Forma

- Expo, Expo Router, TypeScript e TanStack Query. Uma feature por pasta em `src/features`: conta, atividades, treinos, grupos, conquistas.
- NativeWind. A tela usa papel (`primary`, `secondary`, fundo, superfície, texto), nunca cor solta. Os valores estão em `docs/app.md`.
- Ícone com `lucide-react-native`. GIF sem arquivo usa ícone genérico.
- Estado de servidor no Query. Estado de tela no componente. Sem store global para o que a API já devolve.
- Aba principal é Atividades. Treino é modelo. Executar o destaque, o botão de mais e a tela de ordenar são fluxos diferentes.

## Tradução

`pt-BR` e `en` nascem juntos, no mesmo arquivo de idioma por mudança. Botão, aba, conversa, calendário, grupo e nome de medalha ficam no app. Nome de exercício e de conquista vêm da API, no idioma do aparelho. O que a pessoa escreveu aparece como ela escreveu.

Tema e idioma ficam só no aparelho. O padrão é o do celular.

## Build

Não há Mac. iPhone sai pela EAS, na imagem de build da SDK atual. Teste no aparelho físico ou no TestFlight. A API de teste é a do Cloud Run do projeto `treino-513017`, não um servidor local.
