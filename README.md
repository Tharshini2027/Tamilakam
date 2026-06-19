<p align="center">
  <img src="./banner.svg" alt="Tamilaakkam – Tanglish to Tamil Unicode Converter" width="100%" />
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/>
  <img src="https://img.shields.io/badge/EasyOCR-7B2FBE?style=for-the-badge&logo=opencv&logoColor=white" alt="EasyOCR"/>
  <img src="https://img.shields.io/badge/Tesseract-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Tesseract"/>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active%20Development-yellow?style=flat-square" alt="Status"/>
  <img src="https://img.shields.io/badge/Language-Tamil%20%7C%20English-blueviolet?style=flat-square" alt="Language"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/>
</p>

<br/>

---

## 📌 Overview

**Tamilaakkam** is a language processing system that converts handwritten or printed **Tanglish** text into **Tamil Unicode** text. Tanglish refers to Tamil words written using English alphabets — a common practice in digital communication and informal writing.

The project combines **Optical Character Recognition (OCR)** and **transliteration techniques** to extract Tanglish text from images and convert it into readable Tamil script.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖼️ **OCR Extraction** | Extracts handwritten and printed Tanglish text from images |
| 🔄 **Transliteration** | Converts Tanglish words into accurate Tamil Unicode |
| 🌐 **Unicode Output** | Compatible with websites, documents, and digital platforms |
| 🖥️ **Web Interface** | User-friendly interface for image upload and conversion |
| ♿ **Accessibility** | Supports Tamil language digitization and accessibility |

---

## ⚙️ How It Works

```
📷 Upload Image
      ↓
👁️  OCR Engine  (EasyOCR / Tesseract)
      ↓
🔤  Tanglish Text Extracted
      ↓
⚙️  Transliteration Module
      ↓
🔡  Tamil Unicode Output  →  வணக்கம் நண்பா
```

<details>
<summary><b>📋 Step-by-step breakdown</b></summary>

<br/>

**Step 1 — Upload Image**
User uploads an image containing handwritten or printed Tanglish text.

**Step 2 — OCR Processing**
EasyOCR or Tesseract scans the image and extracts the raw English-script text.

**Step 3 — Transliteration Engine**
The extracted Tanglish text is passed through the transliteration module.

**Step 4 — Tamil Unicode Conversion**
Tanglish words are mapped and converted into proper Tamil Unicode characters.

**Step 5 — Display Output**
The final Tamil text is shown to the user, ready to copy or use anywhere.

</details>

---

## 🧪 Example

<table>
<tr>
<th align="center">📷 Input Image Text</th>
<th align="center">🔤 OCR Output</th>
<th align="center">🔡 Tamil Unicode Output</th>
</tr>
<tr>
<td align="center"><code>vanakkam nanba</code></td>
<td align="center"><code>vanakkam nanba</code></td>
<td align="center"><b>வணக்கம் நண்பா</b></td>
</tr>
<tr>
<td align="center"><code>eppadi irukinga</code></td>
<td align="center"><code>eppadi irukinga</code></td>
<td align="center"><b>எப்படி இருக்கிங்க</b></td>
</tr>
<tr>
<td align="center"><code>nandri</code></td>
<td align="center"><code>nandri</code></td>
<td align="center"><b>நன்றி</b></td>
</tr>
</table>

---

## 🛠️ Technology Stack

<p align="center">

| Layer | Technology |
|---|---|
| 🐍 **Backend** | Python, Flask |
| 👁️ **OCR Engine** | EasyOCR, Tesseract OCR |
| 🔡 **Transliteration** | Custom transliteration module |
| 🌐 **Frontend** | HTML, CSS, JavaScript |

</p>

---

## 🎯 Applications

- 🎓 **Educational Platforms** — digitize Tamil learning materials
- 📄 **Document Digitization** — convert printed Tamil documents to digital text
- 🌍 **Regional Language Processing** — NLP pipelines for Tamil
- 💬 **Messaging Apps** — type in Tanglish, read in Tamil
- ♿ **Digital Accessibility** — make Tamil content accessible to everyone

---

## 🗺️ Roadmap

- [ ] 🔬 Improve handwritten text recognition accuracy with deep-learning models
- [ ] 🌐 Add English-to-Tamil translation support
- [ ] 🔀 Support mixed Tamil-English sentence handling
- [ ] 📱 Mobile application integration (Android & iOS)
- [ ] 📷 Real-time camera-based text conversion

---

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/tamilaakkam.git
cd tamilaakkam

# Install dependencies
pip install -r requirements.txt

# Run the Flask app
python app.py
```

Then open `http://localhost:5000` in your browser.

---

## 👩‍💻 Authors

<table>
<tr>
<td align="center">
  <b>Sarmila B</b><br/>
  <sub>Developer</sub>
</td>
<td align="center">
  <b>Tharshini N</b><br/>
  <sub>Developer</sub>
</td>
<td align="center">
  <b>Amitha A</b><br/>
  <sub>Developer</sub>
</td>
<td align="center">
  <b>Midhuna A</b><br/>
  <sub>Developer</sub>
</td>
</tr>
</table>

---

<p align="center">
  <sub>Made with ❤️ for the Tamil language community · தமிழாக்கம்</sub>
</p>
