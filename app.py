import os
import sys
import uuid
import logging
from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image
import pytesseract
import requests

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Application Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB limit

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Tesseract OCR Windows Path Auto-Detection
if sys.platform.startswith('win'):
    # Check if user specified via environment variable
    tess_env = os.environ.get('TESSERACT_PATH')
    if tess_env and os.path.exists(tess_env):
        pytesseract.pytesseract.tesseract_cmd = tess_env
        logger.info(f"Using Tesseract path from environment variable: {tess_env}")
    else:
        # Common installation paths on Windows
        possible_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
            os.path.expandvars(r"%USERPROFILE%\AppData\Local\Programs\Tesseract-OCR\tesseract.exe")
        ]
        tess_found = False
        for path in possible_paths:
            if os.path.exists(path):
                pytesseract.pytesseract.tesseract_cmd = path
                logger.info(f"Auto-detected Tesseract OCR executable at: {path}")
                tess_found = True
                break
        if not tess_found:
            logger.warning("Tesseract OCR executable was not auto-detected. Ensure it is installed and added to the PATH, or set the TESSERACT_PATH environment variable.")

def transliterate_tanglish_to_tamil(text):
    if not text.strip():
        return text

    lines = text.split('\n')
    transliterated_lines = []

    for line in lines:
        if not line.strip():
            transliterated_lines.append('')
            continue

        try:
            url = "https://inputtools.google.com/request"
            params = {
                'text': line,
                'itc': 'ta-t-i0-und',
                'num': 1,
                'cp': 0,
                'cs': 1,
                'ie': 'utf-8',
                'oe': 'utf-8',
                'app': 'test'
            }
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            if data[0] == 'SUCCESS' and len(data[1]) > 0:
                suggestions = data[1][0][1]
                if suggestions:
                    transliterated_lines.append(suggestions[0])
                else:
                    transliterated_lines.append(line)
            else:
                transliterated_lines.append(line)
        except Exception as e:
            logger.error(f"Transliteration request failed for line '{line}': {e}")
            transliterated_lines.append(line)

    return '\n'.join(transliterated_lines)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload')
@app.route('/upload.html')
def upload():
    return render_template('upload.html')

@app.route('/api/transliterate', methods=['POST'])
def transliterate_text_api():
    try:
        data = request.get_json() or {}
        text = data.get('text', '')
        if not text:
            return jsonify({
                'status': 'success',
                'text': ''
            })
        
        logger.info("Received request to transliterate text")
        transliterated = transliterate_tanglish_to_tamil(text)
        return jsonify({
            'status': 'success',
            'text': transliterated
        })
    except Exception as e:
        logger.error(f"Transliteration API error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Transliteration failed: {str(e)}'
        }), 500

@app.route('/api/extract', methods=['POST'])
def extract_text():
    # 1. Check if file is part of request
    if 'image' not in request.files:
        return jsonify({
            'status': 'error',
            'message': 'No image file uploaded.'
        }), 400

    file = request.files['image']

    # 2. Check if file is empty
    if file.filename == '':
        return jsonify({
            'status': 'error',
            'message': 'Selected file is empty.'
        }), 400

    # 3. Verify file type
    if not allowed_file(file.filename):
        return jsonify({
            'status': 'error',
            'message': 'Invalid file format. Only JPG, JPEG, and PNG images are allowed.'
        }), 400

    # 4. Save file temporarily with unique name to prevent collisions
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

    try:
        file.save(file_path)
        logger.info(f"Temporarily saved uploaded file to {file_path}")

        # 5. Open image and run OCR inside context manager to release Windows file locks
        try:
            with Image.open(file_path) as image:
                # 6. Extract text with Tesseract
                try:
                    extracted_text = pytesseract.image_to_string(image)
                    extracted_text = extracted_text.strip()
                    
                    mode = request.form.get('mode', 'standard')
                    if mode == 'tanglish' and extracted_text:
                        logger.info("Transliterating extracted text from Tanglish to Tamil")
                        extracted_text = transliterate_tanglish_to_tamil(extracted_text)
                    
                    logger.info("Successfully completed OCR processing.")
                    return jsonify({
                        'status': 'success',
                        'text': extracted_text
                    })
                except pytesseract.TesseractNotFoundError:
                    logger.error("Tesseract command not found.")
                    return jsonify({
                        'status': 'error',
                        'message': 'Tesseract OCR engine is not installed or configured correctly on the backend server. Please verify Tesseract path configuration.'
                    }), 500
                except Exception as ocr_err:
                    logger.error(f"Tesseract processing failed: {str(ocr_err)}")
                    return jsonify({
                        'status': 'error',
                        'message': f'Failed to process image with OCR: {str(ocr_err)}'
                    }), 500
        except Exception as img_err:
            logger.error(f"Pillow image load failed: {str(img_err)}")
            return jsonify({
                'status': 'error',
                'message': 'Uploaded file is corrupted or not a valid image.'
            }), 400

    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Server error occurred: {str(e)}'
        }), 500

    finally:
        # 7. Clean up temporary uploaded file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"Cleaned up temporary file: {file_path}")
            except Exception as cleanup_err:
                logger.error(f"Failed to delete temp file {file_path}: {str(cleanup_err)}")

# Custom error handler for file size limits
@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({
        'status': 'error',
        'message': f'File exceeds the maximum limit of {app.config["MAX_CONTENT_LENGTH"] // (1024*1024)}MB.'
    }), 413

if __name__ == '__main__':
    # Run development server
    app.run(debug=True, host='127.0.0.1', port=5000)
