import datetime
import psutil
import shutil
import asyncio

from time import sleep
from typing import List
from pydantic import BaseModel
from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect
from websockets.exceptions import ConnectionClosedOK
from fastapi.staticfiles import StaticFiles

class MemoryUsage(BaseModel):
	mem_available: int
	mem_free: int
	mem_used: int
	mem_total: int

class CpuUsage(BaseModel):
	ratio: float


class DiskUsage(BaseModel):
	disk_free: int
	disk_total: int
	disk_used: int

class MachineProfile(BaseModel):
	timestamp: int
	mem_usage: MemoryUsage
	cpu_usage: List[CpuUsage]
	disk_usage: DiskUsage


class MachineProfiler:

	router: APIRouter
	
	def __init__(self) -> None: 
		self.router = APIRouter()
		self.router.add_websocket_route('/ws', self.websocket_endpoint)

	def get_mem_usage(self) -> MemoryUsage:

		mu = psutil.virtual_memory()
		
		return MemoryUsage(
			mem_available=mu.available,
			mem_free=mu.free,
			mem_used=mu.used,
			mem_total=mu.total)

	def get_cpu_usage(self) -> List[CpuUsage]:

		ratios = psutil.cpu_percent(percpu=True)
		
		return [CpuUsage(ratio=r) for r in ratios]


	def get_disk_usage(self) -> DiskUsage:

		du = shutil.disk_usage('/')
		
		return DiskUsage(disk_free=du.free, disk_total=du.total, disk_used=du.used)


	async def get_machine_profile(self) -> MachineProfile:

		ts = int(datetime.datetime.now().timestamp())
		
		return MachineProfile(
			timestamp=ts,
			mem_usage=self.get_mem_usage(),
			cpu_usage=self.get_cpu_usage(),
			disk_usage=self.get_disk_usage()
		)	


	async def websocket_endpoint(self, websocket: WebSocket) -> MachineProfile:
		await websocket.accept()

		try:
			while True:
				data = await self.get_machine_profile()
				await websocket.send_json(data.dict())
				await asyncio.sleep(1)
		except ConnectionClosedOK:
			await websocket.close()



def create_app() -> FastAPI:
	app = FastAPI()
	profiler = MachineProfiler()

	app.mount("/monitoring", StaticFiles(directory="watchtower/static", html=True), name="static")
	app.include_router(profiler.router)

	return app