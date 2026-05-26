from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.project_model import Project

router = APIRouter()


@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()

    return projects


@router.post("/projects")
def create_project(
    name: str,
    technology: str,
    db: Session = Depends(get_db)
):
    new_project = Project(
        name=name,
        technology=technology
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "message": "Project created successfully!",
        "project": new_project.name
    }