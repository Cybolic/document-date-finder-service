# DOCX Date Finder and Viewer

This is a simple web application that allows one to upload DOCX files and get back a list of dates
that were found in the text.

It runs on Python using FastAPI and the frontend is built in React and Tailwind.

## Installation
If you have Nix and direnv installed, all dependencies will auto-install by running
`direnv allow` in the cloned repository directory.

## Install dependencies manually

In the root directory, run the following to install the server dependencies:
```bash
uv sync
```

Then go to the client directory and install the Node dependencies:
```bash
cd client
npm install
```

You should now be able to either build the project and run it:
```bash
cd client
npm run build
cd ..
fastapi run server --host 0.0.0.0 --port 3000
```

Or, alternatively, you can use Vite to run a development server, with a proxy to a live-reloading
version of the Python server using uvicorn:
```bash
cd client
npm run dev
```

