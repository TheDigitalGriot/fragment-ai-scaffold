package agent

// Agent is the interface all model connections implement.
type Agent interface {
	Model() string
	Connect() error
	Disconnect()
	IsConnected() bool
	SendMessage(content string, onChunk func(text string)) (string, error)
}

// Response holds the result from an agent call.
type Response struct {
	Content string
	Model   string
}
