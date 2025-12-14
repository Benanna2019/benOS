export default function footer ({ html, state }) {

    return html`
    <footer>
      <p>footer here</p>
      <pre>${ JSON.stringify(state, null, 2) }</pre>
    </footer>
    `
  }