import * as ToastPrimitive from "@radix-ui/react-toast";
import { useToast } from "../context/ToastContext";
import {
  FiCheck,
  FiAlertTriangle,
  FiAlertCircle,
  FiInfo,
  FiX,
} from "react-icons/fi";
import "../styles/Toast.css";

const ICON_MAP = {
  success: <FiCheck />,
  warning: <FiAlertTriangle />,
  error: <FiAlertCircle />,
  info: <FiInfo />,
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
        <FiX size={14} />
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
