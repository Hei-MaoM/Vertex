package svc

import (
	"Vertex/app/problem/model"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"sort"
	"sync"

	"github.com/zeromicro/go-zero/core/logx"
)

type DocItem struct {
	Id     int64
	Vector []float64
}

type VectorIndex struct {
	items []DocItem
	lock  sync.RWMutex
}

func NewVectorIndex() *VectorIndex {
	return &VectorIndex{
		items: make([]DocItem, 0),
	}
}
func (vi *VectorIndex) Add(id int64, vec []float64) {
	vi.lock.Lock()
	defer vi.lock.Unlock()
	vi.items = append(vi.items, DocItem{Id: id, Vector: vec})
}

func (vi *VectorIndex) Search(queryVec []float64, k int) []int64 {
	vi.lock.RLock()
	defer vi.lock.RUnlock()

	type ScoreItem struct {
		Id    int64
		Score float64
	}

	scores := make([]ScoreItem, 0, len(vi.items))
	for _, item := range vi.items {
		sim := cosineSimilarity(queryVec, item.Vector)
		scores = append(scores, ScoreItem{Id: item.Id, Score: sim})
	}
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})
	result := make([]int64, 0, k)
	for i := 0; i < k && i < len(scores); i++ {
		log.Println(scores[i].Score, scores[i].Id)
		result = append(result, scores[i].Id)
	}
	return result
}
func cosineSimilarity(a, b []float64) float64 {
	if len(a) != len(b) {
		return 0
	}
	var dotProduct, normA, normB float64
	for i := 0; i < len(a); i++ {
		dotProduct += a[i] * b[i]
		normA += a[i] * a[i]
		normB += b[i] * b[i]
	}
	if normA == 0 || normB == 0 {
		return 0
	}
	return dotProduct / (math.Sqrt(normA) * math.Sqrt(normB))
}

func (vi *VectorIndex) LoadFormDB(m model.ProblemPostModel) {
	logx.Info("开始处理向量缓存")
	rows, err := m.FindAllEmbeddings(context.Background())
	if err != nil {
		fmt.Println(err)
		return
	}
	count := 0
	for _, row := range rows {
		if row.Embedding == "" || row.Embedding == "[]" {
			continue
		}
		var vec []float64
		if err := json.Unmarshal([]byte(row.Embedding), &vec); err == nil {
			if len(vec) > 0 {
				//fmt.Println(vec)
				vi.Add(row.Id, vec)
				count++
			}
		}
	}
	logx.Info("向量缓存处理完毕")
}
