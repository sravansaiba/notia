import type { Metadata } from 'next';
import { Code } from '../../components/code';
export const metadata: Metadata = { title: 'Colors & dark mode' };
export default function DocPage() {
  return (
    <>
      <h1 className="doc-title">Colors & dark mode</h1>
      <p>
        Import the stylesheet once, choose a theme, and add your own classes
        where you need them. No styling framework required.
      </p>
      <Code
        label="1. Set your theme"
        text={`import { Toaster } from 'notia';\nimport 'notia/styles.css';\n\n<Toaster theme="system" position="bottom-right" />`}
      />
      <p>
        Choose <code>light</code>, <code>dark</code>, or <code>system</code>.
        System follows the user's color preference. All themes respect
        reduced-motion settings automatically.
      </p>
      <p>
        Guide previews follow the website appearance switch. In your
        application, system follows the operating system; use light or dark to
        match an app-specific theme. The playground lets you choose the
        notification theme independently.
      </p>
      <h2>Make a toast your own</h2>
      <Code
        label="2. Add a class to a notification"
        text={`import { notia } from 'notia';\n\nnotia.success('Made it yours.', {\n  description: 'A small detail. A familiar feeling.',\n  className: 'product-toast',\n});`}
      />
      <Code
        label="3. Style your class"
        text={`/* Load after the Notia stylesheet. */\n.product-toast.product-toast {\n  border-radius: 18px;\n  border-color: #9470d8;\n  box-shadow: 0 8px 28px #25123b18;\n}`}
      />
      <p>
        Repeating the class gives your overrides enough specificity for every
        notification type. Check text contrast when changing colors.
      </p>
      <h2>Style the notification region</h2>
      <Code
        label="Toaster styles"
        text={`<Toaster\n  theme="system"\n  className="product-notifications"\n  style={{ fontFamily: 'inherit', zIndex: 10000 }}\n/>`}
      />
      <h2>Custom icons</h2>
      <Code
        label="Default and per-toast icons"
        text={`<Toaster icons={{ success: <span>✦</span>, loading: <span>◌</span> }} />

notia.success('Saved', { icon: <span>✓</span> });
notia.info('No icon needed', { icon: null });`}
      />
      <p>
        The per-toast icon takes priority over the type default. Use{' '}
        <code>null</code> or <code>false</code> to hide it. Icons are decorative
        and hidden from screen readers; keep controls outside the icon slot and
        use the message or announcement for meaning.
      </p>
      <h2>Direction and localized controls</h2>
      <Code
        label="Japanese controls with optional RTL layout"
        text={`<Toaster dir="rtl" lang="ja" labels={{
  dismiss: '通知を閉じる',
  expand: '通知を展開',
  collapse: '通知を折りたたむ',
  progress: '進行状況',
  actionError: '操作に失敗しました。もう一度お試しください。',
}} />`}
      />
      <p>
        Japanese normally uses left-to-right text. The RTL setting here
        demonstrates mirroring separately from translation.
      </p>
      <p>
        Without an explicit <code>dir</code>, the notification region inherits
        the document direction. Its portal attaches to the document body, so
        pass <code>dir</code> for an RTL section inside an LTR document. Text,
        action order, progress origin, and exit motion follow direction.
        Position names remain physical: <code>top-left</code> stays on the left
        in either direction. Set <code>label</code> to translate the region name
        and <code>progressLabel</code> for task-specific progress names.
      </p>
    </>
  );
}
