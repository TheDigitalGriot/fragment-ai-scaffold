package agent

import (
	"bytes"
	"os/exec"
)

// CodexAgent connects to Codex via CLI subprocess.
type CodexAgent struct {
	connected bool
}

func NewCodexAgent() *CodexAgent {
	return &CodexAgent{}
}

func (a *CodexAgent) Model() string { return "codex" }

func (a *CodexAgent) Connect() error {
	a.connected = true
	return nil
}

func (a *CodexAgent) Disconnect() {
	a.connected = false
}

func (a *CodexAgent) IsConnected() bool {
	return a.connected
}

func (a *CodexAgent) SendMessage(content string, onChunk func(string)) (string, error) {
	cmd := exec.Command("codex", "--quiet", "-m", content)
	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		msg := "Codex CLI not available. Ensure it is installed."
		onChunk(msg)
		return msg, nil
	}

	result := out.String()
	onChunk(result)
	return result, nil
}
