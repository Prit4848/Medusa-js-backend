/**
 * Block Templates — Step 19
 *
 * Each template is a plain JS descriptor:
 *   { slug, label, category, icon, description, blocks[] }
 *
 * blocks[] items: { name, attributes?, innerBlocks? }
 * createBlock() is called lazily in App.jsx so all blocks are already
 * registered before the templates are applied.
 */

export const blockTemplates = [
  // ── Marketing ────────────────────────────────────────────────────────────────
  {
    slug: 'hero-section',
    label: 'Hero Section',
    category: 'Marketing',
    icon: '🌟',
    description: 'A centered hero heading, subtitle and CTA',
    blocks: [
      { name: 'core/heading',   attributes: { content: 'Welcome to Our Site', level: 1, textAlign: 'center' } },
      { name: 'core/paragraph', attributes: { content: 'The modern solution for teams who move fast. Simple, powerful, and affordable.', align: 'center' } },
      { name: 'myapp/cta-block', attributes: { title: 'Get Started Today', buttonText: 'Sign Up Free', backgroundColor: '#f0f4ff' } },
    ],
  },
  {
    slug: 'cta-banner',
    label: 'CTA Banner',
    category: 'Marketing',
    icon: '📣',
    description: 'A call-to-action banner',
    blocks: [
      { name: 'myapp/cta-block', attributes: { title: 'Ready to Get Started?', buttonText: 'Start Free Trial', backgroundColor: '#f0f4ff' } },
    ],
  },
  {
    slug: 'testimonial-card',
    label: 'Testimonial Card',
    category: 'Marketing',
    icon: '💬',
    description: 'Customer quote / testimonial block',
    blocks: [
      { name: 'myapp/testimonial', attributes: { quote: 'This is the best tool I have used. It saved our team hours every week.', author: 'Jane Doe, Product Manager', accentColor: '#3858e9' } },
    ],
  },

  // ── Layout ───────────────────────────────────────────────────────────────────
  {
    slug: 'two-column-text',
    label: 'Two-Column Text',
    category: 'Layout',
    icon: '🗂️',
    description: 'Side-by-side text columns',
    blocks: [
      {
        name: 'core/columns',
        attributes: {},
        innerBlocks: [
          {
            name: 'core/column', attributes: {},
            innerBlocks: [
              { name: 'core/heading',   attributes: { content: 'Left Column', level: 3 } },
              { name: 'core/paragraph', attributes: { content: 'Add your left-side content here.' } },
            ],
          },
          {
            name: 'core/column', attributes: {},
            innerBlocks: [
              { name: 'core/heading',   attributes: { content: 'Right Column', level: 3 } },
              { name: 'core/paragraph', attributes: { content: 'Add your right-side content here.' } },
            ],
          },
        ],
      },
    ],
  },

  // ── Content ──────────────────────────────────────────────────────────────────
  {
    slug: 'faq-section',
    label: 'FAQ Section',
    category: 'Content',
    icon: '❓',
    description: 'Two questions with answers',
    blocks: [
      { name: 'core/heading',   attributes: { content: 'Frequently Asked Questions', level: 2 } },
      { name: 'core/heading',   attributes: { content: 'Q: What is your return policy?', level: 4 } },
      { name: 'core/paragraph', attributes: { content: 'A: We offer a 30-day no-questions-asked return policy on all items.' } },
      { name: 'core/heading',   attributes: { content: 'Q: How do I track my order?', level: 4 } },
      { name: 'core/paragraph', attributes: { content: 'A: You will receive an email with tracking details once your order ships.' } },
    ],
  },
  {
    slug: 'contact-section',
    label: 'Contact Section',
    category: 'Content',
    icon: '✉️',
    description: 'Heading + contact info + divider',
    blocks: [
      { name: 'core/heading',   attributes: { content: 'Contact Us', level: 2, textAlign: 'center' } },
      { name: 'core/paragraph', attributes: { content: 'Have questions? Reach us at hello@example.com or call +1 (555) 000-0000.', align: 'center' } },
      { name: 'core/separator', attributes: {} },
    ],
  },
  {
    slug: 'info-card-row',
    label: 'Info Card Row',
    category: 'Content',
    icon: '🃏',
    description: 'Three info cards side by side',
    blocks: [
      {
        name: 'core/columns',
        attributes: {},
        innerBlocks: [
          {
            name: 'core/column', attributes: {},
            innerBlocks: [{ name: 'myapp/info-card', attributes: { cardTitle: 'Feature One',   cardBody: 'Describe your first key feature here.',  accentColor: '#3858e9' } }],
          },
          {
            name: 'core/column', attributes: {},
            innerBlocks: [{ name: 'myapp/info-card', attributes: { cardTitle: 'Feature Two',   cardBody: 'Describe your second key feature here.', accentColor: '#0f9e5a' } }],
          },
          {
            name: 'core/column', attributes: {},
            innerBlocks: [{ name: 'myapp/info-card', attributes: { cardTitle: 'Feature Three', cardBody: 'Describe your third key feature here.',  accentColor: '#d63638' } }],
          },
        ],
      },
    ],
  },

  // ── Pages ────────────────────────────────────────────────────────────────────
  {
    slug: 'landing-page',
    label: 'Full Landing Page',
    category: 'Pages',
    icon: '📄',
    description: 'Hero + Features + CTA + Contact — full starter page',
    blocks: [
      { name: 'core/heading',   attributes: { content: 'Welcome to Our Product', level: 1, textAlign: 'center' } },
      { name: 'core/paragraph', attributes: { content: 'The modern solution for teams who move fast. Simple, powerful, affordable.', align: 'center' } },
      { name: 'core/separator', attributes: {} },
      { name: 'core/heading',   attributes: { content: 'Why Choose Us?', level: 2 } },
      { name: 'myapp/info-card', attributes: { cardTitle: 'Fast Setup',   cardBody: 'Get started in minutes with our simple onboarding.', accentColor: '#3858e9' } },
      { name: 'myapp/info-card', attributes: { cardTitle: 'Reliable',     cardBody: '99.9% uptime backed by our enterprise SLA.',         accentColor: '#0f9e5a' } },
      { name: 'myapp/info-card', attributes: { cardTitle: 'Great Support', cardBody: 'Our team is available 24/7 to help you succeed.',    accentColor: '#d63638' } },
      { name: 'core/separator', attributes: {} },
      { name: 'myapp/cta-block', attributes: { title: 'Start Your Free Trial', buttonText: 'Get Started' } },
      { name: 'core/separator', attributes: {} },
      { name: 'core/heading',   attributes: { content: 'Contact Us', level: 2, textAlign: 'center' } },
      { name: 'core/paragraph', attributes: { content: 'Questions? Email us at hello@example.com', align: 'center' } },
    ],
  },
];
