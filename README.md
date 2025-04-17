# 🧠 @thomassloboda/commit-ai

![npm version](https://img.shields.io/npm/v/@thomassloboda/commit-ai)
![release](https://img.shields.io/github/v/release/votre-user/commit-ai?label=release)
![license](https://img.shields.io/github/license/votre-user/@thomassloboda/commit-ai)
![node](https://img.shields.io/node/v/@thomassloboda/commit-ai)
![types](https://img.shields.io/badge/TypeScript-%E2%9C%93-blue)

Version: `1.0.0`

AI-powered commit message generator using GPT (OpenAI) to generate **Conventional Commits** from your staged Git changes.

---

## 🚀 Installation

### Local (dev)

```bash
npm install
npm run build
npm link
```

### Global (published)

```bash
npm install -g commit-ai
```

Or via NPX:

```bash
npx commit-ai
```

---

## 💡 Usage

```bash
commit-ai [options]
```

Generates a commit message based on your current staged changes.

---

## 🔧 Options

| Flag            | Description                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| `--api-key`       | Fournir ta clé OpenAI manuellement (évite l'historique shell)               |
| `--ignore`        | Liste d'extensions ignorées, ex: `.lock,.snap`                              |
| `--init`              | Create a default ~/.commit-ai/config.json file                                |
| `--print-only`    | Affiche le message généré sans prompt ni copie                             |
| `--quiet`         | Aucune sortie (pas de logs, ni spinner) — utile en CI                       |
| `--version`, `-v` | Affiche la version de la CLI                                                |
| `--help`, `-h`    | Affiche ce message d’aide                                                   |

---

## ⚙️ Configuration

You can create a config file at:

```
~/.commit-ai/config.json
```

Example:

  ```json
{
  "OPENAI_API_KEY": "sk-...",
  "ignoredExtensions": [".lock", ".map", ".snap"],
  "ignoredFilenames": ["package-lock.json", "pnpm-lock.yaml"]
}
```

---

## ✨ Example

```bash
git add .
commit-ai --print-only
```

Outputs:

```
feat: implement file-level summarization and CLI flags
```

---

## 🧪 Development

Run the CLI locally with:

```bash
npm run build
commit-ai --print-only
```

---

## 📝 License

MIT
