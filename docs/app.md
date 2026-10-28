# App

Pasta `treino-app`. Repositório próprio, separado da API. O app Expo abre no celular pelo Expo Go e fala com a API publicada.

As regras de produto estão em [produto.md](../../treino-api/docs/produto.md), na pasta irmã. Esse arquivo é a fonte. Não duplicar aqui.

## Papel

App de celular para a pessoa que treina. Primeira loja é a Apple. A Google entra com o mesmo projeto. A web do professor não mora aqui. Ela será `treino-web` e falará com a mesma API.

O nome e a logo exibidos podem mudar sem renomear esta pasta.

## Tecnologias

- Expo, com Expo Router e TypeScript
- EAS Build para gerar o iPhone na nuvem, a partir do Windows, sem Mac
- Conta de desenvolvedor da Apple para assinar o app e instalar no aparelho
- TanStack Query para os dados da API
- NativeWind para o estilo. As cores são papéis (`primary`, `secondary` e os demais), definidos uma vez no tema. Um botão usa `primary`. Mudar o papel muda todo botão que o usa.
- `lucide-react-native` para os ícones
- O teste de iPhone é no aparelho físico, por build de desenvolvimento ou TestFlight. O simulador da Apple não roda no Windows. O emulador Android roda aqui.

Ainda não está fixada a versão da SDK do Expo. Na hora de gerar o projeto, vale a atual que o criador do Expo entregar, com a imagem de build correspondente da EAS.

## Tema

A V0 tem claro, escuro e sistema. O padrão é o sistema: o app acompanha o claro ou o escuro do celular. A pessoa pode fixar claro ou escuro. A escolha fica só no aparelho. Desinstalar limpa essa escolha.

Cada tema é uma paleta dos mesmos papéis. A tela não usa cor solta. O componente lê o papel. A única cor de marca é o laranja `#FC4C02`, nos dois temas, também previsto para a logo. O `secondary` é neutro. Verde e vermelho entram só em confirmação e erro.

No escuro a tela é preta e o cartão é um degrau mais claro. No claro a tela é um cinza bem claro e o cartão é branco.

| Papel | Claro | Escuro |
| --- | --- | --- |
| `primary` | `#FC4C02` | `#FC4C02` |
| texto sobre `primary` | `#FFFFFF` | `#FFFFFF` |
| fundo | `#F5F5F5` | `#000000` |
| superfície | `#FFFFFF` | `#1A1A1A` |
| superfície elevada | `#FFFFFF` | `#242424` |
| `secondary` | `#EFEFEF` | `#2A2A2A` |
| texto sobre `secondary` | `#0A0A0A` | `#FFFFFF` |
| borda | `#E6E6E6` | `#2A2A2A` |
| texto | `#0A0A0A` | `#FFFFFF` |
| texto suave | `#6B6B6B` | `#A3A3A3` |
| `success` | `#1F8A5B` | `#7DBE6A` |
| `danger` | `#D64545` | `#E25B45` |

## Organização

Quando o projeto for gerado, as pastas ficam assim:

- `app` guarda as rotas.
- `src/theme` guarda as duas paletas.
- `src/components/ui` guarda botão, texto e tela. São os únicos que conhecem o tema.
- `src/i18n` guarda português e inglês da interface.
- `src/features` guarda conta, atividades, treinos, grupos e conquistas.

## Idiomas

A V0 sai em português e em inglês. O padrão é o idioma do celular, ou `pt-BR` quando o celular está em outro idioma. A pessoa pode mudar. A escolha fica só no aparelho. Cada pedido à API leva esse idioma, e os nomes da biblioteca e das conquistas já voltam traduzidos.

Os textos fixos da interface ficam no app, num arquivo por idioma: abas, botões, conversa inicial, calendário, grupos e o nome de cada medalha. O que a pessoa escreveu aparece como ela escreveu.

## Conta na tela

A conversa inicial é um roteiro fixo, sem IA. No fim, a pessoa cria a conta com e-mail e senha, Google ou Apple. Telefone fica num campo opcional. Existe uma ação visível de apagar a conta.

Não há botão de assinar nesta versão.

## Telas da V0

- Conversa de perfil e criação de conta.
- Aba Atividades, a principal. No topo, o próximo modelo. Abaixo, as atividades já concluídas. Um botão abre a tela de treinos. O calendário marca o dia em que houve atividade concluída.
- Sem modelo e sem atividade, o centro da tela pede para criar o primeiro treino.
- O botão de mais abre duas opções: atividade avulsa, ou executar um treino. Executar um treino mostra os modelos na ordem dela, para ela escolher outro que não seja o destaque.
- Academia, modelo ou avulsa: cronômetro com pausa, exercício marcado ao terminar, séries, repetições e carga desta vez. Na avulsa a lista começa vazia. Sem GIF, um ícone genérico. O filtro por músculo principal fica na busca.
- Corrida, bike e caminhada: tempo do cronômetro, distância, pace e como se sentiu. Pilates, yoga, vôlei e beach tênis: tempo e como se sentiu.
- Ao finalizar um modelo com números diferentes, perguntar se o treino salvo deve passar a usar esses números. Na academia avulsa, perguntar se aquilo vira um treino.
- Concluir: título editável, descrição, imagens e a duração do cronômetro.
- Se esta conclusão desbloqueou conquista, anunciar quantas e o nome de cada uma, com o botão Ver conquistas.
- Tela de treinos: criar, editar e arrastar a ordem dos modelos.
- Aba de grupos: comunidade e desafio, público e privado, código ou pedido de acesso, texto de regras, ranking de dias com atividade.
- Conquistas: um card por categoria, com a etapa atual e a próxima. O detalhe mostra a descrição e a escada. A medalha colore o card enquanto o ícone não existe.

O GIF é pedido um por vez, no endereço que a API guardar. Os arquivos não vão dentro do aplicativo.

## O que fica de fora da interface

Professor, avaliação, medidas, exercício custom, treino de corrida dentro da sessão de academia, GPS e pagamento. O calendário já mostra academia, corrida e o resto das atividades no mesmo mês.
