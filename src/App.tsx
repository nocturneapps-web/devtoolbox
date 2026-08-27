import { useEffect, useMemo, useState } from "react";
import {
  Braces,
  Check,
  Copy,
  Hash,
  KeyRound,
  Link,
  LockKeyhole,
  Regex,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";

type Tool = {
  id: string;
  name: string;
  description: string;
  icon: typeof Braces;
  path: string;
};

const tools: Tool[] = [
  {
    id: "json-to-typescript",
    name: "JSON → TypeScript",
    description:
      "Generate TypeScript interfaces from JSON instantly.",
    icon: Braces,
    path: "/json-to-typescript",
  },
  {
    id: "json",
    name: "JSON Formatter",
    description:
      "Format and validate JSON instantly.",
    icon: Braces,
    path: "/json-formatter",
  },
  {
    id: "json-validator",
    name: "JSON Validator",
    description:
      "Check whether your JSON is valid instantly.",
    icon: ShieldCheck,
    path: "/json-validator",
  },
  {
    id: "jwt",
    name: "JWT Decoder",
    description:
      "Decode JWT headers and payloads locally.",
    icon: KeyRound,
    path: "/jwt-decoder",
  },
  {
    id: "base64",
    name: "Base64 Encoder",
    description:
      "Encode and decode Base64 strings.",
    icon: LockKeyhole,
    path: "/base64",
  },
  {
    id: "url",
    name: "URL Encoder",
    description:
      "Encode and decode URLs and query strings.",
    icon: Link,
    path: "/url-encoder",
  },
  {
    id: "uuid",
    name: "UUID Generator",
    description:
      "Generate random UUIDs instantly.",
    icon: Hash,
    path: "/uuid-generator",
  },
  {
    id: "regex",
    name: "Regex Tester",
    description:
      "Test regular expressions against text.",
    icon: Regex,
    path: "/regex-tester",
  },
];

type SeoData = {
  title: string;
  description: string;
};

const seo: Record<string, SeoData> = {
  "json-to-typescript": {
    title:
      "JSON to TypeScript Converter — Free Online Tool | DevToolbox",
    description:
      "Convert JSON to TypeScript interfaces instantly. Free online JSON to TypeScript converter. Runs entirely in your browser.",
  },

  json: {
    title:
      "JSON Formatter & Validator — Free Online Tool | DevToolbox",
    description:
      "Format, validate and beautify JSON instantly with this free online JSON formatter.",
  },

  "json-validator": {
    title:
      "JSON Validator — Validate JSON Online | DevToolbox",
    description:
      "Validate JSON instantly and find syntax errors with this free online JSON validator.",
  },

  jwt: {
    title:
      "JWT Decoder — Decode JWT Tokens Online | DevToolbox",
    description:
      "Decode JWT headers and payloads instantly. Everything runs locally in your browser.",
  },

  base64: {
    title:
      "Base64 Encoder & Decoder — Free Online Tool | DevToolbox",
    description:
      "Encode and decode Base64 strings instantly with this free online developer tool.",
  },

  url: {
    title:
      "URL Encoder & Decoder — Free Online Tool | DevToolbox",
    description:
      "Encode and decode URLs and query strings instantly with this free online URL encoder and decoder.",
  },

  uuid: {
    title:
      "UUID Generator — Generate Free UUIDs | DevToolbox",
    description:
      "Generate random UUID v4 identifiers instantly with this free online UUID generator.",
  },

  regex: {
    title:
      "Regex Tester — Test Regular Expressions Online | DevToolbox",
    description:
      "Test regular expressions against text with this free online regex tester.",
  },
};

function getPrimitiveType(value: unknown): string {
  if (typeof value === "string") return "string";
  if (typeof value === "number") {
    return Number.isInteger(value) ? "number" : "number";
  }
  if (typeof value === "boolean") return "boolean";

  return "unknown";
}

function pascalCase(name: string): string {
  const result = name
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) =>
      char.toUpperCase()
    )
    .replace(/^./, (char) => char.toUpperCase());

  return result || "Root";
}

function jsonToTypeScript(
  value: string,
  rootName = "Root"
): string {
  const parsed = JSON.parse(value);

  const interfaces: string[] = [];
  const generatedNames = new Set<string>();

  const createInterfaceName = (name: string): string => {
    const baseName = pascalCase(name);

    if (!generatedNames.has(baseName)) {
      generatedNames.add(baseName);
      return baseName;
    }

    let index = 2;

    while (generatedNames.has(`${baseName}${index}`)) {
      index++;
    }

    const finalName = `${baseName}${index}`;

    generatedNames.add(finalName);

    return finalName;
  };

  const getType = (
    currentValue: unknown,
    name: string
  ): string => {
    if (currentValue === null) {
      return "null";
    }

    if (Array.isArray(currentValue)) {
      if (currentValue.length === 0) {
        return "unknown[]";
      }

      const types = [
        ...new Set(
          currentValue.map((item) => {
            if (
              typeof item === "object" &&
              item !== null &&
              !Array.isArray(item)
            ) {
              return getType(item, name);
            }

            if (Array.isArray(item)) {
              return getType(item, name);
            }

            return getPrimitiveType(item);
          })
        ),
      ];

      if (types.length === 1) {
        return `${types[0]}[]`;
      }

      return `(${types.join(" | ")})[]`;
    }

    if (
      typeof currentValue === "object" &&
      currentValue !== null
    ) {
      const interfaceName = createInterfaceName(name);

      const fields = Object.entries(currentValue)
        .map(([key, val]) => {
          const safeKey =
            /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
              ? key
              : `"${key}"`;

          const type = getType(val, pascalCase(key));

          return `  ${safeKey}: ${type};`;
        })
        .join("\n");

      interfaces.push(
        `export interface ${interfaceName} {\n${fields}\n}`
      );

      return interfaceName;
    }

    return getPrimitiveType(currentValue);
  };

  getType(parsed, rootName);

  return interfaces.reverse().join("\n\n");
}

function decodeJwtPart(value: string): string {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded =
    normalized +
    "=".repeat((4 - (normalized.length % 4)) % 4);

  const decoded = atob(padded);

  const bytes = Uint8Array.from(
    decoded,
    (char) => char.charCodeAt(0)
  );

  return new TextDecoder().decode(bytes);
}

function decodeJwt(token: string): string {
  const parts = token.trim().split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid JWT");
  }

  const header = JSON.parse(
    decodeJwtPart(parts[0])
  );

  const payload = JSON.parse(
    decodeJwtPart(parts[1])
  );

  return `HEADER\n${JSON.stringify(
    header,
    null,
    2
  )}\n\nPAYLOAD\n${JSON.stringify(
    payload,
    null,
    2
  )}`;
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);

  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function decodeBase64(value: string): string {
  const binary = atob(value.trim());

  const bytes = Uint8Array.from(
    binary,
    (char) => char.charCodeAt(0)
  );

  return new TextDecoder().decode(bytes);
}

function encodeUrl(value: string): string {
  return encodeURIComponent(value);
}

function decodeUrl(value: string): string {
  return decodeURIComponent(value);
}

function testRegex(value: string): string {
  const separator = "\n---TEXT---\n";

  const parts = value.split(separator);

  if (parts.length !== 2) {
    return `Enter your regex and text using this format:

/pattern/flags
---TEXT---
Text to test

Example:

/ghost/gi
---TEXT---
Ghost is a Swedish rock band.`;
  }

  const regexInput = parts[0].trim();
  const text = parts[1];

  let pattern = regexInput;
  let flags = "";

  if (
    regexInput.startsWith("/") &&
    regexInput.lastIndexOf("/") > 0
  ) {
    const lastSlash = regexInput.lastIndexOf("/");

    pattern = regexInput.slice(1, lastSlash);
    flags = regexInput.slice(lastSlash + 1);
  }

  const regex = new RegExp(pattern, flags);

  const matches = [...text.matchAll(regex)];

  if (matches.length === 0) {
    return "No matches found.";
  }

  return matches
    .map(
      (match, index) =>
        `Match ${index + 1}: "${match[0]}" at index ${match.index}`
    )
    .join("\n");
}

function ToolPage({
  tool,
  input,
  setInput,
}: {
  tool: Tool;
  input: string;
  setInput: (value: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    try {
      switch (tool.id) {
        case "json-to-typescript":
          return jsonToTypeScript(input);

        case "json":
          return JSON.stringify(
            JSON.parse(input),
            null,
            2
          );

        case "json-validator":
          JSON.parse(input);

          return "✓ Valid JSON";

        case "jwt":
          return decodeJwt(input);

        case "base64":
          return input
            ? `ENCODED\n${encodeBase64(
                input
              )}\n\nDECODED\n${decodeBase64(input)}`
            : "";

        case "url":
          return input
            ? `ENCODED\n${encodeUrl(
                input
              )}\n\nDECODED\n${decodeUrl(input)}`
            : "";

        case "uuid":
          return Array.from(
            { length: 10 },
            () => crypto.randomUUID()
          ).join("\n");

        case "regex":
          return testRegex(input);

        default:
          return input;
      }
    } catch {
      switch (tool.id) {
        case "json-to-typescript":
          return "Invalid JSON. Please check your input.";

        case "json":
          return "Invalid JSON. Please check your input.";

        case "json-validator":
          return "✕ Invalid JSON.";

        case "jwt":
          return "Invalid JWT token.";

        case "base64":
          return "Invalid Base64 string.";

        case "url":
          return "Unable to decode URL.";

        case "regex":
          return "Invalid regular expression.";

        default:
          return "Unable to process input.";
      }
    }
  }, [input, tool.id]);

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard unavailable.
    }
  }

  function clearInput() {
    setInput("");
  }

  function downloadOutput() {
    const blob = new Blob([output], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download =
      tool.id === "json-to-typescript"
        ? "types.ts"
        : "devtoolbox-output.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="tool-page">
      <div className="tool-header">
        <div>
          <div className="tool-badge">
            <tool.icon size={16} />
            Free Developer Tool
          </div>

          <h1>{tool.name}</h1>

          <p>{tool.description}</p>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-card">
          <div className="editor-header">
            <span>Input</span>

            <button onClick={clearInput}>
              Clear
            </button>
          </div>

          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Paste your data here..."
            spellCheck={false}
          />
        </div>

        <div className="editor-card">
          <div className="editor-header">
            <span>Output</span>

            <div className="editor-actions">
              <button onClick={copyOutput}>
                {copied ? (
                  <Check size={15} />
                ) : (
                  <Copy size={15} />
                )}

                {copied ? "Copied" : "Copy"}
              </button>

              <button onClick={downloadOutput}>
                Download
              </button>
            </div>
          </div>

          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
}

function App() {
  const currentPath =
    window.location.pathname.replace(/\/$/, "") || "/";

  const currentTool =
    tools.find(
      (tool) => tool.path === currentPath
    ) ?? tools[0];

  const [selectedTool, setSelectedTool] =
    useState(currentTool.id);

  const [input, setInput] = useState(
    currentTool.id === "json-to-typescript"
      ? `{
  "id": 123,
  "name": "Ghost",
  "active": true,
  "artist": {
    "name": "Tobias Forge",
    "albums": 6
  }
}`
      : ""
  );

  function selectTool(tool: Tool) {
    setSelectedTool(tool.id);

    window.history.pushState(
      {},
      "",
      tool.path
    );

    if (tool.id === "json-to-typescript") {
      setInput(`{
  "id": 123,
  "name": "Ghost",
  "active": true,
  "artist": {
    "name": "Tobias Forge",
    "albums": 6
  }
}`);
    } else if (tool.id === "regex") {
      setInput(`/ghost/gi
---TEXT---
Ghost is a Swedish rock band.
Ghost was founded in Linköping.`);
    } else {
      setInput("");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const activeTool =
    tools.find(
      (tool) => tool.id === selectedTool
    ) ?? tools[0];

  useEffect(() => {
    const currentSeo =
      seo[activeTool.id];

    if (!currentSeo) {
      return;
    }

    document.title = currentSeo.title;

    const description =
      document.querySelector(
        'meta[name="description"]'
      );

    if (description) {
      description.setAttribute(
        "content",
        currentSeo.description
      );
    }

    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [activeTool.id]);

  useEffect(() => {
    function handlePopState() {
      const path =
        window.location.pathname.replace(/\/$/, "") ||
        "/";

      const tool =
        tools.find(
          (item) => item.path === path
        ) ?? tools[0];

      setSelectedTool(tool.id);

      if (tool.id === "json-to-typescript") {
        setInput(`{
  "id": 123,
  "name": "Ghost",
  "active": true,
  "artist": {
    "name": "Tobias Forge",
    "albums": 6
  }
}`);
      } else {
        setInput("");
      }
    }

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          min-height: 100%;
        }

        body {
          margin: 0;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          background: #09090b;
          color: #fafafa;
        }

        button {
          font: inherit;
        }

        .app {
          min-height: 100vh;
        }

        .nav {
          height: 64px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 32px;

          border-bottom: 1px solid #27272a;

          background: #09090b;

          position: sticky;
          top: 0;
          z-index: 20;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;

          font-size: 15px;
          font-weight: 700;

          letter-spacing: -0.02em;
        }

        .logo-icon {
          width: 32px;
          height: 32px;

          display: grid;
          place-items: center;

          border-radius: 8px;

          background: #fff;
          color: #09090b;
        }

        .pro-button {
          display: flex;
          align-items: center;
          gap: 7px;

          border: 1px solid #3f3f46;

          background: #18181b;
          color: #fff;

          border-radius: 8px;

          padding: 8px 14px;

          cursor: pointer;
        }

        .pro-button:hover {
          background: #27272a;
          border-color: #52525b;
        }

        .layout {
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);

          min-height: calc(100vh - 64px);
        }

        .sidebar {
          border-right: 1px solid #27272a;

          padding: 24px 16px;

          background: #09090b;
        }

        .sidebar-title {
          color: #71717a;

          font-size: 11px;
          font-weight: 700;

          text-transform: uppercase;
          letter-spacing: 0.1em;

          padding: 0 10px 12px;
        }

        .tool-button {
          width: 100%;

          display: flex;
          align-items: center;
          gap: 10px;

          padding: 10px;

          margin-bottom: 4px;

          border: 0;
          border-radius: 8px;

          background: transparent;
          color: #a1a1aa;

          text-align: left;

          cursor: pointer;

          transition:
            background 0.15s ease,
            color 0.15s ease;
        }

        .tool-button:hover,
        .tool-button.active {
          background: #18181b;
          color: #fff;
        }

        .content {
          width: 100%;
          max-width: 1150px;

          margin: 0 auto;

          padding: 64px 48px;
        }

        .hero {
          margin-bottom: 52px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 6px 10px;

          border-radius: 999px;

          background: #18181b;
          border: 1px solid #27272a;

          color: #a1a1aa;

          font-size: 13px;
        }

        .hero h2 {
          margin: 18px 0 12px;

          font-size: clamp(38px, 6vw, 64px);

          line-height: 0.98;

          letter-spacing: -0.055em;
        }

        .hero p {
          max-width: 650px;

          margin: 0;

          color: #a1a1aa;

          font-size: 18px;
          line-height: 1.6;
        }

        .tool-page {
          margin-top: 24px;
        }

        .tool-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          color: #a1a1aa;

          font-size: 13px;
        }

        .tool-header h1 {
          margin: 10px 0 6px;

          font-size: 34px;

          line-height: 1.1;

          letter-spacing: -0.035em;
        }

        .tool-header p {
          margin: 0 0 28px;

          color: #71717a;

          line-height: 1.5;
        }

        .editor-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);

          gap: 16px;
        }

        .editor-card {
          min-width: 0;

          overflow: hidden;

          border: 1px solid #27272a;
          border-radius: 12px;

          background: #0f0f11;
        }

        .editor-header {
          min-height: 46px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;

          padding: 8px 14px;

          border-bottom: 1px solid #27272a;

          color: #a1a1aa;

          font-size: 13px;
        }

        .editor-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .editor-header button {
          display: flex;
          align-items: center;
          gap: 5px;

          border: 0;

          background: transparent;
          color: #a1a1aa;

          cursor: pointer;
        }

        .editor-header button:hover {
          color: #fff;
        }

        textarea,
        pre {
          display: block;

          width: 100%;
          min-height: 360px;

          margin: 0;

          padding: 18px;

          border: 0;
          outline: 0;

          background: transparent;
          color: #e4e4e7;

          font-family:
            "SFMono-Regular",
            Consolas,
            "Liberation Mono",
            monospace;

          font-size: 13px;
          line-height: 1.7;

          resize: vertical;
        }

        textarea {
          overflow: auto;
        }

        pre {
          white-space: pre-wrap;
          overflow: auto;
        }

        @media (max-width: 800px) {
          .nav {
            padding: 0 16px;
          }

          .layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            display: flex;
            gap: 4px;

            overflow-x: auto;

            padding: 12px;

            border-right: 0;
            border-bottom: 1px solid #27272a;
          }

          .sidebar-title {
            display: none;
          }

          .tool-button {
            width: auto;
            flex: 0 0 auto;

            white-space: nowrap;
          }

          .content {
            padding: 36px 20px;
          }

          .hero {
            margin-bottom: 36px;
          }

          .editor-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="app">
        <nav className="nav">
          <div className="logo">
            <div className="logo-icon">
              <Wand2 size={18} />
            </div>

            DevToolbox
          </div>

          <button className="pro-button">
            <Sparkles size={14} />
            Go Pro
          </button>
        </nav>

        <div className="layout">
          <aside className="sidebar">
            <div className="sidebar-title">
              Tools
            </div>

            {tools.map((tool) => {
              const Icon = tool.icon;

              return (
                <button
                  key={tool.id}
                  className={`tool-button ${
                    activeTool.id === tool.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    selectTool(tool)
                  }
                >
                  <Icon size={17} />

                  {tool.name}
                </button>
              );
            })}
          </aside>

          <main className="content">
            <section className="hero">
              <div className="hero-badge">
                <Sparkles size={14} />
                Free developer tools
              </div>

              <h2>
                Ship faster.
                <br />
                Waste less time.
              </h2>

              <p>
                Simple, fast developer utilities that
                run directly in your browser. No signup.
                No tracking. No data uploads.
              </p>
            </section>

            <ToolPage
              tool={activeTool}
              input={input}
              setInput={setInput}
            />
          </main>
        </div>
      </div>
    </>
  );
}

export default App;