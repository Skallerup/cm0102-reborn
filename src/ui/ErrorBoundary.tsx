// Et nedbrud i et skærmbillede giver ikke længere en blank side: en besked med "Genindlæs", og fejlen sendes til admin.
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '../i18n';
import { reportError } from '../online/errors';
import { SendToDev } from './SendToDev';

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { reportError(error, info.componentStack ?? undefined); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="crash-box">
        <h2>{t('crash.title')}</h2>
        <p>{t('crash.text')}</p>
        <button className="primary" onClick={() => location.reload()}>{t('crash.reload')}</button>
        <div style={{ marginTop: 14 }}><SendToDev compact /></div>
      </div>
    );
  }
}
