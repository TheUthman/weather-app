import * as ToastPrimitive from "@radix-ui/react-toast";
import { useToast } from "../context/ToastContext";
import Icon from "./Icon";
import "../styles/Toast.css";

const ICON_MAP = {
  success: <Icon name="check" />,
  warning: <Icon name="alertTriangle" />,
  error: <Icon name="alertCircle" />,
  info: <Icon name="info" />,
};

function ToastItem({ toast, onRemove }) {
  return (
    <ToastPrimitive.Root
      className={`toast-root toast-${toast.type}`}
      duration={toast.duration}
      onOpenChange={(open) => {
        if (!open) onRemove(toast.id);
      }}
    >
      <div className="toast-icon">{ICON_MAP[toast.type] || ICON_MAP.info}</div>
      <ToastPrimitive.Description className="toast-message">
        {toast.message}
      </ToastPrimitive.Description>
      <ToastPrimitive.Close className="toast-close" aria-label="Dismiss">
        <Icon name="x" size={14} />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
      <ToastPrimitive.Viewport className="toast-viewport" />
    </ToastPrimitive.Provider>
  );
}
