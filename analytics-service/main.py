import pika
import os
import time
import json

def main():
    rabbitmq_host = os.getenv("RABBITMQ_HOST", "localhost")
    queue_name = os.getenv("QUEUE_NAME", "record_events")

    print(f"Connecting to RabbitMQ at {rabbitmq_host}...")
    
    # Retry connection because RabbitMQ might take time to start
    connection = None
    for i in range(10):
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host))
            break
        except pika.exceptions.AMQPConnectionError:
            print(f"Connection failed, retrying in 5 seconds... ({i+1}/10)")
            time.sleep(5)
            
    if not connection:
        print("Could not connect to RabbitMQ. Exiting.")
        return

    channel = connection.channel()
    channel.queue_declare(queue=queue_name, durable=True)

    def callback(ch, method, properties, body):
        print(f" [x] Received {body.decode()}")
        try:
            data = json.loads(body.decode())
            print(f"Processing record for Patient ID: {data.get('patient_id', 'Unknown')}")
        except json.JSONDecodeError:
            print("Received non-JSON message")
            
        # Simulate processing time
        time.sleep(1)
        print(" [x] Report Generated")
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=queue_name, on_message_callback=callback)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            os._exit(0)
        except SystemExit:
            pass
