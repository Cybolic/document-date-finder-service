import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from docx import Document

from .parse_docx import find_dates_in_docx

from .env import allowed_origins
from .env import allowed_headers

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_headers=allowed_headers,
    allow_credentials=True,
    allow_methods=["*"],
)

@app.post("/api/v1/docx")
async def parse_docx_files(files: list[UploadFile]):
    output_data = {}

    for file in files:
        if not file.filename or not file.filename.endswith('.docx'):
            raise HTTPException(status_code=400, detail="Only .docx files are allowed")
        
        if file.content_type != 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            raise HTTPException(status_code=400, detail="Invalid file type. Only .docx files are allowed")

        print(f"Received file: {file.filename}, size: {file.file.seek(0, 2)} bytes")
        try:
            document = Document(file.file)

            found_dates = find_dates_in_docx(document)
            output_data[file.filename] = found_dates
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error loading file: {str(e)}")
        finally:
            file.file.close()
    
    return {
        'message': "File uploaded successfully",
        'data': output_data
    }

parent_dir = os.path.dirname(os.path.realpath(__file__))
app.mount("/", StaticFiles(
    directory=os.path.join(parent_dir, os.pardir, "client/dist"), html = True
), name="static",
)

