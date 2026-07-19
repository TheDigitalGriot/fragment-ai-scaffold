package agent

import (
	"bytes"
	"os/exec"
)

// ClaudeAgent connects to Claude via CLI subprocess.
type ClaudeAgent struct {
	connected bool
}

func NewClaudeAgent() *ClaudeAgent {
	return &ClaudeAgent{}
}

func (a *ClaudeAgent) Model() string { return "claude" }

func (a *ClaudeAgent) Connect() error {
	a.connected = true
	return nil
}

func (a *ClaudeAgent) Disconnect() {
	a.connected = false
}

func (a *ClaudeAgent) IsConnected() bool {
	return a.connected
}

func (a *ClaudeAgent) SendMessage(content string, onChunk func(string)) (string, error) {
	cmd := exec.Command("claude", "-m", content)
	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		msg := "Claude CLI not available. Ensure it is installed."
		onChunk(msg)
		return msg, nil
	}

	result := out.String()
	onChunk(result)
	return result, nil
}
