import threading
from tqdm import tqdm
from time import sleep
import psutil
from websocket_server import WebsocketServer

print("startSocket")

# Called for every client connecting (after handshake)
def new_client(client, server):
	print("New client connected and was given id %d" % client['id'])
	server.send_message_to_all("Hey all, a new client has joined us")


# Called for every client disconnecting
def client_left(client, server):
	print("Client(%d) disconnected" % client['id'])


# Called when a client sends a message
def message_received(client, server, message):
	if len(message) > 200:
		message = message[:200]+'..'
	print("Client(%d) said: %s" % (client['id'], message))

# Send CPU usage to all clients
def send_cpu_update(server):
    while True:
        values = psutil.cpu_percent(percpu=True)
        cpu_data = {'cpu1': values[0], 'cpu2': values[1], 'cpu3': values[2], 'cpu4': values[3]}
        server.send_message_to_all(str(cpu_data))
        sleep(1)  # Adjust the interval based on your needs

# Function to start sending CPU updates to clients
def start_sending_cpu_updates(server):
    cpu_thread = threading.Thread(target=send_cpu_update, args=(server,))
    cpu_thread.daemon = True
    cpu_thread.start()

PORT = 3001
server = WebsocketServer(port=PORT)
server.set_fn_new_client(new_client)
server.set_fn_client_left(client_left)

print("Setup Done - awaiting start_sending_cpu_updates")
# Start sending CPU updates to connected clients in a separate thread
start_sending_cpu_updates(server)

print("Setup Done - awaiting run_forever")
# Run the server in the main thread
server.run_forever()

