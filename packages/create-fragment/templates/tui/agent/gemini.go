package agent

import (
	"bytes"
	"os/exec"
)

// GeminiAgent connects to Gemini via CLI subprocess.
type GeminiAgent struct {
	connected bool
}

func NewGeminiAgent() *GeminiAgent {
	return &GeminiAgent{}
}

func (a *GeminiAgent) Model() string { return "gemini" }

func (a *GeminiAgent) Connect() error {
	a.connected = true
	return nil
}

func (a *GeminiAgent) Disconnect() {
	a.connected = false
}

func (a *GeminiAgent) IsConnected() bool {
	return a.connected
}

func (a *GeminiAgent) SendMessage(content string, onChunk func(string)) (string, error) {
	cmd := exec.Command("gemini", "-m", content)
	var out bytes.Buffer
	cmd.Stdout = &out

	if err := cmd.Run(); err != nil {
		msg := "Gemini CLI not available. Ensure it is installed."
		onChunk(msg)
		return msg, nil
	}

	result := out.String()
	onChunk(result)
	return result, nil
}
