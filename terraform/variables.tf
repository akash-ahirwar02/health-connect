variable "region" {
  default = "us-east-1"
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "instance_type" {
  default = "t3.medium"
}

variable "key_name" {
  description = "Name of the SSH key pair"
  type        = string
}

variable "services" {
  type    = list(string)
  default = [
    "patient-ui",
    "api-gateway",
    "auth-service",
    "records-service",
    "analytics-service",
    "appointment-service",
    "audit-service",
    "billing-service"
  ]
}
