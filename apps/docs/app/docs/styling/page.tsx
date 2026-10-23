import type { Metadata } from 'next';
import { Code } from '../../components/code';
export const metadata: Metadata = { title: 'Styling and themes' };
export default function DocPage() {
  return (
    <>
      <h1 className="doc-title">Your product. Your personality.</h1>
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
    </>
  );
}
