from environs import Env

env = Env()
env.read_env()

allowed_origins = env.list(
    "SERVER_ALLOWED_ORIGINS",
    subcast=str,
    default=[
        "http://localhost:5173",
        "localhost:5173"
    ]
)
allowed_headers = env.list(
    "SERVER_ALLOWED_HEADERS",
    subcast=str,
    default=[ "Access-Control-Allow-Origin", "Content-Type" ]
)
