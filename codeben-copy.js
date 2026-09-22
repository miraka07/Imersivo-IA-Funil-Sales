(function () {
  'use strict';

  if (window.__codebenSiteInitialized) return;
  window.__codebenSiteInitialized = true;

  var CHECKOUT = 'https://pay.cakto.com.br/32iz4ye_1114873';
  var CTA_LABELS = ['SUBIR O NÍVEL', 'QUERO ESSE MÉTODO', 'ENTRAR AGORA'];

  function walkText(callback) {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) callback(node);
  }

  function replaceText(from, to) {
    walkText(function (node) {
      if (node.nodeValue.indexOf(from) !== -1) node.nodeValue = node.nodeValue.split(from).join(to);
    });
  }

  function replaceExact(from, to) {
    walkText(function (node) {
      if (node.nodeValue.trim() === from) node.nodeValue = node.nodeValue.replace(from, to);
    });
  }

  function findText(fragment) {
    var found = null;
    walkText(function (node) {
      if (!found && node.nodeValue.indexOf(fragment) !== -1) found = node.parentElement;
    });
    return found;
  }

  function replaceElement(fragment, value, selector) {
    var node = findText(fragment);
    if (!node) return;
    var target = node.closest(selector || 'h1,h2,h3,h4,h5,h6,p') || node.parentElement;
    if (target) target.textContent = value;
  }

  function addExtensionNote() {
    var heading = findText('CAPTURA. ENTENDE. TRANSFORMA.');
    if (!heading || document.querySelector('[data-codeben-extension-note]')) return;
    var parent = heading.closest('section') || heading.parentElement;
    var note = document.createElement('p');
    note.dataset.codebenExtensionNote = 'true';
    note.textContent = 'Junto com o treinamento, você recebe acesso vitalício à extensão CODEBEN Site Cloner para capturar, estudar e transformar referências com muito mais direção.';
    parent.appendChild(note);
  }

  function setupTwoModules() {
    var benefits = document.querySelector('#benefits');
    if (!benefits) return;
    benefits.classList.add('codeben-two-modules');

    var heading = findText('DA REFERÊNCIA AO PROJETO PUBLICADO.');
    if (heading) {
      var headingTarget = heading.closest('h1,h2,h3,h4,h5,h6') || heading;
      headingTarget.textContent = '2 módulos. Porque você não comprou um catálogo de aulas.';
      headingTarget.classList.add('codeben-modules-title');
      if (headingTarget.parentElement) headingTarget.parentElement.classList.add('codeben-modules-heading-wrap');
      if (!document.querySelector('[data-codeben-modules-intro]')) {
        var intro = document.createElement('p');
        intro.dataset.codebenModulesIntro = 'true';
        intro.textContent = 'A CODEBEN não foi montada para parecer grande. Foi montada para você entender o processo e começar a executar.';
        headingTarget.parentElement.appendChild(intro);
      }
    }

    var cards = Array.prototype.slice.call(benefits.querySelectorAll('[data-framer-name="Text"]'));
    var moduleTitles = ['Módulo 01', 'Módulo 02'];
    var moduleCopies = [
      'Veja o processo acontecer.\nAula prática de aproximadamente 25 minutos.',
      'Agora você recebe o que precisa para repetir.\nAgente, extensão, prompts, comandos, skill e plugins.'
    ];

    cards.slice(0, 2).forEach(function (card, index) {
      var title = card.querySelector('strong');
      var copy = card.querySelector('.framer-1q1nfdt p');
      if (title) title.textContent = moduleTitles[index];
      if (copy) {
        copy.textContent = moduleCopies[index];
        copy.classList.add('codeben-module-copy');
      }
    });

    Array.prototype.slice.call(benefits.children, 1).forEach(function (row) {
      row.classList.add('codeben-module-hidden');
    });

    var detail = document.querySelector('[data-codeben-modules-close]');
    if (!detail) {
      detail = document.createElement('div');
      detail.dataset.codebenModulesClose = 'true';
      benefits.parentElement.appendChild(detail);
    }
    detail.innerHTML = '<div class="codeben-module-detail"><p class="codeben-module-kicker">Módulo 01 · 25 minutos de execução. Não 10 horas de enrolação.</p><h3>Veja o processo acontecer.</h3><p>Em cerca de 25 minutos, você acompanha o processo sendo executado de verdade: da referência até a construção.</p><p>Você vê como analisar o site, trabalhar a estrutura, conversar com a IA, corrigir o que ela entrega, refatorar, ajustar o resultado e levar o projeto adiante.</p><p>Você não está pagando por minutos de vídeo. Está pagando pelo processo que consegue repetir depois que o vídeo termina.</p></div><div class="codeben-module-detail"><p class="codeben-module-kicker">Módulo 02 · Agora você recebe o que precisa para repetir.</p><h3>O arsenal para continuar fazendo.</h3><p>A aula mostra o processo. Este módulo coloca as ferramentas na sua mão.</p><ul><li><strong>Agente</strong> — contexto e consistência para conduzir a execução.</li><li><strong>CODEBEN Site Cloner</strong> — captura e estudo de estruturas, com acesso vitalício.</li><li><strong>Prompts</strong> — pontos de partida para direcionar melhor a IA.</li><li><strong>Comandos</strong> — execução, correção e refatoração.</li><li><strong>Skill</strong> — contexto para a IA trabalhar com você.</li><li><strong>Plugins</strong> — menos trabalho manual durante a execução.</li></ul><p class="codeben-module-principle">No primeiro módulo, você aprende o processo.<br>No segundo, recebe o arsenal para repetir.</p><p class="codeben-module-close-line">Você não precisa de mais conteúdo. Precisa de um processo que consiga repetir.</p></div>';
    if (!document.querySelector('[data-codeben-extension-section]')) {
      var extension = document.createElement('div');
      extension.dataset.codebenExtensionSection = 'true';
      extension.className = 'codeben-extension-section';
      extension.innerHTML = '<p class="codeben-extension-kicker">Extensão CODEBEN</p><h3>CODEBEN Site Cloner</h3><p class="codeben-extension-lead">Capture referências, estude estruturas e transforme o que você encontra em direção para os seus próprios projetos.</p><div class="codeben-extension-points"><span>Captura páginas</span><span>Estuda estruturas</span><span>Refina com a IA</span></div><p class="codeben-extension-note">Acesso vitalício para continuar executando depois da aula.</p>';
      benefits.parentElement.appendChild(extension);
    }
  }

  function makeVideoSlot(key, label) {
    var slot = document.createElement('div');
    slot.className = 'codeben-video-slot';
    slot.dataset.codebenVideoSlot = key;
    slot.innerHTML = '<span class="codeben-video-slot-mark">Vídeo</span><strong>' + label + '</strong><small>Espaço reservado para adicionar este vídeo</small>';
    return slot;
  }

  function ensureVideoSlot(parent, key, label, reference) {
    if (!parent || parent.querySelector('[data-codeben-video-slot="' + key + '"]')) return;
    var slot = makeVideoSlot(key, label);
    try {
      if (reference && reference.parentElement === parent) parent.insertBefore(slot, reference.nextSibling);
      else parent.appendChild(slot);
    } catch (error) {
      parent.appendChild(slot);
    }
  }

  function makeVideoMedia(key, src, label) {
    var video = document.createElement('video');
    video.className = 'codeben-video-media';
    video.dataset.codebenVideoKey = key;
    video.src = src;
    video.muted = true;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', label);
    video.setAttribute('title', label);
    video.addEventListener('loadeddata', function () {
      var playback = video.play();
      if (playback && playback.catch) playback.catch(function () {});
    });
    return video;
  }

  // Mobile keeps the first visual responsive and defers every lower-page video
  // until it is close to the viewport. This avoids downloading the whole gallery
  // during the critical first render on slower connections.
  function setupMobileVideoLoading() {
    if (!window.matchMedia || !window.matchMedia('(max-width: 809px)').matches) return;
    var videos = Array.prototype.slice.call(document.querySelectorAll('video'));
    var observer = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var video = entry.target;
        observer.unobserve(video);
        var src = video.dataset.codebenLazySrc;
        if (src && !video.getAttribute('src')) {
          video.setAttribute('src', src);
          video.load();
        }
        video.autoplay = true;
        var playback = video.play();
        if (playback && playback.catch) playback.catch(function () {});
      });
    }, { rootMargin: '500px 0px' }) : null;
    videos.forEach(function (video, index) {
      video.preload = index === 0 ? 'metadata' : 'none';
      if (index === 0 || !video.getAttribute('src')) return;
      video.dataset.codebenLazySrc = video.getAttribute('src');
      video.dataset.codebenMobileDeferred = 'true';
      video.removeAttribute('src');
      video.autoplay = false;
      video.load();
      if (observer) observer.observe(video);
    });
  }

  function replaceVideoSlot(key, src, label) {
    var slot = document.querySelector('[data-codeben-video-slot="' + key + '"]');
    if (!slot) return;
    slot.replaceWith(makeVideoMedia(key, src, label));
  }

  function hydrateVideoAssets() {
    var projectSection = document.querySelector('section.framer-w6lvb9');
    var projectVideo = projectSection && projectSection.querySelector('video');
    if (projectVideo) {
      var projectSrc = '/assets/media/codeben-projects.mp4';
      if (projectVideo.getAttribute('src') !== projectSrc) {
        projectVideo.setAttribute('src', projectSrc);
        projectVideo.load();
      }
      projectVideo.classList.add('codeben-project-video');
      projectVideo.muted = true;
      projectVideo.loop = true;
      projectVideo.autoplay = true;
      projectVideo.playsInline = true;
      var playback = projectVideo.play();
      if (playback && playback.catch) playback.catch(function () {});
      var projectSlot = document.querySelector('[data-codeben-video-slot="projects"]');
      if (projectSlot) projectSlot.remove();
    }
    replaceVideoSlot('process', '/assets/media/codeben-process.mp4', 'Vídeo curto — referência → processo → resultado');
    replaceVideoSlot('extension', '/assets/media/codeben-extension.mp4', 'Vídeo curto — extensão clonando o site');
    replaceVideoSlot('scenes', '/assets/media/codeben-scenes.mp4', 'Vídeo — cenas 3D');
    replaceVideoSlot('gsap', '/assets/media/codeben-gsap.mp4', 'Vídeo — GSAP / scroll');
    replaceVideoSlot('sections', '/assets/media/codeben-backgrounds.mp4', 'Vídeo — backgrounds');
    replaceVideoSlot('template', '/assets/media/codeben-template.mp4', 'Vídeo — site / template');

    var mediaSources = {
      process: '/assets/media/codeben-process.mp4',
      extension: '/assets/media/codeben-extension.mp4',
      scenes: '/assets/media/codeben-scenes.mp4',
      gsap: '/assets/media/codeben-gsap.mp4',
      sections: '/assets/media/codeben-backgrounds.mp4',
      template: '/assets/media/codeben-template.mp4'
    };
    document.querySelectorAll('video[data-codeben-video-key]').forEach(function (video) {
      var source = mediaSources[video.dataset.codebenVideoKey];
      if (source && !video.dataset.codebenMobileDeferred && video.getAttribute('src') !== source) {
        video.src = source;
        video.load();
      }
    });

    var templateVideo = document.querySelector('video[data-codeben-video-key="template"]');
    if (templateVideo && !templateVideo.parentElement.hasAttribute('data-codeben-template-video-frame')) {
      var templateFrame = document.createElement('div');
      templateFrame.className = 'codeben-template-video-frame';
      templateFrame.dataset.codebenTemplateVideoFrame = 'true';
      templateVideo.replaceWith(templateFrame);
      templateFrame.appendChild(templateVideo);
    }

    var scenesVideo = document.querySelector('video[data-codeben-video-key="scenes"]');
    if (scenesVideo && !scenesVideo.parentElement.hasAttribute('data-codeben-scenes-video-frame')) {
      var scenesFrame = document.createElement('div');
      scenesFrame.className = 'codeben-scenes-video-frame';
      scenesFrame.dataset.codebenScenesVideoFrame = 'true';
      scenesVideo.replaceWith(scenesFrame);
      scenesFrame.appendChild(scenesVideo);
    }

    var gsapVideo = document.querySelector('video[data-codeben-video-key="gsap"]');
    if (gsapVideo && !gsapVideo.parentElement.hasAttribute('data-codeben-gsap-video-frame')) {
      var gsapFrame = document.createElement('div');
      gsapFrame.className = 'codeben-gsap-video-frame';
      gsapFrame.dataset.codebenGsapVideoFrame = 'true';
      gsapVideo.replaceWith(gsapFrame);
      gsapFrame.appendChild(gsapVideo);
    }
  }

  function applyEditorialCopy() {
    var mobileHero = document.querySelector('section.framer-18ndqqk');
    var desktopHero = document.querySelector('section.framer-p1ldqa');
    var contentSection = document.querySelector('section.framer-w6lvb9');
    var isNarrow = window.innerWidth < 810;

    // The Framer export has a mobile hero variant and a desktop hero variant.
    // Keep the original visual treatment and only replace the editorial copy.
    if (isNarrow && mobileHero) {
      mobileHero.classList.add('codeben-mobile-hero');
      var mobileHeadings = mobileHero.querySelectorAll('h1');
      if (mobileHeadings[0]) mobileHeadings[0].textContent = 'A IA já consegue criar sites.';
      if (mobileHeadings[1]) mobileHeadings[1].textContent = 'O problema é que quase todo mundo termina com o mesmo site.';
      var mobileParagraph = mobileHero.querySelector('.framer-19jytx8 p');
      if (mobileParagraph) {
        mobileParagraph.classList.add('codeben-editorial-hero-line');
        mobileParagraph.innerHTML = 'Na CODEBEN, você aprende a usar referências, IA e código para construir páginas com mais movimento, direção e acabamento — sem precisar descobrir tudo sozinho do zero.<br><br>Você já tem a ferramenta. Agora falta aprender a tirar dela um resultado que realmente pareça profissional.';
      }
      var mobileScroll = Array.prototype.slice.call(mobileHero.querySelectorAll('p')).find(function (item) { return item.textContent.indexOf('Em vez de começar') !== -1; });
      if (mobileScroll) mobileScroll.textContent = 'Role para ver como funciona';
    }

    if (!isNarrow && desktopHero) {
      var desktopHeadings = desktopHero.querySelectorAll('h1');
      if (desktopHeadings[0]) desktopHeadings[0].textContent = 'A IA já consegue criar sites.';
      if (desktopHeadings[1]) desktopHeadings[1].textContent = 'O problema é que quase todo mundo termina com o mesmo site.';
      var desktopParagraph = desktopHero.querySelector('p:not([class*="rolling-text"])');
      if (desktopParagraph) {
        desktopParagraph.classList.add('codeben-editorial-hero-line');
        desktopParagraph.textContent = 'Na CODEBEN, você aprende a usar referências, IA e código para construir páginas com mais movimento, direção e acabamento — sem precisar descobrir tudo sozinho do zero.';
      }
      var desktopScroll = Array.prototype.slice.call(desktopHero.querySelectorAll('p')).find(function (item) { return item.textContent.indexOf('Role') !== -1; });
      if (desktopScroll) desktopScroll.textContent = 'Role para ver como funciona';
    }

    if (contentSection) {
      var badge = contentSection.querySelector('[data-framer-name="Badge"] p');
      if (badge) badge.textContent = 'Projetos CODEBEN';
      var contentHeading = contentSection.querySelector('h1');
      var contentSub = contentSection.querySelector('h3');
      var projectVideoWrap = contentSection.querySelector('.codeben-project-video-wrap');
      if (contentHeading) contentHeading.textContent = 'Você não precisa aceitar o primeiro resultado que a IA te entrega.';
      if (contentSub) contentSub.textContent = 'Você pode conduzir ela até algo muito melhor.';
      var oldHeroCopy = contentSection.querySelector('[data-codeben-hero-copy]');
      if (oldHeroCopy) oldHeroCopy.remove();
      if (!contentSection.querySelector('[data-codeben-project-intro]')) {
        var projectIntro = document.createElement('div');
        projectIntro.dataset.codebenProjectIntro = 'true';
        projectIntro.className = 'codeben-project-intro';
        projectIntro.innerHTML = '<p>Você provavelmente já viu a IA gerar um site. Funciona. Mas normalmente falta alguma coisa.</p><p>Falta movimento. Falta acabamento. Falta aquela sensação de que alguém realmente pensou no projeto.</p>';
        var projectVideo = contentSection.querySelector('.codeben-project-video-wrap');
        try {
          if (projectVideo && projectVideo.parentElement === contentSection) contentSection.insertBefore(projectIntro, projectVideo);
          else contentSection.appendChild(projectIntro);
        } catch (error) {
          contentSection.appendChild(projectIntro);
        }
      }
      ensureVideoSlot(contentSection, 'projects', 'Vídeos dos projetos / sites imersivos', projectVideoWrap);
      if (!contentSection.querySelector('[data-codeben-project-story]')) {
        var story = document.createElement('div');
        story.dataset.codebenProjectStory = 'true';
        story.className = 'codeben-project-story';
        story.innerHTML = '<p>É exatamente aí que entra a CODEBEN. Você aprende a pegar uma boa referência, entender o que faz aquele site ser interessante e usar isso para direcionar a IA na construção do seu próprio projeto.</p><p><strong>Não é deixar a IA decidir tudo.</strong> É aprender a fazer ela trabalhar na direção que você quer.</p>';
        contentSection.appendChild(story);
      }
    }

    var moduleSection = document.querySelector('section.framer-1qh7qe0');
    if (moduleSection) {
      var sectionHeading = moduleSection.querySelector('[data-framer-name="Heading"]');
      if (sectionHeading) {
        var label = sectionHeading.querySelector('p');
        if (label && label.textContent.trim() === 'Sistema') label.textContent = 'Sistema';
        var title = sectionHeading.querySelector('.codeben-modules-title');
        if (title) title.textContent = '2 módulos. Porque você não precisa de mais 10 horas de conteúdo.';
        var intro = sectionHeading.querySelector('[data-codeben-modules-intro]');
        if (intro) intro.textContent = 'Você precisa entender o processo. E depois conseguir repetir sozinho. Por isso a CODEBEN é simples.';
      }
      var benefits = moduleSection.querySelector('#benefits');
      if (benefits) {
        var moduleCards = Array.prototype.slice.call(benefits.querySelectorAll('[data-framer-name="Text"]')).slice(0, 2);
        var cardCopies = ['Você me vê fazendo.\nAula prática de aproximadamente 25 minutos, mostrando o processo da referência até o projeto.', 'Agora você faz.\nVocê recebe o arsenal usado durante a execução para aplicar o mesmo processo nos seus projetos.'];
        moduleCards.forEach(function (card, index) {
          var copy = card.querySelector('.framer-1q1nfdt p');
          if (copy) {
            copy.textContent = cardCopies[index];
            copy.classList.add('codeben-module-copy');
          }
        });
      }
      if (benefits && !moduleSection.querySelector('[data-codeben-process-block]')) {
        var process = document.createElement('div');
        process.dataset.codebenProcessBlock = 'true';
        process.className = 'codeben-process-block';
        process.innerHTML = '<p class="codeben-process-kicker">O processo</p><h2>Em vez de começar do zero, você começa com uma vantagem.</h2><p>Você encontrou um site incrível? Uma interação que você queria saber fazer? Uma seção diferente? Um efeito que normalmente demoraria horas para tentar reconstruir?</p><p>Você não precisa mais ficar apenas olhando aquilo como inspiração. Você aprende a usar essa referência como parte do processo.</p><div class="codeben-process-sequence"><span>Referência.</span><span>Direção.</span><span>IA.</span><span>Código.</span><span>Refinamento.</span></div><p>E, aos poucos, aquilo que parecia complexo começa a virar algo que você consegue construir.</p>';
        moduleSection.insertBefore(process, moduleSection.firstElementChild);
        ensureVideoSlot(process, 'process', 'Vídeo curto — referência → processo → resultado');
      }
      var detail = moduleSection.querySelector('[data-codeben-modules-close]');
      if (detail) {
        detail.innerHTML = '<div class="codeben-module-detail"><p class="codeben-module-kicker">Módulo 01 · Veja exatamente como eu faço.</p><h3>Da referência ao projeto.</h3><p>Nada de ficar assistindo teoria durante horas para só depois tentar entender como funciona. Você acompanha a execução acontecendo.</p><p>Como eu escolho uma referência. Como observo estrutura e movimento. Como levo esse contexto para a IA. Como corrijo quando ela erra. Como refatoro. Como adiciono interações. Como vou refinando até o projeto começar a ganhar identidade.</p><p class="codeben-module-principle">Você não termina a aula pensando:<br>“Legal… mas como eu faço isso?”</p><p>Você termina entendendo <strong>o processo que precisa repetir.</strong> E isso muda completamente a forma como você usa IA para construir sites.</p></div><div class="codeben-module-detail"><p class="codeben-module-kicker">Módulo 02 · E você não sai só com a aula.</p><h3>Você leva o meu arsenal junto.</h3><p>Porque seria inútil mostrar o processo e depois deixar você sozinho tentando reconstruir tudo.</p><p>Então você recebe os recursos usados para acelerar a execução.</p><ul><li><strong>Agente</strong> — para não precisar explicar todo o contexto novamente em cada projeto.</li><li><strong>Prompts</strong> — para você não ficar olhando para o chat sem saber o que pedir.</li><li><strong>Comandos</strong> — para executar, corrigir e refatorar com mais clareza.</li><li><strong>Skill</strong> — para dar mais contexto para a IA durante o trabalho.</li><li><strong>Plugins</strong> — para eliminar partes manuais do processo.</li></ul><p class="codeben-module-principle">E ainda tem uma ferramenta que faz uma diferença enorme:</p></div>';
      }
      var extension = moduleSection.querySelector('[data-codeben-extension-section]');
      if (extension) {
        extension.innerHTML = '<p class="codeben-extension-kicker">Extensão CODEBEN</p><h3>CODEBEN Site Cloner.</h3><p class="codeben-extension-lead">Você encontrou uma referência boa? Capture.</p><p class="codeben-extension-copy">Em vez de analisar tudo manualmente ou tentar reconstruir uma página apenas olhando para ela, você pode capturar a referência e trabalhar em cima daquela estrutura durante o processo.</p><p class="codeben-extension-copy">E ela não é uma assinatura. <strong>O acesso é vitalício.</strong></p><div class="codeben-extension-points"><span>Captura referências</span><span>Estuda estruturas</span><span>Economiza tempo</span></div><p class="codeben-extension-note">Ela não substitui o método. Ela faz parte dele.</p>';
        ensureVideoSlot(extension, 'extension', 'Vídeo curto — extensão clonando o site');
      }
      if (!moduleSection.querySelector('[data-codeben-results-section]')) {
        var results = document.createElement('div');
        results.dataset.codebenResultsSection = 'true';
        results.className = 'codeben-results-section';
        results.innerHTML = '<p class="codeben-results-kicker">Veja o que você pode construir</p><h2>A diferença aparece no resultado.</h2><p>Você não precisa dominar tudo isso antes de começar. Precisa aprender a pesquisar boas referências e conduzir a execução.</p>';
        ensureVideoSlot(results, 'template', 'Vídeo — site / template');
        ensureVideoSlot(results, 'gsap', 'Vídeo — GSAP / scroll');
        ensureVideoSlot(results, 'scenes', 'Vídeo — cenas 3D');
        ensureVideoSlot(results, 'sections', 'Vídeo — sections / backgrounds');
        moduleSection.appendChild(results);
      }
    }

    var offer = document.querySelector('.codeben-offer-section');
    if (offer) {
      var offerTitle = offer.querySelector('.codeben-offer-title');
      if (offerTitle) offerTitle.textContent = 'Agora coloca tudo na ponta do lápis.';
      var offerHeading = offer.querySelector('[data-framer-name="Heading"]');
      if (offerHeading) {
        var offerBadge = offerHeading.querySelector('[data-framer-name="Badge"] p');
        if (offerBadge) offerBadge.textContent = 'Oferta';
      }
      if (!offer.querySelector('[data-codeben-offer-lead]')) {
        var offerLead = document.createElement('p');
        offerLead.dataset.codebenOfferLead = 'true';
        offerLead.className = 'codeben-offer-lead';
        offerLead.textContent = 'Você recebe o método, a aula prática, o processo completo, o agente, os prompts, os comandos, a skill, os plugins, o suporte, as próximas atualizações e a Extensão CODEBEN Site Cloner com acesso vitalício.';
        var pricing = offer.querySelector('[data-framer-name="Pricing container"]');
        if (pricing) offer.insertBefore(offerLead, pricing);
      }
      var offerItems = offer.querySelectorAll('.codeben-pricing-copy p');
      var desiredItems = ['✓ Método CODEBEN completo', '✓ Sites imersivos com IA na prática', '✓ Processo de referência até refinamento', '✓ Agente + prompts + comandos', '✓ Skill + plugins'];
      var itemIndex = 0;
      Array.prototype.forEach.call(offerItems, function (item) {
        if ((item.textContent || '').trim().indexOf('✓') === 0 && desiredItems[itemIndex]) item.textContent = desiredItems[itemIndex++];
      });
      var checklist = offer.querySelector('.codeben-pricing-copy [data-framer-name="Features"]');
      if (checklist && !checklist.querySelector('[data-codeben-extra-offer-items]')) {
        var extra = document.createElement('div');
        extra.dataset.codebenExtraOfferItems = 'true';
        extra.className = 'codeben-extra-offer-items';
        extra.innerHTML = '<p>✓ EXTENSÃO CODEBEN Site Cloner vitalícia</p><p>✓ Atualizações futuras</p><p>✓ Suporte</p><p>✓ Pagamento único</p>';
        checklist.appendChild(extra);
      }
      if (!offer.querySelector('[data-codeben-closing-note]')) {
        var closingNote = document.createElement('p');
        closingNote.dataset.codebenClosingNote = 'true';
        closingNote.className = 'codeben-closing-note';
        closingNote.textContent = 'Não é sobre assistir mais um curso. Em vez de começar todo projeto do zero, comece com vantagem.';
        offer.appendChild(closingNote);
      }
    }

  }

  function replaceBonusVisuals() {
    var visuals = [
      { name: 'Templates', key: 'method', title: 'Método CODEBEN', meta: 'Referência → execução' },
      { name: 'Cenas 3d', key: 'cloner', title: 'CODEBEN Site Cloner', meta: 'Capturar → estudar → refatorar' },
      { name: 'Backgrounds', key: 'updates', title: 'Atualizações futuras', meta: 'O processo continua evoluindo' },
      { name: 'Sections', key: 'support', title: 'Suporte', meta: 'Continue executando' }
    ];
    visuals.forEach(function (item) {
      document.querySelectorAll('[data-framer-name="' + item.name + '"]').forEach(function (host) {
        if (host.dataset.codebenBonusHost) return;
        host.dataset.codebenBonusHost = item.key;
        host.querySelectorAll('iframe').forEach(function (frame) { frame.style.display = 'none'; });
        var art = document.createElement('div');
        art.className = 'codeben-bonus-art codeben-art-' + item.key;
        art.innerHTML = '<span class="codeben-bonus-art-title">' + item.title + '</span><span class="codeben-bonus-art-meta">' + item.meta + '</span>';
        host.appendChild(art);
      });
    });
  }

  function removeBonusSection() {
    document.querySelectorAll('section[data-framer-name="BÔNUS"], section#solutions').forEach(function (section) {
      section.remove();
    });
  }

  function removeLegacyImages() {
    document.querySelectorAll('.framer-1y2k4l8[data-framer-name="Logos"], .framer-2ev052[data-framer-name="Logos"], .framer-wvlein[data-framer-name="Logo 1"]').forEach(function (element) {
      element.remove();
    });
  }

  function hideStats() {
    ['Sites entregues por alunos', 'Novos membros nas últimas 24h', 'Horas de conteúdo'].forEach(function (label) {
      var item = findText(label);
      if (!item) return;
      var block = item.closest('section > div > div') || item.parentElement;
      if (block) block.classList.add('codeben-hide-stats');
      var statsSection = item.closest('section');
      if (statsSection) statsSection.classList.add('codeben-stats-section');
    });
  }

  function setCta(anchor, ctaLabel) {
    if (!anchor || (anchor.classList.contains('codeben-cta') && anchor.getAttribute('href') === CHECKOUT && anchor.dataset.codebenCtaLabel === ctaLabel)) return;
    anchor.href = CHECKOUT;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.setAttribute('aria-label', ctaLabel + ' — checkout CODEBEN');
    var rolling = anchor.querySelector('p[class*="rolling-text-inner"]');
    if (rolling) {
      var firstSpan = rolling.querySelector('span');
      var spanStyle = firstSpan && firstSpan.getAttribute('style');
      ['display', 'width', 'min-width', 'overflow', 'white-space', 'text-shadow', 'color'].forEach(function (property) {
        rolling.style.removeProperty(property);
      });
      rolling.textContent = '';
      Array.prototype.forEach.call(ctaLabel, function (letter, index) {
        var span = document.createElement('span');
        if (spanStyle) span.setAttribute('style', spanStyle);
        span.style.setProperty('--codeben-letter-index', index);
        span.textContent = letter === ' ' ? '\u00a0' : letter;
        rolling.appendChild(span);
      });
    } else {
      anchor.textContent = ctaLabel;
    }
    anchor.classList.add('codeben-cta');
    anchor.dataset.codebenCtaLabel = ctaLabel;
  }

  function setupCtaLinks() {
    if (window.__codebenCtaObserverReady) return;
    window.__codebenCtaObserverReady = true;
    var scan = function () {
      document.querySelectorAll('a').forEach(function (anchor) {
        var label = (anchor.textContent || '').replace(/\s+/g, ' ').trim();
        if (!(anchor.matches('a[href*="cakto.com"]') || /ACESSAR WORKFLOW|COMEÇAR|ENTRAR NA CODEBEN|PRIMEIRO RESULTADO|SUBIR O NÍVEL|QUERO ESSE MÉTODO|ENTRAR AGORA/i.test(label) || anchor.classList.contains('codeben-cta'))) return;
        var section = anchor.closest('section');
        var ctaLabel = section && section.classList.contains('framer-w6lvb9') ? CTA_LABELS[1] :
          section && section.classList.contains('framer-50ocvf') ? CTA_LABELS[2] : CTA_LABELS[0];
        setCta(anchor, ctaLabel);
      });
    };
    scan();
    document.addEventListener('click', function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest('a.codeben-cta') : null;
      if (!anchor) return;
      var destination = anchor.getAttribute('href');
      if (!destination || destination.indexOf(CHECKOUT) !== 0) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      var popup = window.open(destination, '_blank', 'noopener,noreferrer');
      if (!popup) window.location.assign(destination);
    }, true);
    if (!window.MutationObserver || !document.body) return;
    var queued = false;
    var observer = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        scan();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function applyCopy() {
    document.title = 'CODEBEN — Sites imersivos com IA';
    removeBonusSection();
    removeLegacyImages();
    var headings = Array.prototype.slice.call(document.querySelectorAll('h1'));
    if (headings[0]) headings[0].textContent = 'A IA já consegue criar sites.';
    if (headings[1]) headings[1].textContent = 'Agora aprenda a fazer ela ir muito mais longe.';

    replaceText('Acesse o workflow completo para criar e vender sites: IA, design, templates, estratégias e clientes.', 'Aprenda a usar referências, IA e código para transformar páginas genéricas em projetos com direção, movimento e acabamento.');
    replaceText('Role a página para saber o que está incluso', 'Role para ver o processo completo');
    replaceExact('Veja o que você vai criar.', 'Com o método, você vai muito além do rascunho.');
    replaceText('Você vai ficar de fora?', 'A IA JÁ CONSEGUE. AGORA FALTA DIREÇÃO.');
    replaceElement('Um único sistema.', 'DA REFERÊNCIA AO PROJETO PUBLICADO.');

    var modules = {
      'Entenda o que faz um site parecer premium': 'Leia o que faz uma interface funcionar',
      'Encontre e transforme referências': 'Encontre e decomponha referências',
      'Use IA para construir': 'Conduza a IA com direção',
      'Crie sites de alto nível do zero': 'Refatore o primeiro resultado',
      'Domine movimento e interação': 'Adicione movimento e interação',
      'Publique e entregue seus projetos': 'Ajuste responsividade e publique',
      'Aprenda a conseguir clientes': 'Capture estruturas para estudar',
      'Venda projetos de alto valor': 'Transforme a lógica em algo seu'
    };
    Object.keys(modules).forEach(function (from) { replaceExact(from, modules[from]); });
    replaceText('Desenvolva seu olhar para identificar o que torna um site premium.', 'Aprenda a reconhecer estrutura, ritmo e acabamento.');
    replaceText('Encontre referências e transforme inspiração em direção visual.', 'Separe composição, tipografia e movimento antes de pedir.');
    replaceText('Use IA para acelerar seu processo de criação.', 'Use a IA para executar decisões com contexto.');
    replaceText('Construa sites completos do zero.', 'Leve a referência até um projeto publicado.');
    replaceText('Adicione movimento e interação.', 'Refine comportamento, scroll e estados.');
    replaceText('Publique e entregue projetos profissionais.', 'Ajuste responsividade e publique com segurança.');
    replaceText('Aprenda a encontrar e conquistar clientes.', 'Capture páginas para estudar estruturas.');
    replaceText('Aprenda a negociar e vender projetos de alto valor.', 'Transforme a lógica de uma referência em algo seu.');

    replaceElement('Tudo que você precisa', 'Você não está comprando só aulas.');
    var offerTitle = findText('Você não está comprando só aulas.');
    if (offerTitle) {
      var offerHeading = offerTitle.closest('h1,h2,h3,h4,h5,h6') || offerTitle;
      offerHeading.classList.add('codeben-offer-title');
      if (offerHeading.parentElement) offerHeading.parentElement.classList.add('codeben-offer-title-wrap');
      var offerSection = offerHeading.closest('section');
      if (offerSection) {
        offerSection.classList.add('codeben-offer-section');
        var pricingContainer = offerSection.querySelector('[data-framer-name="Pricing container"]');
        if (pricingContainer) pricingContainer.classList.add('codeben-pricing-copy');
      }
    }
    replaceExact('Pagamento único. Sem mensalidade.', 'Processo + ferramenta.');
    var priceCopy = findText('Processo + ferramenta.');
    if (priceCopy) (priceCopy.closest('p') || priceCopy).classList.add('codeben-price-copy');
    replaceExact('9x R$6,55', '12x R$9,90');
    replaceText('R$49,90', 'R$89,90 à vista');

    document.querySelectorAll('video').forEach(function (video) {
      if (video.dataset.codebenVideoKey) return;
      var nextSrc = '/assets/media/codeben-result.mp4';
      if (video.getAttribute('src') !== nextSrc) {
        video.setAttribute('src', nextSrc);
        video.load();
      }
      video.classList.add('codeben-project-video');
      if (video.parentElement) {
        video.parentElement.classList.add('codeben-project-video-frame');
        if (video.parentElement.parentElement) {
          video.parentElement.parentElement.classList.add('codeben-project-video-card');
          if (video.parentElement.parentElement.parentElement) video.parentElement.parentElement.parentElement.classList.add('codeben-project-video-wrap');
        }
      }
      video.loop = true;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      var playback = video.play();
      if (playback && playback.catch) playback.catch(function () {});
    });
    replaceText('ACESSAR WORKFLOW', 'QUERO APRENDER');
    replaceExact('Não é só um Masterclass.', 'Você também leva uma ferramenta.');
    replaceExact('Veja o que você também vai receber.', 'Captura. Entende. Transforma.');
    replaceText('Templates premium.', 'Método CODEBEN.');
    replaceText('Projetos prontos para adaptar e usar como ponto de partida.', 'Da referência ao projeto publicado, com direção para cada etapa.');
    replaceText('Cenas 3D.', 'CODEBEN Site Cloner.');
    replaceText('Cenas prontas para acelerar a interatividade do seu site.', 'Acesso vitalício para capturar páginas e estudar estruturas.');
    replaceText('Backgrounds em 4K.', 'Atualizações futuras.');
    replaceText('Backgrounds prontos para acelerar a personalização do seu site.', 'O processo acompanha a evolução das ferramentas.');
    replaceText('Seções prontas.', 'Suporte.');
    replaceText('Seções prontas para acelerar a montagem do seu site.', 'Quando você travar, continua executando.');
    replaceText('✓ Masterclass completa', '✓ Método CODEBEN completo');
    replaceText('✓ 15 templates premium (exclusivos)', '✓ CODEBEN Site Cloner com acesso vitalício');
    replaceText('✓ 25+ horas de aulas planejadas', '✓ Processo de referência, direção, execução e refinamento');
    replaceText('✓ Suporte 24hr', '✓ Suporte para continuar executando');
    replaceExact('✓ Acesso vitalício', '✓ Pagamento único, sem mensalidade');

    hideStats();
    addExtensionNote();
    setupTwoModules();
    applyEditorialCopy();
    setupCtaLinks();
  }

  function setupHeadlineMotion() {
    var headings = document.querySelectorAll(
      'section.framer-p1ldqa h1, section.framer-18ndqqk h1, ' +
      'section.framer-w6lvb9 h1, section.framer-w6lvb9 h3, ' +
      '.codeben-process-block h2, .codeben-modules-title, ' +
      '.codeben-module-detail h3, .codeben-extension-section h3, ' +
      '.codeben-results-section h2, .codeben-offer-title'
    );
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('codeben-headline-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    headings.forEach(function (heading) {
      if (heading.dataset.codebenHeadlineObserved) return;
      heading.dataset.codebenHeadlineObserved = 'true';
      heading.classList.add('codeben-glow-headline');
      observer.observe(heading);
    });
  }

  function start() {
    var main = document.querySelector('#main');
    if (main && window.MutationObserver) {
      var hydrateObserver = new MutationObserver(function () {
        if (!main.isConnected) return;
        removeLegacyImages();
        if (document.querySelector('[data-codeben-extension-section]')) return;
        applyCopy();
        hydrateVideoAssets();
        setupMobileVideoLoading();
        setupHeadlineMotion();
      });
      hydrateObserver.observe(main, { childList: true, subtree: true });
    }
    applyCopy();
    hydrateVideoAssets();
    setupMobileVideoLoading();
    document.body.classList.add('codeben-ready');
    window.requestAnimationFrame(setupHeadlineMotion);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
}());
