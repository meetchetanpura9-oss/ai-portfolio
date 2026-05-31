from pydantic import BaseModel
from typing import List, Dict, Any

class AnalyticsTrack(BaseModel):
    visited_page: str
    device: str
    browser: str

class AnalyticsSummaryItem(BaseModel):
    label: str
    count: int

class AnalyticsDashboard(BaseModel):
    total_views: int
    unique_visitors: int
    conversion_rate: float
    browsers: List[AnalyticsSummaryItem]
    devices: List[AnalyticsSummaryItem]
    countries: List[AnalyticsSummaryItem]
