import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "", info: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info);
    this.setState({ info: info?.componentStack || "" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui", color: "#fff", background: "#111", minHeight: "100vh" }}>
          <h1 style={{ color: "#ef4444" }}>Opa, algo quebrou na interface</h1>
          <p style={{ opacity: .8, marginTop: 8 }}>Mensagem:</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#18181b", padding: 12, borderRadius: 8 }}>
            {this.state.message}
          </pre>
          {this.state.info && (
            <>
              <p style={{ opacity: .8, marginTop: 8 }}>Componente:</p>
              <pre style={{ whiteSpace: "pre-wrap", background: "#18181b", padding: 12, borderRadius: 8 }}>
                {this.state.info}
              </pre>
            </>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
