package errno

import (
	"Vertex/pkg/serializer"
	"encoding/json"
)

func ErrrResponse(err error) serializer.Response {
	if _, ok := err.(*json.UnmarshalTypeError); ok {
		return serializer.Response{
			Status: 400,
			Msg:    "JSON类型不匹配",
			Error:  err.Error(),
		}
	}
	return serializer.Response{
		Status: 400,
		Msg:    "参数错误",
		Error:  err.Error(),
	}
}
