export const metadata = { robots: { index: false, follow: false } };
import { notFound } from 'next/navigation';
import Success from '../../../examples/success';
import ErrorExample from '../../../examples/error';
import Info from '../../../examples/info';
import Warning from '../../../examples/warning';
import Loading from '../../../examples/loading';
import Promises from '../../../examples/promises';
import Actions from '../../../examples/actions';
import Progress from '../../../examples/progress';
import Icons from '../../../examples/icons';
import Stacks from '../../../examples/stacks';
import Rtl from '../../../examples/rtl';
const examples = {
  success: Success,
  error: ErrorExample,
  info: Info,
  warning: Warning,
  loading: Loading,
  promises: Promises,
  actions: Actions,
  progress: Progress,
  icons: Icons,
  stacks: Stacks,
  rtl: Rtl,
};
export function generateStaticParams() {
  return Object.keys(examples).map((example) => ({ example }));
}
export default async function ExamplePage({
  params,
}: {
  params: Promise<{ example: string }>;
}) {
  const { example } = await params;
  if (!Object.hasOwn(examples, example)) notFound();
  const Example = examples[example as keyof typeof examples];
  return (
    <section
      className="example-stage"
      aria-label="Interactive notification example"
    >
      <Example />
    </section>
  );
}
