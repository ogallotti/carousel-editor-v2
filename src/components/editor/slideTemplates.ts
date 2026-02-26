// ============================================================
// Slide Templates — Preset slide configurations for quick creation
// ============================================================

import type { Slide, SlideElement } from '@/types/schema';

export interface SlideTemplate {
  name: string;
  icon: string;
  slide: Omit<Slide, 'id'>;
}

export const SLIDE_TEMPLATES: SlideTemplate[] = [
  // 1. Em branco (blank)
  {
    name: 'Em branco',
    icon: '⬜',
    slide: {
      layout: 'title-body',
      elements: [],
    },
  },

  // 2. Capa
  {
    name: 'Capa',
    icon: '🎯',
    slide: {
      layout: 'cover',
      elements: [
        { id: '_tpl_emoji', type: 'emoji', content: '\u{1F680}', size: 96 },
        { id: '_tpl_h1', type: 'heading', level: 1, content: 'T\u00edtulo da Capa', textAlign: 'center' },
        { id: '_tpl_sub', type: 'subtitle', content: 'Subt\u00edtulo aqui', textAlign: 'center' },
      ] as SlideElement[],
    },
  },

  // 3. Titulo + Corpo
  {
    name: 'T\u00edtulo + Corpo',
    icon: '\u{1F4DD}',
    slide: {
      layout: 'title-body',
      elements: [
        { id: '_tpl_tag', type: 'tag', content: 'TAG', textAlign: 'center' },
        { id: '_tpl_h2', type: 'heading', level: 2, content: 'T\u00edtulo do Slide', textAlign: 'center' },
        { id: '_tpl_p', type: 'paragraph', content: 'Escreva o conte\u00fado aqui. Voc\u00ea pode editar este texto livremente.', textAlign: 'center' },
      ] as SlideElement[],
    },
  },

  // 4. Lista com Icones
  {
    name: 'Lista com \u00cdcones',
    icon: '\u2705',
    slide: {
      layout: 'list',
      elements: [
        { id: '_tpl_h2', type: 'heading', level: 2, content: 'Lista', textAlign: 'center' },
        { id: '_tpl_li1', type: 'list-item', icon: '\u2713', content: 'Primeiro item da lista', textAlign: 'left' },
        { id: '_tpl_li2', type: 'list-item', icon: '\u2713', content: 'Segundo item da lista', textAlign: 'left' },
        { id: '_tpl_li3', type: 'list-item', icon: '\u2713', content: 'Terceiro item da lista', textAlign: 'left' },
      ] as SlideElement[],
    },
  },

  // 5. Citacao
  {
    name: 'Cita\u00e7\u00e3o',
    icon: '\u275D',
    slide: {
      layout: 'quote',
      elements: [
        { id: '_tpl_quote', type: 'quote', content: 'Insira aqui uma cita\u00e7\u00e3o inspiradora ou relevante para o seu conte\u00fado.', textAlign: 'center' },
        { id: '_tpl_emoji', type: 'emoji', content: '\u{1F4AC}', size: 64 },
      ] as SlideElement[],
    },
  },

  // 6. Destaque
  {
    name: 'Destaque',
    icon: '\u2728',
    slide: {
      layout: 'highlight',
      elements: [
        { id: '_tpl_h2', type: 'heading', level: 2, content: 'Destaque', textAlign: 'center' },
        { id: '_tpl_hl', type: 'highlight', content: 'Este \u00e9 um texto em destaque que chama aten\u00e7\u00e3o do leitor.', textAlign: 'center' },
      ] as SlideElement[],
    },
  },

  // 8. CTA / Final
  {
    name: 'CTA / Final',
    icon: '\u{1F4E3}',
    slide: {
      layout: 'cta',
      elements: [
        { id: '_tpl_h1', type: 'heading', level: 1, content: 'Gostou?', textAlign: 'center' },
        { id: '_tpl_p', type: 'paragraph', content: 'Salve este post e compartilhe com quem precisa ver isso!', textAlign: 'center' },
        { id: '_tpl_emoji', type: 'emoji', content: '\u{1F449}', size: 96 },
      ] as SlideElement[],
    },
  },

  // 9. Imagem + Texto
  {
    name: 'Imagem + Texto',
    icon: '\u{1F5BC}',
    slide: {
      layout: 'image-top',
      elements: [
        { id: '_tpl_img', type: 'image', src: '', alt: '', variant: 'area' as const },
        { id: '_tpl_h2', type: 'heading', level: 2, content: 'T\u00edtulo', textAlign: 'center' },
        { id: '_tpl_p', type: 'paragraph', content: 'Descri\u00e7\u00e3o da imagem ou conte\u00fado complementar.', textAlign: 'center' },
      ] as SlideElement[],
    },
  },

  // 10. Freeform
  {
    name: 'Freeform',
    icon: '\u{1F3A8}',
    slide: {
      layout: 'freeform',
      elements: [
        { id: '_tpl_h1', type: 'heading', level: 1, content: 'Texto Livre', textAlign: 'center', x: 80, y: 200, w: 920 },
      ] as SlideElement[],
    },
  },
];
