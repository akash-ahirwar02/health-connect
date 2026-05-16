package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
)

var (
	ctx = context.Background()
	rdb *redis.Client
)

type Record struct {
	ID        string    `json:"id"`
	PatientID string    `json:"patient_id"`
	Diagnosis string    `json:"diagnosis"`
	Date      time.Time `json:"date"`
}

func main() {
	// Redis Setup
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	rdb = redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	// Test connection
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Printf("Warning: Could not connect to Redis at %s: %v", redisAddr, err)
	} else {
		log.Printf("Connected to Redis at %s", redisAddr)
	}

	// Router Setup
	r := mux.NewRouter()
	r.HandleFunc("/health", HealthCheck).Methods("GET")
	r.HandleFunc("/records", GetRecords).Methods("GET")
	r.HandleFunc("/records", PostRecords).Methods("POST")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8002"
	}

	log.Printf("Records Service running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "UP", "service": "records-service"})
}

func GetRecords(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Try to get from Redis
	val, err := rdb.Get(ctx, "all_records").Result()
	if err == redis.Nil {
		// Key does not exist, return empty list or default
		json.NewEncoder(w).Encode([]Record{})
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var records []Record
	err = json.Unmarshal([]byte(val), &records)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(records)
}

func PostRecords(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var newRecord Record
	err := json.NewDecoder(r.Body).Decode(&newRecord)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	newRecord.Date = time.Now()
	if newRecord.ID == "" {
		newRecord.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	}

	// Fetch existing records
	val, err := rdb.Get(ctx, "all_records").Result()
	var records []Record
	if err == nil {
		json.Unmarshal([]byte(val), &records)
	}

	records = append(records, newRecord)

	// Save back to Redis
	recordsBytes, _ := json.Marshal(records)
	err = rdb.Set(ctx, "all_records", recordsBytes, 0).Err()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newRecord)
}
