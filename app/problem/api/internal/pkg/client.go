package pkg

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type Client struct {
	ApiKey    string
	EmbedUrl  string
	ModelName string
}

func NewClient(apiKey, embedUrl, modelName string) *Client {
	return &Client{
		ApiKey:    apiKey,
		EmbedUrl:  embedUrl,
		ModelName: modelName,
	}
}
func (c *Client) generateToken() (string, error) {
	parts := strings.Split(c.ApiKey, ".")
	if len(parts) != 2 {
		return "", errors.New("invalid api key")
	}
	id, secret := parts[0], parts[1]
	payload := jwt.MapClaims{
		"api_key":   id,
		"exp":       time.Now().Add(time.Minute * 5).UnixMilli(),
		"timestamp": time.Now().UnixMilli(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	token.Header["sign_type"] = "SIGN"
	return token.SignedString([]byte(secret))
}

type EmbedReq struct {
	Model string `json:"model"`
	Input string `json:"input"`
}

type EmbedResp struct {
	Data []struct {
		Embedding []float64 `json:"embedding"`
	} `json:"data"`
}

// GetEmbedding 获取向量
func (c *Client) GetEmbedding(text string) ([]float64, error) {
	token, err := c.generateToken()
	if err != nil {
		return nil, err
	}

	reqBody := EmbedReq{
		Model: c.ModelName,
		Input: text,
	}
	jsonBody, _ := json.Marshal(reqBody)

	req, _ := http.NewRequest("POST", c.EmbedUrl, bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("api error code %d: %s", resp.StatusCode, string(body))
	}

	var result EmbedResp
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	if len(result.Data) == 0 {
		return nil, errors.New("empty embedding result")
	}

	return result.Data[0].Embedding, nil
}
