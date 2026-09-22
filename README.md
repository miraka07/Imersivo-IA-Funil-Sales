# CODEBEN — Imersivo IA Funil Sales

Site estático da CODEBEN, preparado para publicação no Vercel. A saída de produção é gerada em `dist/` e contém o HTML, CSS, JavaScript, fontes, imagens e vídeos usados pela página.

## Build local

Requer Node.js 20 ou superior. Não há dependências npm nem variáveis de ambiente.

```bash
npm run build
npm test
```

Sirva `dist/` por HTTP para conferir o resultado; não abra o HTML com `file://`. Por exemplo, use `npx serve dist` ou qualquer servidor estático equivalente.

## Vercel

Importe este repositório com a raiz como **Root Directory**. O arquivo `vercel.json` define Framework Preset **Other**, Build Command `npm run build` e Output Directory `dist`. Nenhuma variável de ambiente é necessária. O checkout é um link externo direto para a Cakto.

## Tracking (GTM + Meta)

O site já envia eventos sem PII para `window.dataLayer`: `page_view`, `cta_click`, `initiate_checkout`, `section_view` e `scroll_depth`. Cada CTA carrega `cta_text`, `cta_name`, `cta_index`, `cta_location`, `destination_url`, `event_id` e parâmetros de campanha (`utm_*`, `gclid` e `fbclid`). O `event_id` existe apenas para a deduplicação daquela ação entre Pixel e CAPI.

O `index.html` já configura `GTM-K7DRVZWW` e o Pixel `2285516122199897`. O GTM carrega de forma assíncrona depois do carregamento da página. Confirme no Preview do container quais tags estão publicadas antes de mudar a configuração. O site envia os eventos abaixo para `dataLayer`; o recebimento final no GA4/Meta depende das tags externas:

1. Um acionador **Custom Event** para `initiate_checkout` e uma tag Meta Pixel com o evento `InitiateCheckout`.
2. Um acionador **Custom Event** para `page_view` e a tag de PageView.
3. Variáveis de camada de dados para `cta_name`, `cta_location`, `cta_text`, `destination_url`, `event_id`, `value` e `currency`.

O Pixel configurado no site é `2285516122199897` via carga direta (`metaPixelDirect: true`). Se o GTM também publicar esse mesmo Pixel, desative uma das duas origens para evitar duplicidade; confirme isso no Preview/Events Manager antes de alterar.

O endpoint `api/meta-capi.js` está pronto para enviar o mesmo `InitiateCheckout` à Meta com o `event_id` compartilhado. No Vercel, configure `META_PIXEL_ID`, `META_ACCESS_TOKEN` e opcionalmente `META_GRAPH_VERSION`; depois altere `capiEnabled` para `true` na configuração do site. O token fica somente no ambiente do servidor. Eventos de `Purchase` devem ser enviados a partir de confirmação da Cakto/webhook, nunca no clique do CTA.

Valide primeiro no **GTM Preview** e no **Events Manager > Test events**. Não publique o container até confirmar que cada um dos três CTAs aparece com o `cta_location` esperado e que Pixel e CAPI deduplicam pelo mesmo `event_id`.

## Organização

- `index.html`, `codeben-copy.css`, `codeben-copy.js` e `codeben-tracking.js`: página, ajustes CODEBEN e camada de tracking.
- `api/meta-capi.js`: endpoint serverless opcional para Conversions API, sem token no cliente.
- `assets/`: marca e vídeos CODEBEN.
- `resources/https/`: fontes e módulos da captura Framer necessários ao comportamento atual.
- `sitecloner-runtime.js` e `sitecloner-resource-manifest.json`: resolução local dos recursos da captura.
- `scripts/build.mjs`: gera `dist/` a partir dos arquivos acima.

O build falha se algum recurso listado no manifesto estiver ausente. `dist/` é gerado localmente e não é versionado.

## Checkout e vídeos

O checkout atual de Imersivos IA é `https://pay.cakto.com.br/32iz4ye_1128231`. A URL aparece no HTML capturado, em `scripts/build.mjs`, `codeben-tracking.js` e no adaptador legado `codeben-copy.js` (que não é carregado no build estático). Ao trocar de checkout, sincronize esses pontos, rode `npm test` e clique os quatro CTAs visíveis em desktop e mobile com UTMs de teste. Confirme também o produto exibido na Cakto e o mapeamento do webhook responsável por licenças; o clique na landing não prova compra ou entrega.

Os MP4 em `assets/media/` têm o índice de reprodução no início para começar em rede móvel sem baixar o arquivo inteiro. O build acrescenta um hash de conteúdo à URL para invalidar o cache antigo. Cada vídeo possui poster em `assets/posters/`, controles nativos sem JavaScript e reprodução automática apenas quando se aproxima da viewport. Em Safari/iPhone, o navegador pode impedir autoplay; os controles são mantidos quando `play()` é rejeitado. Validação em iPhone físico continua necessária.
