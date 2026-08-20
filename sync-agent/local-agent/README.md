# Shift Calendar Local Excel Sync Agent

This agent runs on a Windows PC that can see the Excel workbook through a OneDrive/SharePoint synced folder or any accessible local/network path. Microsoft Graph is not required.

## Setup

1. Install Python 3.11+.
2. Copy `config.example.json` to `config.json`.
3. Set `workbook_path` to the synced `.xlsm` file.
4. Create a GitHub token that can update this repository's contents.
5. Set it only in the Windows environment:
   `setx GITHUB_TOKEN "YOUR_TOKEN"`
6. Open a new Command Prompt and run `run-agent.bat`.

The agent checks the workbook every 300 seconds by default. It hashes the file first and only parses/uploads when the file actually changes.

## Security

- Do not commit `config.json` if it contains a private local path you do not want public.
- Never put `GITHUB_TOKEN` in `config.json`, source code, or the Calendar PWA.
- Use a fine-grained GitHub token restricted to this repository and only Contents read/write.

## Output

- `data/schedule.json`
- `data/metadata.json`

The Calendar integration layer should consume these files from the published repository; this agent does not modify calendar UI or shift logic.
