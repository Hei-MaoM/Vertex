package serializer

type Response struct {
	Status  int         `json:"status"`
	Data    interface{} `json:"data,omitempty"`
	Msg     string      `json:"msg"`
	Error   string      `json:"error,omitempty"`
	TrackID string      `json:"track_id,omitempty"`
}
