"""Create all SQLAlchemy tables. Prefer: python -m app.setup_db"""

from app.setup_db import main

if __name__ == "__main__":
    raise SystemExit(main())
