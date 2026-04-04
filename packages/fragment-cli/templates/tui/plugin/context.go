package plugin

// Context provides shared state to all plugins.
type Context struct {
	ProjectDir string
	DataDir    string
	Width      int
	Height     int
}
