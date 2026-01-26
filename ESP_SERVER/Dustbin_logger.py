from flask import Flask, request, render_template_string
from datetime import datetime
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_PATH = os.path.join(BASE_DIR, "dustbin_log.txt")

last_reading = {"distance": None, "fill": None, "timestamp": None}

@app.route("/ping")
def ping():
    return "pong"

@app.route("/data", methods=["POST"])
def receive_data():
    # Your ESP8266 sends x-www-form-urlencoded, so this should work:
    distance = request.form.get("distance")
    fill = request.form.get("fill")

    # Debug print so you can see exactly what arrived
    print("---- /data received ----")
    print("Content-Type:", request.content_type)
    print("Raw body:", request.get_data(as_text=True))
    print("Form:", dict(request.form))
    print("------------------------")

    if distance is None or fill is None:
        return "Missing distance/fill", 400

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    last_reading["distance"] = distance
    last_reading["fill"] = fill
    last_reading["timestamp"] = timestamp

    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(f"{timestamp} | Distance: {distance} cm | Fill: {fill}%\n")

    return "OK"

@app.route("/")
def home():
    html = """
    <html>
    <head>
        <meta http-equiv="refresh" content="3">
        <title>Dustbin Monitor</title>
        <style>
            .bar-container { width: 120px; height: 300px; border: 2px solid #333; background:#eee; position: relative; }
            .fill-bar { width: 100%; position: absolute; bottom: 0; background: green; }
        </style>
    </head>
    <body>
        <h2>Dustbin Monitor</h2>

        {% if last_reading.timestamp %}
            <p><b>Timestamp:</b> {{ last_reading.timestamp }}</p>
            <p><b>Distance:</b> {{ last_reading.distance }} cm</p>
            <p><b>Fill:</b> {{ last_reading.fill }}%</p>

            {% set fill_val = last_reading.fill|int %}
            {% if fill_val < 0 %}{% set fill_val = 0 %}{% endif %}
            {% if fill_val > 100 %}{% set fill_val = 100 %}{% endif %}

            <div class="bar-container">
                <div class="fill-bar" style="height: {{ fill_val * 3 }}px;"></div>
            </div>
        {% else %}
            <p>No data received yet.</p>
        {% endif %}

        <p><small>Log file: {{ log_path }}</small></p>
    </body>
    </html>
    """
    return render_template_string(html, last_reading=last_reading, log_path=LOG_PATH)

if __name__ == "__main__":
    print("Server:", "http://127.0.0.1:5000  (LAN:", "http://192.168.0.104:5000 )")
    print("Log file:", LOG_PATH)
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
