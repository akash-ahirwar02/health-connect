output "master_public_ip" {
  value = aws_instance.master.public_ip
}

output "worker_public_ips" {
  value = aws_instance.worker[*].public_ip
}

output "vpc_id" {
  value = aws_vpc.k8s_vpc.id
}
