# AUDITORIA CODEBEN

**Escopo:** somente a landing e o tracking de **Sites Imersivos com IA**. A extensão, seu Worker, licenças e e-mail não foram alterados nem implantados. Data: 22/09/2026.

## 1. Estado inicial

| Item | Estado |
| --- | --- |
| Repositório | `miraka07/Imersivo-IA-Funil-Sales` |
| Branch / commit inicial | `main` / `f18579d` |
| Working tree inicial | limpa |
| Build / saída | `npm run build` / `dist/` |
| Hosting | Vercel, domínio `www.codebn.com.br` |
| Checkout | Cakto `32iz4ye_1128231` |
| Worker de licenças / e-mail / extensão | projeto externo, fora do escopo atual |

Nenhum segredo foi escrito no repositório. O teste público do checkout foi somente leitura; nenhum pagamento foi iniciado.

## 2. Arquitetura encontrada

- **Front-end:** HTML estático capturado do Framer, CSS de ajustes, JavaScript de tracking e 195 recursos capturados. O build remove o bundle principal de hidratação para evitar uma segunda renderização e atrasos nos CTAs.
- **Back-end da landing:** apenas `api/meta-capi.js`, endpoint opcional para `InitiateCheckout` da Meta; não existe webhook de compra neste repositório.
- **Worker, licenciamento e e-mail:** externos a este repositório e não testados nesta auditoria.
- **Checkout:** link direto para a Cakto. A página pública respondeu HTTP 200 e exibiu o produto `SITES IMERSIVOS COM IA`, R$ 89,90 mais R$ 0,99 de taxa.
- **Tracking:** `codeben-tracking.js` envia `page_view`, `cta_click`, `initiate_checkout`, `section_view` e `scroll_depth` ao `dataLayer`; GTM `GTM-K7DRVZWW`, GA4 detectado `G-G7VKFM2958`, Pixel direto `2285516122199897`. `Purchase` deve vir da confirmação do pagamento, fora desta landing.
- **Dependência comercial:** CTA → URL Cakto + UTMs → checkout. Compra aprovada → webhook → licença → e-mail não possui implementação aqui.

## 3. Bugs reproduzidos

| Bug | Severidade | Reproduzido? | Causa-raiz |
| --- | --- | --- | --- |
| UTMs perdidas ao clicar no CTA | P0 para atribuição | Sim | handler substituía o `href` decorado e forçava `location.assign` com URL sem parâmetros |
| Copy dos CTAs mobile errada | P1 | Sim | build estático não carrega o script legado que alterava o texto em runtime |
| Vídeos sem quadro em conexão limitada | P1 | Sim | oito MP4 elegíveis para download, sem poster; metadados `moov` no fim dos arquivos |
| Texto do processo cortado / blocos invisíveis | P1 histórico | Não no build inicial desta rodada | classes de proporção fixa e estado de animação já haviam sido neutralizados em correções anteriores |

## 4. Bugs históricos que já não ocorrem

- **CTA abrindo dois checkouts:** após integrar os dois commits remotos adicionais, os quatro CTAs visíveis em desktop e em 390 px foram clicados com checkout interceptado; cada clique abriu somente uma guia e navegou na mesma aba. As quatro labels também foram inspecionadas em 375 px.
- **Processo cortado:** seção com `opacity: 1`, altura compatível com conteúdo, `overflow: visible`; screenshot e DOM em 390 px mostram o título completo.
- **Oferta/blocos invisíveis:** processo, resultados, extensão e oferta retornaram `opacity: 1` e alturas não nulas nas larguras testadas.

Essas evidências são do build local final; não equivalem a validação em todos os aparelhos.

## 5. Novos problemas encontrados

- **P0 externo, não corrigido por limite de escopo:** em verificação anterior desta rodada, o ID de checkout `1128231` também apareceu no mapeamento de licença de outro projeto. A associação entre compra de Imersivos e licença correta exige uma auditoria separada do webhook. A landing e o checkout público corretos não comprovam entrega.
- **P1 de observabilidade:** GA4 `page_view` chegou ao endpoint de coleta durante o teste local, e os eventos de CTA entraram no `dataLayer`. O recebimento final de `initiate_checkout` no GA4 e na Meta não foi comprovado por painel autenticado nesta rodada.
- **P2:** `metaPixelDirect: true` convive com GTM; sem inspeção das tags publicadas não se pode excluir duplicidade do Pixel.
- **P2:** URL do checkout continua repetida em HTML, build, tracking e adaptador legado. A troca futura exige teste de regressão e sincronização consciente.

## 6. Acoplamentos frágeis

| Local | Risco | Estado |
| --- | --- | --- |
| CSS do efeito de letras associado ao `href` exato | trocar checkout removia efeito/foco | **Corrigido:** seletor usa `.codeben-cta` |
| `scripts/build.mjs`, `codeben-tracking.js`, `codeben-copy.js`, HTML capturado | troca de checkout pode divergir | **Pendente:** manter testes e checklist; centralização completa requer refatoração do HTML capturado |
| Classes geradas pelo Framer no build/CSS | recaptura pode mudar seletores | **Mitigado:** teste do build verifica 9 variantes de CTA e 8 vídeos esperados |
| Script legado de copy não executado no build | conteúdo essencial poderia depender de JS | **Corrigido nos CTAs:** copy já sai correta no HTML estático |

## 7. Correções realizadas

| Arquivo | Antes | Depois | Motivo |
| --- | --- | --- | --- |
| `codeben-tracking.js` | clique sobrescrevia URL com checkout sem UTMs | navega pela URL atribuída do próprio CTA | preservar parâmetros de campanha |
| `scripts/build.mjs` | variantes mobile mostravam `ENTRAR AGORA` | integrados os commits remotos que deixam o HTML final com copy e letras corretas do hero, projeto e oferta, além do CTA final | evitar dependência de runtime |
| `codeben-copy.css` | efeito visual dependia de URL exata | usa `.codeben-cta` | troca de checkout não altera visual |
| `assets/media/*.mp4` | índice de reprodução no fim | mesmo vídeo, sem recodificação, com `moov` no início | iniciar rapidamente em rede limitada |
| `assets/posters/*.jpg` | sem capa | imagem de um quadro de cada vídeo | exibir conteúdo enquanto carrega e quando autoplay falha |
| `scripts/build.mjs` | vídeos iniciavam juntos | `preload=none`, poster, controles sem JS, play próximo da viewport e URL com hash | reduzir competição de rede, manter fallback e invalidar cache imutável |
| `scripts/test-tracking.mjs`, `scripts/test-build.mjs`, `package.json` | testes não verificavam navegação nem HTML final | regressões de UTMs, labels, links e vídeos falham em `npm test` | prevenção |
| `README.md` | instrução de GTM desatualizada | documenta configuração atual e troca de checkout | operação segura |

## 8. Testes executados

| Teste | Resultado |
| --- | --- |
| `npm test` (inclui build limpo) | PASSOU; 195 recursos copiados; tracking e HTML final validados |
| `git diff --check` | PASSOU; apenas avisos de normalização LF/CRLF no Windows |
| Browser Chromium 1440, 390 e 375 px | PASSOU: sem erro de página, sem overflow horizontal, CTAs visíveis |
| 8 cliques reais finais em CTA (4 desktop + 4 mobile) com checkout interceptado | PASSOU: URL `1128231` com UTMs e uma única guia |
| Browser sem JavaScript em 390 px | PASSOU: headline, oferta, CTAs e posters/controles presentes |
| Rede limitada a ~1,6 Mbps e 150 ms de latência | antes: nenhum quadro pronto após ~28 s; depois: vídeo do processo reproduzindo ~3 s após aproximar a seção |
| Recursos locais do build | nenhum request local falhou nos viewports testados |
| Checkout público Cakto | HTTP 200, produto e preço corretos; pagamento não testado |
| GTM/GA4 | GTM carregou; coleta GA4 `page_view` observada; CTA em `dataLayer` |

## 9. Matriz de regressão

| Funcionalidade | Desktop | Mobile 390/375 | Build | Resultado |
| --- | --- | --- | --- | --- |
| Hero, processo, oferta | DOM visível | DOM visível, sem corte detectado | presente | PASSOU |
| CTA 1/2/3/final, texto e link | 4 clicáveis | 4 clicáveis | 9 variantes coerentes | PASSOU |
| UTMs / guia única | preservadas | preservadas | handler testado | PASSOU |
| Vídeo com poster e play | reproduz no Chromium | reproduz no Chromium e teste de rede limitada | 8 vídeos preparados | PASSOU COM RESSALVA: iPhone físico pendente |
| Checkout → licença → e-mail | não testado | não testado | fora do repositório | NÃO TESTADO |

## 10. Webhook e licença

Não existem neste repositório. O teste da página Cakto confirma o produto apresentado, mas não a associação de checkout com licença, idempotência ou persistência. O risco de mapeamento externo citado na seção 5 precisa ser resolvido em tarefa separada, sem alterar a extensão nesta auditoria.

## 11. E-mail

Não existe implementação de envio neste repositório. Criação, aceitação pelo provedor, entrega, bounce e spam **não foram testados**. Nenhum e-mail foi enviado.

## 12. Extensão

**Fora do escopo por instrução explícita do usuário.** Nenhum arquivo, ZIP ou deploy da extensão foi alterado nesta fase.

## 13. Itens não validados

- Autoplay em iPhone/Safari físico e modo de economia de bateria: **NÃO VALIDADO EM HARDWARE REAL**.
- Eventos `InitiateCheckout` e `Purchase` recebidos e deduplicados nos painéis autenticados GA4/Meta: **NÃO VALIDADOS**.
- Pagamento aprovado, webhook, licença e e-mail: **NÃO TESTADOS**; nenhuma compra real foi feita.
- Segredos/variáveis do ambiente remoto Vercel: **NÃO VERIFICADOS**. No repositório não há valores de segredo; `META_PIXEL_ID` e `META_ACCESS_TOKEN` são exigidos somente se a Conversions API for ativada.

## 14. Riscos restantes

1. Mapeamento externo do checkout para licença precisa de verificação/correção separada antes de considerar a entrega ponta a ponta pronta.
2. Possível duplicidade do Pixel se GTM e script direto publicarem o mesmo evento.
3. Vídeos de 4 a 25 MB ainda podem levar tempo após o usuário chegar à seção; poster e controles impedem espaço vazio, mas não substituem compressão futura.
4. HTML capturado e classes Framer tornam uma recaptura ampla mais arriscada do que uma edição normal de componentes.

## 15. Recomendações preventivas

- Rodar `npm test` e cliques reais nos quatro CTAs antes de cada deploy.
- Em toda troca de checkout, confirmar produto Cakto, atualizar referências listadas no README e validar o webhook/licença em tarefa própria.
- Validar tags do GTM Preview e eventos no GA4/Events Manager com IDs da oferta; manter Pixel com uma única origem efetiva.
- Testar fisicamente iPhone e Android em 4G antes de declarar autoplay resolvido em todos os aparelhos.
- Centralizar o checkout quando o HTML capturado for substituído por componentes estáveis; evitar uma refatoração ampla durante campanha ativa.

## 16. Status final

| Área | Status | Evidência/limite |
| --- | --- | --- |
| Build e landing local | **PASSOU** | build, DOM, browser, cliques e recursos testados |
| CTAs e UTMs | **PASSOU** | 8 cliques finais interceptados, uma guia, parâmetros preservados |
| Vídeo mobile | **PASSOU COM RESSALVA** | Chromium e rede limitada; iPhone físico pendente |
| GA4/GTM | **PASSOU COM RESSALVA** | script e `page_view`; conversão final no painel não verificada |
| Meta Pixel | **PASSOU COM RESSALVA** | script/config carregados; recebimento/deduplicação não verificados |
| Checkout Cakto (abertura) | **PASSOU COM RESSALVA** | HTTP 200 e produto correto; pagamento não executado |
| Webhook, licença e e-mail | **NÃO TESTADO** | fora deste repositório/escopo |
| Extensão | **NÃO TESTADO** | fora do escopo explícito |
