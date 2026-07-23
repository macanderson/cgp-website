export function CodeBlock({
  title,
  lang,
  code,
}: {
  title: string;
  lang?: string;
  code: string;
}) {
  return (
    <div className="codeblock">
      <div className="codeblock-bar">
        <span>{title}</span>
        {lang ? <span>{lang}</span> : null}
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
