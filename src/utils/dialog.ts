// In-page replacement for window.alert / window.confirm.
// Native dialogs are silently ignored in sandboxed viewers (e.g. when the demo is embedded),
// so every notice and confirmation goes through <AppDialogHost />.

export interface DialogRequest {
  id: number;
  kind: 'notice' | 'confirm';
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: 'default' | 'danger' | 'success';
  resolve: (ok: boolean) => void;
}

type Listener = (queue: DialogRequest[]) => void;

let queue: DialogRequest[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach(l => l(queue));

export const subscribeDialogs = (listener: Listener) => {
  listeners.add(listener);
  listener(queue);
  return () => {
    listeners.delete(listener);
  };
};

export const resolveDialog = (id: number, ok: boolean) => {
  const req = queue.find(d => d.id === id);
  queue = queue.filter(d => d.id !== id);
  emit();
  req?.resolve(ok);
};

const open = (req: Omit<DialogRequest, 'id' | 'resolve'>) =>
  new Promise<boolean>(resolve => {
    queue = [...queue, { ...req, id: nextId++, resolve }];
    emit();
  });

// Show a message with a single OK button
export const notify = (message: string, opts: { title?: string; tone?: DialogRequest['tone'] } = {}) =>
  open({
    kind: 'notice',
    title: opts.title || 'แจ้งเตือน',
    message,
    confirmLabel: 'ตกลง',
    cancelLabel: '',
    tone: opts.tone || 'default'
  }).then(() => undefined);

// Ask the user to confirm; resolves true when they accept
export const confirmDialog = (
  message: string,
  opts: { title?: string; confirmLabel?: string; cancelLabel?: string; tone?: DialogRequest['tone'] } = {}
) =>
  open({
    kind: 'confirm',
    title: opts.title || 'ยืนยันการทำรายการ',
    message,
    confirmLabel: opts.confirmLabel || 'ยืนยัน',
    cancelLabel: opts.cancelLabel || 'ยกเลิก',
    tone: opts.tone || 'default'
  });
