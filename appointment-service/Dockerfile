# Stage 1: Build
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Install git for fetching dependencies
RUN apk add --no-cache git

COPY go.mod ./
RUN go mod download

COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Stage 2: Final
FROM scratch
WORKDIR /
COPY --from=builder /app/main .
EXPOSE 8003
CMD ["/main"]
