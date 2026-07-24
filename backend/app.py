import os
import sys
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

# Guarantee backend directory is in sys.path regardless of execution context
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.getcwd())

try:
    from utils import (
        audit_url,
        InvalidURLException,
        TimeoutException,
        UnreachableException,
        NonHTMLContentException,
        ExceptionCustom
    )
except ImportError:
    from backend.utils import (
        audit_url,
        InvalidURLException,
        TimeoutException,
        UnreachableException,
        NonHTMLContentException,
        ExceptionCustom
    )

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "Page Pulse Backend"}), 200

@app.route('/audit', methods=['POST'])
@app.route('/api/audit', methods=['POST'])
def handle_audit():
    try:
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            return jsonify({"error": "Invalid URL"}), 400
        
        target_url = data.get('url')
        if not target_url or not isinstance(target_url, str):
            return jsonify({"error": "Invalid URL"}), 400
        
        report = audit_url(target_url)
        return jsonify(report), 200

    except InvalidURLException as e:
        return jsonify({"error": "Invalid URL"}), 400
    except TimeoutException as e:
        return jsonify({"error": "Request timed out"}), 408
    except UnreachableException as e:
        return jsonify({"error": "Unable to reach website"}), 502
    except NonHTMLContentException as e:
        return jsonify({"error": "URL is not an HTML page"}), 415
    except ExceptionCustom as e:
        return jsonify({"error": e.message}), e.status_code
    except Exception as e:
        # Print full stack traceback for debugging and log to app logger
        tb = traceback.format_exc()
        print(f"[ERROR] Exception during URL audit:\n{tb}", file=sys.stderr)
        app.logger.error(f"Unexpected error auditing URL: {str(e)}\n{tb}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
