'use client';
import { useState } from 'react';
import { notia } from 'notia';
import { ExampleToaster as Toaster } from '../app/components/example-toaster';
import 'notia/styles.css';
export default function Example() {
  const [mirrored, setMirrored] = useState(false);
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={mirrored}
          onChange={(event) => setMirrored(event.target.checked)}
        />{' '}
        Mirror layout (RTL test)
      </label>
      <button onClick={() => notia.success('変更を保存しました')}>
        Show Japanese notification
      </button>
      <Toaster
        theme="system"
        dir={mirrored ? 'rtl' : 'ltr'}
        lang="ja"
        position="bottom-right"
        label="通知"
        labels={{
          dismiss: '通知を閉じる',
          expand: '通知を展開',
          collapse: '通知を折りたたむ',
          progress: '進行状況',
          actionError: '操作に失敗しました。もう一度お試しください。',
        }}
      />
    </>
  );
}
