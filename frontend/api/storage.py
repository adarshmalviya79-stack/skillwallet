import os
import uuid
import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from api.config import settings

logger = logging.getLogger(__name__)

class StorageManager:
    def __init__(self):
        self.client = None
        self.db = None
        self.is_connected = False
        self._in_memory_reports: Dict[str, Dict[str, Any]] = {}
        self._in_memory_projects: Dict[str, Dict[str, Any]] = {}
        self._in_memory_activities: List[Dict[str, Any]] = []
        self._seed_initial_demo_activity()

    def _seed_initial_demo_activity(self):
        # Initial activity to populate the dashboard nicely on cold start
        now = datetime.now(timezone.utc).isoformat()
        sample_activities = [
            {
                "id": "act-init-1",
                "action": "Safety Analysis",
                "title": "Excavation Trench PPE Review",
                "timestamp": now,
                "status": "Completed",
                "risk": "Moderate"
            },
            {
                "id": "act-init-2",
                "action": "Crack Assessment",
                "title": "Basement Shear Wall Inspection",
                "timestamp": now,
                "status": "Completed",
                "risk": "High"
            }
        ]
        self._in_memory_activities.extend(sample_activities)

    async def initialize(self):
        """Attempts to initialize MongoDB connection if configured."""
        if settings.is_mongodb_configured:
            try:
                import motor.motor_asyncio
                self.client = motor.motor_asyncio.AsyncIOMotorClient(
                    settings.mongodb_uri,
                    serverSelectionTimeoutMS=3000
                )
                self.db = self.client[settings.mongodb_db_name]
                # Ping database to verify connection
                await self.client.admin.command('ping')
                self.is_connected = True
                logger.info("Successfully connected to MongoDB Atlas!")
            except Exception as e:
                logger.warning(f"MongoDB connection failed: {e}. Falling back to In-Memory session storage.")
                self.is_connected = False
        else:
            self.is_connected = False

    @property
    def storage_mode(self) -> str:
        return "mongodb" if self.is_connected else "in_memory"

    @property
    def is_persistent(self) -> bool:
        return self.is_connected

    async def save_report(self, report_type: str, title: str, data: Dict[str, Any], risk_level: Optional[str] = None) -> Dict[str, Any]:
        report_id = str(uuid.uuid4())[:8]
        now = datetime.now(timezone.utc).isoformat()
        
        report_doc = {
            "id": report_id,
            "title": title,
            "type": report_type,
            "risk_level": risk_level or "Low",
            "created_at": now,
            "summary": data.get("summary", title),
            "data": data,
            "storage_engine": self.storage_mode
        }

        # Track recent activity
        activity_item = {
            "id": f"act-{report_id}",
            "action": report_type.capitalize() + " Inspection",
            "title": title,
            "timestamp": now,
            "status": "Completed",
            "risk": risk_level or "Normal"
        }

        if self.is_connected and self.db is not None:
            try:
                await self.db.reports.insert_one(dict(report_doc))
                await self.db.activities.insert_one(activity_item)
                return report_doc
            except Exception as e:
                logger.error(f"Error persisting report to MongoDB: {e}. Falling back to memory.")

        # In-memory storage
        self._in_memory_reports[report_id] = report_doc
        self._in_memory_activities.insert(0, activity_item)
        if len(self._in_memory_activities) > 20:
            self._in_memory_activities.pop()
        return report_doc

    async def get_reports(self, report_type: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            try:
                query = {}
                if report_type:
                    query["type"] = report_type
                cursor = self.db.reports.find(query, {"_id": 0}).sort("created_at", -1).limit(limit)
                return await cursor.to_list(length=limit)
            except Exception as e:
                logger.error(f"Error reading reports from MongoDB: {e}")

        # In-memory
        results = list(self._in_memory_reports.values())
        if report_type:
            results = [r for r in results if r.get("type") == report_type]
        results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return results[:limit]

    async def get_report_by_id(self, report_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            try:
                doc = await self.db.reports.find_one({"id": report_id}, {"_id": 0})
                if doc:
                    return doc
            except Exception as e:
                logger.error(f"Error reading report {report_id} from MongoDB: {e}")

        return self._in_memory_reports.get(report_id)

    async def delete_report(self, report_id: str) -> bool:
        if self.is_connected and self.db is not None:
            try:
                result = await self.db.reports.delete_one({"id": report_id})
                if result.deleted_count > 0:
                    return True
            except Exception as e:
                logger.error(f"Error deleting report {report_id} from MongoDB: {e}")

        if report_id in self._in_memory_reports:
            del self._in_memory_reports[report_id]
            return True
        return False

    async def save_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        project_id = project_data.get("project_id") or str(uuid.uuid4())[:8]
        now = datetime.now(timezone.utc).isoformat()
        project_data["project_id"] = project_id
        project_data["updated_at"] = now

        if self.is_connected and self.db is not None:
            try:
                await self.db.projects.replace_one(
                    {"project_id": project_id},
                    dict(project_data),
                    upsert=True
                )
                return project_data
            except Exception as e:
                logger.error(f"Error saving project to MongoDB: {e}")

        self._in_memory_projects[project_id] = project_data
        return project_data

    async def get_projects(self) -> List[Dict[str, Any]]:
        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.projects.find({}, {"_id": 0}).sort("updated_at", -1)
                return await cursor.to_list(length=50)
            except Exception as e:
                logger.error(f"Error fetching projects from MongoDB: {e}")

        return list(self._in_memory_projects.values())

    async def get_dashboard_stats(self) -> Dict[str, Any]:
        all_reports = await self.get_reports(limit=100)
        all_projects = await self.get_projects()

        safety_count = sum(1 for r in all_reports if r.get("type") == "safety")
        crack_count = sum(1 for r in all_reports if r.get("type") == "crack")
        valuation_count = sum(1 for r in all_reports if r.get("type") == "valuation")
        planning_count = len(all_projects)
        total_images = safety_count + crack_count

        # Risk distribution calculation
        risk_dist = {"Low": 0, "Moderate": 0, "High": 0, "Critical": 0}
        for r in all_reports:
            risk = r.get("risk_level", "Low")
            if risk in risk_dist:
                risk_dist[risk] += 1
            elif risk == "Medium":
                risk_dist["Moderate"] += 1
            else:
                risk_dist["Low"] += 1

        recent_acts = self._in_memory_activities[:8]

        return {
            "total_images_analyzed": total_images,
            "safety_assessments_count": safety_count,
            "crack_analyses_count": crack_count,
            "valuations_count": valuation_count,
            "saved_projects_count": planning_count,
            "storage_type": self.storage_mode,
            "is_persistent": self.is_persistent,
            "recent_activity": recent_acts,
            "risk_distribution": risk_dist,
            "system_status": {
                "mongodb": "Connected" if self.is_connected else "Disconnected (In-Memory Session Mode)",
                "gemini_ai": "Configured" if settings.is_gemini_configured else "Demo Fallback Mode",
                "weather_feed": "Live (Open-Meteo API)",
                "environment": settings.environment
            }
        }

storage = StorageManager()
