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

## Organização

- `index.html`, `codeben-copy.css` e `codeben-copy.js`: página e ajustes CODEBEN.
- `assets/`: marca e vídeos CODEBEN.
- `resources/https/`: fontes e módulos da captura Framer necessários ao comportamento atual.
- `sitecloner-runtime.js` e `sitecloner-resource-manifest.json`: resolução local dos recursos da captura.
- `scripts/build.mjs`: gera `dist/` a partir dos arquivos acima.

O build falha se algum recurso listado no manifesto estiver ausente. `dist/` é gerado localmente e não é versionado.
