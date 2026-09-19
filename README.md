# CODEBEN — Imersivo IA Funil Sales

Site estático da CODEBEN, preparado para publicação no Vercel. A saída de produção é gerada em `dist/` e contém o HTML, CSS, JavaScript, fontes, imagens e vídeos usados pela página.

## Build local

Requer Node.js 20 ou superior. Não há dependências npm nem variáveis de ambiente.

```bash
npm run build
```

Sirva `dist/` por HTTP para conferir o resultado; não abra o HTML com `file://`. Por exemplo, use `npx serve dist` ou qualquer servidor estático equivalente.

## Vercel

Importe este repositório com a raiz como **Root Directory**. O arquivo `vercel.json` define Framework Preset **Other**, Build Command `npm run build` e Output Directory `dist`. Nenhuma variável de ambiente é necessária. O checkout é um link externo direto para a Cakto.

## Tracking (GTM + Meta)

O site já envia eventos sem PII para `window.dataLayer`: `page_view`, `cta_clicked` e `checkout_started`. Cada CTA carrega `button_text`, `cta_name`, `cta_index`, `cta_location`, URL de destino e parâmetros de campanha (`utm_*`, `gclid` e `fbclid`). O clique também gera um `event_id` estável apenas para a deduplicação daquela ação.

Para ativar o container, preencha `gtmId` em `index.html` dentro de `window.CODEBEN_TRACKING_CONFIG`. O script carrega o GTM de forma assíncrona depois do carregamento da página, mantendo o caminho crítico do mobile leve. No GTM, crie:

1. Um acionador **Custom Event** para `cta_clicked` e uma tag Meta Pixel com o evento `InitiateCheckout`.
2. Um acionador **Custom Event** para `page_view` e a tag de PageView.
3. Variáveis de camada de dados para `cta_name`, `cta_location`, `button_text`, `event_id`, `value` e `currency`.

Enquanto o container do GTM não está autenticado, o Pixel configurado no site é `2285516122199897` via carga direta (`metaPixelDirect: true`). Assim que o GTM for publicado, altere `metaPixelDirect` para `false` e deixe o Pixel somente na tag do GTM para evitar eventos duplicados.

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
