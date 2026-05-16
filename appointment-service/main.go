package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

var db *sql.DB

type Appointment struct {
	ID          int       `json:"id"`
	PatientID   string    `json:"patient_id"`
	DoctorName  string    `json:"doctor_name"`
	Date        time.Time `json:"date"`
	Description string    `json:"description"`
}

func main() {
	// DB Setup
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		dbUrl = "postgres://postgres:postgres@localhost:5432/appointmentdb?sslmode=disable"
	}

	var err error
	db, err = sql.Open("postgres", dbUrl)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Test connection
	for i := 0; i < 10; i++ {
		err = db.Ping()
		if err == nil {
			break
		}
		log.Printf("Waiting for database connection... (%d/10)", i+1)
		time.Sleep(5 * time.Second)
	}
	if err != nil {
		log.Printf("Warning: Could not connect to database: %v", err)
	} else {
		log.Println("Connected to database")
		createTable()
	}

	// Router Setup
	r := mux.NewRouter()
	r.HandleFunc("/health", HealthCheck).Methods("GET")
	r.HandleFunc("/appointments", GetAppointments).Methods("GET")
	r.HandleFunc("/appointments", CreateAppointment).Methods("POST")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8003"
	}

	log.Printf("Appointment Service running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func createTable() {
	query := `
	CREATE TABLE IF NOT EXISTS appointments (
		id SERIAL PRIMARY KEY,
		patient_id TEXT NOT NULL,
		doctor_name TEXT NOT NULL,
		date TIMESTAMP NOT NULL,
		description TEXT
	);`
	_, err := db.Exec(query)
	if err != nil {
		log.Printf("Error creating table: %v", err)
	}
}

func HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "UP", "service": "appointment-service"})
}

func GetAppointments(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rows, err := db.Query("SELECT id, patient_id, doctor_name, date, description FROM appointments")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var appointments []Appointment
	for rows.Next() {
		var a Appointment
		if err := rows.Scan(&a.ID, &a.PatientID, &a.DoctorName, &a.Date, &a.Description); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		appointments = append(appointments, a)
	}

	json.NewEncoder(w).Encode(appointments)
}

func CreateAppointment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var a Appointment
	err := json.NewDecoder(r.Body).Decode(&a)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	a.Date = time.Now() // Default to now for simplicity if not provided

	query := "INSERT INTO appointments (patient_id, doctor_name, date, description) VALUES ($1, $2, $3, $4) RETURNING id"
	err = db.QueryRow(query, a.PatientID, a.DoctorName, a.Date, a.Description).Scan(&a.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(a)
}
