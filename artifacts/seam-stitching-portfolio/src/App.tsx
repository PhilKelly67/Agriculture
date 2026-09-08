import { type ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  CircleX,
  Menu,
  MoveDownRight,
  Scissors,
  Sparkles,
  X,
} from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type ProcessMode = 'open' | 'closed';

const processContent: Record<
  ProcessMode,
  {
    name: string;
    label: string;
    intro: string;
    note: string;
    steps: { title: string; caption: string; takeaway: string }[];
  }
> = {
  open: {
    name: 'Open Seam',
    label: 'Plain seam / allowance pressed open',
    intro: 'A strong, honest join where both seam allowances are opened and neatened separately.',
    note: 'Key takeaway: press as you go. A crisp open seam begins with accurate marking and ends with clean, flat allowances.',
    steps: [
      { title: 'Fabric Measurement & Marking', caption: 'Mark a clear, even seam line on the wrong side.', takeaway: 'Measure twice; transfer the same seam width to every panel.' },
      { title: 'Pinning & Tacking', caption: 'Match notches, pin perpendicular to the line, then tack.', takeaway: 'Tacking holds the grain steady before the machine arrives.' },
      { title: 'Machine / Hand Stitching', caption: 'Stitch with a balanced length and backstitch at both ends.', takeaway: 'Keep the needle on the marked line; let the feed dogs do the work.' },
      { title: 'Trimming, Neatening & Pressing', caption: 'Trim bulk, finish each raw edge and press allowances open.', takeaway: 'Pressing sets the seam shape and makes the inside as considered as the outside.' },
    ],
  },
  closed: {
    name: 'Closed Seam',
    label: 'French / French-bound seam',
    intro: 'A refined enclosed join that hides raw edges inside a second fold for a durable, tidy finish.',
    note: 'Key takeaway: stitch the first seam narrowly, turn the raw edges in, then press before the final line catches everything closed.',
    steps: [
      { title: 'Fabric Measurement & Marking', caption: 'Mark the first narrow seam and allow room for the enclosing fold.', takeaway: 'Use lightweight fabric and a consistent allowance so the fold stays delicate.' },
      { title: 'Pinning & Tacking', caption: 'Place wrong sides together for the first pass; align edges carefully.', takeaway: 'The first stitch is the foundation of the enclosed channel.' },
      { title: 'Machine / Hand Stitching', caption: 'Stitch narrowly, trim, turn right sides together and sew again.', takeaway: 'The second stitch line is the lock: it must capture every raw edge.' },
      { title: 'Trimming, Neatening & Pressing', caption: 'Grade any bulk, roll the seam and press the finished ridge.', takeaway: 'A final press gives the French seam its smooth, professional silhouette.' },
    ],
  },
};

const team = [
  ['01', 'PK', 'Phil Kelly', 'Website creator & measurement lead', 'For creating this website, bringing quiet accuracy to each mark and making the first step dependable.'],
  ['02', 'LM', 'Leroi Machuki', 'Machine stitch lead', 'For steady hands, even tension and the patience to unpick and improve.'],
  ['03', 'RR', 'Ryan Raphael', 'Materials steward', 'For choosing practical fabric samples and keeping our workbench ready.'],
  ['04', 'LA', 'Lindsey Awinja', 'Process recorder', 'For turning our hands-on practice into clear, useful field notes.'],
  ['05', 'MO', 'Mitchele Obeke', 'Pressing & finish lead', 'For noticing the small finish that makes a seam feel complete.'],
  ['06', 'RO', 'Rose Ogutu', 'Quality observer', 'For asking the careful questions that strengthened every final sample.'],
  ['07', 'JS', 'Jasmine Sellah', 'Presentation lead', 'For shaping our shared work into a story others can understand.'],
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function TextileMark() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M5 5h14v14H5z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 9h14M9 5v14" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="m9 15 2 2 4-5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function Topbar({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
  const navItems = [
    ['The seam', 'comparison'],
    ['The process', 'workflow'],
    ['The team', 'team'],
    ['Reflection', 'reflection'],
  ];
  return (
    <header className="topbar">
      <div className="wrap nav-inner">
        <button className="brand" onClick={() => scrollToId('top')} aria-label="Back to the top" data-testid="button-brand-top">
          <span className="brand-mark"><TextileMark /></span>
          <span className="brand-word">STITCH STUDY<span>practical journal / 2026</span></span>
        </button>
        <nav className="nav-links" aria-label="Primary navigation">
          {navItems.map(([label, id]) => (
            <button key={id} onClick={() => scrollToId(id)} data-testid={`button-nav-${id}`}>{label}</button>
          ))}
          <button className="nav-cta" onClick={() => scrollToId('applications')} data-testid="button-nav-applications">
            Explore uses <ArrowRight size={14} />
          </button>
        </nav>
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} data-testid="button-mobile-menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && (
        <nav className="mobile-nav wrap" aria-label="Mobile navigation">
          {navItems.concat([['Explore uses', 'applications']]).map(([label, id]) => (
            <button key={id} onClick={() => { scrollToId(id); setMenuOpen(false); }} data-testid={`button-mobile-${id}`}>{label}</button>
          ))}
        </nav>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-grid">
        <div className="hero-copy animate-in">
          <div className="section-label">School Agriculture Practical Project</div>
          <h1>Mastering Seam Construction: <em>Open vs. Closed Seams</em></h1>
          <p>An interactive step-by-step documentation and portfolio showcasing fabric joinery, seam techniques, and group collaboration.</p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => scrollToId('workflow')} data-testid="button-view-steps">View steps <ArrowDownRight size={16} /></button>
            <button className="button button-ghost" onClick={() => scrollToId('team')} data-testid="button-group-team">Group team <ArrowRight size={16} /></button>
          </div>
          <div className="hero-note"><span className="rule" /><strong>02 seam finishes</strong><span>•</span><span>04 repeatable steps</span></div>
        </div>
        <div className="hero-art animate-in delay-2" aria-label="Abstract textile study illustration">
          <div className="fabric-board">
            <div className="board-label"><b>PLATE 01 / JOINERY</b><span>fabric, thread, pressure</span></div>
            <div className="seam-illustration">
              <div className="cloth" /><div className="cloth second" />
              <div className="thread-line one" /><div className="thread-line two" /><div className="stitch-dash" />
              <span className="pin a" /><span className="pin b" /><span className="pin c" />
            </div>
          </div>
          <div className="art-stamp"><span>measure<br />mark<br />make</span></div>
          <div className="floating-card"><span className="number">01—02</span><p>Two ways to make a fabric join strong, neat and fit for purpose.</p></div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  return <div className="marquee" aria-hidden="true"><div className="marquee-track"><span>measure</span><span>mark</span><span>pin</span><span>stitch</span><span>trim</span><span>press</span><span>measure</span><span>mark</span><span>pin</span><span>stitch</span><span>trim</span><span>press</span></div></div>;
}

function Comparison() {
  return (
    <section className="section comparison" id="comparison">
      <div className="wrap">
        <div className="section-intro reveal">
          <div><span className="section-label">01 / The seam</span></div>
          <div><h2>Two finishes.<br /><span style={{ color: 'var(--terracotta)' }}>One strong join.</span></h2><p>Seams are more than lines of thread. They are decisions about comfort, strength, durability and what the inside of a garment should reveal.</p></div>
        </div>
        <div className="compare-grid reveal">
          <article className="compare-card">
            <div className="compare-top"><span className="eyebrow">Open seam</span><span className="compare-index">01</span></div>
            <div className="mini-seam" aria-hidden="true" />
            <h3 className="compare-title">Open Seam <span style={{ display: 'block', fontSize: '0.62em', letterSpacing: '-.02em', marginTop: '7px' }}>(Plain Seam)</span></h3>
            <p>Two pieces meet, are stitched once, then the seam allowances are pressed flat open and finished on either side. It is a versatile, quick choice for lightweight garments, tailored wear and non-fraying agricultural shades.</p>
            <div className="compare-meta"><span>clear + adaptable</span><span>inside: open</span></div>
          </article>
          <article className="compare-card closed">
            <div className="compare-top"><span className="eyebrow">Closed seam</span><span className="compare-index">02</span></div>
            <div className="mini-seam" aria-hidden="true" />
            <h3 className="compare-title">Closed Seam <span style={{ display: 'block', fontSize: '0.62em', letterSpacing: '-.02em', marginTop: '7px' }}>(French / French-Bound Seam)</span></h3>
            <p>The raw edges are encased inside a second stitch line. The result is tidy, durable and strong for heavy-duty grain sacks, protective farmwear aprons and weather-resistant covers where edge sealing matters.</p>
            <div className="compare-meta"><span>refined + enclosed</span><span>inside: hidden</span></div>
          </article>
        </div>
        <div className="principle reveal">
          <div className="principle-item"><b>Choose open</b><span>When flexibility, speed or a pressed-flat finish matters.</span></div>
          <div className="principle-item"><b>Choose closed</b><span>When the fabric is fine and raw edges should disappear.</span></div>
          <div className="principle-item"><b>Always remember</b><span>Accuracy at the start saves repair work at the end.</span></div>
        </div>
      </div>
    </section>
  );
}

function StepVisual({ index, active }: { index: number; active: boolean }) {
  return <div className="step-visual" aria-hidden="true"><div className="visual-stitch" />{index === 1 || index === 2 ? <div className="visual-needle" /> : null}{index === 3 ? <Scissors size={26} style={{ position: 'absolute', right: 29, top: 34, color: active ? '#e7ac89' : 'var(--terracotta)' }} /> : null}</div>;
}

function Workflow({ onPreview }: { onPreview: (mode: ProcessMode, index: number) => void }) {
  const [mode, setMode] = useState<ProcessMode>('open');
  const content = processContent[mode];
  return (
    <section className="section workflow" id="workflow">
      <div className="wrap">
        <div className="section-intro reveal">
          <div><span className="section-label">02 / The process</span></div>
          <div><h2>Follow the line.<br /><span style={{ color: 'var(--terracotta)' }}>Feel the difference.</span></h2><p>Switch between the two methods to see where their paths meet — and where a careful maker takes a different turn.</p></div>
        </div>
        <div className="tab-row reveal" role="tablist" aria-label="Seam construction processes">
          <button className="tab" role="tab" aria-selected={mode === 'open'} onClick={() => setMode('open')} data-testid="tab-open-seam">Open Seam Process</button>
          <button className="tab" role="tab" aria-selected={mode === 'closed'} onClick={() => setMode('closed')} data-testid="tab-closed-seam">Closed Seam Process</button>
        </div>
        <div className="process-grid reveal" role="tabpanel">
          <div className="process-intro">
            <span className="eyebrow">{mode === 'open' ? 'Process A / 04 stages' : 'Process B / 04 stages'}</span>
            <h3>{content.name}</h3>
            <p>{content.intro}</p>
            <div className="process-note"><strong>Key takeaway</strong><br />{content.note.replace('Key takeaway: ', '')}</div>
          </div>
          <div className="step-list">
            {content.steps.map((step, index) => (
              <article className={`step-card ${index === 0 ? 'active' : ''}`} key={`${mode}-${step.title}`} tabIndex={0} onClick={() => onPreview(mode, index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onPreview(mode, index); }} data-testid={`card-step-${mode}-${index + 1}`}>
                <div className="step-head"><span className="step-number">0{index + 1}</span><span className="step-label">stage {index + 1}</span></div>
                <StepVisual index={index} active={index === 0} />
                <h4 className="step-copy">{step.title}</h4>
                <p className="step-caption">{step.caption}</p>
                <button className="step-zoom" aria-label={`Preview ${step.title}`} onClick={(event) => { event.stopPropagation(); onPreview(mode, index); }} data-testid={`button-preview-${mode}-${index + 1}`}><MoveDownRight size={16} /></button>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Applications() {
  const uses = ['Lightweight garments', 'Tailored wear', 'Agricultural shades', 'Grain sacks', 'Protective farmwear aprons', 'Weather-resistant covers'];
  return (
    <section className="section applications" id="applications">
      <div className="wrap application-layout">
        <div className="reveal">
          <span className="section-label">03 / In the field</span>
          <h2>From the<br /><span style={{ color: 'var(--terracotta)' }}>wardrobe</span> to the farm.</h2>
          <p>Understanding joinery gives us a practical language for making things that last. The best seam is not always the prettiest — it is the one that answers the work.</p>
          <div className="application-list">{uses.map((use, index) => <div className="application-item" key={use} data-testid={`text-application-${index + 1}`}><Check size={15} strokeWidth={2.5} />{use}</div>)}</div>
        </div>
        <aside className="application-aside reveal">
          <span className="eyebrow">Material note / 03</span>
          <h3>A seam is a small piece of engineering.</h3>
          <p>Light cotton may ask for a closed seam. A hard-working grain sack needs a reinforced open seam. Context decides the construction.</p>
          <div className="material-stack" aria-label="Abstract fabric swatches"><span className="material" style={{ background: '#e9e1d0' }} /><span className="material" /><span className="material" /><span className="material" /></div>
          <span className="mono" style={{ color: 'var(--fern)', fontSize: 10 }}>fabric / force / finish</span>
        </aside>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="section team" id="team">
      <div className="wrap">
        <div className="section-intro reveal">
          <div><span className="section-label">04 / The group</span></div>
          <div><h2>Seven pairs<br />of <span style={{ color: '#e7ac89' }}>hands.</span></h2><p>Practical work becomes memorable when everyone brings a different kind of care. This journal belongs to the whole group.</p></div>
        </div>
        <div className="team-grid reveal">
          {team.map(([number, initials, name, role, note]) => (
            <article className="member" key={name} data-testid={`card-member-${name.toLowerCase().replaceAll(' ', '-')}`}>
              <div className="member-index"><span>{number}</span><Sparkles size={14} /></div>
              <div className="member-initial" aria-hidden="true">{initials}</div>
              <h3>{name}</h3><div className="role">{role}</div><p>{note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reflection() {
  return (
    <section className="section reflection" id="reflection">
      <div className="wrap reflection-layout">
        <div className="reveal"><span className="section-label">05 / Reflection</span><h2>Make it well.<br /><span style={{ color: 'var(--terracotta)' }}>Make it last.</span></h2><p className="reflection-lead">This practical reminded us that sewing is a conversation between precision and patience. A measured line, a clean edge and a firm press can change the life of a whole garment.</p></div>
        <div className="reveal"><blockquote className="reflection-quote">“The inside tells the truth about the work.”</blockquote><div className="acknowledge"><div className="eyebrow">Acknowledgement</div><p>We gratefully acknowledge our Agriculture Teacher for patient demonstration and guidance, the school administration for providing the space and materials, and every team member for showing up with curiosity, care and a willingness to learn by doing.</p><div className="signature"><span className="signature-line" /><span>With appreciation, the Stitch Study group</span></div></div></div>
      </div>
    </section>
  );
}

function Footer() {
  return <footer className="footer"><div className="wrap"><div className="footer-top"><div className="footer-brand"><div className="brand"><span className="brand-mark"><TextileMark /></span><span className="brand-word">STITCH STUDY<span style={{ color: '#a6c3a5' }}>practical journal / 2026</span></span></div><p>A student-made record of fabric joinery, shared from the Agriculture &amp; Home Science practical.</p></div><div className="footer-meta"><div><b>School</b><span>Golden Elites</span></div><div><b>Subject</b><span>Agriculture &amp; Home Science</span></div><div><b>Grade level</b><span>Senior practical studies</span></div><div><b>Year</b><span>2026</span></div></div></div><div className="footer-bottom"><span>© 2026 Stitch Study. All practical work by the group.</span><span>Website created by Phil Kelly</span></div></div></footer>;
}

function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(onComplete, 1800);
    return () => window.clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="loading-screen" role="status" aria-label="Loading Golden Elites stitching portfolio" data-testid="loading-screen">
      <div className="loading-content">
        <span className="loading-kicker">Golden Elites / Stitch Study</span>
        <span className="loading-greeting">Hello</span>
        <span className="loading-rule" aria-hidden="true" />
      </div>
    </div>
  );
}

function Lightbox({ mode, index, onClose }: { mode: ProcessMode; index: number; onClose: () => void }) {
  const step = processContent[mode].steps[index];
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);
  return (
    <div className="lightbox-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="lightbox" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
        <button className="lightbox-close" onClick={onClose} aria-label="Close image preview" data-testid="button-close-preview"><CircleX size={18} /></button>
        <div className="eyebrow">{processContent[mode].name} / stage 0{index + 1}</div>
        <h3 id="lightbox-title">{step.title}</h3><p>{step.caption}</p>
        <div className="lightbox-art" role="img" aria-label={`Textile placeholder for ${step.title}`} />
        <p style={{ margin: '15px 0 0', color: 'var(--fern)', fontWeight: 600 }}>Key takeaway: {step.takeaway}</p>
      </div>
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState<{ mode: ProcessMode; index: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
    });
    const updateScrollTrigger = () => ScrollTrigger.update();
    const renderLenis = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', updateScrollTrigger);
    gsap.ticker.add(renderLenis);
    gsap.ticker.lagSmoothing(0);

    const animationContext = gsap.context(() => {
      gsap.fromTo('.hero-copy', { autoAlpha: 0, y: 28 }, {
        autoAlpha: 1,
        y: 0,
        duration: 1.05,
        ease: 'power3.out',
        delay: 0.12,
      });
      gsap.fromTo('.hero-art', { autoAlpha: 0, x: 34, rotate: 1.5 }, {
        autoAlpha: 1,
        x: 0,
        rotate: 0,
        duration: 1.2,
        ease: 'power3.out',
        delay: 0.28,
      });

      gsap.utils.toArray<HTMLElement>('.reveal').forEach((element) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 34 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            once: true,
          },
        });
      });

      gsap.fromTo('.hero-art', { y: 0 }, {
        y: -34,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      gsap.to('.art-stamp', {
        y: -7,
        rotate: 3,
        duration: 2.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
      gsap.to('.floating-card', {
        y: -8,
        duration: 3.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 0.5,
      });

      const interactiveButtons = gsap.utils.toArray<HTMLElement>('.button, .nav-cta');
      const cleanupButtonListeners = interactiveButtons.map((button) => {
        const moveX = gsap.quickTo(button, 'x', { duration: 0.35, ease: 'power3.out' });
        const moveY = gsap.quickTo(button, 'y', { duration: 0.35, ease: 'power3.out' });
        const onMove = (event: MouseEvent) => {
          const bounds = button.getBoundingClientRect();
          moveX((event.clientX - bounds.left - bounds.width / 2) * 0.12);
          moveY((event.clientY - bounds.top - bounds.height / 2) * 0.12);
        };
        const onLeave = () => {
          moveX(0);
          moveY(0);
        };
        button.addEventListener('mousemove', onMove);
        button.addEventListener('mouseleave', onLeave);
        return () => {
          button.removeEventListener('mousemove', onMove);
          button.removeEventListener('mouseleave', onLeave);
        };
      });

      return () => cleanupButtonListeners.forEach((cleanup) => cleanup());
    });

    return () => {
      animationContext.revert();
      lenis.off('scroll', updateScrollTrigger);
      gsap.ticker.remove(renderLenis);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);
  return (
    <div className="site-shell">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <Topbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main><Hero /><Marquee /><Comparison /><Workflow onPreview={(mode, index) => setPreview({ mode, index })} /><Applications /><Team /><Reflection /></main>
      <Footer />
      {preview && <Lightbox mode={preview.mode} index={preview.index} onClose={() => setPreview(null)} />}
    </div>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;